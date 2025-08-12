# Database Setup for Premium Features

This guide will help you set up the database schema for the Golf Buddy Matcher premium features.

## Prerequisites

1. A Supabase project set up
2. Access to your Supabase SQL editor
3. Basic knowledge of PostgreSQL

## Setup Instructions

### 1. Run the Migration Script

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `database-migrations.sql`
4. Click "Run" to execute the migration

### 2. Verify the Setup

After running the migration, you should see:

#### New Tables Created:
- `subscription_plans` - Stores available subscription plans
- `user_subscriptions` - Tracks user subscriptions
- `daily_usage` - Tracks daily like usage for free users
- `profile_boosts` - Manages profile boost functionality
- `incoming_likes` - Stores incoming likes for premium users

#### Updated Tables:
- `profiles` - Added subscription fields

#### New Functions:
- `get_user_subscription(user_id)` - Get user's current subscription
- `get_daily_usage(user_id, usage_date)` - Get daily usage stats
- `record_like(user_id)` - Record a like and check limits
- `get_incoming_likes(user_id)` - Get incoming likes for a user

#### New Triggers:
- `trigger_create_incoming_like` - Automatically creates incoming like records
- `update_*_updated_at` - Automatically updates timestamps

### 3. Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Test the Setup

1. Start your development server: `npm run dev`
2. Visit http://localhost:3000
3. Test the premium features:
   - Go to `/pricing` to see subscription plans
   - Go to `/matching` to test like limits
   - Go to `/who-liked-you` to test premium feature gating
   - Check the dashboard for subscription status

## Database Schema Overview

### Profiles Table (Updated)
```sql
-- New subscription fields added
subscription_tier TEXT DEFAULT 'free'
subscription_status TEXT DEFAULT 'active'
subscription_expires_at TIMESTAMP WITH TIME ZONE
subscription_plan_id TEXT
```

### Subscription Plans Table
```sql
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT NOT NULL,
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  is_popular BOOLEAN DEFAULT false
);
```

### User Subscriptions Table
```sql
CREATE TABLE user_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id),
  plan_id TEXT REFERENCES subscription_plans(id),
  tier TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false
);
```

### Daily Usage Table
```sql
CREATE TABLE daily_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES profiles(id),
  date DATE NOT NULL,
  likes_used INTEGER DEFAULT 0,
  likes_remaining INTEGER DEFAULT 15,
  reset_date TIMESTAMP WITH TIME ZONE NOT NULL
);
```

## Row Level Security (RLS)

The migration includes comprehensive RLS policies to ensure:

- Users can only see their own subscription data
- Users can only see their own daily usage
- Users can only see incoming likes for their own profile
- Subscription plans are readable by all authenticated users

## Functions and Triggers

### Key Functions:
1. **`record_like(user_id)`** - Handles like recording and limit checking
2. **`get_user_subscription(user_id)`** - Retrieves current subscription
3. **`get_daily_usage(user_id, date)`** - Gets daily usage statistics
4. **`get_incoming_likes(user_id)`** - Retrieves incoming likes

### Key Triggers:
1. **`trigger_create_incoming_like`** - Automatically creates incoming like records when someone swipes
2. **`update_*_updated_at`** - Automatically updates timestamp fields

## Troubleshooting

### Common Issues:

1. **"Function not found" errors**
   - Make sure you ran the entire migration script
   - Check that all functions were created successfully

2. **RLS policy errors**
   - Verify that RLS is enabled on all tables
   - Check that policies are created correctly

3. **Permission errors**
   - Ensure your Supabase anon key has the correct permissions
   - Check that RLS policies allow the operations you're trying to perform

### Verification Queries:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'user_subscriptions', 'daily_usage', 'profile_boosts', 'incoming_likes');

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_subscription', 'get_daily_usage', 'record_like', 'get_incoming_likes');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Next Steps

After setting up the database:

1. **Test the premium features** in your development environment
2. **Set up payment processing** (Stripe, etc.) for real subscriptions
3. **Configure webhooks** for subscription lifecycle events
4. **Set up monitoring** for subscription usage and limits
5. **Implement admin dashboard** for subscription management

## Support

If you encounter any issues:

1. Check the Supabase logs in your dashboard
2. Verify all migration steps were completed
3. Test with the verification queries above
4. Check the browser console for any JavaScript errors

The database setup provides a solid foundation for all premium features while maintaining security and performance. 