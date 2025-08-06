import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Spacer,
  useColorMode,
  useColorModeValue,
  Table,
} from '@chakra-ui/react';

import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/api';

export const DashboardPage: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  // Colors based on light/dark mode
  const bg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Navigation handlers
  const handleNavigateToVotaciones = () => {
    navigate('/votaciones');
  };

  const handleNavigateToManhwas = () => {
    navigate('/manhwas');
  };

  const handleNavigateToAportes = () => {
    navigate('/aportes');
  };

  const [stats, setStats] = useState({
    usuarios: 0,
    aportes: 0,
    pedidos: 0,
    grupos: 0,
  });

  const [botStatus, setBotStatus] = useState({
    status: 'disconnected',
    lastConnection: 'Nunca conectado',
    uptime: null,
    isConnected: false,
    timestamp: null
  });

  interface Votacion {
    id: number;
    titulo: string;
    descripcion: string;
    opciones: string;
    estado: string;
    fecha_inicio: string;
    fecha_fin: string;
  }

  interface Manhwa {
    id: number;
    titulo: string;
    autor: string;
    genero: string;
    estado: string;
    descripcion: string;
  }

  interface Aporte {
    id: number;
    contenido: string;
    tipo: string;
    usuario: string;
    fecha: string;
  }

  const [votaciones, setVotaciones] = useState<Votacion[]>([]);
  const [manhwas, setManhwas] = useState<Manhwa[]>([]);
  const [aportes, setAportes] = useState<Aporte[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await dashboardService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    }
    
    async function fetchBotStatus() {
      try {
        const status = await dashboardService.getBotStatus();
        setBotStatus(status);
      } catch (error) {
        console.error('Error fetching bot status:', error);
      }
    }
    
    fetchStats();
    fetchBotStatus();
    
    // Actualizar el estado del bot cada 30 segundos
    const interval = setInterval(fetchBotStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch real data from API
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch real data from API endpoints
        const votacionesResponse = await fetch('http://localhost:3001/api/votaciones', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const manhwasResponse = await fetch('http://localhost:3001/api/manhwas', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const aportesResponse = await fetch('http://localhost:3001/api/aportes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (votacionesResponse.ok) {
          const votacionesData = await votacionesResponse.json();
          setVotaciones(votacionesData.slice(0, 3)); // Show only first 3
        }
        
        if (manhwasResponse.ok) {
          const manhwasData = await manhwasResponse.json();
          setManhwas(manhwasData.slice(0, 3)); // Show only first 3
        }
        
        if (aportesResponse.ok) {
          const aportesData = await aportesResponse.json();
          setAportes(aportesData.slice(0, 3)); // Show only first 3
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <Box p={6} bg={bg} minH="100vh">
      <Flex mb={6} alignItems="center">
        <Heading size="lg" mr={4} display="flex" alignItems="center">
          <Box as="span" mr={2} fontSize="2xl" role="img" aria-label="WhatsApp">
            📱
          </Box>
          WhatsApp Bot Dashboard
        </Heading>
        <Spacer />
        <Button onClick={toggleColorMode} leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}>
          {colorMode === 'light' ? 'Modo Oscuro' : 'Modo Claro'}
        </Button>
      </Flex>

      {/* Bot Status */}
      <Box bg={cardBg} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor} mb={6}>
        <Heading size="md" mb={4}>
          Estado del Bot
        </Heading>
        <Flex justifyContent="space-between" flexWrap="wrap">
          <Box minW="120px" mb={2}>
            <Box 
              fontWeight="bold" 
              color={botStatus.isConnected ? "green.400" : "red.400"} 
              display="flex" 
              alignItems="center"
            >
              <Box
                w={3}
                h={3}
                bg={botStatus.isConnected ? "green.400" : "red.400"}
                borderRadius="full"
                mr={2}
                aria-label={botStatus.isConnected ? "En línea" : "Desconectado"}
              />
              {botStatus.isConnected ? "En línea" : "Desconectado"}
            </Box>
            <Text fontSize="sm" color="gray.500">
              {botStatus.uptime && `Activo: ${botStatus.uptime}`}
            </Text>
          </Box>
          <Box minW="120px" mb={2}>
            <Text fontWeight="bold">Chats</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.pedidos}</Text>
          </Box>
          <Box minW="120px" mb={2}>
            <Text fontWeight="bold">Grupos</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.grupos}</Text>
          </Box>
          <Box minW="120px" mb={2}>
            <Text fontWeight="bold">Usuarios</Text>
            <Text fontSize="2xl" fontWeight="bold">{stats.usuarios}</Text>
          </Box>
        </Flex>
        <Text mt={2} fontSize="sm" color="gray.500">
          Última conexión: {botStatus.lastConnection}
        </Text>
      </Box>

      {/* Placeholder for Votaciones, Manhwas, Aportes sections */}
      <Flex flexWrap="wrap" gap={6}>
        <Box flex="1" minW="300px" bg={cardBg} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md">Votaciones</Heading>
            <Button size="sm" colorScheme="green" onClick={handleNavigateToVotaciones}>
              Nueva Votación
            </Button>
          </Flex>
          {votaciones.length === 0 ? (
            <Text>No hay votaciones activas.</Text>
          ) : (
            <Table variant="simple" size="sm">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Opciones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {votaciones.map((votacion: any) => {
                  let opciones = [];
                  try {
                    opciones = JSON.parse(votacion.opciones || '[]');
                  } catch (e) {
                    opciones = [];
                  }
                  
                  return (
                    <tr key={votacion.id}>
                      <td>
                        <Text fontWeight="bold">{votacion.titulo}</Text>
                        <Text fontSize="sm" color="gray.500">{votacion.estado}</Text>
                      </td>
                      <td>
                        <Box>
                          {opciones.length > 0 ? (
                            opciones.slice(0, 2).map((opcion: string, index: number) => (
                              <Box key={index} mb={2}>
                                <Flex alignItems="center" justifyContent="space-between" mb={1}>
                                  <Text fontSize="sm">{opcion}</Text>
                                  <Text fontSize="sm">0%</Text>
                                </Flex>
                                <Box bg="gray.200" h="2px" borderRadius="md">
                                  <Box bg="green.400" h="2px" borderRadius="md" w="0%" />
                                </Box>
                              </Box>
                            ))
                          ) : (
                            <Text fontSize="sm" color="gray.500">Sin opciones</Text>
                          )}
                          {opciones.length > 2 && (
                            <Text fontSize="xs" color="gray.400">+{opciones.length - 2} más</Text>
                          )}
                        </Box>
                      </td>
                      <td>
                        <Button size="sm" colorScheme="green">
                          Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Box>

        <Box flex="1" minW="300px" bg={cardBg} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md">Manhwas</Heading>
            <Button size="sm" colorScheme="green" onClick={handleNavigateToManhwas}>
              Añadir Manhwa
            </Button>
          </Flex>
          {manhwas.length === 0 ? (
            <Text>No hay manhwas disponibles.</Text>
          ) : (
            <Table variant="simple" size="sm">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {manhwas.map((manhwa) => (
                  <tr key={manhwa.id}>
                    <td>
                      <Text fontWeight="bold">{manhwa.titulo}</Text>
                      <Text fontSize="sm" color="gray.500">{manhwa.autor} - {manhwa.estado}</Text>
                    </td>
                    <td>
                      <Button size="sm" colorScheme="green">
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Box>

        <Box flex="1" minW="300px" bg={cardBg} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md">Aportes</Heading>
            <Button size="sm" colorScheme="green" onClick={handleNavigateToAportes}>
              Añadir Aporte
            </Button>
          </Flex>
          {aportes.length === 0 ? (
            <Text>No hay aportes disponibles.</Text>
          ) : (
            <Table variant="simple" size="sm">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aportes.map((aporte) => (
                  <tr key={aporte.id}>
                    <td>
                      <Text fontWeight="bold">{aporte.tipo}</Text>
                      <Text fontSize="sm" color="gray.500">{aporte.contenido.substring(0, 50)}...</Text>
                    </td>
                    <td>
                      <Button size="sm" colorScheme="green">
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

