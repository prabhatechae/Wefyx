package com.wefyx.support.notification;import org.springframework.data.jpa.repository.JpaRepository;import java.util.List;
public interface AccountNotificationRepository extends JpaRepository<AccountNotification,Long>{List<AccountNotification> findByRecipientEmailIgnoreCaseOrderByCreatedAtDesc(String email);}
