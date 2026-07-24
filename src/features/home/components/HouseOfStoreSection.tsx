import { Link } from 'react-router-dom'
import { useCategories } from '@/hooks/use-catalog'
import { mediaUrl } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { Logo } from '@/components/shared/Logo'

/** Category browse link, scoped to PPD Original products only. */
const ppdOriginalHref = (slug?: string) =>
  slug ? `/products/all?category=${slug}&ppdOriginal=true` : '/products/all?ppdOriginal=true'

/** "From the House of PPD" — the red gradient publisher block, one card per real top-level category. */
export function HouseOfStoreSection() {
  const { data } = useCategories()
  const cards = data?.filter((c) => c.slug !== 'all' && !c.parentId) ?? []
  if (!cards.length) return null

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
          to={ppdOriginalHref()}
          className="flex min-h-[44px] shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-2.5 font-urbanist text-[11px] font-bold text-[#2a2723] shadow-sm transition-colors hover:bg-white/90"
        >
          Discover PPD
          <Icon name="arrow_forward" size={13} />
        </Link>
      </div>

      <div className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto">
        {cards.map((category) => (
          <Link
            key={category.id}
            to={ppdOriginalHref(category.slug)}
            className="grid shrink-0 snap-start grid-cols-[58%_42%] min-h-[110px] w-[260px] lg:w-[calc(20%-8px)] overflow-hidden rounded-xl bg-white shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div className="relative z-10 bg-[#faf5ec] flex flex-col justify-between p-3 pr-1">
              <span className="font-urbanist text-[13px] font-bold leading-tight text-[#2a2723]">{category.name}</span>
              <span className="mt-2 inline-flex max-w-full items-center justify-center gap-0.5 overflow-hidden rounded-full bg-[#f7941e] px-2.5 py-1 font-urbanist text-[9.5px] font-bold text-white shadow-sm hover:bg-[#f5860c] transition-colors w-fit">
                Explore
                <Icon name="arrow_forward" size={10} />
              </span>
            </div>
            {category.image ? (
              <img src={mediaUrl(category.image)} alt={category.name} loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#faf5ec]">
                <Icon name={category.icon} size={40} fill style={{ color: category.color || '#e5433f' }} />
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
