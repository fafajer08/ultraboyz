import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, TableContainer, Table, Thead, Tbody,
  Tr, Th, Td, Badge, Button, HStack, SimpleGrid, FormControl, FormLabel, Input, Textarea, Select,
  Alert, AlertIcon, Text, useColorModeValue, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, Image, VStack,
} from '@chakra-ui/react';
import { apiFetch } from '../context/AuthContext.jsx';
import { parseEventDate } from '../utils/dates.js';
import PhotoUploadField from '../components/PhotoUploadField.jsx';

const emptyMember = {
  name: '', email: '', password: '', role: 'user', alias: '', crew_number: '',
  photo_url: '', pace_min_per_km: '', longest_run_km: '', personal_record: '', bio: '', rarity: 'bronze',
};
const emptyEvent = { title: '', event_date: '', distance: '', location: '', notes: '', status: 'upcoming', cover_photo_url: '' };

export default function AdminDashboard() {
  return (
    <Box maxW="1080px" mx="auto" px={4} py={{ base: 8, md: 12 }}>
      <Heading fontSize={{ base: '32px', md: '40px' }} mb={6}>Admin dashboard</Heading>
      <Tabs colorScheme="teal">
        <TabList>
          <Tab>Members</Tab>
          <Tab>Events</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}><MembersAdmin /></TabPanel>
          <TabPanel px={0}><EventsAdmin /></TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function FormBox({ children, ...rest }) {
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');
  return <Box bg={cardBg} border="1px dashed" borderColor={borderCol} borderRadius="14px" p={6} mt={5} {...rest}>{children}</Box>;
}

function MembersAdmin() {
  const [members, setMembers] = useState(null);
  const [form, setForm] = useState(emptyMember);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const cardBg = useColorModeValue('white', '#182019');

  function load() { apiFetch('/api/members').then(setMembers).catch(() => setMembers([])); }
  useEffect(load, []);

  function startEdit(m) {
    setEditingId(m.id); setShowAdd(false);
    setForm({
      name: m.name, email: m.email || '', password: '', role: m.role, alias: m.alias || '',
      crew_number: m.crew_number ?? '', photo_url: m.photo_url || '', pace_min_per_km: m.pace_min_per_km ?? '',
      longest_run_km: m.longest_run_km ?? '', personal_record: m.personal_record || '', bio: m.bio || '', rarity: m.rarity,
    });
  }
  function cancel() { setEditingId(null); setShowAdd(false); setForm(emptyMember); setError(''); }

  async function handleAdd(e) {
    e.preventDefault(); setError('');
    try { await apiFetch('/api/members', { method: 'POST', body: JSON.stringify(form) }); cancel(); load(); }
    catch (err) { setError(err.message); }
  }
  async function handleSaveEdit(e) {
    e.preventDefault(); setError('');
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    delete payload.email;
    try { await apiFetch(`/api/members/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) }); cancel(); load(); }
    catch (err) { setError(err.message); }
  }
  async function handleDelete(id) {
    if (!window.confirm('Remove this member? This cannot be undone.')) return;
    try { await apiFetch(`/api/members/${id}`, { method: 'DELETE' }); load(); }
    catch (err) { alert(err.message); }
  }

  const isEditing = editingId !== null;

  return (
    <Box>
      {members === null && <Text color="gray.500">Loading…</Text>}
      {members && (
        <TableContainer bg={cardBg} borderRadius="14px" border="1px solid" borderColor={useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)')}>
          <Table size="sm">
            <Thead><Tr><Th>#</Th><Th>Name</Th><Th>Alias</Th><Th>Role</Th><Th>Rarity</Th><Th></Th></Tr></Thead>
            <Tbody>
              {members.map(m => (
                <Tr key={m.id}>
                  <Td>{m.crew_number}</Td>
                  <Td>{m.name}</Td>
                  <Td>{m.alias}</Td>
                  <Td>{m.role === 'admin' ? <Badge colorScheme="pink" borderRadius="full">Admin</Badge> : 'Member'}</Td>
                  <Td textTransform="capitalize">{m.rarity}</Td>
                  <Td><HStack><Button size="xs" onClick={() => startEdit(m)}>Edit</Button><Button size="xs" colorScheme="red" variant="outline" onClick={() => handleDelete(m.id)}>Delete</Button></HStack></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {!isEditing && (
        <Button mt={5} bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410" onClick={() => { setShowAdd(s => !s); setForm(emptyMember); }}>
          {showAdd ? 'Cancel' : '+ Recruit a member'}
        </Button>
      )}

      {(showAdd || isEditing) && (
        <FormBox as="form" onSubmit={isEditing ? handleSaveEdit : handleAdd}>
          <Heading fontSize="20px" mb={4}>{isEditing ? `Edit ${form.name}` : 'Recruit a member'}</Heading>
          {error && <Alert status="error" borderRadius="md" mb={4} fontSize="sm"><AlertIcon />{error}</Alert>}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
            <FormControl isRequired><FormLabel fontSize="xs">Full name</FormLabel><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormControl>
            <FormControl><FormLabel fontSize="xs">Alias</FormLabel><Input value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} /></FormControl>
          </SimpleGrid>
          {!isEditing && (
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
              <FormControl isRequired><FormLabel fontSize="xs">Email (login)</FormLabel><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></FormControl>
              <FormControl isRequired><FormLabel fontSize="xs">Initial password</FormLabel><Input type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></FormControl>
            </SimpleGrid>
          )}
          {isEditing && (
            <FormControl mb={3}><FormLabel fontSize="xs">Reset password (leave blank to keep current)</FormLabel><Input type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></FormControl>
          )}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
            <FormControl isRequired><FormLabel fontSize="xs">Crew number</FormLabel><Input type="number" value={form.crew_number} onChange={e => setForm({ ...form, crew_number: e.target.value })} /></FormControl>
            <FormControl>
              <FormLabel fontSize="xs">Role</FormLabel>
              <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="user">Member</option><option value="admin">Admin</option>
              </Select>
            </FormControl>
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
            <FormControl>
              <FormLabel fontSize="xs">Rarity</FormLabel>
              <Select value={form.rarity} onChange={e => setForm({ ...form, rarity: e.target.value })}>
                <option value="bronze">Bronze</option><option value="silver">Silver</option>
                <option value="gold">Gold</option><option value="legendary">Legendary</option>
              </Select>
            </FormControl>
            <PhotoUploadField label="Photo" value={form.photo_url} onChange={url => setForm({ ...form, photo_url: url })} />
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
            <FormControl><FormLabel fontSize="xs">Pace (min/km)</FormLabel><Input type="number" step="0.01" value={form.pace_min_per_km} onChange={e => setForm({ ...form, pace_min_per_km: e.target.value })} /></FormControl>
            <FormControl><FormLabel fontSize="xs">Longest run (km)</FormLabel><Input type="number" step="0.1" value={form.longest_run_km} onChange={e => setForm({ ...form, longest_run_km: e.target.value })} /></FormControl>
          </SimpleGrid>
          <FormControl mb={3}><FormLabel fontSize="xs">Personal record</FormLabel><Input value={form.personal_record} onChange={e => setForm({ ...form, personal_record: e.target.value })} /></FormControl>
          <FormControl mb={4}><FormLabel fontSize="xs">Bio</FormLabel><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></FormControl>
          <HStack>
            <Button type="submit" bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410">{isEditing ? 'Save changes' : 'Add member'}</Button>
            <Button variant="outline" onClick={cancel}>Cancel</Button>
          </HStack>
        </FormBox>
      )}
    </Box>
  );
}

function EventsAdmin() {
  const [events, setEvents] = useState(null);
  const [form, setForm] = useState(emptyEvent);
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');
  const [photoTarget, setPhotoTarget] = useState(null);
  const [photoForm, setPhotoForm] = useState({ photo_url: '', caption: '' });
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');

  function load() { apiFetch('/api/events').then(setEvents).catch(() => setEvents([])); }
  useEffect(load, []);

  function startEdit(ev) {
    setEditingId(ev.id); setShowAdd(false);
    setForm({ title: ev.title, event_date: ev.event_date?.slice(0, 10) || '', distance: ev.distance, location: ev.location || '', notes: ev.notes || '', status: ev.status, cover_photo_url: ev.cover_photo_url || '' });
  }
  function cancel() { setEditingId(null); setShowAdd(false); setForm(emptyEvent); setError(''); }

  async function handleAdd(e) {
    e.preventDefault(); setError('');
    try { await apiFetch('/api/events', { method: 'POST', body: JSON.stringify(form) }); cancel(); load(); }
    catch (err) { setError(err.message); }
  }
  async function handleSaveEdit(e) {
    e.preventDefault(); setError('');
    try { await apiFetch(`/api/events/${editingId}`, { method: 'PUT', body: JSON.stringify(form) }); cancel(); load(); }
    catch (err) { setError(err.message); }
  }
  async function handleDelete(id) {
    if (!window.confirm('Delete this event and its photos? This cannot be undone.')) return;
    try { await apiFetch(`/api/events/${id}`, { method: 'DELETE' }); load(); }
    catch (err) { alert(err.message); }
  }
  async function openGallery(ev) {
    const full = await apiFetch(`/api/events/${ev.id}`);
    setPhotoTarget(full);
    setPhotoForm({ photo_url: '', caption: '' });
  }
  async function handleAddPhoto(e) {
    e.preventDefault();
    try {
      await apiFetch(`/api/events/${photoTarget.id}/photos`, { method: 'POST', body: JSON.stringify(photoForm) });
      setPhotoTarget(await apiFetch(`/api/events/${photoTarget.id}`));
      setPhotoForm({ photo_url: '', caption: '' });
    } catch (err) { alert(err.message); }
  }
  async function handleDeletePhoto(photoId) {
    try {
      await apiFetch(`/api/events/${photoTarget.id}/photos/${photoId}`, { method: 'DELETE' });
      setPhotoTarget(await apiFetch(`/api/events/${photoTarget.id}`));
    } catch (err) { alert(err.message); }
  }

  const isEditing = editingId !== null;

  return (
    <Box>
      {events === null && <Text color="gray.500">Loading…</Text>}
      {events && (
        <TableContainer bg={cardBg} borderRadius="14px" border="1px solid" borderColor={borderCol}>
          <Table size="sm">
            <Thead><Tr><Th>Title</Th><Th>Date</Th><Th>Distance</Th><Th>Status</Th><Th></Th></Tr></Thead>
            <Tbody>
              {events.map(ev => (
                <Tr key={ev.id}>
                  <Td>{ev.title}</Td>
                  <Td>{parseEventDate(ev.event_date)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || '—'}</Td>
                  <Td>{ev.distance}</Td>
                  <Td><Badge colorScheme={ev.status === 'recent' ? 'yellow' : 'green'} borderRadius="full" textTransform="capitalize">{ev.status}</Badge></Td>
                  <Td>
                    <HStack>
                      <Button size="xs" onClick={() => startEdit(ev)}>Edit</Button>
                      <Button size="xs" onClick={() => openGallery(ev)}>Photos</Button>
                      <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleDelete(ev.id)}>Delete</Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {!isEditing && (
        <Button mt={5} bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410" onClick={() => { setShowAdd(s => !s); setForm(emptyEvent); }}>
          {showAdd ? 'Cancel' : '+ Post an event'}
        </Button>
      )}

      {(showAdd || isEditing) && (
        <FormBox as="form" onSubmit={isEditing ? handleSaveEdit : handleAdd}>
          <Heading fontSize="20px" mb={4}>{isEditing ? `Edit ${form.title}` : 'Post an event'}</Heading>
          {error && <Alert status="error" borderRadius="md" mb={4} fontSize="sm"><AlertIcon />{error}</Alert>}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
            <FormControl isRequired><FormLabel fontSize="xs">Race name</FormLabel><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FormControl>
            <FormControl isRequired><FormLabel fontSize="xs">Date</FormLabel><Input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} /></FormControl>
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
            <FormControl isRequired><FormLabel fontSize="xs">Distance</FormLabel><Input value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} /></FormControl>
            <FormControl><FormLabel fontSize="xs">Location</FormLabel><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></FormControl>
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
            <FormControl>
              <FormLabel fontSize="xs">Status</FormLabel>
              <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="upcoming">Upcoming</option><option value="recent">Recent</option>
              </Select>
            </FormControl>
            <PhotoUploadField label="Cover photo" value={form.cover_photo_url} onChange={url => setForm({ ...form, cover_photo_url: url })} />
          </SimpleGrid>
          <FormControl mb={4}><FormLabel fontSize="xs">Notes</FormLabel><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormControl>
          <HStack>
            <Button type="submit" bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410">{isEditing ? 'Save changes' : 'Post event'}</Button>
            <Button variant="outline" onClick={cancel}>Cancel</Button>
          </HStack>
        </FormBox>
      )}

      <Modal isOpen={!!photoTarget} onClose={() => setPhotoTarget(null)} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalCloseButton />
          {photoTarget && (
            <>
              <ModalHeader>{photoTarget.title} — photos</ModalHeader>
              <ModalBody pb={6}>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mb={5}>
                  {(photoTarget.photos || []).map(p => (
                    <Box key={p.id} bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="12px" overflow="hidden">
                      <Image src={p.photo_url} alt={p.caption} h="150px" w="100%" objectFit="cover" />
                      <HStack justify="space-between" p={2}>
                        <Text fontSize="xs" color="gray.500">{p.caption}</Text>
                        <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleDeletePhoto(p.id)}>Remove</Button>
                      </HStack>
                    </Box>
                  ))}
                  {(!photoTarget.photos || photoTarget.photos.length === 0) && <Text color="gray.500">No photos yet.</Text>}
                </SimpleGrid>
                <form onSubmit={handleAddPhoto}>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
                    <PhotoUploadField label="Photo" value={photoForm.photo_url} onChange={url => setPhotoForm({ ...photoForm, photo_url: url })} />
                    <FormControl><FormLabel fontSize="xs">Caption</FormLabel><Input value={photoForm.caption} onChange={e => setPhotoForm({ ...photoForm, caption: e.target.value })} /></FormControl>
                  </SimpleGrid>
                  <Button type="submit" bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410">Add photo</Button>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
}
