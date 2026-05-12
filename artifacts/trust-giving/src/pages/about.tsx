import { Heart, MapPin, FileText, Users, Target, Eye, Award, Phone, Mail, Globe } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const REGISTRATION = {
  trustReg: "242/2023",
  state: "Telangana",
  ngoDarpan: "[Awaited — Application Submitted]",
  pan: "[PAN — To Be Updated]",
  year: "2023",
  address: "[Registered Address — To Be Updated]",
  email: "ikshanacharitabletrust@gmail.com",
  phone: "[Contact Number — To Be Updated]",
};

export default function About() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="container max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary-foreground/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Heart className="w-4 h-4 fill-current" />
            Established {REGISTRATION.year} · {REGISTRATION.state}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">About Us</h1>
          <p className="text-2xl font-serif italic text-primary-foreground/80 mb-4">Manava Seve, Madhava Seva</p>
          <p className="text-primary-foreground/70 text-base">Service to Man is Service to God</p>
        </div>
      </div>

      {/* Who We Are */}
      <section className="py-16 md:py-20 px-4 bg-background">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-10 h-1 bg-primary mb-6 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Who We Are</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                <strong className="text-foreground">IKSHANA CHARITABLE TRUST</strong> is a registered charitable trust based in {REGISTRATION.state}, India. Founded in {REGISTRATION.year}, we are a community-driven non-governmental organisation committed to bringing meaningful, focused change to the lives of underserved communities across India.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our model is simple but powerful: every month, we identify one carefully vetted cause, pool the generosity of our donor community, and deliver concentrated, transparent impact. No distractions, no overhead — just purpose.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe in the ancient wisdom: <em>"Manava Seve, Madhava Seva"</em> — that serving humanity is the highest form of devotion. This principle guides every decision we make.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/15">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Our Vision</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  An India where no community is left behind — where access to education, healthcare, clean water, and opportunity is a right for every citizen.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/15">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Our Mission</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  To mobilise community generosity around one focused cause each month, ensuring 100% of every donation reaches those who need it most, with full transparency and accountability.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/15">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <h3 className="font-bold text-lg">Our Values</h3>
                </div>
                <ul className="text-muted-foreground text-sm space-y-1.5">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>Transparency in every rupee spent</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>Compassion for every community we serve</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>Accountability to our donors and beneficiaries</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>Focused impact over scattered efforts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Details */}
      <section className="py-16 px-4 bg-muted/30 border-y">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-10 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
            <h2 className="text-3xl font-serif font-bold mb-3">Legal & Registration Details</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              IKSHANA CHARITABLE TRUST is a legally registered organisation. All registrations and compliances are maintained as required by the Government of India and the State of Telangana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                label: "Trust Registration No.",
                value: REGISTRATION.trustReg,
                sub: `Registered under the Telangana Charitable & Hindu Religious Institutions and Endowments Act`,
                highlight: true,
              },
              {
                icon: Globe,
                label: "NGO Darpan (NITI Aayog)",
                value: REGISTRATION.ngoDarpan,
                sub: "Registered on the Government of India's NGO Darpan portal",
                highlight: false,
              },
              {
                icon: Award,
                label: "PAN of Trust",
                value: REGISTRATION.pan,
                sub: "Permanent Account Number issued by the Income Tax Department",
                highlight: false,
              },
              {
                icon: Award,
                label: "80G Exemption",
                value: "Application in Progress",
                sub: "We are in the process of applying for 80G tax exemption. Receipt will be updated once approved.",
                highlight: false,
                badge: "Pending",
              },
              {
                icon: MapPin,
                label: "State",
                value: "Telangana, India",
                sub: "Registered and operating under the laws of Telangana State",
                highlight: false,
              },
              {
                icon: Users,
                label: "Established",
                value: REGISTRATION.year,
                sub: "Committed to serving communities across India since our founding",
                highlight: false,
              },
            ].map(({ icon: Icon, label, value, sub, highlight, badge }) => (
              <div key={label} className={`p-6 rounded-2xl border bg-card shadow-sm ${highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
                <div className={`inline-flex p-2.5 rounded-xl mb-4 ${highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <p className={`font-bold text-lg leading-tight ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
                  {badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{badge}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>

          {/* Registered Address */}
          <div className="mt-8 p-6 rounded-2xl border bg-card shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-muted p-2.5 rounded-xl text-muted-foreground shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Registered Address</p>
                <p className="font-semibold text-foreground">{REGISTRATION.address}</p>
                <p className="text-sm text-muted-foreground mt-1">Telangana, India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 bg-card">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-10 h-1 bg-primary mb-6 rounded-full"></div>
              <h2 className="text-3xl font-serif font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Have a question, want to partner with us, or would like to volunteer? We'd love to hear from you. Reach out and we'll get back to you as soon as possible.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Mail className="w-4 h-4" />
                  </div>
                  <a href={`mailto:${REGISTRATION.email}`} className="hover:text-primary transition-colors font-medium">
                    {REGISTRATION.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-muted-foreground">{REGISTRATION.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-muted-foreground">Telangana, India</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-8 text-center">
              <Heart className="w-12 h-12 text-primary fill-current mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold mb-3">Make a Difference Today</h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Every rupee you donate goes directly to this month's cause. Join our growing community of givers and help us create lasting change across India.
              </p>
              <Link href="/donate">
                <Button size="lg" className="rounded-full shadow-md w-full">
                  Donate Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
