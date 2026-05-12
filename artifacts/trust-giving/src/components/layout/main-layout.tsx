import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}