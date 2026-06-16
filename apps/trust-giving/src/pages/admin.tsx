import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  LayoutDashboard, Users, Target, Activity, IndianRupee,
  CheckCircle2, Circle, Pencil, Check, X, ShieldAlert, LogOut,
  TrendingUp, Calendar, BadgeCheck, Mail, MessageSquare, Send,
  Wifi, WifiOff, Bell, Plus, Heart
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseLogo } from "@/hooks/use-supabase-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/ui/media-upload";

const API_BASE = import.meta.env.VITE_API_URL;

type MediaItem = {
  id: number;
  mediaType: "photo" | "video";
  filePath: string;
  caption: string | null;
  publicUrl?: string;
};

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
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    ...opts,
    headers,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
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

function CreateCauseModal({
  onClose,
  onSave,
  isPending,
}: {
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Education");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [goalAmount, setGoalAmount] = useState("");
  const [ngoName, setNgoName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [, setMediaFiles] = useState<FileList | null>(null);
  const [impact, setImpact] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Title is required");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Description is required");
      return;
    }
    const goal = parseFloat(goalAmount);
    if (isNaN(goal) || goal <= 0) {
      setErrorMsg("Goal Amount must be a positive number");
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      month,
      year,
      goalAmount: goal,
      ngoName: ngoName.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      impact: impact.trim() || undefined,
      beneficiaries: beneficiaries.trim() || undefined,
      isCurrent,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto py-8">
      <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-lg border my-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-bold text-xl">Create New Campaign</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Campaign Title *</label>
              <Input
                type="text"
                placeholder="e.g. Clean Drinking Water Initiative"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">NGO / Partner Name</label>
              <Input
                type="text"
                placeholder="NGO Name"
                value={ngoName}
                onChange={(e) => setNgoName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Disaster Relief">Disaster Relief</option>
                <option value="Environment">Environment</option>
                <option value="Animal Welfare">Animal Welfare</option>
                <option value="General Charity">General Charity</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Target Month *</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Target Year *</label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Goal Amount (₹) *</label>
              <Input
                type="number"
                placeholder="e.g. 150000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                min={1}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Beneficiaries Count (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. 500+ families"
                value={beneficiaries}
                onChange={(e) => setBeneficiaries(e.target.value)}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Image URL (Optional)</label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm text-muted-foreground">Media can be added after creating the campaign.</label>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Campaign Description *</label>
              <Textarea
                placeholder="Provide details about the cause and what the funds will be used for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium">Expected Impact (Optional)</label>
              <Textarea
                placeholder="e.g. 50 water filters installed, 250 school kits distributed"
                value={impact}
                onChange={(e) => setImpact(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isCurrent"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isCurrent" className="text-sm font-medium select-none">
              Set as the current active campaign (deactivates others)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Creating..." : "Create Campaign"}
            </Button>
            <Button variant="outline" type="button" className="flex-1" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const qc = useQueryClient();
  const [editingCause, setEditingCause] = useState<Cause | null>(null);
  const [isCreatingCause, setIsCreatingCause] = useState(false);
  const [reminderResult, setReminderResult] = useState<ReminderResult | null>(null);
  const { logoUrl } = useSupabaseLogo();

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

  const [managingMediaCause, setManagingMediaCause] = useState<Cause | null>(null);

  const createCause = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch("/causes", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-causes"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setIsCreatingCause(false);
    },
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

  const mediaQuery = useQuery<MediaItem[]>({
    queryKey: ["cause-media", managingMediaCause?.id],
    queryFn: async () => {
      const items = await apiFetch(`/causes/${managingMediaCause?.id}/media`);
      return items.map((item: any) => {
        const { data } = supabase.storage.from("campaigns").getPublicUrl(item.filePath);
        return {
          ...item,
          publicUrl: data?.publicUrl ?? "",
        } as MediaItem;
      });
    },
    enabled: Boolean(managingMediaCause?.id),
  });

  const deleteMedia = useMutation({
    mutationFn: async (mediaId: number) =>
      apiFetch(`/media/${mediaId}`, { method: "DELETE" }),
    onSuccess: () => mediaQuery.refetch(),
  });

  return (

    <div className="min-h-screen bg-muted/30">
      {editingCause && (
        <EditGoalModal
          cause={editingCause}
          onClose={() => setEditingCause(null)}
          onSave={saveGoal}
        />
      )}

      {managingMediaCause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 overflow-y-auto py-8">
          <div className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-3xl border my-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-xl">Manage Media</h3>
                <p className="text-sm text-muted-foreground mt-1">Campaign: {managingMediaCause.title}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setManagingMediaCause(null)} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <MediaUpload
                causeId={managingMediaCause.id}
                onChange={() => undefined}
                onUploadComplete={() => mediaQuery.refetch()}
              />

              <div className="rounded-xl border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold">Existing Media</h4>
                  <span className="text-xs text-muted-foreground">{mediaQuery.data?.length ?? 0} items</span>
                </div>

                {mediaQuery.isLoading && <p>Loading media...</p>}
                {mediaQuery.isError && <p className="text-sm text-red-600">Failed to load media.</p>}

                {!mediaQuery.isLoading && mediaQuery.data?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {mediaQuery.data?.map((item) => (
                    <div key={item.id} className="rounded-xl border p-3 bg-muted/10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">{item.mediaType}</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMedia.mutate(item.id)}
                          disabled={deleteMedia.isPending}
                        >
                          Delete
                        </Button>
                      </div>

                      <div className="mt-3">
                        {item.mediaType === "photo" ? (
                          <img
                            src={item.publicUrl}
                            alt={item.caption ?? managingMediaCause?.title}
                            className="h-40 w-full rounded-md object-cover border"
                            loading="lazy"
                          />
                        ) : (
                          <video controls className="w-full rounded-md border">
                            <source src={item.publicUrl} />
                          </video>
                        )}
                      </div>

                      {item.caption && (
                        <div className="mt-2 text-xs text-muted-foreground">{item.caption}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreatingCause && (
        <CreateCauseModal
          onClose={() => setIsCreatingCause(false)}
          onSave={(data) => createCause.mutate(data)}
          isPending={createCause.isPending}
        />
      )}

      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt="IKSHANA" className="h-10 object-contain" />
            ) : (
              <Heart className="w-5 h-5 text-primary" />
            )}
            <span className="font-serif font-bold text-sm text-primary">Admin Dashboard</span>
            <span className="text-muted-foreground text-xs hidden sm:block">— IKSHANA CHARITABLE TRUST</span>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
          >
            Logout
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
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-bold text-lg">All Causes</h2>
              <span className="text-xs text-muted-foreground ml-1">({causes.length})</span>
            </div>
            <Button size="sm" onClick={() => setIsCreatingCause(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setManagingMediaCause(cause)}
                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                          >
                            Media
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
  return <AdminDashboard />;
}
