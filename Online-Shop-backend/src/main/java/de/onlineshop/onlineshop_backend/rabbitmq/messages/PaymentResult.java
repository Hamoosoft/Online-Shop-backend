package de.onlineshop.onlineshop_backend.rabbitmq.messages;

import java.math.BigDecimal;

public class PaymentResult {

    private Long orderId;
    private String status;      // "PAID" / "DECLINED"
    private String message;
    private String transactionId;

    public PaymentResult() {}

    public PaymentResult(Long orderId, String status, String message, String transactionId) {
        this.orderId = orderId;
        this.status = status;
        this.message = message;
        this.transactionId = transactionId;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}
