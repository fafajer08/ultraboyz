import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Heading, Text, SimpleGrid, Image, HStack, Button, Input,
  FormControl, FormLabel, Alert, AlertIcon, useColorModeValue,
  Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, useDisclosure, IconButton,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { mockEvents } from '../data/mockEvents.js';
import { apiFetch, useAuth } from '../context/AuthContext.jsx';
import { formatEventDate } from '../utils/dates.js';
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

  // Full-size viewer: activeIndex points into event.photos, or 'cover' for
  // the cover photo. null means closed.
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeIndex, setActiveIndex] = useState(null);

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
  const photos = event.photos || [];

  function openViewer(index) {
    setActiveIndex(index);
    onOpen();
  }
  function showPrev(e) {
    e.stopPropagation();
    setActiveIndex(i => (i === 'cover' || i === 0 ? photos.length - 1 : i - 1));
  }
  function showNext(e) {
    e.stopPropagation();
    setActiveIndex(i => (i === 'cover' || i === photos.length - 1 ? 0 : i + 1));
  }

  const activePhoto = activeIndex === 'cover'
    ? { photo_url: event.cover_photo_url, caption: event.title }
    : (activeIndex !== null ? photos[activeIndex] : null);
  const canNavigate = activeIndex !== 'cover' && photos.length > 1;

  return (
    <Box maxW="1080px" mx="auto" px={4} py={{ base: 8, md: 12 }}>
      <Link to="/events"><Text color="gray.500" mb={5} fontSize="sm">&larr; back to events</Text></Link>
      {event.cover_photo_url && (
        <Image
          as="button" onClick={() => openViewer('cover')}
          src={event.cover_photo_url} alt={event.title}
          w="100%" maxH="320px" objectFit="cover" borderRadius="14px" mb={5} cursor="pointer"
        />
      )}
      <Heading fontSize={{ base: '32px', md: '40px' }} mb={2}>{event.title}</Heading>
      <Text fontSize="sm" color="gray.500" mb={2}>
        {event.location} · {formatEventDate(event.event_date, event.end_date, { long: true })} · {event.distance}
      </Text>
      <Text fontSize="sm" color="gray.500" mb={7}>{event.notes}</Text>
      {fallback && (
        <Alert status="warning" borderRadius="md" mb={5} fontSize="sm">
          <AlertIcon /> Showing sample data — start the API and Postgres to see the real gallery.
        </Alert>
      )}

      <Heading fontSize="22px" color="gray.500" mb={3}>Photos</Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={8}>
        {photos.map((p, i) => (
          <Box
            key={p.id} as="button" onClick={() => openViewer(i)}
            bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden" textAlign="left"
          >
            <Image src={p.photo_url} alt={p.caption} h="160px" w="100%" objectFit="cover" />
            <Text fontSize="xs" color="gray.500" p={3}>{p.caption}</Text>
          </Box>
        ))}
      </SimpleGrid>
      {photos.length === 0 && <Text color="gray.500" mb={8}>No photos posted yet.</Text>}

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

      {/* Full-size photo viewer, works for both the cover photo and gallery photos */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none" mx={4}>
          <ModalCloseButton color="white" bg="blackAlpha.600" borderRadius="full" zIndex={2} />
          <ModalBody p={0} position="relative">
            {activePhoto && (
              <>
                <Image src={activePhoto.photo_url} alt={activePhoto.caption} w="100%" maxH="80vh" objectFit="contain" borderRadius="10px" />
                {activePhoto.caption && (
                  <Text color="white" textAlign="center" fontSize="sm" mt={3}>{activePhoto.caption}</Text>
                )}
                {canNavigate && (
                  <HStack justify="space-between" position="absolute" top="50%" left={0} right={0} transform="translateY(-50%)" px={2}>
                    <IconButton aria-label="Previous photo" icon={<ChevronLeftIcon boxSize={6} />} onClick={showPrev} borderRadius="full" bg="blackAlpha.600" color="white" _hover={{ bg: 'blackAlpha.800' }} />
                    <IconButton aria-label="Next photo" icon={<ChevronRightIcon boxSize={6} />} onClick={showNext} borderRadius="full" bg="blackAlpha.600" color="white" _hover={{ bg: 'blackAlpha.800' }} />
                  </HStack>
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
