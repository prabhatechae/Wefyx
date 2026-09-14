package com.wefyx.support.resource;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Configuration
@ConditionalOnProperty(name="wefyx.seed.enabled",havingValue="true")
public class PermissionMatrixSeedData {
    @Bean
    CommandLineRunner seedPermissionMatrix(ResourceRepository repository) {
        return args -> {
            if (repository.existsByModuleKey("permission-matrix")) return;
            String[] modules = {"Dashboard", "Users Management", "Role Management", "Tickets", "Assets", "Technicians", "Reports & Analytics", "Organizations"};
            String[] actions = {"View", "Create", "Edit", "Delete", "Export", "Approve"};
            for (int moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
                for (int actionIndex = 0; actionIndex < actions.length; actionIndex++) {
                    ResourceRecord record = new ResourceRecord();
                    record.setModuleKey("permission-matrix");
                    record.setName(modules[moduleIndex] + ":" + actions[actionIndex]);
                    record.setOwner("ALL");
                    record.setDetails(String.valueOf((moduleIndex + actionIndex) % 9 == 7 ? 1 : actionIndex == 5 && moduleIndex % 3 == 0 ? 2 : 0));
                    record.setStatus("Active");
                    repository.save(record);
                }
            }
        };
    }
}
