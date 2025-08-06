import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  IconButton,
  useToast,
  Select,
  Text,
  Switch,
  NumberInput,
  NumberInputField,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import api, { whatsappService } from '../services/api';

interface Grupo {
  jid: string;
  nombre: string;
  tipo: string;
  proveedor: string;
  min_messages: number;
  max_warnings: number;
  enable_warnings: boolean;
  enable_restriction: boolean;
}

interface GrupoDisponible {
  jid: string;
  nombre: string;
  descripcion: string;
  participantes: number;
  esAdmin: boolean;
}

const GruposPage: React.FC = () => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [gruposDisponibles, setGruposDisponibles] = useState<GrupoDisponible[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [formData, setFormData] = useState({
    jid: '',
    nombre: '',
    tipo: 'general',
    proveedor: 'General',
    min_messages: 100,
    max_warnings: 3,
    enable_warnings: true,
    enable_restriction: true,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      const response = await api.get('/grupos');
      setGrupos(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los grupos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchGruposDisponibles = async () => {
    setLoadingGrupos(true);
    try {
      const grupos = await whatsappService.getAvailableGroups();
      setGruposDisponibles(grupos);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los grupos del bot. Asegúrate de que el bot esté conectado.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingGrupos(false);
    }
  };

  const handleOpenModal = () => {
    fetchGruposDisponibles();
    onOpen();
  };

  const handleSelectGrupoDisponible = (grupo: GrupoDisponible) => {
    setFormData({
      ...formData,
      jid: grupo.jid,
      nombre: grupo.nombre,
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedGrupo) {
        await api.put(`/grupos/${selectedGrupo.jid}`, formData);
        toast({
          title: 'Éxito',
          description: 'Grupo actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await api.post('/grupos', formData);
        toast({
          title: 'Éxito',
          description: 'Grupo autorizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      fetchGrupos();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el grupo',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (jid: string) => {
    if (window.confirm('¿Estás seguro de que quieres desautorizar este grupo?')) {
      try {
        await api.delete(`/grupos/${jid}`);
        toast({
          title: 'Éxito',
          description: 'Grupo desautorizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchGrupos();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo desautorizar el grupo',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleEdit = (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    setFormData({
      jid: grupo.jid,
      nombre: grupo.nombre,
      tipo: grupo.tipo,
      proveedor: grupo.proveedor || 'General',
      min_messages: grupo.min_messages,
      max_warnings: grupo.max_warnings,
      enable_warnings: grupo.enable_warnings,
      enable_restriction: grupo.enable_restriction,
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedGrupo(null);
    setFormData({
      jid: '',
      nombre: '',
      tipo: 'general',
      proveedor: 'General',
      min_messages: 100,
      max_warnings: 3,
      enable_warnings: true,
      enable_restriction: true,
    });
    onClose();
  };

  const getTipoBadge = (tipo: string) => {
    const color = tipo === 'vip' ? 'purple' : tipo === 'moderado' ? 'orange' : 'blue';
    return <Badge colorScheme={color}>{tipo.toUpperCase()}</Badge>;
  };

  // Filtrar grupos por tipo
  const gruposGenerales = grupos.filter(grupo => !grupo.proveedor || grupo.proveedor === 'General');
  const gruposProveedor = grupos.filter(grupo => grupo.proveedor && grupo.proveedor !== 'General');

  const renderGruposTable = (gruposList: Grupo[], showProveedorColumn = true) => (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Nombre</Th>
          <Th>JID</Th>
          <Th>Tipo</Th>
          {showProveedorColumn && <Th>Proveedor</Th>}
          <Th>Min. Mensajes</Th>
          <Th>Max. Advertencias</Th>
          <Th>Advertencias</Th>
          <Th>Restricciones</Th>
          <Th>Acciones</Th>
        </Tr>
      </Thead>
      <Tbody>
        {gruposList.map((grupo) => (
          <Tr key={grupo.jid}>
            <Td>{grupo.nombre}</Td>
            <Td fontFamily="mono" fontSize="sm" maxW="200px" isTruncated>
              {grupo.jid}
            </Td>
            <Td>{getTipoBadge(grupo.tipo)}</Td>
            {showProveedorColumn && (
              <Td>
                <Badge colorScheme="purple" variant="subtle">
                  {grupo.proveedor || 'General'}
                </Badge>
              </Td>
            )}
            <Td>{grupo.min_messages}</Td>
            <Td>{grupo.max_warnings}</Td>
            <Td>
              <Badge colorScheme={grupo.enable_warnings ? 'green' : 'red'}>
                {grupo.enable_warnings ? 'Activas' : 'Inactivas'}
              </Badge>
            </Td>
            <Td>
              <Badge colorScheme={grupo.enable_restriction ? 'green' : 'red'}>
                {grupo.enable_restriction ? 'Activas' : 'Inactivas'}
              </Badge>
            </Td>
            <Td>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Editar"
                  icon={<EditIcon />}
                  size="sm"
                  onClick={() => handleEdit(grupo)}
                />
                <IconButton
                  aria-label="Desautorizar"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(grupo.jid)}
                />
              </HStack>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  return (
    <Box p={6}>
      {/* Sección Grupos Autorizados */}
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Grupos Autorizados</Text>
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={handleOpenModal}>
          Autorizar Grupo
        </Button>
      </HStack>

      {gruposGenerales.length > 0 ? (
        renderGruposTable(gruposGenerales, false)
      ) : (
        <Alert status="info" mb={6}>
          <AlertIcon />
          No hay grupos generales autorizados. Autoriza algunos grupos para comenzar.
        </Alert>
      )}

      <Divider my={8} />

      {/* Sección Grupos Proveedor */}
      <HStack justify="space-between" mb={6}>
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold">Grupos Proveedor</Text>
          <Text fontSize="sm" color="gray.600">
            Grupos especializados en contenido específico (BL Manhwas, Premium, etc.)
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
            {gruposProveedor.length} grupos
          </Badge>
          <Button leftIcon={<AddIcon />} colorScheme="purple" onClick={handleOpenModal}>
            Agregar Proveedor
          </Button>
        </HStack>
      </HStack>

      {gruposProveedor.length > 0 ? (
        <>
          {/* Estadísticas de proveedores */}
          <Box mb={6}>
            <Text fontSize="lg" fontWeight="semibold" mb={3}>Distribución por Tipo de Proveedor</Text>
            <HStack spacing={4} flexWrap="wrap">
              {Array.from(new Set(gruposProveedor.map(g => g.proveedor))).map(proveedor => {
                const count = gruposProveedor.filter(g => g.proveedor === proveedor).length;
                return (
                  <Badge key={proveedor} colorScheme="purple" variant="outline" px={3} py={1}>
                    {proveedor}: {count}
                  </Badge>
                );
              })}
            </HStack>
          </Box>
          
          {renderGruposTable(gruposProveedor)}
        </>
      ) : (
        <Alert status="info">
          <AlertIcon />
          No hay grupos proveedor configurados. Los grupos proveedor son especializados en contenido específico como BL Manhwas, Premium, Ilustraciones, etc.
        </Alert>
      )}

      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedGrupo ? 'Editar Grupo' : 'Autorizar Grupo'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {!selectedGrupo && (
                <>
                  <Box w="100%">
                    <Text fontSize="lg" fontWeight="bold" mb={3}>
                      Grupos Disponibles del Bot
                    </Text>
                    {loadingGrupos ? (
                      <HStack justify="center" p={4}>
                        <Spinner />
                        <Text>Cargando grupos...</Text>
                      </HStack>
                    ) : gruposDisponibles.length > 0 ? (
                      <VStack spacing={2} maxH="200px" overflowY="auto" border="1px" borderColor="gray.200" borderRadius="md" p={2}>
                        {gruposDisponibles.map((grupo) => (
                          <Box
                            key={grupo.jid}
                            w="100%"
                            p={3}
                            border="1px"
                            borderColor="gray.200"
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => handleSelectGrupoDisponible(grupo)}
                          >
                            <HStack justify="space-between">
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="bold" fontSize="sm">
                                  {grupo.nombre}
                                </Text>
                                <Text fontSize="xs" color="gray.500" fontFamily="mono">
                                  {grupo.jid}
                                </Text>
                                <HStack spacing={2}>
                                  <Badge size="sm" colorScheme="blue">
                                    {grupo.participantes} miembros
                                  </Badge>
                                  {grupo.esAdmin && (
                                    <Badge size="sm" colorScheme="green">
                                      Admin
                                    </Badge>
                                  )}
                                </HStack>
                              </VStack>
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        No se encontraron grupos disponibles. Asegúrate de que el bot esté conectado y sea miembro de grupos.
                      </Alert>
                    )}
                  </Box>
                  <Divider />
                </>
              )}

              <FormControl isRequired>
                <FormLabel>JID del Grupo</FormLabel>
                <Input
                  value={formData.jid}
                  onChange={(e) => setFormData({ ...formData, jid: e.target.value })}
                  placeholder={formData.jid ? "Grupo seleccionado automáticamente" : "120363123456789@g.us"}
                  isDisabled={!!selectedGrupo || !!formData.jid}
                  bg={formData.jid ? "green.50" : "white"}
                />
                {formData.jid && !selectedGrupo && (
                  <Text fontSize="xs" color="green.600" mt={1}>
                    ✓ Grupo seleccionado de la lista disponible
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Nombre del Grupo</FormLabel>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder={formData.nombre ? "Nombre obtenido automáticamente" : "Nombre del grupo"}
                  bg={formData.jid && formData.nombre ? "green.50" : "white"}
                />
                {formData.jid && formData.nombre && !selectedGrupo && (
                  <Text fontSize="xs" color="green.600" mt={1}>
                    ✓ Nombre obtenido automáticamente del bot
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tipo de Grupo</FormLabel>
                <Select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="vip">VIP</option>
                  <option value="moderado">Moderado</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Mensajes Mínimos para Comandos</FormLabel>
                <NumberInput
                  value={formData.min_messages}
                  onChange={(_, value) => setFormData({ ...formData, min_messages: value || 100 })}
                  min={0}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Máximo de Advertencias</FormLabel>
                <NumberInput
                  value={formData.max_warnings}
                  onChange={(_, value) => setFormData({ ...formData, max_warnings: value || 3 })}
                  min={1}
                  max={10}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>Habilitar Advertencias</FormLabel>
                  <Switch
                    isChecked={formData.enable_warnings}
                    onChange={(e) => setFormData({ ...formData, enable_warnings: e.target.checked })}
                  />
                </HStack>
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>Habilitar Restricciones</FormLabel>
                  <Switch
                    isChecked={formData.enable_restriction}
                    onChange={(e) => setFormData({ ...formData, enable_restriction: e.target.checked })}
                  />
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button colorScheme="teal" onClick={handleSubmit}>
              {selectedGrupo ? 'Actualizar' : 'Autorizar'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default GruposPage;
