package com.wefyx.support.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountProfilePhotoRepository extends JpaRepository<AccountProfilePhoto,Long> {
    Optional<AccountProfilePhoto> findByEmailIgnoreCase(String email);
    void deleteByEmailIgnoreCase(String email);
}
