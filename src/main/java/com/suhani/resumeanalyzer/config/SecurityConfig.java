package com.suhani.resumeanalyzer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(
    java.util.List.of(
        "http://localhost:5173",
        "https://resume-iq-eosin.vercel.app"
    )
);

    configuration.setAllowedMethods(
        java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
    );

    configuration.setAllowedHeaders(
        java.util.List.of("Content-Type", "Accept", "Authorization", "X-Requested-With")
    );

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source =
        new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration("/**", configuration);

    return source;
}

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

            // Temporary development configuration.
            // CSRF protection must be enabled before production use.
            http
    .cors(cors -> cors.configurationSource(corsConfigurationSource()))

    .csrf(csrf -> csrf.disable())

            // Use the existing server-side HTTP session.
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
            )

            .authorizeHttpRequests(auth -> auth

                // Public pages and signup/login endpoints
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/login.html",
                    "/signup.html",
                    "/api/auth/signup",
                    "/api/auth/login",
                    "/api/auth/logout",
                    "/error",
                    "/favicon.ico"
                ).permitAll()

                // Session status requires an authenticated user
                .requestMatchers("/api/auth/session").authenticated()

                // Resume analysis and AI review require login
                .requestMatchers("/api/resume/**").authenticated()

                // Keep other existing endpoints accessible for now.
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
