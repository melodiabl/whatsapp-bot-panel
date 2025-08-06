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
  Textarea,
  VStack,
  HStack,
  IconButton,
  useToast,
  Select,
  Text,
  Link,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import api, { whatsappService } from '../services/api';

interface Manhwa {
  id: number;
  titulo: string;
  autor: string;
  genero: string;
  estado: string;
  descripcion: string;
  url: string;
  proveedor: string;
  fecha_registro: string;
  usuario_registro: string;
}

interface GrupoDisponible {
  jid: string;
  nombre: string;
  descripcion: string;
  participantes: number;
  esAdmin: boolean;
}

const ManhwasPage: React.FC = () => {
  const [manhwas, setManhwas] = useState<Manhwa[]>([]);
  const [gruposDisponibles, setGruposDisponibles] = useState<GrupoDisponible[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [selectedManhwa, setSelectedManhwa] = useState<Manhwa | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    genero: '',
    estado: 'En curso',
    descripcion: '',
    url: '',
    proveedor: '',
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchManhwas();
    fetchGruposDisponibles();
  }, []);

  const fetchManhwas = async () => {
    try {
      const response = await api.get('/manhwas');
      setManhwas(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los manhwas',
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
      console.error('Error al cargar grupos:', error);
    } finally {
      setLoadingGrupos(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedManhwa) {
        await api.put(`/manhwas/${selectedManhwa.id}`, formData);
        toast({
          title: 'Éxito',
          description: 'Manhwa actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await api.post('/manhwas', formData);
        toast({
          title: 'Éxito',
          description: 'Manhwa creado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      fetchManhwas();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el manhwa',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este manhwa?')) {
      try {
        await api.delete(`/manhwas/${id}`);
        toast({
          title: 'Éxito',
          description: 'Manhwa eliminado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchManhwas();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el manhwa',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleEdit = (manhwa: Manhwa) => {
    setSelectedManhwa(manhwa);
    setFormData({
      titulo: manhwa.titulo,
      autor: manhwa.autor,
      genero: manhwa.genero,
      estado: manhwa.estado,
      descripcion: manhwa.descripcion,
      url: manhwa.url,
      proveedor: manhwa.proveedor || '',
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedManhwa(null);
    setFormData({
      titulo: '',
      autor: '',
      genero: '',
      estado: 'En curso',
      descripcion: '',
      url: '',
      proveedor: '',
    });
    onClose();
  };

  const getEstadoBadge = (estado: string) => {
    const color = estado === 'Completado' ? 'green' : estado === 'En curso' ? 'blue' : 'red';
    return <Badge colorScheme={color}>{estado}</Badge>;
  };

  const getProveedorBadge = (proveedor: string) => {
    if (!proveedor) return <Badge colorScheme="gray">Sin proveedor</Badge>;
    return <Badge colorScheme="purple">{proveedor}</Badge>;
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Manhwas BL</Text>
        <Button leftIcon={<AddIcon />} colorScheme="green" onClick={onOpen}>
          Añadir Manhwa
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Título</Th>
            <Th>Autor</Th>
            <Th>Género</Th>
            <Th>Estado</Th>
            <Th>Proveedor</Th>
            <Th>URL</Th>
            <Th>Registrado por</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {manhwas.map((manhwa) => (
            <Tr key={manhwa.id}>
              <Td>{manhwa.titulo}</Td>
              <Td>{manhwa.autor}</Td>
              <Td>{manhwa.genero}</Td>
              <Td>{getEstadoBadge(manhwa.estado)}</Td>
              <Td>{getProveedorBadge(manhwa.proveedor)}</Td>
              <Td>
                {manhwa.url && (
                  <Link href={manhwa.url} isExternal>
                    <ExternalLinkIcon />
                  </Link>
                )}
              </Td>
              <Td>{manhwa.usuario_registro}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Editar"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => handleEdit(manhwa)}
                  />
                  <IconButton
                    aria-label="Eliminar"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(manhwa.id)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedManhwa ? 'Editar Manhwa' : 'Nuevo Manhwa BL'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Título</FormLabel>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Autor</FormLabel>
                <Input
                  value={formData.autor}
                  onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Género</FormLabel>
                <Input
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  placeholder="Ej: BL, Romance, Drama"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Estado</FormLabel>
                <Select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <option value="En curso">En curso</option>
                  <option value="Completado">Completado</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Cancelado">Cancelado</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Proveedor (Grupo BL)</FormLabel>
                {loadingGrupos ? (
                  <HStack>
                    <Spinner size="sm" />
                    <Text>Cargando grupos...</Text>
                  </HStack>
                ) : (
                  <Select
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    placeholder="Selecciona un grupo proveedor"
                  >
                    <option value="Grupo BL General">Grupo BL General</option>
                    {gruposDisponibles.map((grupo) => (
                      <option key={grupo.jid} value={grupo.nombre}>
                        {grupo.nombre} ({grupo.participantes} miembros)
                      </option>
                    ))}
                  </Select>
                )}
                {gruposDisponibles.length === 0 && !loadingGrupos && (
                  <Alert status="info" mt={2}>
                    <AlertIcon />
                    No se encontraron grupos disponibles. Asegúrate de que el bot esté conectado.
                  </Alert>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>URL</FormLabel>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del manhwa BL..."
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button colorScheme="green" onClick={handleSubmit}>
              {selectedManhwa ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ManhwasPage;
