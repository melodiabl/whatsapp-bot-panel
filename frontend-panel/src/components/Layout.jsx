import React, { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  Button,
  Heading,
  Text,
  IconButton,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiHome,
  FiPackage,
  FiFileText,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMoon,
  FiSun,
  FiLayers,
  FiGrid,
} from 'react-icons/fi';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import Pedidos from './Pedidos';
import Aportes from './Aportes';
import Manhwas from './Manhwas';
import Usuarios from './Usuarios';
import Grupos from './Grupos';
import Configuracion from './Configuracion';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome },
  { id: 'pedidos', label: 'Pedidos', icon: FiPackage },
  { id: 'aportes', label: 'Aportes', icon: FiFileText },
  { id: 'manhwas', label: 'Manhwas', icon: FiLayers },
  { id: 'usuarios', label: 'Usuarios', icon: FiUsers },
  { id: 'grupos', label: 'Grupos', icon: FiGrid },
  { id: 'configuracion', label: 'Configuración', icon: FiSettings },
];

const Layout = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { colorMode, toggleColorMode } = useColorMode();

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard user={user} onLogout={onLogout} />;
      case 'pedidos':
        return <Pedidos />;
      case 'aportes':
        return <Aportes />;
      case 'manhwas':
        return <Manhwas />;
      case 'usuarios':
        return <Usuarios />;
      case 'grupos':
        return <Grupos />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return <Dashboard user={user} onLogout={onLogout} />;
    }
  };

  return (
    <Flex h="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      {/* Sidebar */}
      <Box
        display={{ base: 'none', md: 'flex' }}
        w="64"
        flexDir="column"
        pos="fixed"
        insetY="0"
        bg={useColorModeValue('gray.800', 'gray.700')}
        overflowY="auto"
        pt="5"
      >
        <Box px="4" mb="5">
          <Heading size="lg" color="white">
            Panel WhatsApp
          </Heading>
        </Box>
        <VStack flex="1" px="2" spacing="1" align="stretch">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              leftIcon={<Icon />}
              justifyContent="flex-start"
              variant={activeSection === id ? 'solid' : 'ghost'}
              colorScheme={activeSection === id ? 'blue' : 'gray'}
              onClick={() => setActiveSection(id)}
              w="full"
              size="sm"
              fontWeight="medium"
              borderRadius="md"
            >
              {label}
            </Button>
          ))}
        </VStack>
        <Box p="4" bg={useColorModeValue('gray.700', 'gray.600')}>
          <Flex align="center">
            <Box>
              <Text color="white" fontWeight="medium">
                {user.username}
              </Text>
              <Text color="gray.300" fontSize="sm" textTransform="capitalize">
                {user.role}
              </Text>
            </Box>
            <IconButton
              ml="auto"
              aria-label="Logout"
              icon={<FiLogOut />}
              colorScheme="red"
              variant="ghost"
              onClick={onLogout}
            />
          </Flex>
        </Box>
      </Box>

      {/* Main content */}
      <Box ml={{ base: 0, md: 64 }} flex="1" display="flex" flexDir="column">
        <Flex
          as="header"
          pos="sticky"
          top="0"
          zIndex="10"
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow="sm"
          px="4"
          py="4"
          align="center"
          justify="space-between"
        >
          <Heading size="md" textTransform="capitalize">
            {activeSection}
          </Heading>
          <IconButton
            aria-label="Toggle dark mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            variant="ghost"
          />
        </Flex>
        <Box as="main" flex="1" overflowY="auto" p="6">
          {renderSection()}
        </Box>
      </Box>
    </Flex>
  );
};

