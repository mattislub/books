import { create } from 'zustand';
import axios from 'axios';

const useBooksStore = create((set) => ({
  books: [],
  loading: true,
  error: null,

  initialize: async () => {
    console.log('📦 initialize: מתחיל טעינה');
    try {
      set({ loading: true, error: null });
      const res = await axios.get('/api/books');
      console.log('✅ books loaded:', res.data);
      set({ books: res.data, loading: false });
    } catch (error) {
      console.error('❌ Error loading books:', error);
      set({ error: error.message, loading: false });
    }
  },

  searchBooks: async (query) => {
    console.log('🔍 searchBooks:', query);
    try {
      set({ loading: true, error: null });
      const res = await axios.get('/api/books', { params: { search: query } });
      console.log('🔍 search result:', res.data);
      set({ books: res.data, loading: false });
    } catch (error) {
      console.error('❌ Error searching books:', error);
      set({ error: error.message, loading: false });
    }
  },

  getNewArrivals: async () => {
    console.log('🆕 getNewArrivals');
    try {
      const res = await axios.get('/api/books', { params: { is_new_arrival: true } });
      console.log('🆕 new arrivals:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error fetching new arrivals:', error);
      throw error;
    }
  },

  getNewInMarket: async () => {
    console.log('🛒 getNewInMarket');
    try {
      const res = await axios.get('/api/books', { params: { is_new_in_market: true } });
      console.log('🛒 new in market:', res.data);
      return res.data;
    } catch (error) {
      console.error('❌ Error fetching new in market:', error);
      throw error;
    }
  },

  addBook: async (book) => {
    console.log('➕ addBook:', book);
    try {
      const res = await axios.post('/api/books', book);
      set((state) => ({ books: [res.data, ...state.books] }));
      console.log('✅ Book added:', res.data);
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ Error adding book:', error);
      return { success: false, error };
    }
  },

  updateBook: async (id, updatedBook) => {
    console.log(`✏️ updateBook ${id}:`, updatedBook);
    try {
      const res = await axios.put(`/api/books/${id}`, updatedBook);
      set((state) => ({
        books: state.books.map((book) => (book.id === id ? res.data : book))
      }));
      console.log('✅ Book updated:', res.data);
      return { success: true, data: res.data };
    } catch (error) {
      console.error('❌ Error updating book:', error);
      return { success: false, error };
    }
  },

  deleteBook: async (id) => {
    console.log(`🗑️ deleteBook ${id}`);
    try {
      await axios.delete(`/api/books/${id}`);
      set((state) => ({ books: state.books.filter((book) => book.id !== id) }));
      console.log('✅ Book deleted');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting book:', error);
      return { success: false, error };
    }
  }
}));

export default useBooksStore;
