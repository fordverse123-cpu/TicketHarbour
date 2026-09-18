import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, MapPin, Tag } from 'lucide-react';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [categoryType, setCategoryType] = useState('movie');
  const [city, setCity] = useState('Mumbai');
  const [price, setPrice] = useState(300);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings?limit=50');
      if (res.data.success) setListings(res.data.data.listings);

      const catRes = await API.get('/categories');
      if (catRes.data.success) setCategories(catRes.data.data.categories);
    } catch (err) {
      toast.error('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await API.delete(`/listings/${id}`);
      if (res.data.success) {
        toast.success('Listing deleted');
        setListings(listings.filter((l) => l._id !== id));
      }
    } catch (err) {
      toast.error('Could not delete listing');
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const catObj = categories.find((c) => c.type === categoryType) || categories[0];

    try {
      const res = await API.post('/listings', {
        title,
        category: catObj?._id,
        categoryType,
        description,
        bannerImage: image || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
        location: { city, country: 'India' },
        pricingTiers: [{ tierName: 'Standard', price: Number(price) }],
      });

      if (res.data.success) {
        toast.success('Listing created successfully!');
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create listing.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Manage Listings</h1>
          <p className="text-sm text-slate-500">Create and modify tickets across categories</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Listing
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-750 uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location</th>
                <th className="p-3">Starting Price</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {listings.map((l) => (
                <tr key={l._id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{l.title}</td>
                  <td className="p-3 font-bold uppercase text-teal-600">{l.categoryType}</td>
                  <td className="p-3">{l.location?.city}</td>
                  <td className="p-3 font-bold">₹{l.pricingTiers?.[0]?.price || 100}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(l._id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Listing Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Ticket Listing</h3>

            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Listing Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Avatar IMAX 3D"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Category</label>
                  <select
                    value={categoryType}
                    onChange={(e) => setCategoryType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  >
                    <option value="movie">Movie</option>
                    <option value="event">Event</option>
                    <option value="sports">Sports</option>
                    <option value="bus">Bus</option>
                    <option value="train">Train</option>
                    <option value="flight">Flight</option>
                    <option value="attraction">Attraction</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Standard Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-slate-300">Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl shadow hover:bg-teal-700"
              >
                {submitting ? 'Creating...' : 'Create Ticket Listing'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
