'use client';
import { QRScanner } from '@/components/assets/QRScanner';
import { PageHeader } from '@/components/ui/primitives';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/assets">
          <button className="btn-secondary p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <PageHeader title="QR Asset Scanner" subtitle="Point camera at asset QR code to update status" />
      </div>
      <QRScanner />
      <div className="mt-4 polar-card p-4">
        <p className="text-xs text-polar-text-dim font-medium mb-2">Demo QR Codes (copy-paste if camera unavailable):</p>
        <div className="space-y-1">
          {['POLAR-EXP4-0001', 'POLAR-EXP4-0002', 'POLAR-EXP4-0003', 'POLAR-EXP4-0004'].map((code) => (
            <code key={code} className="block text-xs text-polar-accent font-mono">{code}</code>
          ))}
        </div>
      </div>
    </div>
  );
}
