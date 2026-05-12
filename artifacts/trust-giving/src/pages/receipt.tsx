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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 md:py-20 px-4 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Success Message */}
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6 shadow-sm border-2 border-green-300">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">Dhanyavaad! Aapka daan safal raha.</h1>
          <p className="text-lg text-muted-foreground">Aapka yogdan successfully process ho gaya hai. Neeche aapki official receipt hai.</p>
        </div>

        {/* Printable Receipt Card */}
        <div className="bg-white border-2 border-primary/20 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:border print:border-gray-300 print:rounded-none">

          {/* Receipt Header */}
          <div className="bg-primary text-primary-foreground p-8 text-center relative print:bg-white print:text-black print:border-b-2 print:border-primary">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M0 40L40 0H20L0 20M40 40V20L20 40" fill="currentColor" fillOpacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pattern)"/>
              </svg>
            </div>

            <Heart className="w-12 h-12 fill-current mx-auto mb-4 print:hidden" />
            <h2 className="text-2xl font-serif font-bold tracking-wider uppercase mb-1">Official Daan Receipt</h2>
            <p className="text-primary-foreground/80 font-semibold text-lg print:text-gray-700">
              {receipt.trustName || "IKSHANA CHARITABLE TRUST"}
            </p>
            <p className="text-primary-foreground/60 text-sm mt-1 print:text-gray-500">
              Registered Charitable Trust | 80G Eligible
            </p>
          </div>

          {/* Saffron border stripe */}
          <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-secondary print:hidden" />

          {/* Receipt Body */}
          <div className="p-8 md:p-10 bg-white">
            <div className="flex flex-col md:flex-row justify-between mb-10 pb-10 border-b-2 border-dashed border-gray-200 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Receipt No.</p>
                <p className="font-mono text-xl font-bold text-primary">{receipt.receiptNumber}</p>
              </div>
              <div className="md:text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Daan Ki Taareekh</p>
                <p className="font-medium text-gray-900 text-lg">{format(new Date(receipt.donatedAt), "d MMMM yyyy")}</p>
                <p className="text-sm text-gray-500">{format(new Date(receipt.donatedAt), "h:mm a")}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Daani Ka Naam</p>
                <p className="text-2xl font-serif font-bold text-gray-900">{receipt.donorName}</p>
                <p className="text-gray-600 mt-1">{receipt.email}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Jiski Madad Ki Gayi</p>
                <p className="text-xl font-serif font-bold text-gray-900 mb-2">{receipt.causeTitle}</p>
                {receipt.causeDescription && (
                  <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-primary/40 pl-3 italic">
                    {receipt.causeDescription.substring(0, 200)}{receipt.causeDescription.length > 200 ? '...' : ''}
                  </p>
                )}
              </div>

              {receipt.message && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Aapka Sandesh</p>
                  <p className="text-gray-700 italic">"{receipt.message}"</p>
                </div>
              )}

              <div className="bg-primary text-primary-foreground rounded-2xl p-6 flex justify-between items-center mt-8 print:bg-gray-800 print:text-white">
                <div>
                  <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider">Daan Ki Raashi</p>
                  <p className="text-xs text-primary-foreground/50 mt-0.5">80G ke liye yogya</p>
                </div>
                <p className="text-4xl md:text-5xl font-bold">{formatINR(receipt.amount)}</p>
              </div>
            </div>

            {/* Tax info */}
            {receipt.taxExemptStatus && (
              <div className="mt-10 text-center text-sm text-gray-500 pt-6 border-t-2 border-dashed border-gray-200 space-y-2">
                <p className="font-semibold text-gray-700 text-base">{receipt.trustName || "IKSHANA CHARITABLE TRUST"}</p>
                <p className="text-gray-500">Registered under the Indian Trusts Act</p>
                <p className="mt-2 text-gray-600">{receipt.taxExemptStatus}</p>
                <p className="mt-3 italic text-xs text-gray-400">
                  Is daan ke badle mein koi vastu ya seva nahi di gayi hai.
                  This receipt is valid for Income Tax purposes under Section 80G.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 print:hidden">
          <Button onClick={handlePrint} variant="outline" size="lg" className="rounded-xl shadow-sm bg-white hover:bg-gray-50 text-gray-700 border-gray-300">
            <Printer className="w-5 h-5 mr-2" />
            Receipt Print Karein
          </Button>
          <Button onClick={() => setLocation("/")} size="lg" className="rounded-xl shadow-sm bg-primary hover:bg-primary/90">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Home Par Jaayein
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 print:hidden">
          Aapki receipt aapke email par bhi bhej di gayi hai.
        </p>
      </div>
    </div>
  );
}
