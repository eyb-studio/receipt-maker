import { NavLink, Outlet } from "react-router-dom"
import { Package, Receipt, Settings, Users } from "lucide-react"
import { useT } from "@/i18n/LanguageProvider"
import { useCompany } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { ThemeToggle } from "./ThemeToggle"

export function AppShell() {
  const t = useT()
  const { company } = useCompany()

  const navItems = [
    { to: "/", label: t.nav.receipts, icon: Receipt, end: true },
    { to: "/clients", label: t.nav.clients, icon: Users },
    { to: "/products", label: t.nav.products, icon: Package },
    { to: "/settings", label: t.nav.settings, icon: Settings },
  ]

  return (
    <div className="bg-background min-h-svh">
      <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3 min-w-0">
            {company.logo ? (
              <img src={company.logo} alt="" className="size-8 rounded object-contain" />
            ) : (
              <div className="bg-primary/10 text-primary grid size-8 place-items-center rounded">
                <Receipt className="size-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {company.name || t.appName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pb-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
