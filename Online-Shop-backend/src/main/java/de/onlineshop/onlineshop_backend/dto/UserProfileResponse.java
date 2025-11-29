package de.onlineshop.onlineshop_backend.dto;

import de.onlineshop.onlineshop_backend.model.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserProfileResponse {
    private String name;
    private String email;
    private String role;

    public static UserProfileResponse fromUser(User user) {
        return new UserProfileResponse(
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
