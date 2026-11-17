# Project Development Prompt: CDRRMD Dispatch Management Section – New Hire Onboarding System

## 1. Project Overview

Let's develop a full-stack web application for the **Dispatch Management Section New Hire Onboarding Process** of the Butuan City Disaster Risk Reduction and Management Department (CDRRMD).

The application will serve as a centralized platform for managing, monitoring, documenting, and evaluating the onboarding and competency development of newly hired Emergency Telecommunicators (ETCs).

The system will digitize the existing onboarding framework, allowing administrators, training personnel, supervisors, and trainees to monitor training progress, manage learning activities, record assessments, evaluate competencies, and maintain onboarding documentation.

### 2. Background and System Purpose

The Dispatch Management Section New Hire Onboarding Process is a structured and competency-based training framework developed to prepare newly hired Emergency Telecommunicators (ETCs) for the demands of emergency communications and dispatch operations within the Butuan City Disaster Risk Reduction and Management Department (CDRRMD).

The program provides a systematic progression from organizational orientation and operational familiarization to technical instruction, emergency communications training, practical exercises, supervised deployment, and competency assessment.

Its primary objective is to ensure that newly hired personnel acquire the knowledge, skills, professional values, and operational readiness required to perform their duties safely, effectively, and independently.

Through a combination of classroom instruction, scenario-based learning, hands-on operational exposure, continuous assessments, and performance evaluations, the onboarding process establishes a standardized pathway for workforce development and operational excellence.

By promoting consistency in training, strengthening professional competence, and reinforcing organizational standards, the program enhances service quality, supports coordinated emergency response operations, and contributes to the long-term sustainability and effectiveness of the Butuan City Integrated Response System.

## 3. Technology Stack

Use the following technology stack:

**Frontend**
- React.js with Next.js
- TypeScript
- Tailwind CSS
- Modern, reusable UI components
- Responsive design for desktop, tablet, and mobile devices

**Backend**
- Laravel (PHP)
- Laravel RESTful API architecture
- Laravel authentication and authorization
- Request validation and structured API responses

**Database**
- PostgreSQL
- Database management and monitoring through TablePlus
- Laravel migrations, seeders, factories, and Eloquent ORM

**Development Environment**
- Visual Studio Code
- Git and GitHub for version control
- Local PostgreSQL database
- Environment-based configuration for development and production

Keep the frontend and backend in separate directories within one project repository.

## 4. System Objectives

The application must:

1. Digitize and standardize the ETC onboarding process.
2. Provide a centralized repository for onboarding materials and documentation.
3. Track individual trainee progress throughout the onboarding program.
4. Manage training schedules, modules, activities, and assigned trainers.
5. Record attendance and participation.
6. Facilitate written examinations, practical assessments, and competency evaluations.
7. Monitor trainee performance and identify areas requiring improvement.
8. Generate progress reports and onboarding completion summaries.
9. Maintain historical records of completed training programs.
10. Provide role-based access to protect sensitive personnel and training information.

## 5. User Roles and Permissions

Design the system with role-based access control (RBAC).

Initial user roles:

- **System Administrator** – Full access to system configuration, user management, training management, and system records.
- **Training Supervisor** – Oversees onboarding programs, monitors trainee progress, reviews assessments, and approves training completion.
- **Trainer / Evaluator** – Manages assigned training sessions, records attendance, conducts assessments, and submits trainee evaluations.
- **Emergency Telecommunicator (Trainee)** – Views assigned onboarding modules, training schedules, learning materials, assessment results, and personal progress.

Implement permissions according to each role. Avoid giving users unnecessary access to restricted information.

## 6. Core System Modules

The system should be modular and scalable.

### A. Dashboard
- Total number of active trainees
- Completed onboarding programs
- Ongoing onboarding programs
- Pending assessments
- Upcoming training activities
- Recent trainee activities
- Overall onboarding completion statistics
- Individual trainee progress overview

### B. Trainee Management
- Register new trainees.
- Maintain trainee profiles and employment information.
- Assign trainees to an onboarding program.
- Track onboarding status.
- View individual training history.
- Maintain trainee documentation.
- Archive completed or inactive trainee records.

### C. Onboarding Program Management
- Create and manage onboarding programs.
- Define program duration and training phases.
- Organize training modules and activities.
- Assign trainers and evaluators.
- Set training objectives and expected competencies.
- Configure completion requirements.

### D. Training Modules and Learning Materials
- Organize instructional content by training phase.
- Upload supporting documents and learning materials.
- Include training objectives and learning outcomes.
- Track module completion.
- Allow trainees to access their assigned materials.

### E. Training Schedule and Attendance
- Create training schedules.
- Assign trainers and trainees.
- Record attendance.
- Monitor completed, missed, and rescheduled sessions.
- Maintain attendance history.

### F. Assessment and Evaluation
- Create written examinations and practical assessments.
- Record assessment scores.
- Define passing criteria.
- Evaluate technical knowledge and operational skills.
- Record trainer observations and recommendations.
- Track assessment attempts and results.

### G. Competency Tracking
- Establish a competency framework for Emergency Telecommunicators.
- Map competencies to their corresponding training modules.
- Monitor competency development.
- Identify competencies that require additional training.
- Record evaluator validation and approval.

### H. Reports and Analytics
- Individual trainee progress reports.
- Training attendance reports.
- Assessment and examination results.
- Competency evaluation summaries.
- Onboarding completion reports.
- Overall program performance reports.

Allow authorized users to export reports in PDF and Excel formats.

### I. User and Access Management
- Create and manage system accounts.
- Assign roles and permissions.
- Activate or deactivate accounts.
- Maintain user activity logs.
- Implement secure authentication.

## 7. Onboarding Process Structure

The onboarding program must follow a structured progression:

1. Organizational Orientation
2. Operational Familiarization
3. Technical Instruction
4. Emergency Communications Training
5. Practical Exercises and Scenario-Based Learning
6. Supervised Operational Deployment
7. Competency Assessment and Final Evaluation

Each phase must support:
- Training objectives
- Learning outcomes
- Assigned modules
- Training activities
- Responsible trainers
- Attendance records
- Assessment requirements
- Competency indicators
- Completion status

**Important:** The onboarding phases and their corresponding modules must be configurable. Do not hardcode the entire training curriculum into the application. Administrators should be able to modify the program as CDRRMD training requirements evolve.

## 8. UI/UX Design Requirements

Create a professional, modern, clean, and intuitive administrative dashboard.

The interface should reflect the identity and operational environment of a government disaster risk reduction and emergency response department.

Design direction:
- Professional government enterprise application.
- Clean and minimal interface.
- Light theme as the default.
- White and neutral backgrounds.
- Subtle blue and emergency-response-inspired accent colors.
- Clear typography and visual hierarchy.
- Consistent spacing and alignment.
- Responsive sidebar navigation.
- Functional data tables with search, filtering, sorting, and pagination.
- Informative dashboard cards and charts.
- Clear status indicators and progress visualizations.
- Consistent forms, dialogs, and notification components.

Avoid:
- Excessive gradients.
- Unnecessary animations.
- Glassmorphism.
- Overcrowded dashboards.
- Excessive decorative icons.
- Inconsistent component styling.

Prioritize usability, accessibility, and operational efficiency.

## 9. Database and Architecture Requirements

Design a normalized PostgreSQL database that supports the complete onboarding workflow.

Potential database entities include:

- users
- roles
- permissions
- trainees
- trainers
- onboarding_programs
- onboarding_phases
- training_modules
- training_materials
- training_sessions
- session_attendance
- assessments
- assessment_questions
- assessment_attempts
- assessment_results
- competencies
- trainee_competencies
- competency_evaluations
- onboarding_progress
- certificates
- activity_logs

These are initial suggestions. Refine the database structure based on the actual business requirements and relationships.

Requirements:
- Use appropriate primary and foreign keys.
- Apply database constraints and indexes.
- Implement timestamps where appropriate.
- Use soft deletes where record retention is necessary.
- Avoid unnecessary duplication of data.
- Use Laravel migrations for schema management.
- Implement Eloquent relationships properly.
- Maintain data integrity across related records.

## 10. Security Requirements

Since this application will handle personnel information and internal training records, security must be considered from the beginning.

Implement:
- Secure authentication.
- Role-based authorization.
- Server-side validation.
- Password hashing.
- CSRF protection where applicable.
- Secure API access.
- Protection against SQL injection.
- Secure file uploads.
- Input sanitization where appropriate.
- Audit trails for important administrative actions.
- Environment variables for sensitive credentials.

Never expose database credentials, API secrets, or sensitive configuration values in frontend code or GitHub repositories.

## 11. Development Methodology

Follow a phased, step-by-step development approach.

Do not attempt to generate the entire application in one response.

Use the following development phases:

**Phase 00 – Project Planning and Requirements**
- Analyze the requirements.
- Identify functional and non-functional requirements.
- Define user workflows.
- Finalize system modules.
- Identify missing business requirements.

**Phase 01 – System Architecture and Folder Structure**
- Establish the project architecture.
- Define frontend and backend responsibilities.
- Create the repository structure.
- Document the API communication strategy.

**Phase 02 – Development Environment Setup**
- Initialize Next.js.
- Initialize Laravel.
- Configure PostgreSQL.
- Connect the database using TablePlus.
- Configure environment variables.
- Verify frontend, backend, and database connectivity.

**Phase 03 – Database Design and Implementation**
- Create the database schema.
- Implement Laravel migrations.
- Define models and relationships.
- Create seeders and initial administrative accounts.
- Verify the database through TablePlus.

**Phase 04 – Authentication and Authorization**
- Implement login and logout.
- Configure authentication between Next.js and Laravel.
- Implement RBAC.
- Protect frontend routes and backend endpoints.

**Phase 05 – Dashboard and Main Layout**
- Develop the application layout.
- Implement navigation and sidebar.
- Create role-specific dashboards.
- Integrate dashboard data with the backend.

**Phase 06 – Trainee Management**

**Phase 07 – Onboarding Program and Training Module Management**

**Phase 08 – Training Schedule and Attendance**

**Phase 09 – Assessment and Evaluation**

**Phase 10 – Competency Tracking**

**Phase 11 – Reports and Analytics**

**Phase 12 – User Management and Audit Logs**

**Phase 13 – System Testing and Quality Assurance**

**Phase 14 – Deployment and Documentation**

## 12. AI Development Instructions

Act as a Senior Full-Stack Software Engineer, System Architect, UI/UX Designer, and Technical Mentor.

Follow these instructions throughout development:

1. Work on one phase at a time.
2. Explain the purpose of each implementation step.
3. Provide the exact terminal commands required.
4. Show the folder and file structure before creating or modifying files.
5. Provide complete, working code rather than incomplete snippets.
6. Explain important code sections and architectural decisions.
7. Follow established coding conventions and best practices.
8. Verify implementations before moving to the next phase.
9. Include testing procedures and expected results.
10. Identify and resolve errors before proceeding.
11. Do not introduce unnecessary dependencies.
12. Maintain consistency across frontend components, API endpoints, database models, and naming conventions.
13. Do not assume that a feature has been implemented unless it has been verified.
14. Maintain a development progress checklist and update it after each completed phase.

When encountering errors, explain the cause, provide the solution, and verify the fix.

**IMPORTANT: Do not proceed to the next phase without my confirmation.** I prefer a hands-on, learning-by-doing development process where I can understand, implement, and test each component before moving forward.

## 13. Initial Task

Start with **Phase 00 – Project Planning and Requirements**.

Before writing any code:

1. Analyze the entire project description.
2. Identify potential missing requirements and operational considerations.
3. Propose the complete system architecture.
4. Define the user workflows and permissions.
5. Propose the database entities and relationships.
6. Identify potential improvements to the onboarding management process.
7. Present the finalized development roadmap.

Wait for my approval before proceeding.

The goal is to build a reliable, maintainable, secure, and scalable onboarding management platform that supports the professional development and operational readiness of Emergency Telecommunicators within Butuan City CDRRMD.