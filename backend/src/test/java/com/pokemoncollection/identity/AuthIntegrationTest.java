package com.pokemoncollection.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pokemoncollection.IntegrationTest;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

class AuthIntegrationTest extends IntegrationTest {

    @Test
    void registerStartsSessionAndStoresBcryptHash() throws Exception {
        MockHttpSession session = registerTrainer();

        String username = mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertThat(username).contains("trainer_");

        String hash = jdbc.queryForObject("SELECT password_hash FROM trainer", String.class);
        assertThat(hash).startsWith("$2a$").doesNotContain(PASSWORD);
    }

    @Test
    void spaCsrfFlowWorksWithCookieAndHeader() throws Exception {
        Cookie xsrfCookie = mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(cookie().exists("XSRF-TOKEN"))
                .andReturn()
                .getResponse()
                .getCookie("XSRF-TOKEN");

        mockMvc.perform(post("/api/auth/register")
                        .cookie(xsrfCookie)
                        .header("X-XSRF-TOKEN", xsrfCookie.getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("misty", PASSWORD)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("misty"));
    }

    @Test
    void duplicateUsernameIsRejectedCaseInsensitive() throws Exception {
        register("brock").andExpect(status().isCreated());

        register("BROCK")
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void loginWithWrongPasswordIsUnauthorized() throws Exception {
        register("gary").andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .with(xsrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("gary", "wrong-password")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginAndLogout() throws Exception {
        register("oak").andExpect(status().isCreated());

        MockHttpSession session = (MockHttpSession) mockMvc.perform(post("/api/auth/login")
                        .with(xsrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("oak", PASSWORD)))
                .andExpect(status().isOk())
                .andReturn()
                .getRequest()
                .getSession(false);

        // Browser clients (RTK Query) send "Accept: application/json"; a 204 endpoint must not answer 406
        mockMvc.perform(post("/api/auth/logout").session(session).with(xsrf()).accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/collection").session(session)).andExpect(status().isUnauthorized());
    }

    @Test
    void anonymousRequestsAreUnauthorized() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/pokemon"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON));
    }

    @Test
    void stateChangingRequestWithoutCsrfTokenIsForbidden() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("team_rocket", PASSWORD)))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidRegistrationIsBadRequest() throws Exception {
        register("x").andExpect(status().isBadRequest());
    }

    @Test
    void passwordLongerThan72BytesIsBadRequest() throws Exception {
        // 40 characters pass the length validation but are 80 bytes in UTF-8
        mockMvc.perform(post("/api/auth/register")
                        .with(xsrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("umlaut", "ä".repeat(40))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginRenewsCsrfToken() throws Exception {
        register("erika").andExpect(status().isCreated());
        Cookie before =
                mockMvc.perform(get("/api/auth/me")).andReturn().getResponse().getCookie("XSRF-TOKEN");

        Cookie after = mockMvc.perform(post("/api/auth/login")
                        .cookie(before)
                        .header("X-XSRF-TOKEN", before.getValue())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("erika", PASSWORD)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getCookie("XSRF-TOKEN");

        assertThat(after).isNotNull();
        assertThat(after.getValue()).isNotEqualTo(before.getValue());
    }

    private org.springframework.test.web.servlet.ResultActions register(String username) throws Exception {
        return mockMvc.perform(post("/api/auth/register")
                .with(xsrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(credentials(username, PASSWORD)));
    }
}
