const STORAGE_KEY = 'ticketharbour_recently_viewed';
const MAX_ITEMS = 6;

export const getRecentlyViewed = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading recently viewed listings:', err);
    return [];
  }
};

export const addRecentlyViewed = (listing) => {
  if (!listing || !listing._id) return;

  try {
    const existing = getRecentlyViewed();
    // Keep only essential non-sensitive fields
    const minimalItem = {
      _id: listing._id,
      slug: listing.slug || listing._id,
      title: listing.title,
      categoryType: listing.categoryType,
      bannerImage: listing.bannerImage || listing.images?.[0],
      price: listing.pricingTiers?.[0]?.price || 150,
      city: listing.location?.city || 'All Cities',
      rating: listing.rating || 4.8,
    };

    const filtered = existing.filter((item) => item._id !== listing._id);
    const updated = [minimalItem, ...filtered].slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving recently viewed listing:', err);
  }
};
