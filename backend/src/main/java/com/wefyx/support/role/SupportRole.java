package com.wefyx.support.role;

import jakarta.persistence.*;
@Entity @Table(name="support_roles")
public class SupportRole {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private String name; private String code; private String type; private int users; private String description; private String organization; private boolean active;
    protected SupportRole(){} public SupportRole(String n,String c,String t,int u,String d,boolean a){name=n;code=c;type=t;users=u;description=d;active=a;}
    public Long getId(){return id;} public String getName(){return name;} public String getCode(){return code;} public String getType(){return type;} public int getUsers(){return users;} public String getDescription(){return description;} public String getOrganization(){return organization;} public boolean isActive(){return active;}
    public void setName(String value){name=value;} public void setCode(String value){code=value;} public void setType(String value){type=value;} public void setUsers(int value){users=value;} public void setDescription(String value){description=value;} public void setOrganization(String value){organization=value;} public void setActive(boolean value){active=value;}
}
