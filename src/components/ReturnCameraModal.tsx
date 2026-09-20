import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, Upload, MapPin, FileText, AlertCircle, ShieldCheck, X } from 'lucide-react';
import { Item, User, ReturnRecord } from '../types';

interface ReturnCameraModalProps {
  isOpen?: boolean;
  onClose: () => void;
  foundItem: Item;
  lostItem?: Item;
  currentUser?: User | null;
  onRecordSaved?: (record: ReturnRecord, updatedItems: Item[]) => void;
  onSaveRecord?: (recordData: any) => Promise<any>;
}

export const ReturnCameraModal: React.FC<ReturnCameraModalProps> = ({
  isOpen = true,
  onClose,
  foundItem,
  lostItem,
  currentUser,
  onRecordSaved,
  onSaveRecord
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [handoverLocation, setHandoverLocation] = useState<string>(foundItem.location || 'Campus Center Info Desk');
  const [successRecord, setSuccessRecord] = useState<ReturnRecord | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage && !successRecord) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, capturedImage, successRecord]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this device/browser.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('[Camera] Could not access live camera:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission was denied. You can still upload a handover proof photo below.'
          : 'Live camera stream is unavailable. You can upload a photo directly.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      // Watermark / timestamp
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(10, height - 42, width - 20, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(
        `SafeReturn Proof: ${foundItem.name} | ${new Date().toLocaleString()}`,
        20,
        height - 22
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
    setIsCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedImage(reader.result);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setSuccessRecord(null);
    startCamera();
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleSaveRecord = async () => {
    if (!capturedImage) return;

    setIsSaving(true);
    try {
      const recordPayload = {
        photoUrl: capturedImage,
        itemName: foundItem.name,
        itemDescription: foundItem.description,
        itemCategory: foundItem.category,
        itemType: foundItem.itemType,
        foundItemId: foundItem.id,
        foundItemName: foundItem.name,
        lostItemId: lostItem ? lostItem.id : undefined,
        lostItemName: lostItem ? lostItem.name : undefined,
        finderId: currentUser?.id || foundItem.reporterId,
        finderName: currentUser?.name || foundItem.reporterName,
        finderEmail: currentUser?.email || foundItem.reporterEmail,
        finderPhone: currentUser?.phone || foundItem.reporterPhone,
        ownerId: lostItem ? lostItem.reporterId : undefined,
        ownerName: lostItem ? lostItem.reporterName : 'Registered Owner',
        ownerEmail: lostItem ? lostItem.reporterEmail : undefined,
        ownerPhone: lostItem ? lostItem.reporterPhone : undefined,
        returnedDate: new Date().toISOString(),
        location: handoverLocation,
        notes: notes.trim()
      };

      if (onSaveRecord) {
        const saved = await onSaveRecord(recordPayload);
        if (saved) {
          setSuccessRecord(saved);
        }
      } else {
        const res = await fetch('/api/return-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recordPayload)
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to save return record');
        }

        setSuccessRecord(data.record);
        if (onRecordSaved) {
          onRecordSaved(data.record, data.updatedItems || []);
        }
      }
    } catch (err: any) {
      console.error('[Return Record] Error saving record:', err);
      alert(`Error saving return record: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Return Proof Photo</h2>
              <p className="text-xs text-slate-400">Mandatory proof of physical item handover</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cancel and close camera"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Mandatory Instruction Banner */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-1">
            <p className="text-xs font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>Return Proof Photo Instruction</span>
            </p>
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
              Take a photo showing the item you returned and the person you returned it to.
            </p>
            <p className="text-[11px] text-amber-700/90 dark:text-amber-500/90">
              The purpose of this photo is to provide proof that the finder actually returned the physical item to the rightful owner.
            </p>
          </div>

          {/* Linked Item Summary Badge */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Item Being Returned</span>
              <p className="text-sm font-bold text-slate-900">{foundItem.name} {foundItem.itemType ? `(${foundItem.itemType})` : ''}</p>
              <p className="text-xs text-slate-500 truncate max-w-sm">
                Category: <span className="font-medium text-slate-700">{foundItem.category}</span> • Found at: <span className="font-medium text-slate-700">{foundItem.location || 'Campus'}</span>
              </p>
            </div>
            {lostItem && (
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="h-3 w-3" /> Matched Owner
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-1">{lostItem.reporterName}</p>
              </div>
            )}
          </div>

          {/* Success Recorded View */}
          {successRecord ? (
            <div className="text-center py-6 px-4 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Record Saved & Verified
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">Official Return Record Logged</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  The handover photo and metadata have been recorded into the database under Record ID:
                </p>
                <p className="text-base font-mono font-black text-blue-700 bg-blue-50 py-1.5 px-4 rounded-lg inline-block mt-2 border border-blue-200">
                  {successRecord.id}
                </p>
              </div>

              <div className="max-w-xs mx-auto rounded-xl overflow-hidden border border-slate-200 shadow-sm mt-4">
                <img
                  src={successRecord.photoUrl}
                  alt="Proof of return"
                  className="w-full h-40 object-cover"
                />
              </div>

              <p className="text-xs text-emerald-700 font-semibold">
                ✓ Both Found and Lost posts are now synchronized to "Returned" status.
              </p>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Camera Stream / Image Preview Container */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
                {capturedImage ? (
                  // Captured Photo Preview
                  <div className="relative w-full h-full">
                    <img
                      src={capturedImage}
                      alt="Captured handover proof"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1.5 shadow">
                      <CheckCircle className="h-3.5 w-3.5" /> Return Photo Captured
                    </div>
                  </div>
                ) : stream ? (
                  // Live Camera Stream
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Viewfinder Target Overlay */}
                    <div className="absolute inset-4 border-2 border-dashed border-white/50 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <span className="text-[10px] font-bold tracking-wider text-white/90 uppercase bg-black/60 px-2 py-0.5 rounded w-max backdrop-blur-sm">
                        Handover Alignment
                      </span>
                      <p className="text-center text-xs font-bold text-white drop-shadow-md bg-black/50 py-1 px-3 rounded-lg backdrop-blur-sm mx-auto">
                        Show the returned item & the recipient in frame
                      </p>
                    </div>

                    {/* Camera Switcher Button */}
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="absolute top-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl backdrop-blur-sm border border-slate-700 transition-colors"
                      title="Flip camera"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  // Camera Error / Fallback View
                  <div className="p-6 text-center text-slate-300 space-y-3">
                    <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
                    <p className="text-xs text-slate-300 max-w-sm">
                      {cameraError || 'Loading live camera device...'}
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow"
                    >
                      <Upload className="h-4 w-4" /> Upload Handover Photo
                    </button>
                  </div>
                )}

                {/* Hidden Canvas for snapshot extraction */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Action Buttons: Take Photo or Retake */}
              <div className="flex items-center gap-3">
                {!capturedImage ? (
                  <>
                    <button
                      type="button"
                      disabled={!stream || isCapturing}
                      onClick={handleCapture}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Take Return Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-3 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload Photo</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Retake Photo</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Metadata Inputs & Confirm & Record Action after Photo Captured */}
              {capturedImage && (
                <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                  <div>
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> Handover Location
                    </label>
                    <input
                      type="text"
                      value={handoverLocation}
                      onChange={(e) => setHandoverLocation(e.target.value)}
                      placeholder="e.g. Campus Information Desk, Library Entrance"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" /> Return Notes & Verification Details (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Verified owner identity with student ID. Item returned intact."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Submit Record Action: Confirm & Record */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSaving || !capturedImage}
                      onClick={handleSaveRecord}
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Saving Official Record to Database...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Confirm & Record</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-1.5">
                      Only clicking "Confirm & Record" will mark the item as Returned in the database.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};

export default ReturnCameraModal;
