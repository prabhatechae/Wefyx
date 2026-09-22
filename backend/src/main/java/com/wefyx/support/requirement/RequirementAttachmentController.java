package com.wefyx.support.requirement;

import com.wefyx.support.resource.AuditService;
import com.wefyx.support.user.UserRepository;
import com.wefyx.support.user.UserStatus;
import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/requirements/{requirementId}/attachments")
public class RequirementAttachmentController {
    private static final long MAX_FILE_SIZE=10L*1024*1024;
    private static final Set<String> TYPES=Set.of("application/pdf","image/jpeg","image/png","image/webp","text/plain","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    private final RequirementRepository requirements; private final RequirementAttachmentRepository attachments; private final UserRepository users; private final AuditService audit; private final VendorQuotationRepository quotations; private final AccessControl access;
    public RequirementAttachmentController(RequirementRepository r,RequirementAttachmentRepository a,UserRepository u,AuditService audit,VendorQuotationRepository quotations,AccessControl access){requirements=r;attachments=a;users=u;this.audit=audit;this.quotations=quotations;this.access=access;}

    @GetMapping public List<AttachmentView> list(@PathVariable Long requirementId,Authentication auth){var r=requirement(requirementId);authorize(r,auth);return attachments.findByRequirementIdOrderByCreatedAtAsc(requirementId).stream().map(AttachmentView::from).toList();}
    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.CREATED)
    public List<AttachmentView> upload(@PathVariable Long requirementId,@RequestParam("files") List<MultipartFile> files,Authentication auth)throws IOException{
        var r=requirement(requirementId);authorize(r,auth);if(files.isEmpty())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Select at least one file");if(files.size()>5)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Maximum 5 files per upload");var saved=new ArrayList<AttachmentView>();
        for(var file:files){if(file.isEmpty())continue;if(file.getSize()>MAX_FILE_SIZE)throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"Each file must be 10 MB or smaller");String type=Optional.ofNullable(file.getContentType()).orElse("application/octet-stream");if(!TYPES.contains(type))throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"Unsupported file type: "+type);var item=new RequirementAttachment();item.setRequirementId(requirementId);item.setFileName(clean(file.getOriginalFilename()));item.setContentType(type);item.setFileSize(file.getSize());item.setUploadedBy(auth.getName());item.setContent(file.getBytes());saved.add(AttachmentView.from(attachments.save(item)));}
        audit.log("Requirement attachments uploaded","Requirements",r.getReference()+" · "+saved.size()+" file(s)");return saved;
    }
    @GetMapping("/{attachmentId}/download") public ResponseEntity<byte[]> download(@PathVariable Long requirementId,@PathVariable Long attachmentId,Authentication auth){var r=requirement(requirementId);authorize(r,auth);var item=attachments.findById(attachmentId).filter(x->x.getRequirementId().equals(requirementId)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Attachment not found"));return ResponseEntity.ok().contentType(MediaType.parseMediaType(item.getContentType())).contentLength(item.getFileSize()).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(item.getFileName(),StandardCharsets.UTF_8).build().toString()).body(item.getContent());}
    private Requirement requirement(Long id){return requirements.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Requirement not found"));}
    private void authorize(Requirement r,Authentication auth){String email=auth.getName();Role role=access.role(auth);boolean customer=role==Role.CUSTOMER&&email.equalsIgnoreCase(r.getCustomerEmail());boolean employee=role==Role.EMPLOYEE&&r.getEmployeeEmail()!=null&&email.equalsIgnoreCase(r.getEmployeeEmail());boolean vendor=role==Role.VENDOR&&quotations.findByRequirementIdAndVendorEmailIgnoreCase(r.getId(),email).isPresent();if(role!=Role.SUPER_ADMIN&&!customer&&!employee&&!vendor)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Not permitted to access these attachments");}
    private static String clean(String name){String value=Optional.ofNullable(name).orElse("attachment").replace('\\','/');value=value.substring(value.lastIndexOf('/')+1).replaceAll("[\\r\\n]","").trim();return value.isBlank()?"attachment":value;}
    public record AttachmentView(Long id,Long requirementId,String fileName,String contentType,long fileSize,String uploadedBy,java.time.LocalDateTime createdAt){static AttachmentView from(RequirementAttachment x){return new AttachmentView(x.getId(),x.getRequirementId(),x.getFileName(),x.getContentType(),x.getFileSize(),x.getUploadedBy(),x.getCreatedAt());}}
}
