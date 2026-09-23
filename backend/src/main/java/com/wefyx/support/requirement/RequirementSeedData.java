package com.wefyx.support.requirement;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import java.math.BigDecimal;

@Configuration @ConditionalOnProperty(name="wefyx.seed.enabled",havingValue="true")
public class RequirementSeedData {
 @Bean CommandLineRunner seedRequirements(RequirementRepository repo){return args->{if(repo.count()>0)return;repo.saveAll(java.util.List.of(
  item("POS terminals for new supermarket branch","Install and configure 12 POS terminals, barcode scanners and receipt printers.","Hardware","HIGH","GreenMart Supermarket",true,new BigDecimal("18500"),RequirementStatus.SENT_TO_VENDOR,QuotationStatus.SENT_TO_VENDOR),
  item("Microsoft 365 email migration","Migrate 85 staff mailboxes with minimal downtime and configure MFA.","Software","MEDIUM","ABC Technologies",true,new BigDecimal("9200"),RequirementStatus.VENDOR_ACCEPTED,QuotationStatus.VENDOR_ACCEPTED),
  item("Warehouse Wi-Fi coverage issue","Dead zones affect handheld inventory scanners in aisles 6-10.","Network","HIGH","FreshChoice Markets",false,null,RequirementStatus.IN_PROGRESS,QuotationStatus.NOT_REQUESTED)
 ));};}
 private Requirement item(String title,String description,String category,String priority,String customer,boolean quote,BigDecimal amount,RequirementStatus status,QuotationStatus qs){Requirement r=new Requirement();r.setReference("REQ-2026-"+String.format("%05d",Math.abs(title.hashCode()%90000)));r.setTitle(title);r.setDescription(description);r.setCategory(category);r.setPriority(priority);r.setCustomerName(customer);r.setCustomerEmail("admin@wefyx.pro");r.setOrganization(customer);r.setEmployeeName("Ahmed Khan");r.setVendorName("TechSolutions LLC");r.setQuotationRequested(quote);r.setEstimatedAmount(amount);r.setStatus(status);r.setQuotationStatus(qs);return r;}
}
