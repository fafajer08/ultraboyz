import React, { useRef, useState } from 'react';
import { Box, FormControl, FormLabel, Input, Button, HStack, Image, Text, Spinner } from '@chakra-ui/react';
import { uploadFile } from '../context/AuthContext.jsx';

// Lets someone either upload a file from their device OR paste a link —
// both end up filling the same `value`/`onChange` pair, so this drops
// straight into any form that currently just has a plain URL input.
export default function PhotoUploadField({ label = 'Photo', value, onChange }) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
      <HStack spacing={3} mb={2}>
        {value && <Image src={value} alt="Preview" boxSize="44px" objectFit="cover" borderRadius="8px" />}
        <Button
          size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}
          isLoading={busy} loadingText="Uploading…"
        >
          {value ? 'Replace photo' : 'Upload from device'}
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
      </HStack>
      <Input
        size="sm" value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder="…or paste an image link"
      />
      {error && <Text fontSize="xs" color="red.400" mt={1}>{error}</Text>}
    </FormControl>
  );
}
