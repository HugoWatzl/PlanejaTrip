import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0YXZsZ3BjdGptaHpsaHdlemR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwOTA2MzgsImV4cCI6MjA3NDY2NjYzOH0.UIaxauYIBtdg5aClVo3a3VZ095X523TMaaQbDIENL3w


if (!supabaseUrl || !supabaseAnonKey) {  throw new Error('Missing Supabase credentials');} 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

