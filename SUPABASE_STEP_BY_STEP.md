# Supabase Integration - Complete Step-by-Step Guide for KanoProc

## ⏱️ Total Time: 45-60 minutes

## 🎯 Outcome: Full backend with database, auth, storage, and real-time features

---

## **STEP 1: Create Supabase Account & Project (5 minutes)**

### 1.1 Sign Up

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if using email signup

### 1.2 Create New Project

1. Click **"New Project"**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `kanoproc-backend`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to Nigeria (Europe West recommended)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### 1.3 Get Project Credentials

1. Go to **Settings** → **API**
2. Copy and save these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Project API Key (anon public)**: `eyJhbGciOiJIUzI1...`

---

## **STEP 2: Install Dependencies (2 minutes)**

### 2.1 Install Supabase Client

```bash
# In your project root directory
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react
npm install @supabase/auth-ui-react
npm install @supabase/auth-ui-shared
```

### 2.2 Install Additional Utilities (Optional)

```bash
npm install uuid @types/uuid
```

---

## **STEP 3: Environment Configuration (3 minutes)**

### 3.1 Create Environment File

Create `.env.local` in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Additional settings
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3.2 Update .gitignore

Make sure `.env.local` is in your `.gitignore`:

```gitignore
# Environment files
.env.local
.env
```

---

## **STEP 4: Setup Supabase Client (5 minutes)**

### 4.1 Create Supabase Client

Create `client/lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (we'll expand this later)
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          company_name: string;
          email: string;
          status: "pending" | "approved" | "suspended" | "blacklisted";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          email: string;
          status?: "pending" | "approved" | "suspended" | "blacklisted";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          email?: string;
          status?: "pending" | "approved" | "suspended" | "blacklisted";
          created_at?: string;
          updated_at?: string;
        };
      };
      tenders: {
        Row: {
          id: string;
          title: string;
          description: string;
          ministry: string;
          category: string;
          value: number;
          deadline: string;
          status: "draft" | "published" | "closed" | "awarded";
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          ministry: string;
          category: string;
          value: number;
          deadline: string;
          status?: "draft" | "published" | "closed" | "awarded";
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          ministry?: string;
          category?: string;
          value?: number;
          deadline?: string;
          status?: "draft" | "published" | "closed" | "awarded";
          created_at?: string;
        };
      };
    };
  };
}
```

### 4.2 Create Authentication Context

Create `client/contexts/SupabaseAuthContext.tsx`:

```typescript
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

---

## **STEP 5: Database Schema Setup (10 minutes)**

### 5.1 Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the sidebar
3. Click **"New query"**

### 5.2 Create Database Tables

Copy and paste this SQL to create your tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create companies table
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  company_name text not null,
  email text unique not null,
  phone text,
  address text,
  registration_number text,
  business_type text,
  status text check (status in ('pending', 'approved', 'suspended', 'blacklisted')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tenders table
create table public.tenders (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  ministry text not null,
  category text not null,
  value numeric not null,
  deadline timestamp with time zone not null,
  location text,
  status text check (status in ('draft', 'published', 'closed', 'awarded')) default 'draft',
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bids table
create table public.bids (
  id uuid default uuid_generate_v4() primary key,
  tender_id uuid references public.tenders(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  bid_amount numeric not null,
  completion_timeline integer, -- days
  technical_score numeric,
  financial_score numeric,
  overall_score numeric,
  status text check (status in ('submitted', 'under_review', 'qualified', 'disqualified', 'awarded')) default 'submitted',
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create documents table
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  document_type text not null,
  document_name text not null,
  file_path text not null,
  file_size integer,
  mime_type text,
  status text check (status in ('pending', 'verified', 'rejected')) default 'pending',
  expiry_date date,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create audit_logs table
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  resource text not null,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers
create trigger handle_companies_updated_at before update on public.companies
  for each row execute procedure public.handle_updated_at();

create trigger handle_tenders_updated_at before update on public.tenders
  for each row execute procedure public.handle_updated_at();

create trigger handle_bids_updated_at before update on public.bids
  for each row execute procedure public.handle_updated_at();
```

### 5.3 Execute the Query

1. Click **"Run"** button
2. You should see "Success. No rows returned" message
3. Go to **"Table Editor"** to verify tables were created

---

## **STEP 6: Row Level Security (RLS) Setup (5 minutes)**

### 6.1 Enable RLS and Create Policies

Run this SQL to set up security:

```sql
-- Enable Row Level Security
alter table public.companies enable row level security;
alter table public.tenders enable row level security;
alter table public.bids enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;

-- Companies policies
create policy "Public can view approved companies" on public.companies
  for select using (status = 'approved');

create policy "Companies can view own data" on public.companies
  for select using (auth.uid()::text = id::text);

create policy "Companies can update own data" on public.companies
  for update using (auth.uid()::text = id::text);

-- Tenders policies
create policy "Public can view published tenders" on public.tenders
  for select using (status = 'published');

create policy "Admins can manage tenders" on public.tenders
  for all using (
    exists (
      select 1 from auth.users
      where auth.uid() = id
      and raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Bids policies
create policy "Companies can view own bids" on public.bids
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = bids.company_id
      and auth.uid()::text = companies.id::text
    )
  );

create policy "Companies can insert own bids" on public.bids
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = bids.company_id
      and auth.uid()::text = companies.id::text
    )
  );

-- Documents policies
create policy "Companies can manage own documents" on public.documents
  for all using (
    exists (
      select 1 from public.companies
      where companies.id = documents.company_id
      and auth.uid()::text = companies.id::text
    )
  );

-- Audit logs policies
create policy "Users can view own audit logs" on public.audit_logs
  for select using (auth.uid() = user_id);
```

---

## **STEP 7: Storage Setup (3 minutes)**

### 7.1 Create Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **"New bucket"**
3. Create these buckets:
   - **Name**: `documents`
   - **Public**: No (unchecked)
   - Click **"Create bucket"**

### 7.2 Set Storage Policies

Click on the `documents` bucket → **Policies** → **New policy**:

```sql
-- Allow companies to upload their own documents
create policy "Companies can upload own documents" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow companies to view their own documents
create policy "Companies can view own documents" on storage.objects
  for select using (
    bucket_id = 'documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## **STEP 8: Update Your App.tsx (5 minutes)**

### 8.1 Wrap App with Auth Provider

Update your `client/App.tsx`:

```typescript
import { AuthProvider } from './contexts/SupabaseAuthContext'
// ... your existing imports

function App() {
  return (
    <AuthProvider>
      {/* Your existing app content */}
      <BrowserRouter>
        <Routes>
          {/* Your existing routes */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
```

---

## **STEP 9: Update Authentication Pages (10 minutes)**

### 9.1 Update Company Login

Update your `client/pages/CompanyLogin.tsx`:

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/SupabaseAuthContext'
// ... your existing imports

export default function CompanyLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
    } else {
      navigate('/company/dashboard')
    }

    setLoading(false)
  }

  return (
    // Your existing JSX with updated form handling
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
```

---

## **STEP 10: Create Data Hooks (5 minutes)**

### 10.1 Create Custom Hooks

Create `client/hooks/useSupabaseData.ts`:

```typescript
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Database } from "../lib/supabase";

type Tables = Database["public"]["Tables"];

export function useTenders() {
  const [tenders, setTenders] = useState<Tables["tenders"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenders() {
      try {
        const { data, error } = await supabase
          .from("tenders")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTenders(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchTenders();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("tender_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tenders" },
        () => {
          fetchTenders(); // Refresh when changes occur
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { tenders, loading, error };
}

export function useCompanyData() {
  const [company, setCompany] = useState<Tables["companies"]["Row"] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompany() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchCompany();
  }, []);

  return { company, loading, error };
}
```

---

## **STEP 11: Test Your Setup (5 minutes)**

### 11.1 Insert Test Data

Go to Supabase **Table Editor** → **tenders** → **Insert** → **Insert row**:

```json
{
  "title": "Test Road Construction Project",
  "description": "Building 10km of rural roads",
  "ministry": "Ministry of Works",
  "category": "Infrastructure",
  "value": 2500000000,
  "deadline": "2024-03-15T23:59:59Z",
  "location": "Kano North LGA",
  "status": "published"
}
```

### 11.2 Test Authentication

1. Try registering a new user
2. Check if you can sign in
3. Verify user appears in Supabase **Authentication** → **Users**

### 11.3 Test Real-time Updates

1. Open your app in two browser tabs
2. Update a tender in Supabase dashboard
3. See if changes appear in both tabs

---

## **STEP 12: Deploy Environment Variables (2 minutes)**

### 12.1 Production Environment

For production deployment, add these environment variables to your hosting platform:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## **🎉 CONGRATULATIONS! You're Done!**

### **What You Now Have:**

✅ **PostgreSQL Database** with all your tables
✅ **Authentication System** with user management
✅ **File Storage** for document uploads
✅ **Real-time Updates** for live data
✅ **Row Level Security** for data protection
✅ **Auto-generated APIs** for all operations
✅ **Audit Logging** system ready
✅ **Auto-scaling** infrastructure

### **Next Steps:**

1. **Update your existing components** to use Supabase data
2. **Implement file upload** for documents
3. **Add real-time notifications**
4. **Set up email confirmations**
5. **Add admin dashboard** for tender management

### **Common Issues & Solutions:**

**Issue**: "Invalid API key"
**Solution**: Check your `.env.local` file and restart dev server

**Issue**: "Row Level Security violation"
**Solution**: Make sure user is authenticated and policies are correct

**Issue**: "Cannot insert data"
**Solution**: Check RLS policies and user permissions

### **Getting Help:**

- **Supabase Docs**: https://supabase.com/docs
- **Discord Community**: https://discord.supabase.com
- **GitHub Issues**: Post specific questions with code examples

You now have a production-ready backend that can scale to millions of users! 🚀
