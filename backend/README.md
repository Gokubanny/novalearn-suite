# NexFord Edu — Backend API

AI-Integrated Multi-Institutional School Management System

---

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (JSON Web Tokens)
- **AI:** Grok API (xAI) via OpenAI-compatible SDK
- **File Storage:** Cloudinary
- **Email:** Nodemailer
- **Face Recognition:** Python microservice (separate repo)

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Seed the Super Admin
```bash
npx ts-node src/modules/superadmin/seed.ts
```

### 4. Start development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
npm start
```

---

## API Endpoints

### Health Check
```
GET /health
```

---

### Auth — /api/auth

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /register/student | Register as student | Public |
| POST | /register/lecturer | Register as lecturer | Public |
| POST | /login | Login (all roles) | Public |
| POST | /forgot-password | Request password reset | Public |
| PATCH | /reset-password/:token | Reset password | Public |
| GET | /me | Get current user profile | Protected |
| PATCH | /change-password | Change password | Protected |
| PATCH | /update-profile | Update name/phone | Protected |

---

### Super Admin — /api/super-admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /stats | Platform-wide statistics |
| GET | /schools | List all schools (paginated) |
| POST | /schools | Create a new school + admin |
| GET | /schools/:id | Get single school details |
| PATCH | /schools/:id/toggle-status | Activate/suspend a school |
| PATCH | /schools/:id/subscription | Update school subscription |
| GET | /users | List all users |

---

### School Admin — /api/school

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /stats | School dashboard stats |
| GET | /profile | Get school profile |
| PATCH | /profile | Update school profile |
| POST | /logo | Upload school logo |
| POST | /departments | Create department |
| GET | /departments | List departments |
| PATCH | /departments/:id | Update department |
| DELETE | /departments/:id | Deactivate department |
| GET | /students | List all students |
| GET | /students/pending | List pending students |
| PATCH | /students/:id/approve | Approve student |
| PATCH | /students/:id/reject | Reject student |
| PATCH | /students/:id/suspend | Suspend student |
| GET | /lecturers | List all lecturers |
| GET | /lecturers/pending | List pending lecturers |
| PATCH | /lecturers/:id/approve | Approve lecturer |
| PATCH | /lecturers/:id/reject | Reject lecturer |

---

### Courses — /api/courses

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /all | School Admin | All school courses |
| POST | / | Lecturer | Create a course |
| GET | /my-courses | Lecturer | Lecturer's courses |
| PATCH | /:id | Lecturer | Update course |
| DELETE | /:id | Lecturer/Admin | Deactivate course |
| GET | /:courseId/students | Lecturer | Students in course |
| GET | /enrolled | Student | Student's enrolled courses |
| POST | /:courseId/enrol | Student | Enrol in course |
| DELETE | /:courseId/drop | Student | Drop a course |

---

### Attendance — /api/attendance

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /courses/:courseId/facial | Lecturer | Mark attendance via facial recognition (multipart/form-data, field: image) |
| POST | /courses/:courseId/manual | Lecturer | Mark attendance manually |
| GET | /courses/:courseId | Lecturer/Admin | View attendance records |
| GET | /courses/:courseId/my-summary | Student | Student's attendance summary |
| POST | /register-face | Student | Register face for recognition |

**Facial Recognition Request:**
```
POST /api/attendance/courses/:courseId/facial
Content-Type: multipart/form-data
Body: image (file)
```

---

### Results — /api/results

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /courses/:courseId | Lecturer | Upload results |
| PATCH | /courses/:courseId/publish | Lecturer | Publish results |
| GET | /courses/:courseId | Lecturer/Admin | View course results |
| GET | /my-results | Student | View own results |
| GET | /my-transcript | Student | Full academic transcript |

**Upload Results Body:**
```json
{
  "results": [
    { "studentId": "...", "caScore": 35, "examScore": 50 }
  ],
  "semester": "first",
  "session": "2024/2025"
}
```

---

### Assignments — /api/assignments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | / | Lecturer | Create assignment |
| GET | /my-assignments | Lecturer | Lecturer's assignments |
| PATCH | /:assignmentId/grade/:studentId | Lecturer | Grade a submission |
| GET | /student-assignments | Student | Student's assignments |
| POST | /:assignmentId/submit | Student | Submit assignment (file upload) |

---

### AI Study Assistant — /api/ai

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /chat-pdf | Student/Lecturer | Chat with uploaded PDF |
| POST | /chat | Student/Lecturer | General academic chat |
| POST | /summarise | Student/Lecturer | Summarise a PDF |
| POST | /generate-questions | Student/Lecturer | Generate practice questions |
| GET | /performance-insights | Student | AI-generated performance advice |

**Chat with PDF:**
```
POST /api/ai/chat-pdf
Content-Type: multipart/form-data
Body: pdf (file), question (string), conversationHistory (JSON array, optional)
```

**General Chat:**
```json
{
  "question": "Explain polymorphism in OOP",
  "subject": "Computer Science",
  "conversationHistory": []
}
```

---

### Notifications — /api/notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Get my notifications |
| PATCH | /:id/read | Mark one as read |
| PATCH | /read-all | Mark all as read |
| DELETE | /:id | Delete notification |

---

## Grading System (Nigerian University Standard)

| Score | Grade | Grade Point | Class |
|-------|-------|-------------|-------|
| 70–100 | A | 5.0 | First Class |
| 60–69 | B | 4.0 | Second Class Upper |
| 50–59 | C | 3.0 | Second Class Lower |
| 45–49 | D | 2.0 | Third Class |
| 40–44 | E | 1.0 | Pass |
| 0–39 | F | 0.0 | Fail |

---

## User Roles

| Role | Description |
|------|-------------|
| `super_admin` | Platform owner — manages all schools |
| `school_admin` | Manages one institution |
| `lecturer` | Manages courses, attendance, results |
| `student` | Accesses courses, results, AI assistant |

---

## Facial Recognition Integration

The backend calls a separate Python microservice for face recognition.

**Expected Python service endpoints:**
```
POST /register   → Register a student's face encoding
POST /recognize  → Recognize faces in a classroom image
```

Set `FACE_RECOGNITION_SERVICE_URL` in `.env` to point to the Python service.

---

## Subscription Plans

| Plan | Max Students | Max Lecturers | Price |
|------|-------------|---------------|-------|
| Basic | 500 | 50 | ₦500,000/year |
| Pro | 2,000 | 200 | ₦800,000/year |
| Enterprise | 10,000 | 1,000 | ₦1,200,000/year |

---

## Environment Variables

See `.env.example` for all required variables.

---

## Project Structure

```
src/
├── config/          # DB and Cloudinary config
├── middleware/       # Auth, error, upload middleware
├── modules/
│   ├── auth/        # User model, auth controller & routes
│   ├── superadmin/  # Platform management + seed script
│   ├── school/      # School admin management
│   ├── department/  # Department model
│   ├── lecturer/    # Lecturer model
│   ├── student/     # Student model
│   ├── course/      # Course CRUD
│   ├── attendance/  # Facial recognition + manual attendance
│   ├── results/     # Result upload, publish, transcript
│   ├── assignment/  # Assignment creation + submission
│   ├── ai/          # Grok AI study assistant
│   └── notification/ # In-app notifications
├── types/           # TypeScript interfaces & enums
├── utils/           # Email templates, helpers
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```
