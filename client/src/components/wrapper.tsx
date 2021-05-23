import React from 'react';
import { Box } from '@chakra-ui/react';

export type WrapperMaxWVariant = "small" | "regular" | "responsive" | "80%" | undefined | "100%"

//creating option props with '?' 
interface WrapperProps {
  variant?: WrapperMaxWVariant
}

const Wrapper: React.FC<WrapperProps> = ({
  children,
  variant
}) => {
  function checkVariantProp(variant?: WrapperMaxWVariant) {
    if (variant === "regular") 
      return "600px";
    else if (variant === "small") 
      return "300px";
    else if (variant === "responsive") 
      return "50%";
    else if (variant === "80%") 
      return "80%";
    else if (typeof variant === "undefined") 
      return "100%";
    else return "100%";
  }
  return (
    <Box
      maxW={checkVariantProp(variant)}
      mt="8"
      mx="auto"
      w="100%"
    >
      {children}
    </Box>
  );
}
export default Wrapper;