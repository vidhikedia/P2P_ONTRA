/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from '../types/index.ts';
import { apiClient, USE_MOCK_API, simulateNetworkDelay, createApiResponse } from './apiClient.ts';

export interface PlatformNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'inspection' | 'dispute' | 'settlement' | 'system';
  targetUrl?: string;
  read: boolean;
  createdAt: string;
}

let notificationsStore: PlatformNotification[] = [
  {
    id: 'notif-1',
    userId: 'buyer-demo',
    title: '48-Hour Inspection Window Active',
    message: 'Your MacBook Pro order has arrived in Jaipur. Please inspect cosmetic and functional condition before settlement.',
    type: 'inspection',
    targetUrl: '/inspection/ord-101',
    read: false,
    createdAt: '10 mins ago',
  },
  {
    id: 'notif-2',
    userId: 'seller-demo',
    title: 'Payment Held in ONTRA Escrow',
    message: 'Buyer Kabir Malhotra has funded order ord-101 (₹34,500). Funds are held securely for the 48-hour inspection period.',
    type: 'order',
    targetUrl: '/delivery/courier/ord-101',
    read: true,
    createdAt: '2 hours ago',
  },
  {
    id: 'notif-3',
    userId: 'buyer-demo',
    title: 'Courier In Transit Scan',
    message: 'Insured courier shipment has been scanned at the Jaipur Regional Logistics Hub.',
    type: 'order',
    targetUrl: '/order-tracking/ord-101',
    read: true,
    createdAt: '5 hours ago',
  },
];

export const notificationService = {
  async getNotifications(userId?: string): Promise<ApiResponse<PlatformNotification[]>> {
    if (!USE_MOCK_API) {
      return apiClient.get<PlatformNotification[]>('/notifications', userId ? { userId } : undefined);
    }

    await simulateNetworkDelay(80);
    return createApiResponse([...notificationsStore]);
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
    if (!USE_MOCK_API) {
      return apiClient.patch<boolean>(`/notifications/${notificationId}/read`);
    }

    await simulateNetworkDelay(50);
    const n = notificationsStore.find((item) => item.id === notificationId);
    if (n) n.read = true;
    return createApiResponse(true);
  },

  async markAllAsRead(userId?: string): Promise<ApiResponse<boolean>> {
    if (!USE_MOCK_API) {
      return apiClient.post<boolean>('/notifications/read-all', { userId });
    }

    await simulateNetworkDelay(50);
    notificationsStore.forEach((item) => (item.read = true));
    return createApiResponse(true);
  },
};
