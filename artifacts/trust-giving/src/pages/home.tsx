import { useGetCurrentCause, useGetStatsSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Heart, ArrowRight, Users, Target, Activity, ShieldCheck } from "lucide-react";
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
      <section className="relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="IKSHANA CHARITABLE TRUST"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-background/95" />
        </div>

        <div className="container relative z-10 px-4 pt-20 pb-16 md:pt-28 md:pb-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both shadow-lg">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold tracking-wide">IKSHANA CHARITABLE TRUST</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white max-w-4xl tracking-tight leading-[1.1] mb-4 animate-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both drop-shadow-lg">
            Manava Seve,<br />
            <span className="text-secondary italic">Madhava Seva.</span>
          </h1>

          <p className="text-base md:text-lg text-white/80 max-w-xl mb-3 animate-in slide-in-from-bottom-7 duration-700 delay-250 fill-mode-both font-medium">
            Service to Man is Service to God.
          </p>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-10 leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            Join thousands across India supporting one meaningful cause every month.
            Together, small acts of giving create lasting, monumental change.
          </p>

          {/* Current Cause Highlight Card */}
          <div className="w-full max-w-3xl bg-card/95 backdrop-blur-md border-2 border-primary/25 rounded-2xl shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom-10 duration-700 delay-500 fill-mode-both text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary">This Month's Cause</h2>
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
                    <div className="text-sm font-medium text-muted-foreground">
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
                    <Button size="lg" className="w-full rounded-xl text-lg h-14 shadow-lg hover:shadow-xl transition-all">
                      Donate Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/causes" className="flex-1">
                    <Button size="lg" variant="outline" className="w-full rounded-xl text-lg h-14 border-primary/40 text-primary hover:bg-primary/5">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No active cause this month. Check back soon.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Collective Impact</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Every rupee donated is a step towards a better India. We believe in complete transparency and celebrate our community's generosity together.
            </p>
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
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-2">{formatINR(stats.totalRaised)}</h3>
                <p className="text-primary-foreground/70 font-medium uppercase tracking-widest text-sm">Total Raised</p>
              </div>
              <div className="p-8 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex flex-col items-center justify-center text-center group hover:bg-primary-foreground/20 transition-all">
                <div className="bg-primary-foreground/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-2">{stats.totalDonors.toLocaleString("en-IN")}</h3>
                <p className="text-primary-foreground/70 font-medium uppercase tracking-widest text-sm">Donors</p>
              </div>
              <div className="p-8 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 flex flex-col items-center justify-center text-center group hover:bg-primary-foreground/20 transition-all">
                <div className="bg-primary-foreground/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-2">{stats.activeCauses || 6}</h3>
                <p className="text-primary-foreground/70 font-medium uppercase tracking-widest text-sm">Causes Supported</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-card">
        <div className="container px-4 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-12 h-1 bg-primary mb-6 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                Why IKSHANA CHARITABLE TRUST?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We operate on a simple, powerful principle — every month, we focus the entire community's energy on one carefully vetted cause. No scattered efforts, no opaque overhead. Just concentrated, transparent impact where it's needed most.
              </p>
              <Link href="/donors">
                <Button variant="outline" size="lg" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                  See the Donor Wall
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: "100% Transparent", desc: "Every rupee accounted for. Full financial disclosure every month." },
                { icon: Heart, title: "80G Tax Benefit", desc: "All donations eligible for tax exemption under Section 80G of the IT Act." },
                { icon: Target, title: "One Cause at a Time", desc: "Focused giving means deeper impact. One vetted cause, every month." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4 p-4 rounded-xl border bg-background hover:border-primary/30 transition-colors">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
