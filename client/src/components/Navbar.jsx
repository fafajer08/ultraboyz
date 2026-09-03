import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Flex, HStack, Box, IconButton, Button, Text, useColorMode, useDisclosure,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  VStack, Badge, Divider,
} from '@chakra-ui/react';
import { HamburgerIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/events', label: 'Events' },
  { to: '/crew', label: 'Crew' },
];

function NavItem({ to, label, end, onClick }) {
  return (
    <NavLink to={to} end={end} onClick={onClick}>
      {({ isActive }) => (
        <Text
          px={3} py={2} borderRadius="full" fontSize="sm" fontWeight={600}
          color={isActive ? 'brand.cyan' : 'inherit'}
          bg={isActive ? 'rgba(95,240,192,0.1)' : 'transparent'}
        >
          {label}
        </Text>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const cardBg = colorMode === 'dark' ? '#182019' : 'white';
  const borderCol = colorMode === 'dark' ? 'rgba(234,243,233,0.12)' : 'rgba(18,24,15,0.12)';

  return (
    <Box position="sticky" top={0} zIndex={40} bg={cardBg} borderBottom="1px solid" borderColor={borderCol}>
      <Flex maxW="1080px" mx="auto" px={4} py={3} align="center" justify="space-between">
        <NavLink to="/">
          <Text
            fontFamily="heading" fontWeight={700} fontSize="2xl"
            bgGradient="linear(to-r, brand.cyan, brand.magenta)" bgClip="text"
          >
            Ultraboyz
          </Text>
        </NavLink>

        <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
          {links.map(l => <NavItem key={l.to} {...l} />)}
          {user && <NavItem to="/dashboard" label="Dashboard" />}
        </HStack>

        <HStack spacing={2}>
          <IconButton
            aria-label="Toggle color mode" size="sm" variant="ghost"
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
          />
          <Box display={{ base: 'none', md: 'block' }}>
            {user ? (
              <HStack>
                <Text fontSize="sm" color="gray.500">
                  {user.alias || user.name}
                  {user.role === 'admin' && <Badge ml={2} colorScheme="pink" borderRadius="full">Admin</Badge>}
                </Text>
                <Button size="sm" onClick={() => { logout(); navigate('/'); }}>Log out</Button>
              </HStack>
            ) : (
              <HStack>
                <Button as={NavLink} to="/login" size="sm" variant="outline">Log in</Button>
                <Button as={NavLink} to="/register" size="sm" bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410">Register</Button>
              </HStack>
            )}
          </Box>
          <IconButton aria-label="Open menu" display={{ base: 'flex', md: 'none' }} icon={<HamburgerIcon />} size="sm" variant="outline" onClick={onOpen} />
        </HStack>
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={cardBg}>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={1}>
              {links.map(l => <Box key={l.to} onClick={onClose}><NavItem {...l} /></Box>)}
              {user && <Box onClick={onClose}><NavItem to="/dashboard" label="Dashboard" /></Box>}
              <Divider my={3} />
              {user ? (
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm" color="gray.500">
                    {user.alias || user.name}{user.role === 'admin' && <Badge ml={2} colorScheme="pink" borderRadius="full">Admin</Badge>}
                  </Text>
                  <Button onClick={() => { logout(); onClose(); navigate('/'); }}>Log out</Button>
                </VStack>
              ) : (
                <VStack align="stretch" spacing={2}>
                  <Button as={NavLink} to="/login" variant="outline" onClick={onClose}>Log in</Button>
                  <Button as={NavLink} to="/register" bgGradient="linear(to-r, brand.cyan, brand.magenta)" color="#0E1410" onClick={onClose}>Register</Button>
                </VStack>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
