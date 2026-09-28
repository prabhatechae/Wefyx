package com.wefyx.support.booking;

import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;
import com.wefyx.support.notification.*;
import com.wefyx.support.user.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.stream.IntStream;
import static com.wefyx.support.booking.Booking.Status.*;

@Service
@Transactional
public class BookingService {
    static final ZoneId ZONE = ZoneId.of("Asia/Dubai");
    private final BookingRepository bookings;
    private final UserRepository users;
    private final AccessControl access;
    private final AccountNotificationRepository notifications;
    private final BigDecimal fee;
    public BookingService(BookingRepository bookings, UserRepository users, AccessControl access,
                          AccountNotificationRepository notifications,
                          @Value("${wefyx.booking.fee:100.00}") BigDecimal fee) {
        this.bookings=bookings; this.users=users; this.access=access; this.notifications=notifications;
        if (fee.signum() <= 0) throw new IllegalArgumentException("Booking fee must be positive");
        this.fee=fee.setScale(2);
    }
    @Transactional(readOnly = true)
    public Map<String,Object> catalog() {
        return Map.of("amount",fee,"currency","AED","timezone",ZONE.getId(),"checkoutAvailable",false,
            "checkoutMessage","Online payment is not configured yet. Your request can be saved, but the appointment is not confirmed or reserved.",
            "supportTypes",Booking.SupportType.values(),"paymentMethods",List.of());
    }
    @Transactional(readOnly = true)
    public List<Map<String,Object>> availability(LocalDate date) {
        validateDate(date);
        Set<String> occupied = new HashSet<>(bookings.occupiedTimes(date));
        return IntStream.range(9,17).mapToObj(hour -> {
            String time=String.format("%02d:00",hour);
            boolean available=!occupied.contains(time) && date.atTime(hour,0).atZone(ZONE).toInstant().isAfter(Instant.now());
            return Map.<String,Object>of("time",time,"endTime",String.format("%02d:00",hour+1),"available",available);
        }).toList();
    }
    public BookingDtos.View create(BookingDtos.Create input, Authentication auth) {
        access.require(auth,Role.CUSTOMER);
        var existing=bookings.findByRequestKey(input.requestKey());
        if(existing.isPresent()) { requireVisible(existing.get(),auth); return BookingDtos.View.from(existing.get()); }
        validateSlot(input.date(),input.time());
        Booking b=new Booking();
        b.reference="WFX-"+UUID.randomUUID().toString().substring(0,12).toUpperCase(Locale.ROOT);
        b.requestKey=input.requestKey(); b.customerEmail=auth.getName(); b.supportType=input.supportType();
        b.company=input.company().trim(); b.contactName=input.contactName().trim();
        b.contactEmail=input.contactEmail().trim(); b.phone=input.phone().trim(); b.category=input.category();
        b.subject=input.subject().trim(); b.description=input.description().trim(); b.date=input.date(); b.time=input.time();
        b.address=input.address().trim(); b.emirate=input.emirate().trim(); b.amount=fee;
        b.status=AWAITING_PAYMENT; b.createdAt=Instant.now();
        return BookingDtos.View.from(bookings.saveAndFlush(b));
    }
    @Transactional(readOnly = true)
    public List<BookingDtos.View> list(Authentication auth) {
        var role=access.require(auth,Role.CUSTOMER,Role.EMPLOYEE,Role.SUPER_ADMIN);
        var rows=switch(role) {
            case CUSTOMER -> bookings.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(auth.getName());
            case EMPLOYEE -> bookings.findByEmployeeEmailIgnoreCaseOrderByCreatedAtDesc(auth.getName());
            default -> bookings.findAllByOrderByCreatedAtDesc();
        };
        return rows.stream().map(BookingDtos.View::from).toList();
    }
    @Transactional(readOnly = true)
    public BookingDtos.View get(Long id,Authentication auth) { return BookingDtos.View.from(visible(id,auth)); }
    Booking visible(Long id,Authentication auth) {
        Booking b=bookings.findById(id).orElseThrow(()->error(HttpStatus.NOT_FOUND,"Booking not found"));
        requireVisible(b,auth); return b;
    }
    void requireVisible(Booking b,Authentication auth) {
        Role role=access.role(auth);
        if(role==Role.SUPER_ADMIN || role==Role.CUSTOMER && auth.getName().equalsIgnoreCase(b.customerEmail)
            || role==Role.EMPLOYEE && auth.getName().equalsIgnoreCase(b.employeeEmail)) return;
        throw error(HttpStatus.FORBIDDEN,"This booking is not assigned to your account");
    }
    private Booking locked(Long id,Authentication auth) {
        Booking b=bookings.lockById(id).orElseThrow(()->error(HttpStatus.NOT_FOUND,"Booking not found"));
        requireVisible(b,auth); return b;
    }
    public BookingDtos.View assign(Long id,String employeeEmail,Authentication auth) {
        access.require(auth,Role.SUPER_ADMIN); Booking b=locked(id,auth);
        requireState(b,CONFIRMED,ASSIGNED);
        var employee=users.findByEmailIgnoreCase(employeeEmail).filter(u->u.getStatus()==UserStatus.ACTIVE
            && u.getRole()!=null && u.getRole().toUpperCase(Locale.ROOT).contains("EMPLOYEE"))
            .orElseThrow(()->error(HttpStatus.BAD_REQUEST,"Choose an active employee"));
        b.employeeEmail=employee.getEmail();b.employeeName=employee.getName();b.status=ASSIGNED;b.assignedAt=Instant.now();
        notify(b,b.employeeEmail,"New assigned ticket",b.subject,"/service-tasks/"+b.id);
        notify(b,b.customerEmail,"Engineer assigned",b.employeeName+" has been assigned to your service.","/my-tickets/"+b.id);
        return BookingDtos.View.from(b);
    }
    public BookingDtos.View start(Long id,Authentication auth) {
        access.require(auth,Role.EMPLOYEE,Role.SUPER_ADMIN); Booking b=locked(id,auth); requireState(b,ASSIGNED);
        b.status=IN_PROGRESS;b.startedAt=Instant.now();
        notify(b,b.customerEmail,"Service in progress","Your engineer has started the service.","/my-tickets/"+b.id);
        return BookingDtos.View.from(b);
    }
    public BookingDtos.View report(Long id,BookingDtos.Report report,Authentication auth) {
        access.require(auth,Role.EMPLOYEE,Role.SUPER_ADMIN); Booking b=locked(id,auth);requireState(b,IN_PROGRESS);
        if(report.actionsTaken().stream().anyMatch(s->s.contains("\n")||s.contains("\r")))
            throw error(HttpStatus.BAD_REQUEST,"Each action must be a single line");
        b.workSummary=report.workSummary().trim(); b.actionsTaken=String.join("\n",report.actionsTaken());
        b.status=COMPLETED;b.completedAt=Instant.now();
        notify(b,b.customerEmail,"Support Update","Your support request "+b.reference+" has been completed. View the service report for details.","/support-updates/"+b.id);
        return BookingDtos.View.from(b);
    }
    public void checkout(Long id,Authentication auth) {
        access.require(auth,Role.CUSTOMER); Booking b=visible(id,auth);requireState(b,AWAITING_PAYMENT);
        throw error(HttpStatus.SERVICE_UNAVAILABLE,"Online payments are not configured. No payment was taken and your appointment is not confirmed.");
    }
    // Integration boundary for a future provider's signature-verified webhook. Never exposed as a client endpoint.
    public BookingDtos.View confirmVerifiedPayment(Long id,String providerReference,BigDecimal paidAmount,String currency) {
        Booking b=bookings.lockById(id).orElseThrow(()->error(HttpStatus.NOT_FOUND,"Booking not found"));
        if(providerReference==null || providerReference.isBlank() || providerReference.length()>200
            || !"AED".equals(currency) || paidAmount==null || paidAmount.compareTo(b.amount)!=0)
            throw error(HttpStatus.CONFLICT,"Payment does not match the booking");
        if(providerReference.equals(b.paymentReference)) return BookingDtos.View.from(b);
        requireState(b,AWAITING_PAYMENT); validateSlot(b.date,b.time);
        b.paymentReference=providerReference;b.occupiedSlot=b.date+"T"+b.time;b.paidAt=Instant.now();b.status=CONFIRMED;
        bookings.saveAndFlush(b);
        notify(b,b.customerEmail,"Support service booked","Your appointment is confirmed.","/book-support/confirmation?id="+b.id);
        return BookingDtos.View.from(b);
    }
    private void notify(Booking b,String email,String title,String message,String link) {
        var n=new AccountNotification();n.setRecipientEmail(email);n.setType("BOOKING_UPDATE");
        n.setTitle(title);n.setMessage(message);n.setDeepLinkUrl(link);notifications.save(n);
    }
    private void validateDate(LocalDate date) {
        LocalDate today=LocalDate.now(ZONE);
        if(date==null || date.isBefore(today) || date.isAfter(today.plusDays(90)))
            throw error(HttpStatus.BAD_REQUEST,"Choose a date within the next 90 days");
    }
    private void validateSlot(LocalDate date,String time) {
        if(availability(date).stream().noneMatch(s->s.get("time").equals(time) && Boolean.TRUE.equals(s.get("available"))))
            throw error(HttpStatus.CONFLICT,"This time is no longer available. Select another time.");
    }
    private void requireState(Booking b,Booking.Status... allowed) {
        if(Arrays.stream(allowed).noneMatch(s->s==b.status)) throw error(HttpStatus.CONFLICT,"This action is not available while the booking is "+b.status);
    }
    static ResponseStatusException error(HttpStatus status,String message) { return new ResponseStatusException(status,message); }
}
