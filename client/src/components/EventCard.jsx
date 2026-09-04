import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Flex, Text, Badge, Image, useColorModeValue } from '@chakra-ui/react';
import { parseEventDate } from '../utils/dates.js';

export default function EventCard({ event }) {
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');
  const d = parseEventDate(event.event_date);
  const mon = d ? d.toLocaleString('en-US', { month: 'short' }) : '—';
  const day = d ? d.getDate() : '';
  const year = d ? d.getFullYear() : '';
  const isRecent = event.status === 'recent';

  const content = (
    <Flex
      bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="14px"
      p={{ base: 4, md: 5 }} mb={3} gap={4} wrap="wrap" transition="border-color 0.15s"
      _hover={isRecent ? { borderColor: 'brand.cyan' } : undefined}
    >
      {event.cover_photo_url && (
        <Image
          src={event.cover_photo_url} alt={event.title}
          boxSize={{ base: '64px', sm: '76px' }} objectFit="cover" borderRadius="10px" flexShrink={0}
        />
      )}
      <Text fontFamily="heading" fontSize="3xl" color="brand.magenta" lineHeight={1} minW="70px">
        {mon}<br />{day}
      </Text>
      <Box flex="1" minW="180px">
        <Text fontWeight={700} fontSize="sm" mb={1}>{event.title}</Text>
        <Text fontSize="xs" color="gray.500" mb={2}>{event.location} · {year}</Text>
        <Text fontSize="xs" color="gray.500" lineHeight={1.6}>{event.notes}</Text>
        {isRecent && <Text fontSize="xs" color="brand.cyan" mt={2}>tap to see photos →</Text>}
      </Box>
      <Badge alignSelf="flex-start" colorScheme={isRecent ? 'yellow' : 'green'} borderRadius="full" px={3} py={1} textTransform="capitalize">
        {event.distance}
      </Badge>
    </Flex>
  );

  return isRecent ? <Link to={`/events/${event.id}`}>{content}</Link> : content;
}
