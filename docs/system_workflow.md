# System Workflow Documentation

This document describes the key operational flows and module interactions within the Restaurant PWA system.

---

## 1. Customer Ordering Flow

This flow covers the user journey from landing on the platform to order delivery.

```mermaid
graph TD
    Start([User registration/Login]) --> Browse[Browse Menu]
    Browse --> Cart[Add Items to Cart]
    Cart --> Checkout[Checkout]
    Checkout --> Payment[Payment Processing]
    Payment --> Order[Order Creation]
    Order --> Kitchen[Kitchen Processing]
    Kitchen --> Delivery[Delivery Assignment]
    Delivery --> Tracking[Order Tracking]
    Tracking --> Delivered([Delivered])

    style Start fill:#4F46E5,stroke:#312E81,stroke-width:2px,color:#fff
    style Delivered fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
```

---

## 2. Complaint Flow

This flow details how customer issues are logged, reviewed, and resolved.

```mermaid
graph TD
    Delivered[Delivered Order] --> Complaint[Customer Raises Complaint]
    Complaint --> Ticket[Support Ticket Created]
    Ticket --> Review[Admin Review]
    Review --> Resolved([Resolved / Closed])

    style Delivered fill:#3B82F6,stroke:#1E3A8A,stroke-width:2px,color:#fff
    style Resolved fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
```

---

## 3. Refund Flow

This flow tracks the financial resolution steps after a refund request is filed.

```mermaid
graph TD
    Request[Customer Requests Refund] --> Verification[Admin Verification]
    Verification --> Decision{Approved / Rejected?}
    Decision -- Yes --> Status[Refund Status Updated]
    Decision -- No --> Ticket[Ticket Closed / Notified]

    style Request fill:#EF4444,stroke:#7F1D1D,stroke-width:2px,color:#fff
    style Status fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
```

---

## 4. Delivery Flow

This flow manages the logistics steps once the food preparation is complete.

```mermaid
graph TD
    Ready[Order Ready] --> Assign[Delivery Assigned]
    Assign --> Pickup[Picked Up]
    Pickup --> Transit[Out For Delivery]
    Transit --> Delivered([Delivered])

    style Ready fill:#F59E0B,stroke:#78350F,stroke-width:2px,color:#fff
    style Delivered fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
```

---

## 5. Module Interaction

The high-level block interaction representing the system architecture dependencies.

```mermaid
graph LR
    User[User Management] --> Menu[Menu Management]
    Menu --> Cart[Cart Management]
    Cart --> Order[Order Management]
    Order --> Payment[Payment Module]
    Order --> Delivery[Delivery Management]
    Order --> CRM[Customer Relationship Module]
    CRM --> Admin[Admin Dashboard]
```
