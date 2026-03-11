-- Skills Table
CREATE TABLE skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  skill_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Skills Table (tracks which skills user is learning)
CREATE TABLE user_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  progress_percentage INT DEFAULT 0,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  UNIQUE KEY unique_user_skill (user_id, skill_id)
);

-- Levels Table (5 levels per skill)
CREATE TABLE levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  skill_id INT NOT NULL,
  level_number INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  UNIQUE KEY unique_skill_level (skill_id, level_number)
);

-- Coding Challenges Table
CREATE TABLE coding_challenges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  skill_id INT,
  level_id INT,
  created_by INT,
  language VARCHAR(50) DEFAULT 'Python',
  boilerplate_code LONGTEXT,
  test_cases LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  FOREIGN KEY (level_id) REFERENCES levels(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Challenge Submissions Table
CREATE TABLE challenge_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  code_submission LONGTEXT NOT NULL,
  score INT,
  execution_result LONGTEXT,
  status ENUM('submitted', 'evaluated', 'passed', 'failed') DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  evaluated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (challenge_id) REFERENCES coding_challenges(id)
);

-- Scenario Challenges Table (debugging, case studies, communication)
CREATE TABLE scenario_challenges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('debugging', 'decision_making', 'teamwork', 'communication') NOT NULL,
  skill_category VARCHAR(100),
  difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
  skill_id INT,
  level_id INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  FOREIGN KEY (level_id) REFERENCES levels(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Scenario Challenge Options Table
CREATE TABLE scenario_options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  challenge_id INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  explanation TEXT,
  FOREIGN KEY (challenge_id) REFERENCES scenario_challenges(id)
);

-- Scenario Answers Table
CREATE TABLE scenario_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  challenge_id INT NOT NULL,
  option_id INT NOT NULL,
  score INT,
  is_correct BOOLEAN,
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (challenge_id) REFERENCES scenario_challenges(id),
  FOREIGN KEY (option_id) REFERENCES scenario_options(id)
);

-- AI Mentor Chat Logs Table
CREATE TABLE mentor_chat_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  session_id VARCHAR(100),
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context VARCHAR(100),
  helpful_rating INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User Progress Table (overall tracking)
CREATE TABLE user_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  level_id INT NOT NULL,
  challenges_completed INT DEFAULT 0,
  total_score INT DEFAULT 0,
  ai_dependency_score INT DEFAULT 50,
  hints_used INT DEFAULT 0,
  time_spent_minutes INT DEFAULT 0,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (skill_id) REFERENCES skills(id),
  FOREIGN KEY (level_id) REFERENCES levels(id),
  UNIQUE KEY unique_user_skill_level (user_id, skill_id, level_id)
);

-- Indexes for Performance
CREATE INDEX idx_user_skills ON user_skills(user_id);
CREATE INDEX idx_user_challenges ON challenge_submissions(user_id);
CREATE INDEX idx_skill_challenges ON coding_challenges(skill_id);
CREATE INDEX idx_user_mentor_logs ON mentor_chat_logs(user_id);
CREATE INDEX idx_user_progress ON user_progress(user_id);
