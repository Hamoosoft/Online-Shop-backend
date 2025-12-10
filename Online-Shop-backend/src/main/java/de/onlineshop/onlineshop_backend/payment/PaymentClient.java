package de.onlineshop.onlineshop_backend.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PaymentClient {

    private final RestTemplate restTemplate;
    private final String paymentServiceBaseUrl;

    public PaymentClient(
            RestTemplate restTemplate,
            @Value("${payment.service.url:${PAYMENT_SERVICE_URL:http://localhost:8081}}")
            String paymentServiceBaseUrl
    ) {
        this.restTemplate = restTemplate;
        this.paymentServiceBaseUrl = paymentServiceBaseUrl;
    }

    public PaymentResponse charge(PaymentRequest request) {
        String url = paymentServiceBaseUrl + "/api/payments/charge";

        HttpEntity<PaymentRequest> entity = new HttpEntity<>(request);

        ResponseEntity<PaymentResponse> response =
                restTemplate.exchange(url, HttpMethod.POST, entity, PaymentResponse.class);

        return response.getBody();
    }
}
