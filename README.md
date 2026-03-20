# SkillTrace - Gamified Learning Platform

A comprehensive skill-building platform with AI mentoring, coding challenges, and real-world scenario training.

<img width="1894" height="1035" alt="Screenshot (14)" src="https://github.com/user-attachments/assets/753a822e-d1b7-4e90-8a85-a697c9e57b21" />
<img width="1872" height="1063" alt="Screenshot (12)" src="https://github.com/user-attachments/assets/a006d7a7-66cb-4cff-bbaa-395e39decfa3" />
<img width="1892" height="1055" alt="Screenshot (11)" src="https://github.com/user-attachments/assets/4d15ea45-0c2b-4611-9110-4f7f7586e260" />



## 📚 Development Roadmap

### ✅ Step 1: Build User Dashboard
Users choose skills and see their learning progress.

### ✅ Step 2: Create AI Mentor Chat
Integrated AI model with Socratic method prompts that enforce questioning before answering.

### ✅ Step 3: Build Coding Challenge Environment
Monaco editor for users to solve programming problems with real-time feedback.

### ✅ Step 4: Implement Skill Analytics
Track hints used, time taken, code quality, and quiz results.

### ✅ Step 5: Build Skill Report Dashboard
Display skill score, AI dependency score, and improvement suggestions.

## 🎓 Core Features

### 2. Skill Selection Dashboard
Users choose learning paths from:
- **Python** - Master Python programming
- **Data Structures** - Arrays, linked lists, trees, graphs
- **Web Development** - HTML, CSS, JavaScript, React
- **Machine Learning** - AI, neural networks, predictive models
- **Communication Skills** - Presentations, writing, interpersonal
- **Decision Making** - Analytical thinking, problem-solving

Each skill has progress tracking and personalized learning recommendations.

**Database Tables:**
- `skills` - skill_name, description, difficulty
- `user_skills` - user_id, skill_id, progress_percentage

### 3. Gamified Learning Level System
Each skill contains 5 progressive levels (similar to Duolingo):

1. **Level 1 – Basics** - Learn fundamental concepts
2. **Level 2 – Practice** - Solve real-world problems
3. **Level 3 – Challenge** - Take on intermediate challenges
4. **Level 4 – Mini Project** - Build a complete small project
5. **Level 5 – Boss Challenge** - Master the skill

**Database Tables:**
- `levels` - skill_id, level_number, title, description
- `user_progress` - skill_id, level_id, challenges_completed, score, ai_dependency_score

### 4. Coding Challenge Environment
Users can attempt coding challenges with:
- Problem description with examples
- Monaco code editor (multi-language support)
- Real-time code execution and testing
- AI Mentor chat integration
- Score tracking and performance analytics

**Database Tables:**
- `coding_challenges` - title, description, difficulty, skill_id, test_cases
- `challenge_submissions` - user_id, challenge_id, code, score, execution_result

### 5. Debugging and Case Study Questions
Not just coding - also real workplace scenarios:
- **Debugging exercises** - Fix broken code
- **Decision making questions** - Choose the best approach
- **Teamwork scenarios** - Handle team conflicts
- **Communication situations** - Professional communication

**Database Tables:**
- `scenario_challenges` - title, description, type, skill_category
- `scenario_options` - challenge_id, option_text, is_correct, explanation
- `scenario_answers` - user_id, challenge_id, option_id, score

### 6. AI Mentor Chat System
Intelligent tutoring system using Socratic method:

**Core Rules:**
- ❌ Does NOT immediately give final answers
- ✅ Asks guiding questions first
- ✅ Verifies conceptual understanding
- ✅ Provides small tasks progressively
- ✅ Gives hints and partial solutions if stuck
- ✅ Only provides full solution at the end

**Database Tables:**
- `mentor_chat_logs` - user_id, user_message, ai_response, context, helpful_rating

## 🏗️ Project Structure

```
src/
├── pages/
│   ├── Login.jsx              # Authentication & role selection
│   ├── UserDashboard.jsx      # Main user dashboard
│   ├── SkillSelection.jsx     # Choose learning paths
│   ├── LevelProgression.jsx   # View skill levels
│   ├── CodingChallenge.jsx    # Code editor with AI chat
│   ├── ScenarioChallenge.jsx  # Scenario questions
│   ├── AIMentor.jsx           # AI Mentor chat interface
│   └── ...other pages
├── hooks/
│   └── useAIDetection.js      # AI usage detection
├── utils/
│   └── scoring.js             # Score calculation
└── data/
    └── mockDb.js              # Mock data

backend/
├── models/
│   ├── dbSchema.sql           # Original schema
│   └── skillsSchema.sql       # Skills learning schema
├── routes/
├── controllers/
└── server.js
```

## 📊 Database Schema

All database tables are defined in `backend/models/skillsSchema.sql`

**Key Tables:**
- `users` - User accounts and profiles
- `skills` - Available learning skills
- `user_skills` - User's enrolled skills with progress
- `levels` - Learning levels within each skill
- `coding_challenges` - Programming problems
- `challenge_submissions` - User solutions
- `scenario_challenges` - Real-world scenarios
- `scenario_answers` - User responses
- `mentor_chat_logs` - AI Mentor conversations
- `user_progress` - Comprehensive progress tracking

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Setup database:**
   ```bash
   mysql -u root -p < backend/models/skillsSchema.sql
   ```

3. **Start development:**
   ```bash
   npm run dev          # Frontend
   npm run server       # Backend (in another terminal)
   ```

## 🎮 User Flow

1. **Landing Page** → Choose role (Candidate/HR)
2. **Login/Signup** → Create account
3. **Role Selection** → Select Candidate or Employer role
4. **Skill Selection** → Choose learning paths
5. **Level Progression** → View skill levels (1-5)
6. **Learning Interface:**
   - Coding Challenges with Monaco editor
   - Scenario-based questions
   - AI Mentor support
7. **Dashboard Analytics** → Track progress and improvement

## 🤖 AI Mentor Philosophy

The AI Mentor uses the **Socratic method** to enhance learning:

**Example Interaction:**

User: "I'm stuck on this algorithm"

AI Mentor: "Let me help you think through this:
1. What is the input to this problem?
2. What output do you need to produce?
3. Can you think of a simple approach first?

Once we clarify these, we can optimize together!"

## 📈 Analytics & Scoring

- **Skill Score (0-100)** - Based on challenge performance and quiz results
- **AI Dependency Score (0-100)** - Lower is better; shows independence
- **Progress Tracking** - Lessons completed, challenges solved, time invested
- **Performance Metrics** - Code quality, execution time, test coverage

## 🔐 Authentication

- Email/Password signup and login
- Session management
- Role-based access control
- User profile management

## 🛠️ Technologies

**Frontend:**
- React + Vite
- Tailwind CSS
- Monaco Editor (for coding challenges)
- Lucide Icons
- React Router

**Backend:**
- Node.js + Express
- MySQL
- JWT Authentication
- RESTful API

## 📝 License

Open source learning platform


