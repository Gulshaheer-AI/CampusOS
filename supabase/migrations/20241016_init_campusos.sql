-- CampusOS Production PostgreSQL Schema & Supabase Migrations
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL, -- references auth.users(id) in Supabase
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    department TEXT,
    degree TEXT,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    theme_preference TEXT DEFAULT 'dark',
    email_notifications BOOLEAN DEFAULT TRUE,
    learning_pace TEXT DEFAULT 'regular',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COURSES & ENROLLMENTS
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_count INT DEFAULT 0,
    level TEXT DEFAULT 'Intermediate',
    category TEXT NOT NULL,
    class_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration_minutes INT DEFAULT 20,
    lesson_type TEXT DEFAULT 'reading',
    summary TEXT,
    content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);

CREATE TABLE IF NOT EXISTS course_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    material_type TEXT NOT NULL, -- 'pdf', 'notes', 'code', 'link'
    file_size TEXT,
    file_url TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI TUTOR CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS tutor_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    level TEXT DEFAULT 'intermediate',
    style TEXT DEFAULT 'step_by_step',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tutor_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES tutor_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    code_snippet JSONB,
    citations TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUIZZES, QUESTIONS & ATTEMPTS
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    difficulty TEXT DEFAULT 'intermediate',
    duration_minutes INT DEFAULT 15,
    creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_draft BOOLEAN DEFAULT FALSE,
    class_code TEXT,
    passing_score INT DEFAULT 70,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- 'multiple_choice', 'true_false', 'short_answer'
    options JSONB,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT DEFAULT 'intermediate'
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    score_percentage INT NOT NULL,
    correct_count INT NOT NULL,
    total_questions INT NOT NULL,
    passed BOOLEAN NOT NULL,
    weak_topics TEXT[],
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROADMAPS & CHALLENGES
CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_weeks INT DEFAULT 4,
    skills_gained TEXT[]
);

CREATE TABLE IF NOT EXISTS challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    xp INT DEFAULT 200,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    deliverables TEXT[],
    starter_code TEXT,
    rubric JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS challenge_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    submission_url TEXT NOT NULL,
    repo_url TEXT,
    notes TEXT,
    status TEXT DEFAULT 'submitted', -- 'submitted', 'reviewed', 'approved'
    feedback TEXT,
    score INT,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PORTFOLIO & OPPORTUNITIES
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[],
    demo_url TEXT,
    github_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    verified BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    remote BOOLEAN DEFAULT FALSE,
    deadline DATE NOT NULL,
    stipend_or_award TEXT,
    description TEXT NOT NULL,
    requirements TEXT[],
    application_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'saved',
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, user_id)
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

-- 1. Profiles policy: users can read public profile data; only self can update
CREATE POLICY "Public profiles are readable" ON profiles
    FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 2. Conversations policy: users can only see their own conversations
CREATE POLICY "Users access own tutor conversations" ON tutor_conversations
    FOR ALL USING (auth.uid() = user_id);

-- 3. Quiz attempts: students can view only their own attempts; teachers can view attempts for their assigned quizzes
CREATE POLICY "Students view own quiz attempts" ON quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

-- 4. Portfolio: public projects visible to all; private projects visible only to owner
CREATE POLICY "Public portfolio projects visible" ON portfolio_projects
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);
