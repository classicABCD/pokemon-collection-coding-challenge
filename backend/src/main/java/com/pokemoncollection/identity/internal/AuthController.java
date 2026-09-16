package com.pokemoncollection.identity.internal;

import com.pokemoncollection.api.AuthApi;
import com.pokemoncollection.api.model.LoginRequest;
import com.pokemoncollection.api.model.RegisterRequest;
import com.pokemoncollection.api.model.Trainer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
class AuthController implements AuthApi {

    private final TrainerRepository trainers;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    // Request-scoped proxies; the generated interface has no servlet parameters
    private final HttpServletRequest request;
    private final HttpServletResponse response;

    AuthController(TrainerRepository trainers, PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager, SecurityContextRepository securityContextRepository,
            HttpServletRequest request, HttpServletResponse response) {
        this.trainers = trainers;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.request = request;
        this.response = response;
    }

    @Override
    public ResponseEntity<Trainer> register(RegisterRequest registerRequest) {
        if (trainers.existsByUsernameIgnoreCase(registerRequest.getUsername())) {
            throw usernameTaken();
        }
        TrainerAccount account;
        try {
            account = trainers.saveAndFlush(new TrainerAccount(
                    registerRequest.getUsername(), passwordEncoder.encode(registerRequest.getPassword())));
        } catch (DataIntegrityViolationException e) {
            throw usernameTaken();
        }
        TrainerUserDetails principal = TrainerUserDetails.from(account).withoutPassword();
        startSession(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(principal));
    }

    @Override
    public ResponseEntity<Trainer> login(LoginRequest loginRequest) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
                    loginRequest.getUsername(), loginRequest.getPassword()));
        } catch (AuthenticationException e) {
            // Same message for unknown user and wrong password
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
        TrainerUserDetails principal = ((TrainerUserDetails) authentication.getPrincipal()).withoutPassword();
        startSession(principal);
        return ResponseEntity.ok(toDto(principal));
    }

    @Override
    public ResponseEntity<Void> logout() {
        new SecurityContextLogoutHandler()
                .logout(request, response, SecurityContextHolder.getContext().getAuthentication());
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Trainer> getCurrentTrainer() {
        return SecurityContextCurrentTrainer.principal()
                .map(principal -> ResponseEntity.ok(toDto(principal)))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not logged in"));
    }

    private void startSession(TrainerUserDetails principal) {
        // Session fixation protection: never keep a session id from before the login
        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(principal, null, principal.getAuthorities()));
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
    }

    private static Trainer toDto(TrainerUserDetails principal) {
        return new Trainer(principal.id(), principal.username());
    }

    private static ResponseStatusException usernameTaken() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
    }
}
