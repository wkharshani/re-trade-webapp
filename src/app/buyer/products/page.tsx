"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProducts, getProductCategories, getProductLocations, ProductFilters } from "@/lib/product-discovery-actions";
import { ProductCard } from "@/components/product-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Filter, Grid3X3, List } from "lucide-react";
import { toast } from "sonner";
import { debounce } from "lodash";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  productType: string;
  condition: string;
  price: string;
  images: string[] | null;
  location: string;
  contactNumber: string;
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
  isActive: boolean;
  seller: {
    name: string;
    email: string;
  };
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: [],
    productType: undefined,
    condition: undefined,
    priceRange: undefined,
    location: [],
  });

  // Initialize filters from search params after component mounts
  useEffect(() => {
    if (searchParams) {
      const search = searchParams.get("search") || "";
      const category = searchParams.getAll("category");
      const productType = (searchParams.get("productType") as 'household' | 'industrial') || undefined;
      const condition = (searchParams.get("condition") as 'excellent' | 'good' | 'fair') || undefined;
      const priceRange = searchParams.get("minPrice") || searchParams.get("maxPrice") ? {
        min: Number(searchParams.get("minPrice")) || 0,
        max: Number(searchParams.get("maxPrice")) || 1000000,
      } : undefined;
      const location = searchParams.getAll("location");

      setSearchQuery(search);
      setFilters({
        search,
        category,
        productType,
        condition,
        priceRange,
        location,
      });
    }
  }, [searchParams]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      setFilters(prev => ({ ...prev, search: query }));
      setCurrentPage(1);
    }, 300),
    []
  );

  // Update URL with current filters
  const updateURL = (newFilters: ProductFilters) => {
    const params = new URLSearchParams();
    
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.category?.length) {
      newFilters.category.forEach(cat => params.append("category", cat));
    }
    if (newFilters.productType) params.set("productType", newFilters.productType);
    if (newFilters.condition) params.set("condition", newFilters.condition);
    if (newFilters.priceRange?.min) params.set("minPrice", newFilters.priceRange.min.toString());
    if (newFilters.priceRange?.max) params.set("maxPrice", newFilters.priceRange.max.toString());
    if (newFilters.location?.length) {
      newFilters.location.forEach(loc => params.append("location", loc));
    }

    router.push(`/buyer/products?${params.toString()}`, { scroll: false });
  };

  // Load products
  const loadProducts = async (page: number = 1, newFilters?: ProductFilters) => {
    try {
      setLoading(true);
      const currentFilters = newFilters || filters;
      const response = await getProducts(currentFilters, { page, limit: 20 });
      
      if (page === 1) {
        setProducts(response.products.map(product => ({
          ...product,
          updatedAt: product.createdAt,
          sellerId: "",
          isActive: true,
        })));
      } else {
        setProducts(prev => [...prev, ...response.products.map(product => ({
          ...product,
          updatedAt: product.createdAt,
          sellerId: "",
          isActive: true,
        }))]);
      }
      
      setTotal(response.total);
      setHasMore(response.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Load categories and locations
  const loadCategoriesAndLocations = async () => {
    try {
      const [categoriesData, locationsData] = await Promise.all([
        getProductCategories(),
        getProductLocations(),
      ]);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (error) {
      console.error("Error loading categories and locations:", error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
    updateURL(updatedFilters);
    loadProducts(1, updatedFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: ProductFilters = {
      search: "",
      category: [],
      productType: undefined,
      condition: undefined,
      priceRange: undefined,
      location: [],
    };
    setFilters(clearedFilters);
    setSearchQuery("");
    setCurrentPage(1);
    updateURL(clearedFilters);
    loadProducts(1, clearedFilters);
  };

  // Load more products
  const loadMore = () => {
    if (!loading && hasMore) {
      loadProducts(currentPage + 1);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts(1, filters);
    loadCategoriesAndLocations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
            <p className="text-gray-600 mt-2">
              {loading ? "Loading..." : `${total} products found`}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <FilterSidebar
                filters={filters}
                categories={categories}
                locations={locations}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading && products.length === 0 ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" 
                    : "grid-cols-1"
                }`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        ...product,
                        updatedAt: product.createdAt, // Use createdAt for updatedAt since we don't have it
                        sellerId: "", // Placeholder since we have seller info
                        isActive: true, // Assume active since it's in the results
                      }}
                      viewMode={viewMode}
                      isBuyerView={true}
                      showActions={false}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-8">
                    <Button onClick={loadMore} disabled={loading}>
                      {loading ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden fixed bottom-4 right-4 z-50">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <FilterSidebar
              filters={filters}
              categories={categories}
              locations={locations}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </SheetContent>
        </Sheet>

        {/* Search Bar */}
        <div className="fixed bottom-4 left-4 z-50 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
