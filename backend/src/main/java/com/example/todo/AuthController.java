package com.example.todo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        String username = user.getUsername() == null ? "" : user.getUsername().trim();
        String password = user.getPassword() == null ? "" : user.getPassword();

        if (username.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest().body("Username and password are required");
        }

        if (password.length() < 4) {
            return ResponseEntity.badRequest().body("Password must contain at least 4 characters");
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        userRepository.save(new User(username, password));
        return ResponseEntity.ok("Registration successful");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        String username = user.getUsername() == null ? "" : user.getUsername().trim();
        String password = user.getPassword() == null ? "" : user.getPassword();

        return userRepository.findByUsername(username)
                .filter(existing -> existing.getPassword().equals(password))
                .<ResponseEntity<?>>map(existing ->
                        ResponseEntity.ok(Map.of(
                                "message", "Login successful",
                                "username", existing.getUsername()
                        )))
                .orElseGet(() ->
                        ResponseEntity.status(401).body("Invalid username or password"));
    }
}
