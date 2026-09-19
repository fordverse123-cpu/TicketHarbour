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

  const getActiveHref = () => {
    const path = location.pathname;
    const search = location.search;

    if (path.startsWith('/movies') || search.includes('category=movies')) return '/movies';
    if (path.startsWith('/events') || search.includes('category=events')) return '/events';
    if (path.startsWith('/sports') || search.includes('category=sports')) return '/sports';
    if (path.startsWith('/bus')) return '/bus';
    if (path.startsWith('/train')) return '/train';
    if (path.startsWith('/flight')) return '/flights';
    if (path.startsWith('/attraction') || search.includes('category=attractions')) return '/attractions';

    return '/movies';
  };

  const handleItemClick = (e, item) => {
    e.preventDefault();
    if (location.pathname !== item.href) {
      navigate(item.href);
    }
  };

  return (
    <div className="w-full flex justify-center items-center overflow-x-auto scrollbar-none py-1.5 px-2">
      <GooeyNav
        items={CATEGORY_ITEMS}
        activeHref={getActiveHref()}
        onItemClick={handleItemClick}
      />
    </div>
  );
}
