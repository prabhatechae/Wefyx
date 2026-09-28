package com.wefyx.support.booking;

import com.wefyx.support.config.AccessControl;
import com.wefyx.support.config.AccessControl.Role;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import static com.wefyx.support.booking.BookingService.error;

@RestController
@RequestMapping("/api/bookings/{id}/files")
@Transactional
public class BookingFilesController {
    private static final Set<String> TYPES=Set.of("image/jpeg","image/png","image/webp","application/pdf","text/plain");
    private final BookingService service;
    private final BookingRepository bookings;
    private final BookingFileRepository files;
    private final AccessControl access;
    public BookingFilesController(BookingService service,BookingRepository bookings,BookingFileRepository files,AccessControl access) {
        this.service=service;this.bookings=bookings;this.files=files;this.access=access;
    }
    public record FileView(Long id,String fileName,String contentType,long fileSize,boolean reportPhoto,Instant createdAt) {
        static FileView from(BookingFile f) { return new FileView(f.id,f.fileName,f.contentType,f.fileSize,f.reportPhoto,f.createdAt); }
    }
    @GetMapping @Transactional(readOnly=true)
    public List<FileView> list(@PathVariable Long id,Authentication auth) {
        service.visible(id,auth);return files.findByBookingIdOrderByCreatedAtAsc(id).stream().map(FileView::from).toList();
    }
    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<FileView> upload(@PathVariable Long id,@RequestParam("files") List<MultipartFile> uploads,
                                @RequestParam(defaultValue="false") boolean reportPhoto,Authentication auth)throws IOException {
        Booking b=bookings.lockById(id).orElseThrow(()->error(HttpStatus.NOT_FOUND,"Booking not found"));
        service.requireVisible(b,auth);
        if(reportPhoto) {
            access.require(auth,Role.EMPLOYEE,Role.SUPER_ADMIN);
            if(b.status!=Booking.Status.IN_PROGRESS) throw error(HttpStatus.CONFLICT,"Photos can only be added while work is in progress");
        } else {
            access.require(auth,Role.CUSTOMER);
            if(b.status!=Booking.Status.AWAITING_PAYMENT) throw error(HttpStatus.CONFLICT,"The booking can no longer be edited");
        }
        if(uploads.isEmpty() || uploads.size()+files.countByBookingIdAndReportPhoto(id,reportPhoto)>5)
            throw error(HttpStatus.BAD_REQUEST,"Maximum five files are allowed");
        for(var file:uploads) {
            if(file.isEmpty() || file.getSize()>10L*1024*1024) throw error(HttpStatus.BAD_REQUEST,"Each file must be between 1 byte and 10 MB");
            if(!TYPES.contains(file.getContentType()) || reportPhoto && !file.getContentType().startsWith("image/"))
                throw error(HttpStatus.BAD_REQUEST,"Choose PNG, JPEG, WebP"+(reportPhoto?" photos":" images, PDF or text files"));
        }
        List<FileView> result=new ArrayList<>();
        for(var file:uploads) {
            var f=new BookingFile();f.bookingId=id;f.contentType=file.getContentType();f.fileSize=file.getSize();
            String name=Objects.toString(file.getOriginalFilename(),"attachment").replace('\\','/');
            name=name.substring(name.lastIndexOf('/')+1).replaceAll("[\\r\\n]","");
            f.fileName=name.isBlank()?"attachment":name.substring(0,Math.min(200,name.length()));
            f.content=file.getBytes();f.reportPhoto=reportPhoto;f.createdAt=Instant.now();result.add(FileView.from(files.save(f)));
        }
        return result;
    }
    @GetMapping("/{fileId}") @Transactional(readOnly=true)
    public ResponseEntity<byte[]> download(@PathVariable Long id,@PathVariable Long fileId,Authentication auth) {
        service.visible(id,auth);
        BookingFile f=files.findById(fileId).filter(file->id.equals(file.bookingId))
            .orElseThrow(()->error(HttpStatus.NOT_FOUND,"File not found"));
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(f.contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(f.fileName,StandardCharsets.UTF_8).build().toString())
            .header("X-Content-Type-Options","nosniff").body(f.content);
    }
}
