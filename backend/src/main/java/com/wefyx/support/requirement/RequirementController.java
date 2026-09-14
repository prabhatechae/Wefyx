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

@RestController @RequestMapping("/api/requirements")
public class RequirementController {
    private final RequirementRepository repository;
    private final VendorQuotationRepository quotations;
    private final AuditService audit;
    private final UserRepository users; private final NotificationService notifications;
    public RequirementController(RequirementRepository repository,VendorQuotationRepository quotations,AuditService audit,UserRepository users,NotificationService notifications){this.repository=repository;this.quotations=quotations;this.audit=audit;this.users=users;this.notifications=notifications;}

    @GetMapping public List<Requirement> all(@RequestParam(required=false) String view, Authentication auth){
        String email=auth.getName();
        if("customer".equalsIgnoreCase(view)) return repository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email);
        if("vendor".equalsIgnoreCase(view)) {
            Set<Long> invited=quotations.findByVendorEmailIgnoreCaseOrderByCreatedAtDesc(email).stream().map(VendorQuotation::getRequirementId).collect(java.util.stream.Collectors.toSet());
            return repository.findAll().stream().filter(r->invited.contains(r.getId()) || (r.getVendorName()!=null && r.getVendorName().equalsIgnoreCase(email))).sorted(Comparator.comparing(Requirement::getCreatedAt).reversed()).toList();
        }
        return repository.findAll().stream().sorted(Comparator.comparing(Requirement::getCreatedAt).reversed()).toList();
    }
    @GetMapping("/{id}") public Requirement one(@PathVariable Long id){return find(id);}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Requirement create(@Valid @RequestBody Requirement r, Authentication auth){
        r.setReference("REQ-"+LocalDateTime.now().getYear()+"-"+String.format("%05d",repository.count()+1));
        r.setCustomerEmail(auth.getName()); r.setStatus(RequirementStatus.SUBMITTED);
        r.setQuotationStatus(r.isQuotationRequested()?QuotationStatus.REQUESTED:QuotationStatus.NOT_REQUESTED);
        var saved=repository.save(r);audit.log("Requirement submitted","Requirements",saved.getReference());return saved;
    }
    @PatchMapping("/{id}/review") public Requirement review(@PathVariable Long id,@RequestBody Map<String,String> body){var r=find(id);r.setEmployeeName(body.getOrDefault("employeeName","Wefyx Support"));r.setEmployeeNotes(body.get("notes"));r.setStatus(RequirementStatus.UNDER_REVIEW);if(r.isQuotationRequested())r.setQuotationStatus(QuotationStatus.EMPLOYEE_REVIEWED);return repository.save(r);}
    @PatchMapping("/{id}/forward") public Requirement forward(@PathVariable Long id,@RequestBody Map<String,String> body){var r=find(id);r.setVendorName(require(body,"vendorName"));r.setEmployeeNotes(body.getOrDefault("notes",r.getEmployeeNotes()));r.setStatus(RequirementStatus.SENT_TO_VENDOR);if(r.isQuotationRequested()){r.setEstimatedAmount(amount(body.get("estimatedAmount")));r.setQuotationStatus(QuotationStatus.SENT_TO_VENDOR);}return repository.save(r);}
    @PatchMapping("/{id}/vendor-decision") public Requirement decision(@PathVariable Long id,@RequestBody Map<String,String> body){var r=find(id);boolean accepted=Boolean.parseBoolean(body.getOrDefault("accepted","false"));r.setVendorNotes(body.get("notes"));if(accepted){r.setStatus(RequirementStatus.VENDOR_ACCEPTED);r.setQuotationStatus(r.isQuotationRequested()?QuotationStatus.VENDOR_ACCEPTED:r.getQuotationStatus());r.setAgreedAmount(r.getEstimatedAmount());}else{r.setStatus(RequirementStatus.UNDER_REVIEW);if(r.isQuotationRequested())r.setQuotationStatus(QuotationStatus.VENDOR_DECLINED);}return repository.save(r);}
    @PatchMapping("/{id}/start") public Requirement start(@PathVariable Long id){var r=find(id);r.setStatus(RequirementStatus.IN_PROGRESS);return repository.save(r);}
    @PatchMapping("/{id}/resolve") public Requirement resolve(@PathVariable Long id,@RequestBody Map<String,String> body){var r=find(id);r.setResolution(require(body,"resolution"));r.setStatus(RequirementStatus.RESOLVED);r.setResolvedAt(LocalDateTime.now());return repository.save(r);}
    @PatchMapping("/{id}/close") public Requirement close(@PathVariable Long id){var r=find(id);r.setStatus(RequirementStatus.CLOSED);return repository.save(r);}
    @PatchMapping("/{id}/paid") public Requirement paid(@PathVariable Long id){var r=find(id);if(r.getQuotationStatus()!=QuotationStatus.VENDOR_ACCEPTED)throw new ResponseStatusException(HttpStatus.CONFLICT,"Quotation must be accepted before payment");r.setQuotationStatus(QuotationStatus.PAID);return repository.save(r);}
    @PostMapping("/{id}/quotations/invite") public List<VendorQuotation> invite(@PathVariable Long id,@RequestBody Map<String,Object> body){
        var r=find(id); Object rawIds=body.get("vendorIds"); Object raw=body.get("vendors");
        List<VendorQuotation> result=new ArrayList<>();
        if(rawIds instanceof List<?> ids) for(Object value:ids){try{var vendor=users.findById(Long.valueOf(String.valueOf(value))).orElse(null);if(vendor==null||!vendor.getRole().toUpperCase().contains("VENDOR"))continue;result.add(inviteVendor(r,vendor.getName(),vendor.getEmail()));}catch(Exception ignored){}}
        if(result.isEmpty()&&raw instanceof List<?> vendors) for(Object item:vendors){
            if(!(item instanceof Map<?,?> vendor))continue;String email=Objects.toString(vendor.get("email"),"").trim();String name=Objects.toString(vendor.get("name"),email).trim();if(!email.isBlank())result.add(inviteVendor(r,name,email));
        }
        if(result.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Valid vendor email is required");
        r.setStatus(RequirementStatus.SENT_TO_VENDOR);r.setQuotationStatus(QuotationStatus.SENT_TO_VENDOR);repository.save(r);audit.log("Vendors invited","Requirements",r.getReference()+" · "+result.size()+" vendors");return result;
    }
    @GetMapping("/{id}/quotations") public List<VendorQuotation> quotationList(@PathVariable Long id,@RequestParam(required=false) String view,Authentication auth){
        var r=find(id); var all=quotations.findByRequirementIdOrderByAmountAsc(id);
        if("vendor".equalsIgnoreCase(view)) return all.stream().filter(q->auth.getName().equalsIgnoreCase(q.getVendorEmail())).toList();
        if("customer".equalsIgnoreCase(view)) {
            if(!auth.getName().equalsIgnoreCase(r.getCustomerEmail())) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not your requirement");
            return all.stream().filter(q->EnumSet.of(VendorQuotationStatus.SHARED_WITH_CUSTOMER,VendorQuotationStatus.SELECTED,VendorQuotationStatus.NOT_SELECTED).contains(q.getStatus())).toList();
        }
        return all;
    }
    @PatchMapping("/{id}/quotations/submit") public VendorQuotation submitQuotation(@PathVariable Long id,@RequestBody Map<String,String> body,Authentication auth){
        var r=find(id);var q=quotations.findByRequirementIdAndVendorEmailIgnoreCase(id,auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN,"Vendor was not invited"));
        q.setAmount(amount(body.get("amount")));q.setLeadTimeDays(integer(body.get("leadTimeDays"),"leadTimeDays"));q.setNotes(body.get("notes"));q.setStatus(VendorQuotationStatus.SUBMITTED);q.setSubmittedAt(LocalDateTime.now());
        r.setQuotationStatus(QuotationStatus.QUOTES_RECEIVED);repository.save(r);var saved=quotations.save(q);audit.log("Quotation submitted","Requirements",r.getReference()+" · "+q.getVendorName());return saved;
    }
    @PatchMapping("/{id}/quotations/share") public Requirement shareQuotations(@PathVariable Long id){
        var r=find(id);var submitted=quotations.findByRequirementIdOrderByAmountAsc(id).stream().filter(q->q.getStatus()==VendorQuotationStatus.SUBMITTED).toList();
        if(submitted.isEmpty())throw new ResponseStatusException(HttpStatus.CONFLICT,"No submitted quotations to share");submitted.forEach(q->{q.setStatus(VendorQuotationStatus.SHARED_WITH_CUSTOMER);quotations.save(q);});r.setQuotationStatus(QuotationStatus.SHARED_WITH_CUSTOMER);var saved=repository.save(r);audit.log("Quotations shared with customer","Requirements",r.getReference());return saved;
    }
    @PatchMapping("/{id}/quotations/{quotationId}/select") public Requirement selectQuotation(@PathVariable Long id,@PathVariable Long quotationId,Authentication auth){
        var r=find(id);if(!auth.getName().equalsIgnoreCase(r.getCustomerEmail()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not your requirement");
        var selected=quotations.findById(quotationId).filter(q->q.getRequirementId().equals(id)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Quotation not found"));
        if(selected.getStatus()!=VendorQuotationStatus.SHARED_WITH_CUSTOMER)throw new ResponseStatusException(HttpStatus.CONFLICT,"Quotation is not available for selection");
        for(var q:quotations.findByRequirementIdOrderByAmountAsc(id)){q.setStatus(q.getId().equals(quotationId)?VendorQuotationStatus.SELECTED:VendorQuotationStatus.NOT_SELECTED);quotations.save(q);}
        r.setSelectedQuotationId(selected.getId());r.setVendorName(selected.getVendorEmail());r.setAgreedAmount(selected.getAmount());r.setStatus(RequirementStatus.VENDOR_ACCEPTED);r.setQuotationStatus(QuotationStatus.CUSTOMER_SELECTED);var saved=repository.save(r);audit.log("Customer selected quotation","Requirements",r.getReference()+" · "+selected.getVendorName());return saved;
    }
    @GetMapping("/summary") public Map<String,Object> summary(){var all=repository.findAll();Map<String,Object> m=new LinkedHashMap<>();m.put("total",all.size());for(var s:RequirementStatus.values())m.put(s.name(),all.stream().filter(r->r.getStatus()==s).count());m.put("quotationValue",all.stream().map(Requirement::getAgreedAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO,BigDecimal::add));return m;}
    private Requirement find(Long id){return repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Requirement not found"));}
    private static String require(Map<String,String>b,String k){String v=b.get(k);if(v==null||v.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,k+" is required");return v;}
    private static BigDecimal amount(String v){try{return new BigDecimal(v);}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A valid estimatedAmount is required");}}
    private static Integer integer(String v,String field){try{return Integer.valueOf(v);}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A valid "+field+" is required");}}
    private VendorQuotation inviteVendor(Requirement r,String name,String email){var quote=quotations.findByRequirementIdAndVendorEmailIgnoreCase(r.getId(),email).orElseGet(VendorQuotation::new);quote.setRequirementId(r.getId());quote.setVendorEmail(email);quote.setVendorName(name);quote.setStatus(VendorQuotationStatus.INVITED);var saved=quotations.save(quote);notifications.send(email,r.getId(),"QUOTATION_INVITATION","New quotation request",r.getReference()+" · "+r.getTitle());return saved;}
}
