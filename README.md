# 🚀 HireAI

<p align="center">
  <strong>AI-Powered Recruitment & Interview Platform</strong>
</p>

<p align="center">
  A production-oriented full-stack recruitment platform that connects
  candidates, HR teams, and administrators through intelligent job management,
  applications, resume analysis, AI-assisted interviews, evaluation, and analytics.
</p>

<p align="center">

[![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS](https://img.shields.io/badge/AWS-Deployed-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/)

</p>

<p align="center">
  <a href="http://3.106.208.191/login">
    <img src="https://img.shields.io/badge/🌐%20LIVE%20DEMO-Visit%20HireAI-2ea44f?style=for-the-badge" />
  </a>
  &nbsp;
  <a href="https://github.com/Debashish0065/HireAI">
    <img src="https://img.shields.io/badge/💻%20SOURCE%20CODE-GitHub-181717?style=for-the-badge&logo=github" />
  </a>
</p>

---

## 💡 What is HireAI?

**HireAI** is a full-stack recruitment and interview management platform
designed to simplify the hiring lifecycle from **job creation to candidate
evaluation**.

Instead of managing jobs, applications, resumes, interviews, and evaluations
across disconnected systems, HireAI brings the complete workflow into one
platform.

### The platform supports three major roles:

| Role | Responsibilities |
|------|------------------|
| 👨‍💻 **Candidate** | Jobs, applications, resumes, interviews & results |
| 🧑‍💼 **HR** | Jobs, applicants, interviews & candidate evaluation |
| 🛡️ **Admin** | Users, jobs, applications, interviews & analytics |

---

# 🎯 The Problem

Traditional recruitment workflows often involve multiple disconnected tools:

```text
Job Posting
     ↓
Application Collection
     ↓
Resume Screening
     ↓
Candidate Shortlisting
     ↓
Interview Scheduling
     ↓
Interview Evaluation
     ↓
Recruiter Decision
-------------------------


HireAI brings these workflows together:

                    ┌─────────────────────┐
                    │   Job Management    │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │    Applications     │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Resume Processing   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │   AI Interview      │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │    Evaluation       │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Recruiter Insights  │
                    └─────────────────────┘
-----------------------------------------------------

✨ Key Features

👨‍💻 Candidate Experience

Candidates can manage their complete recruitment journey.
- 🔐 Secure registration and login
- 👤 Profile management
- 💼 Browse available jobs
- 🔎 Search and view job details
- 📝 Apply for jobs
- 📄 Upload resumes
- 🧠 Resume analysis
- 📋 Track applications
- 🎯 Job matching
- 🎤 Take assigned interviews
- 📊 Track interview progress
- 🏆 View interview scores and evaluations
- 🔔 Receive notifications

🧑‍💼 HR Recruitment Management

HR users have dedicated tools for managing the recruitment lifecycle.

💼 Job Management
- Create jobs
- Edit jobs
- Manage job status
- View job listings
- Define job requirements

👥 Applicant Management
- View applicants
- Review candidate profiles
- Review applications
- Update application status
- Access candidate resumes

🎤 Interview Management
- Create interviews
- Configure interview questions
- Assign interviews
- Monitor interview progress
- Review candidate answers
- View interview evaluations
- Track candidate performance

📊 Recruitment Analytics

HR dashboards provide insights into:
- Recruitment activity
- Applications
- Interviews
- Candidate performance
- Hiring pipeline

🛡️ Admin Dashboard
Administrators have system-level management capabilities.
- 👥 User management
- 💼 Job management
- 📝 Application management
- 🎤 Interview management
- 📊 Recruitment analytics
- 📈 Dashboard statistics
- 🔎 System monitoring
- 🧾 Audit logging

🤖 AI-Powered Interview System

One of the core capabilities of HireAI is its structured AI-assisted interview workflow.
┌─────────────────────────┐
│      HR Creates         │
│        Interview        │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│   Candidate Receives    │
│       Interview         │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│    Candidate Starts     │
│       Interview         │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│    Questions & Answers  │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│     Answer Submission   │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│     AI-Assisted         │
│      Evaluation         │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│    Score + Assessment   │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│    HR / Admin Review    │
└─────────────────────────┘

The interview system tracks:
- Interview status
- Interview questions
- Candidate answers
- Completion percentage
- Interview score
- Evaluation
- Interview statistics
This gives recruiters a structured view of candidate performance.
📄 Resume Intelligence
HireAI supports resume processing as part of the candidate workflow.
Resume Workflow
Resume Upload
      ↓
File Processing
      ↓
PDF Text Extraction
      ↓
Resume Analysis
      ↓
Candidate Profile
      ↓
Job Matching

This provides a foundation for intelligent candidate screening and recommendation.
🎯 Job Matching
HireAI includes a dedicated job matching module.
Candidate Profile
        +
Resume Information
        +
Job Requirements
        ↓
  Matching Engine
        ↓
 Recommended Jobs

The matching functionality helps candidates discover relevant opportunities while supporting recruiters in identifying suitable candidates.

🔐 Security
Security is treated as a core part of the application architecture.
Authentication
- JWT-based authentication
- Secure login flow
- Stateless authentication
- Protected API endpoints
Authorization
Role-based access control separates platform responsibilities:
                    ┌───────────────┐
                    │    ADMIN      │
                    │               │
                    │ System Access │
                    └───────┬───────┘
                            │
              ┌─────────────┴─────────────┐
              ↓                           ↓
       ┌──────────────┐            ┌──────────────┐
       │      HR      │            │   CANDIDATE  │
       │              │            │              │
       │ Recruitment  │            │ Applications │
       │ Management   │            │ Interviews   │
       └──────────────┘            └──────────────┘

Security Practices
- 🔐 JWT authentication
- 🛡️ Role-based authorization
- 🔒 Protected backend endpoints
- 🌱 Environment-based configuration
- 🚫 Sensitive files excluded from Git
- 🧾 Audit logging
- 🔑 Secret management through environment variables

🏗️ Architecture
HireAI follows a layered full-stack architecture.
                         ┌──────────────────────┐
                         │       React.js       │
                         │       Frontend       │
                         └───────────┬──────────┘
                                     │
                                REST APIs
                                     │
                                     ▼
                         ┌──────────────────────┐
                         │     Spring Boot      │
                         │       Backend        │
                         └───────────┬──────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
       │ Authentication│       │   Business   │       │ AI / Analysis│
       │  & Security  │       │    Logic     │       │   Services   │
       └──────────────┘       └───────┬──────┘       └──────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │      MySQL       │
                            │     Database     │
                            └──────────────────┘

🧩 Backend Architecture
The backend is organized into domain-based modules.
src/main/java/com/hireai/

├── admin/
├── analytics/
├── application/
├── audit/
├── auth/
├── candidate/
├── file/
├── hr/
├── interview/
├── job/
├── match/
├── notification/
├── resume/
├── security/
└── user/

The backend follows separation of responsibilities:
Controller
     ↓
 Service
     ↓
Repository
     ↓
 Database

DTOs are used for structured API request and response handling.

⚛️ Frontend Architecture
The React frontend is organized around reusable components and role-specific pages.
hireai-frontend/
│
├── src/
│   ├── components/
│   │
│   ├── pages/
│   │   ├── admin/
│   │   ├── applications/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── hr/
│   │   ├── interview/
│   │   ├── jobs/
│   │   ├── profile/
│   │   └── resume/
│   │
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js

🛠️ Technology Stack

Frontend
Technology	Purpose
React.js	User interface
JavaScript	Application logic
Vite	Frontend build tooling
HTML5 / CSS3	UI structure and styling
REST APIs	Backend communication


Backend
Technology	Purpose
Java	Backend programming language
Spring Boot	Backend framework
Spring Security	Authentication & authorization
JWT	Stateless authentication
Spring Data JPA	Data persistence
Hibernate	ORM
Maven	Dependency management


Data & AI
Technology	Purpose
MySQL	Relational database
PDF Processing	Resume text extraction
AI Integration	AI-assisted recruitment and interview functionality


Deployment & DevOps
Technology	Purpose
Docker	Containerization
Amazon ECR	Container image registry
AWS EC2	Cloud deployment
Git	Version control
GitHub	Source code hosting


🔄 Complete Recruitment Lifecycle
HireAI supports an end-to-end hiring workflow.
01 — Job Creation
HR creates a job and defines the required information.
↓
02 — Candidate Discovery
Candidates browse and explore available opportunities.
↓
03 — Application
Candidates submit applications.
↓
04 — Resume Processing
Candidate resumes are uploaded and processed.
↓
05 — HR Screening
HR reviews applications and candidate information.
↓
06 — Interview
HR assigns an interview to the candidate.
↓
07 — AI-Assisted Evaluation
Candidate answers are evaluated and scored.
↓
08 — Recruiter Review
HR/Admin reviews interview results and candidate performance.

📊 Example Interview Result
A completed interview can provide structured performance information:
┌──────────────────────────────────┐
│         INTERVIEW RESULT         │
├──────────────────────────────────┤
│ Status       : COMPLETED         │
│ Questions    : 5 / 5             │
│ Completion   : 100%              │
│ Score        : 92 / 100          │
│ Assessment   : Excellent         │
└──────────────────────────────────┘

This allows recruiters to quickly understand candidate performance.

🧪 Testing
The backend includes automated tests across major application modules.
Test coverage includes areas such as:
- Authentication
- Users
- Applications
- Jobs
- Interviews
- Interview evaluation
- Resume/file processing
- Notifications
- Analytics
- Admin functionality
- Candidate functionality
- HR functionality
- Job matching
- Audit logging
Run Tests
Windows
.\mvnw.cmd test

Linux / macOS
./mvnw test

🚀 Getting Started
Prerequisites
Install the following:
- Java 17+
- Node.js
- npm
- MySQL
- Git
- Docker (optional)

1️⃣ Clone the Repository
git clone https://github.com/Debashish0065/HireAI.git
cd HireAI

2️⃣ Configure Environment Variables
Use the provided environment template:
.env.example

Configure your local environment with:
DB_USERNAME=
DB_PASSWORD=

JWT_SECRET=

GEMINI_API_KEY=

MAIL_USERNAME=
MAIL_PASSWORD=

⚠️ Never commit your real .env file or production credentials.

3️⃣ Start the Backend
Windows
.\mvnw.cmd spring-boot:run

Linux / macOS
./mvnw spring-boot:run

4️⃣ Start the Frontend
Open another terminal:
cd hireai-frontend
npm install
npm run dev

The frontend will then be available through the Vite development server.

🐳 Docker
The repository includes Docker configuration for containerized deployment.
Build the Backend Image
docker build -t hireai-backend .

Run with Docker Compose
docker compose up --build

☁️ AWS Deployment

HireAI has been deployed using a container-based AWS architecture.
                       GitHub
                          │
                          ▼
                       Docker
                          │
                          ▼
                    Amazon ECR
                          │
                          ▼
                       AWS EC2
                          │
                          ▼
                   Spring Boot API
                          │
                          ▼
                        MySQL

The deployment demonstrates practical experience with:
- Cloud deployment
- Docker containerization
- Amazon ECR
- AWS EC2
- Environment-based configuration
- Production-style application deployment

🌐 Live Demo
Try HireAI
<p align="center">
  <a href="http://3.106.208.191/login">
    <img src="https://img.shields.io/badge/🚀%20OPEN%20HIREAI-Live%20Application-2ea44f?style=for-the-badge" alt="Open HireAI"/>
  </a>
</p>

Live Application
http://3.106.208.191/login
GitHub Repository
https://github.com/Debashish0065/HireAI
💡 For demonstration purposes, use appropriate demo/test accounts and avoid exposing sensitive candidate information.

📸 Screenshots
<img width="1862" height="943" alt="Screenshot 2026-10-04 162135" src="https://github.com/user-attachments/assets/befcf4b6-7de4-4f36-863a-d8b4b4db3058" />
<img width="1191" height="491" alt="Screenshot 2026-10-04 162109" src="https://github.com/user-attachments/assets/990a936f-ebc2-48bd-8b30-9ec2a232a361" />
<img width="1100" height="915" alt="Screenshot 2026-10-04 162056" src="https://github.com/user-attachments/assets/3fbd4e6c-3257-4cb3-bbee-2a375f33e374" />
<img width="1156" height="946" alt="Screenshot 2026-10-04 162024" src="https://github.com/user-attachments/assets/47c7e642-d3c8-409b-a062-e730fbb8c9d1" />
<img width="1215" height="637" alt="Screenshot 2026-10-04 162005" src="https://github.com/user-attachments/assets/cfeb515d-891d-4790-93ae-580de1404d06" />
<img width="897" height="920" alt="Screenshot 2026-10-04 161954" src="https://github.com/user-attachments/assets/36bdc6d3-f9b1-4d1f-971e-686e2d64a7f3" />
<img width="1192" height="981" alt="Screenshot 2026-10-04 161936" src="https://github.com/user-attachments/assets/647f4e08-7202-4d35-a544-8eb9ea8feecf" />
<img width="1268" height="982" alt="Screenshot 2026-10-04 161920" src="https://github.com/user-attachments/assets/75929f4a-77ac-4bf9-9475-65ebeb2a31fc" />
<img width="1282" height="990" alt="Screenshot 2026-10-04 161857" src="https://github.com/user-attachments/assets/ecad76e8-c9f2-4171-a437-4b3ff8d5218d" />
<img width="1105" height="867" alt="Screenshot 2026-10-04 161840" src="https://github.com/user-attachments/assets/0347f672-d0fc-4763-b0e1-377fad1cec3b" />
<img width="1875" height="984" alt="Screenshot 2026-10-04 161825" src="https://github.com/user-attachments/assets/f420ad4d-fbca-4587-8c42-b62f788241b6" />
<img width="1202" height="842" alt="Screenshot 2026-10-04 161730" src="https://github.com/user-attachments/assets/00aa4aa9-9d92-4858-b71f-8899c2a56d9a" />
<img width="1278" height="819" alt="Screenshot 2026-10-04 161716" src="https://github.com/user-attachments/assets/2d91864a-88eb-4d28-9a8d-f625fc584777" />
<img width="893" height="982" alt="Screenshot 2026-10-04 161657" src="https://github.com/user-attachments/assets/35a6d6c8-f860-473c-a542-052f355ce18e" />
<img width="1183" height="972" alt="Screenshot 2026-10-04 161634" src="https://github.com/user-attachments/assets/44b9e3f4-d8f5-4808-9fb8-9453115d868e" />
<img width="1236" height="762" alt="Screenshot 2026-10-04 161615" src="https://github.com/user-attachments/assets/0ff6e886-4a81-45c9-92fa-ff6d7a9ccb12" />
<img width="915" height="776" alt="Screenshot 2026-10-04 161601" src="https://github.com/user-attachments/assets/d2eda2b8-6bb6-46c6-88a2-6ea80ce233d6" />
<img width="1298" height="897" alt="Screenshot 2026-10-04 161551" src="https://github.com/user-attachments/assets/f3d3ad91-57d4-4b34-b4a7-fa18c8a09b28" />
<img width="1307" height="917" alt="Screenshot 2026-10-04 161532" src="https://github.com/user-attachments/assets/99fa8843-fca4-4282-8221-709626385775" />
<img width="1275" height="905" alt="Screenshot 2026-10-04 161512" src="https://github.com/user-attachments/assets/6903567c-96b9-4c3f-9559-d1b3c14a1ec4" />
<img width="1235" height="982" alt="Screenshot 2026-10-04 161443" src="https://github.com/user-attachments/assets/a09d9b7e-4b31-48f1-bbfe-c4c6cce6a271" />
<img width="1360" height="978" alt="Screenshot 2026-10-04 161346" src="https://github.com/user-attachments/assets/e7d3572b-bbb3-497a-a364-cd3d8176efcb" />
<img width="1031" height="918" alt="Screenshot 2026-10-04 161319" src="https://github.com/user-attachments/assets/15957d9d-e545-4a16-8c63-19146550a04d" />
<img width="1439" height="805" alt="Screenshot 2026-10-04 161309" src="https://github.com/user-attachments/assets/6f58f752-97d7-45d7-8cc8-604f7ca8fc86" />
<img width="1357" height="952" alt="Screenshot 2026-10-04 161248" src="https://github.com/user-attachments/assets/e3fe77b8-c547-42fb-add8-8e77bf797e8a" />
<img width="1409" height="884" alt="Screenshot 2026-10-04 161231" src="https://github.com/user-attachments/assets/77f4db53-87e6-4c31-838e-c3321e939633" />
<img width="1242" height="937" alt="Screenshot 2026-10-04 161206" src="https://github.com/user-attachments/assets/1f9e916d-2f61-4536-abf3-e2c9d6f3d03e" />
<img width="1402" height="966" alt="Screenshot 2026-10-04 161141" src="https://github.com/user-attachments/assets/6e0df63e-0fcf-450d-b441-b5165b97addf" />
<img width="1902" height="995" alt="Screenshot 2026-10-04 161115" src="https://github.com/user-attachments/assets/72243890-704f-42be-9165-96808cac6f7a" />


💼 Engineering Highlights
HireAI demonstrates practical full-stack software engineering experience.

Backend Development
- Designed RESTful APIs using Spring Boot
- Implemented layered architecture
- Built service and repository layers
- Implemented DTO-based API contracts
- Integrated Spring Data JPA
- Implemented JWT authentication
- Implemented role-based authorization
- Implemented file processing
- Implemented PDF text extraction
- Integrated AI functionality
- Implemented notification services
- Implemented audit logging

Frontend Development
- Built React-based role-specific dashboards
- Implemented reusable components
- Integrated REST APIs
- Implemented authentication flows
- Implemented protected application workflows
- Implemented loading and error states
- Built candidate, HR and admin interfaces
- Built interview and evaluation interfaces

Deployment & DevOps
- Git/GitHub version control
- Docker containerization
- AWS EC2 deployment
- Amazon ECR image management
- Environment-based configuration

🔒 Repository Security
Sensitive configuration is intentionally excluded from source control.
The repository ignores:
.env
.env.*
*.pem
node_modules/
dist/
target/

Production secrets should be supplied through environment variables or a dedicated secrets-management system.
🔐 Never commit API keys, database passwords, JWT secrets, AWS credentials, private keys, or other sensitive configuration.

📈 Project Highlights

Area	Implementation
🔐 Authentication	JWT + Spring Security
🛡️ Authorization	Role-based access control
⚛️ Frontend	React + Vite
☕ Backend	Java + Spring Boot
🗄️ Database	MySQL
🔗 ORM	JPA / Hibernate
🤖 AI	AI-assisted recruitment/interview functionality
📄 Resume Processing	PDF text extraction
🌐 APIs	REST
🧪 Testing	JUnit / Spring testing
🐳 Containerization	Docker
☁️ Cloud	AWS EC2 + ECR
📦 Version Control	Git + GitHub


🗺️ Future Improvements
Potential future enhancements include:
- 🎙️ Voice-based AI interviews
- 📹 Video interview support
- 🧠 Advanced resume intelligence
- 🎯 Improved candidate-job matching
- 📊 Advanced recruiter analytics
- 📅 Interview calendar integration
- 📧 Automated interview scheduling
- 🔔 Real-time notifications
- ⚙️ CI/CD pipeline
- 🧪 Expanded end-to-end testing
- 📱 Progressive Web App support

🎓 What I Learned
Building HireAI provided hands-on experience with the complete lifecycle of a real-world full-stack application.

Technical
- Designing REST APIs
- Building Spring Boot applications
- Implementing JWT security
- Working with relational databases
- Building React applications
- Integrating frontend and backend systems
- Handling file uploads and PDF processing
- Integrating AI capabilities
- Writing automated tests
- Containerizing applications
- Deploying applications to AWS

Engineering
- Designing modular application architecture
- Separating business logic from controllers
- Handling authentication and authorization
- Managing environment-specific configuration
- Designing role-based workflows
- Debugging production issues
- Maintaining source control
- Thinking about security and scalability

👨‍💻 Developer
Debashis Satapathy
Java Backend Developer | Full Stack Developer
I enjoy building practical software products using Java, Spring Boot, React, databases, and modern cloud technologies.
Connect With Me
<p>
  <a href="https://github.com/Debashish0065">
    <img src="https://img.shields.io/badge/GitHub-Debashish0065-181717?style=for-the-badge&logo=github" alt="GitHub"/>
  </a>
</p>

<p>
  <a href="https://github.com/Debashish0065/HireAI">
    <img src="https://img.shields.io/badge/HireAI-Repository-blue?style=for-the-badge&logo=github" alt="HireAI Repository"/>
  </a>
</p>

<p>
  <a href="http://3.106.208.191/login">
    <img src="https://img.shields.io/badge/HireAI-Live%20Demo-2ea44f?style=for-the-badge" alt="HireAI Live Demo"/>
  </a>
</p>


⭐ Support the Project
If you find HireAI interesting or useful, consider giving the repository a ⭐ on GitHub.
It helps support the project and encourages further development.
<p align="center">

🚀 Built with Java • Spring Boot • React • MySQL • Docker • AWS
HireAI — Simplifying Recruitment Through Technology
</p>
```
                    
