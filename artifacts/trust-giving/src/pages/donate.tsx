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
  donorName: z.string().min(2, "Naam kam se kam 2 akshar ka hona chahiye"),
  email: z.string().email("Kripya ek valid email address enter karein"),
  phone: z.string().optional(),
  amount: z.coerce.number().min(1, "Minimum donation ₹1 hai").max(10000000, "Maximum limit exceed ho gayi"),
  message: z.string().max(500, "Message 500 characters se adhik nahi ho sakta").optional(),
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
    <div className="animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12 md:py-16 px-4">
        <div className="container max-w-6xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-2">Daan Karein</h1>
          <p className="text-primary-foreground/80 text-lg">
            Aapka yogdan seedha is maah ke cause ke liye jaata hai.
          </p>
        </div>
      </div>

      <div className="container max-w-6xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column - Cause Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Aap Support Kar Rahe Hain</h2>

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

                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Goal: {formatINR(currentCause.goalAmount)}</span>
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
                  <AlertDescription>Is maah support karne ke liye koi active cause nahi hai.</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex items-start gap-4 text-sm text-muted-foreground p-4 bg-green-50 border border-green-200 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 mb-1">100% Transparent</p>
                <p className="text-green-700">Ikshana Charitable Trust aapke daan ka 100% seedha cause ke liye upyog karta hai. Hum 80G tax exemption ke liye registered hain.</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <p className="font-semibold mb-1">80G Tax Benefit</p>
              <p>Aapko is daan par Income Tax Act ki dhara 80G ke antargat tax chhoot mil sakti hai. Receipt mein registration details hongi.</p>
            </div>
          </div>

          {/* Right Column - Donation Form */}
          <div className="lg:col-span-7">
            <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary"></div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  {/* Amount Selection */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-serif border-b pb-2">1. Raashi Chunein</h3>

                    <div className="grid grid-cols-3 gap-3">
                      {PRESET_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => form.setValue("amount", amount, { shouldValidate: true })}
                          className={`py-3 px-4 rounded-xl border-2 text-base font-bold transition-all ${
                            selectedAmount === amount
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border bg-background hover:border-primary/50 hover:bg-muted"
                          }`}
                        >
                          {formatINR(amount)}
                        </button>
                      ))}
                      <div className="col-span-3 relative mt-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">₹</span>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Apni raashi likhein..."
                          className={`pl-9 py-3 text-lg font-bold rounded-xl border-2 transition-all ${
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

                  {/* Personal Details */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-serif border-b pb-2">2. Aapki Jaankari</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="donorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Poora Naam</FormLabel>
                            <FormControl>
                              <Input placeholder="Jaise: Priya Sharma" {...field} className="rounded-lg bg-background" />
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
                          <FormLabel>Mobile Number (Vaikalpik)</FormLabel>
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-background mt-4 shadow-sm">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="cursor-pointer">
                              Daan anonymous rakhein
                            </FormLabel>
                            <FormDescription>
                              Aapka naam public Donor Wall par nazar nahi aayega.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold font-serif border-b pb-2">3. Sandesh (Vaikalpik)</h3>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apni baat kahein</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Is cause ko support karne ki wajah share karein..."
                              className="resize-none rounded-lg bg-background min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Yeh Donor Wall par aapke daan ke saath dikhaya jaayega.
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
                      className="w-full h-14 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
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
                          {formatINR(selectedAmount > 0 ? selectedAmount : 0)} Ka Daan Karein
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground font-medium">
                      <Lock className="w-3 h-3" />
                      Surakshit encrypted payment processing
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
