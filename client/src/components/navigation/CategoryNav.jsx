import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import GooeyNav from './GooeyNav';

const CATEGORY_ITEMS = [
  { label: "Movies", href: "/movies" },
  { label: "Events", href: "/events" },
  { label: "Sports", href: "/sports" },
  { label: "Bus", href: "/bus" },
  { label: "Train", href: "/train" },
  { label: "Flights", href: "/flights" },
  { label: "Attractions", href: "/attractions" },
];

export default function CategoryNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active href based on current pathname / search params
  const getActiveHref = () => {
    const path = location.pathname;
    const search = location.search;

    if (path.includes('/movie') || search.includes('category=movies')) return '/movies';
    if (path.includes('/event') || search.includes('category=events')) return '/events';
    if (path.includes('/sport') || search.includes('category=sports')) return '/sports';
    if (path.includes('/bus')) return '/bus';
    if (path.includes('/train')) return '/train';
    if (path.includes('/flight')) return '/flights';
    if (path.includes('/attraction') || search.includes('category=attractions')) return '/attractions';

    return '/movies'; // default
  };

  const handleItemClick = (e, item) => {
    e.preventDefault();
    navigate(item.href);
  };

  return (
    <div className="w-full flex justify-center overflow-x-auto scrollbar-none py-1">
      <GooeyNav
        items={CATEGORY_ITEMS}
        activeHref={getActiveHref()}
        onItemClick={handleItemClick}
      />
    </div>
  );
}
