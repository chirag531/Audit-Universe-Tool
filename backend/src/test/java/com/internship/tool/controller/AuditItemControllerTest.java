package com.internship.tool.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.internship.tool.service.AuditItemService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = AuditItemController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
class AuditItemControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditItemService auditItemService;

    @Test
    void statsReturnsActiveCount() throws Exception {
        when(auditItemService.countActive()).thenReturn(12L);
        mockMvc.perform(get("/api/audit-items/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeCount").value(12));
    }
}
