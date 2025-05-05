'use client';

import React from 'react';
import StockDetail from '../../../components/StockDetail';

export default function StockPage({ params }) {
  return <StockDetail symbol={params.symbol} />;
} 