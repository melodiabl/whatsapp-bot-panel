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
  Textarea,
  VStack,
  HStack,
  IconButton,
  useToast,
  Select,
  Text,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import api from '../services/api';

interface Aporte {
  id: number;
  contenido: string;
  tipo: string;
  usuario: string;
  grupo: string;
  fecha: string;
  pdf_generado: string;
}

interface Grupo {
  jid: string;
  nombre: string;
}

const AportesPage: React.FC = () => {
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [formData, setFormData] = useState({
    contenido: '',
    tipo: 'texto',
    grupo: '',
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchAportes();
    fetchGrupos();
  }, []);

  const fetchAportes = async () => {
    try {
      const response = await api.get('/aportes');
      setAportes(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los aportes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchGrupos = async () => {
    try {
      const response = await api.get('/grupos');
      setGrupos(response.data);
    } catch (error) {
      console.error('Error fetching grupos:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post('/aportes', formData);
      toast({
        title: 'Éxito',
        description: 'Aporte creado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchAportes();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el aporte',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este aporte?')) {
      try {
        await api.delete(`/aportes/${id}`);
        toast({
          title: 'Éxito',
          description: 'Aporte eliminado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchAportes();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el aporte',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleClose = () => {
    setFormData({
      contenido: '',
      tipo: 'texto',
      grupo: '',
    });
    onClose();
  };

  const getTipoBadge = (tipo: string) => {
    const color = tipo === 'imagen' ? 'purple' : tipo === 'video' ? 'orange' : 'blue';
    return <Badge colorScheme={color}>{tipo.toUpperCase()}</Badge>;
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Aportes</Text>
        <Button leftIcon={<AddIcon />} colorScheme="purple" onClick={onOpen}>
          Nuevo Aporte
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Contenido</Th>
            <Th>Tipo</Th>
            <Th>Usuario</Th>
            <Th>Grupo</Th>
            <Th>Fecha</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {aportes.map((aporte) => (
            <Tr key={aporte.id}>
              <Td maxW="300px" isTruncated>{aporte.contenido}</Td>
              <Td>{getTipoBadge(aporte.tipo)}</Td>
              <Td>{aporte.usuario}</Td>
              <Td>{aporte.grupo}</Td>
              <Td>{new Date(aporte.fecha).toLocaleDateString()}</Td>
              <Td>
                <IconButton
                  aria-label="Eliminar"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleDelete(aporte.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={handleClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nuevo Aporte</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Contenido</FormLabel>
                <Textarea
                  value={formData.contenido}
                  onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                  placeholder="Describe tu aporte..."
                  rows={4}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tipo</FormLabel>
                <Select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                >
                  <option value="texto">Texto</option>
                  <option value="imagen">Imagen</option>
                  <option value="video">Video</option>
                  <option value="enlace">Enlace</option>
                  <option value="documento">Documento</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Grupo (Opcional)</FormLabel>
                <Select
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                  placeholder="Seleccionar grupo"
                >
                  {grupos.map((grupo) => (
                    <option key={grupo.jid} value={grupo.nombre}>
                      {grupo.nombre}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button colorScheme="purple" onClick={handleSubmit}>
              Crear Aporte
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AportesPage;
