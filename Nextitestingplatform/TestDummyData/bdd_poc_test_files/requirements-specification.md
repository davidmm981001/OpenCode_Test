# Requirement Specification — User Login

## Document Information
- **Document ID:** REQ-AUTH-001
- **Feature ID:** US-001
- **Module:** Authentication
- **Prepared for:** BDD Gherkin Generator POC

## Business Requirement
The system must allow a registered user to log in using email and password in order to access the application securely.

## User Story
As a user, I want to log in with my email and password so I can access my account.

## Functional Requirements

### FR-001 — Login with valid credentials
The system shall authenticate the user when a valid email and password are submitted.

### FR-002 — Email is mandatory
The system shall reject the login request when the email field is empty.

### FR-003 — Password is mandatory
The system shall reject the login request when the password field is empty.

### FR-004 — Email format validation
The system shall reject the login request when the email format is invalid.

### FR-005 — Invalid credentials
The system shall display an invalid credentials error when the email does not exist or the password is incorrect.

### FR-006 — Inactive users
The system shall deny access to users whose account status is inactive.

### FR-007 — Account locking rule
The system shall lock the account after five consecutive failed password attempts.

### FR-008 — Reset failed attempts on success
The system shall reset the failed login attempts counter to zero after a successful login.

### FR-009 — Locked users
The system shall deny access when the account is already locked.

## Acceptance Criteria

### AC-001 — Successful login
**Given** an active user exists with valid credentials  
**When** the user submits the correct email and password  
**Then** the system authenticates the user successfully  
**And** the user is allowed to access the application.

### AC-002 — Email required
**Given** the user is on the login screen  
**When** the user leaves the email field empty  
**And** submits the form  
**Then** the system rejects the request  
**And** indicates that the email is required.

### AC-003 — Password required
**Given** the user is on the login screen  
**When** the user leaves the password field empty  
**And** submits the form  
**Then** the system rejects the request  
**And** indicates that the password is required.

### AC-004 — Invalid email format
**Given** the user is on the login screen  
**When** the user enters an invalid email format  
**And** submits the form  
**Then** the system rejects the request  
**And** indicates that the email format is invalid.

### AC-005 — Invalid credentials
**Given** the user is on the login screen  
**When** the user submits credentials that do not match an existing active account  
**Then** the system denies authentication  
**And** displays an invalid credentials message.

### AC-006 — Inactive account
**Given** the user account is inactive  
**When** the user submits valid credentials  
**Then** the system denies access.

### AC-007 — Lock after five failed attempts
**Given** the user has already accumulated four failed password attempts  
**When** the user submits an incorrect password again  
**Then** the account becomes locked  
**And** the system denies access.

### AC-008 — Locked account
**Given** the user account is locked  
**When** the user submits any password  
**Then** the system denies access  
**And** indicates that the account is locked.

## Business Rules
- BR-001: Email must have a valid format.
- BR-002: Password must be between 8 and 64 characters.
- BR-003: Failed login attempts increase only when the user exists and the password is incorrect.
- BR-004: A locked account cannot be authenticated until it is unlocked by another process.
- BR-005: Successful login resets the failed attempts counter.

## Notes for Testing
- This document is intentionally detailed so an AI workflow can compare explicit requirements against source code behavior.
- The related code files are expected to reveal controller behavior, validation rules, and service logic.
