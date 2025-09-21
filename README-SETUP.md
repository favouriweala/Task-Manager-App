# TaskFlow Setup Guide

This guide will help you set up the TaskFlow application with Supabase authentication and database.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is sufficient)
- Git (for cloning the repository)

## 1. Supabase Project Setup

### Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: TaskFlow
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be ready (usually 1-2 minutes)

### Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Project API Keys** → **anon public** (starts with `eyJ...`)
   - **Project API Keys** → **service_role** (starts with `eyJ...`)

## 2. Database Setup

### Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `scripts/setup-database.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the script

This will create:
- All necessary tables (profiles, projects, tasks, etc.)
- Row Level Security policies
- Indexes for performance
- Triggers for automatic timestamps
- A function to handle new user registration

### Verify the Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `profiles`
   - `projects`
   - `tasks`
   - `project_members`
   - `task_comments`
   - `task_attachments`

## 3. Authentication Configuration

### Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure the following settings:
   - **Enable email confirmations**: Toggle based on your preference
   - **Enable email change confirmations**: Recommended to keep enabled
   - **Enable secure password change**: Recommended to keep enabled

### Configure Site URL (Important!)

1. Still in **Authentication** → **Settings**
2. Under **Site URL**, add your development URL:
   - For local development: `http://localhost:3000`
   - For production: Your actual domain
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

## 4. Environment Variables Setup

1. In your project root, create a `.env.local` file (it should already exist)
2. Update it with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database URL (optional, for direct database access)
DATABASE_URL=postgresql://postgres:your-db-password@db.your-project.supabase.co:5432/postgres

# JWT Secret (found in Settings → API → JWT Settings)
SUPABASE_JWT_SECRET=your-jwt-secret-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## 6. Test the Setup

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Get Started" to go to the signup page
3. Create a new account with your email
4. Check your email for confirmation (if enabled)
5. Try logging in and out
6. Verify you can access the dashboard after logging in

## 7. Verify Database Integration

After creating an account:

1. Go to your Supabase dashboard → **Table Editor**
2. Check the `profiles` table
3. You should see your new user profile automatically created
4. This confirms the trigger function is working correctly

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your environment variables
   - Ensure you're using the correct anon key (not service role key) for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Authentication not working**
   - Verify your Site URL and Redirect URLs in Supabase settings
   - Check that email authentication is enabled

3. **Database connection issues**
   - Ensure the database schema was created successfully
   - Check that RLS policies are enabled

4. **Profile not created automatically**
   - Verify the trigger function was created in the SQL setup
   - Check the Supabase logs for any errors

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [Next.js Documentation](https://nextjs.org/docs)
- Look at the browser console for any JavaScript errors
- Check the Supabase dashboard logs for backend errors

## Next Steps

Once everything is working:

1. Customize the UI components in the `components/` directory
2. Add more features like project management and task creation
3. Configure email templates in Supabase for better user experience
4. Set up production deployment with proper environment variables

## Security Notes

- Never commit your `.env.local` file to version control
- Use different Supabase projects for development and production
- Regularly rotate your service role keys
- Review and test your RLS policies before going to production