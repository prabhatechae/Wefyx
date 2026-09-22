package com.wefyx.support.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Serve the React entry point for public website deep links. */
@Controller
public class PublicPageController {
    @GetMapping({
        "/register", "/careers", "/become-a-vendor", "/rent", "/rent/{product}",
        "/cart", "/services", "/data-center", "/about", "/contact",
        "/support", "/shop", "/privacy-policy"
    })
    public String website() {
        return "forward:/index.html";
    }
}
