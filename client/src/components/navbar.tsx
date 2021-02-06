import { Box, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';

interface navbarProps {
  
}

const NavBar: React.FC<navbarProps> = ({  }) => {
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "teal",
        padding: "20px 0"
      }}
    >
      <Box
        ml={"auto"}
        mr={4}
      >
        <NextLink href="/login">
          <Link mr={2} color="white">Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white" >Register</Link>
        </NextLink>
      </Box>
    </div>
  );
}
export default NavBar;