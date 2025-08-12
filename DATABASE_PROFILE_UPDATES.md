# Profile Management Database Schema Updates

This document outlines the database schema updates required for comprehensive profile management, including completion tracking and update logging.

## New Tables

### 1. Profile Completion Tracking

```sql
-- Table to track profile completion status
CREATE TABLE profile_completion (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  completed_fields TEXT[] NOT NULL DEFAULT '{}',
  missing_fields TEXT[] NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT completion_percentage_range CHECK (completion_percentage >= 0 AND completion_percentage <= 100)
);

-- Index for efficient queries
CREATE INDEX idx_profile_completion_percentage ON profile_completion(completion_percentage);
CREATE INDEX idx_profile_completion_updated ON profile_completion(last_updated);
```

### 2. Profile Update Logs

```sql
-- Table to log all profile updates for audit trail
CREATE TABLE profile_update_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  updated_fields TEXT[] NOT NULL,
  old_values JSONB NOT NULL DEFAULT '{}',
  new_values JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID NOT NULL REFERENCES profiles(id),
  
  -- Additional metadata
  ip_address INET,
  user_agent TEXT,
  source VARCHAR(50) DEFAULT 'web' -- web, mobile, admin, etc.
);

-- Indexes for efficient queries
CREATE INDEX idx_profile_update_logs_profile_id ON profile_update_logs(profile_id);
CREATE INDEX idx_profile_update_logs_updated_at ON profile_update_logs(updated_at);
CREATE INDEX idx_profile_update_logs_updated_by ON profile_update_logs(updated_by);
```

### 3. Profile Images Storage

```sql
-- Table to manage profile images and photos
CREATE TABLE profile_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(20) NOT NULL DEFAULT 'avatar', -- avatar, photo
  file_size INTEGER,
  mime_type VARCHAR(50),
  width INTEGER,
  height INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_image_type CHECK (image_type IN ('avatar', 'photo'))
);

-- Indexes
CREATE INDEX idx_profile_images_profile_id ON profile_images(profile_id);
CREATE INDEX idx_profile_images_type ON profile_images(image_type);
CREATE INDEX idx_profile_images_primary ON profile_images(profile_id, is_primary) WHERE is_primary = TRUE;
```

## Updated Profile Table

```sql
-- Add new fields to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS search_radius INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS total_profile_updates INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE profiles 
ADD CONSTRAINT search_radius_range CHECK (search_radius >= 5 AND search_radius <= 100),
ADD CONSTRAINT completion_percentage_range CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_search_radius ON profiles(search_radius);
CREATE INDEX IF NOT EXISTS idx_profiles_completion_percentage ON profiles(profile_completion_percentage);
CREATE INDEX IF NOT EXISTS idx_profiles_last_update ON profiles(last_profile_update);
```

## Database Functions

### 1. Update Profile Completion

```sql
-- Function to automatically update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_percentage INTEGER;
  completed_fields TEXT[];
  missing_fields TEXT[];
  profile_record profiles%ROWTYPE;
BEGIN
  -- Get the profile record
  SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Initialize arrays
  completed_fields := '{}';
  missing_fields := '{}';
  
  -- Check required fields
  IF profile_record.full_name IS NOT NULL AND profile_record.full_name != '' THEN
    completed_fields := array_append(completed_fields, 'full_name');
  ELSE
    missing_fields := array_append(missing_fields, 'full_name');
  END IF;
  
  IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
    completed_fields := array_append(completed_fields, 'bio');
  ELSE
    missing_fields := array_append(missing_fields, 'bio');
  END IF;
  
  IF profile_record.handicap IS NOT NULL THEN
    completed_fields := array_append(completed_fields, 'handicap');
  ELSE
    missing_fields := array_append(missing_fields, 'handicap');
  END IF;
  
  IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
    completed_fields := array_append(completed_fields, 'location');
  ELSE
    missing_fields := array_append(missing_fields, 'location');
  END IF;
  
  IF profile_record.preferred_times IS NOT NULL AND array_length(profile_record.preferred_times, 1) > 0 THEN
    completed_fields := array_append(completed_fields, 'preferred_times');
  ELSE
    missing_fields := array_append(missing_fields, 'preferred_times');
  END IF;
  
  IF profile_record.playing_style IS NOT NULL THEN
    completed_fields := array_append(completed_fields, 'playing_style');
  ELSE
    missing_fields := array_append(missing_fields, 'playing_style');
  END IF;
  
  IF profile_record.pace_of_play IS NOT NULL THEN
    completed_fields := array_append(completed_fields, 'pace_of_play');
  ELSE
    missing_fields := array_append(missing_fields, 'pace_of_play');
  END IF;
  
  IF profile_record.preferred_group_size IS NOT NULL THEN
    completed_fields := array_append(completed_fields, 'preferred_group_size');
  ELSE
    missing_fields := array_append(missing_fields, 'preferred_group_size');
  END IF;
  
  -- Check optional fields
  IF profile_record.avatar_url IS NOT NULL AND profile_record.avatar_url != '' THEN
    completed_fields := array_append(completed_fields, 'avatar_url');
  ELSE
    missing_fields := array_append(missing_fields, 'avatar_url');
  END IF;
  
  IF profile_record.home_course IS NOT NULL AND profile_record.home_course != '' THEN
    completed_fields := array_append(completed_fields, 'home_course');
  ELSE
    missing_fields := array_append(missing_fields, 'home_course');
  END IF;
  
  IF profile_record.favorite_courses IS NOT NULL AND array_length(profile_record.favorite_courses, 1) > 0 THEN
    completed_fields := array_append(completed_fields, 'favorite_courses');
  ELSE
    missing_fields := array_append(missing_fields, 'favorite_courses');
  END IF;
  
  IF profile_record.photos IS NOT NULL AND array_length(profile_record.photos, 1) > 0 THEN
    completed_fields := array_append(completed_fields, 'photos');
  ELSE
    missing_fields := array_append(missing_fields, 'photos');
  END IF;
  
  -- Calculate completion percentage
  -- Required fields count for 80%, optional for 20%
  completion_percentage := ROUND(
    (array_length(completed_fields, 1)::FLOAT / 12.0) * 100
  );
  
  -- Update or insert completion record
  INSERT INTO profile_completion (
    profile_id, 
    completion_percentage, 
    completed_fields, 
    missing_fields,
    last_updated
  ) VALUES (
    profile_id, 
    completion_percentage, 
    completed_fields, 
    missing_fields,
    NOW()
  )
  ON CONFLICT (profile_id) 
  DO UPDATE SET
    completion_percentage = EXCLUDED.completion_percentage,
    completed_fields = EXCLUDED.completed_fields,
    missing_fields = EXCLUDED.missing_fields,
    last_updated = NOW();
  
  -- Update profiles table
  UPDATE profiles 
  SET 
    profile_completion_percentage = completion_percentage,
    last_profile_update = NOW()
  WHERE id = profile_id;
  
  RETURN completion_percentage;
END;
$$ LANGUAGE plpgsql;
```

### 2. Log Profile Update

```sql
-- Function to log profile updates
CREATE OR REPLACE FUNCTION log_profile_update(
  profile_id UUID,
  updated_fields TEXT[],
  old_values JSONB,
  new_values JSONB,
  updated_by UUID,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  source VARCHAR(50) DEFAULT 'web'
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO profile_update_logs (
    profile_id,
    updated_fields,
    old_values,
    new_values,
    updated_by,
    ip_address,
    user_agent,
    source
  ) VALUES (
    profile_id,
    updated_fields,
    old_values,
    new_values,
    updated_by,
    ip_address,
    user_agent,
    source
  ) RETURNING id INTO log_id;
  
  -- Update total updates counter
  UPDATE profiles 
  SET total_profile_updates = total_profile_updates + 1
  WHERE id = profile_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;
```

## Triggers

### 1. Auto-update completion on profile changes

```sql
-- Trigger to automatically update completion when profile is updated
CREATE OR REPLACE FUNCTION trigger_update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update completion if relevant fields changed
  IF (OLD.full_name IS DISTINCT FROM NEW.full_name OR
      OLD.bio IS DISTINCT FROM NEW.bio OR
      OLD.handicap IS DISTINCT FROM NEW.handicap OR
      OLD.location IS DISTINCT FROM NEW.location OR
      OLD.preferred_times IS DISTINCT FROM NEW.preferred_times OR
      OLD.playing_style IS DISTINCT FROM NEW.playing_style OR
      OLD.pace_of_play IS DISTINCT FROM NEW.pace_of_play OR
      OLD.preferred_group_size IS DISTINCT FROM NEW.preferred_group_size OR
      OLD.avatar_url IS DISTINCT FROM NEW.avatar_url OR
      OLD.home_course IS DISTINCT FROM NEW.home_course OR
      OLD.favorite_courses IS DISTINCT FROM NEW.favorite_courses OR
      OLD.photos IS DISTINCT FROM NEW.photos) THEN
    
    PERFORM update_profile_completion(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_completion_update
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_profile_completion();
```

### 2. Updated timestamp trigger

```sql
-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profile_completion_updated_at
  BEFORE UPDATE ON profile_completion
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
```

## Row Level Security (RLS)

```sql
-- Enable RLS on new tables
ALTER TABLE profile_completion ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_update_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_images ENABLE ROW LEVEL SECURITY;

-- Profile completion policies
CREATE POLICY "Users can view own completion data" ON profile_completion
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Users can update own completion data" ON profile_completion
  FOR ALL USING (profile_id = auth.uid());

-- Profile update logs policies
CREATE POLICY "Users can view own update logs" ON profile_update_logs
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "System can insert update logs" ON profile_update_logs
  FOR INSERT WITH CHECK (true);

-- Profile images policies
CREATE POLICY "Users can manage own images" ON profile_images
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "Public can view profile images" ON profile_images
  FOR SELECT USING (true);
```

## Storage Bucket Setup

```sql
-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true);

-- Set up storage policies
CREATE POLICY "Users can upload own profile images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own profile images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own profile images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');
```

## Indexes for Performance

```sql
-- Additional performance indexes
CREATE INDEX idx_profiles_completion_updated ON profiles(profile_completion_percentage, last_profile_update);
CREATE INDEX idx_profile_completion_missing_fields ON profile_completion USING gin(missing_fields);
CREATE INDEX idx_profile_update_logs_fields ON profile_update_logs USING gin(updated_fields);
CREATE INDEX idx_profile_update_logs_values ON profile_update_logs USING gin(old_values, new_values);
```

## Migration Script

```sql
-- Run this script to apply all changes
BEGIN;

-- Create new tables
\i create_profile_completion.sql
\i create_profile_update_logs.sql
\i create_profile_images.sql

-- Update existing table
\i update_profiles_table.sql

-- Create functions
\i create_profile_functions.sql

-- Create triggers
\i create_profile_triggers.sql

-- Set up RLS
\i setup_profile_rls.sql

-- Create indexes
\i create_profile_indexes.sql

-- Initialize completion for existing profiles
INSERT INTO profile_completion (profile_id)
SELECT id FROM profiles
ON CONFLICT (profile_id) DO NOTHING;

-- Update completion for all existing profiles
SELECT update_profile_completion(id) FROM profiles;

COMMIT;
```

This comprehensive schema update provides:

1. **Complete profile field tracking** - All fields can be updated and tracked
2. **Completion percentage calculation** - Automatic calculation based on filled fields
3. **Update history logging** - Full audit trail of all profile changes
4. **Timestamp tracking** - All updates are timestamped
5. **Performance optimization** - Proper indexes for efficient queries
6. **Security** - Row-level security policies
7. **Image management** - Dedicated table for profile images
8. **Automatic triggers** - Updates happen automatically when profiles change