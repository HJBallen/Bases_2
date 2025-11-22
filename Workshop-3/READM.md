# BogoGo – Data System Architecture & Information Retrieval  
**Workshop N° 3 — Universidad Distrital Francisco José de Caldas**

This document presents the architectural design and data management strategies for **BogoGo**, a fashion e-commerce platform focused on supporting local designers and brands in Bogotá. It centralizes the functional definition of the system, its distributed database architecture, performance strategies, and analytical capabilities.

---

## 📑 Document Structure

### 1️⃣ Introduction
Provides the system’s vision: connecting customers with local fashion creators in a scalable, secure, and analytics-driven online marketplace.

---

### 2️⃣ Business Model Canvas
Summarizes the business logic behind BogoGo, including:
- **Key Partners:** logistics providers, payment platforms, cloud services  
- **Value Proposition:** fast delivery, exclusive items, secure payments, real-time analytics  
- **Customer Segments:** buyers, boutiques, designers, admins  
- **Revenue Model:** commissions, advertising, sponsored programs  

Also includes cost structure and operational channels.

---

### 3️⃣ Requirements
Functional and non-functional requirements aligned with industry standards.

**Functional Requirements (FR)**
- Account and role management  
- Product catalog and search/filtering  
- Shopping cart and secure payments  
- Vendor rating and order tracking  
- Multi-device accessibility  

**Non-Functional Requirements (NFR)**
- Homepage loading **< 2.5 s** (Web Vitals guideline)  
- **Up to 500 concurrent users** supported  
- **99% uptime** target for reliable access  
- Encryption of sensitive data  
- Seamless mobile UI  
- Microservices architecture for maintainability  

---

### 4️⃣ User Stories (15 Total)

✔ **8 Customer stories**  
✔ **4 Vendor stories**  
✔ **3 Administrator stories**  

Each includes:
- Title
- Priority
- Time estimate
- Detailed acceptance criteria

Stories cover shopping flow, catalog management, analytics, vendor rating visibility, and administrative oversight.

---

### 5️⃣ Database Architecture
A **three-layer architecture** is implemented:

| Layer | Description |
|-------|-------------|
| Presentation | Web UI accessing backend through REST APIs |
| Application | Auth, business logic, external API integrations |
| Infrastructure | Relational DB + Object Storage for multimedia |

Includes:
- Updated **ER Diagram**
- **BPMN process model** (end-to-end platform flow)
- Data Flow Diagram illustrating interaction between services

---

### 6️⃣ Information Requirements
Defines the types of responses the system produces:
- Available products list
- Sales behavior and top-selling report
- Order status and product state
- Vendor performance results
- Feedback confirmations

---

### 7️⃣ SQL Query Proposals
Queries supporting system requirements such as:
- Active product listing
- Revenue and sales trends
- Product state detection
- Vendor rating ranking

Performance enhancements such as:
- B-tree indexing strategy
- Pagination for high-traffic listing
- Optional materialized views for analytics
- Distributed caching for hot data

---

### 8️⃣ Concurrency Analysis
Three scenarios requiring transaction control:
1. Simultaneous checkout operations
2. Catalog updates during customer browsing
3. External payment/shipping services updating order states

Proposed solutions include:
- Pessimistic locking (`SELECT FOR UPDATE`)
- Serializable isolation levels
- State machine enforcement
- Idempotency keys for repeat requests

---

### 9️⃣ Distributed and Parallel Database Design
Performance and scalability handled through:
- **Primary + read replicas** for low-latency browsing
- **Time-based partitioning** for high-growth transactional tables
- **Logical sharding by Bogotá regions**
- ETL processes feeding a separate **analytics node**

Benefits:
- Horizontal read scaling
- Query parallelization
- High availability with automatic failover
- Reduced load on OLTP operations

---

### 🔟 Performance Optimization Techniques
Techniques implemented:
- Caching of hot data (e.g., product lists)
- Load balancing across replicas
- Monitoring + failover automation
- Separation of analytical workloads

Challenges such as eventual consistency are mitigated with routing and recovery strategies.

---

### 1️⃣1️⃣ Changes from Workshop 2
- Removed references to AWS and replaced with neutral/justified cloud architecture
- Enhanced NFRs with **proper academic references**
- Improved ERD structure and readability
- Added BPMN diagram to reduce excessive textual description

---

## 📎 References
Document contains four academic and technical references supporting architectural decisions and system metrics.

---

## 👥 Authors
- **Andruew Steven Zabala Serrano** — 20211020071  
- **Ruben David Montoya Arredondo** — 20211020055  
- **Hemerson Julian Ballen Triana** — 20211020084  

---

> Universidad Distrital Francisco José de Caldas — School of Engineering

