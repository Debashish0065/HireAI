package com.hireai.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireai.admin.dto.response.AdminDashboardResponse;
import com.hireai.admin.dto.response.AdminUserResponse;
import com.hireai.admin.service.AdminService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private AdminService adminService;

    @InjectMocks
    private AdminController adminController;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;


    @BeforeEach
    void setUp() {

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(adminController)
                        .build();

        objectMapper =
                new ObjectMapper();

        objectMapper.findAndRegisterModules();
    }


    // =========================================================
    // DASHBOARD - SUCCESS
    // =========================================================

    @Test
    void dashboard_ShouldReturn200_WhenSuccessful()
            throws Exception {

        AdminDashboardResponse response =
                createDashboardResponse();

        when(adminService.getDashboard())
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/admin/dashboard")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalUsers")
                .value(100))
        .andExpect(jsonPath("$.totalCandidates")
                .value(70))
        .andExpect(jsonPath("$.totalHR")
                .value(25))
        .andExpect(jsonPath("$.totalAdmins")
                .value(5))
        .andExpect(jsonPath("$.totalJobs")
                .value(50))
        .andExpect(jsonPath("$.openJobs")
                .value(40))
        .andExpect(jsonPath("$.closedJobs")
                .value(10))
        .andExpect(jsonPath("$.totalApplications")
                .value(200))
        .andExpect(jsonPath("$.totalResumes")
                .value(80))
        .andExpect(jsonPath("$.totalJobMatches")
                .value(150))
        .andExpect(jsonPath("$.averageMatchScore")
                .value(78.5));
    }


    // =========================================================
    // DASHBOARD - SERVICE CALLED
    // =========================================================

    @Test
    void dashboard_ShouldCallAdminService()
            throws Exception {

        when(adminService.getDashboard())
                .thenReturn(
                        createDashboardResponse()
                );

        mockMvc.perform(
                get("/api/v1/admin/dashboard")
        )
        .andExpect(status().isOk());

        verify(adminService)
                .getDashboard();
    }


    // =========================================================
    // GET ALL USERS - SUCCESS
    // =========================================================

    @Test
    void getAllUsers_ShouldReturn200()
            throws Exception {

        when(adminService.getAllUsers())
                .thenReturn(
                        List.of(
                                createUserResponse(1L),
                                createUserResponse(2L),
                                createUserResponse(3L)
                        )
                );

        mockMvc.perform(
                get("/api/v1/admin/users")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(3))
        .andExpect(jsonPath("$[0].id")
                .value(1))
        .andExpect(jsonPath("$[0].email")
                .value("user@hireai.com"));
    }


    // =========================================================
    // GET ALL USERS - EMPTY
    // =========================================================

    @Test
    void getAllUsers_ShouldReturnEmptyList_WhenNoUsers()
            throws Exception {

        when(adminService.getAllUsers())
                .thenReturn(List.of());

        mockMvc.perform(
                get("/api/v1/admin/users")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()")
                .value(0));

        verify(adminService)
                .getAllUsers();
    }


    // =========================================================
    // GET USER BY ID - SUCCESS
    // =========================================================

    @Test
    void getUserById_ShouldReturn200_WhenUserExists()
            throws Exception {

        when(adminService.getUserById(10L))
                .thenReturn(
                        createUserResponse(10L)
                );

        mockMvc.perform(
                get("/api/v1/admin/users/10")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(10))
        .andExpect(jsonPath("$.firstName")
                .value("John"))
        .andExpect(jsonPath("$.lastName")
                .value("Doe"))
        .andExpect(jsonPath("$.email")
                .value("user@hireai.com"))
        .andExpect(jsonPath("$.role")
                .value("CANDIDATE"));
    }


    // =========================================================
    // GET USER BY ID - SERVICE CALLED
    // =========================================================

    @Test
    void getUserById_ShouldCallAdminService()
            throws Exception {

        when(adminService.getUserById(20L))
                .thenReturn(
                        createUserResponse(20L)
                );

        mockMvc.perform(
                get("/api/v1/admin/users/20")
        )
        .andExpect(status().isOk());

        verify(adminService)
                .getUserById(20L);
    }


    // =========================================================
    // DELETE USER - SUCCESS
    // =========================================================

    @Test
    void deleteUser_ShouldReturn200_WhenSuccessful()
            throws Exception {

        mockMvc.perform(
                delete("/api/v1/admin/users/30")
        )
        .andExpect(status().isOk())
        .andExpect(content().string(
                "User deleted successfully"
        ));

        verify(adminService)
                .deleteUser(30L);
    }


    // =========================================================
    // DELETE USER - ANOTHER ID
    // =========================================================

    @Test
    void deleteUser_ShouldCallServiceWithCorrectId()
            throws Exception {

        mockMvc.perform(
                delete("/api/v1/admin/users/99")
        )
        .andExpect(status().isOk())
        .andExpect(content().string(
                "User deleted successfully"
        ));

        verify(adminService)
                .deleteUser(99L);
    }


    // =========================================================
    // COMPLETE USER RESPONSE
    // =========================================================

    @Test
    void getUserById_ShouldReturnCompleteUserData()
            throws Exception {

        AdminUserResponse response =
                AdminUserResponse.builder()
                        .id(100L)
                        .firstName("Debashis")
                        .lastName("Developer")
                        .email("debashis@hireai.com")
                        .role("CANDIDATE")
                        .phone("9876543210")
                        .location("Bhubaneswar")
                        .headline("Java Backend Developer")
                        .experience(1)
                        .createdAt(
                                LocalDateTime.of(
                                        2026,
                                        8,
                                        1,
                                        10,
                                        30
                                )
                        )
                        .build();

        when(adminService.getUserById(100L))
                .thenReturn(response);

        mockMvc.perform(
                get("/api/v1/admin/users/100")
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id")
                .value(100))
        .andExpect(jsonPath("$.firstName")
                .value("Debashis"))
        .andExpect(jsonPath("$.lastName")
                .value("Developer"))
        .andExpect(jsonPath("$.email")
                .value("debashis@hireai.com"))
        .andExpect(jsonPath("$.role")
                .value("CANDIDATE"))
        .andExpect(jsonPath("$.phone")
                .value("9876543210"))
        .andExpect(jsonPath("$.location")
                .value("Bhubaneswar"))
        .andExpect(jsonPath("$.headline")
                .value("Java Backend Developer"))
        .andExpect(jsonPath("$.experience")
                .value(1));
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private AdminDashboardResponse
    createDashboardResponse() {

        return AdminDashboardResponse.builder()

                .totalUsers(100)

                .totalCandidates(70)

                .totalHR(25)

                .totalAdmins(5)

                .totalJobs(50)

                .openJobs(40)

                .closedJobs(10)

                .totalApplications(200)

                .appliedApplications(80)

                .shortlistedApplications(40)

                .interviewApplications(30)

                .hiredApplications(20)

                .rejectedApplications(30)

                .totalResumes(80)

                .totalJobMatches(150)

                .averageMatchScore(78.5)

                .build();
    }


    private AdminUserResponse
    createUserResponse(Long id) {

        return AdminUserResponse.builder()

                .id(id)

                .firstName("John")

                .lastName("Doe")

                .email("user@hireai.com")

                .role("CANDIDATE")

                .phone("9876543210")

                .location("Bhubaneswar")

                .headline("Java Developer")

                .experience(1)

                .createdAt(
                        LocalDateTime.of(
                                2026,
                                8,
                                1,
                                10,
                                30
                        )
                )

                .build();
    }
}