package com.internship.tool.service;

import com.internship.tool.dto.AuthRequest;
import com.internship.tool.dto.AuthResponse;
import com.internship.tool.dto.LoginRequest;
import com.internship.tool.entity.RefreshToken;
import com.internship.tool.entity.User;
import com.internship.tool.exception.ValidationException;
import com.internship.tool.repository.RefreshTokenRepository;
import com.internship.tool.repository.UserRepository;
import com.internship.tool.security.JwtUtil;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {
    private static final int REFRESH_DAYS = 14;

    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthServiceImpl(
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository) {
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    @Transactional
    public AuthResponse register(AuthRequest request) {
        if (request.username().isBlank() || request.password().isBlank()) {
            throw new ValidationException("Username and password are required");
        }
        if (userRepository.existsByUsernameIgnoreCaseAndDeletedFalse(request.username())) {
            throw new ValidationException("Username already taken");
        }
        if (userRepository.existsByEmailIgnoreCaseAndDeletedFalse(request.email())) {
            throw new ValidationException("Email already registered");
        }
        User user = new User();
        user.setUsername(request.username().trim());
        user.setEmail(request.email().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole("ROLE_USER");
        user = userRepository.save(user);
        return buildAuthResponse(user, issueRefreshToken(user));
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository
                .findByUsernameIgnoreCaseAndDeletedFalse(request.username().trim())
                .orElseThrow(() -> new ValidationException("Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ValidationException("Invalid credentials");
        }
        return buildAuthResponse(user, issueRefreshToken(user));
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshToken stored = refreshTokenRepository
                .findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> new ValidationException("Invalid refresh token"));
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevoked(true);
            refreshTokenRepository.save(stored);
            throw new ValidationException("Refresh token expired");
        }
        User user = stored.getUser();
        return buildAuthResponse(user, refreshToken);
    }

    private AuthResponse buildAuthResponse(User user, String refreshToken) {
        String access = jwtUtil.generateAccessToken(user.getUsername(), user.getRole());
        return new AuthResponse(access, refreshToken, user.getRole());
    }

    private String issueRefreshToken(User user) {
        String raw = UUID.randomUUID().toString();
        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setToken(raw);
        rt.setExpiresAt(Instant.now().plus(REFRESH_DAYS, ChronoUnit.DAYS));
        rt.setRevoked(false);
        refreshTokenRepository.save(rt);
        return raw;
    }
}
