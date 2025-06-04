import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronRight } from 'lucide-react';

const initialCategories = [
  {
    id: '1',
    name: 'הלכה',
    children: [
      { id: '1-1', name: 'שולחן ערוך' },
      { id: '1-2', name: 'משנה ברורה' }
    ]
  },
  {
    id: '2',
    name: 'תנ"ך',
    children: [
      { id: '2-1', name: 'חומש' },
      { id: '2-2', name: 'נביאים' },
      { id: '2-3', name: 'כתובים' }
    ]
  },
  {
    id: '3',
    name: 'מחשבה',
    children: []
  },
  {
    id: '4',
    name: 'קבלה',
    children: []
  }
];

export default function Categories() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    parent_id: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedCategory) {
      // עדכון קטגוריה קיימת
      setCategories(prevCategories => {
        return prevCategories.map(cat => {
          if (cat.id === selectedCategory.id) {
            return { ...cat, name: formData.name };
          }
          if (cat.children) {
            return {
              ...cat,
              children: cat.children.map(child => 
                child.id === selectedCategory.id 
                  ? { ...child, name: formData.name }
                  : child
              )
            };
          }
          return cat;
        });
      });
    } else {
      // הוספת קטגוריה חדשה
      const newCategory = {
        id: Date.now().toString(),
        name: formData.name,
        children: []
      };

      if (formData.parent_id) {
        setCategories(prevCategories => {
          return prevCategories.map(cat => {
            if (cat.id === formData.parent_id) {
              return {
                ...cat,
                children: [...(cat.children || []), { ...newCategory, id: `${cat.id}-${cat.children.length + 1}` }]
              };
            }
            return cat;
          });
        });
      } else {
        setCategories(prev => [...prev, newCategory]);
      }
    }

    setIsModalOpen(false);
    setSelectedCategory(null);
    setFormData({ name: '', parent_id: '' });
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      parent_id: category.id.includes('-') ? category.id.split('-')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (categoryId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) return;

    setCategories(prevCategories => {
      return prevCategories.filter(cat => {
        if (cat.id === categoryId) return false;
        if (cat.children) {
          cat.children = cat.children.filter(child => child.id !== categoryId);
        }
        return true;
      });
    });
  };

  const renderCategory = (category, level = 0) => (
    <div 
      key={category.id}
      className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
      style={{ marginRight: `${level * 20}px` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {level > 0 && <ChevronRight size={16} className="text-gray-400" />}
          <span className="font-medium">{category.name}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(category)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(category.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {category.children?.length > 0 && (
        <div className="mt-2 space-y-2">
          {category.children.map(child => renderCategory(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#112a55]">ניהול קטגוריות</h1>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setFormData({ name: '', parent_id: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#a48327] text-white px-4 py-2 rounded-lg hover:bg-[#8b6f1f] transition-colors"
        >
          <Plus size={20} />
          הוסף קטגוריה
        </button>
      </div>

      <div className="space-y-4">
        {categories.map(category => renderCategory(category))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#112a55] mb-6">
              {selectedCategory ? 'עריכת קטגוריה' : 'הוספת קטגוריה חדשה'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">שם הקטגוריה</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border rounded-lg p-2"
                />
              </div>

              {!selectedCategory && (
                <div>
                  <label className="block text-gray-700 mb-1">קטגוריית אב</label>
                  <select
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="">ללא קטגוריית אב</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedCategory(null);
                    setFormData({ name: '', parent_id: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#112a55] text-white rounded-lg hover:bg-[#1a3c70]"
                >
                  {selectedCategory ? 'עדכן' : 'הוסף'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}