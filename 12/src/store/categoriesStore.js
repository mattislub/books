import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useCategoriesStore = create((set) => ({
  categories: [],
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.select('categories');
      if (error) throw error;
      set({ categories: data || [], loading: false });
    } catch (error) {
      console.error('Error loading categories:', error);
      set({ error: 'שגיאה בטעינת הקטגוריות', loading: false });
    }
  },

  addCategory: async (category) => {
    try {
      const { data, error } = await supabase.insert('categories', category);
      if (error) throw error;

      set(state => ({
        categories: [...state.categories, data]
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error adding category:', error);
      return { success: false, error };
    }
  },

  updateCategory: async (id, updatedCategory) => {
    try {
      const { data, error } = await supabase.update('categories', { eq: { id } }, updatedCategory);
      if (error) throw error;

      set(state => ({
        categories: state.categories.map(category => 
          category.id === id ? data : category
        )
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating category:', error);
      return { success: false, error };
    }
  },

  deleteCategory: async (id) => {
    try {
      const { error } = await supabase.delete('categories', { eq: { id } });
      if (error) throw error;

      set(state => ({
        categories: state.categories.filter(category => category.id !== id)
      }));
      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { success: false, error };
    }
  }
}));

export default useCategoriesStore