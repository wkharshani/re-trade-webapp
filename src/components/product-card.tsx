"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  MapPin,
  Phone,
  Calendar,
  Package
} from "lucide-react";
// import { formatDistanceToNow } from "date-fns";
import type { Product } from "@/db/schema";

interface ProductCardProps {
  product: Product;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  onToggleStatus?: (productId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export default function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  showActions = true,
  variant = 'default'
}: ProductCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-product.jpg';

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductTypeColor = (type: string) => {
    return type === 'household' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-indigo-100 text-indigo-800';
  };

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              {isImageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md" />
              )}
              <img
                src={mainImage}
                alt={product.name}
                className={`w-full h-full object-cover rounded-md ${
                  isImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
              <p className="text-sm text-gray-600 truncate">{product.category}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className={getConditionColor(product.condition)}>
                  {product.condition}
                </Badge>
                <span className="font-semibold text-gray-900">{formatPrice(Number(product.price))}</span>
              </div>
            </div>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(product.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onToggleStatus && (
                    <DropdownMenuItem onClick={() => onToggleStatus(product.id)}>
                      {product.isActive ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 group">
        <CardHeader className="p-0">
          <div className="relative">
            {/* Image */}
            <div className="aspect-square overflow-hidden rounded-t-lg">
              {isImageLoading && (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              )}
              <img
                src={mainImage}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                  isImageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>

            {/* Image Gallery Indicator */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-2 left-2 flex space-x-1">
                {product.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              <Badge 
                variant={product.isActive ? "default" : "secondary"}
                className={product.isActive ? "bg-green-500" : "bg-gray-500"}
              >
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Quick Actions Overlay */}
            {showActions && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  {onEdit && (
                    <Button size="sm" variant="secondary" onClick={() => onEdit(product.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onToggleStatus && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => onToggleStatus(product.id)}
                    >
                      {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {/* Product Info */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
              <Badge variant="secondary" className={getConditionColor(product.condition)}>
                {product.condition}
              </Badge>
              <Badge variant="secondary" className={getProductTypeColor(product.productType)}>
                {product.productType}
              </Badge>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(Number(product.price))}
              </span>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{product.location}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="w-full space-y-3">
            {/* Contact Info */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span>{product.contactNumber}</span>
              </div>
                                   <div className="flex items-center space-x-1">
                       <Calendar className="w-3 h-3" />
                       <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                     </div>
            </div>

            {/* Action Buttons */}
            {showActions && (
              <div className="flex space-x-2">
                {onEdit && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => onEdit(product.id)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDelete(product.id);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
