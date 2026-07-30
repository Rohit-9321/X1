import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="bg-white min-h-screen font-sans flex flex-col items-center justify-center px-6 text-center">
      <span className="font-display text-2xl font-black text-ink mb-8">
        X<span className="text-primary">1</span>
      </span>

      <Compass className="w-16 h-16 text-primary mb-6" strokeWidth={1.5} />

      <h1 className="font-display text-6xl font-black text-ink mb-2">404</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        This page doesn't exist — maybe the link is broken, or it moved. Let's get you back on track.
      </p>

      <div className="flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-medium hover:opacity-90 transition"
        >
          <Home className="w-4 h-4" />
          Back to home
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-gray-200 text-ink font-medium hover:bg-gray-50 transition"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
