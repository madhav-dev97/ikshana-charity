import { useState, useMemo } from "react";
import { useListDonors, useListCauses, useGetStatsSummary } from "@workspace/api-client-react";
import { format } from "date-fns";
import {
  Heart, Quote, UserRound, Sparkles, Trophy, Medal,
  Award, Search, Calendar, ChevronDown, SlidersHorizontal,
  Filter, TrendingUp, Sparkle, ArrowUpDown, HelpCircle,
  Flame, AwardIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";

function formatINR(amount?: number) {
  return "₹" + (amount ?? 0).toLocaleString("en-IN");
}

function formatDateString(value?: string | null, dateFormat = "d MMM yyyy") {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? format(parsed, dateFormat) : "Unknown date";
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function getMonthName(m: number) {
  return MONTH_NAMES[m - 1] || "";
}

function getAvatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "from-amber-500 to-orange-600 shadow-orange-500/20",
    "from-rose-500 to-orange-500 shadow-rose-500/20",
    "from-yellow-400 to-amber-500 shadow-yellow-500/20",
    "from-emerald-500 to-teal-600 shadow-emerald-500/20",
    "from-blue-500 to-indigo-600 shadow-blue-500/20",
    "from-purple-500 to-pink-600 shadow-purple-500/20",
    "from-violet-500 to-purple-600 shadow-violet-500/20",
    "from-red-500 to-rose-600 shadow-red-500/20"
  ];
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

interface GroupedDonor {
  name: string;
  totalAmount: number;
  frequency: number;
  lastDonatedAt: string;
  causes: Set<string>;
  messages: string[];
}

export default function Donors() {
  const { data: donors, isLoading: donorsLoading } = useListDonors();
  const { data: causes, isLoading: causesLoading } = useListCauses();
  const { data: statsGlobal } = useGetStatsSummary();

  // Filters State
  const [selectedCauseId, setSelectedCauseId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"amount" | "frequency" | "name" | "recency">("amount");
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<string>("all");

  const causesSorted = useMemo(() => {
    if (!causes) return [];
    return [...causes].sort((a, b) => b.year - a.year || b.month - a.month);
  }, [causes]);

  const latestCause = useMemo(() => {
    if (causesSorted.length === 0) return null;
    const currentCause = causesSorted.find(c => c.isCurrent);
    return currentCause || causesSorted[0];
  }, [causesSorted]);

  const selectedCause = useMemo(() => {
    if (selectedCauseId === "all") return null;
    return causes?.find(c => String(c.id) === selectedCauseId) || null;
  }, [selectedCauseId, causes]);

  // Filter raw donations by selected month/year campaign
  const filteredRawDonations = useMemo(() => {
    if (!donors) return [];
    return donors.filter(d => {
      if (!selectedCause) return true;
      return d.month === selectedCause.month && d.year === selectedCause.year;
    });
  }, [donors, selectedCause]);

  // Aggregate stats based on current filters
  const computedStats = useMemo(() => {
    const totalRaised = filteredRawDonations.reduce((acc, d) => acc + d.amount, 0);
    const uniqueDonorsCount = new Set(
      filteredRawDonations.filter(d => !d.isAnonymous).map(d => d.name.trim().toLowerCase())
    ).size + filteredRawDonations.filter(d => d.isAnonymous).length;

    const uniqueCausesCount = new Set(
      filteredRawDonations.map(d => d.causeTitle)
    ).size;

    return {
      totalRaised,
      totalDonors: uniqueDonorsCount,
      causesCount: uniqueCausesCount
    };
  }, [filteredRawDonations]);

  // Aggregate unique donors for leaderboard and list
  const aggregatedDonors = useMemo(() => {
    const groupedMap = new Map<string, GroupedDonor>();

    filteredRawDonations.forEach((d) => {
      if (d.isAnonymous) return;
      const rawName = d.name || "Unnamed Donor";
      const key = rawName.trim().toLowerCase();
      if (!key) return;

      const existing = groupedMap.get(key);
      if (existing) {
        existing.totalAmount += d.amount;
        existing.frequency += 1;
        if (d.donatedAt && (!existing.lastDonatedAt || new Date(d.donatedAt) > new Date(existing.lastDonatedAt))) {
          existing.lastDonatedAt = d.donatedAt;
        }
        existing.causes.add(d.causeTitle);
        if (d.message?.trim()) {
          existing.messages.push(d.message.trim());
        }
      } else {
        groupedMap.set(key, {
          name: rawName.trim(),
          totalAmount: d.amount,
          frequency: 1,
          lastDonatedAt: d.donatedAt || "",
          causes: new Set([d.causeTitle]),
          messages: d.message?.trim() ? [d.message.trim()] : [],
        });
      }
    });

    const list = Array.from(groupedMap.values()).map(d => ({
      ...d,
      causesArray: Array.from(d.causes)
    }));

    // Sort by amount descending to assign ranking
    list.sort((a, b) => b.totalAmount - a.totalAmount);

    return list.map((donor, idx) => {
      const badges: { id: string; label: string; icon: string; bgClass: string; textClass: string; desc: string }[] = [];
      const rank = idx + 1;

      // 1. Grand Benefactor Badge (🏆 / 💎)
      if (rank === 1 && donor.totalAmount > 0) {
        badges.push({
          id: "benefactor-1st",
          label: "Grand Benefactor",
          icon: "🏆",
          bgClass: "bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400",
          textClass: "text-amber-600 dark:text-amber-400",
          desc: "Our top contributor for the selected period."
        });
      } else if (rank === 2 && donor.totalAmount > 0) {
        badges.push({
          id: "benefactor-2nd",
          label: "Grand Benefactor",
          icon: "🥈",
          bgClass: "bg-slate-400/10 dark:bg-slate-400/20 border border-slate-400/30 text-slate-600 dark:text-slate-400",
          textClass: "text-slate-600 dark:text-slate-400",
          desc: "Our second highest contributor for the selected period."
        });
      } else if (rank === 3 && donor.totalAmount > 0) {
        badges.push({
          id: "benefactor-3rd",
          label: "Grand Benefactor",
          icon: "🥉",
          bgClass: "bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400",
          textClass: "text-orange-600 dark:text-orange-400",
          desc: "Our third highest contributor for the selected period."
        });
      } else if (donor.totalAmount >= 10000) {
        badges.push({
          id: "benefactor-elite",
          label: "Grand Benefactor",
          icon: "💎",
          bgClass: "bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400",
          textClass: "text-rose-600 dark:text-rose-400",
          desc: "Generous supporter with total contributions of ₹10,000 or more."
        });
      }

      // 2. Loyal Patron Badge (⚡)
      if (donor.frequency >= 3) {
        badges.push({
          id: "loyal",
          label: "Loyal Patron",
          icon: "⚡",
          bgClass: "bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400",
          textClass: "text-indigo-600 dark:text-indigo-400",
          desc: "Loyal supporter who has made 3 or more donations."
        });
      }

      // 3. Community Pillar Badge (🌟)
      if (donor.causes.size >= 2) {
        badges.push({
          id: "pillar",
          label: "Community Pillar",
          icon: "🌟",
          bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
          textClass: "text-emerald-600 dark:text-emerald-400",
          desc: "Supported 2 or more distinct charity campaigns."
        });
      }

      return {
        ...donor,
        rank,
        badges
      };
    });
  }, [filteredRawDonations]);

  // Top 3 for Podium
  const podiumDonors = useMemo(() => {
    const top3 = aggregatedDonors.slice(0, 3);
    const podiumOrder = [];
    // Podium rendering standard: 2nd place on left, 1st in center, 3rd on right
    if (top3[1]) podiumOrder.push({ ...top3[1], spot: 2 });
    if (top3[0]) podiumOrder.push({ ...top3[0], spot: 1 });
    if (top3[2]) podiumOrder.push({ ...top3[2], spot: 3 });
    return podiumOrder;
  }, [aggregatedDonors]);

  // Frequent supporters who aren't in the top 3
  const superSupporters = useMemo(() => {
    return aggregatedDonors
      .filter(d => d.rank > 3 && d.frequency >= 2)
      .slice(0, 6);
  }, [aggregatedDonors]);

  // Filter and sort the remaining list
  const filteredAndSortedGroupedDonors = useMemo(() => {
    let result = [...aggregatedDonors];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.causesArray.some(c => c.toLowerCase().includes(q))
      );
    }

    // Badge selection filter
    if (selectedBadgeFilter !== "all") {
      result = result.filter(d =>
        d.badges.some(b => b.id.startsWith(selectedBadgeFilter) || b.id === selectedBadgeFilter)
      );
    }

    // Sorting
    if (sortBy === "amount") {
      result.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === "frequency") {
      result.sort((a, b) => b.frequency - a.frequency || b.totalAmount - a.totalAmount);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "recency") {
      result.sort((a, b) => {
        const dateA = a.lastDonatedAt ? new Date(a.lastDonatedAt).getTime() : 0;
        const dateB = b.lastDonatedAt ? new Date(b.lastDonatedAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return result;
  }, [aggregatedDonors, searchQuery, sortBy, selectedBadgeFilter]);

  const isLoading = donorsLoading || causesLoading;

  return (
    <div className="min-h-screen pb-24 animate-in fade-in duration-500 bg-background">
      {/* Header Hero */}
      <div className="bg-gradient-to-br from-primary via-primary/95 to-secondary/80 pt-24 pb-20 px-4 relative overflow-hidden shadow-md">
        {/* Subtle dot overlay */}
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

        <div className="container max-w-5xl mx-auto text-center relative z-10">
          <p className="text-primary-foreground/80 text-xs font-bold uppercase tracking-widest mb-4">
            IKSHANA CHARITABLE TRUST
          </p>
          <div className="inline-flex items-center justify-center p-3 bg-primary-foreground/20 text-primary-foreground rounded-full mb-6">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-primary-foreground">
            The Donor Wall
          </h1>
          <p className="text-lg text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto mb-8 font-light">
            A celebration of kindness. Every gift creates lasting waves of hope.
            Here, we honor the community of change-makers standing with us.
          </p>

          {/* Campaign Month Filter Dropdown */}
          <div className="max-w-md mx-auto bg-background/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="flex items-center gap-2 text-primary-foreground shrink-0 text-sm font-semibold">
              <Calendar className="w-4 h-4 text-secondary-foreground" />
              <span>Show Campaign Period:</span>
            </div>

            <div className="w-full flex items-center gap-2">
              <select
                value={selectedCauseId}
                onChange={(e) => setSelectedCauseId(e.target.value)}
                className="w-full bg-background border border-border/30 rounded-xl px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 cursor-pointer shadow-sm"
              >
                <option value="all">🏆 All-Time Honor Roll</option>
                {causesSorted.map(cause => (
                  <option key={cause.id} value={String(cause.id)}>
                    {getMonthName(cause.month)} {cause.year} — {cause.title} {cause.isCurrent ? " (Active)" : ""}
                  </option>
                ))}
              </select>

              {latestCause && selectedCauseId !== String(latestCause.id) && (
                <button
                  onClick={() => setSelectedCauseId(String(latestCause.id))}
                  title="Jump to current active campaign month"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/95 transition-all text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1 shrink-0 shadow-md border border-secondary-border hover:scale-105 active:scale-95"
                >
                  <Flame className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Latest</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Statistics Cards */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            <div className="bg-primary-foreground/15 border border-white/20 backdrop-blur-sm p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-[1.02]">
              <span className="block text-2xl md:text-3xl font-extrabold text-primary-foreground font-sans tracking-tight">
                {formatINR(computedStats.totalRaised)}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider text-primary-foreground/80 font-bold mt-1 block">
                {selectedCause ? "Campaign Contributions" : "Total Raised Since Inception"}
              </span>
            </div>

            <div className="bg-primary-foreground/15 border border-white/20 backdrop-blur-sm p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-[1.02]">
              <span className="block text-2xl md:text-3xl font-extrabold text-primary-foreground font-sans tracking-tight">
                {computedStats.totalDonors.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] md:text-xs uppercase tracking-wider text-primary-foreground/80 font-bold mt-1 block">
                {selectedCause ? "Active Donors This Month" : "Total Unique Supporters"}
              </span>
            </div>

            {selectedCause ? (
              <div className="col-span-2 md:col-span-1 bg-primary-foreground/15 border border-white/20 backdrop-blur-sm p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-[1.02] flex flex-col justify-center">
                <div className="flex justify-between items-center text-[10px] md:text-xs uppercase tracking-wider text-primary-foreground/80 font-bold mb-1.5">
                  <span>Goal: {formatINR(selectedCause.goalAmount)}</span>
                  <span>{Math.round((selectedCause.raisedAmount / selectedCause.goalAmount) * 105) >= 100 ? Math.round((selectedCause.raisedAmount / selectedCause.goalAmount) * 100) : Math.round((selectedCause.raisedAmount / selectedCause.goalAmount) * 100)}%</span>
                </div>
                <div className="w-full bg-white/25 rounded-full h-2 overflow-hidden shadow-inner">
                  <div
                    className="bg-secondary h-full rounded-full transition-all duration-1000 shadow"
                    style={{ width: `${Math.min((selectedCause.raisedAmount / selectedCause.goalAmount) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="col-span-2 md:col-span-1 bg-primary-foreground/15 border border-white/20 backdrop-blur-sm p-5 rounded-2xl text-center shadow-lg transition-transform hover:scale-[1.02]">
                <span className="block text-2xl md:text-3xl font-extrabold text-primary-foreground font-sans tracking-tight">
                  {computedStats.causesCount}
                </span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider text-primary-foreground/80 font-bold mt-1 block">
                  Campaigns Supported
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="container px-4 mt-12 max-w-5xl mx-auto">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-1/3 mx-auto rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))}
            </div>
          </div>
        ) : (
          <Tabs defaultValue="spotlight" className="w-full">
            <div className="flex justify-center mb-10">
              <TabsList className="bg-muted p-1 rounded-2xl border border-muted-border/60 shadow-sm flex shrink-0">
                <TabsTrigger value="spotlight" className="rounded-xl px-5 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span>Spotlight</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="rounded-xl px-5 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all">
                  <UserRound className="w-4 h-4 text-secondary-foreground" />
                  <span>All Donors</span>
                </TabsTrigger>
                <TabsTrigger value="recent" className="rounded-xl px-5 py-2 text-sm font-semibold flex items-center gap-1.5 transition-all">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Recent Activity</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: SPOTLIGHT / LEADERBOARD */}
            <TabsContent value="spotlight" className="space-y-12 focus:outline-none">

              {/* Podium View */}
              <div className="bg-card/45 border border-card-border/60 rounded-3xl p-6 md:p-8 shadow-sm backdrop-blur-sm">
                <div className="text-center max-w-md mx-auto mb-8">
                  <h3 className="font-serif text-2xl font-bold text-foreground">Top Contributor Spotlight</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedCause
                      ? `Honoring the highest supporters for ${getMonthName(selectedCause.month)} ${selectedCause.year}`
                      : "Honoring our most generous lifetime champions since day one"}
                  </p>
                </div>

                {podiumDonors.length === 0 ? (
                  <div className="text-center py-12">
                    <AwardIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm font-medium">No named spotlight entries for this period yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4 max-w-3xl mx-auto pt-6">
                    <TooltipProvider>
                      {podiumDonors.map((donor) => {
                        const isFirst = donor.spot === 1;
                        const isSecond = donor.spot === 2;
                        const isThird = donor.spot === 3;

                        // Colors
                        let colorGlow = "shadow-amber-500/10 border-amber-300 dark:border-amber-900";
                        let bannerText = "Gold Supporter";
                        let trophyColor = "text-amber-500";
                        let bgStep = "bg-amber-500/10 dark:bg-amber-500/20";

                        if (isSecond) {
                          colorGlow = "shadow-slate-400/10 border-slate-300 dark:border-slate-800";
                          bannerText = "Silver Supporter";
                          trophyColor = "text-slate-400";
                          bgStep = "bg-slate-400/10 dark:bg-slate-400/20";
                        } else if (isThird) {
                          colorGlow = "shadow-orange-500/10 border-orange-200 dark:border-orange-950";
                          bannerText = "Bronze Supporter";
                          trophyColor = "text-orange-500";
                          bgStep = "bg-orange-500/10 dark:bg-orange-500/20";
                        }

                        return (
                          <div
                            key={donor.name}
                            className={`w-full md:w-1/3 flex flex-col items-center ${isFirst ? "order-1 md:order-2 z-10 -mt-6" : isSecond ? "order-2 md:order-1" : "order-3"}`}
                          >
                            {/* Avatar bubble */}
                            <div className="relative mb-3 group">
                              {/* Glowing background */}
                              <div className={`absolute -inset-1 rounded-full bg-gradient-to-tr opacity-25 blur-md group-hover:opacity-40 transition-all ${isFirst ? "from-amber-400 to-yellow-500" : isSecond ? "from-slate-300 to-slate-400" : "from-orange-400 to-amber-600"
                                }`}></div>

                              <div className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center font-bold text-2xl text-white bg-gradient-to-br ${getAvatarGradient(donor.name)} ${isFirst ? "border-amber-400 w-24 h-24 text-3xl" : isSecond ? "border-slate-300" : "border-amber-700"
                                }`}>
                                <span className="font-serif">{donor.name.charAt(0)}</span>

                                {/* Spotlight Crown/Icon */}
                                <div className="absolute -top-3 -right-1.5 p-1 bg-background rounded-full border shadow-sm">
                                  {isFirst ? (
                                    <Trophy className={`w-5 h-5 ${trophyColor}`} />
                                  ) : isSecond ? (
                                    <Medal className={`w-4 h-4 ${trophyColor}`} />
                                  ) : (
                                    <Award className={`w-4 h-4 ${trophyColor}`} />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Donor Podium Column Stand */}
                            <motion.div
                              custom={donor.spot}
                              initial="hidden"
                              animate="visible"
                              variants={{
                                hidden: { height: 0, opacity: 0 },
                                visible: (spot: number) => ({
                                  height: spot === 1 ? "180px" : spot === 2 ? "140px" : "110px",
                                  opacity: 1,
                                  transition: { duration: 0.8, ease: "easeOut" }
                                })
                              }}
                              className={`w-full ${bgStep} border border-b-0 rounded-t-2xl flex flex-col justify-between p-4 text-center ${colorGlow}`}
                            >
                              <div className="space-y-1">
                                <h4 className={`font-bold text-sm truncate max-w-full ${isFirst ? "text-base" : ""}`}>
                                  {donor.name}
                                </h4>
                                <span className={`block font-extrabold text-primary ${isFirst ? "text-lg" : "text-sm"}`}>
                                  {formatINR(donor.totalAmount)}
                                </span>
                              </div>

                              <div className="pt-2 border-t border-border/20">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                                  {donor.frequency} {donor.frequency === 1 ? "Donation" : "Donations"}
                                </span>

                                <div className="flex justify-center gap-1.5 mt-2">
                                  {donor.badges.slice(0, 2).map((badge) => (
                                    <Tooltip key={badge.id}>
                                      <TooltipTrigger asChild>
                                        <span className="cursor-help text-base select-none hover:scale-110 active:scale-95 transition-all">
                                          {badge.icon}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[180px] p-2 text-xs bg-popover border text-popover-foreground shadow rounded-lg">
                                        <span className="font-bold block mb-0.5">{badge.label}</span>
                                        {badge.desc}
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                )}
              </div>

              {/* Extra Spotlight Row: Super Supporters and Badges Directory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section A: Consistent Supporters (Loyal Patrons) */}
                <div className="bg-card border border-card-border/50 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-foreground">Super Supporters</h4>
                      <p className="text-[11px] text-muted-foreground">Most frequent donors supporting multiple causes</p>
                    </div>
                  </div>

                  {superSupporters.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20">
                      <p className="text-xs text-muted-foreground italic">Super Supporters are recognized on making multiple donations.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {superSupporters.map((donor) => (
                        <div key={donor.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/30">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(donor.name)} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
                              {donor.name.charAt(0)}
                            </div>
                            <div>
                              <h5 className="font-semibold text-sm text-foreground">{donor.name}</h5>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <span>{donor.frequency} Donations</span>
                                <span>•</span>
                                <span>{donor.causes.size} Campaigns</span>
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-sm text-primary block">{formatINR(donor.totalAmount)}</span>
                            <div className="flex gap-1 justify-end mt-0.5">
                              {donor.badges.map(b => (
                                <span key={b.id} title={b.label} className="text-xs cursor-default">{b.icon}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section B: Honor Badges Guide */}
                <div className="bg-card border border-card-border/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-serif text-lg font-bold text-foreground">Honor Badges Guide</h4>
                        <p className="text-[11px] text-muted-foreground">Badges earned dynamically through contributions</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                        <span className="text-2xl mt-0.5 shrink-0 select-none">🏆</span>
                        <div>
                          <h5 className="font-bold text-xs text-amber-800 dark:text-amber-400 uppercase tracking-wide">Grand Benefactor</h5>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            Given to top contributors who make the largest impact (Top 3 on podium or contributors of ₹10,000+).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                        <span className="text-2xl mt-0.5 shrink-0 select-none">⚡</span>
                        <div>
                          <h5 className="font-bold text-xs text-indigo-800 dark:text-indigo-400 uppercase tracking-wide">Loyal Patron</h5>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            Given to our most consistent supporters who have contributed 3 or more times over different campaigns.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                        <span className="text-2xl mt-0.5 shrink-0 select-none">🌟</span>
                        <div>
                          <h5 className="font-bold text-xs text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">Community Pillar</h5>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            Given to change-makers who support multiple different charity campaigns, distributing their impact.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t mt-6 text-center text-[10px] text-muted-foreground">
                    💡 Grouping and badges are updated in real-time. Anonymous donations do not build a public leaderboard rank to protect confidentiality.
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: ALL DONORS DIRECTORY */}
            <TabsContent value="all" className="space-y-6 focus:outline-none">

              {/* Dynamic Controls Grid */}
              <div className="bg-card border border-card-border/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or cause..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-muted border border-border/40 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-colors"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  {/* Badge Filter */}
                  <div className="flex items-center gap-1 bg-muted rounded-xl p-0.5 border border-border/40">
                    <button
                      onClick={() => setSelectedBadgeFilter("all")}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-lg transition-all ${selectedBadgeFilter === "all" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      All Badges
                    </button>
                    <button
                      onClick={() => setSelectedBadgeFilter("benefactor")}
                      className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1 ${selectedBadgeFilter === "benefactor" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      title="Grand Benefactors"
                    >
                      🏆 <span className="hidden sm:inline">Grand</span>
                    </button>
                    <button
                      onClick={() => setSelectedBadgeFilter("loyal")}
                      className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1 ${selectedBadgeFilter === "loyal" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      title="Loyal Patrons"
                    >
                      ⚡ <span className="hidden sm:inline">Loyal</span>
                    </button>
                    <button
                      onClick={() => setSelectedBadgeFilter("pillar")}
                      className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg transition-all flex items-center gap-1 ${selectedBadgeFilter === "pillar" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                      title="Community Pillars"
                    >
                      🌟 <span className="hidden sm:inline">Pillar</span>
                    </button>
                  </div>

                  {/* Sort By Selector */}
                  <div className="flex items-center gap-1.5 bg-muted rounded-xl px-2.5 py-1.5 border border-border/40">
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                    >
                      <option value="amount">Contribution Size</option>
                      <option value="frequency">Donation Frequency</option>
                      <option value="name">Name (A - Z)</option>
                      <option value="recency">Latest Donation</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Unique Donors Grid */}
              {filteredAndSortedGroupedDonors.length === 0 ? (
                <div className="text-center py-24 bg-card border border-card-border/60 rounded-3xl">
                  <UserRound className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-foreground">No matching donors found</h4>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your search query or filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredAndSortedGroupedDonors.map((donor) => (
                      <motion.div
                        key={donor.name}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="rounded-2xl border-card-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full bg-card group relative overflow-hidden flex flex-col justify-between">
                          <CardContent className="p-5 flex flex-col justify-between h-full">
                            <div>
                              {/* Header block */}
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(donor.name)} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow`}>
                                    {donor.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-semibold text-sm truncate max-w-[150px] group-hover:text-primary transition-colors font-sans">
                                      {donor.name}
                                    </h4>
                                    <span className="text-[10px] text-muted-foreground mt-0.5 block font-medium">
                                      Rank #{donor.rank} • {donor.frequency} {donor.frequency === 1 ? "Donation" : "Donations"}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-extrabold text-sm text-primary shrink-0">
                                  {formatINR(donor.totalAmount)}
                                </span>
                              </div>

                              {/* Badges Pill Row */}
                              {donor.badges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {donor.badges.map((b) => (
                                    <span
                                      key={b.id}
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${b.bgClass}`}
                                      title={b.desc}
                                    >
                                      <span>{b.icon}</span>
                                      <span>{b.label}</span>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Causes Supported Info */}
                            <div className="pt-3 border-t border-border/30 mt-auto">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground block mb-1.5">
                                Campaigns Supported ({donor.causesArray.length})
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {donor.causesArray.slice(0, 2).map((c, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] py-0 px-2 font-medium truncate max-w-[150px] border-border/50 text-muted-foreground bg-muted/30">
                                    {c}
                                  </Badge>
                                ))}
                                {donor.causesArray.length > 2 && (
                                  <span className="text-[9px] text-muted-foreground font-semibold px-1">
                                    +{donor.causesArray.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>

            {/* TAB 3: RECENT ACTIVITY */}
            <TabsContent value="recent" className="space-y-6 focus:outline-none">

              {/* Messages feed */}
              {filteredRawDonations.length === 0 ? (
                <div className="text-center py-24 bg-card border border-card-border/60 rounded-3xl">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-foreground">No recent donations</h4>
                  <p className="text-xs text-muted-foreground mt-1">Be the first to create history in this period.</p>
                </div>
              ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                  {filteredRawDonations.map((donor, idx) => (
                    <div
                      key={donor.id}
                      className="break-inside-avoid mb-6 animate-in slide-in-from-bottom-4 fill-mode-both"
                      style={{ animationDelay: `${Math.min(idx * 40, 800)}ms` }}
                    >
                      <Card className="rounded-2xl border-card-border shadow-sm hover:shadow-md transition-all bg-card h-full hover:border-primary/20 group relative">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shrink-0 shadow-sm ${donor.isAnonymous
                              ? 'bg-muted text-muted-foreground'
                              : `bg-gradient-to-br ${getAvatarGradient(donor.name)} text-white`
                              }`}>
                              {donor.isAnonymous ? (
                                <UserRound className="w-4 h-4" />
                              ) : (
                                <span className="font-serif">{donor.name?.charAt(0) || "?"}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
                                {donor.isAnonymous ? "Anonymous Donor" : donor.name || "Unnamed Donor"}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 flex-wrap font-medium">
                                <span className="text-primary font-bold">{formatINR(donor.amount)}</span>
                                <span>•</span>
                                <span className="truncate max-w-[130px]">{donor.causeTitle}</span>
                              </div>
                            </div>
                          </div>

                          {donor.message && (
                            <div className="mt-3 pt-3 border-t border-border/40 relative">
                              <Quote className="absolute -top-2.5 left-1 w-4 h-4 text-primary/20 rotate-180 bg-card px-0.5" />
                              <p className="text-muted-foreground italic text-xs leading-relaxed pl-2">
                                "{donor.message}"
                              </p>
                            </div>
                          )}

                          {donor.donatedAt && (
                            <div className="mt-3 text-[9px] text-muted-foreground/60 text-right uppercase tracking-wider font-semibold">
                              {formatDateString(donor.donatedAt, "d MMM yyyy")}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
