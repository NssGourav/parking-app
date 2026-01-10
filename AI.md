# AI Usage Disclosure

This document provides transparency regarding the use of Artificial Intelligence (AI) in the development of the **Smart Parking Management System**. AI tools were used to assist development, improve efficiency, and support complex debugging, while all core decisions and implementations were human-driven.

## AI Tools Used
- **ChatGPT** – Used for exploratory planning, debugging assistance, and documentation drafts.
- **Antigravity (AI IDE)** – Used for codebase navigation, migration generation, and contextual bug diagnosis.

## How AI Was Used

### Database & Schema Assistance
- Designing relational mappings between users, roles, sites, vehicles, and parking sessions.
- Suggesting Supabase-compatible SQL migrations and RLS policies.

### Backend & SQL Support
- Generating migration scripts for pending drivers, parking sessions, and transactions.
- Assisting in debugging PostgreSQL syntax and Supabase permission issues.

### Frontend & Navigation Debugging
- Diagnosing React Native navigation issues related to role-based routing.
- Assisting with state management issues between screens.

### Boilerplate & Refactoring
- Speeding up creation of reusable UI components and service layers.

### Documentation
- Drafting README structure and setup instructions.

## Prompt Log (Representative Prompts)
The following list represents typical prompts used during development. This is not an exhaustive history, but a summary of AI assistance categories.

- *“Design a Supabase schema for a smart parking system with multi-role access.”*
- *“Create SQL migrations for pending driver approvals with RLS policies.”*
- *“Explain why a Supabase query returns an array instead of a single object.”*
- *“Generate realistic dummy data for testing dashboard metrics.”*
- *“Help debug a React Navigation loop after login.”*
- *“Create professional documentation for an internship evaluation.”*

## Human Contribution Statement
While AI tools were used as pair-programming assistants, all critical work was human-led, including:

- **System architecture and role-based access design**
- **Business logic for parking workflows and approvals**
- **Manual coding, debugging, and testing**
- **Deployment decisions and environment configuration**

All AI-generated suggestions were reviewed, tested, and adapted to meet production and security standards.
