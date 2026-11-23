/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Button } from '../ui/Button.tsx';
import { Send, Lock, ShieldCheck, User } from 'lucide-react';
import { useToast } from '../../hooks/useToast.ts';
import { formatCurrency } from '../../utils/formatters.ts';

export const SellerMessagesTab: React.FC = () => {
  const { showToast } = useToast();
  const [activeThreadId, setActiveThreadId] = useState('th_1');
  const [replyText, setReplyText] = useState('');

  const [threads, setThreads] = useState([
    {
      id: 'th_1',
      buyerName: 'Ananya Sharma',
      itemTitle: 'Apple MacBook Pro 16" M3 Max (#ord_101)',
      lastMessage: 'Battery cycle count and diagnostics match your manifest. Preparing to approve inspection.',
      time: '14:20 IST',
      unread: true,
      messages: [
        { sender: 'buyer', text: 'Hi Rohan! Just received the parcel from Blue Dart Air Express in Jaipur. Outer tamper seal was intact.', time: '14:15 IST' },
        { sender: 'seller', text: 'Great to hear! Please take the full 48 hours to inspect the chassis, display, and ports.', time: '14:17 IST' },
        { sender: 'buyer', text: 'Battery cycle count and diagnostics match your manifest. Preparing to approve inspection.', time: '14:20 IST' }
      ]
    },
    {
      id: 'th_2',
      buyerName: 'Vikramaditya Singh',
      itemTitle: 'Leica M6 TTL (#off_9210)',
      lastMessage: 'Can you confirm the rangefinder alignment at infinity with a 50mm lens?',
      time: '08:32 IST',
      unread: false,
      messages: [
        { sender: 'buyer', text: `Hello Rohan, I submitted a binding offer of ${formatCurrency(13200)} for your M6 TTL.`, time: '08:30 IST' },
        { sender: 'buyer', text: 'Can you confirm the rangefinder alignment at infinity with a 50mm lens?', time: '08:32 IST' }
      ]
    },
    {
      id: 'th_3',
      buyerName: 'Meera Deshmukh',
      itemTitle: 'Sony Alpha A7 IV Mirrorless (#off_9211)',
      lastMessage: 'Does this kit include the original Sony India GST tax invoice?',
      time: 'Yesterday',
      unread: false,
      messages: [
        { sender: 'buyer', text: 'Hi Rohan, does this kit include the original Sony India GST tax invoice?', time: 'Yesterday 19:15 IST' }
      ]
    }
  ]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = {
      sender: 'seller',
      text: replyText,
      time: 'Just now'
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, messages: [...t.messages, newMsg], lastMessage: replyText }
          : t
      )
    );

    showToast('Message Transmitted', `Contract message sent to ${activeThread.buyerName}.`, 'success');
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900">Buyer Communications & Inquiries</h2>
        <p className="text-xs text-slate-500">
          All conversations are logged in the contract audit trail to protect sellers during neutral arbitration.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
        {/* Threads List (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-200 p-3 space-y-1 overflow-y-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
            Active Buyer Threads ({threads.length})
          </span>

          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveThreadId(t.id)}
              className={`w-full p-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeThreadId === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="truncate">{t.buyerName}</span>
                <span className={`text-[10px] font-mono ${activeThreadId === t.id ? 'text-slate-300' : 'text-slate-400'}`}>
                  {t.time}
                </span>
              </div>
              <p className={`text-[11px] truncate font-medium mt-0.5 ${activeThreadId === t.id ? 'text-slate-300' : 'text-slate-500'}`}>
                {t.itemTitle}
              </p>
              <p className={`text-[11px] truncate mt-1 ${activeThreadId === t.id ? 'text-slate-300' : 'text-slate-400'}`}>
                {t.lastMessage}
              </p>
            </button>
          ))}
        </div>

        {/* Message Thread (8 cols) */}
        <div className="md:col-span-8 flex flex-col justify-between p-5 bg-slate-50/40">
          {/* Thread Header */}
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">{activeThread.buyerName}</p>
              <p className="text-[11px] text-slate-500 font-medium">{activeThread.itemTitle}</p>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Audit Logged
            </span>
          </div>

          {/* Messages Feed */}
          <div className="py-4 space-y-3 flex-1 overflow-y-auto">
            {activeThread.messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'seller' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5">{m.time}</span>
                <div
                  className={`p-3 rounded-xl max-w-sm text-xs leading-relaxed ${
                    m.sender === 'seller'
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Reply Input */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              placeholder={`Reply to ${activeThread.buyerName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
            />
            <Button type="submit" variant="primary" size="sm" className="bg-blue-900 shrink-0">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
