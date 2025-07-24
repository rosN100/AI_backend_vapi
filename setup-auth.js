import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupAuth() {
  console.log('🚀 Setting up authentication system...');
  
  try {
    // Hash the default admin password
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    
    // Create default admin user
    const { data, error } = await supabase
      .from('users')
      .upsert({
        email: 'admin@soraaya.ai',
        password_hash: hashedPassword,
        full_name: 'System Administrator',
        role: 'admin',
        status: 'active'
      }, {
        onConflict: 'email'
      })
      .select();
    
    if (error) {
      console.error('❌ Error creating admin user:', error);
      return;
    }
    
    console.log('✅ Default admin user created/updated:');
    console.log('   Email: admin@soraaya.ai');
    console.log('   Password: admin123');
    console.log('   ⚠️  Please change this password after first login!');
    
    // Test the database connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('email, full_name, role')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError);
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log(`📊 Found ${testData.length} user(s) in database`);
    
    console.log('\n🎉 Authentication setup complete!');
    console.log('You can now:');
    console.log('1. Start your server: npm start');
    console.log('2. Visit http://localhost:3000/login');
    console.log('3. Login with admin@soraaya.ai / admin123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupAuth();
