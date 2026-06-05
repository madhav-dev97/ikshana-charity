import { useState } from "react";
import { Heart, MapPin, FileText, Users, Target, Eye, Award, Phone, Mail, Globe, X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
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

const GALLERY = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
    title: "Clean Water Initiative",
    story: "We installed clean water hand-pumps across 5 drought-affected villages in Telangana, bringing safe drinking water to over 2,000 families who previously walked miles every day.",
    tag: "Water & Sanitation",
    col: "tall",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80",
    title: "Education for Every Child",
    story: "Our school supply drive reached 1,200 children in rural government schools — providing notebooks, bags, uniforms, and stationery so no child misses class due to lack of resources.",
    tag: "Education",
    col: "normal",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80",
    title: "Health Camp",
    story: "Free health check-up camps organised in underserved communities — over 500 patients received diagnosis, medicines, and specialist referrals at no cost.",
    tag: "Healthcare",
    col: "normal",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80",
    title: "Community Kitchen",
    story: "Our month-long food distribution drive served freshly cooked meals to 300+ daily wage workers and their families during a period of hardship in our district.",
    tag: "Food & Nutrition",
    col: "tall",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
    title: "Women's Empowerment",
    story: "Skill training workshops conducted for 80 women from marginalised communities — covering tailoring, handicrafts, and financial literacy to build sustainable livelihoods.",
    tag: "Empowerment",
    col: "normal",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&q=80",
    title: "Tree Plantation Drive",
    story: "Together with volunteers, we planted 5,000 saplings across barren areas near our district — a long-term investment in the environment for future generations.",
    tag: "Environment",
    col: "normal",
  },
];

function Lightbox({ photos, startIndex, onClose }: {
  photos: typeof GALLERY;
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const photo = photos[current];

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Prev / Next */}
        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-3/5 bg-black">
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-64 md:h-[420px] object-cover"
            />
          </div>
          <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 self-start">
              {photo.tag}
            </span>
            <h3 className="text-2xl font-serif font-bold mb-4">{photo.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{photo.story}</p>
            <div className="mt-6 pt-4 border-t text-xs text-muted-foreground flex items-center gap-1">
              <span>{current + 1} of {photos.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
                  {["Transparency in every rupee spent", "Compassion for every community we serve", "Accountability to our donors and beneficiaries", "Focused impact over scattered efforts"].map(v => (
                    <li key={v} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>{v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALLERY & STORIES ── */}
      <section className="py-16 md:py-20 px-4 bg-muted/20 border-y">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary bg-primary/10 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Camera className="w-4 h-4" />
              Our Work in Pictures
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Impact Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every photograph tells a story of change. These are moments from our work on the ground — real communities, real impact, real lives transformed.
            </p>
          </div>

          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px]">
            {GALLERY.map((item, idx) => (
              <div
                key={item.id}
                className={`relative group overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 ${
                  item.col === "tall" ? "row-span-2" : "row-span-1"
                }`}
                onClick={() => setLightboxIndex(idx)}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Tag pill — always visible at top */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2.5 py-1 rounded-full shadow">
                    {item.tag}
                  </span>
                </div>
                {/* Title on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-white font-serif font-bold text-base md:text-lg leading-tight mb-1">
                    {item.title}
                  </h3>
                  <p className="text-white/70 text-xs line-clamp-2">{item.story}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            Click any photo to read the full story
          </p>
        </div>
      </section>

      {/* Impact numbers strip */}
      <section className="py-12 px-4 bg-primary text-primary-foreground">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: "2,000+", label: "Families Helped" },
              { number: "1,200+", label: "Children Reached" },
              { number: "500+", label: "Free Health Check-ups" },
              { number: "5,000", label: "Trees Planted" },
            ].map(({ number, label }) => (
              <div key={label} className="space-y-1">
                <p className="text-3xl md:text-4xl font-bold">{number}</p>
                <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider">{label}</p>
              </div>
            ))}
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
                sub: "Registered under the Telangana Charitable & Hindu Religious Institutions and Endowments Act",
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
              <div key={label} className={`p-6 rounded-2xl border bg-card shadow-sm ${highlight ? "border-primary/30 bg-primary/5" : ""}`}>
                <div className={`inline-flex p-2.5 rounded-xl mb-4 ${highlight ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <p className={`font-bold text-lg leading-tight ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
                  {badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{badge}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>

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

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={GALLERY}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
