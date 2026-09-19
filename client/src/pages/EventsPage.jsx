import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import RatingStars from '../components/common/RatingStars';
import Skeleton from '../components/ui/Skeleton';
import { Search, MapPin, Calendar as CalendarIcon, Ticket, Music } from 'lucide-react';

const MOCK_EVENTS = [
  {
    _id: 'event-201',
    slug: 'sunburn-goa-2026',
    title: 'Sunburn Arena Goa Festival 2026',
    categoryType: 'events',
    rating: 4.9,
    numReviews: 890,
    bannerImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    description: 'Asia’s largest Electronic Dance Music festival featuring top global DJs and immersive visuals.',
    location: { city: 'Goa', venue: 'Vagator Beach Arena' },
    pricingTiers: [{ price: 1499, tierName: 'GA Pass' }, { price: 3499, tierName: 'VIP Pass' }],
    transitInfo: { date: '28 Dec 2026', time: '04:00 PM Onwards', eventType: 'Music Festival' },
  },
  {
    _id: 'event-202',
    slug: 'zakir-khan-live-comedy',
    title: 'Zakir Khan Live: Tathastu World Tour',
    categoryType: 'events',
    rating: 4.8,
    numReviews: 1450,
    bannerImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    description: 'Catch Sakht Launda Zakir Khan live with fresh observational comedy and hilarious storytelling.',
    location: { city: 'Mumbai', venue: 'Jio World Convention Centre' },
    pricingTiers: [{ price: 999, tierName: 'Silver' }, { price: 2499, tierName: 'Platinum' }],
    transitInfo: { date: '15 Oct 2026', time: '07:30 PM', eventType: 'Standup Comedy' },
  },
  {
    _id: 'event-203',
    slug: 'tech-innovators-summit',
    title: 'India Tech & AI Innovators Summit',
    categoryType: 'events',
    rating: 4.7,
    numReviews: 320,
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    description: 'Keynotes, startup demos, and AI workshops with top tech leaders and venture capitalists.',
    location: { city: 'Bengaluru', venue: 'BIEC Exhibition Center' },
    pricingTiers: [{ price: 1999, tierName: 'Delegate Pass' }],
    transitInfo: { date: '05 Nov 2026', time: '09:00 AM', eventType: 'Conference' },
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    fetchEvents();
  }, [activeCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/listings?categoryType=events');
      if (res.data.success && res.data.data.listings.length > 0) {
        setEvents(res.data.data.listings);
      } else {
        setEvents(MOCK_EVENTS);
      }
    } catch (err) {
      setEvents(MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="border-b border-[var(--border)] pb-6 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
          Discover Events
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          Live music concerts, comedy shows, tech conferences, and vibrant cultural festivals.
        </p>
      </div>

      {/* Categories Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {['ALL', 'MUSIC', 'COMEDY', 'FESTIVALS', 'CONFERENCES', 'LOCAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg'
                  : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <GlassInput
            icon={Search}
            placeholder="Search events, artist, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72" count={6} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <GlassCard className="text-center py-20 space-y-3 bg-[var(--card)]">
          <Music className="w-12 h-12 text-[var(--primary)] mx-auto opacity-80" />
          <p className="text-lg font-black text-[var(--foreground)]">No events found</p>
          <p className="text-xs text-[var(--muted-foreground)]">Try adjusting your search query or category filter.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((item) => {
            const image = item.bannerImage || item.images?.[0] || MOCK_EVENTS[0].bannerImage;
            const price = item.pricingTiers?.[0]?.price || 999;
            const eventDate = item.transitInfo?.date || 'Upcoming';
            const eventTime = item.transitInfo?.time || 'Evening';

            return (
              <GlassCard key={item._id} className="p-0 overflow-hidden flex flex-col justify-between group bg-[var(--card)]">
                <div className="relative h-52 overflow-hidden bg-[var(--muted)]">
                  <img
                    src={image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-[var(--card)]/90 backdrop-blur-md text-[var(--primary)] text-[10px] font-black rounded-full uppercase tracking-wider border border-[var(--border)]">
                    {item.transitInfo?.eventType || 'Live Event'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {item.location?.venue || item.location?.city || 'Auditorium'}
                      </span>
                      <RatingStars rating={item.rating || 4.9} numReviews={item.numReviews || 300} />
                    </div>

                    <h3 className="font-black text-[var(--foreground)] text-lg line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] pt-1 font-bold">
                      <span className="flex items-center gap-1 text-[var(--primary)]">
                        <CalendarIcon className="w-3.5 h-3.5" /> {eventDate}
                      </span>
                      <span>•</span>
                      <span>{eventTime}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Starts From</span>
                      <span className="text-xl font-black text-[var(--foreground)]">₹{price}</span>
                    </div>

                    <Link to={`/listings/${item.slug || item._id}`}>
                      <GlassButton size="sm" variant="gradient" icon={Ticket}>
                        Book Now
                      </GlassButton>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
