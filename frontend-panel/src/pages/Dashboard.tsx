import { 
  Box, 
  Grid, 
  GridItem, 
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  Flex,
  Heading,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  Select,
  Circle,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader
} from '@chakra-ui/react';
import { FaWhatsapp, FaUsers, FaComments, FaChartBar, FaPaperPlane, FaInbox } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import api from '../services/api';

interface DashboardStats {
  usuarios: number;
  aportes: number;
  pedidos: number;
  grupos: number;
}

interface Votacion {
  id: number;
  titulo: string;
  descripcion: string;
  opciones: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  creador: string;
}

interface Aporte {
  id: number;
  contenido: string;
  tipo: string;
  usuario: string;
  grupo: string;
  fecha: string;
}

interface Manhwa {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  estado: string;
  descripcion: string;
  url: string;
  fecha_registro: string;
  usuario_registro: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ usuarios: 0, aportes: 0, pedidos: 0, grupos: 0 });
  const [votaciones, setVotaciones] = useState<Votacion[]>([]);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [manhwas, setManhwas] = useState<Manhwa[]>([]);
  const [loading, setLoading] = useState(true);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, votacionesRes, aportesRes, manhwasRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/votaciones'),
          api.get('/aportes'),
          api.get('/manhwas')
        ]);

        setStats(statsRes.data);
        setVotaciones(votacionesRes.data);
        setAportes(aportesRes.data);
        setManhwas(manhwasRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box p={6} bg={cardBg} minH="100vh">
        <Text>Cargando...</Text>
      </Box>
    );
  }

  const parseOpciones = (opciones: string) => {
    try {
      return JSON.parse(opciones);
    } catch {
      return [];
    }
  };

  return (
    <Box p={6} bg={cardBg} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header con iconos */}
        <Flex justify="space-between" align="center" mb={6}>
          <HStack spacing={3}>
            <Icon as={FaWhatsapp} boxSize={8} color="green.500" />
            <Heading size="lg" color="green.500">
              WhatsApp Bot Dashboard
            </Heading>
          </HStack>
          
          {/* Tarjetas de mensajes en la esquina superior derecha */}
          <HStack spacing={4}>
            <Card size="sm" bg={bg} borderColor={borderColor}>
              <CardBody p={3}>
                <HStack spacing={2}>
                  <Icon as={FaPaperPlane} color="blue.500" />
                  <VStack spacing={0} align="start">
                    <Text fontSize="xs" color="gray.500">Mensajes enviados</Text>
                    <Text fontSize="lg" fontWeight="bold">1,247</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
            
            <Card size="sm" bg={bg} borderColor={borderColor}>
              <CardBody p={3}>
                <HStack spacing={2}>
                  <Icon as={FaInbox} color="green.500" />
                  <VStack spacing={0} align="start">
                    <Text fontSize="xs" color="gray.500">Mensajes recibidos</Text>
                    <Text fontSize="lg" fontWeight="bold">2,891</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </HStack>
        </Flex>

        {/* Estado del Bot - Círculo grande verde */}
        <Card bg={bg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Estado del Bot</Heading>
          </CardHeader>
          <CardBody>
            <Flex justify="center" align="center" direction="column" py={6}>
              <Circle size="120px" bg="green.500" color="white" mb={4}>
                <VStack spacing={1}>
                  <Icon as={FaWhatsapp} boxSize={8} />
                  <Box fontSize="lg" fontWeight="bold" color="white">En línea</Box>
                </VStack>
              </Circle>
              
              <SimpleGrid columns={3} spacing={8} mt={6}>
                <VStack spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.500">0</Text>
                  <Text fontSize="sm" color="gray.500">Chats</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold" color="purple.500">0</Text>
                  <Text fontSize="sm" color="gray.500">Grupos</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="3xl" fontWeight="bold" color="green.500">{stats.usuarios}</Text>
                  <Text fontSize="sm" color="gray.500">Usuarios</Text>
                </VStack>
              </SimpleGrid>
              
              <Text fontSize="sm" color="gray.400" mt={4}>
                Última conexión: hace 2 horas
              </Text>
            </Flex>
          </CardBody>
        </Card>

        {/* Sección de Envío Rápido */}
        <Card bg={bg} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md">Envío Rápido</Heading>
          </CardHeader>
          <CardBody>
            <HStack spacing={4}>
              <Select placeholder="Seleccionar grupo" flex={1}>
                <option value="grupo1">Grupo Principal</option>
                <option value="grupo2">Grupo Secundario</option>
                <option value="grupo3">Grupo de Pruebas</option>
              </Select>
              <Button colorScheme="green" leftIcon={<Icon as={FaPaperPlane} />}>
                Aportar
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Grid principal */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
          {/* Votaciones con tabla y barras de progreso */}
          <GridItem>
            <Card bg={bg} borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Icon as={FaChartBar} color="blue.500" />
                    <Heading size="md">Votaciones</Heading>
                  </HStack>
                  <Button colorScheme="green" size="sm">Nueva Votación</Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {votaciones.length > 0 ? (
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Título</Th>
                          <Th>Opciones</Th>
                          <Th>Progreso</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {votaciones.slice(0, 3).map((votacion) => {
                          const opciones = parseOpciones(votacion.opciones);
                          return (
                            <Tr key={votacion.id}>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  <Text fontWeight="semibold" fontSize="sm">{votacion.titulo}</Text>
                                  <Badge 
                                    colorScheme={votacion.estado === 'activa' ? 'green' : 'gray'} 
                                    size="sm"
                                  >
                                    {votacion.estado}
                                  </Badge>
                                </VStack>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={1}>
                                  {opciones.slice(0, 2).map((opcion: string, index: number) => (
                                    <Text key={index} fontSize="xs" color="gray.600">
                                      {opcion}
                                    </Text>
                                  ))}
                                </VStack>
                              </Td>
                              <Td>
                                <VStack align="start" spacing={2}>
                                  <Progress value={65} size="sm" colorScheme="green" w="100%" />
                                  <Text fontSize="xs" color="gray.500">65%</Text>
                                </VStack>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No hay votaciones activas.
                  </Text>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Manhwas */}
          <GridItem>
            <Card bg={bg} borderColor={borderColor}>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Icon as={FaComments} color="purple.500" />
                    <Heading size="md">Manhwas</Heading>
                  </HStack>
                  <Button colorScheme="green" size="sm">Añadir Manhwa</Button>
                </Flex>
              </CardHeader>
              <CardBody>
                {manhwas.length > 0 ? (
                  <VStack spacing={3} align="stretch">
                    {manhwas.slice(0, 4).map((manhwa) => (
                      <Box key={manhwa.id} p={3} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                        <Flex justify="space-between" align="center">
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontWeight="semibold" fontSize="sm">{manhwa.titulo}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {manhwa.autor} • {manhwa.genero}
                            </Text>
                            <Badge 
                              colorScheme={manhwa.estado === 'Completado' ? 'blue' : 'orange'} 
                              size="sm"
                            >
                              {manhwa.estado}
                            </Badge>
                          </VStack>
                          <Button colorScheme="green" size="sm">
                            Enviar
                          </Button>
                        </Flex>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No hay manhwas disponibles.
                  </Text>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Aportes */}
        <Card bg={bg} borderColor={borderColor}>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Icon as={FaUsers} color="orange.500" />
                <Heading size="md">Aportes</Heading>
              </HStack>
              <Button colorScheme="green" size="sm">Añadir Aporte</Button>
            </Flex>
          </CardHeader>
          <CardBody>
            {aportes.length > 0 ? (
              <VStack spacing={3} align="stretch">
                {aportes.slice(0, 5).map((aporte) => (
                  <Box key={aporte.id} p={4} bg={cardBg} borderRadius="md" border="1px" borderColor={borderColor}>
                    <Flex justify="space-between" align="center">
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="semibold" noOfLines={2} fontSize="sm">
                          {aporte.contenido}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue" size="sm">{aporte.tipo}</Badge>
                          <Text fontSize="xs" color="gray.500">
                            por {aporte.usuario}
                          </Text>
                        </HStack>
                      </VStack>
                      <Button colorScheme="green" size="sm" ml={4}>
                        Enviar
                      </Button>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                No hay aportes disponibles.
              </Text>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
