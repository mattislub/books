import { db } from './localStorageDB';

// Replace Supabase client with local storage implementation
export const supabase = db;

export const handleSupabaseError = (error) => {
  console.error('Database error:', error);
  return new Error(error.message || 'שגיאה בבסיס הנתונים');
};

export default supabase;