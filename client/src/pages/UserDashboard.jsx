import React, { useState } from 'react';
import {
  Box, Heading, Text, SimpleGrid, FormControl, FormLabel, Input, Textarea,
  Button, Alert, AlertIcon, useColorModeValue,
} from '@chakra-ui/react';
import { useAuth, apiFetch } from '../context/AuthContext.jsx';
import PhotoUploadField from '../components/PhotoUploadField.jsx';

export default function UserDashboard() {
  const { user, updateLocalUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name || '', alias: user.alias || '', photo_url: user.photo_url || '',
    pace_min_per_km: user.pace_min_per_km || '', longest_run_km: user.longest_run_km || '',
    personal_record: user.personal_record || '', bio: user.bio || '', password: '',
  });
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true); setStatus(null);
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    try {
      const updated = await apiFetch(`/api/members/${user.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      updateLocalUser(updated);
      setForm(f => ({ ...f, password: '' }));
      setStatus({ type: 'success', message: 'Profile updated.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box maxW="1080px" mx="auto" px={4} py={{ base: 8, md: 12 }}>
      <Heading fontSize={{ base: '32px', md: '40px' }}>My profile</Heading>
      <Text color="gray.500" fontSize="sm" mb={6}>
        Crew #{String(user.crew_number).padStart(3, '0')} · {user.role === 'admin' ? 'Admin' : 'Member'}
      </Text>

      <Box as="form" onSubmit={handleSubmit} bg={cardBg} border="1px dashed" borderColor={borderCol} borderRadius="14px" p={6} maxW="640px">
        {status && (
          <Alert status={status.type} borderRadius="md" mb={4} fontSize="sm"><AlertIcon />{status.message}</Alert>
        )}
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
          <FormControl><FormLabel fontSize="xs">Full name</FormLabel><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormControl>
          <FormControl><FormLabel fontSize="xs">Nickname</FormLabel><Input value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} /></FormControl>
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
          <FormControl><FormLabel fontSize="xs">Pace (min/km, e.g. 5.30 = 5:30)</FormLabel><Input type="number" step="0.01" value={form.pace_min_per_km} onChange={e => setForm({ ...form, pace_min_per_km: e.target.value })} /></FormControl>
          <FormControl><FormLabel fontSize="xs">Longest run (km)</FormLabel><Input type="number" step="0.1" value={form.longest_run_km} onChange={e => setForm({ ...form, longest_run_km: e.target.value })} /></FormControl>
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mb={3}>
          <FormControl><FormLabel fontSize="xs">Personal record</FormLabel><Input value={form.personal_record} onChange={e => setForm({ ...form, personal_record: e.target.value })} /></FormControl>
          <PhotoUploadField label="Photo" value={form.photo_url} onChange={url => setForm({ ...form, photo_url: url })} />
        </SimpleGrid>
        <FormControl mb={3}><FormLabel fontSize="xs">Bio</FormLabel><Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></FormControl>
        <FormControl mb={4}>
          <FormLabel fontSize="xs">New password (leave blank to keep current)</FormLabel>
          <Input type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
        </FormControl>
        <Button type="submit" isLoading={busy} bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410">Save changes</Button>
      </Box>
    </Box>
  );
}
