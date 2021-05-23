import React from 'react';
import NavBar from './navbar';
import Wrapper, { WrapperMaxWVariant } from './wrapper';

interface LayoutProps {
  variant?: WrapperMaxWVariant
}

const Layout: React.FC<LayoutProps> = ({ children, variant }) => {
  return (
    <>
    <NavBar/>
    <Wrapper variant={variant}>
      {children}
    </Wrapper>
    </>
  );
}
export default Layout;