import connectDB from './config.js';
import Template from './models/Template.js';

const sampleTemplates = [
  {
    name: "AI Project Assessment",
    description: "Comprehensive assessment for new AI projects",
    questions: [
      {
        questionText: "What is the primary objective of this AI project?",
        responseType: "text",
        isRequired: true,
        questionOrder: 1
      },
      {
        questionText: "What is the estimated budget for this project?",
        responseType: "numeric",
        isRequired: true,
        questionOrder: 2
      },
      {
        questionText: "Which departments will be involved?",
        responseType: "msq",
        isRequired: true,
        questionOrder: 3,
        options: [
          { optionText: "IT", optionOrder: 1 },
          { optionText: "Legal", optionOrder: 2 },
          { optionText: "HR", optionOrder: 3 },
          { optionText: "Finance", optionOrder: 4 },
          { optionText: "Operations", optionOrder: 5 },
          { optionText: "Marketing", optionOrder: 6 }
        ]
      },
      {
        questionText: "Does this project involve external vendors?",
        responseType: "boolean",
        isRequired: true,
        questionOrder: 4
      },
      {
        questionText: "What is the expected timeline for completion?",
        responseType: "mcq",
        isRequired: true,
        questionOrder: 5,
        options: [
          { optionText: "1-3 months", optionOrder: 1 },
          { optionText: "3-6 months", optionOrder: 2 },
          { optionText: "6-12 months", optionOrder: 3 },
          { optionText: "12+ months", optionOrder: 4 }
        ]
      }
    ]
  },
  {
    name: "Data Privacy Compliance",
    description: "Template for data privacy and compliance assessments",
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