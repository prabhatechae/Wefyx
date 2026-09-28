package com.wefyx.support.config;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/** Public landing response for a directly opened API base URL. */
@RestController
public class ApiStatusController {
    @GetMapping({"/api", "/api/"})
    public Map<String, String> status() {
        return Map.of("service", "Wefyx API", "status", "running", "login", "/api/auth/login");
    }
}
