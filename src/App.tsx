import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell"
import { PwaUpdatePrompt } from "@/components/PwaUpdatePrompt"
import { LanguageProvider } from "@/i18n/LanguageProvider"
import { ReceiptsListPage } from "@/pages/ReceiptsListPage"
import { ReceiptEditorPage } from "@/pages/ReceiptEditorPage"
import { ReceiptViewPage } from "@/pages/ReceiptViewPage"
import { ClientsPage } from "@/pages/ClientsPage"
import { ProductsPage } from "@/pages/ProductsPage"
import { SettingsPage } from "@/pages/SettingsPage"

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <ReceiptsListPage /> },
      { path: "receipts/new", element: <ReceiptEditorPage /> },
      { path: "receipts/:id", element: <ReceiptViewPage /> },
      { path: "receipts/:id/edit", element: <ReceiptEditorPage /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])

export function App() {
  return (
    <LanguageProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
      <PwaUpdatePrompt />
    </LanguageProvider>
  )
}

export default App
