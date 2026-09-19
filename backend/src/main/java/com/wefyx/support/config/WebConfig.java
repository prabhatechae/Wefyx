package com.wefyx.support.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Value("${wefyx.cors-origins}") private String corsOrigins;
    @Override public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins(corsOrigins.split(",")).allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS").allowedHeaders("*");
    }

    @Override public void addViewControllers(ViewControllerRegistry registry) {
        String[] frontendRoutes = {
            "/portal", "/register", "/careers", "/privacy-policy",
            "/rent", "/rent/dell-latitude-5550", "/cart", "/services",
            "/data-center", "/about", "/contact", "/shop"
        };
        for (String route : frontendRoutes) {
            registry.addViewController(route).setViewName("forward:/index.html");
        }
    }
}
