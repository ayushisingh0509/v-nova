
import React, { ReactNode } from 'react';
import { Header } from './Header';
// import { VapiAssistant } from './VapiAssistant';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  transparentHeader?: boolean;
}

export const Layout = ({ 
  children, 
  showHeader = true, 
  transparentHeader = false 
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header transparent={transparentHeader} />}
      <main className="flex-1">
        {children}
        
        {/* Vapi Assistant is now embedded via index.html <vapi-widget> to avoid duplicate widgets */}
      </main>
    </div>
  );
};
