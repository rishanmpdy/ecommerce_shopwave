import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../features/products/useProducts';
import { useCategories } from '../features/categories/useCategories';
import ProductCard from '../Components/ui/ProductCard'
import { useDebounce } from '../hooks/useDebounce';
import { FiSearch, FiChevronDown, FiChevronUp, FiFilter, FiX } from 'react-icons/fi';

const Shop = () => {
  //  Fetch data
  const { data: products, isLoading, isError } = useProducts();
  const { data: categoriesArray } = useCategories();

  // Global search routing state
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('q') || '';

  //Local state for filtering (initialized from URL if present)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || 'All');
  const [selectedSubCategory, setSelectedSubCategory] = useState(searchParams.get('sub') || 'All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState('relevance');
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  // Accordion open/close state for filter sections
  const [openSections, setOpenSections] = useState({ category: true, brand: true });
  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);


  const debouncedSearch = useDebounce(searchTerm, 300);


  useEffect(() => {
    const cat = searchParams.get('cat');
    const sub = searchParams.get('sub');
    const q = searchParams.get('q');

    if (q) {
      setSelectedCategory('All');
      setSelectedSubCategory('All');
      setSelectedBrands([]);
    } else {
      if (cat) setSelectedCategory(cat);
      if (sub) setSelectedSubCategory(sub);
    }
  }, [searchParams]);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileFilterOpen]);

  // Extract Lists for Sidebar
  const categories = useMemo(() => {
    if (!categoriesArray) return ['All'];
    return ['All', ...categoriesArray.map(c => c.name)];
  }, [categoriesArray]);

  const subCategories = useMemo(() => {
    if (!products || selectedCategory === 'All') return [];
    const filteredByCategory = products.filter(p => p.category === selectedCategory);
    return Array.from(new Set(filteredByCategory.map(p => p.subCategory).filter(Boolean))).sort();
  }, [products, selectedCategory]);

  const brandsList = useMemo(() => {
    if (!products) return [];
    let filtered = products;
    if (selectedCategory !== 'All') {
       filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (selectedSubCategory !== 'All') {
       filtered = filtered.filter(p => p.subCategory === selectedSubCategory);
    }
    
    return Array.from(new Set(filtered.map(p => p.brand))).sort();
  }, [products, selectedCategory, selectedSubCategory]);

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  // const getSubCategoryImage = (subCat) => {
  //   const images = {
  //     "Running Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop",
  //     "Sports Shoes": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=100&h=100&fit=crop",
  //     "Sneakers": "https://images.unsplash.com/photo-1552346154-21d32810baa3?w=100&h=100&fit=crop",
  //     "Formal Shoes": "https://images.unsplash.com/photo-1614252235316-84d412cc2b37?w=100&h=100&fit=crop",
  //     "Boots": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=100&h=100&fit=crop",
  //     "Slippers": "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=100&h=100&fit=crop",
  //     "Sandals": "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=100&h=100&fit=crop",
  //     "Loafers": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=100&h=100&fit=crop",
  //     "Heels": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=100&h=100&fit=crop",
  //     "Ethnic": "https://images.unsplash.com/photo-1620012253295-c1590e0483d5?w=100&h=100&fit=crop"
  //   };
  //   return images[subCat] || "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=100&h=100&fit=crop";
  // };


  // Main filter pipeline
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = products;

    // Filter Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter SubCategory
    if (selectedSubCategory !== 'All') {
      result = result.filter(p => p.subCategory === selectedSubCategory);
    }

    // Filter Brand
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Filter Search
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.brand.toLowerCase().includes(lowerSearch) ||
        p.category.toLowerCase().includes(lowerSearch) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort Products
    if (sortOrder === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'popularity') {
      result = [...result].sort((a, b) => b.reviews - a.reviews);
    } else if (sortOrder === 'newest') {
      result = [...result].reverse();
    } 

    return result;
  }, [products, selectedCategory, selectedSubCategory, selectedBrands, debouncedSearch, sortOrder]);

  // Filter/search/sort maariyal first page-ilottu reset cheyyum
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, selectedBrands, debouncedSearch, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);






  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn relative">
      

      {/*  Hero Section - Responsive Scaling */}
      {!searchTerm && (
        <section className="relative mx-3 md:mx-4 `h-[180px] md:h-[260px]` rounded-2xl overflow-hidden mt-1 shadow-lg flex items-center group transition-all duration-500 ease-in-out">
           <div className="absolute inset-0 z-0 bg-slate-900">
            <img 
              src="https://plus.unsplash.com/premium_photo-1670983858348-84276a682db7?q=80" 
              alt="Premium Shopping Experience" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-in-out opacity-80"
            />
            <div className="absolute inset-0 bg-liner-to-r from-slate-900/95 via-slate-900/70 to-transparent"></div>
          </div>

          <div className="relative z-10 p-5 md:p-10 w-full max-w-2xl flex flex-col gap-2 md:gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-max shadow-sm">
              <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary-400 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              </span>
              <span className="text-white text-[9px] md:text-[10px] font-bold tracking-widest uppercase mb-[1px]">New Collection 2026</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Elevate Your <br className="hidden sm:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-300 to-primary-200">
                Lifestyle Today.
              </span>
            </h1>
            
            <p className="text-slate-200 text-xs md:text-base font-light max-w-sm leading-relaxed mix-blend-plus-lighter hidden sm:block">
              Discover a curated universe of premium footwear crafted for comfort, style, and perfection.
            </p>
          </div>
        </section>
      )}

      {/* Main Layout */}
      <section id="products-section" className="pb-10 pt-2">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Left Sidebar: */}
          <div 
            className={`
              fixed lg:sticky inset-0 lg:inset-auto z-[60] lg:z-10 lg:w-64 lg:top-[80px] flex-shrink-0 transition-opacity duration-300 lg:opacity-100 lg:pointer-events-auto
              ${isMobileFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
          >
            {/* Backdrop for Mobile */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] lg:hidden" 
              onClick={() => setIsMobileFilterOpen(false)}
            />

            {/* Main sidebar container */}
            <div className={`
              absolute lg:relative left-0 top-0 bottom-0 w-[280px] lg:w-full bg-white border-r lg:border border-slate-200 lg:rounded-xl shadow-2xl lg:shadow-sm overflow-hidden flex flex-col h-full transform transition-transform duration-300 lg:transform-none
              ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
              <div className="flex items-center justify-between lg:block px-5 py-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-800">Filters</h3>
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
{/* //filter */}
              {/* Scrollable filter content */}
              <div className="grow overflow-y-auto">
                {/* ── CATEGORY (accordion) */}
                <div className="border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => toggleSection('category')}
                    className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-slate-500 tracking-wider uppercase hover:bg-slate-50 transition-colors"
                  >
                    Category
                    {openSections.category ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>

                  {openSections.category && (
                    <div className="px-5 pb-4">
                      <ul className="space-y-1">
                        {categories.map(cat => (
                          <li key={cat}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory(cat);
                                setSelectedSubCategory('All');
                                setSelectedBrands([]);
                                if (window.innerWidth < 1024) setIsMobileFilterOpen(false);
                              }}
                              className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors flex items-center justify-between ${
                                selectedCategory === cat
                                  ? 'font-bold text-primary-600 bg-primary-50'
                                  : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <span>{cat}</span>
                              {selectedCategory === cat && cat !== 'All' && subCategories.length > 0 && (
                                <span className="text-[10px] text-primary-400 font-normal">{subCategories.length}</span>
                              )}
                            </button>

                            {selectedCategory === cat && cat !== 'All' && subCategories.length > 0 && (
                              <ul className="mt-1 ml-3 pl-3 border-l-2 border-primary-100 space-y-0.5">
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => { 
                                      setSelectedSubCategory('All'); 
                                      setSelectedBrands([]); 
                                      if (window.innerWidth < 1024) setIsMobileFilterOpen(false);
                                    }}
                                    className={`w-full text-left text-xs py-1 px-2 rounded transition-colors ${
                                      selectedSubCategory === 'All'
                                        ? 'font-bold text-primary-600'
                                        : 'text-slate-500 hover:text-primary-600 font-medium'
                                    }`}
                                  >
                                    All in {cat}
                                  </button>
                                </li>
                                {subCategories.map(subCat => (
                                  <li key={subCat}>
                                    <button
                                      type="button"
                                      onClick={() => { 
                                        setSelectedSubCategory(subCat); 
                                        setSelectedBrands([]); 
                                        if (window.innerWidth < 1024) setIsMobileFilterOpen(false);
                                      }}
                                      className={`w-full text-left text-xs py-1 px-2 rounded transition-colors flex items-center gap-2 ${
                                        selectedSubCategory === subCat
                                          ? 'font-bold text-primary-600'
                                          : 'text-slate-500 hover:text-primary-600 font-medium'
                                      }`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        selectedSubCategory === subCat ? 'bg-primary-500' : 'bg-slate-300'
                                      }`} />
                                      <span className="truncate">{subCat}</span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ── BRAND ─── */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('brand')}
                    className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-slate-500 tracking-wider uppercase hover:bg-slate-50 transition-colors"
                  >
                    Brand
                    {openSections.brand ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                  </button>

                  {openSections.brand && (
                    <div className="px-5 pb-5">
                      <div className="mb-3 relative">
                        <FiSearch className="absolute left-2 top-2 text-slate-300 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search brand..."
                          value={brandSearchTerm}
                          onChange={(e) => setBrandSearchTerm(e.target.value)}
                          className="w-full text-sm pl-8 pr-2 py-1.5 border-b border-slate-200 focus:outline-none focus:border-primary-500 bg-transparent text-slate-700"
                        />
                      </div>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                        {brandsList
                          .filter(b => b.toLowerCase().includes(brandSearchTerm.toLowerCase()))
                          .map(brand => (
                            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => handleBrandChange(brand)}
                              />
                              <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium uppercase tracking-wide">{brand}</span>
                            </label>
                          ))
                        }
                        {brandsList.length === 0 && (
                          <span className="text-sm text-slate-400 italic">No brands found</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile apply button footer */}
              <div className="lg:hidden p-4 border-t border-slate-100">
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-sm shadow-lg active:scale-95 transition-all"
                >
                  View {filteredProducts.length} results
                </button>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-grow min-w-0 w-full">
            
            {/* Sorting and Results Header - Mobile Toggle Bar */}
            <div className="mb-4 lg:mb-6 flex flex-col gap-3 lg:gap-4 border-b border-slate-200 pb-3 h-auto">
              
              {/* Top Row: Results Tracker & Filter Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="text-slate-600 text-[13px] md:text-base flex items-center truncate">
                  <span className="hidden xs:inline">Results for&nbsp;</span>
                  <span className="font-bold text-slate-900 truncate max-w-[120px] md:max-w-none">
                    {searchTerm ? `"${searchTerm}"` : (selectedCategory === 'All' ? 'All Products' : selectedCategory)}
                  </span>
                  <span className="ml-1.5 text-slate-400 text-xs font-semibold shrink-0">
                    ({filteredProducts.length})
                  </span>
                </div>

                <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-sm active:bg-slate-50 shrink-0"
                >
                  <FiFilter className="text-primary-600" />
                  Filters
                </button>
              </div>

              {/* Inlined Sorting Left Aligned */}
              <div className="flex items-center justify-start gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar py-1">
                <span className="font-extrabold text-slate-800 flex-shrink-0 text-[10px] md:text-xs uppercase tracking-wider mr-1">Sort:</span>
                
                {[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'popularity', label: 'Popularity' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'newest', label: 'Newest First' }
                ].map(sortConfig => (
                  <button 
                    key={sortConfig.value}
                    onClick={() => setSortOrder(sortConfig.value)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-sm font-bold transition-all duration-300 flex-shrink-0 border ${
                       sortOrder === sortConfig.value 
                         ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                         : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {sortConfig.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid Context */}
            <div className="min-h-[min-h-100]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-primary-600">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
                </div>
              ) : isError ? (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl flex justify-center items-center h-64">
                  <p className="font-medium">Failed to load products. Please check your network connection.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white flex flex-col items-center justify-center h-64 rounded-xl border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No products match your filters</h3>
                  <p className="text-slate-500 mb-6">Try removing some brand selections or changing search terms.</p>
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedSubCategory('All');
                      setSelectedBrands([]);
                      setCurrentPage(1);
                    }}
                    className="text-primary-600 font-bold hover:bg-primary-50 px-4 py-2 rounded-lg transition"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                    {paginatedProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-9 h-9 text-sm rounded-lg border transition ${
                            currentPage === page
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;
