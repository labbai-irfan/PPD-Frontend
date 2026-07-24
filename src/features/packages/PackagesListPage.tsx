import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { usePackages } from '@/hooks/use-catalog'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TopBar } from '@/components/shared/TopBar'

export default function PackagesListPage() {
  const { data: packages, isPending } = usePackages()

  return (
    <div>
      <TopBar leading="menu" />

      <div className="px-1 pt-1">
        <h1 className="text-[20px] font-extrabold text-foreground sm:text-2xl">Shop by Combos</h1>
        <p className="mt-0.5 text-[12.5px] font-medium text-muted-foreground sm:text-sm">
          Everything you need, in one smart combo
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 min-[400px]:grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4">
        {isPending
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="min-h-[145px] rounded-[18px]" />)
          : packages?.map((pkg) => (
              <Link
                key={pkg.id}
                to={ROUTES.package(pkg.slug)}
                className="group flex min-h-[145px] overflow-hidden rounded-[18px] bg-white shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-card dark:ring-white/5"
              >
                <div className="flex w-1/2 flex-col justify-between bg-[#fdfaf6] p-3.5 pr-1.5 sm:p-4 dark:bg-[#25221e]">
                  <div>
                    <h3 className="text-[12.5px] font-extrabold leading-tight text-[#2a2723] dark:text-white sm:text-[14px]">
                      {pkg.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[9.5px] font-medium leading-[1.3] text-[#736c63] sm:text-[11px] dark:text-muted-foreground">
                      {pkg.description || `${pkg.itemCount} items in this combo`}
                    </p>
                  </div>
                  <div className="mt-2">
                    <span className="block text-[9px] font-medium leading-none text-[#8c857c] dark:text-muted-foreground">
                      Starting From
                    </span>
                    <span className="mt-1 block text-[17px] font-extrabold leading-none text-[#2a2723] dark:text-white">
                      {formatCurrency(pkg.price)}
                    </span>
                  </div>
                </div>

                <div className="flex w-1/2 flex-col justify-between bg-white p-3 dark:bg-card">
                  <div className="flex flex-1 items-center justify-center">
                    {pkg.image ? (
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        loading="lazy"
                        className="max-h-[66px] max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Icon name="inventory_2" size={40} className="text-muted-foreground" />
                    )}
                  </div>
                  <span className="mt-2 flex w-full items-center justify-center gap-[3px] rounded-full bg-[#f7941e] py-1.5 text-[10.5px] font-bold text-white shadow-[0_3px_10px_rgba(247,148,30,0.25)] transition-transform group-hover:translate-x-0.5 sm:text-[11px]">
                    Explore
                    <Icon name="arrow_forward" size={12} />
                  </span>
                </div>
              </Link>
            ))}
      </div>

      {!isPending && packages?.length === 0 && (
        <EmptyState
          icon={<Icon name="inventory_2" size={36} />}
          title="No combos yet"
          description="Check back soon for curated combos and bundles."
        />
      )}
    </div>
  )
}
