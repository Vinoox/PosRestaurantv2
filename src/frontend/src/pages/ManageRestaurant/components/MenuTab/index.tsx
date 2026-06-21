import { useState } from 'react';
import { Utensils, Carrot, FolderTree } from 'lucide-react';
import CategoriesSubTab from './CategoriesSubTab';
import IngredientsSubTab from './IngredientsSubTab';
import ProductsSubTab from './ProductsSubTab';

type SubTabType = 'products' | 'ingredients' | 'categories';

export default function MenuTabOrchestrator({ restaurantId }: { restaurantId: string }) {
    const [activeTab, setActiveTab] = useState<SubTabType>('products');

    return (
        <div className="space-y-6 font-sans">
            <div className="flex bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 w-fit max-w-full overflow-x-auto shadow-2xl">
                <button onClick={() => setActiveTab('products')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${activeTab === 'products' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}>
                    <Utensils className="h-4 w-4" /> <span>1. Gotowe Dania (Menu)</span>
                </button>
                <button onClick={() => setActiveTab('ingredients')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${activeTab === 'ingredients' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}>
                    <Carrot className="h-4 w-4" /> <span>2. Magazyn Składników</span>
                </button>
                <button onClick={() => setActiveTab('categories')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}>
                    <FolderTree className="h-4 w-4" /> <span>3. Kategorie Menu</span>
                </button>
            </div>

            <div className="pt-1">
                {activeTab === 'products' && <ProductsSubTab restaurantId={restaurantId} />}
                {activeTab === 'ingredients' && <IngredientsSubTab restaurantId={restaurantId} />}
                {activeTab === 'categories' && <CategoriesSubTab restaurantId={restaurantId} />}
            </div>
        </div>
    );
}