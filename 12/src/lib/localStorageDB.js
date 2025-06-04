// Local Storage Database Implementation
const DB_PREFIX = 'bookstore_';

class LocalStorageDB {
  constructor() {
    // Initialize tables if they don't exist
    const tables = ['books', 'categories', 'orders', 'order_items', 'wishlists', 'profiles'];
    tables.forEach(table => {
      if (!localStorage.getItem(`${DB_PREFIX}${table}`)) {
        localStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify([]));
      }
    });
  }

  // Generic CRUD operations
  async select(table, query = {}) {
    const data = JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`)) || [];
    
    if (Object.keys(query).length === 0) {
      return { data, error: null };
    }

    const filtered = data.filter(item => {
      return Object.entries(query).every(([key, value]) => {
        if (key === 'eq') {
          const [field, val] = Object.entries(value)[0];
          return item[field] === val;
        }
        if (key === 'ilike') {
          const [field, val] = Object.entries(value)[0];
          return item[field].toLowerCase().includes(val.toLowerCase().replace(/%/g, ''));
        }
        return item[key] === value;
      });
    });

    return { data: filtered, error: null };
  }

  async insert(table, data) {
    const currentData = JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`)) || [];
    const newItem = Array.isArray(data) ? data : [data];
    
    newItem.forEach(item => {
      item.id = crypto.randomUUID();
      if (!item.created_at) {
        item.created_at = new Date().toISOString();
      }
      if (!item.updated_at) {
        item.updated_at = new Date().toISOString();
      }
    });

    const updatedData = [...currentData, ...newItem];
    localStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(updatedData));

    return { data: newItem[0], error: null };
  }

  async update(table, query, updates) {
    const currentData = JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`)) || [];
    let updated = null;

    const updatedData = currentData.map(item => {
      if (this._matchesQuery(item, query)) {
        updated = { ...item, ...updates, updated_at: new Date().toISOString() };
        return updated;
      }
      return item;
    });

    localStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(updatedData));
    return { data: updated, error: null };
  }

  async delete(table, query) {
    const currentData = JSON.parse(localStorage.getItem(`${DB_PREFIX}${table}`)) || [];
    const updatedData = currentData.filter(item => !this._matchesQuery(item, query));
    
    localStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(updatedData));
    return { error: null };
  }

  // Helper methods
  _matchesQuery(item, query) {
    return Object.entries(query).every(([key, value]) => {
      if (key === 'eq') {
        const [field, val] = Object.entries(value)[0];
        return item[field] === val;
      }
      return item[key] === value;
    });
  }

  // Auth methods
  async signUp(email, password) {
    const users = JSON.parse(localStorage.getItem(`${DB_PREFIX}users`)) || [];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      return { error: { message: 'User already exists' } };
    }

    const user = {
      id: crypto.randomUUID(),
      email,
      password, // In a real app, this should be hashed
      created_at: new Date().toISOString()
    };

    users.push(user);
    localStorage.setItem(`${DB_PREFIX}users`, JSON.stringify(users));
    localStorage.setItem(`${DB_PREFIX}currentUser`, JSON.stringify(user));

    return { data: { user }, error: null };
  }

  async signIn(email, password) {
    const users = JSON.parse(localStorage.getItem(`${DB_PREFIX}users`)) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return { error: { message: 'Invalid login credentials' } };
    }

    localStorage.setItem(`${DB_PREFIX}currentUser`, JSON.stringify(user));
    return { data: { user }, error: null };
  }

  async signOut() {
    localStorage.removeItem(`${DB_PREFIX}currentUser`);
    return { error: null };
  }

  async getSession() {
    const user = JSON.parse(localStorage.getItem(`${DB_PREFIX}currentUser`));
    return { data: { session: user ? { user } : null }, error: null };
  }

  async getUser() {
    const user = JSON.parse(localStorage.getItem(`${DB_PREFIX}currentUser`));
    return { data: { user }, error: null };
  }
}

export const db = new LocalStorageDB();