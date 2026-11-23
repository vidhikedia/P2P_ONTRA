/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService.ts';
import { CategoryDefinition } from '../types/index.ts';
import { Button } from '../components/ui/Button.tsx';
import { 
  Camera, 
  Watch, 
  Laptop, 
  Headphones, 
  Briefcase, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Smartphone,
  Armchair,
  BookOpen,
  Coffee,
  Bike,
  ShoppingBag,
  Package
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  electronics: <Camera className="w-5 h-5 text-slate-800" />,
  mobiles_laptops: <Smartphone className="w-5 h-5 text-slate-800" />,
  furniture: <Armchair className="w-5 h-5 text-slate-800" />,
  books: <BookOpen className="w-5 h-5 text-slate-800" />,
  home_appliances: <Coffee className="w-5 h-5 text-slate-800" />,
  sports_fitness: <Bike className="w-5 h-5 text-slate-800" />,
  fashion_accessories: <Watch className="w-5 h-5 text-slate-800" />,
  other_products: <Package className="w-5 h-5 text-slate-800" />,
  optical_cameras: <Camera className="w-5 h-5 text-slate-800" />,
  luxury_timepieces: <Watch className="w-5 h-5 text-slate-800" />,
  computing_laptops: <Laptop className="w-5 h-5 text-slate-800" />,
  audiophile_gear: <Headphones className="w-5 h-5 text-slate-800" />,
  designer_leather: <Briefcase className="w-5 h-5 text-slate-800" />,
  collectible_hardware: <Cpu className="w-5 h-5 text-slate-800" />,
};

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getCategories().then((res) => {
      setCategories(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Verified Marketplace Categories
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Unlike general classifieds, ONTRA operates under rigorous category-specific evidence standards. Sellers must satisfy verification criteria before items become discoverable across India.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs hover:border-slate-300 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {CATEGORY_ICONS[cat.id]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    {cat.itemCount} verified listings
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              {cat.description}
            </p>

            {/* Mandatory Evidence Checklist */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex-1">
              <h4 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                <span>Mandatory Seller Evidence</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {cat.requiredEvidenceChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 48h Inspection Focus */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200/80">
              <span className="font-semibold text-slate-900 block mb-1">
                48h Buyer Inspection Keypoints:
              </span>
              <p className="text-[11px] leading-relaxed">
                {cat.inspectionKeypoints.join(' · ')}
              </p>
            </div>

            {/* Action */}
            <div className="mt-5 pt-3 border-t border-slate-100">
              <Link to={`/explore?category=${cat.id}`}>
                <Button variant="secondary" size="sm" className="w-full justify-center" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Explore {cat.name}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
