import React, { useRef, useState } from 'react';
import {
  Box, FormControl, FormLabel, Input, Button, HStack, VStack, Image, Text, Spinner,
  Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, useDisclosure, useColorModeValue,
} from '@chakra-ui/react';
import { uploadFile } from '../context/AuthContext.jsx';

// Lets someone either upload a file from their device OR paste a link —
// both end up filling the same `value`/`onChange` pair, so this drops
// straight into any form that currently just has a plain URL input.
// Shows a real-size preview (not a tiny thumbnail) so you can actually
// see what you uploaded, and it's clickable to view full-size.
export default function PhotoUploadField({ label = 'Photo', value, onChange }) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const previewBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError('');
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      e.target.value = ''; // allow re-selecting the same file later
    }
  }

  return (
    <FormControl>
      <FormLabel fontSize="xs">{label}</FormLabel>

      {value && (
        <Box
          as="button" type="button" onClick={onOpen}
          bg={previewBg} borderRadius="10px" overflow="hidden" mb={2}
          w="100%" h="140px" display="flex" alignItems="center" justifyContent="center"
        >
          <Image src={value} alt="Preview" maxH="100%" maxW="100%" objectFit="contain" />
        </Box>
      )}
      {busy && (
        <HStack mb={2} fontSize="xs" color="gray.500"><Spinner size="xs" /><Text>Uploading…</Text></HStack>
      )}

      <HStack spacing={3} mb={2}>
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} isLoading={busy} loadingText="Uploading…">
          {value ? 'Replace photo' : 'Upload from device'}
        </Button>
        {value && <Button size="sm" variant="ghost" onClick={onOpen}>View full size</Button>}
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
      </HStack>

      <Input
        size="sm" value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder="…or paste an image link"
      />
      {error && <Text fontSize="xs" color="red.400" mt={1}>{error}</Text>}

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent bg="transparent" boxShadow="none" mx={4}>
          <ModalCloseButton color="white" bg="blackAlpha.600" borderRadius="full" />
          <ModalBody p={0}>
            <Image src={value} alt="Full size preview" w="100%" maxH="85vh" objectFit="contain" borderRadius="10px" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </FormControl>
  );
}
