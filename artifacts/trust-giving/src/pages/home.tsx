import { useGetCurrentCause, useGetStatsSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Heart, ArrowRight, Users, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import heroBg from "@/assets/images/hero-bg.png";

function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

export default function Home() {
  const { data: currentCause, isLoading: loadingCause } = useGetCurrentCause();
  const { data: stats, isLoading: loadingStats } = useGetStatsSummary();

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Ikshana Charitable Trust"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
        </div>

        <div className="container relative z-10 px-4 py-24 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground border border-primary mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both shadow-lg">
            <Heart className="w-4 h-4 fill-current animate-pulse" />
            <span className="text-sm font-semibold">Ikshana Charitable Trust — Seva, Samarpan, Sewa</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground max-w-4xl tracking-tight leading-[1.1] mb-6 animate-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both drop-shadow-sm">
            Ek kadam aage,<br />
            <span className="text-primary italic">hazaar zindagiyan badlen.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            Join thousands across India supporting one meaningful cause every month.
            Together, our small acts of kindness create monumental, lasting change.
          </p>

          {/* Current Cause Highlight Card */}
          <div className="w-full max-w-3xl bg-card/95 backdrop-blur-md border-2 border-primary/20 rounded-2xl shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom-10 duration-700 delay-500 fill-mode-both text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block w-3 h-3 rounded-full bg-primary animate-pulse"></span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">Is Maah Ka Cause</h2>
            </div>

            {loadingCause ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="pt-4">
                  <Skeleton className="h-2 w-full mb-2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              </div>
            ) : currentCause ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2">{currentCause.title}</h3>
                  <p className="text-muted-foreground line-clamp-2 md:line-clamp-3">
                    {currentCause.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {formatINR(currentCause.raisedAmount)}
                      </span>
                      <span className="text-sm text-muted-foreground">raised</span>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground text-right">
                      Goal: {formatINR(currentCause.goalAmount)}
                    </div>
                  </div>
                  <Progress
                    value={Math.min((currentCause.raisedAmount / currentCause.goalAmount) * 100, 100)}
                    className="h-3 rounded-full bg-secondary/20"
                    indicatorClassName="bg-primary"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-4">
                  <Link href="/donate" className="flex-1">
                    <Button size="lg" className="w-full rounded-xl text-lg h-14 shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90">
                      Abhi Donate Karein <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/causes" className="flex-1">
                    <Button size="lg" variant="outline" className="w-full rounded-xl text-lg h-14 bg-transparent hover:bg-muted/50 border-primary/40 text-primary">
                      Aur Jaanein
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>Is maah koi active cause nahi hai.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-primary-foreground">Hamara Samuhik Prabhav</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">Every rupee donated is a step towards a better India. We believe in complete transparency and celebrate our community's generosity together.</p>
          </div>

          {loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-8 rounded-2xl bg-primary-foreground/10 flex flex-col items-center justify-center h-48">
                  <Skeleton className="h-12 w-32 mb-4 bg-primary-foreground/20" />
                  <Skeleton className="h-4 w-24 bg-primary-foreground/20" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="p-8 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex flex-col items-center justify-center text-center group hover:bg-primary-foreground/20 transition-all">
                <div className="bg-primary-foreground/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-primary-foreground">
                  {formatINR(stats.totalRaised)}
                </h3>
                <p className="text-primary-foreground/70 font-medium uppercase tracking-widest text-sm">Kul Sangraha</p>
              </div>
              <div className="p-8 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex flex-col items-center justify-center text-center group hover:bg-primary-foreground/20 transition-all">
                <div className="bg-primary-foreground/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-primary-foreground">
                  {stats.totalDonors.toLocaleString("en-IN")}
                </h3>
                <p className="text-primary-foreground/70 font-medium uppercase tracking-widest text-sm">Daan Karta</p>
              </div>
              <div className="p-8 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex flex-col items-center justify-center text-center group hover:bg-primary-foreground/20 transition-all">
                <div className="bg-primary-foreground/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-primary-foreground">
                  {stats.activeCauses || 6}
                </h3>
                <p className="text-primary-foreground/70 font-medium uppercase tracking-widest text-sm">Causes Supported</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Trust Message */}
      <section className="py-24 bg-card">
        <div className="container px-4 max-w-4xl text-center">
          <div className="w-16 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
          <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-8">
            "Wo jo deta hai, woh pata hai jeevan ka sachcha arth."
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Ikshana Charitable Trust follows a simple principle: each month, we focus the community's collective energy on one carefully vetted cause. No scattered efforts, no hidden overhead — just pure, concentrated impact where it matters most, right here in India.
          </p>
          <p className="text-sm text-muted-foreground mb-10">
            Registered Charitable Trust | 80G Tax Exemption Eligible | FCRA Compliant
          </p>
          <Link href="/donors">
            <Button variant="outline" size="lg" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
              Donor Wall Dekhein
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
