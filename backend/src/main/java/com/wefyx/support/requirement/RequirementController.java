package com.wefyx.support.requirement;

import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import com.wefyx.support.resource.AuditService;
import com.wefyx.support.user.UserRepository;
import com.wefyx.support.notification.NotificationService;
import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;

@RestController @RequestMapping("/api/requirements")
public class RequirementController {
    private final RequirementRepository repository;
    private final VendorQuotationRepository quotations;
    private final AuditService audit;
    private final UserRepository users; private final NotificationService notifications; private final AccessControl access;
    public RequirementController(RequirementRepository repository,VendorQuotationRepository quotations,AuditService audit,UserRepository users,NotificationService notifications,AccessControl access){this.repository=repository;this.quotations=quotations;this.audit=audit;this.users=users;this.notifications=notifications;this.access=access;}

    @GetMapping public List<Requirement> all(@RequestParam(required=false) String view, Authentication auth){
        String email=auth.getName(); Role role=access.role(auth);
        if(role==Role.CUSTOMER) return repository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email);
        if(role==Role.VENDOR) {
            Set<Long> invited=quotations.findByVendorEmailIgnoreCaseOrderByCreatedAtDesc(email).stream().map(VendorQuotation::getRequirementId).collect(java.util.stream.Collectors.toSet());
            return repository.findAll().stream().filter(r->invited.contains(r.getId()) || (r.getVendorName()!=null && r.getVendorName().equalsIgnoreCase(email))).sorted(Comparator.comparing(Requirement::getCreatedAt).reversed()).toList();
        }
        if(role==Role.EMPLOYEE) return repository.findAll().stream().filter(r->r.getEmployeeEmail()==null||r.getEmployeeEmail().isBlank()||email.equalsIgnoreCase(r.getEmployeeEmail())).sorted(Comparator.comparing(Requirement::getCreatedAt).reversed()).toList();
        return repository.findAll().stream().sorted(Comparator.comparing(Requirement::getCreatedAt).reversed()).toList();
    }
    @GetMapping("/{id}") public Requirement one(@PathVariable Long id,Authentication auth){var r=find(id);requireVisible(r,auth);return r;}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Requirement create(@Valid @RequestBody Requirement r, Authentication auth){
        access.require(auth,Role.CUSTOMER);
        r.setReference("REQ-"+LocalDateTime.now().getYear()+"-"+String.format("%05d",repository.count()+1));
        r.setCustomerEmail(auth.getName()); r.setStatus(RequirementStatus.SUBMITTED);
        r.setQuotationStatus(r.isQuotationRequested()?QuotationStatus.REQUESTED:QuotationStatus.NOT_REQUESTED);
        var saved=repository.save(r);audit.log("Requirement submitted","Requirements",saved.getReference());
        users.findAll().stream().filter(u->u.getStatus()==com.wefyx.support.user.UserStatus.ACTIVE&&u.getRole()!=null&&u.getRole().toUpperCase().contains("EMPLOYEE"))
            .forEach(u->notifications.send(u.getEmail(),saved.getId(),"REQUIREMENT_CREATED","New customer requirement",saved.getReference()+" · "+saved.getTitle()));
        return saved;
    }
    @PatchMapping("/{id}/accept") public Requirement accept(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){var r=find(id);requireEmployeeWork(r,auth);requireState(r,RequirementStatus.SUBMITTED);assignEmployee(r,body,auth);r.setEmployeeNotes(body.get("notes"));return status(r,RequirementStatus.ACCEPTED,"Requirement accepted","Your requirement has been accepted by "+r.getEmployeeName()+". Secure chat is now available.",auth.getName());}
    @PatchMapping("/{id}/review") public Requirement review(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){var r=find(id);requireEmployeeWork(r,auth);if(r.getStatus()==RequirementStatus.SUBMITTED)throw new ResponseStatusException(HttpStatus.CONFLICT,"Accept the requirement before reviewing it");assignEmployee(r,body,auth);r.setEmployeeNotes(body.get("notes"));if(r.isQuotationRequested())r.setQuotationStatus(QuotationStatus.EMPLOYEE_REVIEWED);return status(r,RequirementStatus.UNDER_REVIEW,"Requirement under review","Your requirement is being reviewed by "+r.getEmployeeName()+".",auth.getName());}
    @PatchMapping("/{id}/decline") public Requirement decline(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){var r=find(id);requireEmployeeWork(r,auth);if(EnumSet.of(RequirementStatus.RESOLVED,RequirementStatus.CLOSED).contains(r.getStatus()))throw new ResponseStatusException(HttpStatus.CONFLICT,"A completed requirement cannot be declined");assignEmployee(r,body,auth);r.setEmployeeNotes(require(body,"notes"));return status(r,RequirementStatus.DECLINED,"Requirement declined","Your requirement was declined. Reason: "+r.getEmployeeNotes(),auth.getName());}
    @PatchMapping("/{id}/forward") public Requirement forward(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){var r=find(id);requireEmployeeWork(r,auth);r.setVendorName(require(body,"vendorName"));r.setEmployeeNotes(body.getOrDefault("notes",r.getEmployeeNotes()));if(r.isQuotationRequested()){r.setEstimatedAmount(amount(body.get("estimatedAmount")));r.setQuotationStatus(QuotationStatus.SENT_TO_VENDOR);}return status(r,RequirementStatus.SENT_TO_VENDOR,"Requirement sent to vendor","Your requirement has been sent to a suitable vendor.",auth.getName());}
    @PatchMapping("/{id}/vendor-decision") public Requirement decision(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){var r=find(id);requireInvitedVendor(r,auth);boolean accepted=Boolean.parseBoolean(body.getOrDefault("accepted","false"));r.setVendorNotes(body.get("notes"));if(accepted){r.setQuotationStatus(r.isQuotationRequested()?QuotationStatus.VENDOR_ACCEPTED:r.getQuotationStatus());r.setAgreedAmount(r.getEstimatedAmount());return status(r,RequirementStatus.VENDOR_ACCEPTED,"Vendor accepted requirement","A vendor has accepted your requirement.",auth.getName());}if(r.isQuotationRequested())r.setQuotationStatus(QuotationStatus.VENDOR_DECLINED);return status(r,RequirementStatus.UNDER_REVIEW,"Vendor declined requirement","The employee is reviewing other fulfilment options.",auth.getName());}
    @PatchMapping("/{id}/start") public Requirement start(@PathVariable Long id,Authentication auth){var r=find(id);requireSelectedVendorOrEmployee(r,auth);return status(r,RequirementStatus.IN_PROGRESS,"Work started","Work has started on your requirement.",auth.getName());}
    @PatchMapping("/{id}/resolve") public Requirement resolve(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){var r=find(id);requireSelectedVendorOrEmployee(r,auth);r.setResolution(require(body,"resolution"));r.setResolvedAt(LocalDateTime.now());return status(r,RequirementStatus.RESOLVED,"Requirement resolved",r.getResolution(),auth.getName());}
    @PatchMapping("/{id}/close") public Requirement close(@PathVariable Long id,Authentication auth){var r=find(id);requireEmployeeWork(r,auth);return status(r,RequirementStatus.CLOSED,"Requirement closed","Your requirement has been closed.",auth.getName());}
    @PatchMapping("/{id}/paid") public Requirement paid(@PathVariable Long id,Authentication auth){var r=find(id);requireEmployeeWork(r,auth);if(r.getQuotationStatus()!=QuotationStatus.VENDOR_ACCEPTED)throw new ResponseStatusException(HttpStatus.CONFLICT,"Quotation must be accepted before payment");r.setQuotationStatus(QuotationStatus.PAID);return repository.save(r);}
    @PostMapping("/{id}/quotations/invite") public List<VendorQuotation> invite(@PathVariable Long id,@RequestBody Map<String,Object> body,Authentication auth){
        var r=find(id); requireEmployeeWork(r,auth); Object rawIds=body.get("vendorIds"); Object raw=body.get("vendors");
        List<VendorQuotation> result=new ArrayList<>();
        if(rawIds instanceof List<?> ids) for(Object value:ids){try{var vendor=users.findById(Long.valueOf(String.valueOf(value))).orElse(null);if(vendor==null||!vendor.getRole().toUpperCase().contains("VENDOR"))continue;result.add(inviteVendor(r,vendor.getName(),vendor.getEmail()));}catch(Exception ignored){}}
        if(result.isEmpty()&&raw instanceof List<?> vendors) for(Object item:vendors){
            if(!(item instanceof Map<?,?> vendor))continue;String email=Objects.toString(vendor.get("email"),"").trim();String name=Objects.toString(vendor.get("name"),email).trim();if(!email.isBlank())result.add(inviteVendor(r,name,email));
        }
        if(result.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Valid vendor email is required");
        r.setQuotationStatus(QuotationStatus.SENT_TO_VENDOR);status(r,RequirementStatus.SENT_TO_VENDOR,"Vendors invited",result.size()+" vendors are preparing responses for your requirement.",auth.getName());audit.log("Vendors invited","Requirements",r.getReference()+" · "+result.size()+" vendors");return result;
    }
    @GetMapping("/{id}/quotations") public List<VendorQuotation> quotationList(@PathVariable Long id,@RequestParam(required=false) String view,Authentication auth){
        var r=find(id); var all=quotations.findByRequirementIdOrderByAmountAsc(id); Role role=access.role(auth);
        if(role==Role.VENDOR) return all.stream().filter(q->auth.getName().equalsIgnoreCase(q.getVendorEmail())).toList();
        if(role==Role.CUSTOMER) {
            if(!auth.getName().equalsIgnoreCase(r.getCustomerEmail())) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not your requirement");
            return all.stream().filter(q->EnumSet.of(VendorQuotationStatus.SHARED_WITH_CUSTOMER,VendorQuotationStatus.SELECTED,VendorQuotationStatus.NOT_SELECTED).contains(q.getStatus())).toList();
        }
        requireEmployeeWork(r,auth);
        return all;
    }
    @PatchMapping("/{id}/quotations/submit") public VendorQuotation submitQuotation(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){
        var r=find(id);access.require(auth,Role.VENDOR);var q=quotations.findByRequirementIdAndVendorEmailIgnoreCase(id,auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN,"Vendor was not invited"));
        q.setAmount(amount(body.get("amount")));q.setLeadTimeDays(integer(body.get("leadTimeDays"),"leadTimeDays"));q.setNotes(body.get("notes"));q.setStatus(VendorQuotationStatus.SUBMITTED);q.setSubmittedAt(LocalDateTime.now());
        r.setQuotationStatus(QuotationStatus.QUOTES_RECEIVED);repository.save(r);var saved=quotations.save(q);audit.log("Quotation submitted","Requirements",r.getReference()+" · "+q.getVendorName());return saved;
    }
    @PatchMapping("/{id}/quotations/share") public Requirement shareQuotations(@PathVariable Long id,Authentication auth){
        var r=find(id);requireEmployeeWork(r,auth);var submitted=quotations.findByRequirementIdOrderByAmountAsc(id).stream().filter(q->q.getStatus()==VendorQuotationStatus.SUBMITTED).toList();
        if(submitted.isEmpty())throw new ResponseStatusException(HttpStatus.CONFLICT,"No submitted quotations to share");submitted.forEach(q->{q.setStatus(VendorQuotationStatus.SHARED_WITH_CUSTOMER);quotations.save(q);});r.setQuotationStatus(QuotationStatus.SHARED_WITH_CUSTOMER);var saved=repository.save(r);audit.log("Quotations shared with customer","Requirements",r.getReference());return saved;
    }
    @PostMapping("/{id}/quotations/employee") @ResponseStatus(HttpStatus.CREATED) public VendorQuotation employeeQuotation(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){
        var r=find(id);requireEmployeeWork(r,auth);if(EnumSet.of(RequirementStatus.SUBMITTED,RequirementStatus.DECLINED,RequirementStatus.REJECTED,RequirementStatus.CLOSED).contains(r.getStatus()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Accept the requirement before sending a quotation");
        var quote=quotations.findByRequirementIdAndVendorEmailIgnoreCase(id,auth.getName()).orElseGet(VendorQuotation::new);
        quote.setRequirementId(id);quote.setVendorEmail(auth.getName());quote.setVendorName("Wefyx quotation · "+body.getOrDefault("employeeName",r.getEmployeeName()==null?"Support team":r.getEmployeeName()));quote.setAmount(amount(body.get("amount")));quote.setLeadTimeDays(integer(body.get("leadTimeDays"),"leadTimeDays"));quote.setNotes(require(body,"notes"));quote.setSubmittedAt(LocalDateTime.now());quote.setStatus(VendorQuotationStatus.SHARED_WITH_CUSTOMER);
        r.setQuotationRequested(true);r.setQuotationStatus(QuotationStatus.SHARED_WITH_CUSTOMER);repository.save(r);var saved=quotations.save(quote);notifications.send(r.getCustomerEmail(),r.getId(),"QUOTATION_READY","Quotation ready for review",r.getReference()+" · AED "+saved.getAmount()+" · "+saved.getLeadTimeDays()+" days");audit.log("Employee quotation sent","Requirements",r.getReference()+" · "+saved.getAmount());return saved;
    }
    @PatchMapping("/{id}/quotations/{quotationId}/select") public Requirement selectQuotation(@PathVariable Long id,@PathVariable Long quotationId,Authentication auth){
        var r=find(id);access.require(auth,Role.CUSTOMER);if(!auth.getName().equalsIgnoreCase(r.getCustomerEmail()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not your requirement");
        var selected=quotations.findById(quotationId).filter(q->q.getRequirementId().equals(id)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Quotation not found"));
        if(selected.getStatus()!=VendorQuotationStatus.SHARED_WITH_CUSTOMER)throw new ResponseStatusException(HttpStatus.CONFLICT,"Quotation is not available for selection");
        for(var q:quotations.findByRequirementIdOrderByAmountAsc(id)){q.setStatus(q.getId().equals(quotationId)?VendorQuotationStatus.SELECTED:VendorQuotationStatus.NOT_SELECTED);quotations.save(q);}
        r.setSelectedQuotationId(selected.getId());r.setVendorName(selected.getVendorEmail());r.setAgreedAmount(selected.getAmount());r.setQuotationStatus(QuotationStatus.CUSTOMER_SELECTED);var saved=status(r,RequirementStatus.VENDOR_ACCEPTED,"Customer selected quotation","The customer selected "+selected.getVendorName()+" for fulfilment.",auth.getName());audit.log("Customer selected quotation","Requirements",r.getReference()+" · "+selected.getVendorName());return saved;
    }
    @GetMapping("/summary") public Map<String,Object> summary(Authentication auth){var all=all(null,auth);Map<String,Object> m=new LinkedHashMap<>();m.put("total",all.size());for(var s:RequirementStatus.values())m.put(s.name(),all.stream().filter(r->r.getStatus()==s).count());m.put("quotationValue",all.stream().map(Requirement::getAgreedAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO,BigDecimal::add));return m;}
    private Requirement find(Long id){return repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Requirement not found"));}
    private void assignEmployee(Requirement r,Map<String,String> body,Authentication auth){r.setEmployeeEmail(auth.getName());r.setEmployeeName(body.getOrDefault("employeeName",auth.getName()));}
    private Requirement status(Requirement r,RequirementStatus next,String title,String message,String actor){r.setStatus(next);var saved=repository.save(r);audit.log("Requirement status changed","Requirements",r.getReference()+" · "+next);notifyParticipant(r.getCustomerEmail(),actor,r,title,message);notifyParticipant(r.getEmployeeEmail(),actor,r,title,message);return saved;}
    private void notifyParticipant(String email,String actor,Requirement r,String title,String message){if(email!=null&&!email.isBlank()&&!email.equalsIgnoreCase(actor))notifications.send(email,r.getId(),"REQUIREMENT_STATUS",title,r.getReference()+" · "+message);}
    private static void requireState(Requirement r,RequirementStatus expected){if(r.getStatus()!=expected)throw new ResponseStatusException(HttpStatus.CONFLICT,"Requirement must be "+expected.name().replace('_',' ').toLowerCase());}
    private static String require(Map<String,String>b,String k){String v=b.get(k);if(v==null||v.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,k+" is required");return v;}
    private static BigDecimal amount(String v){try{return new BigDecimal(v);}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A valid estimatedAmount is required");}}
    private static Integer integer(String v,String field){try{return Integer.valueOf(v);}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A valid "+field+" is required");}}
    private VendorQuotation inviteVendor(Requirement r,String name,String email){var quote=quotations.findByRequirementIdAndVendorEmailIgnoreCase(r.getId(),email).orElseGet(VendorQuotation::new);quote.setRequirementId(r.getId());quote.setVendorEmail(email);quote.setVendorName(name);quote.setStatus(VendorQuotationStatus.INVITED);var saved=quotations.save(quote);notifications.send(email,r.getId(),"QUOTATION_INVITATION","New quotation request",r.getReference()+" · "+r.getTitle());return saved;}
    private void requireVisible(Requirement r,Authentication auth){Role role=access.role(auth);String email=auth.getName();if(role==Role.SUPER_ADMIN)return;if(role==Role.CUSTOMER&&email.equalsIgnoreCase(r.getCustomerEmail()))return;if(role==Role.EMPLOYEE&&(r.getEmployeeEmail()==null||r.getEmployeeEmail().isBlank()||email.equalsIgnoreCase(r.getEmployeeEmail())))return;if(role==Role.VENDOR&&quotations.findByRequirementIdAndVendorEmailIgnoreCase(r.getId(),email).isPresent())return;throw new ResponseStatusException(HttpStatus.FORBIDDEN,"This requirement is not assigned to your account");}
    private void requireEmployeeWork(Requirement r,Authentication auth){Role role=access.require(auth,Role.SUPER_ADMIN,Role.EMPLOYEE);if(role==Role.EMPLOYEE&&r.getEmployeeEmail()!=null&&!r.getEmployeeEmail().isBlank()&&!auth.getName().equalsIgnoreCase(r.getEmployeeEmail()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"This requirement is assigned to another employee");}
    private void requireInvitedVendor(Requirement r,Authentication auth){access.require(auth,Role.VENDOR);if(quotations.findByRequirementIdAndVendorEmailIgnoreCase(r.getId(),auth.getName()).isEmpty())throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Vendor was not invited to this requirement");}
    private void requireSelectedVendorOrEmployee(Requirement r,Authentication auth){Role role=access.role(auth);if(role==Role.SUPER_ADMIN)return;if(role==Role.EMPLOYEE){requireEmployeeWork(r,auth);return;}if(role==Role.VENDOR&&r.getVendorName()!=null&&auth.getName().equalsIgnoreCase(r.getVendorName()))return;throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Only the selected vendor or assigned employee can update fulfilment");}
}
