import { forwardRef } from "react"
import { ScrollText } from "lucide-react"
import { useLanguage, useT } from "@/i18n/LanguageProvider"
import { formatAmount, formatMoney, layoutColumns, priceListTotals } from "@/lib/formatters"
import { DEFAULT_PRICE_LIST_CONFIG } from "@/types"
import type { Company, PriceList as PriceListType } from "@/types"

type Props = {
  priceList: PriceListType
  company: Company
}

const FIXED_WIDTH = 760

export const PriceListTemplate = forwardRef<HTMLDivElement, Props>(function PriceListTemplate(
  { priceList, company },
  ref
) {
  const t = useT()
  const { dir, language } = useLanguage()

  const totals = priceListTotals(priceList)

  const config = { ...DEFAULT_PRICE_LIST_CONFIG, ...(company.priceListConfig ?? {}) }
  const columns = layoutColumns(
    priceList.items,
    config.itemsPerColumn,
    config.maxColumns
  )
  const columnCount = columns.length

  const formattedDate = (() => {
    try {
      return new Date(priceList.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return priceList.date
    }
  })()

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
              <ScrollText style={{ width: "28px", height: "28px" }} />
            </div>
          )}
          <div style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>
            {company.name || t.appName}
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
            {priceList.title || `#${priceList.number}`}
          </div>
          <div style={{ marginTop: "4px", fontSize: "14px", color: "#525252" }}>
            {formattedDate}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "28px",
          display: "grid",
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          gap: "0 24px",
          alignItems: "start",
        }}
      >
        {columns.map((col, colIdx) => (
          <table
            key={colIdx}
            style={{
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
                <th style={{ padding: "8px 12px", textAlign: "start", fontWeight: 600 }}>
                  {t.pricelists.item}
                </th>
                <th style={{ padding: "8px 12px", textAlign: "end", fontWeight: 600 }}>
                  {t.pricelists.price}
                </th>
              </tr>
            </thead>
            <tbody>
              {col.map((item, idx) => {
                const cellStyle: React.CSSProperties = {
                  padding: "7px 12px",
                  background: idx % 2 === 0 ? "#fafafa" : "#ffffff",
                  borderBottom: "1px solid #ececec",
                }
                return (
                  <tr key={item.id}>
                    <td style={{ ...cellStyle, fontWeight: 500 }}>{item.name}</td>
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "end",
                        fontVariantNumeric: "tabular-nums",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatAmount(item.price)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ))}
      </div>

      <div
        style={{
          marginTop: "24px",
          marginLeft: dir === "rtl" ? 0 : "auto",
          marginRight: dir === "rtl" ? "auto" : 0,
          width: "320px",
          maxWidth: "100%",
        }}
      >
        <TotalLine
          label={`${t.pricelists.subtotal} (${priceList.items.length} ${t.pricelists.itemCount})`}
          value={formatAmount(totals.subtotal)}
        />
        {totals.commission ? (
          <TotalLine
            label={
              priceList.commissionIsPercent
                ? `${t.pricelists.commission} (${priceList.commission}${t.pricelists.percent})`
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

      {priceList.notes ? (
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
            {priceList.notes}
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
