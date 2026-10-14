# Smart Task Manager

A B.Tech-level full-stack Todo and Daily Routine Management application.

## Stack

- Java 21
- Spring Boot 4.1.1
- Spring Data JPA
- H2 Database
- REST APIs
- HTML, CSS, JavaScript
- Live Server for frontend

## Features

- User registration and login
- Personal task list
- Task deadline date and time
- Priority: Low / Medium / High
- Categories
- Daily routine tasks
- Recurrence indicator
- Complete / uncomplete tasks
- Delete tasks
- Productivity dashboard
- Pending, completed and overdue statistics
- Persistent H2 file database

## Run

### Backend

Open a terminal inside `backend`:

```text
mvn spring-boot:run
```

Wait for:

```text
Tomcat started on port 8080
```

### Frontend

Open `frontend/index.html` with VS Code Live Server.

The frontend normally opens at:

```text
http://127.0.0.1:5500
```

## Demo flow

1. Register a new account.
2. Login.
3. Add a task with title, deadline, priority and category.
4. Add a daily routine task.
5. Mark a task complete.
6. Delete a task.
7. Show the dashboard statistics.

## Note

This is an academic authentication implementation. Passwords are stored as plain text for simplicity. For a production application, use Spring Security, password hashing such as BCrypt, and token/session based authentication.
"# Todo_lists" 
"# Todo_lists" 
"# Todo_lists" 
"# Todo_lists" 
