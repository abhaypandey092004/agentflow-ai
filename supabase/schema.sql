-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Tables
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null unique,
  email text not null,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table agents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table workflows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  agent_id uuid references agents on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table workflow_steps (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid references workflows on delete cascade not null,
  name text not null,
  type text not null check (type in ('research', 'summarize', 'generate', 'rewrite', 'extract', 'custom')),
  prompt text not null,
  model text default 'gpt-4o-mini',
  order_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table workflow_executions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  workflow_id uuid references workflows on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  result text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table step_executions (
  id uuid primary key default uuid_generate_v4(),
  execution_id uuid references workflow_executions on delete cascade not null,
  step_id uuid references workflow_steps on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  result text,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table prompt_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  prompt text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table uploaded_files (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  file_name text not null,
  file_url text not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete set null,
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Indexes
create index idx_profiles_user_id on profiles(user_id);
create index idx_agents_user_id on agents(user_id);
create index idx_workflows_user_id on workflows(user_id);
create index idx_workflows_agent_id on workflows(agent_id);
create index idx_workflow_steps_workflow_id on workflow_steps(workflow_id);
create index idx_workflow_executions_user_id on workflow_executions(user_id);
create index idx_workflow_executions_workflow_id on workflow_executions(workflow_id);
create index idx_step_executions_execution_id on step_executions(execution_id);
create index idx_uploaded_files_user_id on uploaded_files(user_id);
create index idx_audit_logs_user_id on audit_logs(user_id);

-- 3. Enable RLS
alter table profiles enable row level security;
alter table agents enable row level security;
alter table workflows enable row level security;
alter table workflow_steps enable row level security;
alter table workflow_executions enable row level security;
alter table step_executions enable row level security;
alter table prompt_templates enable row level security;
alter table uploaded_files enable row level security;
alter table audit_logs enable row level security;

-- 4. RLS Policies
-- Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = user_id);

-- Agents
create policy "Users can view own agents" on agents for select using (auth.uid() = user_id);
create policy "Users can insert own agents" on agents for insert with check (auth.uid() = user_id);
create policy "Users can update own agents" on agents for update using (auth.uid() = user_id);
create policy "Users can delete own agents" on agents for delete using (auth.uid() = user_id);

-- Workflows
create policy "Users can view own workflows" on workflows for select using (auth.uid() = user_id);
create policy "Users can insert own workflows" on workflows for insert with check (auth.uid() = user_id);
create policy "Users can update own workflows" on workflows for update using (auth.uid() = user_id);
create policy "Users can delete own workflows" on workflows for delete using (auth.uid() = user_id);

-- Workflow Steps (Derived from Workflow)
create policy "Users can view own workflow steps" on workflow_steps for select using (
  exists (select 1 from workflows where workflows.id = workflow_steps.workflow_id and workflows.user_id = auth.uid())
);
create policy "Users can insert own workflow steps" on workflow_steps for insert with check (
  exists (select 1 from workflows where workflows.id = workflow_steps.workflow_id and workflows.user_id = auth.uid())
);
create policy "Users can update own workflow steps" on workflow_steps for update using (
  exists (select 1 from workflows where workflows.id = workflow_steps.workflow_id and workflows.user_id = auth.uid())
);
create policy "Users can delete own workflow steps" on workflow_steps for delete using (
  exists (select 1 from workflows where workflows.id = workflow_steps.workflow_id and workflows.user_id = auth.uid())
);

-- Workflow Executions
create policy "Users can view own executions" on workflow_executions for select using (auth.uid() = user_id);
create policy "Users can insert own executions" on workflow_executions for insert with check (auth.uid() = user_id);
create policy "Users can update own executions" on workflow_executions for update using (auth.uid() = user_id);
create policy "Users can delete own executions" on workflow_executions for delete using (auth.uid() = user_id);

-- Step Executions (Derived from Executions)
create policy "Users can view own step executions" on step_executions for select using (
  exists (select 1 from workflow_executions where workflow_executions.id = step_executions.execution_id and workflow_executions.user_id = auth.uid())
);
create policy "Users can insert own step executions" on step_executions for insert with check (
  exists (select 1 from workflow_executions where workflow_executions.id = step_executions.execution_id and workflow_executions.user_id = auth.uid())
);
create policy "Users can update own step executions" on step_executions for update using (
  exists (select 1 from workflow_executions where workflow_executions.id = step_executions.execution_id and workflow_executions.user_id = auth.uid())
);
create policy "Users can delete own step executions" on step_executions for delete using (
  exists (select 1 from workflow_executions where workflow_executions.id = step_executions.execution_id and workflow_executions.user_id = auth.uid())
);

-- Prompt Templates
-- CRITICAL SECURITY: Public read access for templates. 
-- Write access (INSERT/UPDATE/DELETE) is restricted to the service role (backend only).
create policy "Templates are viewable by everyone" on prompt_templates for select using (true);

-- Uploaded Files
create policy "Users can view own uploaded files" on uploaded_files for select using (auth.uid() = user_id);
create policy "Users can insert own uploaded files" on uploaded_files for insert with check (auth.uid() = user_id);
create policy "Users can delete own uploaded files" on uploaded_files for delete using (auth.uid() = user_id);
-- Secure UPDATE policy: Users can only update their own files.
-- Field-level security is enforced at the application layer to prevent hijacking sensitive paths.
create policy "Users can update own uploaded files" on uploaded_files for update using (auth.uid() = user_id);

-- Audit Logs
create policy "Users can view own audit logs" on audit_logs for select using (auth.uid() = user_id);
create policy "Users can insert own audit logs" on audit_logs for insert with check (auth.uid() = user_id);

-- 5. Performance Optimization Indexes
-- Optimize audit logs for chronological retrieval and per-user filtering
create index if not exists idx_audit_logs_created_at on audit_logs(created_at desc);
create index if not exists idx_audit_logs_user_id_created_at on audit_logs(user_id, created_at desc);

-- Trigger function for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to tables
create trigger handle_updated_at_profiles before update on profiles for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_agents before update on agents for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_workflows before update on workflows for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_workflow_steps before update on workflow_steps for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_workflow_executions before update on workflow_executions for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_step_executions before update on step_executions for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_prompt_templates before update on prompt_templates for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_uploaded_files before update on uploaded_files for each row execute procedure public.handle_updated_at();

-- Trigger function to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Apply trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Storage Bucket & Policies
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict do nothing;

create policy "Users can upload own documents" on storage.objects for insert with check (
  bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view own documents" on storage.objects for select using (
  bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own documents" on storage.objects for delete using (
  bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Seed Prompt Templates
insert into prompt_templates (name, type, description, prompt) values
('Research Assistant', 'research', 'Researches a given topic and provides a comprehensive summary.', 'You are a research assistant. Please research the following topic and provide a detailed, well-structured summary. Include key points, facts, and relevant background information.\n\nTopic: {{input}}'),
('Blog Writer', 'generate', 'Writes an engaging blog post on a topic.', 'You are an expert blog post writer. Write an engaging, SEO-friendly blog post about the following topic. Use a catchy title, clear headings, and a compelling introduction and conclusion.\n\nTopic: {{input}}'),
('LinkedIn Post Generator', 'generate', 'Creates a professional LinkedIn post.', 'You are a professional social media manager. Create an engaging LinkedIn post based on the following input. Make it professional but conversational. Include relevant hashtags.\n\nInput: {{input}}'),
('Document Summarizer', 'summarize', 'Summarizes the provided document text.', 'You are an expert at summarizing documents. Please read the following text and provide a concise summary capturing the main ideas, key arguments, and conclusions.\n\nText: {{input}}'),
('YouTube Script Writer', 'generate', 'Writes a script for a YouTube video.', 'You are a professional YouTube scriptwriter. Write an engaging script for a video about the following topic. Include an intro with a hook, the main body separated into clear sections, and an outro with a call to action.\n\nTopic: {{input}}');
