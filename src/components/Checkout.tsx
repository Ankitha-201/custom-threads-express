
import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Truck, MapPin, Smartphone } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Shipping Information
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  // Payment Information
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedUpiApp, setSelectedUpiApp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const upiApps = [
    { id: 'googlepay', name: 'Google Pay', icon: '📱' },
    { id: 'phonepe', name: 'PhonePe', icon: '💜' },
    { id: 'paytm', name: 'Paytm', icon: '💙' },
    { id: 'upi', name: 'Other UPI Apps', icon: '🏦' }
  ];

  const handleInputChange = (section: 'shipping' | 'payment', field: string, value: string) => {
    if (section === 'shipping') {
      setShippingInfo(prev => ({ ...prev, [field]: value }));
    } else {
      setPaymentInfo(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const requiredShippingFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missingShippingFields = requiredShippingFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);
    
    if (missingShippingFields.length > 0) {
      toast({ 
        title: 'Missing Information', 
        description: 'Please fill in all shipping details',
        variant: 'destructive' 
      });
      return false;
    }

    if (paymentMethod === 'card') {
      const requiredPaymentFields = ['cardNumber', 'expiryDate', 'cvv', 'nameOnCard'];
      const missingPaymentFields = requiredPaymentFields.filter(field => !paymentInfo[field as keyof typeof paymentInfo]);
      
      if (missingPaymentFields.length > 0) {
        toast({ 
          title: 'Missing Payment Information', 
          description: 'Please fill in all payment details',
          variant: 'destructive' 
        });
        return false;
      }
    }

    if (paymentMethod === 'razorpay' && !selectedUpiApp) {
      toast({ 
        title: 'Select UPI App', 
        description: 'Please select a UPI app to continue',
        variant: 'destructive' 
      });
      return false;
    }

    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      toast({
        title: 'Payment Failed',
        description: 'Razorpay SDK failed to load. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    const finalAmount = total + 5.99 + (total * 0.08);
    
    const options = {
      key: 'rzp_test_9999999999', // Replace with your Razorpay key
      amount: Math.round(finalAmount * 100), // Amount in paise
      currency: 'INR',
      name: 'Your Store Name',
      description: 'Order Payment',
      image: '/placeholder.svg',
      prefill: {
        name: shippingInfo.fullName,
        email: shippingInfo.email,
        contact: shippingInfo.phone,
      },
      method: {
        upi: selectedUpiApp !== 'upi',
        card: false,
        netbanking: false,
        wallet: false,
        emi: false,
        paylater: false
      },
      theme: {
        color: '#3399cc'
      },
      handler: function (response: any) {
        // Payment successful
        const orderData = {
          orderId: 'ORD-' + Date.now(),
          items,
          total,
          shippingInfo,
          paymentMethod: 'razorpay',
          paymentId: response.razorpay_payment_id
        };

        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        clearCart();
        navigate('/order-success');
        
        toast({ 
          title: 'Payment Successful!', 
          description: 'Your order has been placed successfully.' 
        });
      },
      modal: {
        ondismiss: function() {
          toast({
            title: 'Payment Cancelled',
            description: 'Payment was cancelled by user.',
            variant: 'destructive'
          });
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment();
      } else {
        // Simulate payment processing for other methods
        toast({ 
          title: 'Processing Payment...', 
          description: 'Please wait while we process your order' 
        });

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const orderData = {
          orderId: 'ORD-' + Date.now(),
          items,
          total,
          shippingInfo,
          paymentMethod
        };

        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        clearCart();
        navigate('/order-success');
        
        toast({ 
          title: 'Order Placed Successfully!', 
          description: 'You will receive a confirmation email shortly.' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Payment Failed', 
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => handleInputChange('shipping', 'fullName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                  <Input
                    id="apartment"
                    value={shippingInfo.apartment}
                    onChange={(e) => handleInputChange('shipping', 'apartment', e.target.value)}
                    placeholder="Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">PIN Code *</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                      placeholder="400001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">Credit/Debit Card</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="razorpay" id="razorpay" />
                      <Label htmlFor="razorpay">Razorpay (UPI)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod">Cash on Delivery</Label>
                    </div>
                  </RadioGroup>
                </div>

                {paymentMethod === 'card' && (
                  <>
                    <div>
                      <Label htmlFor="nameOnCard">Name on Card *</Label>
                      <Input
                        id="nameOnCard"
                        value={paymentInfo.nameOnCard}
                        onChange={(e) => handleInputChange('payment', 'nameOnCard', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => handleInputChange('payment', 'cardNumber', formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => handleInputChange('payment', 'expiryDate', formatExpiryDate(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          value={paymentInfo.cvv}
                          onChange={(e) => handleInputChange('payment', 'cvv', e.target.value.replace(/\D/g, ''))}
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'razorpay' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Smartphone className="mr-2 h-5 w-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-800">
                          Select your preferred UPI app:
                        </p>
                      </div>
                      <RadioGroup value={selectedUpiApp} onValueChange={setSelectedUpiApp} className="space-y-2">
                        {upiApps.map((app) => (
                          <div key={app.id} className="flex items-center space-x-3 p-2 rounded border bg-white">
                            <RadioGroupItem value={app.id} id={app.id} />
                            <span className="text-lg">{app.icon}</span>
                            <Label htmlFor={app.id} className="font-medium">{app.name}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      Pay with cash when your order is delivered. Additional charges may apply.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="flex justify-between items-start">
                    <div className="flex space-x-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          Size: {item.size}, Color: {item.color}
                        </p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        {item.customDesign && (
                          <p className="text-xs text-blue-600">Custom: {item.customDesign}</p>
                        )}
                      </div>
                    </div>
                    <p className="font-medium text-sm">₹{(item.price * item.quantity * 83).toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{(total * 83).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>₹{(5.99 * 83).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₹{(total * 0.08 * 83).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{((total + 5.99 + (total * 0.08)) * 83).toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePlaceOrder} 
                  className="w-full" 
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${((total + 5.99 + (total * 0.08)) * 83).toFixed(2)}`}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
