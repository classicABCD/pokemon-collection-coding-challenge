package com.pokemoncollection.identity.internal;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.json.JsonMapper;

@Configuration
class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            SecurityContextRepository securityContextRepository,
            CsrfTokenRepository csrfTokenRepository,
            JsonMapper jsonMapper,
            @Value("${app.identity.session-absolute-timeout}") Duration sessionAbsoluteTimeout) {
        http
                // Before the security context is loaded from the session, so an expired session is never used
                .addFilterBefore(
                        new AbsoluteSessionTimeoutFilter(sessionAbsoluteTimeout), SecurityContextHolderFilter.class)
                // XSRF-TOKEN cookie readable by the SPA, sent back as X-XSRF-TOKEN header
                .csrf(csrf -> csrf.spa().csrfTokenRepository(csrfTokenRepository))
                .addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
                .authorizeHttpRequests(
                        auth -> auth.requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login")
                                .permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/auth/me", "/actuator/health")
                                .permitAll()
                                .requestMatchers("/error")
                                .permitAll()
                                .requestMatchers("/api/**")
                                .authenticated()
                                .anyRequest()
                                .denyAll())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, e) ->
                                writeProblem(response, jsonMapper, HttpStatus.UNAUTHORIZED, "Authentication required"))
                        .accessDeniedHandler((request, response, e) ->
                                writeProblem(response, jsonMapper, HttpStatus.FORBIDDEN, "Access denied")))
                .securityContext(context -> context.securityContextRepository(securityContextRepository))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .requestCache(AbstractHttpConfigurer::disable);
        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    /** Shared with the login endpoint, which renews the token after authentication. */
    @Bean
    CsrfTokenRepository csrfTokenRepository() {
        return CookieCsrfTokenRepository.withHttpOnlyFalse();
    }

    @Bean
    AuthenticationManager authenticationManager(
            TrainerUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    /**
     * The CSRF token is loaded lazily; loading it on every request makes sure the XSRF-TOKEN cookie reaches the SPA.
     */
    private static final class CsrfCookieFilter extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws ServletException, IOException {
            if (request.getAttribute(CsrfToken.class.getName()) instanceof CsrfToken csrfToken) {
                csrfToken.getToken();
            }
            chain.doFilter(request, response);
        }
    }

    /**
     * Invalidates sessions older than the absolute timeout. Requests extend the idle timeout, so without this a client
     * that keeps sending requests (e.g. an open tab) would stay logged in forever.
     */
    private static final class AbsoluteSessionTimeoutFilter extends OncePerRequestFilter {

        private final Duration timeout;

        AbsoluteSessionTimeoutFilter(Duration timeout) {
            this.timeout = timeout;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
                throws ServletException, IOException {
            HttpSession session = request.getSession(false);
            if (session != null
                    && Instant.ofEpochMilli(session.getCreationTime())
                            .plus(timeout)
                            .isBefore(Instant.now())) {
                // The request continues anonymously: protected endpoints answer 401
                session.invalidate();
            }
            chain.doFilter(request, response);
        }
    }

    private static void writeProblem(
            HttpServletResponse response, JsonMapper jsonMapper, HttpStatus status, String detail) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        jsonMapper.writeValue(response.getOutputStream(), ProblemDetail.forStatusAndDetail(status, detail));
    }
}
