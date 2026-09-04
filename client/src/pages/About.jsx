import React from 'react';
import { Box, Heading, Text, SimpleGrid, VStack, UnorderedList, ListItem, useColorModeValue } from '@chakra-ui/react';

export default function About() {
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');

  return (
    <Box maxW="1080px" mx="auto" px={4} py={{ base: 8, md: 12 }}>
      <Heading fontSize={{ base: '32px', md: '40px' }} mb={6}>About the crew</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <VStack align="start" spacing={4}>
          <Text color="gray.500" lineHeight={1.7} fontSize="sm">
            Ultraboyz isn't built around pace. We're built around distance — the idea that if you can hold your form for 30, 40, 50 kilometers, speed isn't something you chase, it's something that shows up on its own.
          </Text>
          <Text color="gray.500" lineHeight={1.7} fontSize="sm">
            We train almost entirely LSD — long, slow distance. No interval sessions, no track work, no pace charts taped to the fridge. Our power comes from volume: mileage stacked week after week, not speed drilled into the legs.
          </Text>
          <Text color="gray.500" lineHeight={1.7} fontSize="sm">
            Most run clubs measure their week in minutes per kilometer. We measure ours in how far the legs held out. That's the whole philosophy: put in the distance, and the fast will find you eventually. It usually does.
          </Text>
          <Text color="gray.500" lineHeight={1.7} fontSize="sm">
            That doesn't mean we're slow — ask anyone who's tried to keep up with us in the last 5K of a 50. We're just not in a hurry to get there.
          </Text>
        </VStack>
        <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="14px" p={6} h="fit-content">
          <Heading fontSize="22px" color="brand.cyan" mb={3}>How we train</Heading>
          <UnorderedList spacing={2} fontSize="sm" color="gray.500">
            <ListItem>One LSD long run a week, either Saturday or Sunday — distance posted the night before</ListItem>
            <ListItem>No intervals, no speedwork — the mileage does the conditioning</ListItem>
            <ListItem>Everyone crews for everyone — no one finishes an aid station alone</ListItem>
            <ListItem>Race reports are mandatory, humility is optional</ListItem>
            <ListItem>Photos go up after every race, good angles not guaranteed</ListItem>
          </UnorderedList>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
