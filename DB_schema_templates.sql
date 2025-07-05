-- Database Schema for Templates and Responses

-- Templates table
CREATE TABLE templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_created_by (created_by),
    INDEX idx_is_active (is_active)
);

-- Questions table
CREATE TABLE template_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT NOT NULL,
    question_text TEXT NOT NULL,
    response_type ENUM('text', 'numeric', 'mcq', 'msq', 'boolean') NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    question_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    INDEX idx_template_id (template_id),
    INDEX idx_question_order (question_order)
);

-- Question options for MCQ and MSQ
CREATE TABLE question_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    option_text VARCHAR(500) NOT NULL,
    option_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES template_questions(id) ON DELETE CASCADE,
    INDEX idx_question_id (question_id),
    INDEX idx_option_order (option_order)
);

-- Template responses (when someone fills out a template)
CREATE TABLE template_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT NOT NULL,
    respondent_name VARCHAR(255),
    respondent_email VARCHAR(255),
    status ENUM('draft', 'submitted', 'reviewed') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
    INDEX idx_template_id (template_id),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
);

-- Individual question responses
CREATE TABLE question_responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    response_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT,
    answer_numeric DECIMAL(15,2),
    answer_boolean BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES template_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES template_questions(id) ON DELETE CASCADE,
    INDEX idx_response_id (response_id),
    INDEX idx_question_id (question_id)
);

-- Selected options for MCQ and MSQ responses
CREATE TABLE response_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_response_id INT NOT NULL,
    option_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_response_id) REFERENCES question_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES question_options(id) ON DELETE CASCADE,
    INDEX idx_question_response_id (question_response_id),
    INDEX idx_option_id (option_id)
);

-- Sample data insertion
INSERT INTO templates (name, description, created_by) VALUES
('AI Project Assessment', 'Comprehensive assessment for new AI projects', 1),
('Data Privacy Compliance', 'Template for data privacy and compliance assessments', 1),
('Risk Assessment', 'General risk assessment template', 1);

-- Insert questions for AI Project Assessment template
INSERT INTO template_questions (template_id, question_text, response_type, is_required, question_order) VALUES
(1, 'What is the primary objective of this AI project?', 'text', TRUE, 1),
(1, 'What is the estimated budget for this project?', 'numeric', TRUE, 2),
(1, 'Which departments will be involved?', 'msq', TRUE, 3),
(1, 'Does this project involve external vendors?', 'boolean', TRUE, 4),
(1, 'What is the expected timeline for completion?', 'mcq', TRUE, 5);

-- Insert options for MCQ and MSQ questions
INSERT INTO question_options (question_id, option_text, option_order) VALUES
(3, 'IT', 1),
(3, 'Legal', 2),
(3, 'HR', 3),
(3, 'Finance', 4),
(3, 'Operations', 5),
(3, 'Marketing', 6),
(5, '1-3 months', 1),
(5, '3-6 months', 2),
(5, '6-12 months', 3),
(5, '12+ months', 4); 