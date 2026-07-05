import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { CategoryTile, PromoCard } from '@/mocks/home'
import { catalogRepository } from '@/services/repositories/catalog'
import { useCartStore } from '@/store/cart.store'
import { Dots } from '@/components/ui/Dots'
import { SectionHeader } from '@/components/shared/SectionHeader'

/** Row of white image tiles inside a tinted gradient box (Monsoon / Yoga). */
function TileStrip({ tiles, tileHeight = 74 }: { tiles: CategoryTile[]; tileHeight?: number }) {
  return (
    <div className="flex gap-2.5">
      {tiles.map((tile) => (
        <Link key={tile.label} to={tile.href} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="w-full overflow-hidden rounded-xl bg-white p-1.5 transition-transform hover:-translate-y-0.5" style={{ height: tileHeight }}>
            <img src={tile.image} alt="" loading="lazy" className="size-full rounded-lg object-cover" />
          </span>
          <span className="text-[10.5px] font-medium text-[#3a4045]">{tile.label}</span>
        </Link>
      ))}
    </div>
  )
}

/** "Monsoon Essentials" — blue-tinted seasonal strip. */
export function MonsoonSection({ tiles }: { tiles?: CategoryTile[] }) {
  if (!tiles?.length) return null
  return (
    <section>
      <SectionHeader
        title="Monsoon Essentials"
        subtitle="Stay Ready, Stay Protected this Season"
        viewAllHref={ROUTES.category('for-kids')}
      />
      <div className="bg-grad-monsoon rounded-2xl p-3 md:p-5">
        <TileStrip tiles={tiles} tileHeight={74} />
      </div>
      <Dots count={3} active={0} className="mt-3" />
    </section>
  )
}

function YogaPromoCard({ promo }: { promo: PromoCard }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)

  async function handleAdd() {
    const product = await catalogRepository.getProduct(promo.productId)
    addItem(product)
    toast.success('Added to cart')
  }

  return (
    <div className="flex flex-1 flex-col rounded-xl bg-white p-3">
      <button
        type="button"
        onClick={() => navigate(ROUTES.product(promo.productId))}
        className="text-left cursor-pointer"
      >
        <div className="text-[13px] font-bold text-[#2a2723]">{promo.name}</div>
        <p className="mt-0.5 min-h-[39px] text-[10px] leading-snug text-muted-foreground">{promo.desc}</p>
        <div className="mt-1.5 h-[34px] overflow-hidden rounded-lg bg-[#f0eeec]">
          <img src={promo.image} alt="" loading="lazy" className="size-full object-cover" />
        </div>
      </button>
      <div className="mt-2 text-[9.5px] text-muted-foreground">Starting From</div>
      <div className="mt-0.5 flex items-center justify-between">
        <span className="text-[17px] font-bold text-[#2a2723]">{formatCurrency(promo.price)}</span>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-full bg-primary px-2.5 py-[5px] text-[10px] font-semibold text-primary-foreground transition-transform hover:scale-105 cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

/** "Celebrate Yoga Day!" — purple-tinted strip with two promo cards. */
export function YogaSection({ tiles, promos }: { tiles?: CategoryTile[]; promos?: PromoCard[] }) {
  if (!tiles?.length) return null
  return (
    <section>
      <SectionHeader
        title="Celebrate Yoga Day!"
        subtitle="Healthy habits start young."
        viewAllHref={ROUTES.category('for-kids')}
      />
      <div className="bg-grad-yoga rounded-2xl p-3 md:p-5">
        <TileStrip tiles={tiles} tileHeight={70} />
        {promos && promos.length > 0 && (
          <div className="mt-3 flex gap-2.5 md:gap-4">
            {promos.map((promo) => (
              <YogaPromoCard key={promo.productId} promo={promo} />
            ))}
          </div>
        )}
      </div>
      <Dots count={3} active={0} className="mt-3" />
    </section>
  )
}
