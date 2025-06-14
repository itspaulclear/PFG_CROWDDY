package com.app.controller;

import com.app.persistence.entity.UserEntity;
import com.app.service.UserDetailServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/method")
@ResponseBody
public class TestAuthController {
	@Autowired
	private UserDetailServiceImpl userDetailsService;

	@GetMapping("/get")
    @Operation(
        summary = "Get all users",
        description = "Retrieve a list of all users in the CROWDDY system",
        tags = {"User Management"},
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "All users retrieved succesfully",
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
	public List<UserEntity> getUsers() {
		return userDetailsService.getUsers();
	}
	// Gestionado por AuthenticationController
	/*
	@PostMapping("/post")
	public String helloPost(){
		return "Hello World - POST";
	}
	*/

    @PutMapping("/update/{username}")
    @Operation(
        summary = "Update user contacts",
        description = "Add a new contact to a user's contact list",
        tags = {"User Management"},
        parameters = {
            @Parameter(
                name = "username",
                description = "Username of the user to update",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "selected contact",
                description = "Selected contact to update",
                required = true,
                schema = @Schema(type = "User Entity")
            )
        },
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Contact information to add",
            required = true,
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = UserEntity.class)
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Contact added successfully",
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
    public ResponseEntity<Map<String, Object>> updateContacts(
            @PathVariable String username, 
            @RequestBody UserEntity selectedContact) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<UserEntity> existingUser = userDetailsService.findUsername(username);

            if (existingUser.isEmpty()) {
                response.put("message", "Usuario no encontrado.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            UserEntity user = existingUser.get();
            
            userDetailsService.userUpdate(user, selectedContact);
            
            UserEntity updatedUser = userDetailsService.findUsername(username)
                .orElseThrow(() -> new RuntimeException("Error al cargar el usuario actualizado"));

            response.put("message", "Contacto agregado exitosamente");
            response.put("user", updatedUser);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("message", "Error al actualizar el contacto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/update-profile/{userId}")
    @Operation(
        summary = "Update user profile",
        description = "Update a user's profile",
        tags = {"User Management"},
        parameters = {
            @Parameter(
                name = "user ID",
                description = "User ID of the user to update",
                required = true,
                schema = @Schema(type = "long")
            )
        },
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "User information to add",
            required = true,
            content = @Content(
                mediaType = "application/json"
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Profile updated successfully",
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
    public ResponseEntity<Map<String, Object>> updateUserProfile(
            @PathVariable Long userId, 
            @RequestBody UserEntity userUpdates) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<UserEntity> existingUser = userDetailsService.findById(userId);
            
            if (existingUser.isEmpty()) {
                response.put("message", "Usuario con ID " + userId + " no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            UserEntity updatedUser = userDetailsService.updateUserById(userId, userUpdates);
            
            response.put("message", "Perfil actualizado exitosamente");
            response.put("user", updatedUser);
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Error de argumento: " + e.getMessage());
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            System.err.println("Error al actualizar el perfil: " + e.getMessage());
            e.printStackTrace();
            response.put("message", "Error al actualizar el perfil: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


	@PostMapping("/register")
    @Operation(
        summary = "Registration",
        description = "Register a user",
        tags = {"User Management"},
        parameters = {
            @Parameter(
                name = "username",
                description = "Username of the user to register",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "password",
                description = "password of the user to register",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "name",
                description = "Name of the user to register",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "surname",
                description = "Surname of the user to register",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "picture",
                description = "Picture of the user to register",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "bio",
                description = "Bio of the user to register",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "interests",
                description = "Interests of the user to register",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "location",
                description = "Location of the user to register",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "requestedFavours",
                description = "Requested favours of the user to register",
                required = true,
                schema = @Schema(type = "int")
            ),
            @Parameter(
                name = "doneFavours",
                description = "Done Favours of the user to register",
                required = true,
                schema = @Schema(type = "string")
            ),
            @Parameter(
                name = "birthday",
                description = "Birthday of the user to register",
                required = true,
                schema = @Schema(type = "LocalDate")
            )
        },
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Contact added successfully",
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
	public ResponseEntity<String> registerUser(@RequestParam String username, @RequestParam String password, @RequestParam String name, @RequestParam String surname, @RequestParam String picture, @RequestParam String bio, @RequestParam String interests, @RequestParam String location, @RequestParam int requestedFavours, @RequestParam int doneFavours, @RequestParam LocalDate birthday) {
		Optional<UserEntity> existingUser = userDetailsService.findUsername(username);
		if (existingUser.isPresent()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El usuario ya existe.");
		}

		String response = userDetailsService.registerUser(username, password, name, surname, picture, bio, interests, location, requestedFavours, doneFavours, birthday);
		return ResponseEntity.ok(response);
	}


	@DeleteMapping("/delete/{username}")
    @Operation(
        summary = "Delete an user",
        description = "Delete an user",
        tags = {"User Management"},
        parameters = {
            @Parameter(
                name = "username",
                description = "Username of the user to delete",
                required = true,
                schema = @Schema(type = "string")
            )
        },
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "User information to add",
            required = true,
            content = @Content(
                mediaType = "application/json"
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "User deleted successfully",
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
	public ResponseEntity<String> deleteUser(@PathVariable String username) {
		try {
			userDetailsService.deleteUserByUsername(username);
			return ResponseEntity.ok("Usuario eliminado con éxito");
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el usuario");
		}
	}

    @DeleteMapping("/users/{userId}/contacts/{contactId}")
    @Operation(
        summary = "Delete a contact",
        description = "Delete a contact",
        tags = {"User Management"},
        parameters = {
            @Parameter(
                name = "user ID",
                description = "User ID of the user to update",
                required = true,
                schema = @Schema(type = "long")
            ),
            @Parameter(
                name = "contact ID",
                description = "Contact ID of the user to delete",
                required = true,
                schema = @Schema(type = "long")
            )
        },
        requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "User information to add",
            required = true,
            content = @Content(
                mediaType = "application/json"
            )
        ),
        responses = {
            @ApiResponse(
                responseCode = "200",
                description = "Contact deleted successfully",
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
    public ResponseEntity<Map<String, Object>> removeContact(
            @PathVariable Long userId,
            @PathVariable Long contactId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            userDetailsService.removeContact(userId, contactId);
            response.put("message", "Contacto eliminado exitosamente");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            
        } catch (IllegalStateException e) {
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            
        } catch (Exception e) {
            response.put("message", "Error al eliminar el contacto");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

}
