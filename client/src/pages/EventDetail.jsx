import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Heading, Text, SimpleGrid, Image, VStack, HStack, Button, Input,
  FormControl, FormLabel, Alert, AlertIcon, useColorModeValue,
} from '@chakra-ui/react';
import { mockEvents } from '../data/mockEvents.js';
import { apiFetch, useAuth } from '../context/AuthContext.jsx';
import { parseEventDate } from '../utils/dates.js';
import PhotoUploadField from '../components/PhotoUploadField.jsx';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [fallback, setFallback] = useState(false);
  const [form, setForm] = useState({ photo_url: '', caption: '' });
  const [error, setError] = useState('');
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');

  function load() {
    apiFetch(`/api/events/${id}`)
      .then(setEvent)
      .catch(() => {
        const found = mockEvents.find(e => String(e.id) === String(id));
        setEvent(found || null);
        setFallback(true);
      });
  }
  useEffect(load, [id]);

  async function handleAddPhoto(e) {
    e.preventDefault();
    setError('');
    if (!form.photo_url) { setError('Add a photo URL first.'); return; }
    try {
      await apiFetch(`/api/events/${id}/photos`, { method: 'POST', body: JSON.stringify(form) });
      setForm({ photo_url: '', caption: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (event === null) return <Box maxW="1080px" mx="auto" px={4} py={12}><Text color="gray.500">Loading…</Text></Box>;

  const canAddPhoto = user && (user.role === 'admin' || event.status === 'recent');

  return (
    <Box maxW="1080px" mx="auto" px={4} py={{ base: 8, md: 12 }}>
      <Link to="/events"><Text color="gray.500" mb={5} fontSize="sm">&larr; back to events</Text></Link>
      <Heading fontSize={{ base: '32px', md: '40px' }} mb={2}>{event.title}</Heading>
      <Text fontSize="sm" color="gray.500" mb={2}>
        {event.location} · {parseEventDate(event.event_date)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || 'Date TBD'} · {event.distance}
      </Text>
      <Text fontSize="sm" color="gray.500" mb={7}>{event.notes}</Text>
      {fallback && (
        <Alert status="warning" borderRadius="md" mb={5} fontSize="sm">
          <AlertIcon /> Showing sample data — start the API and Postgres to see the real gallery.
        </Alert>
      )}

      <Heading fontSize="22px" color="gray.500" mb={3}>Photos</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={8}>
        {(event.photos || []).map(p => (
          <Box key={p.id} bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden">
            <Image src={p.photo_url} alt={p.caption} h="160px" w="100%" objectFit="cover" />
            <Text fontSize="xs" color="gray.500" p={3}>{p.caption}</Text>
          </Box>
        ))}
      </SimpleGrid>
      {(!event.photos || event.photos.length === 0) && <Text color="gray.500" mb={8}>No photos posted yet.</Text>}

      {canAddPhoto && (
        <Box bg={cardBg} border="1px dashed" borderColor={borderCol} borderRadius="14px" p={6}>
          <Heading fontSize="20px" mb={4}>Add a photo</Heading>
          {error && <Alert status="error" borderRadius="md" mb={4} fontSize="sm"><AlertIcon />{error}</Alert>}
          <form onSubmit={handleAddPhoto}>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
              <PhotoUploadField label="Photo" value={form.photo_url} onChange={url => setForm({ ...form, photo_url: url })} />
              <FormControl>
                <FormLabel fontSize="xs">Caption</FormLabel>
                <Input value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} placeholder="e.g. Finish line" />
              </FormControl>
            </SimpleGrid>
            <Button type="submit" bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410">Add photo</Button>
          </form>
        </Box>
      )}
      {!canAddPhoto && !user && (
        <Alert status="info" borderRadius="md" fontSize="sm">
          <AlertIcon /><Link to="/login"><Text as="span" color="brand.cyan">Log in</Text></Link>&nbsp;to add photos to this event.
        </Alert>
      )}
      {!canAddPhoto && user && event.status === 'upcoming' && (
        <Alert status="info" borderRadius="md" fontSize="sm">
          <AlertIcon /> Photos can only be added once this event moves to Recent.
        </Alert>
      )}
    </Box>
  );
}
