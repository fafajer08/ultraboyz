import React from 'react';
import { Box, VStack, Avatar, Text, Badge, useColorModeValue } from '@chakra-ui/react';

const RARITY_COLOR = { bronze: 'orange', silver: 'gray', gold: 'yellow', legendary: null };

export default function MemberCard({ member, onOpen }) {
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');
  const isLegendary = member.rarity === 'legendary';

  return (
    <Box
      as="button" onClick={() => onOpen(member)}
      bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="14px"
      p={4} textAlign="center" transition="border-color 0.15s"
      _hover={{ borderColor: 'brand.cyan' }}
    >
      <VStack spacing={2}>
        <Box position="relative">
          <Avatar size="lg" src={member.photo_url} name={member.name} sx={{ img: { objectPosition: 'top' } }} />
          {isLegendary ? (
            <Badge position="absolute" bottom="-6px" left="50%" transform="translateX(-50%)" fontSize="8px"
              bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410" borderRadius="full" px={2}>
              Legendary
            </Badge>
          ) : (
            <Badge position="absolute" bottom="-6px" left="50%" transform="translateX(-50%)" fontSize="8px"
              colorScheme={RARITY_COLOR[member.rarity]} borderRadius="full" px={2} textTransform="capitalize">
              {member.rarity}
            </Badge>
          )}
        </Box>
        <Text fontFamily="heading" fontSize="xl" mt={1}>{member.alias || member.name}</Text>
        <Text fontSize="xs" color="gray.500">{member.name}{member.role === 'admin' && ' · Admin'}</Text>
      </VStack>
    </Box>
  );
}
