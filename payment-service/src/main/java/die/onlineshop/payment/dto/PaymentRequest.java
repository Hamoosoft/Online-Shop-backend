package die.onlineshop.payment.dto;


import java.math.BigDecimal;

public class PaymentRequest {

    private BigDecimal amount;
    private String currency;
    private String orderId;
    private String customerEmail;
    private String paymentMethod;

    public PaymentRequest() {
    }

    public PaymentRequest(BigDecimal amount, String currency,
                          String orderId, String customerEmail, String paymentMethod) {
        this.amount = amount;
        this.currency = currency;
        this.orderId = orderId;
        this.customerEmail = customerEmail;
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
