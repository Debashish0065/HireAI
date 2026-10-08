package com.hireai.admin.service;

import com.hireai.admin.dto.response.AdminDashboardResponse;
import com.hireai.admin.dto.response.AdminUserResponse;

import java.util.List;

public interface AdminService {

    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    AdminDashboardResponse getDashboard();


    // =========================================================
    // GET ALL USERS
    // =========================================================

    List<AdminUserResponse> getAllUsers();


    // =========================================================
    // GET USER BY ID
    // =========================================================

    AdminUserResponse getUserById(Long id);


    // =========================================================
    // DELETE USER
    // =========================================================

    void deleteUser(Long id);
}