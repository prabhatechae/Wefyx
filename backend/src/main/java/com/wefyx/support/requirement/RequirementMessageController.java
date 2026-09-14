package com.wefyx.support.requirement;

import com.wefyx.support.resource.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/api/requirements/{requirementId}/messages")
public class RequirementMessageController {
 private final RequirementRepository requirements; private final RequirementMessageRepository messages; private final AuditService audit;
 public RequirementMessageController(RequirementRepository r,RequirementMessageRepository m,AuditService a){requirements=r;messages=m;audit=a;}
 @GetMapping public List<RequirementMessage> list(@PathVariable Long requirementId,Authentication auth){var r=find(requirementId);authorize(r,auth.getName());return messages.findByRequirementIdOrderByCreatedAtAsc(requirementId);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public RequirementMessage send(@PathVariable Long requirementId,@RequestBody Map<String,String> body,Authentication auth){var r=find(requirementId);authorize(r,auth.getName());String text=body.getOrDefault("message","").trim();if(text.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Message is required");var m=new RequirementMessage();m.setRequirementId(requirementId);m.setSenderEmail(auth.getName());m.setSenderName(body.getOrDefault("senderName",auth.getName()));m.setSenderRole(body.getOrDefault("senderRole","USER"));m.setMessage(text);audit.log("Requirement message sent","Requirements",r.getReference());return messages.save(m);}
 private Requirement find(Long id){return requirements.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Requirement not found"));}
 private void authorize(Requirement r,String email){boolean customer=email.equalsIgnoreCase(r.getCustomerEmail());boolean vendor=email.equalsIgnoreCase(r.getVendorName());if(!customer&&!vendor){return;}}
}
