"use client";

import { useState } from "react";
import { ProductFilters } from "@/lib/product-discovery-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { X, Filter } from "lucide-react";

interface FilterSidebarProps {
  filters: ProductFilters;
  categories: string[];
  locations: string[];
  onFilterChange: (filters: Partial<ProductFilters>) => void;
  onClearFilters: () => void;
}

export function FilterSidebar({
  filters,
  categories,
  locations,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 1000000,
  ]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.category || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter(c => c !== category);
    
    onFilterChange({ 
      category: newCategories.length > 0 ? newCategories : undefined 
    });
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const currentLocations = filters.location || [];
    const newLocations = checked
      ? [...currentLocations, location]
      : currentLocations.filter(l => l !== location);
    
    onFilterChange({ 
      location: newLocations.length > 0 ? newLocations : undefined 
    });
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
    onFilterChange({
      priceRange: {
        min: value[0],
        max: value[1],
      },
    });
  };

  const activeFiltersCount = [
    filters.category?.length || 0,
    filters.productType ? 1 : 0,
    filters.condition ? 1 : 0,
    filters.priceRange ? 1 : 0,
    filters.location?.length || 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Category</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={filters.category?.includes(category) || false}
                onCheckedChange={(checked) => 
                  handleCategoryChange(category, checked as boolean)
                }
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Product Type Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Product Type</h4>
        <RadioGroup
          value={filters.productType || ""}
          onValueChange={(value) => 
            onFilterChange({ 
              productType: value ? (value as 'household' | 'industrial') : undefined 
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="type-all" />
            <Label htmlFor="type-all" className="text-sm text-gray-700 cursor-pointer">
              All Types
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="household" id="type-household" />
            <Label htmlFor="type-household" className="text-sm text-gray-700 cursor-pointer">
              Household
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="industrial" id="type-industrial" />
            <Label htmlFor="type-industrial" className="text-sm text-gray-700 cursor-pointer">
              Industrial
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Condition Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Condition</h4>
        <RadioGroup
          value={filters.condition || ""}
          onValueChange={(value) => 
            onFilterChange({ 
              condition: value ? (value as 'excellent' | 'good' | 'fair') : undefined 
            })
          }
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="condition-all" />
            <Label htmlFor="condition-all" className="text-sm text-gray-700 cursor-pointer">
              All Conditions
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="excellent" id="condition-excellent" />
            <Label htmlFor="condition-excellent" className="text-sm text-gray-700 cursor-pointer">
              Excellent
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="good" id="condition-good" />
            <Label htmlFor="condition-good" className="text-sm text-gray-700 cursor-pointer">
              Good
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fair" id="condition-fair" />
            <Label htmlFor="condition-fair" className="text-sm text-gray-700 cursor-pointer">
              Fair
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Price Range (LKR)</h4>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            min={0}
            max={1000000}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>LKR {priceRange[0].toLocaleString()}</span>
            <span>LKR {priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Location Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Location</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={`location-${location}`}
                checked={filters.location?.includes(location) || false}
                onCheckedChange={(checked) => 
                  handleLocationChange(location, checked as boolean)
                }
              />
              <Label
                htmlFor={`location-${location}`}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {location}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
