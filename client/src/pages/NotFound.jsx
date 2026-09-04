import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Heading, Text, Button } from '@chakra-ui/react';

export default function NotFound() {
  return (
    <Box maxW="1080px" mx="auto" px={4} py={{ base: 16, md: 24 }} textAlign="center">
      <Heading fontSize={{ base: '64px', md: '96px' }} bgGradient="linear(to-r, brand.cyan, brand.magenta)" bgClip="text">
        404
      </Heading>
      <Text color="gray.500" mb={6}>This route doesn't exist — kind of like an untracked shortcut.</Text>
      <Button as={Link} to="/" bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410">Back to Home</Button>
    </Box>
  );
}
