import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "./theme-provider";
import logoMark from "@/assets/greenlink-mark.png";
import { GlobalSearch } from "@/components/layout/global-search";
import { UserMenu } from "./user-menu";

export function AppHeader() {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 backdrop-blur px-3 md:px-4">
      <SidebarTrigger className="hidden md:inline-flex" />
      <img src={logoMark} alt="GreenLink" className="h-7 w-auto max-w-full object-contain md:hidden" />
      <div className="flex-1 flex items-center">
        <GlobalSearch />
      </div>
      <Button variant="ghost" size="icon" aria-label="Notificações">
        <Bell className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
      <UserMenu />
    </header>
  );
}
