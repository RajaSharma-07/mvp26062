'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-polar-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">🧊</div>
        <h1 className="font-heading text-2xl font-bold text-polar-text mb-2">404 — Page Not Found</h1>
        <p className="text-polar-text-dim mb-6">This page doesn't exist in the polar database.</p>
        <Link href="/dashboard">
          <button className="btn-primary">Back to Mission Control</button>
        </Link>
      </motion.div>
    </div>
  );
}
