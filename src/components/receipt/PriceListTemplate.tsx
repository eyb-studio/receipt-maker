import { forwardRef } from "react"
import { ScrollText } from "lucide-react"
import { useLanguage, useT } from "@/i18n/LanguageProvider"
import { formatAmount, formatMoney, pickColumnCount, splitIntoColumns } from "@/lib/formatters"
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

  const total = priceList.items.reduce((sum, it) => sum + it.price, 0)

  const columnCount = pickColumnCount(priceList.items.length)
  const columns = splitIntoColumns(priceList.items, columnCount)

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          background: "#f5f5f5",
          borderTop: `2px solid ${company.primaryColor}`,
          padding: "14px 20px",
          borderRadius: "0 0 6px 6px",
        }}
      >
        <div style={{ fontSize: "13px", color: "#525252" }}>
          {`${priceList.items.length} ${t.pricelists.itemCount}`}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
          <span style={labelStyle}>{t.pricelists.grandTotal}</span>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: company.accentColor,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatMoney(total)}
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
