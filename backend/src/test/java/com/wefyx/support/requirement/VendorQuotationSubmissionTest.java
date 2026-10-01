package com.wefyx.support.requirement;

import com.wefyx.support.auth.JwtService;
import com.wefyx.support.user.*;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:quote-cors-tests;DB_CLOSE_DELAY=-1", "spring.datasource.username=sa", "spring.datasource.password=", "wefyx.seed.enabled=false", "wefyx.cors-origins=http://localhost:5173"})
@AutoConfigureMockMvc
class VendorQuotationSubmissionTest {
    @Autowired MockMvc mvc;
    @Autowired JwtService jwt;
    @Autowired UserRepository users;
    @Autowired RequirementRepository requirements;
    @Autowired VendorQuotationRepository quotations;
    private static final String ORIGIN = "http://localhost:5173";
    private static final String BODY = "{\"amount\":\"100\",\"leadTimeDays\":\"2\",\"notes\":\"Website development\"}";

    @Test void patchPreflightAcceptsConfiguredOriginOnly() throws Exception {
        mvc.perform(options("/api/requirements/98/quotations/submit").header("Origin", ORIGIN)
            .header("Access-Control-Request-Method", "PATCH").header("Access-Control-Request-Headers", "authorization,content-type"))
            .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Methods", containsString("PATCH")));
        mvc.perform(options("/api/requirements/98/quotations/submit").header("Origin", "https://untrusted.example")
            .header("Access-Control-Request-Method", "PATCH")).andExpect(status().isForbidden());
    }

    @Test void invitedVendorCanSubmitButUninvitedAndUnauthenticatedCannot() throws Exception {
        String invited = "invited-" + UUID.randomUUID() + "@example.com";
        String outsider = "outsider-" + UUID.randomUUID() + "@example.com";
        for (String email : new String[]{invited, outsider})
            users.save(new SupportUser("Test vendor", email, "VENDOR", "Test", "Dubai", UserStatus.ACTIVE, null, LocalDateTime.now()));
        var request = new Requirement();
        request.setReference("TEST-" + UUID.randomUUID()); request.setTitle("Website development");
        request.setStatus(RequirementStatus.SENT_TO_VENDOR);
        request = requirements.save(request);
        var quote = new VendorQuotation();
        quote.setRequirementId(request.getId()); quote.setVendorEmail(invited); quote.setVendorName("Test vendor");
        quote.setStatus(VendorQuotationStatus.INVITED); quote.setVersion(2); quote = quotations.save(quote);
        var historical = new VendorQuotation();
        historical.setRequirementId(request.getId()); historical.setVendorEmail(invited); historical.setVendorName("Test vendor");
        historical.setVersion(1); historical.setStatus(VendorQuotationStatus.REJECTED); historical = quotations.save(historical);
        String url = "/api/requirements/" + request.getId() + "/quotations/submit";
        mvc.perform(patch(url).header("Origin", ORIGIN).contentType(MediaType.APPLICATION_JSON).content(BODY))
            .andExpect(status().isUnauthorized());
        mvc.perform(patch(url).header("Origin", ORIGIN).header("Authorization", "Bearer " + jwt.issue(outsider, "VENDOR"))
            .contentType(MediaType.APPLICATION_JSON).content(BODY)).andExpect(status().isForbidden());
        assertEquals(VendorQuotationStatus.INVITED, quotations.findById(quote.getId()).orElseThrow().getStatus());
        mvc.perform(patch(url).header("Origin", ORIGIN).header("Authorization", "Bearer " + jwt.issue(invited, "VENDOR"))
            .contentType(MediaType.APPLICATION_JSON).content(BODY)).andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value("Accept the requirement before submitting a quotation"));
        mvc.perform(patch("/api/requirements/" + request.getId() + "/vendor-decision").header("Origin", ORIGIN)
            .header("Authorization", "Bearer " + jwt.issue(invited, "VENDOR"))
            .contentType(MediaType.APPLICATION_JSON).content("{\"accepted\":true}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("ACCEPTED"));
        mvc.perform(patch(url).header("Origin", ORIGIN).header("Authorization", "Bearer " + jwt.issue(invited, "VENDOR"))
            .contentType(MediaType.APPLICATION_JSON).content(BODY)).andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("SUBMITTED")).andExpect(jsonPath("$.amount").value(100));
        assertEquals(VendorQuotationStatus.SUBMITTED, quotations.findById(quote.getId()).orElseThrow().getStatus());
        assertEquals(VendorQuotationStatus.REJECTED, quotations.findById(historical.getId()).orElseThrow().getStatus());
        mvc.perform(patch(url).header("Authorization", "Bearer " + jwt.issue(invited, "VENDOR"))
            .contentType(MediaType.APPLICATION_JSON).content(BODY)).andExpect(status().isConflict());
    }
    @Test void rejectInviteValidatesReasonAndBlocksQuotationSubmission() throws Exception {
        String email = "reject-" + UUID.randomUUID() + "@example.com";
        users.save(new SupportUser("Vendor", email, "VENDOR", "Test", "Dubai", UserStatus.ACTIVE, null, LocalDateTime.now()));
        var request = new Requirement(); request.setReference("TEST-" + UUID.randomUUID());
        request.setTitle("Invite rejection"); request.setStatus(RequirementStatus.SENT_TO_VENDOR); request = requirements.save(request);
        var quote = new VendorQuotation(); quote.setRequirementId(request.getId()); quote.setVendorEmail(email); quote.setVendorName("Vendor"); quotations.save(quote);
        String base = "/api/requirements/" + request.getId(); String token = "Bearer " + jwt.issue(email, "VENDOR");
        for (String body : new String[]{"{}", "{\"accepted\":false,\"notes\":null}"})
            mvc.perform(patch(base + "/vendor-decision").header("Authorization", token).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
        mvc.perform(patch(base + "/vendor-decision").header("Authorization", token).contentType(MediaType.APPLICATION_JSON)
            .content("{\"accepted\":false,\"notes\":\"No capacity available\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DECLINED"));
        mvc.perform(patch(base + "/quotations/submit").header("Authorization", token).contentType(MediaType.APPLICATION_JSON).content(BODY))
            .andExpect(status().isConflict());
    }
}
