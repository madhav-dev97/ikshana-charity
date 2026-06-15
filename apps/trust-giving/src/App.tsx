import { Switch, Route, Router as WouterRouter } from "wouter";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { MainLayout } from "@/components/layout/main-layout";

import Home from "@/pages/home";
import Causes from "@/pages/causes";
import Donors from "@/pages/donors";
import Donate from "@/pages/donate";
import Receipt from "@/pages/receipt";
import About from "@/pages/about";
import Admin from "@/pages/admin";
import CauseDetail from "@/pages/cause-detail";

import AdminLogin from "@/pages/admin-login";
import ProtectedRoute from "./components/auth/protected-route";
import { useSupabaseLogo } from "@/hooks/use-supabase-logo";

function FaviconUpdater() {
  const { logoUrl } = useSupabaseLogo();

  useEffect(() => {
    if (!logoUrl) return;

    const setLink = (rel: string) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.type = "image/png";
      link.href = logoUrl;
    };

    setLink("icon");
    setLink("shortcut icon");
    setLink("apple-touch-icon");
  }, [logoUrl]);

  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/causes" component={Causes} />
        <Route path="/cause/:id" component={CauseDetail} />
        <Route path="/donors" component={Donors} />
        <Route path="/donate" component={Donate} />
        <Route path="/receipt" component={Receipt} />
        <Route path="/about" component={About} />
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/admin">
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FaviconUpdater />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;