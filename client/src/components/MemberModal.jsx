import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody,
  Avatar, VStack, Text, Divider, Flex, Box,
} from '@chakra-ui/react';

function formatPace(pace) {
  if (pace == null) return '—';
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')} /km`;
}

export default function MemberModal({ member, onClose }) {
  return (
    <Modal isOpen={!!member} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalCloseButton />
        {member && (
          <>
            <ModalHeader textAlign="center" pt={8}>
              <VStack spacing={1}>
                <Avatar size="xl" src={member.photo_url} name={member.name} />
                <Text fontFamily="heading" fontSize="3xl" mt={2}>{member.alias || member.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {member.name}{member.crew_number != null && ` · crew #${String(member.crew_number).padStart(3, '0')}`}
                </Text>
              </VStack>
            </ModalHeader>
            <ModalBody pb={8}>
              <VStack align="stretch" spacing={0}>
                {[
                  ['Pace', formatPace(member.pace_min_per_km != null ? Number(member.pace_min_per_km) : null)],
                  ['Longest run', member.longest_run_km != null ? `${Number(member.longest_run_km).toFixed(1)} km` : '—'],
                  ['Personal record', member.personal_record || '—'],
                ].map(([label, value]) => (
                  <Box key={label}>
                    <Divider />
                    <Flex justify="space-between" py={2} fontSize="sm">
                      <Text color="gray.500">{label}</Text>
                      <Text>{value}</Text>
                    </Flex>
                  </Box>
                ))}
              </VStack>
              {member.bio && <Text fontSize="sm" color="gray.500" mt={4} lineHeight={1.6}>{member.bio}</Text>}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
