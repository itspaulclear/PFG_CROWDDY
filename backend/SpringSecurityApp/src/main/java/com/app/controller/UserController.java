package com.app.controller;

import com.app.persistence.entity.UserEntity;
import com.app.persistence.entity.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;

    @DeleteMapping("/{username}/notifications/{index}")
    @Operation(
        summary = "Delete notification",
        description = "Delete a specific notification by index for a user",
        tags = {"User Management"},
        parameters = {
            @Parameter(
                name = "username",
                description = "Username of the user",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "index",
                description = "Index of the notification to delete",
                required = true,
                schema = @Schema(type = "integer")
            )
        },
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Notification deleted successfully",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Invalid notification index",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "404",
                description = "User not found",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(mediaType = "application/json")
            )
        }
    )
    public ResponseEntity<?> deleteNotification(
            @PathVariable String username,
            @PathVariable int index) {
        
        try {
            Optional<UserEntity> userOpt = userRepository.findUserEntityByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado"
                ));
            }
            
            UserEntity user = userOpt.get();
            List<String> notifications = user.getNotifications();
            
            if (index < 0 || index >= notifications.size()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Índice de notificación inválido"
                ));
            }
            
            notifications.remove(index);
            userRepository.save(user);
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "Notificación eliminada correctamente"
            ));
            
        } catch (Exception e) {
            System.err.println("Error al eliminar notificación: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error al eliminar la notificación: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/decrement-requested-favours")
    @Operation(
        summary = "Decrement requested favours",
        description = "Decrement the requested favours counter for a user",
        tags = {"User Management"},
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Request containing username",
            required = true,
            content = @Content(
                mediaType = "application/json"
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Requested favours decremented successfully",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Username is required",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "404",
                description = "User not found",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(mediaType = "application/json")
            )
        }
    )
    public ResponseEntity<?> decrementRequestedFavours(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "El nombre de usuario es requerido"
            ));
        }
        
        try {
            Optional<UserEntity> userOpt = userRepository.findUserEntityByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado"
                ));
            }
            
            UserEntity user = userOpt.get();
            int newRequestedFavours = Math.max(0, user.getRequestedFavours() - 1);
            user.setRequestedFavours(newRequestedFavours);
            
            userRepository.save(user);
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "username", user.getUsername(),
                "requestedFavours", newRequestedFavours
            ));
            
        } catch (Exception e) {
            System.err.println("Error al decrementar favores solicitados: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error al actualizar el contador de favores solicitados: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/increment-requested-favours")
    @Operation(
        summary = "Increment requested favours",
        description = "Increment the requested favours counter for a user",
        tags = {"User Management"},
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Request containing username",
            required = true,
            content = @Content(
                mediaType = "application/json"
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Requested favours incremented successfully",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Username is required",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "404",
                description = "User not found",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(mediaType = "application/json")
            )
        }
    )
    public ResponseEntity<?> incrementRequestedFavours(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "El nombre de usuario es requerido"
            ));
        }
        
        try {
            Optional<UserEntity> userOpt = userRepository.findUserEntityByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado"
                ));
            }
            
            UserEntity user = userOpt.get();
            int newRequestedFavours = user.getRequestedFavours() + 1;
            user.setRequestedFavours(newRequestedFavours);
            
            userRepository.save(user);
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "username", user.getUsername(),
                "requestedFavours", newRequestedFavours
            ));
            
        } catch (Exception e) {
            System.err.println("Error al incrementar favores solicitados: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error al actualizar el contador de favores solicitados: " + e.getMessage()
            ));
        }
    }
    
    @PutMapping("/increment-favours")
    @Operation(
        summary = "Increment done favours",
        description = "Increment the done favours counter for a target user",
        tags = {"User Management"},
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Request containing target username",
            required = true,
            content = @Content(
                mediaType = "application/json"
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Done favours incremented successfully",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Target username is required",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "404",
                description = "User not found",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(mediaType = "application/json")
            )
        }
    )
    public ResponseEntity<?> incrementDoneFavours(@RequestBody Map<String, String> request) {
        String targetUsername = request.get("targetUsername");
        
        if (targetUsername == null || targetUsername.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "El nombre de usuario del destinatario es requerido"
            ));
        }
        
        try {
            Optional<UserEntity> userOpt = userRepository.findUserEntityByUsername(targetUsername);
            
            if (userOpt.isEmpty()) {
                System.out.println("Usuario no encontrado: " + targetUsername);
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado"
                ));
            }
            
            UserEntity user = userOpt.get();
            
            int newFavours = user.getDoneFavours() + 1;
            
            user.setDoneFavours(newFavours);
            
            userRepository.save(user);
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "username", user.getUsername(),
                "doneFavours", newFavours
            ));
            
        } catch (Exception e) {
            System.err.println("Error en incrementDoneFavours: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error al actualizar favores realizados: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/{username}/notifications")
    @Operation(
        summary = "Get user notifications",
        description = "Retrieve all notifications for a specific user",
        tags = {"User Management"},
        parameters = {
            @Parameter(
                name = "username",
                description = "Username of the user",
                required = true,
                schema = @Schema(type = "string")
            )
        },
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Notifications retrieved successfully",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "404",
                description = "User not found",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(mediaType = "application/json")
            )
        }
    )
    public ResponseEntity<?> getNotifications(@PathVariable String username) {
        try {
            Optional<UserEntity> userOpt = userRepository.findUserEntityByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado"
                ));
            }
            
            UserEntity user = userOpt.get();
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "notifications", user.getNotifications()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error al obtener notificaciones: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/{username}/notifications")
    @Operation(
        summary = "Add notification",
        description = "Add a new notification to a user's notification list",
        tags = {"User Management"},
        parameters = {
            @Parameter(
                name = "username",
                description = "Username of the user",
                required = true,
                schema = @Schema(type = "string")
            )
        },
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Notification message",
            required = true,
            content = @Content(
                mediaType = "application/json"
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Notification added successfully",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "400",
                description = "Message cannot be empty",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "404",
                description = "User not found",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(mediaType = "application/json")
            )
        }
    )
    public ResponseEntity<?> addNotification(
            @PathVariable String username,
            @RequestBody Map<String, String> request) {
        
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El nombre de usuario no puede estar vacío"
                ));
            }
            
            Optional<UserEntity> userOpt = userRepository.findUserEntityByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado"
                ));
            }
            
            UserEntity user = userOpt.get();
            String message = request.get("message");
            
            if (message == null || message.trim().isEmpty()) {
                System.out.println("Error: Mensaje vacío");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El mensaje no puede estar vacío"
                ));
            }
            
            try {
                user.addNotification(message);
                user = userRepository.save(user);
                
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "Notificación agregada correctamente"
                ));
                
            } catch (Exception e) {
                System.err.println("Error al guardar la notificación: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
            
        } catch (Exception e) {
            System.err.println("Error en addNotification: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error interno del servidor: " + e.getMessage(),
                "errorType", e.getClass().getName()
            ));
        }
    }
    
    @PostMapping("/addMessage")
    @Operation(
        summary = "Add message",
        description = "Add a message to a user",
        tags = {"User Management"},
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Message information",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AddMessageRequest.class)
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Message saved successfully",
                content = @Content(mediaType = "application/json")
            ),
            @ApiResponse(
                responseCode = "400",
                description = "User not found or error saving message",
                content = @Content(mediaType = "application/json")
            )
        }
    )
    public ResponseEntity<?> addMessage(@RequestBody AddMessageRequest request) {
        try {
            UserEntity user = userRepository.findById(request.getUserId()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Usuario no encontrado"
                ));
            }

            user.addMessage(request.getMessage());
            userRepository.save(user);

            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "Mensaje guardado exitosamente"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error al guardar el mensaje: " + e.getMessage()
            ));
        }
    }
}

class AddMessageRequest {
    private Long userId;
    private String message;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}