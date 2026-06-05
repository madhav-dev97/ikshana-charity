import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  LayoutDashboard, Users, Target, Activity, IndianRupee,
  CheckCircle2, Circle, Pencil, Check, X, ShieldAlert, LogOut,
  TrendingUp, Calendar, BadgeCheck, Mail, MessageSquare, Send,
  Wifi, WifiOff, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ADMIN_PIN = "IKSHANA2024";
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatINR(amount?: number) {
  return "₹" + (amount ?? 0).toLocaleString("en-IN");
}

function formatDateString(value?: string | null, dateFormat = "dd MMM yyyy") {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? format(parsed, dateFormat) : "Unknown date";
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setError(true);
      setPin("");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-primary/10 p-4 rounded-full">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-serif font-bold">Admin Access</h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter the admin PIN to manage IKSHANA CHARITABLE TRUST
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            className={`text-center text-lg tracking-widest h-14 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-500 text-center">Incorrect PIN. Try again.</p>
          )}
          <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold">
            Unlock Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}

type Cause = {
  id: number;
  title: string;
  description: string;
  month: number;
  year: number;
  goalAmount: number;
  raisedAmount: number;
  category: string;
  isCurrent: boolean;
  impact: string | null;
  beneficiaries: number | null;
};

type Donor = {
  id: number;
  name: string;
  amount: number;
  causeTitle: string;
  month: number;
  year: number;
  donatedAt: string;
  message: string | null;
  isAnonymous: boolean;
};

type Stats = {
  totalDonations: number;
  totalDonors: number;
  totalRaised: number;
  currentMonthRaised: number;
  currentCauseTitle: string;
  activeCauses: number;
};

type NotificationStatus = {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
};

type ReminderResult = {
  success: boolean;
  causeTitle: string;
  totalDonors: number;
  emailSent: number;
  whatsappSent: number;
  smsSent: number;
  skipped: number;
};

function EditGoalModal({
  cause,
  onClose,
  onSave,
}: {
  cause: Cause;
  onClose: () => void;
  onSave: (id: number, goalAmount: number) => void;
}) {
  const [value, setValue] = useState(String(cause.goalAmount));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-sm border">
        <h3 className="font-serif font-bold text-lg mb-1">Edit Fundraising Goal</h3>
        <p className="text-sm text-muted-foreground mb-4">{cause.title}</p>
        <label className="block text-sm font-medium mb-1">New Goal Amount (₹)</label>
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mb-4"
          autoFocus
        />
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => {
              const num = parseFloat(value);
              if (!isNaN(num) && num > 0) onSave(cause.id, num);
            }}
          >
            <Check className="w-4 h-4 mr-1" /> Save
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLock }: { onLock: () => void }) {
  const qc = useQueryClient();
  const [editingCause, setEditingCause] = useState<Cause | null>(null);
  const [reminderResult, setReminderResult] = useState<ReminderResult | null>(null);

  const { data: stats } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: () => apiFetch("/stats/summary"),
  });

  const { data: causes = [] } = useQuery<Cause[]>({
    queryKey: ["admin-causes"],
    queryFn: () => apiFetch("/causes"),
  });

  const { data: donors = [] } = useQuery<Donor[]>({
    queryKey: ["admin-donors"],
    queryFn: () => apiFetch("/donors"),
  });

  const { data: notifStatus } = useQuery<NotificationStatus>({
    queryKey: ["admin-notif-status"],
    queryFn: () => apiFetch("/admin/notification-status"),
  });

  const patchCause = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      apiFetch(`/causes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-causes"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setEditingCause(null);
    },
  });

  const sendReminders = useMutation({
    mutationFn: () => apiFetch("/admin/send-reminders", { method: "POST" }),
    onSuccess: (data: ReminderResult) => setReminderResult(data),
  });

  function setAsCurrent(cause: Cause) {
    patchCause.mutate({ id: cause.id, data: { isCurrent: true } });
  }

  function saveGoal(id: number, goalAmount: number) {
    patchCause.mutate({ id, data: { goalAmount } });
  }

  const currentCause = causes.find((c) => c.isCurrent);

  return (
    <div className="min-h-screen bg-muted/30">
      {editingCause && (
        <EditGoalModal
          cause={editingCause}
          onClose={() => setEditingCause(null)}
          onSave={saveGoal}
        />
      )}

      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <span className="font-serif font-bold text-sm text-primary">Admin Dashboard</span>
            <span className="text-muted-foreground text-xs hidden sm:block">— IKSHANA CHARITABLE TRUST</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onLock} className="text-muted-foreground hover:text-foreground gap-1">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Lock</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Notification Status + Reminders */}
        <div className="bg-background rounded-xl border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-bold text-lg">Notifications</h2>
            </div>
            <div className="flex flex-wrap gap-2 flex-1">
              {[
                { key: "email", icon: Mail, label: "Email (Gmail)" },
                { key: "whatsapp", icon: MessageSquare, label: "WhatsApp" },
                { key: "sms", icon: MessageSquare, label: "SMS" },
              ].map(({ key, icon: Icon, label }) => {
                const active = notifStatus?.[key as keyof NotificationStatus];
                return (
                  <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${active ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400" : "bg-muted border-muted-foreground/20 text-muted-foreground"}`}>
                    {active ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                );
              })}
            </div>
            <Button
              className="shrink-0 gap-2"
              onClick={() => { setReminderResult(null); sendReminders.mutate(); }}
              disabled={sendReminders.isPending}
            >
              <Send className="w-4 h-4" />
              {sendReminders.isPending ? "Sending…" : "Send Monthly Reminders"}
            </Button>
          </div>

          {reminderResult && (
            <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                ✅ Reminders sent for: {reminderResult.causeTitle}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-emerald-700 dark:text-emerald-400">
                <span>👥 {reminderResult.totalDonors} unique donors</span>
                <span>📧 {reminderResult.emailSent} emails</span>
                <span>💬 {reminderResult.whatsappSent} WhatsApp</span>
                <span>📱 {reminderResult.smsSent} SMS</span>
                {reminderResult.skipped > 0 && <span className="text-amber-600">⚠️ {reminderResult.skipped} skipped (no contact)</span>}
              </div>
            </div>
          )}

          {sendReminders.isError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              Failed to send reminders. Please check the server logs.
            </div>
          )}

          {!(notifStatus?.email || notifStatus?.whatsapp || notifStatus?.sms) && (
            <p className="mt-3 text-xs text-muted-foreground">
              No notification channels configured yet. Add credentials in environment secrets to enable email and WhatsApp.
            </p>
          )}
        </div>

        {/* Stats Overview */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: IndianRupee, label: "Total Raised", value: formatINR(stats?.totalRaised ?? 0), color: "text-primary" },
              { icon: Users, label: "Total Donors", value: (stats?.totalDonors ?? 0).toLocaleString("en-IN"), color: "text-blue-600" },
              { icon: Activity, label: "Donations", value: (stats?.totalDonations ?? 0).toLocaleString("en-IN"), color: "text-emerald-600" },
              { icon: Target, label: "Total Causes", value: String(stats?.activeCauses ?? 0), color: "text-amber-600" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-background rounded-xl border p-5 flex flex-col gap-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <p className="text-2xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Cause Progress */}
        {currentCause && (
          <div className="bg-background rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-bold text-lg">Current Month's Cause</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20 ml-auto">Active</Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-base">{currentCause.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {MONTH_NAMES[(currentCause.month ?? 1) - 1]} {currentCause.year} · {currentCause.category}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setEditingCause(currentCause)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Goal
                </Button>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-primary">{formatINR(currentCause.raisedAmount)} raised</span>
                  <span className="text-muted-foreground">Goal: {formatINR(currentCause.goalAmount)}</span>
                </div>
                <Progress
                  value={Math.min((currentCause.raisedAmount / currentCause.goalAmount) * 100, 100)}
                  className="h-3"
                  indicatorClassName="bg-primary"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {((currentCause.raisedAmount / currentCause.goalAmount) * 100).toFixed(1)}% of goal reached
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Causes Management */}
        <div className="bg-background rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="font-serif font-bold text-lg">All Causes</h2>
            <span className="text-xs text-muted-foreground ml-1">({causes.length})</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cause</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Period</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Raised / Goal</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {causes.map((cause) => {
                  const pct = Math.min((cause.raisedAmount / cause.goalAmount) * 100, 100);
                  return (
                    <tr key={cause.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{cause.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{cause.category}</div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {MONTH_NAMES[(cause.month ?? 1) - 1]} {cause.year}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-semibold text-primary">{formatINR(cause.raisedAmount)}</div>
                        <div className="text-xs text-muted-foreground">{formatINR(cause.goalAmount)} · {pct.toFixed(0)}%</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {cause.isCurrent ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground gap-1">
                            <Circle className="w-3 h-3" /> Past
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCause(cause)}
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          {!cause.isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => setAsCurrent(cause)}
                              disabled={patchCause.isPending}
                            >
                              <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Set Active
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-background rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            <h2 className="font-serif font-bold text-lg">Recent Donations</h2>
            <span className="text-xs text-muted-foreground ml-1">({donors.length} total)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Donor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Cause</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {donors.slice(0, 30).map((donor) => (
                  <tr key={donor.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-medium">{donor.name}</div>
                      {donor.message && (
                        <div className="text-xs text-muted-foreground italic mt-0.5 max-w-[200px] truncate">
                          "{donor.message}"
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="text-muted-foreground text-xs max-w-[180px] truncate">{donor.causeTitle}</div>
                      <div className="text-xs text-muted-foreground/60">
                        {MONTH_NAMES[(donor.month ?? 1) - 1]} {donor.year}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-bold text-primary">{formatINR(donor.amount)}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right hidden sm:table-cell">
                      <span className="text-muted-foreground text-xs">
                        {formatDateString(donor.donatedAt, "dd MMM yyyy")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  return <AdminDashboard onLock={() => setUnlocked(false)} />;
}
