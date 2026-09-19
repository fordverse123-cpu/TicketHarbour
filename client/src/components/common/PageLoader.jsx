import React from 'react';
import AppLoader from '../AppLoader';

export default function PageLoader({ text = 'Loading TicketHarbour...' }) {
  return <AppLoader visible={true} mode="contained" text={text} />;
}
