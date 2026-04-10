import React, { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";

const OLIVE = '#A35E47';
const DEEP  = '#000000';
const BG    = '#FAFAFA';
const CARD  = '#FFFFFF';
const BORDER= '#9C9A9A';
const SEC   = '#464646';
const MUTED = '#9C9A9A';

const terms = [
  {
    title: "Monthly Income",
    desc: "The amount of money you earn every month after tax. Simply, your take-home salary.",
  },
  {
    title: "Expenses",
    desc: "Money you spend every month on things like rent, food, travel, and bills.",
  },
  {
    title: "Savings",
    desc: "The money left after your expenses. This is what helps you build your future.",
  },
  {
    title: "Net Worth",
    desc: "What you own minus what you owe. If positive, you're financially strong.",
  },
  {
    title: "Health Score",
    desc: "A score that shows how good your financial condition is based on savings, debt, and investments.",
  },
  {
    title: "Emergency Fund",
    desc: "Money saved to handle unexpected situations like medical emergencies or job loss.",
  },
  {
    title: "Debt / EMI",
    desc: "Money you owe, like loans or credit cards. EMI is the monthly payment you make.",
  },
  {
    title: "Investment",
    desc: "Money you put into things like stocks or mutual funds to grow over time.",
  },
  {
    title: "CIBIL Score",
    desc: "A number between 300–900 that shows how trustworthy you are with loans. Higher is better.",
  },
  {
    title: "Credit Utilization",
    desc: "How much of your credit limit you are using. Lower usage is better for your score.",
  },
  {
    title: "Tax Regime",
    desc: "The system used to calculate your tax. You can choose between old and new.",
  },
  {
    title: "ITR Filing",
    desc: "The process of submitting your income details to the government to calculate tax.",
  },
  {
    title: "What-If Simulation",
    desc: "A tool that shows what will happen if you change your income, savings, or investments.",
  },
  {
    title: "Financial Goal",
    desc: "Something you want to achieve financially, like buying a house or saving for travel.",
  },
  {
    title: "Diversification",
    desc: "Spreading your money across different investments to reduce risk.",
  },
];

const KnowTerms = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ background: `${OLIVE}15`, color: OLIVE, padding: 8, borderRadius: 8 }}>
          <BookOpen size={20} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: DEEP }}>Know Your Financial Terms</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {terms.map((t, i) => (
          <div
            key={i}
            style={{ 
              background: CARD, 
              border: `1px solid ${openIndex === i ? OLIVE : BORDER}`, 
              borderRadius: 12, 
              padding: '16px 20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: openIndex === i ? '0 10px 20px rgba(163,94,71,0.1)' : 'none'
            }}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: openIndex === i ? OLIVE : DEEP,
                transition: 'color 0.2s'
              }}>{t.title}</h3>
              <div style={{ color: openIndex === i ? OLIVE : MUTED }}>
                {openIndex === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {openIndex === i && (
              <div style={{ 
                marginTop: 12, 
                paddingTop: 12, 
                borderTop: `1px solid rgba(0,0,0,0.05)`,
                animation: 'fadeIn 0.3s ease'
              }}>
                <p style={{ fontSize: 13, color: SEC, lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default KnowTerms;
