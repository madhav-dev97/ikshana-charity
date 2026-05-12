import { useGetCurrentCause, useGetStatsSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Heart, ArrowRight, TrendingUp, Users, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import heroBg from "@/assets/images/hero-bg.png";

export default function Home() {
  const { data: currentCause, isLoading: loadingCause } = useGetCurrentCause();
  const { data: stats, isLoading: loadingStats } = useGetStatsSummary();

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Warm sunlight through stained glass" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
        </div>

        <div className="container relative z-10 px-4 py-24 md:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 animate-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both">
            <Heart className="w-4 h-4 fill-current animate-pulse" />
            <span className="text-sm font-medium">Seva Trust — A Sanctuary of Purpose</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground max-w-4xl tracking-tight leading-[1.1] mb-6 animate-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both drop-shadow-sm">
            Collective action <br/>
            <span className="text-primary italic">changes lives.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
            Join our community in supporting one meaningful cause every month. 
            Together, small acts of kindness create monumental impact.
          </p>

          {/* Current Cause Highlight Card */}
          <div className="w-full max-w-3xl bg-card/90 backdrop-blur-md border rounded-2xl shadow-xl p-6 md:p-8 animate-in slide-in-from-bottom-10 duration-700 delay-500 fill-mode-both text-left">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">This Month's Cause</h2>
            
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
                        ${currentCause.raisedAmount.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">raised</span>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground text-right">
                      Goal: ${currentCause.goalAmount.toLocaleString()}
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
                  <Link href={`/causes`} className="flex-1">
                    <Button size="lg" variant="outline" className="w-full rounded-xl text-lg h-14 bg-transparent hover:bg-muted/50">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No active cause for this month.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Collective Impact</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every contribution is a testament to what we can achieve together. We believe in total transparency and shared celebration of our community's generosity.</p>
          </div>

          {loadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-8 rounded-2xl bg-card border shadow-sm flex flex-col items-center justify-center h-48">
                  <Skeleton className="h-12 w-32 mb-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="p-8 rounded-2xl bg-card border shadow-sm flex flex-col items-center justify-center text-center hover-elevate transition-all group">
                <div className="bg-primary/10 p-4 rounded-full mb-4 text-primary group-hover:scale-110 transition-transform">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-foreground">
                  ${stats.totalRaised.toLocaleString()}
                </h3>
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Total Raised</p>
              </div>
              <div className="p-8 rounded-2xl bg-card border shadow-sm flex flex-col items-center justify-center text-center hover-elevate transition-all group">
                <div className="bg-secondary/20 p-4 rounded-full mb-4 text-secondary-foreground group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-foreground">
                  {stats.totalDonors.toLocaleString()}
                </h3>
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Community Donors</p>
              </div>
              <div className="p-8 rounded-2xl bg-card border shadow-sm flex flex-col items-center justify-center text-center hover-elevate transition-all group">
                <div className="bg-accent/20 p-4 rounded-full mb-4 text-accent-foreground group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-foreground">
                  {stats.activeCauses || 12}
                </h3>
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Causes Supported</p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Trust Message */}
      <section className="py-24 bg-card">
        <div className="container px-4 max-w-4xl text-center">
          <Heart className="w-12 h-12 mx-auto text-primary mb-8 opacity-50" />
          <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-8">
            "We make a living by what we get, but we make a life by what we give."
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Seva Trust operates on a simple principle: focus the community's energy on one carefully vetted cause each month. No scattered efforts, no opaque overhead. Just pure, concentrated impact where it's needed most.
          </p>
          <Link href="/donors">
            <Button variant="outline" size="lg" className="rounded-full">
              See the Donor Wall
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}