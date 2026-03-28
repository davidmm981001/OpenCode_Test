package com.softfab.seguridad.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Map;

import com.softfab.seguridad.common.BusinessException;
import com.softfab.seguridad.config.JwtProperties;
import com.softfab.seguridad.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock AuthUserRepository authUserRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock JwtProperties jwtProperties;
    @InjectMocks AuthService authService;

    @Test
    void login_should_return_token_when_credentials_are_valid() {
        AuthUserEntity user = new AuthUserEntity(1L, "admin", "hash", "Admin", true, "ROLE_ADMIN");
        when(authUserRepository.findByUsernameAndActiveTrue("admin")).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches("admin123", "hash")).thenReturn(true);
        when(jwtService.generateToken("admin", Map.of("fullName", "Admin", "roles", "ROLE_ADMIN"))).thenReturn("token");

        LoginResponse response = authService.login(new LoginRequest("admin", "admin123"));

        assertEquals("token", response.token());
        assertEquals("admin", response.username());
    }

    @Test
    void login_should_fail_when_password_is_invalid() {
        AuthUserEntity user = new AuthUserEntity(1L, "admin", "hash", "Admin", true, "ROLE_ADMIN");
        when(authUserRepository.findByUsernameAndActiveTrue("admin")).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThrows(BusinessException.class, () -> authService.login(new LoginRequest("admin", "wrong")));
    }
}
