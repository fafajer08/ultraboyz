import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box, Heading, FormControl, FormLabel, Input, Button, Text, Alert, AlertIcon, useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const cardBg = useColorModeValue('white', '#182019');
  const borderCol = useColorModeValue('rgba(18,24,15,0.12)', 'rgba(234,243,233,0.12)');

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await login(form.email, form.password);
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
        <Heading fontSize="30px" mb={5}>Log in</Heading>
        <form onSubmit={handleSubmit}>
          {error && <Alert status="error" borderRadius="md" mb={4} fontSize="sm"><AlertIcon />{error}</Alert>}
          <FormControl mb={3} isRequired>
            <FormLabel fontSize="xs">Email</FormLabel>
            <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@ultraboyz.club" />
          </FormControl>
          <FormControl mb={5} isRequired>
            <FormLabel fontSize="xs">Password</FormLabel>
            <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </FormControl>
          <Button type="submit" w="100%" isLoading={busy} bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410">
            Log in
          </Button>
        </form>
        <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
          New to the crew? <Link to="/register"><Text as="span" color="brand.cyan">Register</Text></Link>
        </Text>
      </Box>
    </Box>
  );
}
