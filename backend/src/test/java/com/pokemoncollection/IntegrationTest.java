package com.pokemoncollection;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

/**
 * Base class for integration tests: full application, real security filter chain, PostgreSQL via Testcontainers.
 */
@SpringBootTest(properties = "app.catalog.sync.sync-on-startup=false")
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
public abstract class IntegrationTest {

    protected static final String PASSWORD = "secret-password";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected JdbcTemplate jdbc;

    @BeforeEach
    void cleanDatabase() {
        jdbc.execute("TRUNCATE collection_entry, pokemon, trainer CASCADE");
    }

    /** Registers a trainer with a unique name and returns the authenticated session. */
    protected MockHttpSession registerTrainer() throws Exception {
        String username = "trainer_" + UUID.randomUUID().toString().substring(0, 8);
        return (MockHttpSession) mockMvc.perform(post("/api/auth/register")
                        .with(xsrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(username, PASSWORD)))
                .andExpect(status().isCreated())
                .andReturn()
                .getRequest()
                .getSession(false);
    }

    /**
     * CSRF like the SPA does it: read the XSRF-TOKEN cookie and send it back as X-XSRF-TOKEN header.
     * (Spring Security's csrf() test helper replaces the token repository and would bypass the cookie mechanism.)
     */
    protected RequestPostProcessor xsrf() throws Exception {
        Cookie cookie = mockMvc.perform(get("/api/auth/me")).andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertThat(cookie).as("XSRF-TOKEN cookie").isNotNull();
        return request -> {
            request.setCookies(cookie);
            request.addHeader("X-XSRF-TOKEN", cookie.getValue());
            return request;
        };
    }

    protected void insertPokemon(int id, String name, boolean deprecated) {
        jdbc.update("INSERT INTO pokemon (id, name, types, deprecated, last_synced_at) VALUES (?, ?, '{electric}', ?, now())",
                id, name, deprecated);
    }

    protected static String credentials(String username, String password) {
        return """
                {"username": "%s", "password": "%s"}""".formatted(username, password);
    }
}
