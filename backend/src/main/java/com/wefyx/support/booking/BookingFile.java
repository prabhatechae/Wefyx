package com.wefyx.support.booking;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="booking_files", indexes=@Index(name="booking_file_idx",columnList="bookingId"))
public class BookingFile {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id;
    Long bookingId;
    String fileName;
    String contentType;
    long fileSize;
    boolean reportPhoto;
    Instant createdAt;
    @Basic(fetch=FetchType.LAZY) @Column(length=10485760) byte[] content;
    protected BookingFile() {}
}
