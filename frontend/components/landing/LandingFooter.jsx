import Link from 'next/link';

export default function LandingFooter() {
  return (
    <footer className="bg-stone-50 py-12 px-6 border-t border-stone-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8 text-center md:text-left">
        <div className="max-w-xs">
          <div className="font-bold text-xl tracking-tight text-stone-900 mb-2">
            PerFinAI<span className="text-amber-800">.</span>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed">
            AI-powered financial clarity for every Indian.
          </p>
        </div>
        <div className="flex gap-6 text-sm font-medium text-stone-500">
          <Link href="/privacy" className="hover:text-stone-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-stone-900 transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-stone-900 transition-colors">
            Contact
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400 text-center md:text-left">
        <p className="max-w-xl">
          PerFinAI provides financial insights for informational purposes only. Not SEBI-registered
          investment advice.
        </p>
        <p className="font-semibold text-stone-500 shrink-0">Built at EMERGE 2026</p>
      </div>
    </footer>
  );
}
