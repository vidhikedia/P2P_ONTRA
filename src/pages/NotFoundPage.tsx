/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.tsx';
import { FileQuestion, ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
        <FileQuestion className="w-8 h-8" />
      </div>

      <div>
        <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
          Error 404
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
          The marketplace resource, transaction, or listing you requested could not be located.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link to="/" className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full justify-center bg-slate-900" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
        <Link to="/explore" className="w-full sm:w-auto">
          <Button variant="outline" size="md" className="w-full justify-center" leftIcon={<Search className="w-4 h-4" />}>
            Explore Products
          </Button>
        </Link>
      </div>
    </div>
  );
};
