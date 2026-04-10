'use client';
import React from "react";
import Navbar from "@/components/Navbar";
import KnowTerms from "@/components/KnowTerms";
import { BookOpen, ArrowRight, GraduationCap } from "lucide-react";

// --- DESIGN SYSTEM ---
const OLIVE = '#A35E47';
const DEEP  = '#000000';
const BG    = '#FAFAFA';
const CARD  = '#FFFFFF';
const BORDER= '#9C9A9A';
const SEC   = '#464646';
const MUTED = '#9C9A9A';

const modulesData = [
  {
    id: 1,
    title: "Introduction to Stock Markets",
    desc: "The stock market can play a pivotal role in ensuring your financial security. Learn fundamentals, how it functions, and the various intermediaries involved.",
    color: "#69c969",
    link: "https://drive.google.com/file/d/1iQMwS21my8QVf0dxWq5qpipghLBtHefc/view?usp=drivesdk",
  },
  {
    id: 2,
    title: "Technical Analysis",
    desc: "TA helps in developing a point of view. Discover patterns, indicators, and theories that help you find upright trading opportunities in the market.",
    color: "#64B2FF",
    link: "https://drive.google.com/file/d/18W-66QmxrOQxoYnf6SCrkH4nhkwAzL55/view?usp=drivesdk/",
  },
  {
    id: 3,
    title: "Fundamental Analysis",
    desc: "Explore Equity research by reading financial statements and annual reports, analyzing ratios, and evaluating intrinsic value for long-term investing.",
    color: "#EACF32",
    link: "https://drive.google.com/file/d/1kb2FLi9Bc6Hnkg516GTOftrAGLhLIYgK/view?usp=drivesdk",
  },
  {
    id: 4,
    title: "Futures Trading",
    desc: "Covers the various intricacies involved in undergoing a futures trade, including margins, leverages, pricing, and the use of derivatives for hedging.",
    color: "#FFA9BA",
    link: "https://drive.google.com/file/d/1QuEgIbXoxndjJiIEC9VSylOUBcX2kBiT/view?usp=drivesdk",
  },
  {
    id: 5,
    title: "Options Theory for Professional Trading",
    desc: "Options contracts grant the right to buy/sell without obligation. This module discusses contracts, pricing, and profit/loss payoffs.",
    color: "#FFB05A",
    link: "https://drive.google.com/file/d/1WAqur5nXdD_actNbYqHjpXK2UjeZcgms/view?usp=drivesdk",
  },
  {
    id: 6,
    title: "Option Strategies",
    desc: "Monetize views on volatility, sentiment, and timing. Explore strategies built with Option Greeks, Risk-Return profiles, and more.",
    color: "#B5B2EA",
    link: "https://drive.google.com/file/d/1I5ERAMhcInFsT0ogtLtTCDDoVXI5-4ay/view?usp=drivesdk",
  },
  {
    id: 7,
    title: "Markets and Taxation",
    desc: "Be informed of the taxes applicable to your trades. Learn topics like turnover calculation, balance sheets, P&L statements, and ITR filing.",
    color: "#78DDB9",
    link: "https://drive.google.com/file/d/1uPJQOFQ2GrFwQpkYSkOkRgv04xV2lIrq/view?usp=drivesdk",
  },
  {
    id: 8,
    title: "Currency, Commodity, and G-Sec",
    desc: "Explore interest rates, forex, and commodity impacts. This module discusses trading in currency, commodity derivatives, and Government Securities.",
    color: "#D1C36F",
    link: "https://drive.google.com/file/d/13ePnJEjks_BtKBHJAFHK9wgvfiItE8ZI/view?usp=drivesdk",
  },
  {
    id: 9,
    title: "Risk Management and Psychology",
    desc: "Trading involves risks and emotions. This module discusses risk management tools along with the psychology required for sustaining in the markets.",
    color: "#4EDFEA",
    link: "https://drive.google.com/file/d/1FCj3SGUCiB3qKVsywXJRLTL9_Uw1pJyz/view?usp=drivesdk",
  },
  {
    id: 10,
    title: "Trading Systems",
    desc: "Learn the components of building a good trading system, including different techniques and types of automated or manual systems.",
    color: "#FF8773",
    link: "https://drive.google.com/file/d/1aoCmBof2lBOT6jDu5E-_N2HZD_17B3W8/view?usp=drivesdk",
  },
  {
    id: 11,
    title: "Personal Finance - Mutual Funds",
    desc: "Managing personal finances for goals. Includes retirement planning, mutual funds, ETFs, bonds, and goal-oriented investments.",
    color: "#48CBFF",
    link: "https://drive.google.com/file/d/1FHGN8bSsejaSEv2ZliUNQ5mVGhV6m0bo/view?usp=drivesdk",
  },
];

export default function LearnPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, paddingTop: 76 }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Header Section */}
        <div style={{ 
          marginBottom: 40, 
          background: DEEP, 
          borderRadius: 12, 
          padding: '48px 40px', 
          color: BG, 
          position: 'relative', 
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <GraduationCap size={20} color={OLIVE} />
              <span style={{ fontSize: 13, fontWeight: 600, color: OLIVE, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Learning Center</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>Financial Mastery <span style={{color: OLIVE}}>Modules</span></h1>
            <p style={{ fontSize: 16, maxWidth: 500, opacity: 0.8, lineHeight: 1.6 }}>
              Comprehensive guides to help you navigate the stock market, manage risk, and optimize your personal finances.
            </p>
          </div>
          <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1 }}>
             <BookOpen size={200} color={BG} />
          </div>
        </div>

        {/* Grid Container */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 24, 
          marginBottom: 60 
        }}>
          {modulesData.map((mod) => (
            <div
              key={mod.id}
              className="module-card"
              style={{ 
                background: CARD, 
                border: `1px solid ${BORDER}`, 
                borderTop: `4px solid ${mod.color}`,
                borderRadius: 12, 
                padding: 24, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 12, 
                transition: 'all 0.3s ease', 
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.05em' }}>MODULE {mod.id < 10 ? `0${mod.id}` : mod.id}</span>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: mod.color }} />
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: DEEP, lineHeight: 1.2 }}>
                {mod.title}
              </h2>

              <p style={{ fontSize: 13, color: SEC, lineHeight: 1.5 }}>
                {mod.desc}
              </p>

              <a
                href={mod.link}
                target="_blank"
                rel="noreferrer"
                style={{ 
                  marginTop: 'auto', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  color: OLIVE, 
                  fontSize: 13, 
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                className="module-link"
              >
                View Module <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <KnowTerms />
        </div>
      </div>

      <style jsx>{`
        .module-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important;
          border-color: ${OLIVE};
        }
        .module-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}