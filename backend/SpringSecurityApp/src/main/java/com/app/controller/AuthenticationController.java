package com.app.controller;

import com.app.controller.dto.AuthCreateUserRequest;
import com.app.controller.dto.AuthLoginRequest;
import com.app.controller.dto.AuthResponse;
import com.app.service.UserDetailServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Controller for Authentication")
public class AuthenticationController {
    
    @Autowired
    private UserDetailServiceImpl userDetailService;

    @PostMapping("/sign-up")
    @Operation(
        summary = "Register User",
        description = "Register a user in the CROWDDY database system",
        tags = {"Authentication"},
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Register request with personal data",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthCreateUserRequest.class)
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "201",
                description = "User successfully registered",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AuthResponse.class)
                )
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid input data",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "409",
                description = "User already exists",
                content = @Content(mediaType = "application/json")
            )
        }
    )
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid AuthCreateUserRequest authCreateUser) {
        return new ResponseEntity<>(this.userDetailService.createUser(authCreateUser), HttpStatus.CREATED);
    }

    @PostMapping("/log-in")
    @Operation(
        summary = "User Login",
        description = "Authenticate user and return JWT token",
        tags = {"Authentication"},
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Login credentials",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthLoginRequest.class)
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Successful authentication",
                content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AuthResponse.class)
                )
            ),
            @ApiResponse(
                responseCode = "401",
                description = "Invalid credentials",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid input data",
                content = @Content(mediaType = "application/json")
            )
        }
    )
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid AuthLoginRequest userRequest) {
        return new ResponseEntity<>(this.userDetailService.loginUser(userRequest), HttpStatus.OK);
    }
}