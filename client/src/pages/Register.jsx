import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Heading, FormControl, FormLabel, Input, Button, Text, Alert, AlertIcon, useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', alias: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box maxW="420px" mx="auto" px={4} py={{ base: 8, md: 16 }}>
      <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="18px" p={{ base: 6, md: 9 }}>
        <Heading fontSize="30px" mb={5}>Join the crew</Heading>
        <form onSubmit={handleSubmit}>
          {error && <Alert status="error" borderRadius="md" mb={4} fontSize="sm"><AlertIcon />{error}</Alert>}
          <FormControl mb={3} isRequired>
            <FormLabel fontSize="xs">Full name</FormLabel>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Maria Santos" />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel fontSize="xs">Nickname (optional)</FormLabel>
            <Input value={form.alias} onChange={e => setForm({ ...form, alias: e.target.value })} placeholder="e.g. The Hillbreaker" />
          </FormControl>
          <FormControl mb={3} isRequired>
            <FormLabel fontSize="xs">Email</FormLabel>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
          </FormControl>
          <FormControl mb={5} isRequired>
            <FormLabel fontSize="xs">Password</FormLabel>
            <Input type="password" minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
          </FormControl>
          <Button type="submit" w="100%" isLoading={busy} bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410">
            Create account
          </Button>
        </form>
        <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
          Already a member? <Link to="/login"><Text as="span" color="brand.cyan">Log in</Text></Link>
        </Text>
      </Box>
    </Box>
  );
}
