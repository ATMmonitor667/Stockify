'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <Features />
    </main>
  );
}
