# Example API Requests and Responses

## 1. Register a Candidate
**Request:**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Alex Candidate",
  "email": "alex@example.com",
  "password": "securepassword123",
  "role": "candidate"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Alex Candidate",
    "email": "alex@example.com",
    "role": "candidate"
  }
}
```

## 2. Login
**Request:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "alex@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Alex Candidate",
    "email": "alex@example.com",
    "role": "candidate"
  }
}
```

## 3. Create a Challenge (HR Only)
**Request:**
```http
POST /challenges
Authorization: Bearer <HR_JWT_TOKEN>
Content-Type: application/json

{
  "title": "Debug Payment Flow",
  "description": "The payment gateway fails on concurrent transactions. Fix the race condition.",
  "type": "debugging",
  "difficulty": "Hard",
  "questions": [
    {
      "question_text": "Identify the flawed line of code.",
      "code_snippet": "function process(req) { ... }",
      "expected_answer": "Line 42 has a race condition",
      "points": 50
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "message": "Challenge created successfully",
  "challenge": {
    "id": "987fcdeb-51a2-43d7-9012-3456789abcde",
    "title": "Debug Payment Flow",
    "description": "The payment...",
    "type": "debugging",
    "difficulty": "Hard",
    "created_by": "hr-user-uuid",
    "created_at": "2023-10-25T12:00:00Z"
  }
}
```

## 4. Submit Answer and Telemetry
**Request:**
```http
POST /submissions
Authorization: Bearer <CANDIDATE_JWT_TOKEN>
Content-Type: application/json

{
  "challenge_id": "987fcdeb-51a2-43d7-9012-3456789abcde",
  "question_id": "question-uuid-here",
  "answer": "The issue is a missing transaction lock on row 42.",
  "telemetry": {
    "tab_switch_count": 2,
    "copy_paste_count": 0,
    "focus_loss_count": 1,
    "ai_usage_flag": false
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Submission processed",
  "submission": {
    "id": "sub-uuid-here",
    "user_id": "cand-uuid-here",
    "challenge_id": "987fcdeb-51a2-43d7-9012-3456789abcde",
    "question_id": "question-uuid-here",
    "answer": "The issue is...",
    "score": 85,
    "submitted_at": "2023-10-26T14:30:00Z"
  },
  "mappedSkills": {
    "coding_score": 0,
    "debugging_score": 85,
    "decision_score": 0,
    "communication_score": 0,
    "integrity_score": 75,
    "overall_score": 16
  }
}
```

## 5. Fetch HR Analytics Dashboard
**Request:**
```http
GET /hr/candidates
Authorization: Bearer <HR_JWT_TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "user_id": "cand-uuid-here",
    "name": "Alex Candidate",
    "email": "alex@example.com",
    "aggregated_skill_index": "88.50",
    "average_integrity": "75.00"
  }
]
```
