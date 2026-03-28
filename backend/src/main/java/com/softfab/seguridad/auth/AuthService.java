package com.softfab.seguridad.auth;

import java.util.Map;

import com.softfab.seguridad.common.BusinessException;
import com.softfab.seguridad.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        AuthUserEntity user = authUserRepository.findByUsernameAndActiveTrue(request.username())
                .orElseThrow(() -> new BusinessException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(user.getUsername(), Map.of(
                "fullName", user.getFullName(),
                "roles", user.getRoles()
        ));

        return new LoginResponse(token, user.getUsername(), user.getFullName(), user.getRoles());
    }
}
