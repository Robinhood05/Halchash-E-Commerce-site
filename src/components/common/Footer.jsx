import React from 'react';
import { Truck, RotateCcw, Headphones, CreditCard, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const features = [
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Anywhere in Bangladesh'
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: 'Within 7 days for an exchange'
    },
    {
      icon: Headphones,
      title: '24/7 Best Support',
      description: 'Within 30 days money return'
    },
    {
      icon: CreditCard,
      title: 'Cash On Delivery',
      description: 'Pay after receiving the product'
    }
  ];

  const quickLinks = [
    'About Us', 'Contact Us', 'FAQ', 'Shipping Info', 
    'Returns', 'Size Guide', 'Privacy Policy', 'Terms of Service'
  ];

  const categories = [
    'Shari & Clothing', 'Beauty Products', 'Personal Care', 
    'Food & Nutrition', 'Home & Garden', 'Traditional Items'
  ];

  return (
    <footer className="bg-gray-50 mt-16">
      {/* Features Section */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-orange-500 text-white px-3 py-2 rounded-lg font-bold text-xl">
                Halchash
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Your one-stop destination for authentic Bengali products. We're committed to providing exceptional shopping experiences with quality products at unbeatable prices.
            </p>
            <div className="space-y-3">
              <div className="flex items-start text-gray-600">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Address 1:</p>
                  <p>Mugdha, Manda Chata Mashjid, Motijheel, Dhaka</p>
                </div>
              </div>
              <div className="flex items-start text-gray-600">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Address 2:</p>
                  <p>Kalukhali, Rajbari, Dhaka</p>
                </div>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <a href="tel:01742060566" className="text-sm hover:text-emerald-600 transition-colors">01742060566</a>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <span className="text-sm">support@halchash.com</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.slice(0, 6).map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {quickLinks.slice(6).map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            
            {/* Contact Buttons */}
            <div className="mt-6 space-y-2">
              <a 
                href="https://www.facebook.com/sirobin.sajeeb/" 
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-600 text-white text-center py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Messenger কল দিন
              </a>
              <a 
                href="tel:01742060566" 
                className="block bg-green-600 text-white text-center py-2 px-4 rounded text-sm hover:bg-green-700 transition-colors"
              >
                সরাসরি কল দিন
              </a>
              <a 
                href="https://wa.me/8801742060566" 
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-emerald-600 text-white text-center py-2 px-4 rounded text-sm hover:bg-emerald-700 transition-colors"
              >
                WhatsApp করুন
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-300">
              © 2024 Halchash. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

