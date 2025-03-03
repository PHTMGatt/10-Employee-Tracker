# **Employee Tracker**
#### 10-SQL

## Description
The **Employee Tracker** is a command-line application designed to manage a company's employee database efficiently. Built using **Node.js**, **Inquirer**, and **PostgreSQL**, this app allows users to view and manage departments, roles, and employees with ease. It is a **Content Management System (CMS)** that simplifies database interaction for non-developers.

### Motivation and Learning
- **Motivation:** Create an intuitive tool for business owners to manage their workforce effectively.  
- **Why:** Built to gain hands-on experience with databases, server-side JavaScript, and CLI applications.  
- **Problem Solved:** Simplifies the management of employee information, making it easy to access and update.  
- **What I Learned:** Strengthened skills in database management, SQL, asynchronous JavaScript, and using the `Inquirer` and `pg` packages.  

---

## Table of Contents
- [Features](#features)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Database Schema](#database-schema)  
- [API Reference](#api-reference)  
- [Repo Link](#repo-link)  
- [Credits](#credits)  
- [License](#license)  

---

## Features
- View all departments, roles, and employees.  
- Add new departments, roles, and employees.  
- Update employee roles.  
- Manage employees by department or manager (bonus).  
- Delete departments, roles, and employees (bonus).  
- View total salary budget by department (bonus).  

---

## Installation
To get a local copy up and running, follow these steps:

1. **Clone the repo:**  
   ```bash
   git clone https://github.com/PHTMGatt/10-SQL-Employee-Tracker.git

## Usage
Start the application: Run node index.js in the terminal.
Choose an action: Select from options like viewing, adding, or updating departments, roles, and employees.
Follow prompts: Input information as prompted to manage your employee database.

## Walkthrough Video

### Database Schema
The database schema consists of three main tables:

#### 1. Department
- id (Primary Key)
- name (Unique, Not Null)

#### 2. Role
- id (Primary Key)
- title (Unique, Not Null)
- salary (Not Null)
- department_id (Foreign Key to Department)

#### 3. Employee
- id (Primary Key)
- first_name (Not Null)
- last_name (Not Null)
- role_id (Foreign Key to Role)
- manager_id (Foreign Key to Employee, Nullable)

### Repo Link
##### GitHub Repository

### Credits
Built by PHTMGatt.
Uses Inquirer for CLI interaction.
Uses pg for database connectivity.

### License
This project is licensed under the MIT License. See the LICENSE file for details.