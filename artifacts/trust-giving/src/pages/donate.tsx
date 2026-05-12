import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCurrentCause, useCreateDonation } from "@workspace/api-client-react";
import { useDonationStore } from "@/store/donation-store";
import { Heart, AlertCircle, Loader2, ShieldCheck, Lock } from "lucide-react";

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
  amount: z.coerce.number().min(1, "Minimum donation is $1").max(1000000, "Maximum limit reached"),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional(),
  isAnonymous: z.boolean().default(false),
});

type DonationFormValues = z.infer<typeof donationSchema>;

const PRESET_AMOUNTS = [25, 50, 100, 250, 500];

export default function Donate() {
  const [, setLocation] = useLocation();
  const { data: currentCause, isLoading: loadingCause } = useGetCurrentCause();
  const createDonation = useCreateDonation();
  const setReceipt = useDonationStore((state) => state.setReceipt);
  
  const [customAmountError, setCustomAmountError] = useState("");

  const form = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      donorName: "",
      email: "",
      phone: "",
      amount: 50,
      message: "",
      isAnonymous: false,
    },
  });

  const onSubmit = async (data: DonationFormValues) => {
    if (!currentCause) return;

    try {
      createDonation.mutate(
        {
          data: {
            ...data,
            causeId: currentCause.id,
            // Ensure phone is null if empty string
            phone: data.phone || null,
          }
        },
        {
          onSuccess: (receipt) => {
            setReceipt(receipt);
            setLocation("/receipt");
          },
          onError: () => {
            // Error is handled globally by api client or we could set local error state
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const selectedAmount = form.watch("amount");

  return (
    <div className="container max-w-6xl px-4 py-12 md:py-20 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Cause Info */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-4">Make a Donation</h1>
            <p className="text-muted-foreground text-lg">
              Your contribution goes directly towards this month's focused cause.
            </p>
          </div>

          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">You are supporting</h2>
            
            {loadingCause ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-48 w-full rounded-xl mt-4" />
              </div>
            ) : currentCause ? (
              <div>
                <h3 className="text-2xl font-serif font-bold mb-3">{currentCause.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {currentCause.description}
                </p>
                
                {currentCause.imageUrl && (
                  <div className="rounded-xl overflow-hidden mb-6 h-48 relative">
                    <img 
                      src={currentCause.imageUrl} 
                      alt={currentCause.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="bg-muted/50 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Goal: ${currentCause.goalAmount.toLocaleString()}</span>
                    <span className="text-primary">${currentCause.raisedAmount.toLocaleString()} raised</span>
                  </div>
                  <div className="w-full bg-border h-2 rounded-full overflow-hidden">
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
                <AlertDescription>No active cause to support this month.</AlertDescription>
              </Alert>
            )}
          </div>
          
          <div className="flex items-start gap-4 text-sm text-muted-foreground p-4 bg-muted/30 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
            <p>Seva Trust ensures 100% of your donation (minus payment processing fees) goes directly to the cause. We operate with full transparency.</p>
          </div>
        </div>

        {/* Right Column - Donation Form */}
        <div className="lg:col-span-7">
          <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Amount Selection */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold font-serif border-b pb-2">1. Select Amount</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PRESET_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => {
                          form.setValue("amount", amount, { shouldValidate: true });
                          setCustomAmountError("");
                        }}
                        className={`py-3 px-4 rounded-xl border-2 text-lg font-bold transition-all ${
                          selectedAmount === amount 
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary ring-offset-1" 
                            : "border-border bg-background hover:border-primary/50 hover:bg-muted"
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                    <div className="col-span-2 md:col-span-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Custom"
                        className={`h-full pl-8 py-3 text-lg font-bold rounded-xl border-2 transition-all ${
                          !PRESET_AMOUNTS.includes(selectedAmount) && selectedAmount > 0
                            ? "border-primary bg-primary/5 ring-1 ring-primary ring-offset-1" 
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

                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold font-serif border-b pb-2">2. Your Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="donorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} className="rounded-lg bg-background" />
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
                            <Input type="email" placeholder="jane@example.com" {...field} className="rounded-lg bg-background" />
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
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} className="rounded-lg bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-background mt-4 shadow-sm">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            Make this donation anonymous
                          </FormLabel>
                          <FormDescription>
                            Your name will not appear on the public Donor Wall.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Message */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold font-serif border-b pb-2">3. Leave a Message (Optional)</h3>
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Words of Support</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share why you're supporting this cause..." 
                            className="resize-none rounded-lg bg-background min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This will be displayed alongside your donation on the wall.
                        </FormDescription>
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
                        Processing Securely...
                      </>
                    ) : (
                      <>
                        <Heart className="mr-2 h-5 w-5 fill-current" />
                        Donate ${selectedAmount > 0 ? selectedAmount.toLocaleString() : "0"}
                      </>
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground font-medium">
                    <Lock className="w-3 h-3" />
                    Secure encrypted payment processing
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}