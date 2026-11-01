
package com.suhani.resumeanalyzer.controller;

import com.suhani.resumeanalyzer.model.User;
import com.suhani.resumeanalyzer.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signup(
            @RequestBody User user) {

        try {
            String message = authService.signup(user);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of("message", message));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {

        try {
            String email = request.get("email");
            String password = request.get("password");

            // Verify credentials using the existing service.
            authService.login(email, password);

            // Create an authenticated Spring Security identity.
            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            email.trim(),
                            null,
                            Collections.emptyList()
                    );

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            // Save the security context in the server-side session.
            HttpSession session = httpRequest.getSession(true);

            session.setAttribute(
                    HttpSessionSecurityContextRepository
                            .SPRING_SECURITY_CONTEXT_KEY,
                    context
            );

            return ResponseEntity.ok(
                    Map.of("message", "Login successful!")
            );

        } catch (IllegalArgumentException e) {
            SecurityContextHolder.clearContext();

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
                Map.of("message", "Logout successful!")
        );
    }
    
    @GetMapping("/session")
    public ResponseEntity<Map<String, String>> checkSession(
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("authenticated", "false",
                            "message", "No active session."));
        }

        Object savedContext = session.getAttribute(
                HttpSessionSecurityContextRepository
                        .SPRING_SECURITY_CONTEXT_KEY);

        if (savedContext instanceof SecurityContext context
                && context.getAuthentication() != null
                && context.getAuthentication().isAuthenticated()
                && !(context.getAuthentication() instanceof
                        org.springframework.security.authentication
                                .AnonymousAuthenticationToken)) {

            return ResponseEntity.ok(
                    Map.of(
                            "authenticated", "true",
                            "email", context.getAuthentication().getName()
                    )
            );
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("authenticated", "false",
                        "message", "Please log in."));
    }

}
