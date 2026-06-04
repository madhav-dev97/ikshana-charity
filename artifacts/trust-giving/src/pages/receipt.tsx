import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useDonationStore } from "@/store/donation-store";
import { CheckCircle2, Heart, ArrowLeft, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function formatINR(amount?: number) {
  return "₹" + (amount ?? 0).toLocaleString("en-IN");
}

function formatDateString(value?: string | null, dateFormat = "d MMMM yyyy") {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? format(parsed, dateFormat) : "Unknown date";
}

export default function Receipt() {
  const [, setLocation] = useLocation();
  const receipt = useDonationStore((state) => state.latestReceipt);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!receipt) {
      setLocation("/");
    }
    window.scrollTo(0, 0);
  }, [receipt, setLocation]);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 md:py-20 px-4 print:bg-white print:p-0 print:m-0">
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Success Banner — hidden when printing */}
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6 shadow-sm border-2 border-green-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">Thank you for your generosity!</h1>
          <p className="text-muted-foreground text-lg mb-2">Your donation has been processed successfully.</p>
          <p className="text-sm text-muted-foreground">Use the buttons below to print or save your receipt as a PDF.</p>
        </div>

        {/* Action Buttons — hidden when printing */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8 print:hidden">
          <Button
            onClick={handlePrint}
            size="lg"
            className="rounded-xl shadow-md"
          >
            <Download className="w-5 h-5 mr-2" />
            Download / Print Receipt
          </Button>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            size="lg"
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Home
          </Button>
        </div>

        {/* ── PRINTABLE RECEIPT ── */}
        <div
          ref={receiptRef}
          className="receipt-card bg-white border-2 border-primary/20 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:border print:border-gray-300 print:rounded-none"
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-8 text-center relative print:bg-white print:text-black print:border-b-4 print:border-primary">
            <div className="absolute inset-0 opacity-10 pointer-events-none print:hidden">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="rp" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="currentColor" fillOpacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#rp)"/>
              </svg>
            </div>

            {/* Logo row */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-primary-foreground/20 p-2 rounded-full print:border print:border-primary">
                <Heart className="w-8 h-8 fill-current print:text-primary" />
              </div>
            </div>

            <h2 className="text-xs font-bold uppercase tracking-widest mb-1 text-primary-foreground/70 print:text-gray-500">Official Donation Receipt</h2>
            <p className="font-bold text-2xl md:text-3xl tracking-wide print:text-primary">
              IKSHANA CHARITABLE TRUST
            </p>
            <p className="text-primary-foreground/70 text-sm mt-1 italic print:text-gray-500">
              Manava Seve, Madhava Seva
            </p>
            <p className="text-primary-foreground/50 text-xs mt-0.5 print:text-gray-400">
              Trust Reg. No. 242/2023 · Telangana, India
            </p>
          </div>

          {/* Gold stripe */}
          <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary print:h-1 print:bg-primary"></div>

          {/* Body */}
          <div className="p-8 md:p-10 bg-white">

            {/* Receipt No. + Date */}
            <div className="flex flex-col sm:flex-row justify-between mb-8 pb-8 border-b-2 border-dashed border-gray-200 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Receipt No.</p>
                <p className="font-mono text-xl font-bold text-primary">{receipt.receiptNumber}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date of Donation</p>
                <p className="font-semibold text-gray-900">{formatDateString(receipt.donatedAt, "d MMMM yyyy")}</p>
                <p className="text-sm text-gray-500">{formatDateString(receipt.donatedAt, "h:mm a")}</p>
              </div>
            </div>

            {/* Donor */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Received From</p>
              <p className="text-2xl font-serif font-bold text-gray-900">{receipt.donorName}</p>
              <p className="text-gray-500 mt-1 text-sm">{receipt.email}</p>
            </div>

            {/* Cause */}
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Supporting Cause</p>
              <p className="text-xl font-serif font-bold text-gray-900 mb-2">{receipt.causeTitle}</p>
              {receipt.causeDescription && (
                <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-primary/40 pl-3 italic">
                  {receipt.causeDescription.substring(0, 180)}{receipt.causeDescription.length > 180 ? "…" : ""}
                </p>
              )}
            </div>

            {/* Donor message */}
            {receipt.message && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Donor's Message</p>
                <p className="text-gray-700 italic text-sm">"{receipt.message}"</p>
              </div>
            )}

            {/* Amount */}
            <div className="flex justify-between items-center bg-primary text-primary-foreground rounded-2xl p-6 mt-4 print:bg-gray-800 print:text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">Donation Amount</p>
                <p className="text-xs text-primary-foreground/50 mt-0.5">Amount received in full</p>
              </div>
              <p className="text-4xl md:text-5xl font-bold tabular-nums">{formatINR(receipt.amount)}</p>
            </div>

            {/* Footer note */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200 space-y-2 text-center">
              <p className="font-bold text-gray-800 text-base">IKSHANA CHARITABLE TRUST</p>
              <p className="text-xs text-gray-500">Trust Reg. No. 242/2023 · Registered in Telangana, India</p>
              <p className="text-xs text-gray-500 mt-1">
                <strong>Note:</strong> 80G tax exemption application is currently in progress with the Income Tax Department.
                An updated receipt will be issued once approval is received.
              </p>
              <p className="text-xs italic text-gray-400 mt-2">
                No goods or services were provided in exchange for this contribution.
                This is a computer-generated receipt and is valid as proof of donation.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom action hint */}
        <p className="text-center text-xs text-muted-foreground mt-4 print:hidden">
          Tip: Click "Download / Print Receipt" → In the print dialog, choose <strong>Save as PDF</strong> to download a copy.
        </p>
      </div>
    </div>
  );
}
