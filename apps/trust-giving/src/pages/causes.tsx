import { useListCauses } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, Target, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import defaultImageUrl from "@/assets/images/cause-edu.png";

function formatINR(amount?: number) {
  return "₹" + (amount ?? 0).toLocaleString("en-IN");
}

function formatCauseDate(year?: number, month?: number) {
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedMonth)) {
    return "Unknown month";
  }

  const date = new Date(parsedYear, parsedMonth - 1);
  if (!Number.isFinite(date.getTime())) {
    return "Unknown month";
  }

  return format(date, "MMMM yyyy");
}

function normalizeCauseYear(cause: { year?: number }) {
  return Number.isFinite(Number(cause.year)) ? cause.year : 0;
}

function normalizeCauseMonth(cause: { month?: number }) {
  return Number.isFinite(Number(cause.month)) ? cause.month : 0;
}

export default function Causes() {
  const { data: causes, isLoading, error } = useListCauses();

  const sortedCauses = causes ? [...causes].sort((a, b) => {
    const yearA = normalizeCauseYear(a);
    const yearB = normalizeCauseYear(b);
    if (yearB !== yearA) return yearB - yearA;

    const monthA = normalizeCauseMonth(a);
    const monthB = normalizeCauseMonth(b);
    return monthB - monthA;
  }) : [];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16 md:py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <p className="text-primary-foreground/70 text-sm font-semibold uppercase tracking-widest mb-3">IKSHANA CHARITABLE TRUST</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Monthly Causes</h1>
          <p className="text-xl text-primary-foreground/80 leading-relaxed max-w-2xl">
            Every month we focus our collective energy on a single, carefully vetted cause.
            Explore the history of our community's impact across India.
          </p>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-12 md:py-16">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col gap-4 p-5 rounded-2xl border bg-card">
                <Skeleton className="h-48 w-full rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to load causes. Please try again later.</AlertDescription>
          </Alert>
        )}

        {sortedCauses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedCauses.map((cause) => {
              const dateLabel = formatCauseDate(cause.year, cause.month);
              const isCurrent = cause.isCurrent;
              const progress = Math.min((cause.raisedAmount / cause.goalAmount) * 100, 100);
              const isFunded = cause.raisedAmount >= cause.goalAmount;

              return (
                <div
                  key={cause.id}
                  className={`group flex flex-col rounded-2xl border bg-card shadow-sm hover:shadow-xl transition-all overflow-hidden ${
                    isCurrent ? 'ring-2 ring-primary border-transparent' : ''
                  }`}
                >
                  <div className="relative h-56 overflow-hidden bg-muted">
                    <img
                      src={cause.imageUrl || defaultImageUrl}
                      alt={cause.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = defaultImageUrl;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                    <div className="absolute top-4 right-4 flex gap-2">
                      {isCurrent && (
                        <Badge className="bg-primary hover:bg-primary text-primary-foreground font-semibold px-3 shadow-md">
                          Active This Month
                        </Badge>
                      )}
                      {isFunded && !isCurrent && (
                        <Badge className="bg-green-600 hover:bg-green-600 text-white font-semibold px-3 shadow-md">
                          Fully Funded
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <Badge variant="outline" className="text-white border-white/40 bg-black/40 backdrop-blur-md">
                        {cause.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                      <Calendar className="w-4 h-4" />
                      {dateLabel}
                    </div>

                    <h3 className="text-xl font-serif font-bold mb-3 line-clamp-2">{cause.title}</h3>
                    <p className="text-muted-foreground text-sm flex-1 line-clamp-3 mb-6">
                      {cause.description}
                    </p>

                    <div className="space-y-4 mt-auto">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-primary">{formatINR(cause.raisedAmount)} raised</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Target className="w-3 h-3" /> {formatINR(cause.goalAmount)}
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-2.5 rounded-full bg-secondary/20"
                          indicatorClassName={isFunded ? "bg-green-500" : "bg-primary"}
                        />
                        <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}% funded</p>
                      </div>

                      {isCurrent ? (
                        <Link href="/donate" className="block w-full">
                          <Button className="w-full rounded-xl">
                            Donate Now <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      ) : (
                        cause.impact && (
                          <div className="pt-2 border-t text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Impact: </span>
                            {cause.impact}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && !error && sortedCauses.length === 0 && (
          <div className="text-center py-20 bg-muted/50 rounded-2xl border border-dashed">
            <p className="text-muted-foreground">No causes found. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
