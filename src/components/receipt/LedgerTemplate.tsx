import { forwardRef } from "react"
import { ClipboardList } from "lucide-react"
import { useLanguage, useT } from "@/i18n/LanguageProvider"
import { formatAmount, formatMoney, rowBalance } from "@/lib/formatters"
import type { Company, Ledger as LedgerType } from "@/types"

type Props = {
  ledger: LedgerType
  company: Company
}

const FIXED_WIDTH = 760

export const LedgerTemplate = forwardRef<HTMLDivElement, Props>(function LedgerTemplate(
  { ledger, company },
  ref
) {
  const t = useT()
  const { dir, language } = useLanguage()

  // مانده is a running balance: each row carries the previous rows forward.
  const cumulativeBalances: number[] = (() => {
    let acc = 0
    return ledger.rows.map((r) => (acc += rowBalance(r)))
  })()
  const grandTotal = cumulativeBalances[cumulativeBalances.length - 1] ?? 0

  const formattedDate = (() => {
    try {
      return new Date(ledger.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return ledger.date
    }
  })()

  const formatRowDate = (value?: string) => {
    if (!value) return ""
    try {
      return new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    } catch {
      return value
    }
  }

  const cellPadding = "12px 20px"
  const footerCellPadding = "14px 20px"
  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#737373",
  }
  const numCellBase: React.CSSProperties = {
    padding: cellPadding,
    textAlign: "end",
    fontVariantNumeric: "tabular-nums",
  }

  return (
    <div
      ref={ref}
      dir={dir}
      lang={language}
      style={{
        fontFamily:
          '"Vazirmatn Variable", "Inter Variable", system-ui, sans-serif',
        borderTop: `6px solid ${company.primaryColor}`,
        padding: "40px",
        background: "#ffffff",
        color: "#171717",
        width: `${FIXED_WIDTH}px`,
        marginLeft: "auto",
        marginRight: "auto",
        boxSizing: "border-box",
        lineHeight: 1.4,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "24px",
          paddingBottom: "20px",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {company.logo ? (
            <img
              src={company.logo}
              alt=""
              style={{
                width: "56px",
                height: "56px",
                objectFit: "contain",
                borderRadius: "6px",
              }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                display: "grid",
                placeItems: "center",
                color: "#ffffff",
                borderRadius: "6px",
                background: company.primaryColor,
              }}
            >
              <ClipboardList style={{ width: "28px", height: "28px" }} />
            </div>
          )}
          <div style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>
            {company.name || t.appName}
          </div>
        </div>
        <div style={{ textAlign: dir === "rtl" ? "left" : "right" }}>
          <div style={labelStyle}>{t.ledgers.titleLabel}</div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: company.accentColor,
            }}
          >
            {ledger.title || `#${ledger.number}`}
          </div>
          <div style={{ marginTop: "4px", fontSize: "14px", color: "#525252" }}>
            {formattedDate}
          </div>
        </div>
      </div>

      <table
        style={{
          marginTop: "28px",
          width: "100%",
          fontSize: "14px",
          borderCollapse: "separate",
          borderSpacing: 0,
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #e5e5e5",
        }}
      >
        <thead>
          <tr style={{ background: company.primaryColor, color: "#ffffff" }}>
            <th style={{ padding: cellPadding, textAlign: "start", fontWeight: 600 }}>
              {t.ledgers.name}
            </th>
            <th style={{ padding: cellPadding, textAlign: "end", fontWeight: 600 }}>
              {t.ledgers.invoice}
            </th>
            <th style={{ padding: cellPadding, textAlign: "end", fontWeight: 600 }}>
              {t.ledgers.commission}
            </th>
            <th style={{ padding: cellPadding, textAlign: "end", fontWeight: 600 }}>
              {t.ledgers.cash}
            </th>
            <th style={{ padding: cellPadding, textAlign: "end", fontWeight: 600 }}>
              {t.ledgers.balance}
            </th>
            <th style={{ padding: cellPadding, textAlign: "start", fontWeight: 600 }}>
              {t.common.date}
            </th>
          </tr>
        </thead>
        <tbody>
          {ledger.rows.map((row, idx) => {
            const cellStyle: React.CSSProperties = {
              padding: cellPadding,
              background: idx % 2 === 0 ? "#fafafa" : "#ffffff",
              borderBottom: "1px solid #ececec",
            }
            return (
              <tr key={row.id}>
                <td style={{ ...cellStyle, fontWeight: 500 }}>{row.name}</td>
                <td style={{ ...cellStyle, ...numCellBase }}>
                  {formatAmount(row.invoice)}
                </td>
                <td style={{ ...cellStyle, ...numCellBase }}>
                  {formatAmount(row.commission)}
                </td>
                <td style={{ ...cellStyle, ...numCellBase }}>
                  {formatAmount(row.cash)}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    ...numCellBase,
                    fontWeight: 600,
                    color: company.accentColor,
                  }}
                >
                  {formatAmount(cumulativeBalances[idx])}
                </td>
                <td style={{ ...cellStyle, color: "#525252", whiteSpace: "nowrap" }}>
                  {formatRowDate(row.date)}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={4}
              style={{
                padding: footerCellPadding,
                fontWeight: 700,
                background: "#f5f5f5",
                borderTop: "1px solid #d4d4d4",
              }}
            >
              {t.ledgers.grandTotal}
            </td>
            <td
              style={{
                ...numCellBase,
                padding: footerCellPadding,
                fontWeight: 700,
                background: "#f5f5f5",
                color: company.accentColor,
                borderTop: "1px solid #d4d4d4",
              }}
            >
              {formatMoney(grandTotal)}
            </td>
            <td
              style={{
                padding: footerCellPadding,
                background: "#f5f5f5",
                borderTop: "1px solid #d4d4d4",
              }}
            />
          </tr>
        </tfoot>
      </table>

      {ledger.notes ? (
        <div style={{ marginTop: "24px" }}>
          <div style={labelStyle}>{t.common.notes}</div>
          <p
            style={{
              marginTop: "4px",
              fontSize: "14px",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {ledger.notes}
          </p>
        </div>
      ) : null}
    </div>
  )
})
