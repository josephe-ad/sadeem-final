import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display text-6xl gold-text mb-4">404</h1>
      <p className="text-white/60 mb-8">This page drifted off into the cosmos.</p>
      <Link to="/" className="border border-sadeem-gold text-sadeem-gold px-6 py-3 rounded-full hover:bg-sadeem-gold hover:text-black transition-colors">
        Return Home
      </Link>
    </div>
  );
}
