import { useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useCompany } from "@/lib/storage"
import { useLanguage, useT } from "@/i18n/LanguageProvider"
import { languages, type Language } from "@/i18n/translations"
import { useTheme } from "@/components/theme-provider"
import { PageHeader } from "@/components/PageHeader"
import {
  useUnsavedChangesGuard,
  UnsavedChangesPrompt,
} from "@/hooks/useUnsavedChangesGuard"

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function SettingsPage() {
  const t = useT()
  const { company, setCompany } = useCompany()
  const { language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(company.name)
  const [primary, setPrimary] = useState(company.primaryColor)
  const [accent, setAccent] = useState(company.accentColor)

  const isDirty =
    name !== company.name ||
    primary !== company.primaryColor ||
    accent !== company.accentColor
  const blocker = useUnsavedChangesGuard(isDirty)

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2 MB")
      return
    }
    const dataUrl = await readFileAsDataUrl(file)
    setCompany({ ...company, logo: dataUrl })
    toast.success(t.common.saved)
  }

  const handleSaveBranding = () => {
    setCompany({ ...company, name: name.trim(), primaryColor: primary, accentColor: accent })
    toast.success(t.common.saved)
  }

  return (
    <>
      <PageHeader title={t.settings.title} />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.branding}</CardTitle>
            <CardDescription>{t.settings.brandingDesc}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label>{t.settings.logo}</Label>
              <div className="flex items-center gap-4">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt=""
                    className="bg-muted size-16 rounded-md border object-contain p-1"
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground grid size-16 place-items-center rounded-md border text-xs">
                    {t.settings.logo}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload className="size-4" />
                    {t.actions.upload}
                  </Button>
                  {company.logo ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCompany({ ...company, logo: undefined })
                        toast.success(t.common.saved)
                      }}
                    >
                      <X className="size-4" />
                      {t.actions.remove_logo}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-name">{t.settings.companyName}</Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.settings.companyNamePlaceholder}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorInput
                id="primary"
                label={t.settings.primaryColor}
                value={primary}
                onChange={setPrimary}
              />
              <ColorInput
                id="accent"
                label={t.settings.accentColor}
                value={accent}
                onChange={setAccent}
              />
            </div>

            <div>
              <Button onClick={handleSaveBranding} disabled={!isDirty}>
                {t.actions.save}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.settings.preferences}</CardTitle>
            <CardDescription>{t.settings.preferencesDesc}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t.common.language}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t.common.theme}</Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t.common.light}</SelectItem>
                  <SelectItem value="dark">{t.common.dark}</SelectItem>
                  <SelectItem value="system">{t.common.system}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <UnsavedChangesPrompt
        blocker={blocker}
        title={t.settings.unsavedTitle}
        description={t.settings.unsavedDesc}
        discardLabel={t.settings.discard}
      />
    </>
  )
}

function ColorInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <label
          className="border-input relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-md border"
          style={{ background: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
      </div>
    </div>
  )
}
