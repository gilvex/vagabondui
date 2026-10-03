import { useId } from 'react'
import { Landmark, Wifi } from 'lucide-react'
import type { BankCard } from './schema'

function CardChip() {
  const gradient = useId()
  return (
    <svg className="bank-chip" viewBox="0 0 52 40" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f6e5aa" />
          <stop offset=".3" stopColor="#ba9146" />
          <stop offset=".52" stopColor="#f9e9b3" />
          <stop offset=".76" stopColor="#c29a50" />
          <stop offset="1" stopColor="#ecd69a" />
        </linearGradient>
      </defs>
      <rect
        x=".75"
        y=".75"
        width="50.5"
        height="38.5"
        rx="7"
        fill={`url(#${gradient})`}
        stroke="#84612f"
        strokeWidth="1.5"
      />
      <g fill="none" stroke="#795826" strokeWidth=".8">
        <rect x="17" y="10" width="18" height="20" rx="4" />
        <path d="M17 14H1M17 26H1M35 14h16M35 26h16M21 10V1M31 10V1M21 30v9M31 30v9M17 20H1M35 20h16M10 1v8l7 5M42 1v8l-7 5M10 39v-8l7-5M42 39v-8l-7-5" />
      </g>
      <rect
        x="2"
        y="2"
        width="48"
        height="36"
        rx="6"
        fill="none"
        stroke="#fff4c9"
        strokeOpacity=".5"
      />
    </svg>
  )
}

/** A bounded card illustration, independent of its surrounding control panel. */
export function PaymentCard({ card }: { card: BankCard }) {
  return (
    <div
      className={`bank-debit-card ${card.kind === 'Virtual' ? 'bank-virtual-card' : ''} ${card.frozen ? 'bank-frozen-card' : ''}`}
      role="img"
      aria-label={`Meridian ${card.kind.toLowerCase()} debit card ending ${card.last4}${card.frozen ? ', frozen' : ''}`}
    >
      <span className="bank-card-orbit" aria-hidden="true" />
      <div className="bank-card-brand">
        <span>
          <Landmark size={18} /> Meridian
        </span>
        <span className="bank-card-tier">{card.kind === 'Physical' ? 'everyday' : 'digital'}</span>
      </div>
      <div className="bank-card-chip-row">
        <CardChip />
        <Wifi size={22} className="bank-contactless" />
      </div>
      <p className="bank-card-number">•••• •••• •••• {card.last4}</p>
      <div className="bank-card-footer">
        <span>Alex Morgan</span>
        <span>
          DEBIT
          <span className="bank-card-network" aria-hidden="true">
            <i />
            <i />
          </span>
        </span>
      </div>
    </div>
  )
}
