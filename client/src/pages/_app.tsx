import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react'
import React from 'react'
import { Provider, createClient } from 'urql'

import theme from '../theme'

function MyApp({ Component, pageProps }: any) {

  const client = createClient({
    url: "http://localhost:4000/graphql",
    //credentials for sending the cookie
    fetchOptions: {
      //but need to change the cors header on the server to the address
      // of the client
      credentials: "include"
    }
  });

  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
