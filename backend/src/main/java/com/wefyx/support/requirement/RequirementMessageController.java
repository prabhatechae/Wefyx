package com.wefyx.support.requirement;

import com.wefyx.support.resource.AuditService;
import com.wefyx.support.notification.NotificationService;
import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/api/requirements/{requirementId}/messages")
public class RequirementMessageController {
 private final RequirementRepository requirements; private final RequirementMessageRepository messages; private final AuditService audit; private final NotificationService notifications; private final VendorQuotationRepository quotations; private final AccessControl access;
 public RequirementMessageController(RequirementRepository r,RequirementMessageRepository m,AuditService a,NotificationService n,VendorQuotationRepository quotations,AccessControl access){requirements=r;messages=m;audit=a;notifications=n;this.quotations=quotations;this.access=access;}
 @GetMapping public List<RequirementMessage> list(@PathVariable Long requirementId,Authentication auth){var r=find(requirementId);authorize(r,auth);chatAvailable(r);return messages.findByRequirementIdOrderByCreatedAtAsc(requirementId);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public RequirementMessage send(@PathVariable Long requirementId,@RequestBody Map<String,String> body,Authentication auth){var r=find(requirementId);authorize(r,auth);chatAvailable(r);String text=body.getOrDefault("message","").trim();if(text.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Message is required");var m=new RequirementMessage();m.setRequirementId(requirementId);m.setSenderEmail(auth.getName());m.setSenderName(body.getOrDefault("senderName",auth.getName()));m.setSenderRole(body.getOrDefault("senderRole","USER"));m.setMessage(text);var saved=messages.save(m);audit.log("Requirement message sent","Requirements",r.getReference());notify(r.getCustomerEmail(),auth.getName(),r,m);notify(r.getEmployeeEmail(),auth.getName(),r,m);if(r.getVendorName()!=null&&r.getVendorName().contains("@"))notify(r.getVendorName(),auth.getName(),r,m);return saved;}
 private Requirement find(Long id){return requirements.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Requirement not found"));}
 private void authorize(Requirement r,Authentication auth){String email=auth.getName();Role role=access.role(auth);boolean allowed=role==Role.SUPER_ADMIN||(role==Role.CUSTOMER&&email.equalsIgnoreCase(r.getCustomerEmail()))||(role==Role.EMPLOYEE&&r.getEmployeeEmail()!=null&&email.equalsIgnoreCase(r.getEmployeeEmail()))||(role==Role.VENDOR&&quotations.findByRequirementIdAndVendorEmailIgnoreCase(r.getId(),email).isPresent());if(!allowed)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not a participant in this requirement");}
 private void chatAvailable(Requirement r){if(EnumSet.of(RequirementStatus.SUBMITTED,RequirementStatus.DECLINED,RequirementStatus.REJECTED).contains(r.getStatus()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Chat becomes available after an employee accepts the requirement");}
 private void notify(String email,String actor,Requirement r,RequirementMessage m){if(email!=null&&!email.isBlank()&&!email.equalsIgnoreCase(actor))notifications.send(email,r.getId(),"REQUIREMENT_MESSAGE","New message on "+r.getReference(),m.getSenderName()+": "+m.getMessage());}
}
