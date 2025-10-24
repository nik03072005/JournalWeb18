// src/app/paper/[paperId]/layout.jsx
import axios from "axios";
import React from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar2";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  try {
    // Check if paperId exists
    if (!resolvedParams.paperId || resolvedParams.paperId.trim() === '') {
      return {
        title: 'Paper Not Found',
        description: 'The requested paper could not be found.',
      };
    }

    // Improved URL construction for server-side rendering
    let baseUrl;
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NEXTAUTH_URL) {
      baseUrl = process.env.NEXTAUTH_URL;
    } else {
      baseUrl = 'http://localhost:3000';
    }

    console.log('Attempting to fetch paper metadata from:', `${baseUrl}/api/journal`);
    
    const res = await axios.get(`${baseUrl}/api/journal`, {
      params: { id: resolvedParams.paperId },
      timeout: 5000, // 5 second timeout
      headers: {
        'User-Agent': 'Next.js Server'
      }
    });
    
    const data = res.data;
    const paper = data.journal;
    
    // Check if paper and paper.detail exist
    if (!paper || !paper.detail) {
      console.log('Paper or paper detail not found for ID:', resolvedParams.paperId);
      return {
        title: 'Paper Not Found',
        description: 'The requested paper could not be found.',
      };
    }

    const paperTitle = paper.detail.title || paper.title || 'Research Paper';
    console.log('Successfully generated metadata for paper:', paperTitle);

    const date = paper.detail.date ? new Date(paper.detail.date) : null;
    const month = date ? String(date.getMonth() + 1).padStart(2, '0') : '01';
    const year = date ? date.getFullYear() : new Date().getFullYear();
    const formattedDate = `${month}/${year}`;
    
    let firstPage = 1;
    let lastPage = '';

    if (paper.detail.pageRange) {
      const parts = paper.detail.pageRange.split('-');
      firstPage = parseInt(parts[0], 10) || 1;
      lastPage = parts[1] ? parseInt(parts[1], 10) : '';
    }

    return {
      title: paperTitle,
      description: paper.detail.abstract || paper.detail.description || 'Research paper details',
      other: {
        "citation_journal_title": paperTitle,
        ...(paper.authors || []).reduce((acc, author, index) => {
          acc[`citation_author_${index}`] = author.name || '';
          return acc;
        }, {}),
        "citation_publication_date": formattedDate,
        "citation_volume": paper.detail.volume || '',
        "citation_issue": paper.detail.isbn || '',
        "citation_firstpage": firstPage,
        "citation_lastpage": lastPage || '',
        "citation_pdf_url": paper.fileUrl || '',
      },
    };
  } catch (error) {
    console.error('Error generating metadata for paper ID:', resolvedParams.paperId, error.message);
    
    // Return a more descriptive title with the paper ID for debugging
    return {
      title: `Paper ${resolvedParams.paperId}`,
      description: 'Loading paper details...',
    };
  }
}

export default function PaperLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}