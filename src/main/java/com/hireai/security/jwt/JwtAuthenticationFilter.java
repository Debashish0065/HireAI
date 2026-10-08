package com.hireai.security.jwt;

import com.hireai.security.service.CustomUserDetailsService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private static final String AUTHORIZATION_HEADER =
            "Authorization";

    private static final String BEARER_PREFIX =
            "Bearer ";

    private final JwtService jwtService;

    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    // ============================================================
    // SKIP JWT FILTER FOR PUBLIC AUTH ENDPOINTS
    // ============================================================

    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request
    ) throws ServletException {

        String path = request.getServletPath();

        boolean skip =
                path.startsWith("/api/v1/auth");

        log.info(
                "JWT FILTER CHECK: method={}, path={}, skip={}",
                request.getMethod(),
                path,
                skip
        );

        return skip;
    }

    // ============================================================
    // JWT AUTHENTICATION
    // ============================================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // ========================================================
        // FILTER ENTRY LOG
        // ========================================================

        log.info(
                "========== JWT FILTER HIT ==========" +
                        " method={}, uri={}",
                request.getMethod(),
                request.getRequestURI()
        );

        // ========================================================
        // READ AUTHORIZATION HEADER
        // ========================================================

        String authHeader =
                request.getHeader(AUTHORIZATION_HEADER);

        log.info(
                "Authorization header present: {}",
                authHeader != null && !authHeader.isBlank()
        );

        // ========================================================
        // NO AUTHORIZATION HEADER
        // ========================================================

        if (authHeader == null || authHeader.isBlank()) {

            log.info(
                    "No Authorization header found. " +
                            "Continuing without JWT authentication."
            );

            filterChain.doFilter(request, response);
            return;
        }

        // ========================================================
        // INVALID AUTHORIZATION HEADER
        // ========================================================

        if (!authHeader.startsWith(BEARER_PREFIX)) {

            log.info(
                    "Authorization header is not using Bearer authentication."
            );

            filterChain.doFilter(request, response);
            return;
        }

        // ========================================================
        // EXTRACT TOKEN
        // ========================================================

        String token =
                authHeader
                        .substring(BEARER_PREFIX.length())
                        .trim();

        if (token.isEmpty()) {

            log.info(
                    "Bearer token is empty."
            );

            filterChain.doFilter(request, response);
            return;
        }

        log.info(
                "Bearer token detected."
        );

        try {

            // ====================================================
            // CHECK EXISTING SECURITY CONTEXT
            // ====================================================

            Authentication existingAuthentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            if (existingAuthentication != null
                    && existingAuthentication.isAuthenticated()
                    && !(existingAuthentication
                    instanceof AnonymousAuthenticationToken)) {

                log.info(
                        "Existing authenticated user found: " +
                                "name={}, authorities={}",
                        existingAuthentication.getName(),
                        existingAuthentication.getAuthorities()
                );

                filterChain.doFilter(request, response);
                return;
            }

            // ====================================================
            // EXTRACT USERNAME FROM JWT
            // ====================================================

            String email =
                    jwtService.extractUsername(token);

            log.info(
                    "JWT extracted email: {}",
                    email
            );

            if (email == null || email.isBlank()) {

                log.info(
                        "JWT does not contain a valid username."
                );

                filterChain.doFilter(request, response);
                return;
            }

            // ====================================================
            // VALIDATE JWT
            // ====================================================

            boolean valid =
                    jwtService.isTokenValid(
                            token,
                            email
                    );

            log.info(
                    "JWT validation result: {}",
                    valid
            );

            if (!valid) {

                log.info(
                        "JWT validation failed."
                );

                filterChain.doFilter(request, response);
                return;
            }

            // ====================================================
            // LOAD USER FROM DATABASE
            // ====================================================

            UserDetails userDetails =
                    userDetailsService
                            .loadUserByUsername(email);

            log.info(
                    "JWT USER: email={}, authorities={}",
                    userDetails.getUsername(),
                    userDetails.getAuthorities()
            );

            // ====================================================
            // CREATE AUTHENTICATION TOKEN
            // ====================================================

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            // ====================================================
            // REQUEST DETAILS
            // ====================================================

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            // ====================================================
            // STORE AUTHENTICATION
            // ====================================================

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            // ====================================================
            // VERIFY SECURITY CONTEXT
            // ====================================================

            Authentication currentAuthentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            log.info(
                    "SECURITY CONTEXT: authenticated={}, " +
                            "name={}, authorities={}",
                    currentAuthentication != null
                            && currentAuthentication.isAuthenticated(),
                    currentAuthentication != null
                            ? currentAuthentication.getName()
                            : null,
                    currentAuthentication != null
                            ? currentAuthentication.getAuthorities()
                            : null
            );

            log.info(
                    "JWT authentication successful."
            );

        } catch (JwtException | IllegalArgumentException e) {

            log.error(
                    "JWT authentication failed: {}",
                    e.getMessage(),
                    e
            );

        } catch (Exception e) {

            log.error(
                    "Unexpected error during JWT authentication",
                    e
            );
        }

        // ========================================================
        // CONTINUE FILTER CHAIN
        // ========================================================

        log.info(
                "Continuing Spring Security filter chain: method={}, uri={}",
                request.getMethod(),
                request.getRequestURI()
        );

        filterChain.doFilter(request, response);
    }
}