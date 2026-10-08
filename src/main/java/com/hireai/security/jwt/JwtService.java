package com.hireai.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

@Service
public class JwtService {

    private static final Logger log =
            LoggerFactory.getLogger(JwtService.class);

    /*
     * JWT secret is loaded from application configuration.
     *
     * Do NOT hard-code the production secret in source code.
     *
     * Example:
     *
     * JWT_SECRET=your-long-random-secret
     */
    private final SecretKey key;


    /*
     * JWT expiration time in milliseconds.
     *
     * Default:
     * 86400000 ms = 24 hours
     *
     * Can be changed through configuration without modifying
     * Java source code.
     */
    private final long jwtExpirationMs;


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public JwtService(

            @Value("${jwt.secret}") String secret,

            @Value("${jwt.expiration-ms:86400000}")
            long jwtExpirationMs

    ) {

        if (secret == null || secret.isBlank()) {

            throw new IllegalStateException(
                    "JWT secret must not be empty"
            );
        }


        /*
         * HMAC-SHA256 requires a sufficiently long secret.
         *
         * 32 bytes = 256 bits.
         */
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {

            throw new IllegalStateException(
                    "JWT secret must be at least 32 bytes long"
            );
        }


        this.key =
                Keys.hmacShaKeyFor(
                        secret.getBytes(StandardCharsets.UTF_8)
                );


        if (jwtExpirationMs <= 0) {

            throw new IllegalStateException(
                    "JWT expiration must be greater than zero"
            );
        }


        this.jwtExpirationMs = jwtExpirationMs;
    }


    // ============================================================
    // GENERATE JWT
    // ============================================================

    /**
     * Generates a JWT token.
     *
     * Claims:
     *
     * - subject = user's email
     * - role = user's role
     * - issuedAt = token creation time
     * - expiration = configured expiration time
     */
    public String generateToken(
            String email,
            String role
    ) {

        Date issuedAt =
                new Date();


        Date expiration =
                new Date(
                        issuedAt.getTime()
                                + jwtExpirationMs
                );


        return Jwts.builder()

                .subject(email)

                .claim("role", role)

                .issuedAt(issuedAt)

                .expiration(expiration)

                .signWith(
                        key,
                        Jwts.SIG.HS256
                )

                .compact();
    }


    // ============================================================
    // EXTRACT USERNAME
    // ============================================================

    /**
     * Extracts the user's email from the JWT subject.
     */
    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }


    // ============================================================
    // EXTRACT ROLE
    // ============================================================

    /**
     * Extracts the user's role from the JWT.
     */
    public String extractRole(String token) {

        return extractClaim(
                token,
                claims -> claims.get(
                        "role",
                        String.class
                )
        );
    }


    // ============================================================
    // EXTRACT CLAIM
    // ============================================================

    /**
     * Extracts any requested claim from a signed JWT.
     *
     * The JWT signature is verified before claims are returned.
     */
    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver
    ) {

        Claims claims =
                Jwts.parser()

                        .verifyWith(key)

                        .build()

                        .parseSignedClaims(token)

                        .getPayload();


        return claimsResolver.apply(claims);
    }


    // ============================================================
    // VALIDATE TOKEN
    // ============================================================

    /**
     * Validates a JWT against the expected user's email.
     *
     * Validation includes:
     *
     * 1. Valid JWT signature
     * 2. Valid token structure
     * 3. Matching email
     * 4. Existing expiration
     * 5. Token has not expired
     */
    public boolean isTokenValid(
            String token,
            String email
    ) {

        try {

            Claims claims =
                    Jwts.parser()

                            .verifyWith(key)

                            .build()

                            .parseSignedClaims(token)

                            .getPayload();


            String tokenEmail =
                    claims.getSubject();


            Date expiration =
                    claims.getExpiration();


            return tokenEmail != null
                    && tokenEmail.equals(email)
                    && expiration != null
                    && expiration.after(new Date());


        } catch (Exception e) {

            /*
             * Do not expose the token or sensitive JWT contents
             * in logs.
             */
            log.debug(
                    "JWT validation failed: {}",
                    e.getMessage()
            );

            return false;
        }
    }
}