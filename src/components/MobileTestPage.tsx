import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export const MobileTestPage: React.FC = () => {
  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-green-50/30 to-emerald-50/20">
      <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-green-600 mb-2">Mobile Test Page</h1>
          <p className="text-sm md:text-base text-gray-600">Testing responsive design across different screen sizes</p>
          <div className="mt-4 text-xs text-gray-500">
            Screen width: <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              <span className="sm:hidden">XS (&lt;640px)</span>
              <span className="hidden sm:block md:hidden">SM (640px+)</span>
              <span className="hidden md:block lg:hidden">MD (768px+)</span>
              <span className="hidden lg:block xl:hidden">LG (1024px+)</span>
              <span className="hidden xl:block">XL (1280px+)</span>
            </span>
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold text-base md:text-lg mb-2">Mobile First</h3>
            <p className="text-sm md:text-base text-gray-600">This card adapts to different screen sizes with responsive padding and text.</p>
          </Card>
          
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold text-base md:text-lg mb-2">Tablet View</h3>
            <p className="text-sm md:text-base text-gray-600">On tablets, cards are arranged in a 2-column layout.</p>
          </Card>
          
          <Card className="p-4 md:p-6">
            <h3 className="font-semibold text-base md:text-lg mb-2">Desktop View</h3>
            <p className="text-sm md:text-base text-gray-600">On desktop, this becomes a 3-column layout.</p>
          </Card>
        </div>

        {/* Navigation Test */}
        <Card className="p-4 md:p-6">
          <h3 className="font-semibold text-base md:text-lg mb-4">Navigation Test</h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button size="sm" className="w-full sm:w-auto">Dashboard</Button>
            <Button size="sm" variant="outline" className="w-full sm:w-auto">AI Companion</Button>
            <Button size="sm" variant="outline" className="w-full sm:w-auto">Journal</Button>
            <Button size="sm" variant="outline" className="w-full sm:w-auto">Settings</Button>
          </div>
        </Card>

        {/* Button Test */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Button className="flex-1 h-12 md:h-auto">Mobile Friendly Button</Button>
          <Button variant="outline" className="flex-1 h-12 md:h-auto">Secondary Action</Button>
        </div>

        {/* Typography Test */}
        <Card className="p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Typography Scale</h2>
          <div className="space-y-2 md:space-y-3">
            <p className="text-xs md:text-sm text-gray-500">Extra small text (xs on mobile, sm on desktop)</p>
            <p className="text-sm md:text-base text-gray-600">Small text (sm on mobile, base on desktop)</p>
            <p className="text-base md:text-lg text-gray-700">Base text (base on mobile, lg on desktop)</p>
            <p className="text-lg md:text-xl text-gray-800">Large text (lg on mobile, xl on desktop)</p>
          </div>
        </Card>

        {/* Layout Test */}
        <Card className="p-4 md:p-6">
          <h3 className="font-semibold text-base md:text-lg mb-4">Layout Behavior</h3>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <span className="text-sm">Stacks on mobile, row on desktop</span>
              <Button size="sm">Action</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-green-100 p-2 rounded text-center text-xs">Col 1</div>
              <div className="bg-blue-100 p-2 rounded text-center text-xs">Col 2</div>
              <div className="bg-yellow-100 p-2 rounded text-center text-xs">Col 3</div>
              <div className="bg-purple-100 p-2 rounded text-center text-xs">Col 4</div>
            </div>
          </div>
        </Card>

        {/* Spacing Test */}
        <div className="bg-white rounded-lg p-3 md:p-6 border">
          <h3 className="font-semibold mb-2 md:mb-4">Spacing Test</h3>
          <div className="space-y-2 md:space-y-4">
            <div className="bg-green-100 p-2 md:p-4 rounded">Responsive padding</div>
            <div className="bg-blue-100 p-2 md:p-4 rounded">Adapts to screen size</div>
          </div>
        </div>

        {/* Touch Target Test */}
        <Card className="p-4 md:p-6">
          <h3 className="font-semibold text-base md:text-lg mb-4">Touch Target Test</h3>
          <p className="text-sm text-gray-600 mb-4">All buttons should be at least 44px tall on mobile for accessibility</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <Button size="sm" className="h-11">44px</Button>
            <Button size="sm" variant="outline" className="h-11">Touch</Button>
            <Button size="sm" variant="outline" className="h-11">Target</Button>
            <Button size="sm" variant="outline" className="h-11">Test</Button>
          </div>
        </Card>

        {/* Mobile Issues Check */}
        <Card className="p-4 md:p-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-base md:text-lg mb-4 text-green-800">✅ Mobile Optimization Checklist</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Responsive navigation with hamburger menu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Touch-friendly button sizes (44px minimum)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Responsive typography and spacing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Mobile-first grid layouts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Proper viewport meta tag</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>No horizontal scroll on mobile</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};