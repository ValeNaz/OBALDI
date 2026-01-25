import { usePathname, useRouter } from "next/navigation";
import type { Category } from "@/lib/homeData";

type CategoryNavRowProps = {
  categories: Category[];
};

const CategoryNavRow = ({ categories }: CategoryNavRowProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleCategoryClick = (catId: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (!catId || catId === "ALL") {
      params.delete("cat");
    } else {
      params.set("cat", catId);
    }
    // Navigate without scroll
    router.push(`/marketplace?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="border-t border-white/40 bg-white/70">
      <div className="px-6 py-2">
        <div className="flex items-center gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleCategoryClick(null)}
            className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b224e]/30"
            aria-label="Tutte le categorie"
          >
            <span className="text-base">≡</span>
            Tutte le categorie
          </button>
          <nav className="flex items-center gap-4 whitespace-nowrap" aria-label="Categorie principali">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="text-xs font-semibold text-slate-600 hover:text-[#0b224e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b224e]/30 rounded-full px-2 py-1 transition-colors"
                type="button"
              >
                {category.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CategoryNavRow;
