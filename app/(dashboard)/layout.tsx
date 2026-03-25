import AuthGuard from '@/components/AuthGuard';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthGuard>{children}</AuthGuard>;
};

export default Layout;
