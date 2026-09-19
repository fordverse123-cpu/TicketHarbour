import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Tag,
  Film,
  Calendar,
  Ticket,
  Bus,
  Train,
  Plane,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  X,
  Eye,
  Filter,
  Search,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Building,
  Layers,
  Star,
} from 'lucide-react';

const CATEGORY_CONFIGS = [
  {
    type: 'movie',
    label: 'Movie',
    icon: Film,
    color: 'from-purple-500 to-indigo-600',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    defaultTiers: [
      { tierName: 'Standard', price: 250, totalCapacity: 100, classType: 'Standard' },
      { tierName: 'VIP / Recliner', price: 500, totalCapacity: 20, classType: 'VIP' },
    ],
    presetImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=80',
  },
  {
    type: 'event',
    label: 'Event / Concert',
    icon: Ticket,
    color: 'from-pink-500 to-rose-600',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
    defaultTiers: [
      { tierName: 'General Admission', price: 999, totalCapacity: 500, classType: 'GA' },
      { tierName: 'VIP Pass', price: 2999, totalCapacity: 50, classType: 'VIP' },
    ],
    presetImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
  },
  {
    type: 'sports',
    label: 'Sports Match',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    defaultTiers: [
      { tierName: 'Stand East/West', price: 750, totalCapacity: 200, classType: 'Standard' },
      { tierName: 'Corporate Box', price: 4500, totalCapacity: 30, classType: 'Box' },
    ],
    presetImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80',
  },
  {
    type: 'bus',
    label: 'Bus Journey',
    icon: Bus,
    color: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    defaultTiers: [
      { tierName: 'AC Seater', price: 550, totalCapacity: 20, classType: 'Seater' },
      { tierName: 'AC Sleeper 2+1', price: 950, totalCapacity: 20, classType: 'Sleeper' },
    ],
    presetImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1000&q=80',
  },
  {
    type: 'train',
    label: 'Train Express',
    icon: Train,
    color: 'from-blue-500 to-cyan-600',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    defaultTiers: [
      { tierName: 'Sleeper (SL)', price: 450, totalCapacity: 100, classType: 'SL' },
      { tierName: 'AC 3 Tier (3A)', price: 1250, totalCapacity: 60, classType: '3A' },
      { tierName: 'AC 2 Tier (2A)', price: 1850, totalCapacity: 40, classType: '2A' },
      { tierName: 'AC 1st Class (1A)', price: 2800, totalCapacity: 20, classType: '1A' },
    ],
    presetImage: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1000&q=80',
  },
  {
    type: 'flight',
    label: 'Flight Air Travel',
    icon: Plane,
    color: 'from-indigo-500 to-blue-700',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    defaultTiers: [
      { tierName: 'Economy Class', price: 4200, totalCapacity: 120, classType: 'Economy' },
      { tierName: 'Business Class', price: 12500, totalCapacity: 18, classType: 'Business' },
    ],
    presetImage: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80',
  },
  {
    type: 'attraction',
    label: 'Attraction / Park',
    icon: Layers,
    color: 'from-teal-500 to-emerald-600',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
    defaultTiers: [
      { tierName: 'Adult Entry Pass', price: 999, totalCapacity: 300, classType: 'Adult' },
      { tierName: 'Child / Senior Pass', price: 599, totalCapacity: 200, classType: 'Child' },
      { tierName: 'FastPass All Access', price: 1999, totalCapacity: 50, classType: 'VIP' },
    ],
    presetImage: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1000&q=80',
  },
];

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [categoryType, setCategoryType] = useState('movie');
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Venue selection (Movie, Event, Sports)
  const [venueId, setVenueId] = useState('');

  // Transit Information (Bus, Train, Flight)
  const [transitSource, setTransitSource] = useState('');
  const [transitDestination, setTransitDestination] = useState('');
  const [transitDepartureTime, setTransitDepartureTime] = useState('');
  const [transitArrivalTime, setTransitArrivalTime] = useState('');
  const [transitDuration, setTransitDuration] = useState('');
  const [transitNumber, setTransitNumber] = useState('');
  const [transitOperator, setTransitOperator] = useState('');
  const [transitBusType, setTransitBusType] = useState('');

  // Attraction Information
  const [attractionOpeningHours, setAttractionOpeningHours] = useState('09:00 AM - 07:00 PM');
  const [attractionValidityDays, setAttractionValidityDays] = useState(1);
  const [attractionIncludedServices, setAttractionIncludedServices] = useState('Entry Pass, FastTrack Access');

  // Dynamic Pricing Tiers
  const [pricingTiers, setPricingTiers] = useState([
    { tierName: 'Standard', price: 300, totalCapacity: 50, classType: 'Standard' },
  ]);

  // Initial Schedule Creation Option
  const [createSchedule, setCreateSchedule] = useState(true);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduleStartTime, setScheduleStartTime] = useState('10:00 AM');
  const [scheduleEndTime, setScheduleEndTime] = useState('01:00 PM');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [listRes, catRes, venRes] = await Promise.all([
        API.get('/listings?limit=100'),
        API.get('/categories'),
        API.get('/venues'),
      ]);

      if (listRes.data.success) setListings(listRes.data.data.listings);
      if (catRes.data.success) setCategories(catRes.data.data.categories);
      if (venRes.data.success) setVenues(venRes.data.data.venues);
    } catch (err) {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (type = 'movie') => {
    setIsEditing(false);
    setEditId(null);
    changeCategoryType(type);
    setTitle('');
    setCity('Mumbai');
    setState('');
    setDescription('');
    setIsFeatured(false);
    setIsActive(true);
    setVenueId('');
    setTransitSource('Mumbai');
    setTransitDestination('Delhi');
    setTransitDepartureTime('08:00 AM');
    setTransitArrivalTime('02:00 PM');
    setTransitDuration('6h 00m');
    setTransitNumber('');
    setTransitOperator('');
    setTransitBusType('');
    setAttractionOpeningHours('09:00 AM - 07:00 PM');
    setAttractionValidityDays(1);
    setAttractionIncludedServices('Full Entry Access, Fast Pass');
    setModalOpen(true);
  };

  const changeCategoryType = (type) => {
    setCategoryType(type);
    const config = CATEGORY_CONFIGS.find((c) => c.type === type);
    if (config) {
      setPricingTiers(JSON.parse(JSON.stringify(config.defaultTiers)));
      if (!bannerImage || bannerImage.includes('unsplash')) {
        setBannerImage(config.presetImage);
      }
    }
  };

  const openEditModal = (listing) => {
    setIsEditing(true);
    setEditId(listing._id);
    setCategoryType(listing.categoryType);
    setTitle(listing.title || '');
    setCity(listing.location?.city || 'Mumbai');
    setState(listing.location?.state || '');
    setCountry(listing.location?.country || 'India');
    setDescription(listing.description || '');
    setBannerImage(listing.bannerImage || '');
    setIsFeatured(listing.isFeatured || false);
    setIsActive(listing.isActive !== false);

    setVenueId(listing.venue?._id || listing.venue || '');

    if (listing.transitInfo) {
      setTransitSource(listing.transitInfo.source || '');
      setTransitDestination(listing.transitInfo.destination || '');
      setTransitDepartureTime(listing.transitInfo.departureTime || '');
      setTransitArrivalTime(listing.transitInfo.arrivalTime || '');
      setTransitDuration(listing.transitInfo.duration || '');
      setTransitNumber(listing.transitInfo.number || '');
      setTransitOperator(listing.transitInfo.operator || '');
      setTransitBusType(listing.transitInfo.busType || '');
    }

    if (listing.attractionInfo) {
      setAttractionOpeningHours(listing.attractionInfo.openingHours || '');
      setAttractionValidityDays(listing.attractionInfo.validityDays || 1);
      setAttractionIncludedServices(listing.attractionInfo.includedServices?.join(', ') || '');
    }

    if (listing.pricingTiers && listing.pricingTiers.length > 0) {
      setPricingTiers(listing.pricingTiers.map((t) => ({ ...t })));
    } else {
      setPricingTiers([{ tierName: 'Standard', price: 300, totalCapacity: 50, classType: 'Standard' }]);
    }

    setCreateSchedule(false);
    setModalOpen(true);
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...pricingTiers];
    updated[index][field] = field === 'price' || field === 'totalCapacity' ? Number(value) : value;
    setPricingTiers(updated);
  };

  const addPricingTierRow = () => {
    setPricingTiers([
      ...pricingTiers,
      { tierName: 'New Tier', price: 500, totalCapacity: 50, classType: 'Standard' },
    ]);
  };

  const removePricingTierRow = (index) => {
    if (pricingTiers.length <= 1) {
      toast.error('Ticket must have at least one pricing tier');
      return;
    }
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await API.put(`/listings/${id}`, { isActive: !currentStatus });
      if (res.data.success) {
        toast.success(`Listing ${!currentStatus ? 'activated' : 'deactivated'}`);
        setListings(listings.map((l) => (l._id === id ? { ...l, isActive: !currentStatus } : l)));
      }
    } catch (err) {
      toast.error('Could not update status');
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const res = await API.put(`/listings/${id}`, { isFeatured: !currentFeatured });
      if (res.data.success) {
        toast.success(`Listing ${!currentFeatured ? 'marked as featured' : 'unfeatured'}`);
        setListings(listings.map((l) => (l._id === id ? { ...l, isFeatured: !currentFeatured } : l)));
      }
    } catch (err) {
      toast.error('Could not update featured flag');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this ticket listing?')) return;
    try {
      const res = await API.delete(`/listings/${id}`);
      if (res.data.success) {
        toast.success('Ticket listing deleted');
        setListings(listings.filter((l) => l._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete listing.');
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const catObj = categories.find((c) => c.type === categoryType) || categories[0];

    const payload = {
      title,
      category: catObj?._id,
      categoryType,
      description,
      bannerImage: bannerImage || CATEGORY_CONFIGS.find((c) => c.type === categoryType)?.presetImage,
      location: { city, state, country: country || 'India' },
      isFeatured,
      isActive,
      pricingTiers,
    };

    if (venueId) {
      payload.venue = venueId;
    }

    if (['bus', 'train', 'flight'].includes(categoryType)) {
      payload.transitInfo = {
        source: transitSource,
        destination: transitDestination,
        departureTime: transitDepartureTime,
        arrivalTime: transitArrivalTime,
        duration: transitDuration,
        number: transitNumber,
        operator: transitOperator,
        busType: transitBusType,
      };
    }

    if (categoryType === 'attraction') {
      payload.attractionInfo = {
        openingHours: attractionOpeningHours,
        validityDays: Number(attractionValidityDays) || 1,
        includedServices: attractionIncludedServices
          ? attractionIncludedServices.split(',').map((s) => s.trim())
          : ['Entry Pass'],
      };
    }

    if (!isEditing && createSchedule && scheduleDate && scheduleStartTime) {
      payload.scheduleDate = scheduleDate;
      payload.startTime = scheduleStartTime;
      payload.endTime = scheduleEndTime;
    }

    try {
      if (isEditing) {
        const res = await API.put(`/listings/${editId}`, payload);
        if (res.data.success) {
          toast.success('Ticket listing updated successfully!');
          setModalOpen(false);
          fetchInitialData();
        }
      } else {
        const res = await API.post('/listings', payload);
        if (res.data.success) {
          toast.success('Ticket listing created successfully!');
          setModalOpen(false);
          fetchInitialData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving ticket listing.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter listings
  const filteredListings = listings.filter((l) => {
    const matchCategory = selectedCategoryFilter === 'all' || l.categoryType === selectedCategoryFilter;
    const matchSearch =
      !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.transitInfo?.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.transitInfo?.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.transitInfo?.operator?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-teal-600" /> Ticket Listing Manager
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, view, edit, and configure pricing for all 7 ticket categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateModal('movie')}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-teal-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Ticket
          </button>
        </div>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
          Quick Create by Category
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {CATEGORY_CONFIGS.map((cfg) => {
            const IconComponent = cfg.icon;
            return (
              <button
                key={cfg.type}
                onClick={() => openCreateModal(cfg.type)}
                className="p-3 bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl border border-slate-200/80 dark:border-slate-600/60 flex flex-col items-center gap-1.5 transition-all group text-center"
              >
                <div className={`p-2 rounded-xl bg-gradient-to-br ${cfg.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  + {cfg.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategoryFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            All Categories ({listings.length})
          </button>
          {CATEGORY_CONFIGS.map((cfg) => {
            const count = listings.filter((l) => l.categoryType === cfg.type).length;
            const IconComp = cfg.icon;
            return (
              <button
                key={cfg.type}
                onClick={() => setSelectedCategoryFilter(cfg.type)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  selectedCategoryFilter === cfg.type
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                {cfg.label.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets by title, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-700/60 uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="p-4">Ticket Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location / Transit</th>
                <th className="p-4">Pricing Tiers</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    No listings found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredListings.map((l) => {
                  const cfg = CATEGORY_CONFIGS.find((c) => c.type === l.categoryType) || CATEGORY_CONFIGS[0];
                  const IconComp = cfg.icon;
                  const lowestPrice = l.pricingTiers?.reduce(
                    (min, p) => (p.price < min ? p.price : min),
                    l.pricingTiers?.[0]?.price || 0
                  );

                  return (
                    <tr key={l._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                      {/* Ticket Title & Banner */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={l.bannerImage || cfg.presetImage}
                            alt={l.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                              {l.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {l.isFeatured && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px] rounded-md flex items-center gap-1">
                                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Featured
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 font-mono">
                                ID: {l._id.slice(-6)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-xl font-bold uppercase text-[10px] flex items-center gap-1.5 w-fit ${cfg.badge}`}>
                          <IconComp className="w-3 h-3" />
                          {l.categoryType}
                        </span>
                      </td>

                      {/* Location / Transit Route */}
                      <td className="p-4">
                        {l.transitInfo?.source ? (
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                              {l.transitInfo.source} → {l.transitInfo.destination}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {l.transitInfo.operator || l.transitInfo.number || 'Transit Ticket'}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-teal-500" /> {l.location?.city || 'India'}
                            </p>
                            {l.venue && (
                              <p className="text-[11px] text-slate-400">
                                {typeof l.venue === 'object' ? l.venue.name : 'Venue assigned'}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Pricing Tiers */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-black text-slate-900 dark:text-white text-sm">
                            From ₹{lowestPrice || 0}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {l.pricingTiers?.length || 0} tier(s) ({l.pricingTiers?.map((t) => t.tierName).join(', ') || 'Standard'})
                          </p>
                        </div>
                      </td>

                      {/* Status Switches */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(l._id, l.isActive)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase border transition-colors ${
                              l.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {l.isActive ? 'Active' : 'Inactive'}
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(l._id, l.isFeatured)}
                            title="Toggle Featured status"
                            className={`p-1.5 rounded-lg border ${
                              l.isFeatured
                                ? 'bg-amber-50 text-amber-600 border-amber-300'
                                : 'text-slate-400 border-slate-200 hover:text-amber-500'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${l.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(l)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors"
                          title="Edit Listing"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(l._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-6 h-6 text-teal-600" />
                {isEditing ? 'Edit Ticket Listing' : 'Create New Ticket Listing'}
              </h3>
              <p className="text-xs text-slate-500">
                Configure details, category metadata, and pricing tiers
              </p>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-6 text-xs">
              {/* Category Picker Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Select Ticket Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORY_CONFIGS.map((cfg) => {
                    const IconComp = cfg.icon;
                    const isSelected = categoryType === cfg.type;
                    return (
                      <button
                        type="button"
                        key={cfg.type}
                        onClick={() => changeCategoryType(cfg.type)}
                        className={`p-3 rounded-2xl border font-bold flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-teal-600' : ''}`} />
                        <span>{cfg.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Location Section */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-teal-600">
                  1. Basic Ticket Details
                </h4>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">
                    Ticket Title / Event Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      categoryType === 'movie'
                        ? 'e.g. Avatar: The Way of Water IMAX 3D'
                        : categoryType === 'bus'
                        ? 'e.g. IntrCity SmartBus AC Sleeper'
                        : categoryType === 'flight'
                        ? 'e.g. IndiGo Flight 6E-204 (Mumbai to Delhi)'
                        : categoryType === 'train'
                        ? 'e.g. Vande Bharat Express (Mumbai to Goa)'
                        : categoryType === 'attraction'
                        ? 'e.g. Wonderla Amusement Park Day Pass'
                        : 'e.g. Coldplay Music Concert'
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-300">
                      Primary City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai, Delhi, Bengaluru"
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-300">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">
                    Banner / Poster Image URL
                  </label>
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-300">
                    Description & Overview *
                  </label>
                  <textarea
                    rows="2"
                    required
                    placeholder="Provide highlights, guidelines, policies..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                  />
                </div>
              </div>

              {/* Category-Specific Data Section */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-teal-600">
                  2. {categoryType.toUpperCase()} Specific Metadata
                </h4>

                {/* Movie, Event, Sports Venue selector */}
                {['movie', 'event', 'sports'].includes(categoryType) && (
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-300">
                      Assigned Venue / Cinema Hall / Stadium
                    </label>
                    <select
                      value={venueId}
                      onChange={(e) => setVenueId(e.target.value)}
                      className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                    >
                      <option value="">-- Select Venue (Optional) --</option>
                      {venues.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.name} ({v.city})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Transit info for Bus, Train, Flight */}
                {['bus', 'train', 'flight'].includes(categoryType) && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Source City / Station
                        </label>
                        <input
                          type="text"
                          required
                          value={transitSource}
                          onChange={(e) => setTransitSource(e.target.value)}
                          placeholder="e.g. Mumbai"
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Destination City / Station
                        </label>
                        <input
                          type="text"
                          required
                          value={transitDestination}
                          onChange={(e) => setTransitDestination(e.target.value)}
                          placeholder="e.g. Delhi"
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Departure Time
                        </label>
                        <input
                          type="text"
                          value={transitDepartureTime}
                          onChange={(e) => setTransitDepartureTime(e.target.value)}
                          placeholder="08:00 AM"
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Arrival Time
                        </label>
                        <input
                          type="text"
                          value={transitArrivalTime}
                          onChange={(e) => setTransitArrivalTime(e.target.value)}
                          placeholder="02:00 PM"
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={transitDuration}
                          onChange={(e) => setTransitDuration(e.target.value)}
                          placeholder="6h 00m"
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Operator Name
                        </label>
                        <input
                          type="text"
                          value={transitOperator}
                          onChange={(e) => setTransitOperator(e.target.value)}
                          placeholder={categoryType === 'flight' ? 'IndiGo' : categoryType === 'train' ? 'Indian Railways' : 'IntrCity SmartBus'}
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Flight / Train / Bus #
                        </label>
                        <input
                          type="text"
                          value={transitNumber}
                          onChange={(e) => setTransitNumber(e.target.value)}
                          placeholder="e.g. 6E-204"
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Vehicle / Coach Spec
                        </label>
                        <input
                          type="text"
                          value={transitBusType}
                          onChange={(e) => setTransitBusType(e.target.value)}
                          placeholder="e.g. AC Sleeper 2+1"
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Attraction info */}
                {categoryType === 'attraction' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Opening Hours
                        </label>
                        <input
                          type="text"
                          value={attractionOpeningHours}
                          onChange={(e) => setAttractionOpeningHours(e.target.value)}
                          placeholder="09:00 AM - 07:00 PM"
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Validity Days
                        </label>
                        <input
                          type="number"
                          value={attractionValidityDays}
                          onChange={(e) => setAttractionValidityDays(e.target.value)}
                          min="1"
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 dark:text-slate-300">
                        Included Services (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={attractionIncludedServices}
                        onChange={(e) => setAttractionIncludedServices(e.target.value)}
                        placeholder="FastPass, Meal Voucher, Guided Audio Tour"
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Pricing Tiers Manager */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-teal-600">
                    3. Dynamic Pricing Tiers
                  </h4>
                  <button
                    type="button"
                    onClick={addPricingTierRow}
                    className="px-3 py-1 bg-teal-600 text-white font-bold text-[11px] rounded-xl hover:bg-teal-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tier
                  </button>
                </div>

                <div className="space-y-2">
                  {pricingTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-400 block font-semibold">
                          Tier Name
                        </label>
                        <input
                          type="text"
                          required
                          value={tier.tierName}
                          onChange={(e) => handleTierChange(idx, 'tierName', e.target.value)}
                          placeholder="e.g. VIP / Sleeper / 3A"
                          className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg dark:text-white"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-400 block font-semibold">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={tier.price}
                          onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg dark:text-white font-bold"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-400 block font-semibold">
                          Seat Capacity
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={tier.totalCapacity}
                          onChange={(e) => handleTierChange(idx, 'totalCapacity', e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg dark:text-white"
                        />
                      </div>

                      <div className="col-span-2 text-right pt-3">
                        <button
                          type="button"
                          onClick={() => removePricingTierRow(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          title="Remove tier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Initial Schedule Creation Checkbox (For New Ticket) */}
              {!isEditing && (
                <div className="space-y-3 p-4 bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="createSchedule"
                      checked={createSchedule}
                      onChange={(e) => setCreateSchedule(e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="createSchedule"
                      className="font-bold text-slate-900 dark:text-white cursor-pointer"
                    >
                      Generate Initial Booking Schedule Immediately
                    </label>
                  </div>

                  {createSchedule && (
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Schedule Date
                        </label>
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          Start Time
                        </label>
                        <input
                          type="text"
                          value={scheduleStartTime}
                          onChange={(e) => setScheduleStartTime(e.target.value)}
                          placeholder="10:00 AM"
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">
                          End Time
                        </label>
                        <input
                          type="text"
                          value={scheduleEndTime}
                          onChange={(e) => setScheduleEndTime(e.target.value)}
                          placeholder="01:00 PM"
                          className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Toggles */}
              <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-700/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Mark as Featured Ticket</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                  <span>Publish & Make Active</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-teal-500/25 transition-all flex items-center justify-center gap-2"
              >
                {submitting
                  ? 'Saving Ticket Listing...'
                  : isEditing
                  ? 'Update Ticket Listing'
                  : 'Create Ticket Listing'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
