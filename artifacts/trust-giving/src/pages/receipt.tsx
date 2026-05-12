import { useEffect } from "react";
import { useLocation } from "wouter";
import { useDonationStore } from "@/store/donation-store";
import { CheckCircle2, Heart, ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

export default function Receipt() {
  const [, setLocation] = useLocation();
  const receipt = useDonationStore((state) => state.latestReceipt);

  useEffect(() => {
    if (!receipt) {
      setLocation("/");
    }
    window.scrollTo(0, 0);
  }, [receipt, setLocation]);

  if (!receipt) return null;

  return (
    <div className="min-h-screen bg-muted/30 py-12 md:py-20 px-4 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Success Banner */}
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6 shadow-sm border-2 border-green-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">Thank you for your generosity!</h1>
          <p className="text-muted-foreground text-lg">Your donation has been processed successfully. Here is your official receipt.</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white border-2 border-primary/20 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:border print:rounded-none">

          {/* Header */}
          <div className="bg-primary text-primary-foreground p-8 text-center relative print:bg-white print:text-black print:border-b-2 print:border-primary">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="rp" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="currentColor" fillOpacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#rp)"/>
              </svg>
            </div>
            <Heart className="w-10 h-10 fill-current mx-auto mb-3 print:hidden" />
            <h2 className="text-xl font-bold uppercase tracking-widest mb-1">Official Donation Receipt</h2>
            <p className="font-bold text-xl text-primary-foreground/90 print:text-gray-800">
              IKSHANA CHARITABLE TRUST
            </p>
            <p className="text-primary-foreground/60 text-xs mt-1 print:text-gray-500">
              Manava Seve, Madhava Seva · Registered Charitable Trust · 80G Eligible
            </p>
          </div>

          {/* Color stripe */}
          <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary print:hidden" />

          {/* Body */}
          <div className="p-8 md:p-10 bg-white">
            {/* Receipt meta */}
            <div className="flex flex-col md:flex-row justify-between mb-10 pb-8 border-b-2 border-dashed border-gray-200 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Receipt No.</p>
                <p className="font-mono text-xl font-bold text-primary">{receipt.receiptNumber}</p>
              </div>
              <div className="md:text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                <p className="font-semibold text-gray-900 text-lg">{format(new Date(receipt.donatedAt), "d MMMM yyyy")}</p>
                <p className="text-sm text-gray-500">{format(new Date(receipt.donatedAt), "h:mm a")}</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Donor */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Received From</p>
                <p className="text-2xl font-serif font-bold text-gray-900">{receipt.donorName}</p>
                <p className="text-gray-500 mt-1">{receipt.email}</p>
              </div>

              {/* Cause */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Supporting Cause</p>
                <p className="text-xl font-serif font-bold text-gray-900 mb-2">{receipt.causeTitle}</p>
                {receipt.causeDescription && (
                  <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-primary/40 pl-3 italic">
                    {receipt.causeDescription.substring(0, 180)}{receipt.causeDescription.length > 180 ? '...' : ''}
                  </p>
                )}
              </div>

              {/* Message */}
              {receipt.message && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Donor's Message</p>
                  <p className="text-gray-700 italic text-sm">"{receipt.message}"</p>
                </div>
              )}

              {/* Amount */}
              <div className="bg-primary text-primary-foreground rounded-2xl p-6 flex justify-between items-center print:bg-gray-800">
                <div>
                  <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest">Donation Amount</p>
                  <p className="text-primary-foreground/50 text-xs mt-0.5">Eligible for 80G deduction</p>
                </div>
                <p className="text-4xl md:text-5xl font-bold">{formatINR(receipt.amount)}</p>
              </div>
            </div>

            {/* Tax footer */}
            {receipt.taxExemptStatus && (
              <div className="mt-10 text-center text-sm text-gray-500 pt-6 border-t-2 border-dashed border-gray-200 space-y-1.5">
                <p className="font-bold text-gray-700 text-base">IKSHANA CHARITABLE TRUST</p>
                <p>Registered under the Indian Trusts Act</p>
                <p className="text-gray-600">{receipt.taxExemptStatus}</p>
                <p className="mt-3 text-xs italic text-gray-400">
                  No goods or services were provided in exchange for this contribution.
                  This receipt is valid for Income Tax purposes under Section 80G.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 print:hidden">
          <Button onClick={() => window.print()} variant="outline" size="lg" className="rounded-xl bg-white">
            <Printer className="w-5 h-5 mr-2" />
            Print Receipt
          </Button>
          <Button onClick={() => setLocation("/")} size="lg" className="rounded-xl">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Home
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4 print:hidden">
          A copy of this receipt has been sent to your email address.
        </p>
      </div>
    </div>
  );
}
