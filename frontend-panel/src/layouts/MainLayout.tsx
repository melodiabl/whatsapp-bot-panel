import React from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  useColorModeValue, 
  Badge, 
  IconButton, 
  Icon 
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useColorMode } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { 
  FaWhatsapp, 
  FaTachometerAlt, 
  FaQrcode, 
  FaVoteYea, 
  FaBook, 
  FaHeart, 
  FaClipboardList, 
  FaHistory, 
  FaUsers, 
  FaUsersCog 
} from 'react-icons/fa';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const sidebarBg = useColorModeValue('gray.50', 'gray.900');

  const isActive = (path: string) => location.pathname === path;

  const getIconForPath = (path: string) => {
    switch (path) {
      case '/': return FaTachometerAlt;
      case '/whatsapp': return FaQrcode;
      case '/votaciones': return FaVoteYea;
      case '/manhwas': return FaBook;
      case '/aportes': return FaHeart;
      case '/pedidos': return FaClipboardList;
      case '/logs': return FaHistory;
      case '/grupos': return FaUsers;
      case '/usuarios': return FaUsersCog;
      default: return FaTachometerAlt;
    }
  };

  const navigationItems = [
    { path: '/', label: 'Dashboard', roles: ['owner', 'admin', 'moderador', 'usuario'] },
    { path: '/whatsapp', label: 'WhatsApp QR', roles: ['owner', 'admin', 'moderador'] },
    { path: '/votaciones', label: 'Votaciones', roles: ['owner', 'admin', 'moderador', 'usuario'] },
    { path: '/manhwas', label: 'Manhwas', roles: ['owner', 'admin', 'moderador', 'usuario'] },
    { path: '/aportes', label: 'Aportes', roles: ['owner', 'admin', 'moderador', 'usuario'] },
    { path: '/pedidos', label: 'Pedidos', roles: ['owner', 'admin', 'moderador', 'usuario'] },
    { path: '/logs', label: 'Logs', roles: ['owner', 'admin', 'moderador'] },
    { path: '/grupos', label: 'Grupos', roles: ['owner', 'admin'] },
    { path: '/usuarios', label: 'Usuarios', roles: ['owner', 'admin'] },
  ];

  const canAccess = (roles: string[]) => {
    return user && roles.includes(user.rol);
  };

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case 'owner': return 'purple';
      case 'admin': return 'red';
      case 'moderador': return 'blue';
      case 'usuario': return 'green';
      default: return 'gray';
    }
  };

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <Box
        w="250px"
        bg={sidebarBg}
        borderRight="1px"
        borderColor={borderColor}
        p={4}
      >
        <VStack align="stretch" spacing={4}>
          <HStack spacing={2}>
            <Icon as={FaWhatsapp} boxSize={6} color="green.500" />
            <Text fontSize="xl" fontWeight="bold" color="green.500">
              WhatsApp Bot Panel
            </Text>
          </HStack>
          
          {/* User info */}
          {user && (
            <Box p={3} bg={bg} borderRadius="md" border="1px" borderColor={borderColor}>
              <Text fontSize="sm" fontWeight="semibold">{user.username}</Text>
              <Badge colorScheme={getRoleBadgeColor(user.rol)} size="sm">
                {user.rol}
              </Badge>
            </Box>
          )}
          
          {/* Navigation items */}
          <VStack align="stretch" spacing={1}>
            {navigationItems.map((item) => (
              canAccess(item.roles) && (
                <Button
                  key={item.path}
                  as={Link}
                  to={item.path}
                  variant={isActive(item.path) ? "solid" : "ghost"}
                  colorScheme={isActive(item.path) ? "green" : "gray"}
                  justifyContent="flex-start"
                  size="sm"
                  leftIcon={<Icon as={getIconForPath(item.path)} />}
                >
                  {item.label}
                </Button>
              )
            ))}
          </VStack>

        </VStack>
      </Box>

      {/* Main content */}
      <Flex flex={1} direction="column">
        {/* Header */}
        <Box
          bg={bg}
          borderBottom="1px"
          borderColor={borderColor}
          p={4}
        >
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              Panel de Control
            </Text>
            <HStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Bienvenido, {user?.username}
              </Text>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                size="sm"
                variant="ghost"
              />
              <Button size="sm" colorScheme="red" variant="outline" onClick={logout}>
                Cerrar Sesión
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Content */}
        <Box flex={1} bg={sidebarBg} overflow="auto">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
