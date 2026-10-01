package com.wefyx.support.user;

import com.wefyx.support.auth.AuthController;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestControllerAdvice(assignableTypes = {AuthController.class, UserController.class})
public class UserErrors {
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<?> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason() == null ? "Request failed" : e.getReason()));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<?> validation(MethodArgumentNotValidException e) {
        var error = e.getBindingResult().getFieldErrors().get(0);
        return ResponseEntity.badRequest().body(Map.of("message", error.getField() + ": " + error.getDefaultMessage()));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<?> conflict(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email address or mobile number is already registered, or the account conflicts with existing data."));
    }
}
