import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Heading, Text, HStack, VStack, Button, SimpleGrid, useColorModeValue } from '@chakra-ui/react';

export default function Home() {
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');

  return (
    <Box maxW="1080px" mx="auto" px={4} py={{ base: 8, md: 16 }}>
      <Text color="brand.cyan" fontSize="sm" letterSpacing="0.08em" mb={2}>ULTRAMARATHON RUN CREW</Text>
      <Heading
        fontSize={{ base: '52px', md: '104px' }} lineHeight={0.92}
        bgGradient="linear(to-r, brand.cyan, brand.magenta)" bgClip="text"
      >
        Ultraboyz
      </Heading>
      <Text color="gray.500" fontSize={{ base: 'md', md: 'lg' }} maxW="56ch" mt={4} lineHeight={1.6}>
        We train for distance first. Speed just shows up eventually — turns out logging the miles is the fastest way to get fast anyway.
      </Text>
      <HStack mt={7} spacing={3} wrap="wrap">
        <Button as={Link} to="/events" bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410" size="lg">See our events</Button>
        <Button as={Link} to="/crew" variant="outline" size="lg">Meet the crew</Button>
      </HStack>
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4} mt={12}>
        {[['8', 'active members'], ['42K+', 'longest standing runs'], ['4', 'races this season']].map(([num, lbl]) => (
          <VStack key={lbl} align="start" bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="14px" p={5}>
            <Text fontFamily="heading" fontSize="4xl" color="brand.cyan">{num}</Text>
            <Text fontSize="xs" color="gray.500">{lbl}</Text>
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );
}
