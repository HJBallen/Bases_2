# 🛍️ BogoGo – Fashion E-Commerce Platform  

## 📘 Overview  
**BogoGo** is a fashion e-commerce platform created to connect **local clothing brands, independent designers, and customers in Bogotá**. Its goal is to promote local fashion while providing a modern, secure, and personalized online shopping experience.  

The system supports multiple user roles — **customers, vendors, and administrators** — and integrates features like product management, real-time analytics, and localized deliveries through AWS-hosted infrastructure that ensures **scalability, performance, and security**.

---

## 1️⃣ Introduction  
This section presents the main idea behind **BogoGo**, highlighting its mission to enhance Bogotá’s fashion ecosystem by bridging creators and consumers.  
It summarizes:  
- The platform’s goals and scope.  
- Key user roles (customers, vendors, administrators).  
- Core functionalities such as secure transactions, product management, analytics, and AWS-based scalability.

---

## 2️⃣ Canvas Business Model  
This section provides an overview of **BogoGo’s Business Model Canvas**, illustrating how the platform generates value and operates as a business.  
It identifies and connects elements such as:  
- Value propositions.  
- Key partners and activities.  
- Customer segments.  
- Revenue streams and cost structure.  

The diagram serves as a **strategic summary** of the project’s core operations and business logic.

---

## 3️⃣ Requirements  
This section defines the **system requirements** that guide BogoGo’s design and development.  
It focuses on understanding user needs and translating them into functional specifications.

### 🔹 3.1 Functional Requirements (FR)  
Describe what the system **must do**, including actions users can perform (e.g., registering, managing products, placing orders, tracking deliveries).  

### 🔹 3.2 Non-Functional Requirements (NFR)  
Explain **system qualities** such as performance, usability, scalability, and security.  
These are justified through theoretical principles and realistic time estimates to ensure feasibility and technical soundness.

---

## 4️⃣ User Stories  
This section outlines the **user stories** derived from the requirements.  
Each story describes user interactions from the perspective of customers, vendors, or administrators — providing a **user-centered view** of the system’s features.

---

## 5️⃣ Database Architecture  
This section details the **data architecture** supporting BogoGo’s core operations.  

### 🧩 High-Level Architecture Overview  
- The database manages information about **users, vendors, products, orders, and categories**.  
- The **User** entity serves as the foundation, linked to a **Role** defining access permissions (admin, vendor, customer).  
- **Orders** connect customers with products, storing order details such as date, total, and status.  
- **Products** include descriptive and visual attributes (name, description, price, stock, color, size, material) and are organized by **Category**.  
- **Images** store multimedia content, while **Vendors** manage their respective product listings and availability.  

This architecture ensures **data consistency, traceability, and scalability**, forming the backbone of the platform.

---

## 6️⃣ Information Requirements  
This section defines the **types of data** the system must be able to return in response to user actions or queries. It describes how users interact with system data, ensuring transparency and traceability.  

The system returns the following information:  
- **Available Products List:** Displays all products currently available in the catalog.  
- **Top-Selling Products Report:** Shows the most popular items based on sales performance.  
- **Sales Behavior Report:** Provides analytics on sales trends and customer purchasing patterns.  
- **Product Status:** Indicates whether a product is active or inactive.  
- **Product Management Confirmation:** Confirms success or failure of product-related operations.  
- **Vendor Rating:** Displays the average rating score of each vendor, based on user feedback and activity data.  

These outputs are linked to specific **user stories and requirements**, ensuring consistency between business needs and technical implementation.
## 7️⃣ Query Proposals  
This section presents the **SQL queries** that retrieve key information from the database according to user requirements.  
## 8 Changes from workshop 1
..
## 9 References
..
