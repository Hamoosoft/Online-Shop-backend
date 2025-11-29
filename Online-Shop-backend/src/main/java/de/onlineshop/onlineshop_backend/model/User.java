package de.onlineshop.onlineshop_backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User implements UserDetails {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email; // Login-Name

    @Column(nullable = false)
    private String password; // gehasht

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    // --- JPA benötigt einen Default-Konstruktor ---
    public User() {
    }

    public User(String name, String email, String password, Role role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // --- Getter/Setter ---

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    // --- UserDetails-Methoden ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // z.B. "ROLE_USER" oder "ROLE_ADMIN"
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /**
     * Spring Security verwendet getUsername() für den Login-Namen.
     * In deinem Fall ist das die E-Mail.
     */
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // ggf. später Logik einbauen
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // ggf. später Logik einbauen
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // ggf. später Logik einbauen
    }

    @Override
    public boolean isEnabled() {
        return true; // ggf. z.B. "activated" Feld nutzen
    }
}
