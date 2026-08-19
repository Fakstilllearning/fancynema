import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function SiteHeader() {
  const { session, canEdit, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl leading-none tracking-widest text-primary">
            TONTONAN
          </span>
          <span className="hidden text-xs uppercase tracking-[0.3em] text-muted-foreground sm:inline">
            Katalog Pribadi
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link
            to="/"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Beranda
          </Link>
          {canEdit && (
            <Link
              to="/manage"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              Kelola
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/access"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              Akses
            </Link>
          )}
          {session ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              Keluar
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Masuk</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
