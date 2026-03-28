package com.softfab.seguridad.auth;

import java.util.Map;

import jakarta.validation.Valid;
import com.softfab.seguridad.common.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthUserRepository authUserRepository;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public SessionUserDto me(Authentication authentication) {
        AuthUserEntity user = authUserRepository.findByUsernameAndActiveTrue(authentication.getName())
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado"));
        return new SessionUserDto(user.getUsername(), user.getFullName(), user.getRoles());
    }

    @PostMapping("/logout")
    public Map<String, String> logout() {
        return Map.of("message", "Sesión cerrada");
    }
}
