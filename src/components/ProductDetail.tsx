
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload } from 'lucide-react';

// Mock product data
const mockProducts = [
  {
    id: '1',
    name: 'Custom T-Shirt',
    price: 25.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    description: 'High-quality cotton t-shirt perfect for custom printing.',
    category: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Navy', 'Red', 'Gray']
  },
  {
    id: '2',
    name: 'Premium Hoodie',
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
    description: 'Comfortable fleece hoodie for custom designs.',
    category: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Navy', 'Gray']
  },
  {
    id: '3',
    name: 'Custom Baseball Cap',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop',
    description: 'Premium baseball cap for custom embroidery.',
    category: 'Accessories',
    sizes: ['One Size'],
    colors: ['Black', 'White', 'Red', 'Blue']
  }
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [customText, setCustomText] = useState('');
  const [customImage, setCustomImage] = useState<File | null>(null);

  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCustomImage(e.target.files[0]);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert('Please select both size and color');
      return;
    }

    const customDesign = customText || customImage?.name || '';

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      customDesign
    });

    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardContent className="p-6">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customText">Custom Text (Optional)</Label>
                  <Input
                    id="customText"
                    placeholder="Enter custom text for your design"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="customImage">Upload Custom Design (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <input
                      id="customImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('customImage')?.click()}
                    >
                      Choose File
                    </Button>
                    {customImage && (
                      <p className="mt-2 text-sm text-green-600">
                        Selected: {customImage.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-bold text-purple-600 mb-4">${product.price}</p>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium mb-2">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="block text-sm font-medium mb-2">Color</Label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(customText || customImage) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Customization Preview:</h3>
                  {customText && (
                    <p className="text-sm text-gray-600">Text: "{customText}"</p>
                  )}
                  {customImage && (
                    <p className="text-sm text-gray-600">Image: {customImage.name}</p>
                  )}
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
