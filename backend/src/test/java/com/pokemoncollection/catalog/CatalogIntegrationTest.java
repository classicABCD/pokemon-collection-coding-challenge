package com.pokemoncollection.catalog;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pokemoncollection.IntegrationTest;
import org.junit.jupiter.api.Test;

class CatalogIntegrationTest extends IntegrationTest {

    @Test
    void syncStatusIsAvailableToLoggedInTrainers() throws Exception {
        mockMvc.perform(get("/api/pokemon/sync-status").session(registerTrainer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.state").value("idle"));
    }

    @Test
    void syncStatusRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/pokemon/sync-status")).andExpect(status().isUnauthorized());
    }
}
