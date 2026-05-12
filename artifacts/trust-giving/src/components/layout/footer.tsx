import { Heart } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 inline-flex">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-primary">Ikshana Charitable Trust</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              A registered charitable trust bringing communities together every month to support meaningful causes across India.
              Because collective seva changes lives.
            </p>
            <p className="text-xs text-muted-foreground">
              Registered under the Indian Trusts Act. Donations eligible for 80G tax exemption.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/causes" className="hover:text-primary transition-colors">Monthly Causes</Link></li>
              <li><Link href="/donors" className="hover:text-primary transition-colors">Donor Wall</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">About the Trust</a></li>
              <li><Link href="/donate" className="hover:text-primary transition-colors font-medium">Donate Now</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Ikshana Charitable Trust. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-destructive fill-current" />
            <span>for Bharat</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
