import { Heart } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 inline-flex">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-serif text-sm font-bold tracking-tight text-primary">IKSHANA CHARITABLE TRUST</span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">Manava Seve, Madhava Seva</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              A registered charitable trust bringing communities together every month to support meaningful causes across India.
              Because collective giving changes lives.
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Registered under the Indian Trusts Act</p>
              <p>Donations eligible for 80G tax exemption · FCRA Compliant</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/causes" className="hover:text-primary transition-colors">Monthly Causes</Link></li>
              <li><Link href="/donors" className="hover:text-primary transition-colors">Donor Wall</Link></li>
              <li><Link href="/donate" className="hover:text-primary transition-colors font-medium text-primary">Donate Now</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Trust</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">80G Certificate</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} IKSHANA CHARITABLE TRUST. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-primary fill-current" />
            <span>for India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
