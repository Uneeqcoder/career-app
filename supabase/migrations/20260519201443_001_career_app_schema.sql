/*
  # Career App - Core Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `grade_level` (text)
      - `age_range` (text)
      - `personality_type` (text) - CREATOR, BUILDER, THINKER, HELPER, LEADER, ORGANIZER
      - `xp` (integer, default 0)
      - `level` (integer, default 1)
      - `onboarding_completed` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `career_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `icon` (text) - lucide icon name
      - `color` (text) - hex color
      - `sort_order` (integer)

    - `careers`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `category_id` (uuid, references career_categories)
      - `description` (text)
      - `what_they_do` (text)
      - `salary_min` (integer)
      - `salary_max` (integer)
      - `growth_outlook` (text) - growing, stable, declining
      - `education_needed` (text)
      - `work_environment` (text)
      - `remote_friendly` (boolean, default false)
      - `skills_needed` (text[]) - array of skills
      - `tools_used` (text[]) - array of tools/software
      - `day_in_the_life` (text)
      - `steps_to_get_there` (jsonb) - array of step objects
      - `personality_tags` (text[]) - which personality types this suits
      - `creativity_level` (integer 1-5)
      - `analytical_level` (integer 1-5)
      - `social_level` (integer 1-5)
      - `independence_level` (integer 1-5)
      - `image_url` (text)
      - `video_url` (text)
      - `created_at` (timestamptz)

    - `quiz_questions`
      - `id` (uuid, primary key)
      - `quiz_type` (text) - personality, interest, skills, work_style
      - `question_text` (text)
      - `options` (jsonb) - array of {text, personality_tag, weight}
      - `sort_order` (integer)
      - `created_at` (timestamptz)

    - `quiz_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `quiz_type` (text)
      - `personality_type` (text)
      - `scores` (jsonb) - {CREATOR: 80, BUILDER: 30, ...}
      - `answers` (jsonb) - stored answers
      - `completed_at` (timestamptz)

    - `saved_careers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `career_id` (uuid, references careers)
      - `created_at` (timestamptz)

    - `career_match_scores`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `career_id` (uuid, references careers)
      - `match_score` (integer 0-100)
      - `created_at` (timestamptz)

    - `future_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `career_id` (uuid, references careers)
      - `steps` (jsonb) - ordered array of step objects
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `achievements`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `icon` (text)
      - `xp_reward` (integer)
      - `condition` (jsonb) - condition to earn

    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `achievement_id` (uuid, references achievements)
      - `earned_at` (timestamptz)

    - `inspirational_quotes`
      - `id` (uuid, primary key)
      - `text` (text)
      - `author` (text)
      - `category` (text)

  2. Security
    - Enable RLS on ALL tables
    - Profiles: users can read/update own, read all
    - Career data (categories, careers, quiz_questions, quotes): public read
    - User data (quiz_results, saved_careers, career_match_scores, future_plans, user_achievements): users can only access own
    - Achievements: public read, users insert own earned achievements
*/

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  grade_level text DEFAULT '',
  age_range text DEFAULT '',
  personality_type text DEFAULT '',
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Career Categories
CREATE TABLE IF NOT EXISTS career_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  color text DEFAULT '#3B82F6',
  sort_order integer DEFAULT 0
);

ALTER TABLE career_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read career categories"
  ON career_categories FOR SELECT
  TO authenticated
  USING (true);

-- Careers
CREATE TABLE IF NOT EXISTS careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category_id uuid REFERENCES career_categories(id) ON DELETE SET NULL,
  description text DEFAULT '',
  what_they_do text DEFAULT '',
  salary_min integer DEFAULT 0,
  salary_max integer DEFAULT 0,
  growth_outlook text DEFAULT 'stable',
  education_needed text DEFAULT '',
  work_environment text DEFAULT '',
  remote_friendly boolean DEFAULT false,
  skills_needed text[] DEFAULT '{}',
  tools_used text[] DEFAULT '{}',
  day_in_the_life text DEFAULT '',
  steps_to_get_there jsonb DEFAULT '[]',
  personality_tags text[] DEFAULT '{}',
  creativity_level integer DEFAULT 3,
  analytical_level integer DEFAULT 3,
  social_level integer DEFAULT 3,
  independence_level integer DEFAULT 3,
  image_url text DEFAULT '',
  video_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE careers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read careers"
  ON careers FOR SELECT
  TO authenticated
  USING (true);

-- Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_type text NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quiz questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

-- Quiz Results
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type text NOT NULL,
  personality_type text DEFAULT '',
  scores jsonb DEFAULT '{}',
  answers jsonb DEFAULT '[]',
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz results"
  ON quiz_results FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Saved Careers
CREATE TABLE IF NOT EXISTS saved_careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, career_id)
);

ALTER TABLE saved_careers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved careers"
  ON saved_careers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved careers"
  ON saved_careers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved careers"
  ON saved_careers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Career Match Scores
CREATE TABLE IF NOT EXISTS career_match_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  career_id uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  match_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, career_id)
);

ALTER TABLE career_match_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own match scores"
  ON career_match_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own match scores"
  ON career_match_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own match scores"
  ON career_match_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own match scores"
  ON career_match_scores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Future Plans
CREATE TABLE IF NOT EXISTS future_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT '',
  career_id uuid REFERENCES careers(id) ON DELETE SET NULL,
  steps jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE future_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own future plans"
  ON future_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own future plans"
  ON future_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own future plans"
  ON future_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own future plans"
  ON future_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT '',
  xp_reward integer DEFAULT 0,
  condition jsonb DEFAULT '{}'
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Inspirational Quotes
CREATE TABLE IF NOT EXISTS inspirational_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text DEFAULT '',
  category text DEFAULT ''
);

ALTER TABLE inspirational_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quotes"
  ON inspirational_quotes FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_careers_category ON careers(category_id);
CREATE INDEX IF NOT EXISTS idx_careers_slug ON careers(slug);
CREATE INDEX IF NOT EXISTS idx_careers_personality ON careers USING GIN(personality_tags);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON quiz_questions(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_careers_user ON saved_careers(user_id);
CREATE INDEX IF NOT EXISTS idx_match_scores_user ON career_match_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_future_plans_user ON future_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
