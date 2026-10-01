package com.wefyx.support.user;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface UserRepository extends JpaRepository<SupportUser,Long> {
    List<SupportUser> findByStatus(UserStatus status);
    List<SupportUser> findByOrganization(String organization);
    List<SupportUser> findByOrganizationAndStatus(String organization,UserStatus status);
    Optional<SupportUser> findByEmailIgnoreCase(String email);
    Optional<SupportUser> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByPhoneAndIdNot(String phone, Long id);
    long countByStatus(UserStatus status);
    long countByRoleContainingIgnoreCase(String role);
}

