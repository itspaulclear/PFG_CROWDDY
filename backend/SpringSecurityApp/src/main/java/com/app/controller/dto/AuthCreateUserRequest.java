package com.app.controller.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record AuthCreateUserRequest(
    @NotBlank String username,
    @NotBlank String password,
    @Valid AuthCreateRoleRequest roleRequest,
    String name,
    String surname,
    String picture,
    String bio,
    String interests,
    String location,
    LocalDate birthday
) {
    public AuthCreateUserRequest {
        if (picture == null) picture = "";
        if (bio == null) bio = "";
        if (interests == null) interests = "";
        if (location == null) location = "";
    }
}
