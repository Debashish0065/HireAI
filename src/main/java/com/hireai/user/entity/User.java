package com.hireai.user.entity;

import com.hireai.user.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String location;

    @Column(length = 200)
    private String headline;

    @Column(length = 2000)
    private String bio;

    @Column(length = 1000)
    private String profileImage;

    @Column(length = 500)
    private String linkedinUrl;

    @Column(length = 500)
    private String githubUrl;

    @Column(length = 500)
    private String portfolioUrl;

    @Column(name = "resume_url", length = 1000)
    private String resumeUrl;

    @Column
    private Integer experience;

    @Column(length = 2000)
    private String skills;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (role == null) {
            role = Role.CANDIDATE;
        }
    }

    // =========================
    // Spring Security Methods
    // =========================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null) {
            return List.of();
        }

        return List.of(
                () -> "ROLE_" + role.name()
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}