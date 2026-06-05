import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCurrentCause, useCreateDonation } from "@workspace/api-client-react";
import { useDonationStore } from "@/store/donation-store";
import { Heart, AlertCircle, Loader2, ShieldCheck, Lock, BadgeIndianRupee } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const donationSchema = z.object({
  donorName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  amount: z.coerce.number().min(1, "Minimum donation is ₹1").max(10000000, "Maximum limit exceeded"),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional(),
  isAnonymous: z.boolean().default(false),
});

type DonationFormValues = z.infer<typeof donationSchema>;

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

export default function Donate() {
  const [, setLocation] = useLocation();
  const { data: currentCause, isLoading: loadingCause } = useGetCurrentCause();
  const createDonation = useCreateDonation();
  const setReceipt = useDonationStore((state) => state.setReceipt);

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: "",
      email: "",
      phone: "",
      amount: 1000,
      message: "",
      isAnonymous: false,
    },
  });

  const onSubmit = async (data: DonationFormValues) => {
    if (!currentCause) return;
    createDonation.mutate(
      {
        data: {
          ...data,
          causeId: currentCause.id,
          phone: data.phone || null,
        }
      },
      {
        onSuccess: (receipt) => {
          setReceipt(receipt);
          setLocation("/receipt");
        },
      }
    );
  };

  const selectedAmount = form.watch("amount");

  return (
    <div className="animate-in fade-in duration-500 min-h-screen flex flex-col">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12 md:py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest mb-2">IKSHANA CHARITABLE TRUST</p>
          <h1 className="text-4xl font-serif font-bold mb-2">Make a Donation</h1>
          <p className="text-primary-foreground/80 text-lg">
            Your contribution goes directly to this month's cause. Every rupee counts.
          </p>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-12 md:py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left — Cause Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">You Are Supporting</h2>

              {loadingCause ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-48 w-full rounded-xl mt-4" />
                </div>
              ) : currentCause ? (
                <div>
                  <h3 className="text-2xl font-serif font-bold mb-3">{currentCause.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{currentCause.description}</p>

                  {currentCause.imageUrl && (
                    <div className="rounded-xl overflow-hidden mb-6 h-44">
                      <img src={currentCause.imageUrl} alt={currentCause.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-muted-foreground">Goal: {formatINR(currentCause.goalAmount)}</span>
                      <span className="text-primary">{formatINR(currentCause.raisedAmount)} raised</span>
                    </div>
                    <div className="w-full bg-border h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((currentCause.raisedAmount / currentCause.goalAmount) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No active cause this month.</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 text-sm mb-0.5">100% Transparent</p>
                <p className="text-green-700 text-xs leading-relaxed">IKSHANA CHARITABLE TRUST ensures 100% of your donation goes directly to the cause. No hidden charges.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <BadgeIndianRupee className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 text-sm mb-0.5">80G — Application in Progress</p>
                <p className="text-amber-700 text-xs leading-relaxed">We are applying for 80G tax exemption. An updated receipt will be issued to all donors once approved.</p>
              </div>
            </div>
          </div>

          {/* Right — Donation Form */}
          <div className="lg:col-span-7">
            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  {/* Amount */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-serif border-b pb-2">1. Select Amount</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {PRESET_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => form.setValue("amount", amount, { shouldValidate: true })}
                          className={`py-3 px-3 rounded-xl border-2 text-sm font-bold transition-all ${
                            selectedAmount === amount
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border bg-background hover:border-primary/50 hover:bg-muted"
                          }`}
                        >
                          {formatINR(amount)}
                        </button>
                      ))}
                      <div className="col-span-3 relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter custom amount"
                          className={`pl-8 py-3 text-base font-bold rounded-xl border-2 transition-all ${
                            !PRESET_AMOUNTS.includes(selectedAmount) && selectedAmount > 0
                              ? "border-primary bg-primary/5"
                              : "border-border"
                          }`}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : 0;
                            form.setValue("amount", val, { shouldValidate: true });
                          }}
                          value={!PRESET_AMOUNTS.includes(selectedAmount) && selectedAmount > 0 ? selectedAmount : ""}
                        />
                      </div>
                    </div>
                    {form.formState.errors.amount && (
                      <p className="text-sm font-medium text-destructive">{form.formState.errors.amount.message}</p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-serif border-b pb-2">2. Your Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="donorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Priya Sharma" {...field} className="rounded-lg bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="priya@example.com" {...field} className="rounded-lg bg-background" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="+91 98765 43210" {...field} className="rounded-lg bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isAnonymous"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-background">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">Make this donation anonymous</FormLabel>
                            <FormDescription>Your name will not appear on the public Donor Wall.</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold font-serif border-b pb-2">3. Leave a Message <span className="text-muted-foreground font-normal text-sm">(Optional)</span></h3>
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Share why you're supporting this cause..."
                              className="resize-none rounded-lg bg-background min-h-[90px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>This will be displayed on the Donor Wall alongside your donation.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                      disabled={createDonation.isPending || !currentCause || selectedAmount < 1}
                    >
                      {createDonation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-5 w-5 fill-current" />
                          Donate {formatINR(selectedAmount > 0 ? selectedAmount : 0)}
                        </>
                      )}
                    </Button>
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      Secure &amp; encrypted payment processing
                    </div>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
