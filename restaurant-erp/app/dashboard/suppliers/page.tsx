'use client';

import { useEffect, useState } from 'react';
import { Supplier } from '@/lib/types';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const res = await fetch('/api/suppliers');
    const data = await res.json();
    setSuppliers(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' });
    fetchSuppliers();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      id: editingSupplier?.id,
      name: formData.get('name'),
      contactPerson: formData.get('contactPerson'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      category: formData.get('category'),
      rating: Number(formData.get('rating')),
      paymentTerms: formData.get('paymentTerms'),
    };

    const method = editingSupplier ? 'PUT' : 'POST';
    await fetch('/api/suppliers', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setShowModal(false);
    setEditingSupplier(null);
    fetchSuppliers();
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Supplier Management</h1>
          <p className="text-slate-600 mt-1">Manage your restaurant suppliers and vendors</p>
        </div>
        <button
          onClick={() => { setEditingSupplier(null); setShowModal(true); }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          + Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{supplier.name}</h3>
                <p className="text-sm text-slate-600">{supplier.category}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-semibold text-slate-900">{supplier.rating}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-slate-600 text-sm">👤</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{supplier.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-600 text-sm">📧</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{supplier.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-600 text-sm">📞</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{supplier.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-600 text-sm">📍</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{supplier.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-600 text-sm">💳</span>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{supplier.paymentTerms}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => { setEditingSupplier(supplier); setShowModal(true); }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(supplier.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingSupplier?.name}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Person</label>
                  <input
                    name="contactPerson"
                    type="text"
                    defaultValue={editingSupplier?.contactPerson}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingSupplier?.email}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={editingSupplier?.phone}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                  <input
                    name="address"
                    type="text"
                    defaultValue={editingSupplier?.address}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <input
                    name="category"
                    type="text"
                    defaultValue={editingSupplier?.category}
                    placeholder="Vegetables, Meat, Dry Goods"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating (1-5)</label>
                  <input
                    name="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    defaultValue={editingSupplier?.rating}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Terms</label>
                  <input
                    name="paymentTerms"
                    type="text"
                    defaultValue={editingSupplier?.paymentTerms}
                    placeholder="Net 30, Net 15, COD"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingSupplier(null); }}
                  className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
