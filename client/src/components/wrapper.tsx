import React from 'react';
import { Box } from '@chakra-ui/react';

interface wrapperProps {
    
}

const Wrapper: React.FC<wrapperProps> = ({children}) => {
    return (
        <Box
            maxW="800px"
            mt={8}
            mx="auto"
            w="100%"
        >
            {children}
        </Box>
    );
}
export default Wrapper;