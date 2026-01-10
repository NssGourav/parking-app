import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oftpyilzwsamslmfjuia.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mdHB5aWx6d3NhbXNsbWZqdWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzgxMDQsImV4cCI6MjA4Mjk1NDEwNH0.1oUuDTgutRJ_KkPbEXS8P4LGB8cUpWpwOGaAN9ZbESQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

