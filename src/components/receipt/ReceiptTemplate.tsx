import { forwardRef } from "react"
import { Receipt } from "lucide-react"
import { useLanguage, useT } from "@/i18n/LanguageProvider"
import type { Company, Receipt as ReceiptType } from "@/types"

type Props = {
  receipt: ReceiptType
  company: Company
}

const FIXED_WIDTH = 672

export const ReceiptTemplate = forwardRef<HTMLDivElement, Props>(function ReceiptTemplate(
  { receipt, company },
  ref
) {
  const t = useT()
  const { dir, language } = useLanguage()

  const totalQty = receipt.items.reduce((s, it) => s + it.quantity, 0)
  const totalWeight = Number(
    receipt.items.reduce((s, it) => s + it.quantity * it.weight, 0).toFixed(3)
  )

  const formattedDate = (() => {
    try {
      return new Date(receipt.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return receipt.date
    }
  })()

  const cellPadding = "12px 20px"
  const footerCellPadding = "14px 20px"
  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#737373",
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
              <Receipt style={{ width: "28px", height: "28px" }} />
            </div>
          )}
          <div style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>
            {company.name || t.appName}
          </div>
        </div>
        <div style={{ textAlign: dir === "rtl" ? "left" : "right" }}>
          <div style={labelStyle}>{t.receipts.receiptNumber}</div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: company.accentColor,
            }}
          >
            #{receipt.number}
          </div>
          <div style={{ marginTop: "4px", fontSize: "14px", color: "#525252" }}>
            {formattedDate}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px" }}>
        <div style={labelStyle}>{t.receipts.client}</div>
        <div style={{ marginTop: "2px", fontSize: "16px", fontWeight: 500 }}>
          {receipt.clientName || t.receipts.noClient}
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
              {t.receipts.product}
            </th>
            <th style={{ padding: cellPadding, textAlign: "start", fontWeight: 600 }}>
              {t.receipts.sign}
            </th>
            <th style={{ padding: cellPadding, textAlign: "end", fontWeight: 600 }}>
              {t.receipts.quantity}
            </th>
            <th style={{ padding: cellPadding, textAlign: "end", fontWeight: 600 }}>
              {t.receipts.weight}
            </th>
          </tr>
        </thead>
        <tbody>
          {receipt.items.map((item, idx) => {
            const cellStyle: React.CSSProperties = {
              padding: cellPadding,
              background: idx % 2 === 0 ? "#fafafa" : "#ffffff",
              borderBottom: "1px solid #ececec",
            }
            return (
              <tr key={item.id}>
                <td style={{ ...cellStyle, fontWeight: 500 }}>{item.productName}</td>
                <td style={cellStyle}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        borderRadius: "9999px",
                        background: item.colorHex,
                        border: "1px solid rgba(0,0,0,0.1)",
                      }}
                    />
                    <span>{item.colorName}</span>
                  </span>
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "end",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    textAlign: "end",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {item.weight}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={2}
              style={{
                padding: footerCellPadding,
                fontWeight: 600,
                background: "#f5f5f5",
                borderTop: "1px solid #d4d4d4",
              }}
            >
              {t.common.total}
            </td>
            <td
              style={{
                padding: footerCellPadding,
                textAlign: "end",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                background: "#f5f5f5",
                color: company.accentColor,
                borderTop: "1px solid #d4d4d4",
              }}
            >
              {totalQty}
            </td>
            <td
              style={{
                padding: footerCellPadding,
                textAlign: "end",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                background: "#f5f5f5",
                color: company.accentColor,
                borderTop: "1px solid #d4d4d4",
              }}
            >
              {totalWeight}
            </td>
          </tr>
        </tfoot>
      </table>

      {receipt.notes ? (
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
            {receipt.notes}
          </p>
        </div>
      ) : null}
    </div>
  )
})
