package de.onlineshop.onlineshop_backend.payment;

public class PaymentResponse {

    private PaymentStatus status;
    private String transactionId;
    private String message;

    public PaymentResponse() {
    }

    public PaymentResponse(PaymentStatus status, String transactionId, String message) {
        this.status = status;
        this.transactionId = transactionId;
        this.message = message;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
