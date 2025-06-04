import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,
  
  initialize: async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.getSession();
      if (sessionError) throw sessionError;

      const { data: { user }, error: userError } = await supabase.getUser();
      if (userError) throw userError;

      set({ 
        user,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error in auth initialization:', error);
      set({ 
        error: 'שגיאה בטעינת המשתמש',
        loading: false,
        user: null
      });
    }
  },

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.signIn(email, password);
      if (error) throw error;
      
      set({ user: data.user, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error in signIn:', error);
      set({ 
        error: 'פרטי התחברות שגויים',
        loading: false 
      });
      return { success: false, error };
    }
  },

  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.signUp(email, password);
      if (error) throw error;

      set({ user: data.user, loading: false });
      return { success: true };
    } catch (error) {
      console.error('Error in signUp:', error);
      set({ 
        error: 'שגיאה בהרשמה',
        loading: false 
      });
      return { success: false, error };
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.signOut();
      if (error) throw error;
      
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Error in signOut:', error);
      set({ error: 'שגיאה בהתנתקות' });
    }
  }
}));

export default useAuthStore