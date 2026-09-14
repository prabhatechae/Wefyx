package com.wefyx.support.config;

import com.wefyx.support.role.*; import com.wefyx.support.user.*;
import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import java.time.LocalDateTime; import java.util.List;
@Configuration @ConditionalOnProperty(name="wefyx.seed.enabled",havingValue="true") public class SeedData {
 @Bean CommandLineRunner seed(UserRepository users,RoleRepository roles){return args->{if(users.count()>0||roles.count()>0)return;var now=LocalDateTime.now();users.saveAll(List.of(
 new SupportUser("System Administrator","admin@wefyx.pro","Super Admin","Wefyx Technologies","Dubai, UAE",UserStatus.ACTIVE,now.minusMinutes(2),now.minusDays(120)),
 new SupportUser("Ahmed Khan","ahmed.khan@wefyx.pro","L2 Engineer","Wefyx Technologies","Dubai, UAE",UserStatus.ACTIVE,now.minusHours(1),now.minusDays(23)),
 new SupportUser("Sara Ali","sara.ali@techsolutions.ae","Vendor Manager","TechSolutions LLC","Sharjah, UAE",UserStatus.ACTIVE,now.minusHours(2),now.minusDays(31)),
 new SupportUser("Mike Johnson","mike.johnson@company.com","L3 Engineer","Wefyx Technologies","Dubai, UAE",UserStatus.ACTIVE,now.minusHours(3),now.minusDays(36)),
 new SupportUser("Priya Sharma","priya.sharma@abc.com","Support Agent","ABC Trading LLC","Dubai, UAE",UserStatus.INACTIVE,now.minusDays(3),now.minusDays(16)),
 new SupportUser("Daniel Lee","daniel.lee@rentals.ae","Rental Manager","Rentals UAE","Dubai, UAE",UserStatus.ACTIVE,now.minusHours(4),now.minusDays(26)),
 new SupportUser("Fatima Hassan","fatima.hassan@wefyx.pro","NOC Engineer","Wefyx Technologies","Dubai, UAE",UserStatus.ACTIVE,now.minusHours(2),now.minusDays(33)),
 new SupportUser("James Wilson","james.wilson@msps.com","MSP Partner","MSP Global Solutions","Abu Dhabi, UAE",UserStatus.PENDING,null,now.minusDays(4)),
 new SupportUser("Noor Ahmad","noor.ahmad@company.com","Finance Manager","ABC Trading LLC","Dubai, UAE",UserStatus.ACTIVE,now.minusHours(15),now.minusDays(11)),
 new SupportUser("Omar Farooq","omar@techgear.ae","Vendor Technician","TechGear LLC","Ajman, UAE",UserStatus.SUSPENDED,now.minusDays(9),now.minusDays(49))));
 String[] first={"Aarav","Aisha","Akash","Ali","Amal","Ananya","Arjun","Bilal","Diya","Farhan","Hana","Imran","Ishaan","Kavya","Layla","Meera","Neha","Nikhil","Rahul","Riya","Rohan","Saanvi","Sameer","Sana","Tara","Vihaan","Yasmin","Zain","Deepak","Maya"};
 String[] last={"Ahmed","Khan","Patel","Sharma","Nair","Menon","Gupta","Hassan","Thomas","Rao"};
 String[] orgs={"ABC Trading LLC","Wefyx Technologies","TechSolutions LLC","Rentals UAE","MSP Global Solutions","TechGear LLC"};
 String[] roleNames={"Customer Admin","L1 Technician","L2 Engineer","Support Agent","NOC Engineer","Finance Manager","Vendor Manager"};
 UserStatus[] statuses={UserStatus.ACTIVE,UserStatus.ACTIVE,UserStatus.ACTIVE,UserStatus.ACTIVE,UserStatus.INACTIVE,UserStatus.PENDING,UserStatus.SUSPENDED};
 for(int i=10;i<100;i++){String name=first[i%first.length]+" "+last[(i*3)%last.length];users.save(new SupportUser(name,"employee"+String.format("%03d",i+1)+"@wefyx.demo",roleNames[i%roleNames.length],orgs[i%orgs.length],i%3==0?"Dubai, UAE":i%3==1?"Abu Dhabi, UAE":"Sharjah, UAE",statuses[i%statuses.length],now.minusHours(i+1),now.minusDays(20+i)));}
 roles.saveAll(List.of(new SupportRole("Super Admin","SUPER_ADMIN","System",2,"Full system access with all privileges and settings.",true),new SupportRole("System Administrator","SYS_ADMIN","System",5,"Manage system settings, users, roles and permissions.",true),new SupportRole("Operations Manager","OPS_MANAGER","Custom",3,"Oversee daily operations, tickets and engineer teams.",true),new SupportRole("Branch Manager","BRANCH_MANAGER","Custom",18,"Manage branch operations, users, tickets and assets.",true),new SupportRole("Service Delivery Manager","SD_MANAGER","Custom",4,"Manage service delivery, SLA, contracts and quality.",true),new SupportRole("NOC Manager","NOC_MANAGER","Custom",2,"Monitor NOC operations, alerts, incidents and team.",true),new SupportRole("L1 Technician","TECH_L1","System",156,"Level 1 support technician with basic access.",true),new SupportRole("L2 Engineer","TECH_L2","System",87,"Level 2 engineer with advanced troubleshooting.",true),new SupportRole("Vendor Manager","VENDOR_MANAGER","Custom",15,"Manage vendor operations, orders and technicians.",true)));};}
}
