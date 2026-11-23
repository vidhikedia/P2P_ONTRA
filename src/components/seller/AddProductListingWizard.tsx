/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Product, ProductCategory, ProductCondition, EvidencePhoto } from '../../types/index.ts';
import { MOCK_CATEGORIES, MOCK_IMAGES } from '../../data/mockData.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { CONDITION_LABELS } from '../../utils/statusHelpers.ts';
import { useToast } from '../../hooks/useToast.ts';
import { Button } from '../ui/Button.tsx';
import { Input } from '../ui/Input.tsx';
import { Select } from '../ui/Select.tsx';
import { 
  validateListingBasics, 
  validateListingMedia, 
  validateListingPricing 
} from '../../utils/validators.ts';
import { mediaService } from '../../services/mediaService.ts';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Trash2, 
  RefreshCw, 
  ArrowUpDown, 
  Play, 
  Video, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Truck, 
  QrCode, 
  Lock, 
  Eye, 
  HelpCircle,
  X,
  FileCheck,
  Image as ImageIcon
} from 'lucide-react';

interface AddProductListingWizardProps {
  onSuccess: (product: Product, isDraft: boolean) => void;
  onCancel: () => void;
  initialData?: Partial<Product>;
}

const STEPS = [
  { id: 1, title: 'Basic Details', subtitle: 'Title & Brand' },
  { id: 2, title: 'Photos', subtitle: '5-Angle Evidence' },
  { id: 3, title: 'Video Demo', subtitle: 'Functional Proof' },
  { id: 4, title: 'Purchase Details', subtitle: 'Provenance & Box' },
  { id: 5, title: 'Condition', subtitle: 'Defects & Wear' },
  { id: 6, title: 'Ownership & Supporting Documents', subtitle: 'Proof & Papers' },
  { id: 7, title: 'Price & Location', subtitle: 'Pricing & City' },
  { id: 8, title: 'Delivery', subtitle: 'Courier & Handover' },
  { id: 9, title: 'Declaration & Preview', subtitle: 'Review & Confirm' },
];

interface PhotoSlot {
  target: 'front' | 'back' | 'left' | 'right' | 'accessories' | 'close_up';
  label: string;
  url: string | null;
  progress: number;
  fileName?: string;
}

export const AddProductListingWizard: React.FC<AddProductListingWizardProps> = ({
  onSuccess,
  onCancel,
  initialData,
}) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  // Step 1: Basic Details
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<ProductCategory>(initialData?.category || 'electronics');
  const [subCategory, setSubCategory] = useState(initialData?.subCategory || 'Rangefinders & Bodies');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [model, setModel] = useState(initialData?.model || '');

  // Step 2: Photos (5 Structured slots with realistic peer marketplace photos)
  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { target: 'front', label: '1. Front View (Serial Visible)', url: MOCK_IMAGES.cameraTable, progress: 100, fileName: 'front_inspection_table.jpg' },
    { target: 'back', label: '2. Rear View & Display', url: MOCK_IMAGES.cameraLens, progress: 100, fileName: 'lens_aperture_check.jpg' },
    { target: 'left', label: '3. Left Flank / Dial Detail', url: null, progress: 0 },
    { target: 'right', label: '4. Right Flank / Ports', url: null, progress: 0 },
    { target: 'accessories', label: '5. Accessories & Packaging', url: null, progress: 0 },
  ]);

  // Step 3: Product Video
  const [videoUrl, setVideoUrl] = useState<string | null>(
    initialData?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [videoProgress, setVideoProgress] = useState(100);
  const [videoFileName, setVideoFileName] = useState('optical_shutter_test.mp4');

  // Step 4: Purchase Details
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || 'May 2024');
  const [originalRetailPrice, setOriginalRetailPrice] = useState<number>(initialData?.originalRetailPrice || 28500);
  const [usageDuration, setUsageDuration] = useState(initialData?.usageDuration || 'Approx. 5-7 months light hobby use');
  const [warrantyStatus, setWarrantyStatus] = useState(initialData?.warrantyStatus || 'Valid factory transfer warranty active');
  const [hasOriginalBox, setHasOriginalBox] = useState<boolean>(initialData?.hasOriginalBox ?? true);

  // Step 5: Condition & Description
  const [condition, setCondition] = useState<ProductCondition>(initialData?.condition || 'like_new');
  const [workingStatus, setWorkingStatus] = useState<'functional' | 'minor_issue' | 'for_parts'>('functional');
  const [defectsAndScratches, setDefectsAndScratches] = useState(
    initialData?.defectsAndScratches || 'No structural cracks or glass scratches. Microscopic friction hairline on baseplate lock lever only.'
  );
  const [repairsAndReplacements, setRepairsAndReplacements] = useState(
    initialData?.repairsAndReplacements || 'None. Completely original internal factory mechanism.'
  );
  const [missingAccessories, setMissingAccessories] = useState('');
  const [includedAccessories, setIncludedAccessories] = useState<string[]>(
    initialData?.accessoriesIncluded || ['Original presentation box', 'Neck strap', 'Lens cap', 'Battery & charger']
  );
  const [newAccessoryTag, setNewAccessoryTag] = useState('');
  const [conditionDetails, setConditionDetails] = useState(
    initialData?.conditionDetails || 'Fully functional body stored in climate-controlled cabinet. All optical components clean.'
  );

  // Step 6: Ownership & Supporting Documents
  type DocumentOption = 'yes_invoice' | 'no_unavailable' | 'has_supporting_doc';
  type SupportingDocType = 'purchase_confirmation' | 'warranty_papers' | 'service_receipt' | 'ownership_evidence';

  const [documentOption, setDocumentOption] = useState<DocumentOption>(
    initialData?.documentOption || (initialData?.invoiceUnavailable ? 'no_unavailable' : (initialData?.hasOriginalInvoice ? 'yes_invoice' : 'no_unavailable'))
  );
  const [invoiceDocumentUrl, setInvoiceDocumentUrl] = useState<string | null>(
    initialData?.invoiceDocumentUrl || '/receipt_demo_sample.pdf'
  );
  const [invoiceDocumentName, setInvoiceDocumentName] = useState<string>('gst_tax_invoice.pdf');

  const [supportingDocType, setSupportingDocType] = useState<SupportingDocType>(
    initialData?.supportingDocType || 'purchase_confirmation'
  );
  const [supportingDocumentUrl, setSupportingDocumentUrl] = useState<string | null>(
    initialData?.supportingDocumentUrl || null
  );
  const [supportingDocumentName, setSupportingDocumentName] = useState<string>(
    initialData?.supportingDocumentName || ''
  );

  const [warrantyDocumentUrl, setWarrantyDocumentUrl] = useState<string | null>(
    initialData?.warrantyDocumentUrl || '/warranty_stamped.pdf'
  );
  const [warrantyDocumentName, setWarrantyDocumentName] = useState<string>('factory_warranty_card.pdf');

  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeDocTarget, setActiveDocTarget] = useState<'invoice' | 'warranty' | 'supporting' | null>(null);

  const triggerDocUpload = (target: 'invoice' | 'warranty' | 'supporting') => {
    setActiveDocTarget(target);
    if (docFileInputRef.current) {
      docFileInputRef.current.value = '';
      docFileInputRef.current.click();
    }
  };

  const handleDocFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDocTarget) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      if (activeDocTarget === 'invoice') {
        setInvoiceDocumentUrl(resultUrl);
        setInvoiceDocumentName(file.name);
        showToast('Invoice Uploaded', `${file.name} saved to private vault.`, 'success');
      } else if (activeDocTarget === 'warranty') {
        setWarrantyDocumentUrl(resultUrl);
        setWarrantyDocumentName(file.name);
        showToast('Warranty Attached', `${file.name} attached.`, 'success');
      } else if (activeDocTarget === 'supporting') {
        setSupportingDocumentUrl(resultUrl);
        setSupportingDocumentName(file.name);
        showToast('Supporting Document Uploaded', `${file.name} recorded.`, 'success');
      }
      setActiveDocTarget(null);
    };
    reader.onerror = () => {
      showToast('Upload Error', 'Could not read document file.', 'error');
      setActiveDocTarget(null);
    };
    reader.readAsDataURL(file);
  };

  // Step 7: Price & Location
  const [askingPrice, setAskingPrice] = useState<number>(initialData?.askingPrice || 14500);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [minOfferAllowed, setMinOfferAllowed] = useState<number>(initialData?.minOfferAllowed || 12500);
  const [reasonForSelling, setReasonForSelling] = useState(initialData?.reasonForSelling || 'Upgrading to newer studio hardware.');
  const [city, setCity] = useState(initialData?.sellerLocation || 'Jaipur, Rajasthan');
  const [approximateLocation, setApproximateLocation] = useState(
    initialData?.approximateLocation || 'Jaipur · C-Scheme / Malviya Nagar'
  );

  // Step 8: Delivery Options
  const [deliveryMethods, setDeliveryMethods] = useState<('courier' | 'direct_handover')[]>(['courier', 'direct_handover']);
  const [packagingNotes, setPackagingNotes] = useState('Double-boxed with heavy bubble wrap and void fill for tamper-proof transit.');

  // Step 9: Declarations (5 covenants)
  const [covenants, setCovenants] = useState({
    detailsAccurate: false,
    photosActual: false,
    defectsDisclosed: false,
    authorizedOwner: false,
    policiesAccepted: false,
  });

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Trigger actual file selection
  const triggerFileUpload = (index: number) => {
    setActiveUploadIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle actual user uploaded photo file
  const handleRealFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeUploadIndex === null) return;

    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please select an image file (JPG, PNG, WEBP).', 'warning');
      return;
    }

    const index = activeUploadIndex;
    const updated = [...photos];
    updated[index].progress = 30;
    setPhotos([...updated]);

    const reader = new FileReader();
    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.min(95, Math.round((evt.loaded / evt.total) * 100));
        const prog = [...photos];
        prog[index].progress = percent;
        setPhotos(prog);
      }
    };
    reader.onload = () => {
      const finished = [...photos];
      finished[index].progress = 100;
      finished[index].url = reader.result as string;
      finished[index].fileName = file.name;
      setPhotos(finished);
      showToast('Photo Uploaded', `Your photo ${file.name} was attached successfully.`, 'success');
      setActiveUploadIndex(null);
    };
    reader.onerror = () => {
      showToast('Upload Failed', 'Failed to read the selected image file.', 'error');
      const reset = [...photos];
      reset[index].progress = 0;
      setPhotos(reset);
      setActiveUploadIndex(null);
    };
    reader.readAsDataURL(file);
  };

  // Simulated realistic peer photo helper for fast demo testing
  const SAMPLE_PEER_PHOTOS = [
    { url: MOCK_IMAGES.cameraTable, name: 'chassis_desk_serial.jpg' },
    { url: MOCK_IMAGES.cameraLens, name: 'glass_aperture_check.jpg' },
    { url: MOCK_IMAGES.phoneAngles, name: 'side_bezel_inspection.jpg' },
    { url: MOCK_IMAGES.laptopPorts, name: 'chassis_ports_scuff.jpg' },
    { url: MOCK_IMAGES.watchCaseback, name: 'caseback_engraving.jpg' },
    { url: MOCK_IMAGES.heroStill, name: 'living_room_packaging.jpg' },
  ];

  const handleSimulatePhotoUpload = (index: number) => {
    const updated = [...photos];
    updated[index].progress = 35;
    setPhotos([...updated]);

    setTimeout(() => {
      updated[index].progress = 85;
      setPhotos([...updated]);
    }, 180);

    setTimeout(() => {
      const sample = SAMPLE_PEER_PHOTOS[index % SAMPLE_PEER_PHOTOS.length];
      updated[index].progress = 100;
      updated[index].url = sample.url;
      updated[index].fileName = sample.name;
      setPhotos([...updated]);
      showToast('Sample Photo Added', `Realistic peer photo loaded for ${photos[index].label}`, 'info');
    }, 380);
  };

  const handleRemovePhoto = (index: number) => {
    const updated = [...photos];
    updated[index].url = null;
    updated[index].progress = 0;
    updated[index].fileName = undefined;
    setPhotos(updated);
  };

  const handleAddAccessory = () => {
    if (!newAccessoryTag.trim()) return;
    if (!includedAccessories.includes(newAccessoryTag.trim())) {
      setIncludedAccessories([...includedAccessories, newAccessoryTag.trim()]);
    }
    setNewAccessoryTag('');
  };

  const handleRemoveAccessory = (tag: string) => {
    setIncludedAccessories(includedAccessories.filter((t) => t !== tag));
  };

  const allCovenantsChecked = 
    covenants.detailsAccurate &&
    covenants.photosActual &&
    covenants.defectsDisclosed &&
    covenants.authorizedOwner &&
    covenants.policiesAccepted;

  const handleNextStep = () => {
    if (currentStep === 1) {
      const val = validateListingBasics({ title, brand, model, category, subCategory });
      if (!val.isValid) {
        showToast('Validation Error', Object.values(val.errors)[0], 'warning');
        return;
      }
    } else if (currentStep === 2) {
      const validPhotoUrls = photos.filter((p) => p.url !== null).map((p) => p.url as string);
      const val = validateListingMedia({ photos: validPhotoUrls });
      if (!val.isValid) {
        showToast('Photos Required', Object.values(val.errors)[0], 'warning');
        return;
      }
    } else if (currentStep === 7) {
      const val = validateListingPricing({ askingPrice, minOfferAllowed, isNegotiable, city, approximateLocation });
      if (!val.isValid) {
        showToast('Pricing Error', Object.values(val.errors)[0], 'warning');
        return;
      }
    } else if (currentStep === 8) {
      if (deliveryMethods.length === 0) {
        showToast('Delivery Option Required', 'Please select at least one delivery method (Courier or Direct Handover).', 'warning');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(9, prev + 1));
  };

  const handleFinalSubmit = (isDraft: boolean) => {
    const validPhotos = photos.filter((p) => p.url !== null);
    const primaryImg = validPhotos[0]?.url || MOCK_IMAGES.cameraTable;

    const evidencePhotos: EvidencePhoto[] = validPhotos.map((p, idx) => ({
      id: `ev_${Date.now()}_${idx}`,
      url: p.url!,
      label: p.label,
      verifiedByAdmin: false,
    }));

    const newProduct: Product = {
      id: initialData?.id || `prod_${Date.now()}`,
      title,
      subtitle: `${brand} ${model} · ${conditionDetails.slice(0, 75)}...`,
      category,
      subCategory,
      brand,
      model,
      condition,
      conditionDetails,
      askingPrice,
      originalRetailPrice,
      currency: 'INR',
      isNegotiable,
      minOfferAllowed,
      featuredImage: primaryImg,
      galleryImages: validPhotos.map((p) => p.url!),
      videoUrl: videoUrl || undefined,
      evidencePhotos,
      verification: {
        serialVerified: true,
        serialNumberMasked: 'SN-9428••••',
        receiptIncluded: documentOption === 'yes_invoice' && !!invoiceDocumentUrl,
        timestampEvidenceApproved: true,
        authenticityGuaranteed: true,
        inspectionWindowHours: 48,
      },
      hasOriginalInvoice: documentOption === 'yes_invoice' && !!invoiceDocumentUrl,
      invoiceUnavailable: documentOption === 'no_unavailable',
      invoiceDocumentUrl: documentOption === 'yes_invoice' ? (invoiceDocumentUrl || undefined) : undefined,
      warrantyDocumentUrl: warrantyDocumentUrl || undefined,
      documentStatus: documentOption,
      documentType: documentOption === 'yes_invoice' ? 'invoice' : (documentOption === 'has_supporting_doc' ? supportingDocType : 'none'),
      supportingDocumentUrl: documentOption === 'has_supporting_doc' ? (supportingDocumentUrl || undefined) : undefined,
      supportingDocumentName: documentOption === 'has_supporting_doc' ? (supportingDocumentName || undefined) : undefined,
      documentOption,
      supportingDocType,
      purchaseDate,
      usageDuration,
      workingConditionDetails: workingStatus === 'functional' ? 'Fully operational, no defects' : 'Minor defect declared',
      defectsAndScratches,
      repairsAndReplacements,
      accessoriesIncluded: includedAccessories,
      hasOriginalBox,
      warrantyStatus,
      reasonForSelling,
      deliveryMethods,
      approximateLocation,
      sellerId: 'usr_seller_01',
      sellerName: 'Rohan Mehta',
      sellerRating: 4.95,
      sellerTrustScore: 99,
      sellerLocation: city,
      sellerCompletedTransactions: 42,
      insuredShippingCost: 299,
      createdAt: new Date().toISOString(),
      status: isDraft ? 'draft' : 'active',
      viewsCount: 0,
      savesCount: 0,
      offersCount: 0,
    };

    onSuccess(newProduct, isDraft);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Multi-step Header & Progress Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Step {currentStep} of 9 · {STEPS[currentStep - 1].title}
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Create Transparent Product Listing
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFinalSubmit(true)}
              className="text-xs text-slate-700"
            >
              Save Draft
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Mobile Compact Progress Bar */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">
              {STEPS[currentStep - 1].title} ({STEPS[currentStep - 1].subtitle})
            </span>
            <span className="font-mono text-slate-500 text-[11px]">
              {Math.round((currentStep / 9) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-slate-900 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop Step Indicator Pills */}
        <div className="hidden sm:grid sm:grid-cols-9 gap-1.5">
          {STEPS.map((s) => {
            const isCompleted = s.id < currentStep;
            const isCurrent = s.id === currentStep;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`p-2 rounded-lg text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>0{s.id}</span>
                  {isCompleted && <Check className="w-3 h-3 text-emerald-600" />}
                </div>
                <p className="text-[11px] font-semibold truncate mt-0.5">{s.title}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="p-6 sm:p-8 space-y-6 max-w-4xl">
        {/* STEP 1: Basic Details */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 1: Product Classification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Accurate brand and model details ensure our compliance system cross-references manufacturer serial patterns.
              </p>
            </div>

            <Input
              label="Listing Headline Title"
              placeholder="e.g. Leica M6 TTL 0.72 Black Chrome 35mm Rangefinder"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              helperText="Include the full official product name and key distinguishing characteristic."
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Primary Category"
                options={MOCK_CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                required
              />
              <Input
                label="Subcategory / Product Family"
                placeholder="e.g. Mechanical Rangefinders, Workstations, Chronographs"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Manufacturer / Brand"
                placeholder="e.g. Leica, Apple, Omega, Sony"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
              <Input
                label="Specific Model Number or Reference"
                placeholder="e.g. M6 TTL (0.72x) Ref 10433"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* STEP 2: Photos */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Hidden file input for actual device file selection */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRealFileChange}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Step 2: Actual Product Photographs</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stock catalogue photos and 3D studio renders are prohibited. Upload authentic mobile photographs showing honest condition and angles.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mobile photo metadata preserved</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((slot, idx) => (
                <div
                  key={idx}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      setActiveUploadIndex(idx);
                      const updated = [...photos];
                      updated[idx].progress = 30;
                      setPhotos(updated);

                      const reader = new FileReader();
                      reader.onload = () => {
                        const finished = [...photos];
                        finished[idx].progress = 100;
                        finished[idx].url = reader.result as string;
                        finished[idx].fileName = file.name;
                        setPhotos(finished);
                        showToast('Photo Uploaded', `Dropped ${file.name} into slot ${idx + 1}`, 'success');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate">{slot.label}</span>
                    {slot.url && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Uploaded
                      </span>
                    )}
                  </div>

                  {/* Thumbnail / Upload Area */}
                  <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center relative">
                    {slot.url ? (
                      <>
                        <img 
                          src={slot.url} 
                          alt={slot.label} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = MOCK_IMAGES.cameraTable;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => triggerFileUpload(idx)}
                            className="p-2 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer shadow-xs flex items-center gap-1"
                            title="Upload New Photo from Device"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Replace</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="p-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer shadow-xs"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-3 space-y-2">
                        {slot.progress > 0 ? (
                          <div className="w-full space-y-1">
                            <span className="text-[11px] text-slate-500 font-mono">Uploading... {slot.progress}%</span>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-900 transition-all duration-200"
                                style={{ width: `${slot.progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                            <p className="text-[11px] text-slate-500">Drag or choose phone photo</p>
                            <div className="flex flex-col gap-1.5 pt-1">
                              <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
                                onClick={() => triggerFileUpload(idx)}
                              >
                                Upload From Device
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleSimulatePhotoUpload(idx)}
                                className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                              >
                                Or insert realistic sample
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 truncate">
                    {slot.fileName || 'Supported: JPG, PNG, WEBP (Max 15MB)'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Video Demonstration */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 3: Functional Video Demonstration</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Video evidence drastically reduces disputes by letting the buyer confirm acoustic, mechanical, or screen operation before shipping.
              </p>
            </div>

            {/* Instruction Checklist */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                What to capture in your 15–60 second video:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pl-4 list-disc">
                <li>Power-on sequence or physical switch actuation.</li>
                <li>Clear close-up of the engraved serial number.</li>
                <li>Slow 360° pan over all corners and edges.</li>
                <li>Operational sound (shutter, motors, dials, or ports).</li>
              </ul>
            </div>

            {/* Video Upload & Preview Area */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              {videoUrl ? (
                <div className="space-y-3">
                  <div className="relative aspect-video max-w-lg mx-auto bg-black rounded-lg overflow-hidden border border-slate-200">
                    <video src={videoUrl} controls className="w-full h-full object-contain" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 max-w-lg mx-auto">
                    <span className="font-mono text-emerald-700 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" /> {videoFileName} (14.2 MB)
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVideoUrl(null)}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Remove Video
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-xl">
                  <Video className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Upload Video Demonstration</p>
                    <p className="text-[11px] text-slate-400">MP4, MOV (Max 120MB, 15 to 90 seconds)</p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="bg-blue-900"
                    onClick={() => {
                      setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                      setVideoFileName('shutter_actuation_test.mp4');
                    }}
                  >
                    Select Demo Video File
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Purchase Details */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 4: Purchase Provenance & Packaging</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Documenting previous ownership duration establishes accurate market fair value.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Approximate Original Purchase Date"
                placeholder="e.g. May 2023 or October 2022"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
              <Input
                label="Original Retail Price When New (INR ₹)"
                type="number"
                min={0}
                value={originalRetailPrice}
                onChange={(e) => setOriginalRetailPrice(Number(e.target.value))}
                helperText="Used to display buyer percentage savings comparison."
                required
              />
            </div>

            <Input
              label="Duration of Usage & Storage Routine"
              placeholder="e.g. Rotated for 6 months, stored in dry humidity cabinet"
              value={usageDuration}
              onChange={(e) => setUsageDuration(e.target.value)}
              required
            />

            <Input
              label="Manufacturer Warranty Status"
              placeholder="e.g. Active through June 2027 or Expired"
              value={warrantyStatus}
              onChange={(e) => setWarrantyStatus(e.target.value)}
              required
            />

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={hasOriginalBox}
                  onChange={(e) => setHasOriginalBox(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4"
                />
                <span>Original manufacturer retail packaging & presentation box is included</span>
              </label>
              <p className="text-[11px] text-slate-500 ml-7 mt-0.5">
                Having the matching serial carton increases collector confidence and resale valuation.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: Condition & Description */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 5: Physical Condition & Defect Disclosure</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ONTRA buyers inspect against this exact manifest during their 48-hour inspection window. Disclose all micro-wear.
              </p>
            </div>

            {/* Condition Grade Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">Condition Grade</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['mint_in_box', 'like_new', 'very_good', 'good', 'fair'] as ProductCondition[]).map((c) => {
                  const meta = CONDITION_LABELS[c];
                  const isSelected = condition === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCondition(c)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-xs">{meta.label}</p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {meta.description.slice(0, 45)}...
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Working Status */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Operational Working Status</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkingStatus('functional')}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer text-xs font-semibold ${
                    workingStatus === 'functional'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  ✓ 100% Fully Functional
                </button>
                <button
                  type="button"
                  onClick={() => setWorkingStatus('minor_issue')}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer text-xs font-semibold ${
                    workingStatus === 'minor_issue'
                      ? 'border-amber-600 bg-amber-50 text-amber-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  Minor Flaw Declared
                </button>
                <button
                  type="button"
                  onClick={() => setWorkingStatus('for_parts')}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer text-xs font-semibold ${
                    workingStatus === 'for_parts'
                      ? 'border-rose-600 bg-rose-50 text-rose-800'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  For Parts / Salvage
                </button>
              </div>
            </div>

            {/* Defects & Blemishes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Scratches, Dings, & Physical Blemishes
              </label>
              <textarea
                rows={2}
                value={defectsAndScratches}
                onChange={(e) => setDefectsAndScratches(e.target.value)}
                placeholder="Be exhaustive. Example: Micro-abrasion near battery door; zero scratches on optical glass."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>

            {/* Repairs & Replaced parts */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Prior Repairs, Services, or Replaced Parts
              </label>
              <textarea
                rows={2}
                value={repairsAndReplacements}
                onChange={(e) => setRepairsAndReplacements(e.target.value)}
                placeholder="Example: Certified CLA service performed June 2024. Factory original shutter."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>

            {/* Accessories Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Accessories Included in Box
              </label>
              <div className="flex flex-wrap gap-1.5">
                {includedAccessories.map((acc, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                  >
                    <span>{acc}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccessory(acc)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add item: e.g. Extra Battery, Strap, Manual..."
                  value={newAccessoryTag}
                  onChange={(e) => setNewAccessoryTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAccessory())}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddAccessory}>
                  Add Tag
                </Button>
              </div>
            </div>

            {/* Complete Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Comprehensive Listing Description
              </label>
              <textarea
                rows={4}
                value={conditionDetails}
                onChange={(e) => setConditionDetails(e.target.value)}
                placeholder="Describe optical performance, mechanical feel, shutter feel, battery health, and provenance."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>
          </div>
        )}

        {/* STEP 6: Ownership & Supporting Documents */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Hidden Document File Input for Device Selection */}
            <input
              type="file"
              ref={docFileInputRef}
              onChange={handleDocFileSelected}
              accept="application/pdf,image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />

            <div>
              <h2 className="text-base font-bold text-slate-900">Step 6: Ownership & Supporting Documents</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Establish ownership provenance for prospective buyers. Invoices are optional and never required for low-risk categories.
              </p>
            </div>

            {/* Category Risk & Requirement Assessment */}
            {['books', 'furniture', 'fashion_accessories'].includes(category) ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Low-Risk Category: Invoices Are Completely Optional</p>
                  <p className="text-emerald-800/90 leading-relaxed mt-0.5">
                    For books, clothing, and furniture, proof of original purchase is never mandatory. Your natural photographs and condition disclosures are your primary listing evidence.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Proven Ownership Guideline</p>
                  <p className="text-slate-600 leading-relaxed mt-0.5">
                    Original store receipts, retail invoices, or service records boost buyer confidence and unlock verified provenance badges, but are optional if unavailable.
                  </p>
                </div>
              </div>
            )}

            {/* Strict Document Privacy Protection Vault Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
              <Lock className="w-5 h-5 text-blue-800 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Strict Document Privacy Protection</p>
                <p className="leading-relaxed mt-0.5 text-blue-800/90">
                  Uploaded invoices and receipts may contain private personal data (such as your full address, billing name, or payment digits).
                  These files are <strong>never displayed publicly or shown to prospective buyers</strong>. They are encrypted in private storage and accessed solely by ONTRA administrative compliance staff during neutral dispute resolution.
                </p>
              </div>
            </div>

            {/* Core Question 1: Do you have the original purchase invoice? */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Do you have the original purchase invoice?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Yes, I have the original invoice */}
                <button
                  type="button"
                  onClick={() => setDocumentOption('yes_invoice')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    documentOption === 'yes_invoice'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Yes, I have the original invoice</span>
                    {documentOption === 'yes_invoice' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${documentOption === 'yes_invoice' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Upload store GST tax invoice, cash till slip, or digital retail order receipt.
                  </p>
                </button>

                {/* Option 2: No, invoice is unavailable */}
                <button
                  type="button"
                  onClick={() => {
                    setDocumentOption('no_unavailable');
                    setInvoiceDocumentUrl(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    documentOption === 'no_unavailable'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">No, invoice is unavailable</span>
                    {documentOption === 'no_unavailable' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${documentOption === 'no_unavailable' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Receipt lost, item acquired vintage, or received as a gift. Continue without blocking.
                  </p>
                </button>

                {/* Option 3: I have another supporting document */}
                <button
                  type="button"
                  onClick={() => setDocumentOption('has_supporting_doc')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    documentOption === 'has_supporting_doc'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">I have another supporting document</span>
                    {documentOption === 'has_supporting_doc' && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${documentOption === 'has_supporting_doc' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Provide purchase confirmation, service records, or warranty papers.
                  </p>
                </button>
              </div>
            </div>

            {/* Condition 1: If Yes, allow invoice upload */}
            {documentOption === 'yes_invoice' && (
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-700" /> Original Store / Retail Invoice
                  </span>
                  {invoiceDocumentUrl && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Encrypted in Vault
                    </span>
                  )}
                </div>

                {invoiceDocumentUrl ? (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-slate-700 truncate max-w-xs">
                        {invoiceDocumentName || 'gst_invoice_store_5902.pdf'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => triggerDocUpload('invoice')}
                        className="text-xs"
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setInvoiceDocumentUrl(null);
                          setInvoiceDocumentName('');
                        }}
                        className="text-xs text-rose-600"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-600">Upload PDF, JPG, or PNG invoice file</p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        className="text-xs bg-slate-900 text-white"
                        onClick={() => triggerDocUpload('invoice')}
                      >
                        Choose Invoice from Device
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setInvoiceDocumentUrl('/gst_invoice_sample.pdf');
                          setInvoiceDocumentName('sample_retail_invoice.pdf');
                          showToast('Sample Invoice Loaded', 'Demo invoice attached to private vault.', 'info');
                        }}
                      >
                        Insert Demo Sample
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Condition 2: If Unavailable, allow seller to continue without blocking */}
            {documentOption === 'no_unavailable' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700 animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Invoice Requirement Waived</p>
                  <p className="leading-relaxed text-slate-600">
                    You can proceed directly without an invoice. Your listing will publish normally under our transparent condition disclosure and buyer inspection guarantees.
                  </p>
                </div>
              </div>
            )}

            {/* Condition 3: If supporting document option, show document type selector and upload */}
            {documentOption === 'has_supporting_doc' && (
              <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-200 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Select Alternative Document Type
                  </label>
                  <Select
                    options={[
                      { value: 'purchase_confirmation', label: 'Purchase Confirmation (Order email, booking record)' },
                      { value: 'warranty_papers', label: 'Warranty Papers (Manufacturer booklet, stamped card)' },
                      { value: 'service_receipt', label: 'Service Receipt (Authorized repair, CLA maintenance receipt)' },
                      { value: 'ownership_evidence', label: 'Other Relevant Ownership Evidence (Appraisal, customs declaration)' },
                    ]}
                    value={supportingDocType}
                    onChange={(e) => setSupportingDocType(e.target.value as SupportingDocType)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-700" /> Upload Supporting Document
                    </span>
                    {supportingDocumentUrl && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Recorded
                      </span>
                    )}
                  </div>

                  {supportingDocumentUrl ? (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono text-slate-700 truncate max-w-xs">
                          {supportingDocumentName || 'supporting_ownership_record.pdf'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => triggerDocUpload('supporting')}
                          className="text-xs"
                        >
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSupportingDocumentUrl(null);
                            setSupportingDocumentName('');
                          }}
                          className="text-xs text-rose-600"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600">Upload PDF, JPG, or PNG document</p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          className="text-xs bg-slate-900 text-white"
                          onClick={() => triggerDocUpload('supporting')}
                        >
                          Choose File from Device
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            setSupportingDocumentUrl('/receipt_demo_sample.pdf');
                            setSupportingDocumentName('digital_order_confirmation.pdf');
                            showToast('Supporting Record Loaded', 'Demo document attached.', 'info');
                          }}
                        >
                          Insert Sample Record
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optional Warranty / Service Papers (Always optional) */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" /> Optional: Manufacturer Warranty or Service Papers
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Factory warranty cards, extended care certificates, or CLA service papers. Completely optional.
                  </span>
                </div>
                {warrantyDocumentUrl && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                    Attached
                  </span>
                )}
              </div>

              {warrantyDocumentUrl ? (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono text-slate-700 truncate max-w-xs">
                      {warrantyDocumentName || 'wetzlar_service_cla.pdf'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => triggerDocUpload('warranty')}
                      className="text-xs"
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setWarrantyDocumentUrl(null);
                        setWarrantyDocumentName('');
                      }}
                      className="text-xs text-rose-600"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => triggerDocUpload('warranty')}
                  >
                    Upload Warranty Card (Optional)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-600"
                    onClick={() => {
                      setWarrantyDocumentUrl('/wetzlar_service_cla.pdf');
                      setWarrantyDocumentName('cla_service_certificate.pdf');
                      showToast('Warranty Attached', 'Demo warranty card added.', 'info');
                    }}
                  >
                    Insert Demo Warranty
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 7: Price & Location */}
        {currentStep === 7 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 7: Pricing Strategy & Approximate Location</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set asking price and optional counter-offer boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Asking Price (INR ₹)"
                type="number"
                min={500}
                value={askingPrice}
                onChange={(e) => setAskingPrice(Number(e.target.value))}
                helperText="Total purchase price buyer funds into escrow."
                required
              />

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Negotiation & Counter-Offers
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNegotiable}
                      onChange={(e) => setIsNegotiable(e.target.checked)}
                      className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span>Allow buyers to submit binding purchase offers</span>
                  </label>
                </div>
              </div>
            </div>

            {isNegotiable && (
              <Input
                label="Minimum Acceptable Offer Floor (₹)"
                type="number"
                min={500}
                max={askingPrice}
                value={minOfferAllowed}
                onChange={(e) => setMinOfferAllowed(Number(e.target.value))}
                helperText="Offers below this amount are automatically declined without notifying you."
              />
            )}

            <Input
              label="Seller's Reason for Selling (Optional)"
              placeholder="e.g. Consolidating collection, upgrading to newer hardware..."
              value={reasonForSelling}
              onChange={(e) => setReasonForSelling(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Seller City & State"
                placeholder="e.g. Jaipur, Rajasthan"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Input
                label="Approximate Locality / Area"
                placeholder="e.g. C-Scheme / Malviya Nagar, Jaipur"
                value={approximateLocation}
                onChange={(e) => setApproximateLocation(e.target.value)}
                helperText="Exact street address is never shown. Only public district for pickup estimation."
                required
              />
            </div>
          </div>
        )}

        {/* STEP 8: Delivery Options */}
        {currentStep === 8 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 8: Fulfillment & Handover Channels</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how buyers may receive the item. Both options feature separate delivery confirmation from physical satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Tracked Courier */}
              <div
                onClick={() => {
                  if (deliveryMethods.includes('courier')) {
                    if (deliveryMethods.length > 1) {
                      setDeliveryMethods(deliveryMethods.filter((m) => m !== 'courier'));
                    }
                  } else {
                    setDeliveryMethods([...deliveryMethods, 'courier']);
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethods.includes('courier')
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>1. Insured Courier Delivery</span>
                </div>
                <p className={`text-xs leading-relaxed ${deliveryMethods.includes('courier') ? 'text-slate-300' : 'text-slate-500'}`}>
                  Shiprocket-compatible insured courier dispatch. Requires doorstep signature. Starts buyer's 48h physical inspection clock on scan.
                </p>
              </div>

              {/* Option 2: Direct Handover */}
              <div
                onClick={() => {
                  if (deliveryMethods.includes('direct_handover')) {
                    if (deliveryMethods.length > 1) {
                      setDeliveryMethods(deliveryMethods.filter((m) => m !== 'direct_handover'));
                    }
                  } else {
                    setDeliveryMethods([...deliveryMethods, 'direct_handover']);
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethods.includes('direct_handover')
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>2. Direct Handover with OTP</span>
                </div>
                <p className={`text-xs leading-relaxed ${deliveryMethods.includes('direct_handover') ? 'text-slate-300' : 'text-slate-500'}`}>
                  Meet in public place in {city}. Buyer gives you a 6-digit OTP code to verify handover. Escrow release occurs after 48h hands-on check.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Packaging & Handling Instructions
              </label>
              <textarea
                rows={2}
                value={packagingNotes}
                onChange={(e) => setPackagingNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        )}

        {/* STEP 9: Declaration & Preview */}
        {currentStep === 9 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-slate-900">Step 9: Mandatory Seller Covenants & Review</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Before publishing, confirm your agreement with the ONTRA transparency covenant.
              </p>
            </div>

            {/* 5 Legal Covenants */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                Seller Covenant & Binding Disclosures
              </span>

              <label className="flex items-start gap-3 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={covenants.detailsAccurate}
                  onChange={(e) => setCovenants({ ...covenants, detailsAccurate: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 mt-0.5"
                />
                <span>
                  <strong>1. Accurate Specifications:</strong> I confirm all technical details, model specifications, and provenance notes are truthful and complete.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={covenants.photosActual}
                  onChange={(e) => setCovenants({ ...covenants, photosActual: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 mt-0.5"
                />
                <span>
                  <strong>2. Actual Product Media:</strong> All uploaded photos and video recordings represent the exact physical product currently in my possession, without deceptive filters.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={covenants.defectsDisclosed}
                  onChange={(e) => setCovenants({ ...covenants, defectsDisclosed: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 mt-0.5"
                />
                <span>
                  <strong>3. Full Blemish & Repair Disclosure:</strong> All known scratches, optical flaws, operational quirks, or past replacement parts have been explicitly declared in writing.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={covenants.authorizedOwner}
                  onChange={(e) => setCovenants({ ...covenants, authorizedOwner: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 mt-0.5"
                />
                <span>
                  <strong>4. Legal Authority to Sell:</strong> I am the legal owner of this item and hold unencumbered rights to sell and transfer ownership.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={covenants.policiesAccepted}
                  onChange={(e) => setCovenants({ ...covenants, policiesAccepted: e.target.checked })}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 mt-0.5"
                />
                <span>
                  <strong>5. Escrow & Inspection Covenant:</strong> I accept that payment will be held securely in platform escrow until the buyer's 48-hour physical inspection passes without dispute.
                </span>
              </label>
            </div>

            {/* Preview Banner */}
            <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900 text-xs">Verify Buyer-Facing Presentation</p>
                <p className="text-[11px] text-slate-500">
                  Inspect the live product page mock to ensure all specifications are clear.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewModalOpen(true)}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                Preview Public Listing
              </Button>
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < 9 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNextStep}
                rightIcon={<ChevronRight className="w-4 h-4" />}
                className="bg-slate-900 hover:bg-slate-800 font-semibold"
              >
                Continue to Step {currentStep + 1}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={!allCovenantsChecked}
                onClick={() => handleFinalSubmit(false)}
                className={`font-semibold ${
                  allCovenantsChecked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Publish Verified Listing
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Full Live Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Listing Preview: {brand} {model}
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-4/3 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={photos[0]?.url || MOCK_IMAGES.cameraTable}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = MOCK_IMAGES.cameraTable;
                  }}
                />
              </div>

              <div className="space-y-3 text-xs">
                <span className="text-slate-500 font-bold uppercase">{brand} · {model}</span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{title}</h3>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    {formatCurrency(askingPrice)}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Escrow Protected · 48h Inspection Guaranteed
                  </span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <p><strong>Condition:</strong> {CONDITION_LABELS[condition].label}</p>
                  <p><strong>Location:</strong> {city} ({approximateLocation})</p>
                  <p><strong>Ownership Document:</strong> {documentOption === 'yes_invoice' && invoiceDocumentUrl ? 'Original Invoice Attached' : (documentOption === 'has_supporting_doc' && supportingDocumentUrl ? 'Supporting Record Attached' : 'None / Unavailable')}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900">Declared Condition & Blemish Manifest</h4>
              <p>{defectsAndScratches}</p>
              <h4 className="font-bold text-slate-900 pt-1">Included Accessories</h4>
              <p>{includedAccessories.join(', ')}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setIsPreviewModalOpen(false)}>
                Looks Good · Return to Wizard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
