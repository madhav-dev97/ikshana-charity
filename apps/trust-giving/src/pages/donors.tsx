import { useListDonors, useGetStatsSummary } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Heart, Quote, UserRound, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function formatINR(amount?: number) {
  return "₹" + (amount ?? 0).toLocaleString("en-IN");
}

function formatDateString(value?: string | null, dateFormat = "d MMM yyyy") {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? format(parsed, dateFormat) : "Unknown date";
}

export default function Donors() {
  const { data: donors, isLoading } = useListDonors();
  const { data: stats } = useGetStatsSummary();

  const totalDonors = stats?.totalDonors ?? 0;
  const totalRaised = stats?.totalRaised ?? 0;
  const sortedDonors = donors ? [...donors].sort((a, b) => b.amount - a.amount) : [];

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary/70 pt-20 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="15" cy="15" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="container max-w-4xl mx-auto text-center relative z-10">
          <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mb-4">IKSHANA CHARITABLE TRUST</p>
          <div className="inline-flex items-center justify-center p-3 bg-primary-foreground/20 text-primary-foreground rounded-full mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-primary-foreground">The Donor Wall</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed max-w-2xl mx-auto">
            A celebration of generosity. This wall stands as a testament to the kindness of our community.
            Every gift, regardless of size, creates profound and lasting change.
          </p>

          <div className="mt-12 inline-flex items-center gap-8 px-8 py-4 rounded-full bg-primary-foreground/20 border border-primary-foreground/30 backdrop-blur-sm shadow-xl">
            <div className="text-center">
              <span className="block text-3xl font-bold text-primary-foreground">{totalDonors.toLocaleString("en-IN")}</span>
              <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-medium">Donors</span>
            </div>
            <div className="w-px h-10 bg-primary-foreground/30"></div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-primary-foreground">{formatINR(totalRaised)}</span>
              <span className="text-xs uppercase tracking-wider text-primary-foreground/70 font-medium">Total Contributed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 mt-16 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <Card key={i} className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {sortedDonors.map((donor, idx) => (
              <div
                key={donor.id}
                className="break-inside-avoid mb-6 animate-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${Math.min(idx * 50, 1000)}ms` }}
              >
                <Card className="rounded-2xl border-border/60 shadow-sm hover:shadow-lg transition-all bg-card h-full hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg shrink-0 ${
                        donor.isAnonymous
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {donor.isAnonymous ? (
                          <UserRound className="w-5 h-5" />
                        ) : (
                          <span className="font-serif">{donor.name?.charAt(0) || "?"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base leading-tight truncate">
                          {donor.isAnonymous ? "Anonymous Donor" : donor.name || "Unnamed Donor"}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium mt-0.5 flex-wrap">
                          <span className="text-primary font-bold text-sm">{formatINR(donor.amount)}</span>
                          <span>·</span>
                          <span className="truncate max-w-[130px]">{donor.causeTitle}</span>
                        </div>
                      </div>
                    </div>

                    {donor.message && (
                      <div className="mt-3 pt-3 border-t border-border/40 relative">
                        <Quote className="absolute -top-2.5 left-1 w-5 h-5 text-primary/20 rotate-180 bg-card" />
                        <p className="text-muted-foreground italic text-sm leading-relaxed pl-2">
                          "{donor.message}"
                        </p>
                      </div>
                    )}

                    {donor.donatedAt && (
                      <div className="mt-3 text-[10px] text-muted-foreground/60 text-right uppercase tracking-wider">
                        {formatDateString(donor.donatedAt, "d MMM yyyy")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {!isLoading && sortedDonors.length === 0 && (
          <div className="text-center py-32 bg-card rounded-3xl border shadow-sm">
            <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-medium mb-2">The wall is waiting</h3>
            <p className="text-muted-foreground">Be the first to add your generosity to our wall.</p>
          </div>
        )}
      </div>
    </div>
  );
}
