/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../hooks/useToast.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Modal } from '../components/ui/Modal.tsx';
import { 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Star, 
  Edit3, 
  Lock, 
  Phone, 
  Mail, 
  FileText, 
  History,
  AlertCircle 
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editCity, setEditCity] = useState(user?.city || user?.location || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editBio, setEditBio] = useState(user?.bio || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: editName,
      city: editCity,
      location: `${editCity}, India`,
      phone: editPhone,
      bio: editBio,
    });
    showToast('Profile Updated', 'Your public member details were saved successfully.', 'success');
    setIsEditModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-bold text-xl flex items-center justify-center shrink-0 border-2 border-slate-200 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  {user?.name || 'User Profile'}
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                  {user?.role || 'BUYER'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user?.city || user?.location || 'Jaipur, Rajasthan, India'}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member since {user?.trustScore.memberSince || 'March 2024'}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditName(user?.name || '');
              setEditCity(user?.city || user?.location || '');
              setEditPhone(user?.phone || '');
              setEditBio(user?.bio || '');
              setIsEditModalOpen(true);
            }}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit Profile
          </Button>
        </div>

        {/* Bio */}
        {user?.bio && (
          <div className="py-4 text-xs text-slate-600 leading-relaxed border-b border-slate-100">
            {user.bio}
          </div>
        )}

        {/* Verification Status Indicators */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-700" />
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Email Address</span>
                <span className="text-[11px] text-slate-500">{user?.email}</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-700" />
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Mobile SMS OTP</span>
                <span className="text-[11px] text-slate-500">{user?.phone || '+91 98••• ••120'}</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Trust Rating</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {user?.rating || 4.96} ★ ({user?.reviewCount || 14} reviews)
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-900">
              Score: {user?.trustScore.score || 98}/100
            </span>
          </div>
        </div>

        {/* Sensitive Identity Verification Privacy Notice */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3 text-xs">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-slate-200">
              Identity Verification Privacy Guarantee
            </p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Government-issued PAN, Aadhaar (masked), and Indian bank settlement details are encrypted with 256-bit AES vault encryption. They are strictly confidential and never displayed on public marketplace cards.
            </p>
          </div>
        </div>
      </div>

      {/* Completed Transactions & Ratings/Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Completed Transactions History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700" />
              <span>Completed Escrow Transactions</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              {user?.completedTransactionsList?.length || 2} completed
            </span>
          </div>

          <div className="space-y-2.5">
            {(user?.completedTransactionsList || [
              {
                id: 'tx_101',
                itemTitle: 'Omega Speedmaster Co-Axial 3861',
                amount: 2700,
                roleInTx: 'buyer',
                date: '2026-10-30',
                status: 'inspected_approved',
              },
              {
                id: 'tx_102',
                itemTitle: 'Sony Alpha A7 IV Mirrorless Body & 24-70mm GM',
                amount: 19500,
                roleInTx: 'buyer',
                date: '2026-07-22',
                status: 'completed',
              }
            ]).map((tx) => (
              <div key={tx.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{tx.itemTitle}</p>
                  <p className="text-[11px] text-slate-500">
                    Role: <strong className="uppercase">{tx.roleInTx}</strong> · Completed {formatDate(tx.date)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block">
                    {formatCurrency(tx.amount)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium">
                    Inspection Approved
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings & Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Verified Counterparty Reviews</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              {user?.rating || 4.96} ★ Average
            </span>
          </div>

          <div className="space-y-3">
            {(user?.reviews || [
              {
                id: 'rev_1',
                authorName: 'Rohan Mehta',
                rating: 5,
                comment: 'Prompt communication and approved physical inspection within 24h. Highly recommended buyer.',
                itemTitle: 'Omega Speedmaster 3861',
                date: '2026-10-30',
                verifiedPurchase: true,
              },
              {
                id: 'rev_2',
                authorName: 'Vikramaditya Singh',
                rating: 5,
                comment: 'Met in person in Jaipur for OTP handover. Smooth, respectful, and transparent interaction.',
                itemTitle: 'Fujifilm X100V Silver',
                date: '2026-08-14',
                verifiedPurchase: true,
              }
            ]).map((rev) => (
              <div key={rev.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{rev.authorName}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    {'★'.repeat(rev.rating)}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>Item: {rev.itemTitle}</span>
                  <span>{formatDate(rev.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Member Profile"
          subtitle="Update your public display name, location, and communication details."
          maxWidth="md"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Display Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />

            <Input
              label="City"
              value={editCity}
              onChange={(e) => setEditCity(e.target.value)}
              required
            />

            <Input
              label="Mobile Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Public Bio / Specialties
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-blue-900 hover:bg-blue-950 font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
