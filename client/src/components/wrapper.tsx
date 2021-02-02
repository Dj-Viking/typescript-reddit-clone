import React from 'react';
import { Box } from '@chakra-ui/react';

export type WrapperMaxWVariant = "small" | "regular" | "responsive"

//creating option props with '?' 
interface WrapperProps {
  maxWVariant?: WrapperMaxWVariant
}

const Wrapper: React.FC<WrapperProps> = ({
  children,
  maxWVariant
}) => {
  function checkVariantProp(variant) {
    if (variant === "regular") return "600px";
    else if (variant === "small") return "300px";
    else if (variant === "responsive") return "50%";
  }
  return (
    <Box
      maxW={checkVariantProp(maxWVariant)}
      mt="8"
      mx="auto"
      w="100%"
    >
      {children}
    </Box>
  );
}
export default Wrapper;