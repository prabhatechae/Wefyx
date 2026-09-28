package com.wefyx.support.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Serve the React entry point for public website deep links. */
@Controller
public class PublicPageController {
    @GetMapping({
        "/portal", "/book-support", "/book-support/{step}", "/my-tickets", "/my-tickets/{id}",
        "/service-tasks", "/service-tasks/{id}", "/service-tasks/{id}/report", "/support-updates/{id}",
        "/register", "/careers", "/become-a-vendor", "/rent", "/rent/{product}",
        "/cart", "/services", "/data-center", "/about", "/contact",
        "/support", "/shop", "/privacy-policy"
    })
    public String website() {
        return "forward:/index.html";
    }
}
