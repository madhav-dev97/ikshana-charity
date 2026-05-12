import { Link, useLocation } from "wouter";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/causes", label: "Monthly Causes" },
    { href: "/donors", label: "Donor Wall" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-sm font-bold tracking-tight text-primary leading-none">IKSHANA CHARITABLE TRUST</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide">Manava Seve, Madhava Seva</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary relative py-2",
                location === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
              {location === link.href && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in zoom-in" />
              )}
            </Link>
          ))}
          <Link href="/donate" className="ml-4">
            <Button className="rounded-full shadow-md hover:shadow-lg transition-all font-semibold">
              Donate Now
            </Button>
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block text-lg font-medium p-2 rounded-md transition-colors",
                location === link.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/donate" onClick={() => setIsOpen(false)} className="mt-2">
            <Button className="w-full rounded-full" size="lg">
              Donate Now
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
