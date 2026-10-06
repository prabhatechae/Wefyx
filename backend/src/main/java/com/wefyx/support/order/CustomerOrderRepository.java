package com.wefyx.support.order;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder,Long> {
    List<CustomerOrder> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    Optional<CustomerOrder> findByReference(String reference);
}
