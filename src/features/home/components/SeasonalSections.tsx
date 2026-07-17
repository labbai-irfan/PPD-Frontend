import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { CategoryTile, PromoCard } from '@/mocks/home'
import { catalogRepository } from '@/services/repositories/catalog'
import { useCartStore } from '@/store/cart.store'
import { Dots } from '@/components/ui/Dots'
import { SectionHeader } from '@/components/shared/SectionHeader'

function TileStrip({ tiles, tileHeight = 74 }: { tiles: CategoryTile[]; tileHeight?: number }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x">
      {tiles.map((tile) => (
        <Link key={tile.label} to={tile.href} className="flex min-w-[72px] flex-1 shrink-0 snap-start flex-col items-center gap-1.5">
          <span
            className="flex w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2.5 transition-transform hover:-translate-y-0.5"
            style={{ height: tileHeight }}
          >
            <img src={tile.image} alt={tile.label} loading="lazy" className="max-h-full max-w-full object-contain" />
          </span>
          <span className="w-full truncate text-center font-urbanist text-[11px] font-bold text-[#2a2723]">{tile.label}</span>
        </Link>
      ))}
    </div>
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
    <div className="group flex min-h-[130px] flex-1 shrink-0 overflow-hidden rounded-[18px] bg-white shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-card dark:ring-white/5">
      {/* Left Column (50%) - Warm Off-white background */}
      <div className="flex w-1/2 flex-col justify-between bg-[#fdfaf6] p-3.5 pr-1.5 sm:p-4 dark:bg-[#25221e]">
        <button
          type="button"
          onClick={() => navigate(ROUTES.product(promo.productId))}
          className="cursor-pointer text-left w-full"
        >
          <div className="font-urbanist text-[11px] font-extrabold leading-tight text-[#2a2723] dark:text-white sm:text-[12px]">
            {promo.name}
          </div>
          <p className="font-inter mt-0.5 line-clamp-2 text-[8px] font-medium leading-[1.2] text-[#736c63] sm:text-[9px] dark:text-muted-foreground">
            {promo.desc}
          </p>
        </button>
        
        <div className="mt-1.5">
          <span className="font-inter block text-[7px] font-medium leading-none text-[#8c857c] dark:text-muted-foreground">
            Starting From
          </span>
          <span className="font-inter mt-0.5 block text-[14px] font-extrabold leading-none text-[#2a2723] dark:text-white">
            {formatCurrency(promo.price)}
          </span>
        </div>
      </div>

      {/* Right Column (50%) - White background */}
      <div className="flex w-1/2 flex-col justify-between bg-white p-3 dark:bg-card">
        {/* Product Image centered */}
        <div className="flex flex-1 items-center justify-center">
          <img
            src={promo.image}
            alt={promo.name}
            loading="lazy"
            className="max-h-[66px] max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Add to Cart button at the bottom of the right column */}
        <button
          type="button"
          onClick={handleAdd}
          className="mt-2 flex h-[32px] w-full items-center justify-center rounded-full bg-[#f7941e] px-3 py-1 font-urbanist text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(247,148,30,0.25)] transition-transform group-hover:scale-105 sm:text-[10.5px] cursor-pointer"
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
      <div
        className="bg-grad-yoga bg-cover bg-center rounded-2xl p-3 md:p-5"
        style={{ backgroundImage: "url('/components/bg2.png')" }}
      >
        <SectionHeader
          title="Celebrate Yoga Day!"
          subtitle="Healthy habits start young."
          viewAllHref={ROUTES.category('for-kids')}
          viewAllTone="glass"
        />
        <TileStrip tiles={tiles} tileHeight={70} />
        {promos && promos.length > 0 && (
          <div className="mt-3 flex flex-row gap-2 md:gap-3 overflow-x-auto">
            {promos.map((promo) => (
              <YogaPromoCard key={promo.productId} promo={promo} />
            ))}
          </div>
        )}
        <Dots count={3} active={0} tone="light" className="mt-3" />
      </div>
    </section>
  )
}
