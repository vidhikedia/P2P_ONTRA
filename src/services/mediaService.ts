/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiClient, USE_MOCK_API, simulateNetworkDelay, createApiResponse } from './apiClient.ts';
import { ApiResponse, MediaUploadResponse } from '../types/index.ts';

const MAX_PHOTO_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_BYTES = 120 * 1024 * 1024; // 120MB
const MAX_DOC_BYTES = 25 * 1024 * 1024; // 25MB

const ALLOWED_PHOTO_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOC_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

export const mediaService = {
  /**
   * Upload an evidence product photo
   * Supports real backend POST /api/media/upload with simulated fallback
   */
  async uploadProductPhoto(
    file: File | Blob,
    photoSlot: string = 'evidence',
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<MediaUploadResponse>> {
    // Client-side file validation
    if (file.size > MAX_PHOTO_BYTES) {
      throw new Error(`Photo size exceeds 15MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).`);
    }

    if (file.type && !ALLOWED_PHOTO_MIMES.includes(file.type.toLowerCase())) {
      throw new Error('Unsupported image format. Please upload JPEG, PNG, WebP, or HEIC.');
    }

    if (!USE_MOCK_API) {
      return apiClient.upload<MediaUploadResponse>(
        '/media/upload',
        file,
        'media',
        { folder: 'products/photos', slot: photoSlot },
        onProgress
      );
    }

    // Demo simulation with realistic progress
    onProgress?.(25);
    await simulateNetworkDelay(120);
    onProgress?.(65);
    await simulateNetworkDelay(150);
    onProgress?.(100);

    const fileName = (file as File).name || `photo_${Date.now()}.jpg`;
    const mockUpload: MediaUploadResponse = {
      url: URL.createObjectURL(file),
      key: `products/photos/${Date.now()}_${fileName}`,
      fileName,
      mimeType: file.type || 'image/jpeg',
      size: file.size,
      sha256: `sha256_${Math.random().toString(36).substring(2, 15)}`,
    };

    return createApiResponse(mockUpload, 'Photo uploaded to secure evidence vault.');
  },

  /**
   * Upload functional proof product video (60s limit)
   */
  async uploadProductVideo(
    file: File | Blob,
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<MediaUploadResponse>> {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error(`Video size exceeds 120MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).`);
    }

    if (file.type && !ALLOWED_VIDEO_MIMES.includes(file.type.toLowerCase())) {
      throw new Error('Unsupported video format. Please upload MP4, WebM, or MOV.');
    }

    if (!USE_MOCK_API) {
      return apiClient.upload<MediaUploadResponse>(
        '/media/upload',
        file,
        'media',
        { folder: 'products/videos', mediaType: 'video' },
        onProgress
      );
    }

    // Demo simulation
    onProgress?.(20);
    await simulateNetworkDelay(200);
    onProgress?.(60);
    await simulateNetworkDelay(250);
    onProgress?.(100);

    const fileName = (file as File).name || `video_${Date.now()}.mp4`;
    const mockUpload: MediaUploadResponse = {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      key: `products/videos/${Date.now()}_${fileName}`,
      fileName,
      mimeType: file.type || 'video/mp4',
      size: file.size,
      sha256: `sha256_${Math.random().toString(36).substring(2, 15)}`,
    };

    return createApiResponse(mockUpload, 'Functional proof video uploaded.');
  },

  /**
   * Upload private purchase proof or warranty document (PDF or Image)
   */
  async uploadPrivateDocument(
    file: File | Blob,
    docType: 'invoice' | 'warranty',
    onProgress?: (percent: number) => void
  ): Promise<ApiResponse<MediaUploadResponse>> {
    if (file.size > MAX_DOC_BYTES) {
      throw new Error(`Document size exceeds 25MB limit.`);
    }

    if (file.type && !ALLOWED_DOC_MIMES.includes(file.type.toLowerCase())) {
      throw new Error('Documents must be in PDF or Image format.');
    }

    if (!USE_MOCK_API) {
      return apiClient.upload<MediaUploadResponse>(
        '/media/upload',
        file,
        'document',
        { folder: 'documents/private', docType },
        onProgress
      );
    }

    onProgress?.(50);
    await simulateNetworkDelay(150);
    onProgress?.(100);

    const fileName = (file as File).name || `${docType}_${Date.now()}.pdf`;
    const mockUpload: MediaUploadResponse = {
      url: `/mock_documents/${fileName}`,
      key: `documents/private/${Date.now()}_${fileName}`,
      fileName,
      mimeType: file.type || 'application/pdf',
      size: file.size,
      sha256: `sha256_${Math.random().toString(36).substring(2, 15)}`,
    };

    return createApiResponse(mockUpload, 'Private document uploaded to secure encrypted vault.');
  },

  /**
   * Request Presigned Upload URL for direct-to-cloud storage uploads (S3 / Cloud Storage)
   */
  async requestPresignedUploadUrl(
    fileName: string,
    mimeType: string,
    folder: string = 'general'
  ): Promise<ApiResponse<{ uploadUrl: string; fileKey: string; publicUrl: string }>> {
    if (!USE_MOCK_API) {
      return apiClient.post('/media/presigned-url', { fileName, mimeType, folder });
    }

    await simulateNetworkDelay(100);
    const fileKey = `${folder}/${Date.now()}_${fileName}`;
    return createApiResponse({
      uploadUrl: `https://storage.googleapis.com/ontra-vault-demo/${fileKey}?signature=mock`,
      fileKey,
      publicUrl: `https://storage.googleapis.com/ontra-vault-demo/${fileKey}`,
    });
  },
};
