import { useListDonors, useGetStatsSummary } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Heart, Quote, UserRound, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function Donors() {
  const { data: donors, isLoading } = useListDonors();
  const { data: stats } = useGetStatsSummary();

  const sortedDonors = donors ? [...donors].sort((a, b) => {
    // Sort by amount descending
    return b.amount - a.amount;
  }) : [];

  return (
    <div className="min-h-screen bg-muted/30 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-card border-b pt-20 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
        <div className="container max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/10 text-secondary-foreground rounded-full mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">The Donor Wall</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            A celebration of generosity. This wall stands as a testament to the kindness of our community. 
            Every gift, regardless of size, ripples outward to create profound change.
          </p>
          
          {stats && (
            <div className="mt-12 inline-flex items-center gap-6 px-6 py-3 rounded-full bg-background border shadow-sm">
              <div className="text-center">
                <span className="block text-2xl font-bold text-primary">{stats.totalDonors.toLocaleString()}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Donors</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-center">
                <span className="block text-2xl font-bold text-primary">${stats.totalRaised.toLocaleString()}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Contributed</span>
              </div>
            </div>
          )}
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
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {sortedDonors.map((donor, idx) => (
              <div 
                key={donor.id} 
                className="break-inside-avoid animate-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${Math.min(idx * 50, 1000)}ms` }}
              >
                <Card className="rounded-2xl border-border/60 shadow-sm hover:shadow-md transition-shadow bg-card h-full">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${donor.isAnonymous ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                          {donor.isAnonymous ? <UserRound className="w-6 h-6" /> : <span className="font-serif text-xl font-bold">{donor.name.charAt(0)}</span>}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg leading-tight">
                            {donor.isAnonymous ? "Anonymous Friend" : donor.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <span className="text-secondary-foreground font-bold">${donor.amount.toLocaleString()}</span>
                            <span>•</span>
                            <span>{donor.causeTitle}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {donor.message && (
                      <div className="mt-4 pt-4 border-t border-border/40 relative">
                        <Quote className="absolute -top-3 -left-1 w-6 h-6 text-muted-foreground/20 rotate-180 bg-card px-1" />
                        <p className="text-muted-foreground italic text-sm leading-relaxed relative z-10 pl-2">
                          "{donor.message}"
                        </p>
                      </div>
                    )}
                    
                    {donor.donatedAt && (
                      <div className="mt-4 text-[10px] text-muted-foreground/70 text-right uppercase tracking-wider">
                        {format(new Date(donor.donatedAt), "MMM d, yyyy")}
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