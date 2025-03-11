// components/ProductCard.tsx
import React from 'react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="flex-shrink-0 w-40 md:w-48 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
      {product.imageUrl && (
        <div className="w-full h-32 overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3">
        <h4 className="font-medium text-sm truncate">{product.title}</h4>
        <p className="text-sm text-gray-700 mt-1">${parseFloat(product.price).toFixed(2)}</p>
        <button className="mt-2 w-full bg-gradient-to-r from-green-400 to-teal-500 text-white text-xs py-2 rounded-full hover:opacity-90 transition-opacity">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;