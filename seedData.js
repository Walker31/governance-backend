import connectDB from './config.js';
import Template from './models/Template.js';

const sampleTemplates = [
  {
    name: "AI System Assessment",
    description: "Comprehensive assessment for AI systems including regulatory compliance and risk management",
    templateType: "AI System",
    questions: [
      {
        questionText: "What is the primary purpose of the AI system?",
        responseType: "text",
        isRequired: true,
        questionOrder: 1
      },
      {
        questionText: "Is the AI system considered general-purpose (e.g., GenAI, LLMs)?",
        responseType: "boolean",
        isRequired: true,
        questionOrder: 2
      },
      {
        questionText: "What type of learning model is used?",
        responseType: "mcq",
        isRequired: true,
        questionOrder: 3,
        options: [
          { optionText: "Supervised Learning", optionOrder: 1 },
          { optionText: "Unsupervised Learning", optionOrder: 2 },
          { optionText: "Reinforcement Learning", optionOrder: 3 },
          { optionText: "Transfer Learning", optionOrder: 4 },
          { optionText: "Deep Learning", optionOrder: 5 },
          { optionText: "Other", optionOrder: 6 }
        ]
      },
      {
        questionText: "From which regions or jurisdictions will data be sourced or processed?",
        responseType: "text",
        isRequired: true,
        questionOrder: 4
      },
      {
        questionText: "Will the system make autonomous decisions or provide recommendations?",
        responseType: "mcq",
        isRequired: true,
        questionOrder: 5,
        options: [
          { optionText: "Autonomous decisions", optionOrder: 1 },
          { optionText: "Provide recommendations only", optionOrder: 2 },
          { optionText: "Both autonomous decisions and recommendations", optionOrder: 3 },
          { optionText: "Neither", optionOrder: 4 }
        ]
      },
      {
        questionText: "Has a regulatory impact assessment been conducted?",
        responseType: "text",
        isRequired: true,
        questionOrder: 6
      },
      {
        questionText: "Is there human oversight of the system's outputs?",
        responseType: "boolean",
        isRequired: true,
        questionOrder: 7
      },
      {
        questionText: "What risk mitigation controls are in place (e.g., bias detection, anomaly alerts)?",
        responseType: "text",
        isRequired: true,
        questionOrder: 8
      },
      {
        questionText: "Are there fallback or escalation procedures in case of system failure or unexpected behaviour?",
        responseType: "text",
        isRequired: true,
        questionOrder: 9
      },
      {
        questionText: "Which groups or individuals are affected by this system?",
        responseType: "msq",
        isRequired: true,
        questionOrder: 10,
        options: [
          { optionText: "Employees", optionOrder: 1 },
          { optionText: "Customers", optionOrder: 2 },
          { optionText: "Vendors", optionOrder: 3 },
          { optionText: "Vulnerable populations", optionOrder: 4 },
          { optionText: "General public", optionOrder: 5 },
          { optionText: "Other", optionOrder: 6 }
        ]
      },
      {
        questionText: "Has a stakeholder impact assessment been conducted?",
        responseType: "boolean",
        isRequired: true,
        questionOrder: 11
      },
      {
        questionText: "Are there transparency mechanisms for affected individuals (e.g., opt-out, explanation of decisions)?",
        responseType: "text",
        isRequired: true,
        questionOrder: 12
      },
      {
        questionText: "Will the system process personal, sensitive, or biometric data?",
        responseType: "boolean",
        isRequired: true,
        questionOrder: 13
      }
    ]
  },
  {
    name: "Data Privacy Compliance",
    description: "Template for data privacy and compliance assessments",
    templateType: "Cybersecurity Management System",
    questions: [
      {
        questionText: "What types of personal data will be processed?",
        responseType: "msq",
        isRequired: true,
        questionOrder: 1,
        options: [
          { optionText: "Names", optionOrder: 1 },
          { optionText: "Email addresses", optionOrder: 2 },
          { optionText: "Phone numbers", optionOrder: 3 },
          { optionText: "Financial data", optionOrder: 4 },
          { optionText: "Health data", optionOrder: 5 },
          { optionText: "Location data", optionOrder: 6 }
        ]
      },
      {
        questionText: "How many data subjects will be affected?",
        responseType: "numeric",
        isRequired: true,
        questionOrder: 2
      },
      {
        questionText: "Is there a data protection officer assigned?",
        responseType: "boolean",
        isRequired: true,
        questionOrder: 3
      },
      {
        questionText: "Describe the data retention policy",
        responseType: "text",
        isRequired: false,
        questionOrder: 4
      }
    ]
  },
  {
    name: "Risk Assessment",
    description: "General risk assessment template",
    templateType: "Third-party AI System",
    questions: [
      {
        questionText: "What is the risk level of this project?",
        responseType: "mcq",
        isRequired: true,
        questionOrder: 1,
        options: [
          { optionText: "Low", optionOrder: 1 },
          { optionText: "Medium", optionOrder: 2 },
          { optionText: "High", optionOrder: 3 },
          { optionText: "Critical", optionOrder: 4 }
        ]
      },
      {
        questionText: "What are the main risk factors?",
        responseType: "text",
        isRequired: true,
        questionOrder: 2
      },
      {
        questionText: "Is there a mitigation plan in place?",
        responseType: "boolean",
        isRequired: true,
        questionOrder: 3
      }
    ]
  },
  {
    name: "Third-party Security Assessment",
    description: "Assessment template for third-party cybersecurity systems",
    templateType: "Third-party Cybersecurity System",
    questions: [
      {
        questionText: "What type of third-party cybersecurity system is being assessed?",
        responseType: "mcq",
        isRequired: true,
        questionOrder: 1,
        options: [
          { optionText: "Firewall", optionOrder: 1 },
          { optionText: "Intrusion Detection System", optionOrder: 2 },
          { optionText: "Vulnerability Scanner", optionOrder: 3 },
          { optionText: "Security Information and Event Management", optionOrder: 4 },
          { optionText: "Other", optionOrder: 5 }
        ]
      },
      {
        questionText: "What is the vendor name?",
        responseType: "text",
        isRequired: true,
        questionOrder: 2
      },
      {
        questionText: "What is the contract value?",
        responseType: "numeric",
        isRequired: true,
        questionOrder: 3
      },
      {
        questionText: "Does the vendor have SOC 2 Type II certification?",
        responseType: "boolean",
        isRequired: true,
        questionOrder: 4
      },
      {
        questionText: "Describe the security controls implemented",
        responseType: "text",
        isRequired: false,
        questionOrder: 5
      }
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