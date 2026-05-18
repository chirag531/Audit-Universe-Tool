package com.internship.tool.security;

import com.internship.tool.repository.UserRepository;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        var entity = userRepository
                .findByUsernameIgnoreCaseAndDeletedFalse(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        String role = entity.getRole() != null && entity.getRole().startsWith("ROLE_")
                ? entity.getRole()
                : "ROLE_" + entity.getRole();
        return new User(entity.getUsername(), entity.getPasswordHash(), List.of(new SimpleGrantedAuthority(role)));
    }
}
