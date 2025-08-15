CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_demo BOOLEAN
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  surname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role INT REFERENCES roles(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP,
  is_demo BOOLEAN
);

CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(512),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  project_title VARCHAR(255) NOT NULL,
  owner INTEGER REFERENCES users(id),
  start_date DATE NOT NULL,
  ai_risk_classification VARCHAR(255),
  type_of_high_risk_role VARCHAR(255),
  goal VARCHAR(255),
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  last_updated_by INTEGER REFERENCES users(id),
  is_demo BOOLEAN
);

CREATE TABLE projects_members (
  user_id INT REFERENCES users(id),
  project_id INT REFERENCES projects(id),
  is_demo BOOLEAN,
  PRIMARY KEY (user_id, project_id)
);

CREATE TABLE projects_frameworks (
  id SERIAL UNIQUE,
  project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  framework_id INT NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  is_demo BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (project_id, framework_id)
);

CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  order_no INT,
  vendor_name VARCHAR(255) NOT NULL,
  vendor_provides TEXT,
  assignee INTEGER REFERENCES users(id),
  website VARCHAR(255),
  vendor_contact_person VARCHAR(255),
  review_result VARCHAR(255),
  review_status VARCHAR(255),
  reviewer INTEGER REFERENCES users(id),
  risk_status VARCHAR(255),
  review_date DATE,
  is_demo BOOLEAN
);

CREATE TABLE vendors_projects (
  vendor_id INT REFERENCES vendors(id),
  project_id INT REFERENCES projects(id),
  is_demo BOOLEAN,
  PRIMARY KEY (vendor_id, project_id)
);

CREATE TABLE vendorrisks (
  id SERIAL PRIMARY KEY,
  vendor_id INT REFERENCES vendors(id),
  order_no INT,
  risk_description TEXT,
  impact_description TEXT,
  impact VARCHAR(255),
  likelihood VARCHAR(255),
  risk_severity VARCHAR(255),
  action_plan TEXT,
  action_owner INTEGER REFERENCES users(id),
  risk_level VARCHAR(255),
  is_demo BOOLEAN
);

CREATE TABLE projectrisks (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id),
  risk_name VARCHAR(255),
  risk_owner INTEGER REFERENCES users(id),
  ai_lifecycle_phase VARCHAR(255),
  risk_description TEXT,
  risk_category VARCHAR(255),
  impact VARCHAR(255),
  assessment_mapping TEXT,
  controls_mapping TEXT,
  likelihood VARCHAR(255),
  severity VARCHAR(255),
  risk_level_autocalculated VARCHAR(255),
  review_notes TEXT,
  mitigation_status VARCHAR(255),
  current_risk_level VARCHAR(255),
  deadline DATE,
  mitigation_plan TEXT,
  implementation_strategy TEXT,
  mitigation_evidence_document VARCHAR(255),
  likelihood_mitigation VARCHAR(255),
  risk_severity VARCHAR(255),
  final_risk_level VARCHAR(255),
  risk_approval INTEGER REFERENCES users(id),
  approval_status VARCHAR(255),
  date_of_assessment DATE,
  is_demo BOOLEAN
);
CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id),
  is_demo BOOLEAN
);

CREATE TABLE projectscopes (
  id SERIAL PRIMARY KEY,
  assessment_id INT REFERENCES assessments(id),
  describe_ai_environment TEXT,
  is_new_ai_technology BOOLEAN,
  uses_personal_data BOOLEAN,
  project_scope_documents VARCHAR(255),
  technology_type VARCHAR(255),
  has_ongoing_monitoring BOOLEAN,
  unintended_outcomes TEXT,
  technology_documentation VARCHAR(255),
  is_demo BOOLEAN
);
CREATE TABLE controlcategories (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id),
  title TEXT,
  order_no INT,
  is_demo BOOLEAN
);

CREATE TABLE controls (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  status VARCHAR(255),
  approver INTEGER REFERENCES users(id),
  risk_review TEXT,
  owner INTEGER REFERENCES users(id),
  reviewer INTEGER REFERENCES users(id),
  due_date DATE,
  implementation_details TEXT,
  order_no INT,
  control_category_id INT REFERENCES controlcategories(id),
  is_demo BOOLEAN
);

CREATE TABLE subcontrols (
  id SERIAL PRIMARY KEY,
  control_id INT REFERENCES controls(id),
  title TEXT,
  description TEXT,
  order_no INT,
  status VARCHAR(255),
  approver INTEGER REFERENCES users(id),
  risk_review TEXT,
  owner INTEGER REFERENCES users(id),
  reviewer INTEGER REFERENCES users(id),
  due_date DATE,
  implementation_details TEXT,
  evidence_description TEXT,
  feedback_description TEXT,
  evidence_files TEXT[],
  feedback_files TEXT[],
  is_demo BOOLEAN
);
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  assessment_id INT REFERENCES assessments(id),
  title TEXT,
  order_no INT,
  is_demo BOOLEAN
);

CREATE TABLE subtopics (
  id SERIAL PRIMARY KEY,
  topic_id INT REFERENCES topics(id),
  title TEXT,
  order_no INT,
  is_demo BOOLEAN
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  subtopic_id INT REFERENCES subtopics(id),
  question TEXT,
  answer_type VARCHAR(255),
  evidence_required BOOLEAN,
  hint TEXT,
  is_required BOOLEAN,
  priority_level VARCHAR(255),
  evidence_files TEXT[],
  answer TEXT,
  dropdown_options TEXT[],
  order_no INT,
  input_type VARCHAR(255),
  is_demo BOOLEAN
);
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  content BYTEA NOT NULL,
  project_id INT REFERENCES projects(id),
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_time TIMESTAMP,
  is_demo BOOLEAN
);

CREATE TABLE frameworks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE controlcategories_struct_eu (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  order_no INTEGER,
  framework_id INTEGER NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE
);

CREATE TABLE controls_struct_eu (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_no INTEGER,
  control_category_id INTEGER NOT NULL REFERENCES controlcategories_struct_eu(id) ON DELETE CASCADE
);

CREATE TABLE subcontrols_struct_eu (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_no INTEGER,
  control_id INTEGER NOT NULL REFERENCES controls_struct_eu(id) ON DELETE CASCADE
);

CREATE TABLE topics_struct_eu (
  id SERIAL PRIMARY KEY,
  title TEXT,
  order_no INT,
  framework_id INTEGER NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE
);

CREATE TABLE subtopics_struct_eu (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  order_no INTEGER,
  topic_id INTEGER NOT NULL REFERENCES topics_struct_eu(id) ON DELETE CASCADE
);

CREATE TABLE questions_struct_eu (
  id SERIAL PRIMARY KEY,
  order_no INTEGER,
  question TEXT NOT NULL,
  hint TEXT NOT NULL,
  priority_level VARCHAR(255) NOT NULL,
  answer_type VARCHAR(255) NOT NULL,
  input_type VARCHAR(255) NOT NULL,
  evidence_required BOOLEAN NOT NULL,
  is_required BOOLEAN NOT NULL,
  subtopic_id INTEGER NOT NULL REFERENCES subtopics_struct_eu(id) ON DELETE CASCADE
);

CREATE TABLE answers_eu (
  id SERIAL PRIMARY KEY,
  assessment_id INT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions_struct_eu(id) ON DELETE CASCADE,
  answer TEXT,
  evidence_files JSONB,
  dropdown_options TEXT[],
  status VARCHAR(255) DEFAULT 'Not started',
  created_at TIMESTAMP DEFAULT NOW(),
  is_demo BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE annex_struct_iso (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  annex_no INT NOT NULL,
  framework_id INT REFERENCES frameworks(id) ON DELETE CASCADE
);

CREATE TABLE annexcategories_struct_iso (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  guidance TEXT,
  sub_id INT,
  order_no INT NOT NULL,
  annex_id INT REFERENCES annex_struct_iso(id) ON DELETE CASCADE
);

CREATE TYPE enum_annexcategories_iso_status AS ENUM (
  'Not started', 'Draft', 'In progress', 'Awaiting review', 'Awaiting approval', 'Implemented', 'Audited', 'Needs rework'
);

CREATE TABLE annexcategories_iso (
  id SERIAL PRIMARY KEY,
  is_applicable BOOLEAN DEFAULT FALSE,
  justification_for_exclusion TEXT,
  implementation_description TEXT,
  evidence_links JSONB,
  status enum_annexcategories_iso_status DEFAULT 'Not started',
  owner INT REFERENCES users(id) ON DELETE SET NULL,
  reviewer INT REFERENCES users(id) ON DELETE SET NULL,
  approver INT REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  auditor_feedback TEXT,
  projects_frameworks_id INT REFERENCES projects_frameworks(id) ON DELETE CASCADE,
  annexcategory_meta_id INT REFERENCES annexcategories_struct_iso(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_demo BOOLEAN DEFAULT FALSE
);

CREATE TABLE annexcategories_iso__risks (
  annexcategory_id INT REFERENCES annexcategories_iso(id) ON DELETE CASCADE,
  projects_risks_id INT PRIMARY KEY REFERENCES projectrisks(id) ON DELETE CASCADE
);

CREATE TABLE clauses_struct_iso (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  clause_no INT NOT NULL,
  framework_id INT REFERENCES frameworks(id) ON DELETE CASCADE
);

CREATE TABLE subclauses_struct_iso (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  order_no INT NOT NULL,
  summary TEXT,
  questions TEXT[],
  evidence_examples TEXT[],
  clause_id INT REFERENCES clauses_struct_iso(id) ON DELETE CASCADE
);

CREATE TABLE model_files (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_content BYTEA NOT NULL
);

CREATE TABLE model_data (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_content BYTEA NOT NULL,
  model_id INTEGER NOT NULL REFERENCES model_files(id) ON DELETE CASCADE
);

CREATE TABLE fairness_runs (
  id SERIAL PRIMARY KEY,
  data_id INTEGER NOT NULL REFERENCES model_data(id) ON DELETE CASCADE,
  metrics JSONB NOT NULL
);

CREATE TABLE trainingregistar (
  id SERIAL PRIMARY KEY,
  training_name VARCHAR(255) NOT NULL,
  duration VARCHAR(255),
  provider VARCHAR(255),
  department VARCHAR(255),
  status VARCHAR(255),
  people INTEGER,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Risk Matrix Risks table to store individual risks from risk matrix agent
CREATE TABLE risk_matrix_risks (
  id SERIAL PRIMARY KEY,
  risk_assessment_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  project_id VARCHAR(255),
  risk_name TEXT NOT NULL,
  risk_owner VARCHAR(255) NOT NULL,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
  justification TEXT,
  mitigation TEXT,
  target_date DATE,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for risk_matrix_risks table
CREATE INDEX idx_risk_matrix_risks_assessment_id ON risk_matrix_risks(risk_assessment_id);
CREATE INDEX idx_risk_matrix_risks_session_id ON risk_matrix_risks(session_id);
CREATE INDEX idx_risk_matrix_risks_project_id ON risk_matrix_risks(project_id);
CREATE INDEX idx_risk_matrix_risks_created_at ON risk_matrix_risks(created_at);