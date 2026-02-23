# Database Schema — Bite Coach

> Three tables in Supabase PostgreSQL. Run these SQL scripts in Supabase SQL Editor (Day 1).

---

## Table Relationships

```
auth.users (managed by Supabase — don't touch)
    │
    └── 1 user : 1 profile  ───  profiles
                                    │
                                    ├── 1 profile : many meals  ───  meals
                                    │
                                    └── 1 profile : many daily_logs  ───  daily_logs
```

Each user has one profile. Each profile has many meals and many daily logs (one per day).

---

## Table 1: `profiles`

One row per user. Created when onboarding completes.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | uuid (PK) | Auto | Matches Supabase Auth user ID |
| email | text | Yes | User's email from signup |
| name | text | No | Display name (optional) |
| gender | text | Yes | 'male' or 'female' — needed for calorie formula |
| age | integer | Yes | Age in years |
| height_cm | decimal | Yes | Height in centimeters |
| current_weight_kg | decimal | Yes | Current weight |
| goal_weight_kg | decimal | Yes | Target weight |
| activity_level | text | Yes | 'sedentary', 'light', 'moderate', 'active', 'very_active' |
| daily_calorie_target | integer | Yes | Calculated by Mifflin-St Jeor |
| daily_protein_target_g | integer | Yes | Protein goal in grams |
| daily_carbs_target_g | integer | Yes | Carbs goal in grams |
| daily_fiber_target_g | integer | Yes | Fiber goal in grams |
| estimated_weeks_to_goal | integer | No | Projected weeks to reach goal weight |
| onboarding_completed | boolean | Yes | Default: false. Set true after onboarding. |
| created_at | timestamp | Auto | When account was created |
| updated_at | timestamp | Auto | When profile was last changed |

### SQL: Create profiles table
```sql
-- Run this in Supabase SQL Editor
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  gender text not null check (gender in ('male', 'female')),
  age integer not null check (age > 0 and age < 150),
  height_cm decimal not null check (height_cm > 0),
  current_weight_kg decimal not null check (current_weight_kg > 0),
  goal_weight_kg decimal not null check (goal_weight_kg > 0),
  activity_level text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  daily_calorie_target integer not null check (daily_calorie_target >= 1200),
  daily_protein_target_g integer not null default 0,
  daily_carbs_target_g integer not null default 0,
  daily_fiber_target_g integer not null default 0,
  estimated_weeks_to_goal integer,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

## Table 2: `meals`

One row per food entry. Created every time a user logs a meal.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | uuid (PK) | Auto | Unique meal ID |
| user_id | uuid (FK) | Yes | Links to profiles.id |
| photo_url | text | No | URL of food photo in Supabase Storage |
| food_name | text | Yes | AI-detected or user-edited name |
| calories | integer | Yes | Final calorie count (after user edits) |
| protein_g | decimal | Yes | Protein in grams |
| carbs_g | decimal | Yes | Carbs in grams |
| fiber_g | decimal | Yes | Fiber in grams |
| meal_type | text | No | 'breakfast', 'lunch', 'dinner', 'snack' |
| ai_original_calories | integer | No | What Gemini estimated before edits |
| was_edited | boolean | Yes | Did the user change the AI estimate? |
| logged_at | timestamptz | Auto | When the meal was logged |

### SQL: Create meals table
```sql
create table public.meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  photo_url text,
  food_name text not null,
  calories integer not null check (calories >= 0),
  protein_g decimal not null default 0,
  carbs_g decimal not null default 0,
  fiber_g decimal not null default 0,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  ai_original_calories integer,
  was_edited boolean not null default false,
  logged_at timestamptz not null default now()
);
```

---

## Table 3: `daily_logs`

One row per user per day. Updated every time a meal is added or deleted.

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | uuid (PK) | Auto | Unique log ID |
| user_id | uuid (FK) | Yes | Links to profiles.id |
| log_date | date | Yes | The calendar date (e.g., 2026-02-21) |
| total_calories | integer | Yes | Sum of all meals' calories |
| total_protein_g | decimal | Yes | Sum of protein |
| total_carbs_g | decimal | Yes | Sum of carbs |
| total_fiber_g | decimal | Yes | Sum of fiber |
| meals_count | integer | Yes | Number of meals logged today |
| feedback_generated | text | No | Today's coaching nudge text |
| created_at | timestamptz | Auto | When this day's log was first created |
| updated_at | timestamptz | Auto | Last update (after each meal) |

### SQL: Create daily_logs table
```sql
create table public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null,
  total_calories integer not null default 0,
  total_protein_g decimal not null default 0,
  total_carbs_g decimal not null default 0,
  total_fiber_g decimal not null default 0,
  meals_count integer not null default 0,
  feedback_generated text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Only ONE row per user per day
  unique(user_id, log_date)
);
```

---

## Row Level Security (RLS)

RLS ensures users can ONLY see and edit their own data. Without it, any logged-in user could read another user's meals.

### SQL: Enable RLS + Policies (run AFTER creating tables)
```sql
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.daily_logs enable row level security;

-- Profiles: users can only CRUD their own profile
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Meals: users can only CRUD their own meals
create policy "Users can view own meals"
  on public.meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals"
  on public.meals for insert with check (auth.uid() = user_id);
create policy "Users can update own meals"
  on public.meals for update using (auth.uid() = user_id);
create policy "Users can delete own meals"
  on public.meals for delete using (auth.uid() = user_id);

-- Daily logs: users can only CRUD their own logs
create policy "Users can view own daily_logs"
  on public.daily_logs for select using (auth.uid() = user_id);
create policy "Users can insert own daily_logs"
  on public.daily_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own daily_logs"
  on public.daily_logs for update using (auth.uid() = user_id);
create policy "Users can delete own daily_logs"
  on public.daily_logs for delete using (auth.uid() = user_id);
```

---

## Storage Bucket (Food Photos)

```sql
-- Create a private storage bucket for food photos
insert into storage.buckets (id, name, public) values ('meal-photos', 'meal-photos', false);

-- Allow authenticated users to upload their own photos
create policy "Users can upload own photos"
  on storage.objects for insert
  with check (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own photos
create policy "Users can view own photos"
  on storage.objects for select
  using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own photos
create policy "Users can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'meal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
```

Photo upload path convention: `meal-photos/{user_id}/{timestamp}.jpg`