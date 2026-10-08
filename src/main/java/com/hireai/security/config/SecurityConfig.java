package com.hireai.security.config;

import com.hireai.security.jwt.JwtAuthenticationFilter;
import com.hireai.security.service.CustomUserDetailsService;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;


    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomUserDetailsService userDetailsService
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }


    // ============================================================
    // SECURITY FILTER CHAIN
    // ============================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            // ====================================================
            // CORS
            // ====================================================

            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource()
                )
            )


            // ====================================================
            // CSRF
            // ====================================================

            /*
             * HireAI uses JWT-based stateless authentication.
             * CSRF protection is therefore disabled.
             */
            .csrf(csrf -> csrf.disable())


            // ====================================================
            // AUTHORIZATION
            // ====================================================

            .authorizeHttpRequests(auth -> auth

                // ------------------------------------------------
                // ACTUATOR
                // ------------------------------------------------

                .requestMatchers("/actuator/health")
                .permitAll()


                // ------------------------------------------------
                // AUTHENTICATION
                // ------------------------------------------------

                .requestMatchers("/api/v1/auth/**")
                .permitAll()


                // ------------------------------------------------
                // ADMIN
                // ------------------------------------------------

                .requestMatchers("/api/v1/admin/**")
                .hasRole("ADMIN")


                // ------------------------------------------------
                // HR APPLICATION APIs
                // ------------------------------------------------

                .requestMatchers("/api/v1/applications/hr/**")
                .hasRole("HR")

                .requestMatchers(
                    "/api/v1/applications/*/status"
                )
                .hasRole("HR")


                // ------------------------------------------------
                // RESUME APIs
                // ------------------------------------------------

                /*
                 * Candidate can upload a resume.
                 */
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/v1/resumes"
                )
                .hasRole("CANDIDATE")


                /*
                 * Candidate can view their own resume list.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/resumes/my"
                )
                .hasRole("CANDIDATE")


                /*
                 * HR can access candidate resume endpoints.
                 *
                 * This must appear before the generic resume
                 * GET rule below.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/resumes/candidate/**"
                )
                .hasRole("HR")


                /*
                 * Candidate can view an individual resume.
                 *
                 * The controller also checks the candidate role
                 * and the service checks ownership.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/resumes/*"
                )
                .hasRole("CANDIDATE")


                /*
                 * Candidate can view their PDF.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/resumes/*/view"
                )
                .hasRole("CANDIDATE")


                /*
                 * Candidate can delete their resume.
                 */
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/v1/resumes/*"
                )
                .hasRole("CANDIDATE")


                // ------------------------------------------------
                // JOB APIs
                // ------------------------------------------------

                /*
                 * HR can view its own jobs.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/jobs/my-jobs"
                )
                .hasRole("HR")


                /*
                 * Authenticated users can browse jobs.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/jobs"
                )
                .authenticated()


                /*
                 * Authenticated users can view a single job.
                 */
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/jobs/*"
                )
                .authenticated()


                /*
                 * Only HR can create jobs.
                 */
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/v1/jobs"
                )
                .hasRole("HR")


                /*
                 * Only HR can update jobs.
                 */
                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/v1/jobs/*"
                )
                .hasRole("HR")


                /*
                 * Only HR can delete jobs.
                 */
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/v1/jobs/*"
                )
                .hasRole("HR")


                // ------------------------------------------------
                // USER APIs
                // ------------------------------------------------

                .requestMatchers(
                    "/api/v1/users/**"
                )
                .authenticated()


                // ------------------------------------------------
                // EVERYTHING ELSE
                // ------------------------------------------------

                /*
                 * Any API not explicitly configured above
                 * requires authentication.
                 */
                .anyRequest()
                .authenticated()
            )


            // ====================================================
            // SESSION MANAGEMENT
            // ====================================================

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )


            // ====================================================
            // AUTHENTICATION PROVIDER
            // ====================================================

            .authenticationProvider(
                authenticationProvider()
            )


            // ====================================================
            // JWT FILTER
            // ====================================================

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );


        return http.build();
    }


    // ============================================================
    // CORS CONFIGURATION
    // ============================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        // --------------------------------------------------------
        // FRONTEND ORIGIN
        // --------------------------------------------------------

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173")
        );


        // --------------------------------------------------------
        // HTTP METHODS
        // --------------------------------------------------------

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
            )
        );


        // --------------------------------------------------------
        // REQUEST HEADERS
        // --------------------------------------------------------

        configuration.setAllowedHeaders(
            List.of("*")
        );


        // --------------------------------------------------------
        // CREDENTIALS
        // --------------------------------------------------------

        configuration.setAllowCredentials(true);


        // --------------------------------------------------------
        // PREFLIGHT CACHE
        // --------------------------------------------------------

        configuration.setMaxAge(3600L);


        // --------------------------------------------------------
        // REGISTER CORS CONFIGURATION
        // --------------------------------------------------------

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }


    // ============================================================
    // PASSWORD ENCODER
    // ============================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // ============================================================
    // AUTHENTICATION PROVIDER
    // ============================================================

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                    userDetailsService
                );

        provider.setPasswordEncoder(
            passwordEncoder()
        );

        return provider;
    }


    // ============================================================
    // AUTHENTICATION MANAGER
    // ============================================================

    @Bean
    public AuthenticationManager authenticationManager() {

        return new ProviderManager(
            authenticationProvider()
        );
    }
}