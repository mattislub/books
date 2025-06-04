import { create } from 'zustand';
import axios from 'axios';

const USER_ID = localStorage.getItem('user_id') || crypto.randomUUID();
localStorage.setItem('user_id', USER_ID);
console.log('🛍️ Cart store initialized for user:', USER_ID);

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  initialize: async () => {
    try {
      console.log('📦 Loading cart from API...');
      const res = await axios.get(`/api/cart?userId=${USER_ID}`);
      if (res.data && res.data.items) {
        console.log('✅ Cart loaded:', res.data.items);
        set({ items: res.data.items });
      } else {
        console.warn('⚠️ API returned no cart items');
      }
    } catch (err) {
      console.error('❌ Error loading cart from server:', err);
    }
  },

  saveCart: async (items) => {
    try {
      console.log('💾 Saving cart to API:', items);
      await axios.post('/api/cart', {
        userId: USER_ID,
        items,
      });
      console.log('✅ Cart saved');
    } catch (err) {
      console.error('❌ Error saving cart to server:', err);
    }
  },

  addItem: (book) => {
    console.log('➕ Adding book to cart:', book);
    set((state) => {
      const existingItem = state.items.find(item => item.id === book.id);
      let newItems;

      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === book.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...book, quantity: 1 }];
      }

      get().saveCart(newItems);
      return { items: newItems, isOpen: true };
    });
  },

  removeItem: (bookId) => {
    console.log('➖ Removing book from cart:', bookId);
    set((state) => {
      const newItems = state.items.filter(item => item.id !== bookId);
      get().saveCart(newItems);
      return { items: newItems };
    });
  },

  clearCart: () => {
    console.log('🗑️ Clearing cart');
    set({ items: [] });
    get().saveCart([]);
  }
}));

export default useCartStore;
