package com.wefyx.support.supportrequest;
import org.springframework.beans.factory.annotation.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
@Service public class SupportMailService{
 private final JavaMailSender mail;private final boolean enabled;private final String from;
 public SupportMailService(JavaMailSender mail,@Value("${wefyx.mail.enabled:false}")boolean enabled,@Value("${wefyx.mail.from:support@wefyx.pro}")String from){this.mail=mail;this.enabled=enabled;this.from=from;}
 public Delivery send(PublicSupportRequest request){if(!enabled)return new Delivery(false,"SMTP delivery is not configured");try{var m=new SimpleMailMessage();m.setFrom(from);m.setTo(request.getEmail());m.setSubject("Wefyx support response · "+request.getReference()+" · "+request.getSubject());m.setText("Hello "+request.getName()+",\n\n"+request.getEmployeeReply()+"\n\nReference: "+request.getReference()+"\n\nWefyx Support");mail.send(m);return new Delivery(true,null);}catch(Exception e){return new Delivery(false,e.getMessage()==null?"Email delivery failed":e.getMessage().substring(0,Math.min(500,e.getMessage().length())));}}
 public record Delivery(boolean delivered,String error){}
}
