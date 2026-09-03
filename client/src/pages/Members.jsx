import React, { useEffect, useState } from 'react';
import { Box, Heading, SimpleGrid, Text, Alert, AlertIcon } from '@chakra-ui/react';
import MemberCard from '../components/MemberCard.jsx';
import MemberModal from '../components/MemberModal.jsx';
import { mockMembers } from '../data/mockMembers.js';
import { apiFetch } from '../context/AuthContext.jsx';

export default function Members() {
  const [members, setMembers] = useState(null);
  const [active, setActive] = useState(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    apiFetch('/api/members')
      .then(setMembers)
      .catch(() => { setMembers(mockMembers); setFallback(true); });
  }, []);

  return (
    <Box maxW="1080px" mx="auto" px={4} py={{ base: 8, md: 12 }}>
      <Heading fontSize={{ base: '32px', md: '40px' }} mb={5}>The crew</Heading>
      {fallback && (
        <Alert status="warning" borderRadius="md" mb={5} fontSize="sm">
          <AlertIcon /> Showing sample data — start the API and Postgres to see the live roster.
        </Alert>
      )}
      {members === null && <Text color="gray.500">Loading the roster…</Text>}
      <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={4}>
        {members && members.map(m => <MemberCard key={m.id} member={m} onOpen={setActive} />)}
      </SimpleGrid>
      <MemberModal member={active} onClose={() => setActive(null)} />
    </Box>
  );
}
