import React, { forwardRef, useEffect, useMemo } from "react";

type Brand = {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logoSrc: string;
};

type LineItem = {
  description: string;
  qty?: string | number;
  price?: string | number;
  total?: string | number;
};

type TotalsRow = {
  label: string;
  value: string;
  bold?: boolean;
};

type Props = {
  title: string;
  brand: Brand;
  invoiceToLabel: string;
  invoiceToValue: string;
  numberLabel: string;
  numberValue: string;
  dateLabel: string;
  dateValue: string;
  items: LineItem[];
  paymentInformationTitle?: string;
  paymentInformation: string;
  totals: TotalsRow[];
};

const fmt = (v: unknown) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return v.toLocaleString();
  return String(v);
};

export const HealthspirePrintTemplate = forwardRef<HTMLDivElement, Props>(function HealthspirePrintTemplate(
  {
    title,
    brand,
    invoiceToLabel,
    invoiceToValue,
    numberLabel,
    numberValue,
    dateLabel,
    dateValue,
    items,
    paymentInformationTitle = "PAYMENT INFORMATION:",
    paymentInformation,
    totals,
  },
  ref,
) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  useEffect(() => {
    const id = "hs-poppins-font";
    if (typeof document === "undefined") return;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div ref={ref} className="hs-print-root">
      <style>{`
        .hs-print-root {
          position: relative;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: #ffffff;
          color: #111827;
          font-family: 'Poppins', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          overflow: hidden;
        }

        .hs-print-root * {
          box-sizing: border-box;
        }

        .hs-top-wave,
        .hs-bottom-wave {
          position: absolute;
          left: 0;
          width: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .hs-top-wave { top: 0; height: 110mm; }
        .hs-bottom-wave { bottom: 0; height: 78mm; }

        .hs-content {
          position: relative;
          z-index: 1;
          padding: 28mm 18mm 32mm;
          display: flex;
          flex-direction: column;
          min-height: 297mm;
        }

        @media print {
          .hs-content {
            padding: 24mm 16mm 22mm;
          }
          .hs-title {
            font-size: 42px;
          }
          .hs-contact { font-size: 11px; }
          .hs-table { font-size: 11px; }
          .hs-table th { font-size: 13px; }
          .hs-payment { font-size: 10.5px; }
          .hs-terms { font-size: 10px; }
        }

        .hs-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-top: -10mm;
        }

        .hs-brand img {
          width: 62px;
          height: 62px;
          object-fit: contain;
        }

        .hs-brand-name {
          font-weight: 700;
          font-size: 18px;
          color: #0b6fb3;
          line-height: 1.1;
        }

        .hs-brand-tagline {
          font-size: 10px;
          color: #6b7280;
          margin-top: 2px;
        }

        .hs-contact {
          margin-top: 7mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6mm 10mm;
          font-size: 12px;
          color: #0b6fb3;
        }

        .hs-contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        .hs-icon {
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #0b6fb3;
        }

        .hs-divider {
          margin-top: 8mm;
          border-top: 2px solid #2b6cb0;
          opacity: 0.75;
        }

        .hs-title {
          margin-top: 9mm;
          font-size: 46px;
          line-height: 1.02;
          letter-spacing: 1.2px;
          font-weight: 900;
          color: #0b6fb3;
        }

        .hs-meta {
          margin-top: 5mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10mm;
          font-size: 12px;
          color: #111827;
        }

        .hs-meta-label {
          font-weight: 700;
          letter-spacing: 0.6px;
          color: #0b6fb3;
        }

        .hs-meta-value {
          margin-top: 4px;
          font-size: 13px;
          color: #111827;
        }

        .hs-meta-right {
          text-align: right;
          line-height: 1.8;
        }

        .hs-table-wrap {
          margin-top: 9mm;
        }

        .hs-table {
          width: 100%;
          border-collapse: collapse;
          border: 2px solid #1f2937;
          font-size: 12px;
        }

        .hs-table th,
        .hs-table td {
          border: 1px solid #1f2937;
          padding: 9px 10px;
          vertical-align: top;
        }

        .hs-table tbody td:first-child {
          white-space: pre-line;
          line-height: 1.35;
        }

        .hs-table th {
          font-size: 14px;
          font-weight: 800;
          color: #0b6fb3;
          text-align: left;
          background: #ffffff;
        }

        .hs-table thead th:nth-child(2),
        .hs-table tbody td:nth-child(2) {
          text-align: center;
          width: 14%;
        }

        .hs-table thead th:nth-child(3),
        .hs-table tbody td:nth-child(3),
        .hs-table thead th:nth-child(4),
        .hs-table tbody td:nth-child(4) {
          text-align: right;
          width: 14%;
        }

        .hs-table tbody tr:nth-child(even) td {
          background: #f3f4f6;
        }

        .hs-bottom-grid {
          margin-top: 11mm;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 12mm;
          align-items: start;
        }

        .hs-payment-title {
          font-weight: 800;
          color: #0b6fb3;
          letter-spacing: 0.4px;
          margin-bottom: 6px;
        }

        .hs-payment {
          font-size: 11px;
          color: #111827;
          line-height: 1.55;
          white-space: pre-wrap;
          max-height: 46mm;
          overflow: hidden;
        }

        .hs-totals {
          font-size: 12px;
          line-height: 2.0;
        }

        .hs-extras {
          margin-top: 7mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10mm;
          align-items: end;
        }

        .hs-terms-title {
          font-weight: 800;
          color: #0b6fb3;
          letter-spacing: 0.4px;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .hs-terms {
          font-size: 10.5px;
          color: #111827;
          line-height: 1.5;
          max-height: 22mm;
          overflow: hidden;
        }

        .hs-signature {
          text-align: right;
        }

        .hs-signature-line {
          display: inline-block;
          width: 70mm;
          border-top: 1px solid #111827;
          padding-top: 4px;
          font-size: 11px;
          color: #111827;
        }

        .hs-footer-note {
          margin-top: auto;
          padding-top: 6mm;
          font-size: 10px;
          color: #374151;
          display: flex;
          justify-content: space-between;
          gap: 10mm;
          border-top: 1px solid rgba(15, 23, 42, 0.12);
        }

        .hs-totals-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .hs-totals-row .label {
          color: #111827;
          letter-spacing: 0.4px;
        }

        .hs-totals-row .value {
          color: #111827;
          text-align: right;
          min-width: 90px;
        }

        .hs-totals-row.bold .label,
        .hs-totals-row.bold .value {
          font-weight: 800;
        }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body {
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .hs-print-root {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }

        /* html2pdf uses screen CSS. When the preview page is in .pdf-mode, enforce A4 sizing
           without forcing an extra page break. */
        .pdf-mode .hs-print-root {
          width: 210mm !important;
          min-height: 297mm !important;
          height: auto !important;
          margin: 0 !important;
          overflow: visible !important;
        }

        .pdf-mode .hs-content {
          padding: 24mm 16mm 22mm;
        }

        .pdf-mode .hs-title {
          font-size: 42px;
        }

        .pdf-mode .hs-contact { font-size: 11px; }
        .pdf-mode .hs-table { font-size: 11px; }
        .pdf-mode .hs-table th { font-size: 13px; }
        .pdf-mode .hs-payment { font-size: 10.5px; }
        .pdf-mode .hs-terms { font-size: 10px; }
      `}</style>

      <svg className="hs-top-wave" viewBox="0 0 210 120" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hsWaveA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="hsWaveB" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0284c7" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path d="M0,20 C60,0 120,0 210,18 L210,0 L0,0 Z" fill="url(#hsWaveA)" />
        <path d="M0,34 C72,10 132,8 210,26 L210,0 L0,0 Z" fill="url(#hsWaveB)" opacity="0.85" />
      </svg>

      <svg className="hs-bottom-wave" viewBox="0 0 210 85" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="hsWaveC" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0369a1" />
            <stop offset="1" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="hsWaveD" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#93c5fd" stopOpacity="0.9" />
            <stop offset="1" stopColor="#0ea5e9" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path d="M0,85 L210,85 L210,70 C130,90 75,68 0,72 Z" fill="#075985" opacity="0.95" />
        <path d="M0,85 L210,85 L210,60 C145,78 92,55 0,58 Z" fill="url(#hsWaveC)" opacity="0.95" />
        <path d="M0,85 L210,85 L210,46 C150,65 95,43 0,45 Z" fill="url(#hsWaveD)" opacity="0.95" />
        <path d="M210,85 L210,52 L198,64 L184,80 Z" fill="#0b4a6e" opacity="0.95" />
      </svg>

      <div className="hs-content">
        <div className="hs-brand">
          <img src={brand.logoSrc} alt={brand.name} />
          <div>
            <div className="hs-brand-name">{brand.name}</div>
            <div className="hs-brand-tagline">Powering the Future of Care</div>
          </div>
        </div>

        <div className="hs-contact">
          <div className="hs-contact-item">
            <span className="hs-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.15 10.8 19.86 19.86 0 0 1 .08 2.18 2 2 0 0 1 2.06 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </span>
            <span>{brand.phone}</span>
          </div>
          <div className="hs-contact-item">
            <span className="hs-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v16H4z" opacity="0" />
                <path d="M4 4h16v16H4z" fill="none" />
                <path d="m4 4 8 8 8-8" />
                <path d="M4 20h16" />
              </svg>
            </span>
            <span>{brand.email}</span>
          </div>
          <div className="hs-contact-item">
            <span className="hs-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </span>
            <span>{brand.website}</span>
          </div>
          <div className="hs-contact-item">
            <span className="hs-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span>{brand.address}</span>
          </div>
        </div>

        <div className="hs-divider" />

        <div className="hs-title">{title}</div>

        <div className="hs-meta">
          <div>
            <div className="hs-meta-label">{invoiceToLabel}</div>
            <div className="hs-meta-value">{invoiceToValue}</div>
          </div>
          <div className="hs-meta-right">
            <div>
              <span className="hs-meta-label">{numberLabel}</span>
              <span>: {numberValue}</span>
            </div>
            <div>
              <span className="hs-meta-label">{dateLabel}</span>
              <span>: {dateValue}</span>
            </div>
          </div>
        </div>

        <div className="hs-table-wrap">
          <table className="hs-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {safeItems.length ? (
                safeItems.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.description}</td>
                    <td>{fmt(it.qty)}</td>
                    <td>{fmt(it.price)}</td>
                    <td>{fmt(it.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ height: "65mm" }} />
                  <td />
                  <td />
                  <td />
                </tr>
              )}
              {safeItems.length < 5 &&
                Array.from({ length: Math.max(0, 5 - safeItems.length) }).map((_, idx) => (
                  <tr key={`f-${idx}`}>
                    <td style={{ height: "12mm" }} />
                    <td />
                    <td />
                    <td />
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="hs-bottom-grid">
          <div>
            <div className="hs-payment-title">{paymentInformationTitle}</div>
            <div className="hs-payment">{paymentInformation}</div>
          </div>
          <div className="hs-totals">
            {totals.map((row, idx) => (
              <div key={idx} className={`hs-totals-row ${row.bold ? "bold" : ""}`.trim()}>
                <span className="label">{row.label}</span>
                <span className="value">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hs-extras">
          <div>
            <div className="hs-terms-title">TERMS & NOTES:</div>
            <div className="hs-terms">
              1. Payment is due within 7 days unless agreed otherwise.\n
              2. Please reference the invoice/estimate number with your payment.\n
              3. This document is system generated.
            </div>
          </div>
          <div className="hs-signature">
            <div className="hs-signature-line">Authorized Signature</div>
          </div>
        </div>

        <div className="hs-footer-note">
          <div>Thank you for your business.</div>
          <div>{brand.website} | {brand.email}</div>
        </div>
      </div>
    </div>
  );
});
