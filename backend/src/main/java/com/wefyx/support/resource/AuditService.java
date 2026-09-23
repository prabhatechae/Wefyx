package com.wefyx.support.resource;
import org.springframework.stereotype.Service;
@Service public class AuditService{
 private final ResourceRepository repository; public AuditService(ResourceRepository repository){this.repository=repository;}
 public void log(String action,String module,String details){ResourceRecord record=new ResourceRecord();record.setModuleKey("audit-logs");record.setName(action);record.setOwner("System Administrator");record.setDetails(module+"|"+details);record.setStatus("Success");repository.save(record);}
}
