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
    <section className="bg-grad-red rounded-[20px] p-4 shadow-[0_8px_22px_rgba(200,40,40,0.2)] md:p-6">
      <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-3">
        <Logo size={46} className="rounded-[10px]" />
        <div className="text-right">
          <div className="text-[21px] font-extrabold leading-none text-deal">100 Years</div>
          <div className="mt-0.5 text-[11px] font-medium text-[#c23]">of Educational Excellence</div>
        </div>
      </div>

      <div className="my-3.5 flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-white">From the House of PPD</h2>
        <Link
          to={ROUTES.category('books')}
          className="flex items-center gap-1 rounded-full border border-white/70 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/10"
        >
          Discover PPD
          <Icon name="arrow_forward" size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="flex min-h-[78px] items-start justify-between rounded-xl bg-white p-3 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-14 max-w-[78px] flex-col justify-between md:max-w-none">
              <span className="text-[12.5px] font-semibold leading-tight text-[#2a2723]">{card.title}</span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-link">
                Explore
                <Icon name="arrow_forward" size={13} />
              </span>
            </div>
            <img src={card.image} alt="" loading="lazy" className="h-[52px] w-10 shrink-0 rounded-[7px] object-cover" />
          </Link>
        ))}
      </div>
      <Dots count={3} active={0} tone="light" className="mt-3.5" />
    </section>
  )
}
