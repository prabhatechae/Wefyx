package com.wefyx.support.booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BookingFileRepository extends JpaRepository<BookingFile,Long> {
    List<BookingFile> findByBookingIdOrderByCreatedAtAsc(Long bookingId);
    long countByBookingIdAndReportPhoto(Long bookingId,boolean reportPhoto);
}
