import connectDB from './config.js';
import Template from './models/Template.js';

const sampleTemplates = [
  {
    name: "AI System Assessment",
    description: "Comprehensive assessment for AI systems including regulatory compliance and risk management",
    templateType: "AI System",
    questions: [
      { questionText: "Which AI model(s) will be used?", responseType: "text", isRequired: true, questionOrder: 1 },
      { questionText: "Link to, or copy of, the terms under which each of the AI model(s) used are licensed.", responseType: "text", isRequired: true, questionOrder: 2 },
      { questionText: "Will the input data provided by our organization be used for training AI models?", responseType: "boolean", isRequired: true, questionOrder: 3 },
      { questionText: "Any other documentation that you might have available providing information on the model and the intended uses.", responseType: "text", isRequired: false, questionOrder: 4 },
      { questionText: "If applicable, how (if at all) the model has been trained (fine-tuned) or prompt tuned (prompt engineered), and how the training or tuning was evaluated.", responseType: "text", isRequired: false, questionOrder: 5 },
      { questionText: "Time period data is retained in the model (in hours/days).", responseType: "text", isRequired: false, questionOrder: 6 },
      { questionText: "Documented model safety and risk analysis based on potential for unintended uses.", responseType: "text", isRequired: false, questionOrder: 7 },
      { questionText: "Documented pre-deployment effectiveness testing for the intended use cases identified above.", responseType: "text", isRequired: false, questionOrder: 8 },
      { questionText: "Documented pre-deployment safety and risk testing for potential risks and harms associated with the model.", responseType: "text", isRequired: false, questionOrder: 9 },
      { questionText: "Information on how the models provide transparency and explainability as part of the output. (This includes how the output was generated, and what material/data were used.)", responseType: "text", isRequired: false, questionOrder: 10 },
      { questionText: "How the AI model is monitored on an ongoing basis for performance and accuracy.", responseType: "text", isRequired: false, questionOrder: 11 },
      { questionText: "What are the data sources (data supply chain)? Are they trusted?", responseType: "text", isRequired: false, questionOrder: 12 },
      { questionText: "Are there any controls/guardrails implemented to protect the AI system from prompt injection attacks (AI-specific attacks)?", responseType: "boolean", isRequired: false, questionOrder: 13 },
      { questionText: "Do you have a penetration testing and/or vulnerability assessment process for the AI system?", responseType: "boolean", isRequired: false, questionOrder: 14 },
      { questionText: "Are prompts and AI-generated content sanitized or validated?", responseType: "boolean", isRequired: false, questionOrder: 15 },
      { questionText: "Are model, agent, or AI interactions monitored?", responseType: "boolean", isRequired: false, questionOrder: 16 },
      { questionText: "Are there any AI incident response plans in place?", responseType: "boolean", isRequired: false, questionOrder: 17 }
    ]
  },
  {
    name: "Data Privacy Compliance",
    description: "Template for data privacy and compliance assessments",
    templateType: "Cybersecurity Management System",
    questions: [
      { questionText: "Have you performed threat modeling for the system? What risks were identified and how were they mitigated?", responseType: "text", isRequired: true, questionOrder: 1 },
      { questionText: "How is sensitive data (e.g., PII, credentials, financial data) stored and protected at rest and in transit?", responseType: "text", isRequired: true, questionOrder: 2 },
      { questionText: "Are input validation and output encoding implemented to prevent injection attacks (e.g., SQLi, XSS)?", responseType: "boolean", isRequired: true, questionOrder: 3 },
      { questionText: "Is file upload functionality (if any) protected against malware, file type spoofing, and excessive size uploads?", responseType: "boolean", isRequired: false, questionOrder: 4 },
      { questionText: "Are cryptographic functions (e.g., hashing, encryption) implemented using industry-standard libraries and algorithms?", responseType: "boolean", isRequired: true, questionOrder: 5 },
      { questionText: "Are secrets (e.g., API keys, DB passwords) stored securely (e.g., not hard-coded or in source control)?", responseType: "boolean", isRequired: true, questionOrder: 6 },
      { questionText: "Is authentication implemented using secure protocols (e.g., OAuth2, SAML, OpenID Connect)?", responseType: "boolean", isRequired: true, questionOrder: 7 },
      { questionText: "Are password policies enforced (e.g., length, complexity, expiration)?", responseType: "boolean", isRequired: true, questionOrder: 8 },
      { questionText: "Are multi-factor authentication (MFA) mechanisms in place for privileged access?", responseType: "boolean", isRequired: true, questionOrder: 9 },
      { questionText: "Is role-based access control (RBAC) or attribute-based access control (ABAC) implemented?", responseType: "boolean", isRequired: true, questionOrder: 10 },
      { questionText: "Are authorization checks enforced both at the API and UI layers?", responseType: "boolean", isRequired: true, questionOrder: 11 },
      { questionText: "Is the application hosted on a secure and patched operating system or container?", responseType: "boolean", isRequired: true, questionOrder: 12 },
      { questionText: "Are network communications secured using TLS/SSL?", responseType: "boolean", isRequired: true, questionOrder: 13 },
      { questionText: "Are unused ports and services disabled on all production environments?", responseType: "boolean", isRequired: false, questionOrder: 14 },
      { questionText: "Is the CI/CD pipeline configured to perform security scans (e.g., SAST, DAST, dependency scans)?", responseType: "boolean", isRequired: false, questionOrder: 15 },
      { questionText: "Are container images (if used) scanned for vulnerabilities before deployment?", responseType: "boolean", isRequired: false, questionOrder: 16 },
      { questionText: "Are access logs, error logs, and security logs generated and stored securely?", responseType: "boolean", isRequired: true, questionOrder: 17 },
      { questionText: "Is logging implemented in a way that avoids storing sensitive data in plaintext?", responseType: "boolean", isRequired: true, questionOrder: 18 },
      { questionText: "Are log files monitored for unusual or unauthorized activity?", responseType: "boolean", isRequired: true, questionOrder: 19 },
      { questionText: "Is user and admin activity auditable and traceable?", responseType: "boolean", isRequired: true, questionOrder: 20 },
      { questionText: "Is there an incident response plan in place specific to this application or service?", responseType: "boolean", isRequired: true, questionOrder: 21 },
      { questionText: "How are security incidents detected, reported, and escalated?", responseType: "text", isRequired: false, questionOrder: 22 },
      { questionText: "Are backups taken regularly and tested for restoration?", responseType: "boolean", isRequired: true, questionOrder: 23 },
      { questionText: "Are disaster recovery and business continuity plans documented and tested?", responseType: "boolean", isRequired: true, questionOrder: 24 },
      { questionText: "Are developers trained in secure coding practices?", responseType: "boolean", isRequired: true, questionOrder: 25 },
      { questionText: "Is code reviewed manually and/or using automated static analysis tools?", responseType: "boolean", isRequired: true, questionOrder: 26 },
      { questionText: "Are dependencies regularly checked and updated to patch known vulnerabilities?", responseType: "boolean", isRequired: true, questionOrder: 27 },
      { questionText: "Are security requirements incorporated into each stage of the SDLC (requirements, design, implementation, testing)?", responseType: "boolean", isRequired: true, questionOrder: 28 },
      { questionText: "Is the system compliant with relevant security standards or regulations (e.g., ISO 27001, GDPR, HIPAA)?", responseType: "boolean", isRequired: true, questionOrder: 29 },
      { questionText: "Are data retention and deletion policies clearly defined and enforced?", responseType: "boolean", isRequired: true, questionOrder: 30 }
    ]
  },
  {
    name: "Risk Assessment",
    description: "General risk assessment template",
    templateType: "Third-party AI System",
    questions: [
      { questionText: "How do you safeguard deployed AI models against risks like model inversion, tampering, or theft?", responseType: "text", isRequired: true, questionOrder: 1 },
      { questionText: "Are there established procedures to intervene manually in high-impact AI decisions, especially those involving personal or sensitive data?", responseType: "text", isRequired: true, questionOrder: 2 },
      { questionText: "Do you have controls in place to ensure AI-generated outputs are accessible and understandable to external, non-technical stakeholders?", responseType: "boolean", isRequired: true, questionOrder: 3 },
      { questionText: "Is your organization actively integrating AI-specific threat intelligence into its broader security monitoring framework?", responseType: "boolean", isRequired: true, questionOrder: 4 },
      { questionText: "What strategies are used to ensure that your AI systems remain transparent and explainable to both technical and business teams?", responseType: "text", isRequired: true, questionOrder: 5 },
      { questionText: "Do you implement version control and rollback mechanisms for your AI models to prevent unintentional changes or failures during updates?", responseType: "boolean", isRequired: true, questionOrder: 6 },
      { questionText: "How do you verify the quality and trustworthiness of data inputs, and what measures are in place to detect adversarial or poisoned data?", responseType: "text", isRequired: true, questionOrder: 7 },
      { questionText: "Are AI systems continuously observed for anomalies, biased behavior, or security-related events after deployment?", responseType: "boolean", isRequired: true, questionOrder: 8 },
      { questionText: "Is a dedicated AI incident response plan in place, and how quickly are clients or partners informed in the event of an incident?", responseType: "text", isRequired: true, questionOrder: 9 },
      { questionText: "What methods are used to test your models for bias prior to deployment, particularly in regulated or high-risk domains?", responseType: "text", isRequired: true, questionOrder: 10 },
      { questionText: "Have you conducted formal bias audits, and do you maintain a remediation process for identified issues?", responseType: "boolean", isRequired: true, questionOrder: 11 },
      { questionText: "Do you support deactivation or emergency shutdown mechanisms for your AI systems in case of critical system failures?", responseType: "boolean", isRequired: true, questionOrder: 12 },
      { questionText: "Is role-based access control (RBAC) enforced across all teams interacting with AI infrastructure and data pipelines?", responseType: "boolean", isRequired: true, questionOrder: 13 },
      { questionText: "Do you maintain detailed documentation that outlines the decision-making process of your AI models for audit or regulatory review?", responseType: "boolean", isRequired: true, questionOrder: 14 },
      { questionText: "Are adversarial stress tests conducted to evaluate the robustness of your AI systems against malicious prompts or manipulation attempts?", responseType: "boolean", isRequired: true, questionOrder: 15 },
      { questionText: "How are encryption, data masking, and anonymization applied to protect personal or regulated data in your AI workflows?", responseType: "text", isRequired: true, questionOrder: 16 },
      { questionText: "Are deployed AI models isolated in secure environments to prevent unauthorized access or interference?", responseType: "boolean", isRequired: true, questionOrder: 17 },
      { questionText: "What techniques do you use to validate or sanitize prompts and outputs to ensure safe and appropriate AI behavior?", responseType: "text", isRequired: true, questionOrder: 18 }
    ]
  },
  {
    name: "Third-party Security Assessment",
    description: "Assessment template for third-party cybersecurity systems",
    templateType: "Third-party Cybersecurity System",
    questions: [
      { questionText: "Does your org have a documented information security policy?", responseType: "boolean", isRequired: true, questionOrder: 1 },
      { questionText: "Vendor security policy?", responseType: "boolean", isRequired: true, questionOrder: 2 },
      { questionText: "For your current or proposed engagement with our org are there any dependencies on critical third party service providers?", responseType: "boolean", isRequired: true, questionOrder: 3 },
      { questionText: "Do you have data protection policy or standard in place?", responseType: "boolean", isRequired: true, questionOrder: 4 },
      { questionText: "Do you have risk management framework in place?", responseType: "boolean", isRequired: true, questionOrder: 5 },
      { questionText: "Do you conduct security assessments of third parties? If so, provide evidence of your third party reviews.", responseType: "text", isRequired: false, questionOrder: 6 },
      { questionText: "Will be third parties receiving our data?", responseType: "boolean", isRequired: true, questionOrder: 7 },
      { questionText: "Do you conduct reviews of your security policies and procedure annually?", responseType: "boolean", isRequired: true, questionOrder: 8 },
      { questionText: "How frequently update your risk management framework?", responseType: "text", isRequired: false, questionOrder: 9 },
      { questionText: "Do you conduct and require annual security awareness training for all contracts and employees?", responseType: "boolean", isRequired: true, questionOrder: 10 },
      { questionText: "Do you maintain an inventory of all assets, regualry review and update?", responseType: "boolean", isRequired: true, questionOrder: 11 },
      { questionText: "Do you have process for classifying and handling assets?", responseType: "boolean", isRequired: true, questionOrder: 12 },
      { questionText: "Do you have procedure of secure disposal?", responseType: "boolean", isRequired: true, questionOrder: 13 },
      { questionText: "Are all endpoints that connect directly to production networks centrally managed?", responseType: "boolean", isRequired: true, questionOrder: 14 },
      { questionText: "Does both standard and employee issued device security configuration/feature and required BYOD configs?", responseType: "boolean", isRequired: false, questionOrder: 15 },
      { questionText: "Do you have IAM system?", responseType: "boolean", isRequired: true, questionOrder: 16 },
      { questionText: "Do you have PAM?", responseType: "boolean", isRequired: true, questionOrder: 17 },
      { questionText: "Do you enforce MFA?", responseType: "boolean", isRequired: true, questionOrder: 18 },
      { questionText: "What is the frequency of your access reviews?", responseType: "text", isRequired: false, questionOrder: 19 },
      { questionText: "Do you have process to manage third party access?", responseType: "boolean", isRequired: true, questionOrder: 20 },
      { questionText: "Does your org apply deny-by-exception policy to prevent the use of unauthorized software?", responseType: "boolean", isRequired: true, questionOrder: 21 },
      { questionText: "Do you have SIEM in place?", responseType: "boolean", isRequired: true, questionOrder: 22 },
      { questionText: "Do you have incident response?", responseType: "boolean", isRequired: true, questionOrder: 23 },
      { questionText: "Do you conduct regular vulernabilty scans?", responseType: "boolean", isRequired: true, questionOrder: 24 },
      { questionText: "Do you have threat intelligence in palce?", responseType: "boolean", isRequired: true, questionOrder: 25 },
      { questionText: "Do you have process for handling zero-day attacks?", responseType: "boolean", isRequired: true, questionOrder: 26 }
    ]
  }
];

const seedData = async () => {
  try {
    await connectDB();
    // Clear existing templates
    await Template.deleteMany({});
    console.log('Cleared existing templates');
    // Insert sample templates
    const templates = await Template.insertMany(sampleTemplates);
    console.log(`Inserted ${templates.length} sample templates`);
    console.log('Sample data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 