import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createUser() {
  console.log('\n🆕 Creating a new user...\n');
  
  try {
    const email = await question('Email: ');
    const fullName = await question('Full Name: ');
    const password = await question('Password: ');
    const role = await question('Role (admin/user/viewer) [user]: ') || 'user';
    
    if (!email || !fullName || !password) {
      console.log('❌ Email, full name, and password are required');
      return;
    }
    
    if (!['admin', 'user', 'viewer'].includes(role)) {
      console.log('❌ Role must be admin, user, or viewer');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        role,
        status: 'active'
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        console.log('❌ User with this email already exists');
      } else {
        console.log('❌ Error creating user:', error.message);
      }
      return;
    }
    
    console.log('✅ User created successfully!');
    console.log(`   ID: ${data.id}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Name: ${data.full_name}`);
    console.log(`   Role: ${data.role}`);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function listUsers() {
  console.log('\n👥 Current users:\n');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, status, last_login, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No users found');
      return;
    }
    
    console.table(data.map(user => ({
      Email: user.email,
      Name: user.full_name,
      Role: user.role,
      Status: user.status,
      'Last Login': user.last_login ? new Date(user.last_login).toLocaleString() : 'Never',
      Created: new Date(user.created_at).toLocaleDateString()
    })));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function listAccessRequests() {
  console.log('\n📋 Access requests:\n');
  
  try {
    const { data, error } = await supabase
      .from('access_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error fetching requests:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No access requests found');
      return;
    }
    
    console.table(data.map(req => ({
      Email: req.email,
      Name: req.full_name,
      Company: req.company || '-',
      Status: req.status,
      Requested: new Date(req.requested_at).toLocaleDateString(),
      Reason: req.reason ? req.reason.substring(0, 50) + '...' : '-'
    })));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function approveRequest() {
  await listAccessRequests();
  
  const email = await question('\nEnter email to approve: ');
  if (!email) return;
  
  try {
    // Get the request
    const { data: requests, error: fetchError } = await supabase
      .from('access_requests')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .limit(1);
    
    if (fetchError || !requests || requests.length === 0) {
      console.log('❌ No pending request found for this email');
      return;
    }
    
    const request = requests[0];
    const password = await question('Set password for new user: ');
    
    if (!password) {
      console.log('❌ Password is required');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        email: request.email,
        password_hash: hashedPassword,
        full_name: request.full_name,
        role: 'user',
        status: 'active'
      })
      .select()
      .single();
    
    if (userError) {
      console.log('❌ Error creating user:', userError.message);
      return;
    }
    
    // Update request status
    const { error: updateError } = await supabase
      .from('access_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        notes: 'Approved and user account created'
      })
      .eq('id', request.id);
    
    if (updateError) {
      console.log('⚠️ User created but failed to update request status');
    }
    
    console.log('✅ Access request approved and user created!');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Password: ${password}`);
    console.log('   Please share these credentials with the user');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function main() {
  console.log('🔐 Soraaya AI User Management');
  console.log('============================');
  
  while (true) {
    console.log('\nOptions:');
    console.log('1. Create new user');
    console.log('2. List all users');
    console.log('3. List access requests');
    console.log('4. Approve access request');
    console.log('5. Exit');
    
    const choice = await question('\nSelect option (1-5): ');
    
    switch (choice) {
      case '1':
        await createUser();
        break;
      case '2':
        await listUsers();
        break;
      case '3':
        await listAccessRequests();
        break;
      case '4':
        await approveRequest();
        break;
      case '5':
        console.log('👋 Goodbye!');
        rl.close();
        return;
      default:
        console.log('❌ Invalid option');
    }
  }
}

main().catch(console.error);
