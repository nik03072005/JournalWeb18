"use client"
import CollectionsCarouselSwiper from '@/components/CollectionCrousel';
import Footer from '@/components/Footer';
import Home from '@/components/Home';
import InfoTiles from '@/components/InfoTIles';
import NewsHighlights from '@/components/NewsHighLights';
import FAQ from '@/components/FAQ';
import Stats from '@/components/Stats';
import React, { useEffect } from 'react';
import axios from 'axios';

function Page() {
  //run auto update for admin subscription
  
  return (
    <div>
      <Home />
      <Stats />
      <InfoTiles />
      <NewsHighlights />
      <CollectionsCarouselSwiper />
      <div id="faq-section">
        <FAQ />
      </div>
      <Footer />
    </div>
  );
}

export default Page;