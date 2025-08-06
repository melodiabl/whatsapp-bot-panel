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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import api from '../services/api';

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

interface Grupo {
  jid: string;
  nombre: string;
}

const VotacionesPage: React.FC = () => {
  const [votaciones, setVotaciones] = useState<Votacion[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedVotacion, setSelectedVotacion] = useState<Votacion | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    opciones: ['', ''],
    fecha_fin: '',
    grupo: '',
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchVotaciones();
    fetchGrupos();
  }, []);

  const fetchVotaciones = async () => {
    try {
      const response = await api.get('/votaciones');
      setVotaciones(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las votaciones',
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
      const data = {
        ...formData,
        opciones: formData.opciones.filter(op => op.trim() !== ''),
      };

      if (selectedVotacion) {
        await api.put(`/votaciones/${selectedVotacion.id}`, data);
        toast({
          title: 'Éxito',
          description: 'Votación actualizada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await api.post('/votaciones', data);
        toast({
          title: 'Éxito',
          description: 'Votación creada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      fetchVotaciones();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la votación',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta votación?')) {
      try {
        await api.delete(`/votaciones/${id}`);
        toast({
          title: 'Éxito',
          description: 'Votación eliminada correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchVotaciones();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la votación',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleEdit = (votacion: Votacion) => {
    setSelectedVotacion(votacion);
    const opciones = JSON.parse(votacion.opciones || '[]');
    setFormData({
      titulo: votacion.titulo,
      descripcion: votacion.descripcion,
      opciones: opciones.length > 0 ? opciones : ['', ''],
      fecha_fin: votacion.fecha_fin.split('T')[0],
      grupo: '',
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedVotacion(null);
    setFormData({
      titulo: '',
      descripcion: '',
      opciones: ['', ''],
      fecha_fin: '',
      grupo: '',
    });
    onClose();
  };

  const addOpcion = () => {
    setFormData({
      ...formData,
      opciones: [...formData.opciones, ''],
    });
  };

  const removeOpcion = (index: number) => {
    const newOpciones = formData.opciones.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      opciones: newOpciones.length > 0 ? newOpciones : [''],
    });
  };

  const updateOpcion = (index: number, value: string) => {
    const newOpciones = [...formData.opciones];
    newOpciones[index] = value;
    setFormData({
      ...formData,
      opciones: newOpciones,
    });
  };

  const getEstadoBadge = (estado: string) => {
    const color = estado === 'activa' ? 'green' : estado === 'finalizada' ? 'red' : 'yellow';
    return <Badge colorScheme={color}>{estado.toUpperCase()}</Badge>;
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Votaciones</Text>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          Nueva Votación
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Título</Th>
            <Th>Descripción</Th>
            <Th>Estado</Th>
            <Th>Fecha Fin</Th>
            <Th>Creador</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {votaciones.map((votacion) => (
            <Tr key={votacion.id}>
              <Td>{votacion.titulo}</Td>
              <Td>{votacion.descripcion}</Td>
              <Td>{getEstadoBadge(votacion.estado)}</Td>
              <Td>{new Date(votacion.fecha_fin).toLocaleDateString()}</Td>
              <Td>{votacion.creador}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Editar"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => handleEdit(votacion)}
                  />
                  <IconButton
                    aria-label="Eliminar"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(votacion.id)}
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
            {selectedVotacion ? 'Editar Votación' : 'Nueva Votación'}
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
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Grupo (Opcional)</FormLabel>
                <Select
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                  placeholder="Seleccionar grupo"
                >
                  {grupos.map((grupo) => (
                    <option key={grupo.jid} value={grupo.jid}>
                      {grupo.nombre}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Opciones</FormLabel>
                <VStack spacing={2}>
                  {formData.opciones.map((opcion, index) => (
                    <HStack key={index} width="100%">
                      <Input
                        value={opcion}
                        onChange={(e) => updateOpcion(index, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                      />
                      {formData.opciones.length > 1 && (
                        <IconButton
                          aria-label="Eliminar opción"
                          icon={<DeleteIcon />}
                          size="sm"
                          onClick={() => removeOpcion(index)}
                        />
                      )}
                    </HStack>
                  ))}
                  <Button size="sm" onClick={addOpcion}>
                    Agregar Opción
                  </Button>
                </VStack>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Fecha de Fin</FormLabel>
                <Input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {selectedVotacion ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VotacionesPage;
