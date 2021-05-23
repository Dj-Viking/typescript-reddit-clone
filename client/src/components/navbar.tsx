import { Box, Button, Link } from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface navbarProps {
  
}

const NavBar: React.FC<navbarProps> = ({  }) => {
  //setting pause to true to not run the me query on the server
  const [{data, fetching}] = useMeQuery({
    pause: isServer()
  });
  const [{fetching: logoutFetching},logout] = useLogoutMutation();

  let body = null;

  if (fetching){
    //data is loading
  }
  else if (!data?.me) {
    //user not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2} color="white">Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link color="white" >Register</Link>
        </NextLink>
      </>
    );
  }
  else {
    //user is logged in
    body = (
      <>
        <Box>
          <span style={{color: "white"}}>
            You are logged in as: <span style={{color: "yellow"}}>{data?.me?.username}</span>
          </span>
          <Button 
            ml={4} 
            color="white" 
            variant="link"
            isLoading={logoutFetching}
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Button>
        </Box>
      </>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "teal",
        padding: "20px 0",
        zIndex: 1,
        position: "sticky",
        top: 0
      }}
    >
      <Box
        ml={"auto"}
        mr={4}
      >
        {body}
      </Box>
    </div>
  );
}
export default NavBar;