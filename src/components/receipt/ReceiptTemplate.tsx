import { forwardRef } from "react"
import { Receipt } from "lucide-react"
import { useLanguage, useT } from "@/i18n/LanguageProvider"
import { formatTotalWeight, formatUnitWeight } from "@/lib/formatters"
import { DEFAULT_RECEIPT_COLUMNS, type Company, type Receipt as ReceiptType } from "@/types"

type Props = {
  receipt: ReceiptType
  company: Company
}

const FIXED_WIDTH = 760

export const ReceiptTemplate = forwardRef<HTMLDivElement, Props>(function ReceiptTemplate(
  { receipt, company },
  ref
) {
  const t = useT()
  const { dir, language } = useLanguage()

  const totalQty = receipt.items.reduce((s, it) => s + it.quantity, 0)
  const totalKg = receipt.items.reduce(
    (s, it) => s + it.quantity * it.weight,
    0
  )

  const columns = { ...DEFAULT_RECEIPT_COLUMNS, ...(company.receiptColumns ?? {}) }
  const labelColSpan = 1 + (columns.sign ? 1 : 0)

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
            {columns.sign ? (
              <th style={{ padding: cellPadding, textAlign: "start", fontWeight: 600 }}>
                {t.receipts.sign}
              </th>
            ) : null}
            {columns.count ? (
              <th style={{ padding: cellPadding, textAlign: "end", fontWeight: 600 }}>
                {t.receipts.quantity}
              </th>
            ) : null}
            {columns.unitWeight ? (
              <th style={{ padding: cellPadding, textAlign: "end", fontWeight: 600 }}>
                {t.receipts.weight}
              </th>
            ) : null}
            {columns.totalWeight ? (
              <th style={{ padding: cellPadding, textAlign: "end", fontWeight: 600 }}>
                {t.receipts.totalWeightCol}
              </th>
            ) : null}
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
                {columns.sign ? (
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
                ) : null}
                {columns.count ? (
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "end",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.quantity}
                  </td>
                ) : null}
                {columns.unitWeight ? (
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "end",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatUnitWeight(item.weight)}
                  </td>
                ) : null}
                {columns.totalWeight ? (
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "end",
                      fontVariantNumeric: "tabular-nums",
                      fontWeight: 500,
                    }}
                  >
                    {formatUnitWeight(item.quantity * item.weight)}
                  </td>
                ) : null}
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={labelColSpan}
              style={{
                padding: footerCellPadding,
                fontWeight: 600,
                background: "#f5f5f5",
                borderTop: "1px solid #d4d4d4",
              }}
            >
              {t.common.total}
            </td>
            {columns.count ? (
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
            ) : null}
            {columns.unitWeight ? (
              <td
                style={{
                  padding: footerCellPadding,
                  background: "#f5f5f5",
                  borderTop: "1px solid #d4d4d4",
                }}
              />
            ) : null}
            {columns.totalWeight ? (
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
                {formatTotalWeight(totalKg)}
              </td>
            ) : null}
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
