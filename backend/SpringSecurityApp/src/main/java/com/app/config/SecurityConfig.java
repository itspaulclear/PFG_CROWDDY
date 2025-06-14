package com.app.config;

import com.app.config.filter.JwtTokenValidator;
import com.app.service.UserDetailServiceImpl;
import com.app.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

	@Autowired
	private JwtUtils jwtUtils;

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		// Deshabilitar CSRF completamente
		http.csrf(csrf -> csrf.disable());
		
		// Configuración CORS
		http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
		
		// Configuración de sesión
		http.sessionManagement(session -> session
			.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
		);
		
		// Configuración de autorización
		http.authorizeHttpRequests(auth -> {
			// Permitir todas las solicitudes
			auth.anyRequest().permitAll();
		});
		
		// Deshabilitar el filtro JWT temporalmente
		// http.addFilterBefore(new JwtTokenValidator(jwtUtils), BasicAuthenticationFilter.class);
		
		return http.build();
	}
	
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		System.out.println("Configurando CORS...");
		CorsConfiguration configuration = new CorsConfiguration();
		// Especificar los orígenes permitidos explícitamente
		configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("*"));
		configuration.setAllowCredentials(true); // Habilitar credenciales
		configuration.setMaxAge(3600L); // Tiempo de caché para las opciones preflight
		// Headers que se pueden exponer al frontend
		configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
		
		System.out.println("Configuración CORS:");
		System.out.println("- Orígenes permitidos: " + configuration.getAllowedOrigins());
		System.out.println("- Métodos permitidos: " + configuration.getAllowedMethods());
		System.out.println("- Headers permitidos: " + configuration.getAllowedHeaders());
		
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		
		System.out.println("CORS configurado correctamente para todas las rutas");
		return source;
	}

	/*
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
		return httpSecurity
				.csrf(csrf -> csrf.disable())
				.httpBasic(Customizer.withDefaults())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.build();
	}
	*/

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
		return authenticationConfiguration.getAuthenticationManager();
	}

	@Bean
	public AuthenticationProvider authenticationProvider(UserDetailServiceImpl userDetailService) {
		DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
		provider.setPasswordEncoder(passwordEncoder());
		provider.setUserDetailsService(userDetailService);
		return provider;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		// return NoOpPasswordEncoder.getInstance(); (para pruebas)
		return new BCryptPasswordEncoder();
	}

//	public static void main(String[] args) {
//		System.out.println(new BCryptPasswordEncoder().encode("1234"));
//	}
}
