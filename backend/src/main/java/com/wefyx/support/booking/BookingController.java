package com.wefyx.support.booking;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService service;
    public BookingController(BookingService service) { this.service=service; }
    @GetMapping("/catalog") public Map<String,Object> catalog() { return service.catalog(); }
    @GetMapping("/availability") public List<Map<String,Object>> availability(
        @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date) { return service.availability(date); }
    @GetMapping public List<BookingDtos.View> list(Authentication auth) { return service.list(auth); }
    @GetMapping("/{id}") public BookingDtos.View get(@PathVariable Long id,Authentication auth) { return service.get(id,auth); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public BookingDtos.View create(@Valid @RequestBody BookingDtos.Create body,Authentication auth) { return service.create(body,auth); }
    @PostMapping("/{id}/checkout") public void checkout(@PathVariable Long id,Authentication auth) { service.checkout(id,auth); }
    @PatchMapping("/{id}/assign") public BookingDtos.View assign(@PathVariable Long id,@Valid @RequestBody BookingDtos.Assign body,Authentication auth) { return service.assign(id,body.employeeEmail(),auth); }
    @PatchMapping("/{id}/start") public BookingDtos.View start(@PathVariable Long id,Authentication auth) { return service.start(id,auth); }
    @PostMapping("/{id}/report") public BookingDtos.View report(@PathVariable Long id,@Valid @RequestBody BookingDtos.Report body,Authentication auth) { return service.report(id,body,auth); }
}
