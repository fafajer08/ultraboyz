import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Alert, AlertIcon } from '@chakra-ui/react';
import EventCard from '../components/EventCard.jsx';
import { mockEvents } from '../data/mockEvents.js';
import { apiFetch } from '../context/AuthContext.jsx';

export default function Events() {
  const [events, setEvents] = useState(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    apiFetch('/api/events')
      .then(setEvents)
      .catch(() => { setEvents(mockEvents); setFallback(true); });
  }, []);

  const upcoming = events ? events.filter(e => e.status === 'upcoming') : [];
  const recent = events ? events.filter(e => e.status === 'recent') : [];

  return (
    <Box maxW="1080px" mx="auto" px={4} py={{ base: 8, md: 12 }}>
      <Heading fontSize={{ base: '32px', md: '40px' }} mb={5}>Ultramarathon events</Heading>
      {fallback && (
        <Alert status="warning" borderRadius="md" mb={5} fontSize="sm">
          <AlertIcon /> Showing sample data — start the API and Postgres to see live events.
        </Alert>
      )}

      <Heading fontSize="22px" color="gray.500" mt={7} mb={3}>Upcoming</Heading>
      {events === null && <Text color="gray.500">Loading…</Text>}
      {events && upcoming.length === 0 && <Text color="gray.500">Nothing on the calendar yet.</Text>}
      {upcoming.map(ev => <EventCard key={ev.id} event={ev} />)}

      <Heading fontSize="22px" color="gray.500" mt={7} mb={3}>Recent</Heading>
      {events && recent.length === 0 && <Text color="gray.500">No race reports yet.</Text>}
      {recent.map(ev => <EventCard key={ev.id} event={ev} />)}
    </Box>
  );
}
