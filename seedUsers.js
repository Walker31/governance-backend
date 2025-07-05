import connectDB from './config.js';
import User from './models/User.js';

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@governance.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Bob Johnson',
    email: 'bob@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Alice Brown',
    email: 'alice@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Diana Davis',
    email: 'diana@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Edward Miller',
    email: 'edward@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Fiona Garcia',
    email: 'fiona@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'George Martinez',
    email: 'george@example.com',
    password: 'user123',
    role: 'user'
  }
];

const seedUsers = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting user seeding...');
    
    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('🗑️  Cleared existing users');
    
    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log(`⚠️  Found ${existingUsers.length} existing users. Skipping user creation.`);
      console.log('💡 To recreate users, uncomment the deleteMany line in seedUsers.js');
      return;
    }
    
    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      try {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
        } else {
          console.error(`❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 User seeding completed!`);
    console.log(`📊 Created ${createdUsers.length} users`);
    
    // Display sample credentials
    console.log('\n🔑 Sample Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 Admin User:');
    console.log('   Email: admin@governance.com');
    console.log('   Password: admin123');
    console.log('   Permissions: Full access to all features');
    console.log('');
    console.log('👤 Regular Users:');
    console.log('   Email: john@example.com (or any other user email)');
    console.log('   Password: user123');
    console.log('   Permissions: View templates, create responses');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error during user seeding:', error);
  } finally {
    process.exit(0);
  }
};

seedUsers(); 