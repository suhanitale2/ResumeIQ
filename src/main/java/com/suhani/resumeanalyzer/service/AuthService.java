
package com.suhani.resumeanalyzer.service;

import com.suhani.resumeanalyzer.model.User;
import com.suhani.resumeanalyzer.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String signup(User user) {

        if (user.getName() == null || user.getName().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {
            throw new IllegalArgumentException(
                    "Name, email and password are required.");
        }

        if (userRepository.existsByEmail(user.getEmail().trim())) {
            throw new IllegalArgumentException(
                    "Email is already registered.");
        }

        user.setName(user.getName().trim());
        user.setEmail(user.getEmail().trim());

        // Hash the password before saving it.
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);

        return "Signup successful!";
    }
        public String login(String email, String password) {

        if (email == null || email.isBlank()
                || password == null || password.isBlank()) {
            throw new IllegalArgumentException(
                    "Email and password are required.");
        }

        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid email or password."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException(
                    "Invalid email or password.");
        }

        return "Login successful!";
    }
}
