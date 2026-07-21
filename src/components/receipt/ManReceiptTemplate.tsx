import { forwardRef } from "react"
import { Scale } from "lucide-react"
import { useLanguage, useT } from "@/i18n/LanguageProvider"
import {
  formatAmount,
  formatMoney,
  formatTotalWeight,
  formatUnitWeight,
  manLineAmount,
  manReceiptTotals,
} from "@/lib/formatters"
import type { Company, ManReceipt as ManReceiptType } from "@/types"

type Props = {
  manReceipt: ManReceiptType
  company: Company
}

const FIXED_WIDTH = 760

export const ManReceiptTemplate = forwardRef<HTMLDivElement, Props>(function ManReceiptTemplate(
  { manReceipt, company },
  ref
) {
  const t = useT()
  const { dir, language } = useLanguage()

  const totals = manReceiptTotals(manReceipt)

  // Individual cost lines shown under the هزینه‌ها total.
  const expenseItems = manReceipt.expenseItems ?? []

  // Numeric Gregorian DD/MM/YYYY. Parse the ISO parts directly so there's no
  // timezone day-shift or localized month name.
  const formattedDate = (() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(manReceipt.date)
    return m ? `${m[3]}/${m[2]}/${m[1]}` : manReceipt.date
  })()

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#737373",
  }

  const cellPadding = "10px 14px"
  const footerCellPadding = "12px 14px"
  const numericCell: React.CSSProperties = {
    textAlign: "end",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  }

  return (
    <div
      ref={ref}
      dir={dir}
      lang={language}
      style={{
        fontFamily: '"Vazirmatn Variable", "Inter Variable", system-ui, sans-serif',
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
              <Scale style={{ width: "28px", height: "28px" }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>
              {company.name || t.appName}
            </div>
            {manReceipt.basketCount ? (
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: company.accentColor,
                }}
              >
                {`${t.pricelists.baskets} : ${manReceipt.basketCount}`}
              </div>
            ) : null}
          </div>
        </div>
        <div style={{ textAlign: dir === "rtl" ? "left" : "right" }}>
          <div style={labelStyle}>{t.pricelists.titleLabel}</div>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: company.accentColor,
            }}
          >
            {manReceipt.title || `#${manReceipt.number}`}
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
          fontSize: "13px",
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
              {t.pricelists.item}
            </th>
            <th style={{ padding: cellPadding, ...numericCell, fontWeight: 600 }}>
              {t.manreceipts.weight}
            </th>
            <th style={{ padding: cellPadding, ...numericCell, fontWeight: 600 }}>
              {t.manreceipts.pricePerMan}
            </th>
            <th style={{ padding: cellPadding, ...numericCell, fontWeight: 600 }}>
              {t.manreceipts.amount}
            </th>
          </tr>
        </thead>
        <tbody>
          {manReceipt.items.map((item, idx) => {
            const cellStyle: React.CSSProperties = {
              padding: cellPadding,
              background: idx % 2 === 0 ? "#fafafa" : "#ffffff",
              borderBottom: "1px solid #ececec",
            }
            return (
              <tr key={item.id}>
                <td style={{ ...cellStyle, fontWeight: 500 }}>{item.name}</td>
                <td style={{ ...cellStyle, ...numericCell }}>
                  {formatUnitWeight(item.weight)}
                </td>
                <td style={{ ...cellStyle, ...numericCell }}>
                  {formatAmount(item.pricePerMan)}
                </td>
                <td style={{ ...cellStyle, ...numericCell, fontWeight: 600 }}>
                  {formatAmount(manLineAmount(item))}
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <td
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
                ...numericCell,
                fontWeight: 700,
                background: "#f5f5f5",
                color: company.accentColor,
                borderTop: "1px solid #d4d4d4",
              }}
            >
              {formatTotalWeight(totals.totalWeight)}
            </td>
            <td
              style={{
                padding: footerCellPadding,
                background: "#f5f5f5",
                borderTop: "1px solid #d4d4d4",
              }}
            />
            <td
              style={{
                padding: footerCellPadding,
                ...numericCell,
                fontWeight: 700,
                background: "#f5f5f5",
                color: company.accentColor,
                borderTop: "1px solid #d4d4d4",
              }}
            >
              {formatAmount(totals.subtotal)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div
        style={{
          marginTop: "24px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        {expenseItems.length ? (
          <div
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              padding: "10px 0",
              minWidth: "200px",
              fontSize: "13px",
            }}
          >
            {expenseItems.map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "16px",
                  padding: "5px 16px",
                  color: "#525252",
                }}
              >
                <span>{e.label || t.pricelists.expenses}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {formatAmount(e.amount)}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "16px",
                marginTop: "4px",
                padding: "8px 16px 2px",
                borderTop: "1px solid #e5e5e5",
                fontWeight: 700,
              }}
            >
              <span>{t.pricelists.expenses}</span>
              <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                {formatAmount(totals.expenses)}
              </span>
            </div>
          </div>
        ) : (
          <div />
        )}

        <div style={{ width: "320px", maxWidth: "100%" }}>
          <TotalLine
            label={t.manreceipts.totalWeight}
            value={formatTotalWeight(totals.totalWeight)}
          />
          <TotalLine label={t.pricelists.subtotal} value={formatAmount(totals.subtotal)} />
          {totals.commission ? (
            <TotalLine
              label={
                manReceipt.commissionIsPercent
                  ? `${t.pricelists.commission} (${manReceipt.commission}${t.pricelists.percent})`
                  : t.pricelists.commission
              }
              value={`− ${formatAmount(totals.commission)}`}
            />
          ) : null}
          {totals.expenses ? (
            <TotalLine
              label={t.pricelists.expenses}
              value={`− ${formatAmount(totals.expenses)}`}
            />
          ) : null}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "16px",
              marginTop: "6px",
              background: "#f5f5f5",
              borderTop: `2px solid ${company.primaryColor}`,
              padding: "12px 16px",
              borderRadius: "6px",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 700 }}>{t.pricelists.grandTotal}</span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: company.accentColor,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatMoney(totals.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {manReceipt.notes ? (
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
            {manReceipt.notes}
          </p>
        </div>
      ) : null}
    </div>
  )
})

function TotalLine({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "16px",
        padding: "6px 16px",
        fontSize: "14px",
        color: "#525252",
      }}
    >
      <span>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  )
}
