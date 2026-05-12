import { useEffect } from "react";
import { useLocation } from "wouter";
import { useDonationStore } from "@/store/donation-store";
import { CheckCircle2, Download, Heart, ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Receipt() {
  const [, setLocation] = useLocation();
  const receipt = useDonationStore((state) => state.latestReceipt);

  useEffect(() => {
    // If no receipt is in store, redirect to home
    if (!receipt) {
      setLocation("/");
    }
    
    // Optional: could scroll to top on mount
    window.scrollTo(0, 0);
  }, [receipt, setLocation]);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 md:py-20 px-4 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Success Message - Hidden on print */}
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6 shadow-sm border border-green-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">Thank you for your generosity!</h1>
          <p className="text-lg text-muted-foreground">Your donation has been processed successfully.</p>
        </div>

        {/* Printable Receipt Card */}
        <div className="bg-card border shadow-xl rounded-2xl overflow-hidden print:shadow-none print:border-none print:rounded-none">
          {/* Receipt Header */}
          <div className="bg-primary text-primary-foreground p-8 text-center relative print:bg-white print:text-black print:border-b-2 print:border-gray-800">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="currentColor" fillOpacity="0.2"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pattern)"/>
              </svg>
            </div>
            
            <Heart className="w-12 h-12 fill-current mx-auto mb-4 print:hidden" />
            <h2 className="text-2xl font-serif font-bold tracking-wider uppercase mb-1">Official Receipt</h2>
            <p className="text-primary-foreground/80 font-medium print:text-gray-600">{receipt.trustName || "Seva Trust"}</p>
          </div>

          {/* Receipt Body */}
          <div className="p-8 md:p-10 bg-white">
            <div className="flex flex-col md:flex-row justify-between mb-10 pb-10 border-b border-dashed border-gray-300 gap-6">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Receipt No.</p>
                <p className="font-mono text-lg font-medium text-gray-900">{receipt.receiptNumber}</p>
              </div>
              <div className="md:text-right">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <p className="font-medium text-gray-900">{format(new Date(receipt.donatedAt), "MMMM d, yyyy 'at' h:mm a")}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Received From</p>
                <p className="text-xl font-medium text-gray-900">{receipt.donorName}</p>
                <p className="text-gray-600">{receipt.email}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Supporting Cause</p>
                <p className="text-xl font-serif font-bold text-gray-900 mb-1">{receipt.causeTitle}</p>
                {receipt.causeDescription && (
                  <p className="text-sm text-gray-600 leading-relaxed border-l-2 border-gray-200 pl-3 italic">
                    {receipt.causeDescription}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-6 flex justify-between items-center mt-8 border border-gray-100">
                <p className="text-lg font-bold text-gray-700 uppercase tracking-wider">Donation Amount</p>
                <p className="text-4xl font-bold text-gray-900">${receipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Tax info */}
            {receipt.taxExemptStatus && (
              <div className="mt-10 text-center text-sm text-gray-500 pt-6 border-t border-gray-100">
                <p className="font-medium">{receipt.trustName || "Seva Trust"} is a registered non-profit organization.</p>
                <p className="mt-1">{receipt.taxExemptStatus}</p>
                <p className="mt-4 italic">No goods or services were provided in exchange for this contribution.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Hidden on print */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 print:hidden">
          <Button onClick={handlePrint} variant="outline" size="lg" className="rounded-xl shadow-sm bg-white hover:bg-gray-50 text-gray-700 border-gray-300">
            <Printer className="w-5 h-5 mr-2" />
            Print Receipt
          </Button>
          <Button onClick={() => setLocation("/")} size="lg" className="rounded-xl shadow-sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}