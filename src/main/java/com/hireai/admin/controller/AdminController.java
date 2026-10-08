package com.hireai.admin.controller;

import com.hireai.admin.dto.response.AdminDashboardResponse;
import com.hireai.admin.dto.response.AdminUserResponse;
import com.hireai.admin.service.AdminService;

import jakarta.validation.constraints.Positive;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminController {

    private final AdminService adminService;


    public AdminController(
            AdminService adminService) {

        this.adminService =
                adminService;
    }


    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================
    // GET /api/v1/admin/dashboard
    // =========================================================

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard() {

        return adminService.getDashboard();
    }


    // =========================================================
    // GET ALL USERS
    // =========================================================
    // GET /api/v1/admin/users
    // =========================================================

    @GetMapping("/users")
    public List<AdminUserResponse> getAllUsers() {

        return adminService.getAllUsers();
    }


    // =========================================================
    // GET USER BY ID
    // =========================================================
    // GET /api/v1/admin/users/{id}
    // =========================================================

    @GetMapping("/users/{id}")
    public AdminUserResponse getUserById(

            @PathVariable
            @Positive(message = "User ID must be positive")
            Long id

    ) {

        return adminService.getUserById(id);
    }


    // =========================================================
    // DELETE USER
    // =========================================================
    // DELETE /api/v1/admin/users/{id}
    // =========================================================

    @DeleteMapping("/users/{id}")
    public String deleteUser(

            @PathVariable
            @Positive(message = "User ID must be positive")
            Long id

    ) {

        adminService.deleteUser(id);

        return "User deleted successfully";
    }
}