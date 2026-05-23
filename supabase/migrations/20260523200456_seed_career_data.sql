/*
  # Seed Career App Data

  This migration seeds the database with:
  1. Career categories (STEM, Creative, Business, Healthcare, etc.)
  2. Careers (100+ careers with detailed information)
  3. Quiz questions (40+ personality, interest, skills, and work style questions)
  4. Achievements (gamification badges)
  5. Inspirational quotes

  All data is structured for the career exploration app.
*/

-- Seed Career Categories
INSERT INTO career_categories (name, slug, description, icon, color, sort_order) VALUES
  ('Technology & Engineering', 'tech-engineering', 'Computer science, software development, IT, and engineering roles', 'code', '#3B82F6', 1),
  ('Creative & Arts', 'creative-arts', 'Design, media, entertainment, and artistic careers', 'palette', '#8B5CF6', 2),
  ('Business & Finance', 'business-finance', 'Business management, accounting, finance, and entrepreneurship', 'briefcase', '#F59E0B', 3),
  ('Healthcare & Medicine', 'healthcare-medicine', 'Medical, nursing, mental health, and wellness careers', 'heart', '#EF4444', 4),
  ('Science & Research', 'science-research', 'Biology, chemistry, physics, environmental science, and research', 'flask', '#10B981', 5),
  ('Education & Training', 'education-training', 'Teaching, training, coaching, and educational leadership', 'book-open', '#06B6D4', 6),
  ('Sales & Marketing', 'sales-marketing', 'Sales, marketing, advertising, and brand management', 'trending-up', '#EC4899', 7),
  ('Trades & Construction', 'trades-construction', 'Electrician, plumbing, carpentry, HVAC, and skilled trades', 'hammer', '#92400E', 8),
  ('Legal & Government', 'legal-government', 'Law, public service, politics, and civil service', 'scale', '#7C3AED', 9),
  ('Hospitality & Service', 'hospitality-service', 'Hotel management, food service, tourism, and customer service', 'utensils', '#F97316', 10)
ON CONFLICT DO NOTHING;

-- Get category IDs for use in career inserts
WITH cat_ids AS (
  SELECT id, slug FROM career_categories
)
INSERT INTO careers (
  title, slug, category_id, description, what_they_do, salary_min, salary_max,
  growth_outlook, education_needed, work_environment, remote_friendly,
  skills_needed, tools_used, day_in_the_life, personality_tags,
  creativity_level, analytical_level, social_level, independence_level, image_url
) VALUES
  -- Technology & Engineering
  ('Software Engineer', 'software-engineer', (SELECT id FROM cat_ids WHERE slug = 'tech-engineering'),
   'Design and develop software applications', 'Write code, fix bugs, implement features, and maintain software systems',
   80000, 180000, 'growing', 'Bachelor in Computer Science or related field',
   'Office/Remote', true, ARRAY['Programming', 'Problem Solving', 'Debugging', 'System Design'],
   ARRAY['Python', 'JavaScript', 'Git', 'Docker'], 'Code review with team, attend standups, write documentation',
   ARRAY['BUILDER', 'THINKER', 'ORGANIZER'], 3, 5, 3, 4, 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg'),

  ('Data Scientist', 'data-scientist', (SELECT id FROM cat_ids WHERE slug = 'tech-engineering'),
   'Analyze complex data to guide business decisions', 'Build models, analyze data patterns, create visualizations, and present insights',
   90000, 200000, 'growing', 'Bachelor in Mathematics, Statistics, or Computer Science',
   'Office/Remote', true, ARRAY['Statistics', 'Machine Learning', 'Data Analysis', 'Communication'],
   ARRAY['Python', 'SQL', 'Tableau', 'TensorFlow'], 'Write code for analysis, build dashboards, present findings',
   ARRAY['THINKER', 'BUILDER'], 2, 5, 3, 4, 'https://images.pexels.com/photos/3994783/pexels-photo-3994783.jpeg'),

  ('Web Developer', 'web-developer', (SELECT id FROM cat_ids WHERE slug = 'tech-engineering'),
   'Create websites and web applications', 'Build user interfaces, connect to databases, test functionality, deploy to web',
   70000, 150000, 'growing', 'Associate or Bachelor in Computer Science, coding bootcamp',
   'Office/Remote', true, ARRAY['HTML/CSS', 'JavaScript', 'React', 'UI/UX Understanding'],
   ARRAY['React', 'Node.js', 'MongoDB'], 'Write frontend code, fix bugs, collaborate with designers',
   ARRAY['CREATOR', 'BUILDER'], 4, 4, 3, 4, 'https://images.pexels.com/photos/3183186/pexels-photo-3183186.jpeg'),

  ('Cybersecurity Analyst', 'cybersecurity-analyst', (SELECT id FROM cat_ids WHERE slug = 'tech-engineering'),
   'Protect computer networks from attacks', 'Monitor systems, identify vulnerabilities, implement security measures',
   85000, 170000, 'growing', 'Bachelor in Cybersecurity or IT, plus certifications',
   'Office', false, ARRAY['Network Security', 'Threat Analysis', 'Problem Solving', 'Attention to Detail'],
   ARRAY['Linux', 'Wireshark', 'Metasploit'], 'Monitor security logs, test defenses, respond to incidents',
   ARRAY['THINKER', 'ORGANIZER'], 2, 5, 2, 4, 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg'),

  ('Mobile App Developer', 'mobile-app-developer', (SELECT id FROM cat_ids WHERE slug = 'tech-engineering'),
   'Develop applications for phones and tablets', 'Code apps, test functionality, publish to app stores, support users',
   75000, 160000, 'growing', 'Bachelor in Computer Science or bootcamp training',
   'Office/Remote', true, ARRAY['Swift', 'Kotlin', 'App Design', 'User Experience'],
   ARRAY['Xcode', 'Android Studio', 'Flutter'], 'Write app code, debug issues, update apps regularly',
   ARRAY['BUILDER', 'CREATOR'], 4, 4, 2, 4, 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg'),

  -- Creative & Arts
  ('Graphic Designer', 'graphic-designer', (SELECT id FROM cat_ids WHERE slug = 'creative-arts'),
   'Create visual designs for brands and products', 'Design logos, websites, packaging, and marketing materials',
   50000, 120000, 'stable', 'Bachelor in Graphic Design or related field',
   'Office/Remote', true, ARRAY['Visual Design', 'Creativity', 'Attention to Detail', 'Communication'],
   ARRAY['Photoshop', 'Illustrator', 'Figma'], 'Design layouts, meet with clients, iterate on concepts',
   ARRAY['CREATOR', 'HELPER'], 5, 3, 3, 3, 'https://images.pexels.com/photos/3677873/pexels-photo-3677873.jpeg'),

  ('UX/UI Designer', 'ux-ui-designer', (SELECT id FROM cat_ids WHERE slug = 'creative-arts'),
   'Design user experiences for digital products', 'Create wireframes, prototypes, and design systems for apps and websites',
   65000, 140000, 'growing', 'Bachelor in Design or Tech, or UX bootcamp',
   'Office/Remote', true, ARRAY['User Research', 'Wireframing', 'Prototyping', 'Problem Solving'],
   ARRAY['Figma', 'Adobe XD', 'Sketch'], 'Interview users, design mockups, test with users',
   ARRAY['CREATOR', 'THINKER', 'HELPER'], 4, 4, 4, 3, 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg'),

  ('Content Writer', 'content-writer', (SELECT id FROM cat_ids WHERE slug = 'creative-arts'),
   'Write content for websites, blogs, and social media', 'Create engaging articles, social posts, and marketing copy',
   45000, 100000, 'stable', 'Bachelor in Journalism, English, or Communications',
   'Office/Remote', true, ARRAY['Writing', 'Research', 'SEO', 'Storytelling'],
   ARRAY['WordPress', 'Grammarly', 'Google Analytics'], 'Write articles, optimize for SEO, interact with audience',
   ARRAY['CREATOR', 'HELPER'], 4, 2, 3, 4, 'https://images.pexels.com/photos/34577/pexels-photo.jpg'),

  ('Video Editor', 'video-editor', (SELECT id FROM cat_ids WHERE slug = 'creative-arts'),
   'Edit and produce video content', 'Cut footage, add effects, color grade, create final videos for distribution',
   50000, 110000, 'growing', 'Certificate in Film or bootcamp, portfolio required',
   'Office/Remote', true, ARRAY['Video Editing', 'Technical Skills', 'Creativity', 'Attention to Detail'],
   ARRAY['Adobe Premiere', 'DaVinci Resolve', 'After Effects'], 'Edit footage, add graphics, deliver final videos',
   ARRAY['CREATOR', 'THINKER'], 5, 3, 2, 3, 'https://images.pexels.com/photos/3945657/pexels-photo-3945657.jpeg'),

  ('Animator', 'animator', (SELECT id FROM cat_ids WHERE slug = 'creative-arts'),
   'Create animated content for film, TV, and digital media', 'Design characters, create keyframes, produce animations',
   55000, 130000, 'stable', 'Bachelor in Animation or Digital Arts',
   'Office', false, ARRAY['Animation', 'Storytelling', 'Drawing', 'Technical Skills'],
   ARRAY['Maya', 'Blender', 'Unreal Engine'], 'Create animations, work with teams, iterate on designs',
   ARRAY['CREATOR', 'THINKER'], 5, 4, 3, 3, 'https://images.pexels.com/photos/3721528/pexels-photo-3721528.jpeg'),

  -- Business & Finance
  ('Accountant', 'accountant', (SELECT id FROM cat_ids WHERE slug = 'business-finance'),
   'Manage financial records and tax compliance', 'Prepare financial statements, manage accounts, ensure compliance',
   60000, 120000, 'stable', 'Bachelor in Accounting, CPA certification',
   'Office', false, ARRAY['Accounting', 'Attention to Detail', 'Organization', 'Compliance'],
   ARRAY['Excel', 'QuickBooks', 'SAP'], 'Review documents, prepare reports, reconcile accounts',
   ARRAY['ORGANIZER', 'THINKER'], 2, 5, 2, 3, 'https://images.pexels.com/photos/3760793/pexels-photo-3760793.jpeg'),

  ('Financial Advisor', 'financial-advisor', (SELECT id FROM cat_ids WHERE slug = 'business-finance'),
   'Help clients manage their investments and finances', 'Analyze portfolios, provide recommendations, manage client relationships',
   70000, 180000, 'stable', 'Bachelor in Finance, Series 7 certification',
   'Office', false, ARRAY['Finance', 'Communication', 'Analysis', 'Client Relations'],
   ARRAY['Bloomberg', 'Morningstar', 'Financial Models'], 'Meet clients, analyze investments, present strategies',
   ARRAY['HELPER', 'THINKER', 'LEADER'], 2, 5, 5, 4, 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg'),

  ('Business Manager', 'business-manager', (SELECT id FROM cat_ids WHERE slug = 'business-finance'),
   'Oversee business operations and teams', 'Manage budgets, hire staff, improve processes, meet targets',
   75000, 150000, 'stable', 'Bachelor in Business Administration',
   'Office', false, ARRAY['Leadership', 'Strategic Planning', 'Communication', 'Problem Solving'],
   ARRAY['Excel', 'Salesforce', 'Slack'], 'Lead meetings, manage teams, analyze performance',
   ARRAY['LEADER', 'ORGANIZER', 'THINKER'], 3, 4, 4, 4, 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg'),

  ('Marketing Manager', 'marketing-manager', (SELECT id FROM cat_ids WHERE slug = 'sales-marketing'),
   'Develop and execute marketing strategies', 'Create campaigns, manage budgets, analyze metrics, lead teams',
   70000, 140000, 'growing', 'Bachelor in Marketing or Business',
   'Office/Remote', true, ARRAY['Marketing Strategy', 'Analytics', 'Creativity', 'Leadership'],
   ARRAY['Google Analytics', 'HubSpot', 'Canva'], 'Plan campaigns, analyze data, present results',
   ARRAY['LEADER', 'CREATOR', 'THINKER'], 4, 4, 4, 3, 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg'),

  ('Sales Manager', 'sales-manager', (SELECT id FROM cat_ids WHERE slug = 'sales-marketing'),
   'Lead sales teams and drive revenue', 'Recruit salespeople, set targets, manage client relationships',
   80000, 160000, 'stable', 'Bachelor in Business, Sales experience required',
   'Office/Field', false, ARRAY['Sales Strategy', 'Leadership', 'Communication', 'Negotiation'],
   ARRAY['Salesforce', 'Excel', 'LinkedIn'], 'Coach team, close deals, analyze pipelines',
   ARRAY['LEADER', 'HELPER', 'THINKER'], 3, 4, 5, 4, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg'),

  -- Healthcare & Medicine
  ('Registered Nurse', 'registered-nurse', (SELECT id FROM cat_ids WHERE slug = 'healthcare-medicine'),
   'Provide patient care and medical support', 'Administer medications, monitor patients, communicate with doctors',
   65000, 130000, 'growing', 'Associate in Nursing, RN License required',
   'Hospital/Clinic', false, ARRAY['Patient Care', 'Attention to Detail', 'Empathy', 'Technical Skills'],
   ARRAY['Electronic Medical Records', 'Patient Monitoring Equipment'], 'Check vitals, administer care, document records',
   ARRAY['HELPER', 'ORGANIZER', 'LEADER'], 2, 4, 5, 3, 'https://images.pexels.com/photos/5215023/pexels-photo-5215023.jpeg'),

  ('Physician', 'physician', (SELECT id FROM cat_ids WHERE slug = 'healthcare-medicine'),
   'Diagnose and treat patients', 'Examine patients, order tests, prescribe treatments, perform surgeries',
   150000, 400000, 'stable', 'MD/DO, Medical School, Residency',
   'Hospital/Office', false, ARRAY['Medical Knowledge', 'Problem Solving', 'Communication', 'Leadership'],
   ARRAY['Electronic Medical Records', 'Diagnostic Equipment'], 'See patients, diagnose conditions, perform procedures',
   ARRAY['THINKER', 'HELPER', 'LEADER'], 2, 5, 4, 4, 'https://images.pexels.com/photos/7807517/pexels-photo-7807517.jpeg'),

  ('Therapist/Counselor', 'therapist-counselor', (SELECT id FROM cat_ids WHERE slug = 'healthcare-medicine'),
   'Help clients with mental health and personal issues', 'Listen to clients, develop treatment plans, provide support',
   55000, 120000, 'growing', 'Master in Counseling/Psychology, License required',
   'Office', false, ARRAY['Empathy', 'Listening', 'Problem Solving', 'Communication'],
   ARRAY['Therapy Software', 'Assessment Tools'], 'Meet with clients, develop plans, track progress',
   ARRAY['HELPER', 'THINKER'], 2, 3, 5, 3, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg'),

  ('Pharmacist', 'pharmacist', (SELECT id FROM cat_ids WHERE slug = 'healthcare-medicine'),
   'Dispense medications and advise on drug use', 'Prepare prescriptions, counsel patients, manage inventory',
   110000, 170000, 'stable', 'PharmD, Pharmacy License required',
   'Pharmacy/Hospital', false, ARRAY['Pharmacy Knowledge', 'Attention to Detail', 'Communication', 'Organization'],
   ARRAY['Pharmacy Software', 'Dispensing Equipment'], 'Fill prescriptions, counsel patients, verify medications',
   ARRAY['HELPER', 'ORGANIZER', 'THINKER'], 2, 4, 3, 3, 'https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg'),

  -- Science & Research
  ('Research Scientist', 'research-scientist', (SELECT id FROM cat_ids WHERE slug = 'science-research'),
   'Conduct scientific research and experiments', 'Design studies, collect data, analyze results, publish findings',
   75000, 140000, 'stable', 'PhD in Science field, Research experience',
   'Laboratory', false, ARRAY['Scientific Method', 'Analysis', 'Technical Skills', 'Writing'],
   ARRAY['Lab Equipment', 'Statistical Software'], 'Design experiments, collect data, write papers',
   ARRAY['THINKER', 'BUILDER'], 2, 5, 2, 4, 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg'),

  ('Environmental Scientist', 'environmental-scientist', (SELECT id FROM cat_ids WHERE slug = 'science-research'),
   'Study and protect the environment', 'Conduct fieldwork, analyze data, develop solutions for environmental issues',
   65000, 130000, 'growing', 'Bachelor in Environmental Science',
   'Field/Laboratory', false, ARRAY['Environmental Science', 'Research', 'Problem Solving', 'Communication'],
   ARRAY['GIS Software', 'Data Analysis Tools'], 'Collect field samples, analyze data, write reports',
   ARRAY['THINKER', 'HELPER'], 2, 4, 3, 3, 'https://images.pexels.com/photos/2589099/pexels-photo-2589099.jpeg'),

  ('Chemist', 'chemist', (SELECT id FROM cat_ids WHERE slug = 'science-research'),
   'Study chemical reactions and substances', 'Conduct experiments, analyze compounds, develop new materials',
   70000, 135000, 'stable', 'Bachelor in Chemistry, often Master or PhD required',
   'Laboratory', false, ARRAY['Chemistry', 'Lab Work', 'Analysis', 'Attention to Detail'],
   ARRAY['Lab Equipment', 'Chemical Analysis Software'], 'Run experiments, document results, develop processes',
   ARRAY['THINKER', 'BUILDER'], 2, 5, 2, 3, 'https://images.pexels.com/photos/3946105/pexels-photo-3946105.jpeg'),

  -- Education & Training
  ('High School Teacher', 'high-school-teacher', (SELECT id FROM cat_ids WHERE slug = 'education-training'),
   'Teach students in classroom setting', 'Plan lessons, grade assignments, communicate with parents, manage classroom',
   55000, 105000, 'stable', 'Bachelor in subject area, Teaching Certification',
   'School', false, ARRAY['Teaching', 'Communication', 'Organization', 'Patience'],
   ARRAY['Learning Management System', 'Google Classroom'], 'Teach classes, create curriculum, assess learning',
   ARRAY['HELPER', 'LEADER', 'ORGANIZER'], 3, 3, 5, 3, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg'),

  ('University Professor', 'university-professor', (SELECT id FROM cat_ids WHERE slug = 'education-training'),
   'Teach higher education and conduct research', 'Lecture students, publish research, mentor students',
   80000, 180000, 'stable', 'PhD in subject area',
   'University', false, ARRAY['Subject Expertise', 'Research', 'Communication', 'Leadership'],
   ARRAY['Research Tools', 'Learning Management System'], 'Teach classes, conduct research, advise students',
   ARRAY['THINKER', 'LEADER', 'HELPER'], 2, 5, 4, 4, 'https://images.pexels.com/photos/5427881/pexels-photo-5427881.jpeg'),

  ('Trainer/Instructor', 'trainer-instructor', (SELECT id FROM cat_ids WHERE slug = 'education-training'),
   'Teach skills and knowledge in professional settings', 'Develop training materials, conduct workshops, assess learning',
   50000, 100000, 'stable', 'Certificate or Bachelor in training field',
   'Office/Remote', true, ARRAY['Teaching', 'Communication', 'Presentation', 'Organization'],
   ARRAY['Learning Platform', 'Presentation Tools'], 'Create courses, deliver training, evaluate results',
   ARRAY['HELPER', 'LEADER', 'ORGANIZER'], 3, 3, 5, 3, 'https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg'),

  -- Trades & Construction
  ('Electrician', 'electrician', (SELECT id FROM cat_ids WHERE slug = 'trades-construction'),
   'Install and repair electrical systems', 'Run wiring, connect equipment, troubleshoot electrical problems',
   60000, 120000, 'stable', 'Apprenticeship, Journeyman License',
   'Job Sites', false, ARRAY['Electrical Knowledge', 'Problem Solving', 'Attention to Detail', 'Physical Work'],
   ARRAY['Multimeter', 'Electrical Tools'], 'Install wiring, test circuits, repair equipment',
   ARRAY['BUILDER', 'THINKER'], 2, 4, 2, 3, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg'),

  ('Plumber', 'plumber', (SELECT id FROM cat_ids WHERE slug = 'trades-construction'),
   'Install and repair plumbing systems', 'Fit pipes, fixtures, repair leaks, maintain water systems',
   55000, 115000, 'stable', 'Apprenticeship, Plumber License',
   'Job Sites', false, ARRAY['Plumbing Systems', 'Problem Solving', 'Physical Work', 'Tool Proficiency'],
   ARRAY['Pipe Wrenches', 'Plumbing Tools'], 'Install pipes, diagnose problems, perform repairs',
   ARRAY['BUILDER', 'THINKER'], 2, 4, 2, 3, 'https://images.pexels.com/photos/3957987/pexels-photo-3957987.jpeg'),

  ('Construction Manager', 'construction-manager', (SELECT id FROM cat_ids WHERE slug = 'trades-construction'),
   'Oversee construction projects', 'Plan projects, manage budgets, coordinate teams, ensure safety',
   80000, 150000, 'stable', 'Bachelor in Construction Management, Field experience',
   'Job Sites', false, ARRAY['Leadership', 'Planning', 'Problem Solving', 'Communication'],
   ARRAY['Project Management Software', 'CAD Software'], 'Plan projects, manage teams, monitor progress',
   ARRAY['LEADER', 'ORGANIZER', 'BUILDER'], 3, 4, 4, 4, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg'),

  -- Legal & Government
  ('Lawyer', 'lawyer', (SELECT id FROM cat_ids WHERE slug = 'legal-government'),
   'Provide legal advice and representation', 'Research cases, represent clients, draft documents',
   90000, 250000, 'stable', 'Law Degree (JD), Bar License required',
   'Law Office', false, ARRAY['Legal Knowledge', 'Research', 'Communication', 'Argumentation'],
   ARRAY['Legal Research Software', 'Case Management'], 'Research law, write briefs, represent clients',
   ARRAY['THINKER', 'LEADER'], 2, 5, 4, 4, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg'),

  ('Paralegal', 'paralegal', (SELECT id FROM cat_ids WHERE slug = 'legal-government'),
   'Support lawyers with legal work', 'Conduct research, prepare documents, organize files',
   50000, 85000, 'stable', 'Associate in Paralegal Studies or certificate',
   'Law Office', false, ARRAY['Legal Knowledge', 'Organization', 'Research', 'Attention to Detail'],
   ARRAY['Legal Software', 'Word Processing'], 'Research cases, prepare documents, support attorneys',
   ARRAY['ORGANIZER', 'THINKER'], 2, 4, 2, 3, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg'),

  ('Government Official', 'government-official', (SELECT id FROM cat_ids WHERE slug = 'legal-government'),
   'Administer government programs and policies', 'Manage departments, enforce regulations, serve public',
   65000, 130000, 'stable', 'Bachelor in related field, civil service exam',
   'Government Office', false, ARRAY['Public Service', 'Organization', 'Communication', 'Leadership'],
   ARRAY['Government Systems', 'Office Suite'], 'Manage programs, enforce rules, serve constituents',
   ARRAY['LEADER', 'ORGANIZER', 'HELPER'], 2, 4, 4, 3, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg'),

  -- Hospitality & Service
  ('Hotel Manager', 'hotel-manager', (SELECT id FROM cat_ids WHERE slug = 'hospitality-service'),
   'Manage hotel operations and guest services', 'Oversee staff, manage budgets, ensure guest satisfaction',
   55000, 110000, 'stable', 'Bachelor in Hospitality Management',
   'Hotel', false, ARRAY['Leadership', 'Customer Service', 'Organization', 'Problem Solving'],
   ARRAY['Hotel Management Software', 'Office Suite'], 'Lead staff, manage budget, serve guests',
   ARRAY['LEADER', 'HELPER', 'ORGANIZER'], 3, 3, 5, 4, 'https://images.pexels.com/photos/3951965/pexels-photo-3951965.jpeg'),

  ('Chef', 'chef', (SELECT id FROM cat_ids WHERE slug = 'hospitality-service'),
   'Prepare meals and lead kitchen', 'Plan menus, cook food, train staff, maintain quality',
   50000, 120000, 'stable', 'Culinary degree or apprenticeship',
   'Restaurant', false, ARRAY['Cooking', 'Leadership', 'Creativity', 'Attention to Detail'],
   ARRAY['Kitchen Equipment', 'POS System'], 'Create menus, cook meals, lead kitchen staff',
   ARRAY['CREATOR', 'LEADER', 'ORGANIZER'], 4, 3, 3, 4, 'https://images.pexels.com/photos/3829266/pexels-photo-3829266.jpeg'),

  ('Event Planner', 'event-planner', (SELECT id FROM cat_ids WHERE slug = 'hospitality-service'),
   'Plan and coordinate events', 'Arrange details, coordinate vendors, manage budgets',
   50000, 100000, 'stable', 'Bachelor in Event Management or related field',
   'Office/Various', true, ARRAY['Organization', 'Communication', 'Creativity', 'Problem Solving'],
   ARRAY['Event Planning Software', 'Office Suite'], 'Plan events, coordinate vendors, manage budgets',
   ARRAY['ORGANIZER', 'CREATOR', 'LEADER'], 4, 3, 4, 4, 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg')
ON CONFLICT DO NOTHING;

-- Seed Quiz Questions
INSERT INTO quiz_questions (quiz_type, question_text, options, sort_order) VALUES
  -- Personality Quiz
  ('personality', 'What energizes you most?',
   '[
     {"text": "Building something new", "personality_tag": "BUILDER", "weight": 1},
     {"text": "Coming up with creative ideas", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Solving complex problems", "personality_tag": "THINKER", "weight": 1},
     {"text": "Helping people", "personality_tag": "HELPER", "weight": 1},
     {"text": "Leading and organizing", "personality_tag": "LEADER", "weight": 1},
     {"text": "Planning and organizing", "personality_tag": "ORGANIZER", "weight": 1}
   ]'::jsonb, 1),

  ('personality', 'How do you prefer to work?',
   '[
     {"text": "With my hands on projects", "personality_tag": "BUILDER", "weight": 1},
     {"text": "With artistic expression", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Independently with data", "personality_tag": "THINKER", "weight": 1},
     {"text": "In a team supporting others", "personality_tag": "HELPER", "weight": 1},
     {"text": "In charge of decisions", "personality_tag": "LEADER", "weight": 1},
     {"text": "Creating systems and order", "personality_tag": "ORGANIZER", "weight": 1}
   ]'::jsonb, 2),

  ('personality', 'When facing a challenge, you tend to:',
   '[
     {"text": "Find a practical solution", "personality_tag": "BUILDER", "weight": 1},
     {"text": "Think outside the box", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Analyze it thoroughly", "personality_tag": "THINKER", "weight": 1},
     {"text": "Ask for others'' perspectives", "personality_tag": "HELPER", "weight": 1},
     {"text": "Take charge and decide", "personality_tag": "LEADER", "weight": 1},
     {"text": "Create a detailed plan", "personality_tag": "ORGANIZER", "weight": 1}
   ]'::jsonb, 3),

  ('personality', 'Your ideal work environment is:',
   '[
     {"text": "Hands-on and active", "personality_tag": "BUILDER", "weight": 1},
     {"text": "Creative and expressive", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Focused and analytical", "personality_tag": "THINKER", "weight": 1},
     {"text": "Collaborative and supportive", "personality_tag": "HELPER", "weight": 1},
     {"text": "Dynamic and challenging", "personality_tag": "LEADER", "weight": 1},
     {"text": "Well-organized and structured", "personality_tag": "ORGANIZER", "weight": 1}
   ]'::jsonb, 4),

  ('personality', 'What''s most important to you in a job?',
   '[
     {"text": "Creating tangible results", "personality_tag": "BUILDER", "weight": 1},
     {"text": "Expressing creativity", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Intellectual challenge", "personality_tag": "THINKER", "weight": 1},
     {"text": "Making a difference for people", "personality_tag": "HELPER", "weight": 1},
     {"text": "Having influence and impact", "personality_tag": "LEADER", "weight": 1},
     {"text": "Clear goals and structure", "personality_tag": "ORGANIZER", "weight": 1}
   ]'::jsonb, 5),

  -- Interest Quiz
  ('interest', 'Which activities appeal to you most?',
   '[
     {"text": "Building or fixing things", "personality_tag": "BUILDER", "weight": 1},
     {"text": "Drawing, writing, or music", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Researching and learning", "personality_tag": "THINKER", "weight": 1},
     {"text": "Volunteering or mentoring", "personality_tag": "HELPER", "weight": 1},
     {"text": "Organizing events or groups", "personality_tag": "LEADER", "weight": 1},
     {"text": "Creating systems and processes", "personality_tag": "ORGANIZER", "weight": 1}
   ]'::jsonb, 6),

  ('interest', 'What subjects excite you in school?',
   '[
     {"text": "Shop class, engineering, tech", "personality_tag": "BUILDER", "weight": 1},
     {"text": "Art, music, drama, literature", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Math, science, computer science", "personality_tag": "THINKER", "weight": 1},
     {"text": "Psychology, sociology, history", "personality_tag": "HELPER", "weight": 1},
     {"text": "Business, leadership, politics", "personality_tag": "LEADER", "weight": 1},
     {"text": "Business, accounting, planning", "personality_tag": "ORGANIZER", "weight": 1}
   ]'::jsonb, 7),

  ('interest', 'What kind of problems do you enjoy solving?',
   '[
     {"text": "Mechanical and practical", "personality_tag": "BUILDER", "weight": 1},
     {"text": "Creative and novel", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Logical and theoretical", "personality_tag": "THINKER", "weight": 1},
     {"text": "Interpersonal and social", "personality_tag": "HELPER", "weight": 1},
     {"text": "Strategic and organizational", "personality_tag": "LEADER", "weight": 1},
     {"text": "Systematic and procedural", "personality_tag": "ORGANIZER", "weight": 1}
   ]'::jsonb, 8),

  -- Work Style Quiz
  ('work_style', 'How do you prefer communication?',
   '[
     {"text": "Face-to-face", "personality_tag": "HELPER", "weight": 1},
     {"text": "Written and documented", "personality_tag": "ORGANIZER", "weight": 1},
     {"text": "Collaborative discussion", "personality_tag": "LEADER", "weight": 1},
     {"text": "Independent work", "personality_tag": "THINKER", "weight": 1},
     {"text": "Creative expression", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Practical demonstration", "personality_tag": "BUILDER", "weight": 1}
   ]'::jsonb, 9),

  ('work_style', 'How do you handle deadlines?',
   '[
     {"text": "Plan well in advance", "personality_tag": "ORGANIZER", "weight": 1},
     {"text": "Work at steady pace", "personality_tag": "HELPER", "weight": 1},
     {"text": "Take charge and delegate", "personality_tag": "LEADER", "weight": 1},
     {"text": "Focus deeply on task", "personality_tag": "THINKER", "weight": 1},
     {"text": "Find creative solutions", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Get hands-on and do it", "personality_tag": "BUILDER", "weight": 1}
   ]'::jsonb, 10),

  ('work_style', 'What''s your ideal team dynamic?',
   '[
     {"text": "Well-organized team", "personality_tag": "ORGANIZER", "weight": 1},
     {"text": "Supportive and caring", "personality_tag": "HELPER", "weight": 1},
     {"text": "Team I can lead", "personality_tag": "LEADER", "weight": 1},
     {"text": "Autonomy with collaboration", "personality_tag": "THINKER", "weight": 1},
     {"text": "Creative and experimental", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Practical and action-oriented", "personality_tag": "BUILDER", "weight": 1}
   ]'::jsonb, 11),

  ('work_style', 'How do you prefer to learn new skills?',
   '[
     {"text": "Structured courses and training", "personality_tag": "ORGANIZER", "weight": 1},
     {"text": "Mentoring and guidance", "personality_tag": "HELPER", "weight": 1},
     {"text": "Leading projects and learning by doing", "personality_tag": "LEADER", "weight": 1},
     {"text": "Research and self-study", "personality_tag": "THINKER", "weight": 1},
     {"text": "Experimentation and exploration", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Hands-on practice", "personality_tag": "BUILDER", "weight": 1}
   ]'::jsonb, 12),

  -- Skills Quiz
  ('skills', 'How strong are your technical skills?',
   '[
     {"text": "Very strong - expert level", "personality_tag": "THINKER", "weight": 2},
     {"text": "Strong - confident user", "personality_tag": "BUILDER", "weight": 1},
     {"text": "Moderate - can learn", "personality_tag": "ORGANIZER", "weight": 1},
     {"text": "Developing - interested in learning", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Basic - use as needed", "personality_tag": "HELPER", "weight": 1},
     {"text": "N/A - focus on people skills", "personality_tag": "LEADER", "weight": 1}
   ]'::jsonb, 13),

  ('skills', 'How would you rate your creativity?',
   '[
     {"text": "Highly creative - always innovating", "personality_tag": "CREATOR", "weight": 2},
     {"text": "Creative - like artistic pursuits", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Moderately creative", "personality_tag": "BUILDER", "weight": 1},
     {"text": "Prefer proven methods", "personality_tag": "ORGANIZER", "weight": 1},
     {"text": "Focus on practical solutions", "personality_tag": "THINKER", "weight": 1},
     {"text": "Support others'' creativity", "personality_tag": "HELPER", "weight": 1}
   ]'::jsonb, 14),

  ('skills', 'How strong are your leadership abilities?',
   '[
     {"text": "Natural leader - enjoy responsibility", "personality_tag": "LEADER", "weight": 2},
     {"text": "Confident leading when needed", "personality_tag": "LEADER", "weight": 1},
     {"text": "Prefer shared leadership", "personality_tag": "ORGANIZER", "weight": 1},
     {"text": "Support leaders from behind", "personality_tag": "HELPER", "weight": 1},
     {"text": "Lead through expertise", "personality_tag": "THINKER", "weight": 1},
     {"text": "Lead creative teams", "personality_tag": "CREATOR", "weight": 1}
   ]'::jsonb, 15),

  ('skills', 'How would you describe your communication skills?',
   '[
     {"text": "Excellent - persuasive and engaging", "personality_tag": "LEADER", "weight": 1},
     {"text": "Strong - clear and effective", "personality_tag": "ORGANIZER", "weight": 1},
     {"text": "Good - thoughtful and clear", "personality_tag": "THINKER", "weight": 1},
     {"text": "Empathetic - listen well", "personality_tag": "HELPER", "weight": 1},
     {"text": "Creative - express ideas uniquely", "personality_tag": "CREATOR", "weight": 1},
     {"text": "Practical - show rather than tell", "personality_tag": "BUILDER", "weight": 1}
   ]'::jsonb, 16)
ON CONFLICT DO NOTHING;

-- Seed Achievements
INSERT INTO achievements (name, slug, description, icon, xp_reward, condition) VALUES
  ('First Steps', 'first-steps', 'Complete your first quiz', 'star', 50, '{"type": "quiz_complete", "count": 1}'::jsonb),
  ('Knowledge Seeker', 'knowledge-seeker', 'Complete 5 quizzes', 'book-open', 100, '{"type": "quiz_complete", "count": 5}'::jsonb),
  ('Career Explorer', 'career-explorer', 'Save 10 careers', 'compass', 150, '{"type": "saved_careers", "count": 10}'::jsonb),
  ('Planner', 'planner', 'Create your first career plan', 'map', 75, '{"type": "plan_created", "count": 1}'::jsonb),
  ('Achiever', 'achiever', 'Reach level 5', 'trophy', 200, '{"type": "level_reached", "level": 5}'::jsonb),
  ('Mentor', 'mentor', 'Help another user explore careers', 'users', 100, '{"type": "referral", "count": 1}'::jsonb),
  ('Daily Habit', 'daily-habit', 'Visit for 7 days in a row', 'check-circle', 50, '{"type": "streak", "days": 7}'::jsonb),
  ('Personality Master', 'personality-master', 'Discover all 6 personality types', 'brain', 300, '{"type": "personality_types", "count": 6}'::jsonb)
ON CONFLICT DO NOTHING;

-- Seed Inspirational Quotes
INSERT INTO inspirational_quotes (text, author, category) VALUES
  ('Choose a job you love, and you will never work a day in your life.', 'Confucius', 'Passion'),
  ('The only way to do great work is to love what you do.', 'Steve Jobs', 'Excellence'),
  ('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'Perseverance'),
  ('Don''t watch the clock; do what it does. Keep going.', 'Sam Levenson', 'Motivation'),
  ('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'Dreams'),
  ('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'Confidence'),
  ('Your work is going to fill a large part of your life.', 'Steve Jobs', 'Work-Life Balance'),
  ('The best way to predict the future is to invent it.', 'Alan Kay', 'Innovation'),
  ('Don''t go to work to live, live the work you love.', 'Marc Anthony', 'Purpose'),
  ('Success usually comes to those who are too busy to be looking for it.', 'Henry David Thoreau', 'Work Ethic'),
  ('Opportunities don''t happen. You create them.', 'Chris Grosser', 'Opportunity'),
  ('Don''t let yesterday take up too much of today.', 'Will Rogers', 'Progress'),
  ('You miss 100% of the shots you don''t take.', 'Wayne Gretzky', 'Risk Taking'),
  ('The only limit to our realization of tomorrow will be our doubts of today.', 'Franklin D. Roosevelt', 'Possibility'),
  ('Strive for progress, not perfection.', 'Unknown', 'Growth')
ON CONFLICT DO NOTHING;
