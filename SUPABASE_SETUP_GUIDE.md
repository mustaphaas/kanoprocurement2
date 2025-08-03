# Supabase Backend Setup for KanoProc E-Procurement Portal

## Why Supabase is Perfect for KanoProc

### **✅ Immediate Benefits:**

1. **Zero Backend Code** - PostgreSQL database with auto-generated REST/GraphQL APIs
2. **Built-in Authentication** - User management, roles, and permissions
3. **Real-time Features** - Live tender updates and notifications
4. **File Storage** - Document uploads with automatic CDN
5. **Row Level Security** - Data protection and audit compliance
6. **Auto-scaling** - Handles traffic spikes automatically
7. **Government Ready** - SOC2 compliant, GDPR ready

## Quick Setup (30 minutes)

### **Step 1: Create Supabase Project**

```bash
# Visit https://supabase.com
# Create new project
# Note your project URL and anon key
```

### **Step 2: Install Dependencies**

```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react
```

### **Step 3: Environment Setup**

```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **Step 4: Database Schema (Auto-created)**

```sql
-- Companies table
create table companies (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  email text unique not null,
  status text check (status in ('pending', 'approved', 'suspended', 'blacklisted')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tenders table
create table tenders (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  ministry text not null,
  category text not null,
  value numeric not null,
  deadline timestamp with time zone not null,
  status text check (status in ('draft', 'published', 'closed', 'awarded')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Bids table
create table bids (
  id uuid default gen_random_uuid() primary key,
  tender_id uuid references tenders(id),
  company_id uuid references companies(id),
  bid_amount numeric not null,
  technical_score numeric,
  financial_score numeric,
  overall_score numeric,
  status text check (status in ('submitted', 'under_review', 'qualified', 'disqualified', 'awarded')),
  submitted_at timestamp with time zone default timezone('utc'::text, now())
);

-- Audit logs table
create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  action text not null,
  resource text not null,
  resource_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table companies enable row level security;
alter table tenders enable row level security;
alter table bids enable row level security;
alter table audit_logs enable row level security;
```

### **Step 5: Authentication Setup**

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helper
export const auth = {
  signUp: async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: () => {
    return supabase.auth.getUser();
  },
};
```

### **Step 6: Real-time Integration**

```typescript
// hooks/useRealtime.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useRealtimeTenders() {
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    // Fetch initial data
    const fetchTenders = async () => {
      const { data } = await supabase
        .from("tenders")
        .select("*")
        .eq("status", "published");
      setTenders(data || []);
    };

    fetchTenders();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("tender_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tenders" },
        (payload) => {
          console.log("Tender updated:", payload);
          fetchTenders(); // Refresh data
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return tenders;
}
```

### **Step 7: File Storage Setup**

```typescript
// lib/storage.ts
import { supabase } from "./supabase";

export const storage = {
  uploadDocument: async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(path, file);

    return { data, error };
  },

  downloadDocument: async (path: string) => {
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(path, 3600); // 1 hour expiry

    return data?.signedUrl;
  },

  deleteDocument: async (path: string) => {
    const { error } = await supabase.storage.from("documents").remove([path]);

    return { error };
  },
};
```

## Advanced Features (Auto-Enabled)

### **Row Level Security Policies**

```sql
-- Companies can only see their own data
create policy "Companies can view own data" on companies
  for select using (auth.uid()::text = id::text);

-- Only admins can approve companies
create policy "Admin can update company status" on companies
  for update using (
    exists (
      select 1 from auth.users
      where auth.uid() = id
      and raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Public can view published tenders
create policy "Public can view published tenders" on tenders
  for select using (status = 'published');

-- Companies can submit bids for published tenders
create policy "Companies can submit bids" on bids
  for insert with check (
    exists (
      select 1 from tenders
      where id = tender_id
      and status = 'published'
    )
  );
```

### **Automatic Audit Logging**

```sql
-- Create audit trigger function
create or replace function audit_trigger()
returns trigger as $$
begin
  insert into audit_logs (
    user_id,
    action,
    resource,
    resource_id,
    old_values,
    new_values
  ) values (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    coalesce(NEW.id, OLD.id),
    case when TG_OP = 'DELETE' then to_jsonb(OLD) else null end,
    case when TG_OP = 'INSERT' or TG_OP = 'UPDATE' then to_jsonb(NEW) else null end
  );
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

-- Apply to all tables
create trigger audit_companies after insert or update or delete on companies
  for each row execute function audit_trigger();

create trigger audit_tenders after insert or update or delete on tenders
  for each row execute function audit_trigger();

create trigger audit_bids after insert or update or delete on bids
  for each row execute function audit_trigger();
```

### **Edge Functions for Complex Logic**

```typescript
// supabase/functions/evaluate-bids/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { tender_id } = await req.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Get all bids for tender
  const { data: bids } = await supabase
    .from("bids")
    .select("*")
    .eq("tender_id", tender_id);

  // Calculate combined scores (70% technical, 30% financial)
  const evaluatedBids = bids.map((bid) => ({
    ...bid,
    overall_score: bid.technical_score * 0.7 + bid.financial_score * 0.3,
  }));

  // Update scores in database
  for (const bid of evaluatedBids) {
    await supabase
      .from("bids")
      .update({ overall_score: bid.overall_score })
      .eq("id", bid.id);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

## Migration from Current System

### **Phase 1: Basic Setup (Week 1)**

1. Create Supabase project
2. Set up authentication
3. Migrate company registration
4. Basic tender management

### **Phase 2: Core Features (Week 2-3)**

1. Bid submission system
2. File upload/storage
3. Real-time notifications
4. Basic evaluation

### **Phase 3: Advanced Features (Week 4-6)**

1. Audit logging system
2. Advanced evaluation workflows
3. Reporting and analytics
4. Mobile optimization

## Cost & Scaling

### **Pricing (Very Affordable):**

- **Free Tier**: Up to 50,000 monthly active users
- **Pro Plan**: $25/month for production features
- **Enterprise**: Custom pricing for government requirements

### **Auto-scaling Included:**

- Database connections scale automatically
- File storage with global CDN
- Edge functions scale to zero
- No server management required

## Security & Compliance

### **Built-in Security:**

- SOC2 Type 2 compliant
- GDPR ready with data residency options
- Row Level Security (RLS) for data protection
- Automatic backups and point-in-time recovery
- SSL/TLS encryption everywhere

### **Audit & Compliance:**

- Complete audit trails
- User activity logging
- Data access monitoring
- Compliance reporting tools

## Why This Beats Other Options

### **vs. Firebase:**

✅ **SQL Database** (easier complex queries)
✅ **Better pricing** at scale
✅ **No vendor lock-in** (PostgreSQL standard)
✅ **Real-time** without complexity

### **vs. AWS:**

✅ **Much simpler** setup and management
✅ **Transparent pricing**
✅ **Faster development**
✅ **Better developer experience**

### **vs. Custom Backend:**

✅ **No server management**
✅ **Built-in best practices**
✅ **Automatic scaling**
✅ **Security by default**

## Getting Started Today

1. **Sign up**: https://supabase.com
2. **Create project**: Choose closest region
3. **Copy credentials**: Project URL + Anon Key
4. **Install SDK**: `npm install @supabase/supabase-js`
5. **Start coding**: Zero backend required!

**Estimated Setup Time**: 2-4 hours for basic functionality
**Full Migration Time**: 2-4 weeks depending on features
**Maintenance Time**: Near zero - fully managed

This approach will give you a production-ready, government-grade backend with minimal effort and maximum automation.
