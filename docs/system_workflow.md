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

## 5. Offers & Loyalty Checkout Flow

This flow details how promotions and loyalty rewards are processed during checkout.

```mermaid
graph TD
    Start([Initiate Checkout]) --> Cart[Load Cart Items & Total]
    Cart --> FetchOffers[Fetch Active Promotional Offers]
    FetchOffers --> CalcDiscount[Calculate Best Applicable Discount]
    CalcDiscount --> FetchLoyalty[Fetch Customer Loyalty Balance]
    FetchLoyalty --> QueryRedeem{Redeem Points?}
    QueryRedeem -- Yes --> ApplyPoints[Deduct Points & Apply Loyalty Discount]
    QueryRedeem -- No --> CalculateTotal[Compute Final Total Amount]
    ApplyPoints --> CalculateTotal
    CalculateTotal --> ProcessPayment[Process Simulated Payment]
    ProcessPayment --> SaveOrder[Create Order: Store Offer & Loyalty Reductions]
    SaveOrder --> EarnPoints[Credit New Loyalty Points to Customer Profile]
    EarnPoints --> End([Order Confirmed])

    style Start fill:#4F46E5,stroke:#312E81,stroke-width:2px,color:#fff
    style End fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
```

---

## 6. Real-Time Notification Broadcast Flow

This flow illustrates how live alerts propagate from database events to the client web applications.

```mermaid
graph TD
    TriggerEvent[Database Event: Order Update / Support / Promo] --> DBInsert[(Insert to Notifications Table)]
    DBInsert --> Realtime[Supabase Realtime Postgres Listener]
    Realtime --> NodeServer[Node.js Express App App.js]
    NodeServer --> SSEBroadcast[Broadcast to Connected User SSE Streams]
    SSEBroadcast --> CustomerPWA[Customer PWA Toast Prompt & Unread Bell Badge]
    SSEBroadcast --> AdminApp[Admin Dashboard Live Alert Notification]

    style TriggerEvent fill:#F59E0B,stroke:#78350F,stroke-width:2px,color:#fff
    style CustomerPWA fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
    style AdminApp fill:#10B981,stroke:#065F46,stroke-width:2px,color:#fff
```

---

## 7. Module Interaction

The high-level block interaction representing the system architecture dependencies.

```mermaid
graph LR
    User[User Management] --> Menu[Menu Management]
    Menu --> Cart[Cart Management]
    Cart --> Checkout[Checkout Flow]
    Checkout --> Offers[Promotions & Offers]
    Checkout --> Loyalty[Loyalty Rewards]
    Checkout --> Order[Order Management]
    Order --> Payment[Payment Module]
    Order --> Delivery[Delivery Management]
    Order --> CRM[Customer Relationship Module]
    CRM --> Admin[Admin Dashboard]
    Order --> Notifications[Real-Time Notifications]
    CRM --> Notifications
```
