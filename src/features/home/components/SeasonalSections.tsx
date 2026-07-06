import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { CategoryTile, PromoCard } from '@/mocks/home'
import { catalogRepository } from '@/services/repositories/catalog'
import { useCartStore } from '@/store/cart.store'
import { Dots } from '@/components/ui/Dots'
import { SectionHeader } from '@/components/shared/SectionHeader'

function TileStrip({
  tiles,
  tileHeight = 74,
  glass = false,
}: {
  tiles: CategoryTile[]
  tileHeight?: number
  glass?: boolean
}) {
  return (
    <div className={glass ? "flex gap-[9px]" : "flex gap-2.5"}>
      {tiles.map((tile) => (
        <Link
          key={tile.label}
          to={tile.href}
          className={
            glass
              ? 'flex flex-1 flex-col items-center gap-2.5 rounded-[14px] border border-white/60 bg-white/35 pt-2.5 pb-[15px] shadow-[0_4px_14px_rgba(90,130,160,0.18)] backdrop-blur-md transition-transform hover:-translate-y-0.5'
              : 'flex flex-1 flex-col items-center gap-1.5'
          }
        >
          {glass ? (
            <>
              <div className="flex w-full flex-1 items-center justify-center px-2">
                <img src={tile.image} alt="" loading="lazy" className="h-[76px] w-full object-contain" />
              </div>
              <span className="text-[11px] font-medium text-[#2a2723]">{tile.label}</span>
            </>
          ) : (
            <>
              <span
                className="w-full overflow-hidden rounded-xl bg-white p-1.5 transition-transform hover:-translate-y-0.5"
                style={{ height: tileHeight }}
              >
                <img src={tile.image} alt="" loading="lazy" className="size-full rounded-lg object-cover" />
              </span>
              <span className="text-[10.5px] font-medium text-[#3a4045]">{tile.label}</span>
            </>
          )}
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
        viewAllTone="glass"
      />
      <div className="bg-grad-monsoon overflow-hidden rounded-2xl p-3 md:p-5">
        <TileStrip tiles={tiles} tileHeight={74} glass />
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
    <div className="flex min-h-[135px] flex-1 overflow-hidden rounded-[18px] bg-[#fdfaf6] shadow-[0_4px_12px_rgba(120,90,40,0.06)] transition-transform hover:-translate-y-0.5">
      {/* Left Column */}
      <div className="flex flex-1 flex-col justify-between p-3 pr-1">
        <button
          type="button"
          onClick={() => navigate(ROUTES.product(promo.productId))}
          className="cursor-pointer text-left w-full"
        >
          <div className="text-[12.5px] font-bold leading-snug text-[#2a2723]">{promo.name}</div>
          <p className="mt-1 text-[10px] leading-[1.35] text-[#8c857c]">{promo.desc}</p>
        </button>
        <div className="mt-2 flex flex-col justify-end">
          <div className="text-[10px] text-[#8c857c]">Starting From</div>
          <div className="mt-0.5 text-[17px] font-bold leading-none text-[#2a2723]">
            {formatCurrency(promo.price)}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex w-[90px] shrink-0 flex-col items-center justify-between bg-white p-2">
        <div className="pointer-events-none flex h-[72px] w-full items-center justify-center">
          <img src={promo.image} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="cursor-pointer flex w-full items-center justify-center gap-[2px] rounded-full bg-[#FBAA2E] py-[5.5px] text-[10.5px] font-bold text-white shadow-[0_3px_10px_rgba(251,170,46,0.35)] transition-transform hover:scale-105"
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
      <div 
        className="bg-grad-yoga bg-cover bg-center rounded-2xl p-3 md:p-5"
        style={{ backgroundImage: "url('/components/bg2.png')" }}
      >
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
