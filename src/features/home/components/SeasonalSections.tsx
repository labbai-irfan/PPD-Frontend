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
              <span className="font-urbanist text-[11px] font-bold text-[#2a2723]">{tile.label}</span>
            </>
          ) : (
            <>
              <span
                className="flex w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2.5 transition-transform hover:-translate-y-0.5"
                style={{ height: tileHeight }}
              >
                <img src={tile.image} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
              </span>
              <span className="font-urbanist text-[11px] font-bold text-[#2a2723]">{tile.label}</span>
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
    <div className="group flex min-h-[145px] flex-1 overflow-hidden rounded-[18px] bg-white shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-card dark:ring-white/5">
      {/* Left Column (50%) - Warm Off-white background */}
      <div className="flex w-1/2 flex-col justify-between bg-[#fdfaf6] p-3.5 pr-1.5 sm:p-4 dark:bg-[#25221e]">
        <button
          type="button"
          onClick={() => navigate(ROUTES.product(promo.productId))}
          className="cursor-pointer text-left w-full"
        >
          <div className="font-urbanist text-[12.5px] font-extrabold leading-tight text-[#2a2723] dark:text-white sm:text-[14px]">
            {promo.name}
          </div>
          <p className="font-inter mt-1 line-clamp-2 text-[9.5px] font-medium leading-[1.3] text-[#736c63] sm:text-[11px] dark:text-muted-foreground">
            {promo.desc}
          </p>
        </button>
        
        <div className="mt-2">
          <span className="font-inter block text-[9px] font-medium leading-none text-[#8c857c] dark:text-muted-foreground">
            Starting From
          </span>
          <span className="font-inter mt-1 block text-[17px] font-extrabold leading-none text-[#2a2723] dark:text-white">
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
          className="mt-2 flex w-full items-center justify-center rounded-full bg-[#f7941e] py-1.5 font-urbanist text-[10.5px] font-bold text-white shadow-[0_3px_10px_rgba(247,148,30,0.25)] transition-transform group-hover:translate-x-0.5 sm:text-[11px] cursor-pointer"
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
