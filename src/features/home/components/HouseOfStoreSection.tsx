import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import type { HouseCard } from '@/mocks/home'
import { Icon } from '@/components/ui/Icon'
import { Dots } from '@/components/ui/Dots'
import { Logo } from '@/components/shared/Logo'

/** "From the House of PPD" — the red gradient publisher block. */
export function HouseOfStoreSection({ cards }: { cards?: HouseCard[] }) {
  if (!cards?.length) return null

  return (
    <section 
      className="rounded-[20px] p-4 shadow-[0_8px_22px_rgba(200,40,40,0.2)] md:p-6"
      style={{
        backgroundImage: "url('/components/bg.png'), linear-gradient(160deg, #e5433f, #d42e2a)",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-3">
        <Logo size={46} className="rounded-[10px]" />
        <div className="text-right">
          <div className="font-urbanist text-[28px] font-extrabold leading-none text-deal">100 Years</div>
          <div className="font-inter mt-1 text-[11px] font-bold text-[#c23] leading-none">of Educational Excellence</div>
        </div>
      </div>

      <div className="my-3.5 flex items-center justify-between gap-2">
        <h2 className="min-w-0 font-urbanist text-[17px] font-extrabold text-white leading-none">From the House of PPD</h2>
        <Link
          to={ROUTES.category('books')}
          className="flex min-h-[44px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-2.5 font-urbanist text-[11px] font-bold text-[#2a2723] shadow-sm transition-colors hover:bg-white/90"
        >
          Discover PPD
          <Icon name="arrow_forward" size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5 md:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="grid grid-cols-[58%_42%] min-h-[110px] overflow-hidden rounded-xl bg-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div className="relative z-10 bg-[#faf5ec] flex flex-col justify-between p-3 pr-1">
              <span className="font-urbanist text-[13px] font-bold leading-tight text-[#2a2723]">{card.title}</span>
              <span className="mt-2 inline-flex max-w-full items-center justify-center gap-0.5 overflow-hidden rounded-full bg-[#f7941e] px-2.5 py-1 font-urbanist text-[9.5px] font-bold text-white shadow-sm hover:bg-[#f5860c] transition-colors w-fit">
                Explore
                <Icon name="arrow_forward" size={10} />
              </span>
            </div>
            <img src={card.image} alt={card.title} loading="lazy" className="h-full w-full object-cover" />
          </Link>
        ))}
      </div>
      <Dots count={3} active={0} tone="light" className="mt-3.5" />
    </section>
  )
}
