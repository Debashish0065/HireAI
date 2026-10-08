package com.hireai.audit.service.impl;

import com.hireai.audit.dto.response.AuditLogResponse;
import com.hireai.audit.entity.AuditLog;
import com.hireai.audit.enums.AuditAction;
import com.hireai.audit.repository.AuditLogRepository;
import com.hireai.user.entity.User;
import com.hireai.user.enums.Role;
import com.hireai.user.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuditLogServiceImpl auditLogService;

    private User user;
    private AuditLog auditLog;

    @BeforeEach
    void setUp() {

        user = User.builder()
                .id(1L)
                .firstName("Debashis")
                .lastName("Satapathy")
                .email("admin@hireai.com")
                .role(Role.ADMIN)
                .build();

        auditLog = AuditLog.builder()
                .id(100L)
                .user(user)
                .action(AuditAction.LOGIN)
                .description("User logged in successfully")
                .ipAddress("127.0.0.1")
                .createdAt(LocalDateTime.now())
                .build();
    }

    // =========================================================
    // CREATE AUDIT LOG
    // =========================================================

    @Test
    void createAuditLog_shouldCreateSuccessfully() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(auditLogRepository.save(any(AuditLog.class)))
                .thenReturn(auditLog);

        AuditLogResponse response =
                auditLogService.createAuditLog(
                        1L,
                        AuditAction.LOGIN,
                        "User logged in successfully",
                        "127.0.0.1"
                );

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(1L, response.getUserId());
        assertEquals("Debashis Satapathy", response.getUserName());
        assertEquals("admin@hireai.com", response.getUserEmail());
        assertEquals("LOGIN", response.getAction());
        assertEquals(
                "User logged in successfully",
                response.getDescription()
        );
        assertEquals("127.0.0.1", response.getIpAddress());
        assertNotNull(response.getCreatedAt());

        verify(userRepository).findById(1L);
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    // =========================================================
    // CREATE - USER ID VALIDATION
    // =========================================================

    @Test
    void createAuditLog_shouldRejectNullUserId() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.createAuditLog(
                                null,
                                AuditAction.LOGIN,
                                "Test audit",
                                "127.0.0.1"
                        )
                );

        assertEquals(
                "User ID must be a positive number.",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
        verifyNoInteractions(auditLogRepository);
    }

    @Test
    void createAuditLog_shouldRejectZeroUserId() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.createAuditLog(
                                0L,
                                AuditAction.LOGIN,
                                "Test audit",
                                "127.0.0.1"
                        )
                );

        assertEquals(
                "User ID must be a positive number.",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
        verifyNoInteractions(auditLogRepository);
    }

    @Test
    void createAuditLog_shouldRejectNegativeUserId() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.createAuditLog(
                                -1L,
                                AuditAction.LOGIN,
                                "Test audit",
                                "127.0.0.1"
                        )
                );

        assertEquals(
                "User ID must be a positive number.",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
        verifyNoInteractions(auditLogRepository);
    }

    // =========================================================
    // CREATE - ACTION VALIDATION
    // =========================================================

    @Test
    void createAuditLog_shouldRejectNullAction() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.createAuditLog(
                                1L,
                                null,
                                "Test audit",
                                "127.0.0.1"
                        )
                );

        assertEquals(
                "Audit action is required.",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
        verifyNoInteractions(auditLogRepository);
    }

    // =========================================================
    // CREATE - DESCRIPTION VALIDATION
    // =========================================================

    @Test
    void createAuditLog_shouldRejectNullDescription() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.createAuditLog(
                                1L,
                                AuditAction.LOGIN,
                                null,
                                "127.0.0.1"
                        )
                );

        assertEquals(
                "Audit description is required.",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
        verifyNoInteractions(auditLogRepository);
    }

    @Test
    void createAuditLog_shouldRejectBlankDescription() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.createAuditLog(
                                1L,
                                AuditAction.LOGIN,
                                "   ",
                                "127.0.0.1"
                        )
                );

        assertEquals(
                "Audit description is required.",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
        verifyNoInteractions(auditLogRepository);
    }

    // =========================================================
    // CREATE - USER NOT FOUND
    // =========================================================

    @Test
    void createAuditLog_shouldRejectUnknownUser() {

        when(userRepository.findById(999L))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.createAuditLog(
                                999L,
                                AuditAction.LOGIN,
                                "Test audit",
                                "127.0.0.1"
                        )
                );

        assertEquals(
                "User not found with id: 999",
                exception.getMessage()
        );

        verify(userRepository).findById(999L);
        verify(auditLogRepository, never())
                .save(any(AuditLog.class));
    }

    // =========================================================
    // GET ALL AUDIT LOGS
    // =========================================================

    @Test
    void getAllAuditLogs_shouldReturnLogs() {

        when(auditLogRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of(auditLog));

        List<AuditLogResponse> response =
                auditLogService.getAllAuditLogs();

        assertNotNull(response);
        assertEquals(1, response.size());

        AuditLogResponse result = response.get(0);

        assertEquals(100L, result.getId());
        assertEquals("LOGIN", result.getAction());
        assertEquals("admin@hireai.com", result.getUserEmail());

        verify(auditLogRepository)
                .findAllByOrderByCreatedAtDesc();
    }

    @Test
    void getAllAuditLogs_shouldReturnEmptyListWhenNoLogsExist() {

        when(auditLogRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of());

        List<AuditLogResponse> response =
                auditLogService.getAllAuditLogs();

        assertNotNull(response);
        assertTrue(response.isEmpty());

        verify(auditLogRepository)
                .findAllByOrderByCreatedAtDesc();
    }

    // =========================================================
    // GET AUDIT LOG BY ID
    // =========================================================

    @Test
    void getAuditLogById_shouldReturnLog() {

        when(auditLogRepository.findById(100L))
                .thenReturn(Optional.of(auditLog));

        AuditLogResponse response =
                auditLogService.getAuditLogById(100L);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("LOGIN", response.getAction());

        verify(auditLogRepository).findById(100L);
    }

    @Test
    void getAuditLogById_shouldRejectInvalidId() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.getAuditLogById(0L)
                );

        assertEquals(
                "ID must be a positive number.",
                exception.getMessage()
        );

        verifyNoInteractions(auditLogRepository);
    }

    @Test
    void getAuditLogById_shouldRejectNullId() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.getAuditLogById(null)
                );

        assertEquals(
                "ID must be a positive number.",
                exception.getMessage()
        );

        verifyNoInteractions(auditLogRepository);
    }

    @Test
    void getAuditLogById_shouldThrowWhenLogDoesNotExist() {

        when(auditLogRepository.findById(999L))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.getAuditLogById(999L)
                );

        assertEquals(
                "Audit log not found with id: 999",
                exception.getMessage()
        );

        verify(auditLogRepository).findById(999L);
    }

    // =========================================================
    // GET LOGS BY USER
    // =========================================================

    @Test
    void getLogsByUser_shouldReturnUserLogs() {

        when(userRepository.findById(1L))
                .thenReturn(Optional.of(user));

        when(auditLogRepository
                .findByUserOrderByCreatedAtDesc(user))
                .thenReturn(List.of(auditLog));

        List<AuditLogResponse> response =
                auditLogService.getLogsByUser(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(100L, response.get(0).getId());
        assertEquals("LOGIN", response.get(0).getAction());

        verify(userRepository).findById(1L);
        verify(auditLogRepository)
                .findByUserOrderByCreatedAtDesc(user);
    }

    @Test
    void getLogsByUser_shouldRejectInvalidUserId() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.getLogsByUser(0L)
                );

        assertEquals(
                "User ID must be a positive number.",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
        verifyNoInteractions(auditLogRepository);
    }

    @Test
    void getLogsByUser_shouldThrowWhenUserDoesNotExist() {

        when(userRepository.findById(999L))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.getLogsByUser(999L)
                );

        assertEquals(
                "User not found with id: 999",
                exception.getMessage()
        );

        verify(userRepository).findById(999L);

        verify(
                auditLogRepository,
                never()
        ).findByUserOrderByCreatedAtDesc(any(User.class));
    }

    // =========================================================
    // GET LOGS BY ACTION
    // =========================================================

    @Test
    void getLogsByAction_shouldReturnMatchingLogs() {

        when(auditLogRepository.findByAction(AuditAction.LOGIN))
                .thenReturn(List.of(auditLog));

        List<AuditLogResponse> response =
                auditLogService.getLogsByAction(
                        AuditAction.LOGIN
                );

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals(
                "LOGIN",
                response.get(0).getAction()
        );

        verify(auditLogRepository)
                .findByAction(AuditAction.LOGIN);
    }

    @Test
    void getLogsByAction_shouldReturnEmptyListWhenNoLogsExist() {

        when(auditLogRepository.findByAction(AuditAction.LOGOUT))
                .thenReturn(List.of());

        List<AuditLogResponse> response =
                auditLogService.getLogsByAction(
                        AuditAction.LOGOUT
                );

        assertNotNull(response);
        assertTrue(response.isEmpty());

        verify(auditLogRepository)
                .findByAction(AuditAction.LOGOUT);
    }

    @Test
    void getLogsByAction_shouldRejectNullAction() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> auditLogService.getLogsByAction(null)
                );

        assertEquals(
                "Audit action is required.",
                exception.getMessage()
        );

        verifyNoInteractions(auditLogRepository);
    }
}