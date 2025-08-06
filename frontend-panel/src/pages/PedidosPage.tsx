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

interface Pedido {
  id: number;
  texto: string;
  estado: string;
  usuario: string;
  grupo: string;
  fecha: string;
}

interface Grupo {
  jid: string;
  nombre: string;
}

const PedidosPage: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [formData, setFormData] = useState({
    texto: '',
    grupo: '',
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchPedidos();
    fetchGrupos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await api.get('/pedidos');
      setPedidos(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los pedidos',
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
      if (selectedPedido) {
        // Solo actualizar estado para moderadores/admins
        await api.put(`/pedidos/${selectedPedido.id}`, { estado: formData.texto });
        toast({
          title: 'Éxito',
          description: 'Estado del pedido actualizado',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await api.post('/pedidos', formData);
        toast({
          title: 'Éxito',
          description: 'Pedido creado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      fetchPedidos();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el pedido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
      try {
        await api.delete(`/pedidos/${id}`);
        toast({
          title: 'Éxito',
          description: 'Pedido eliminado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchPedidos();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el pedido',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleChangeStatus = async (pedido: Pedido, newStatus: string) => {
    try {
      await api.put(`/pedidos/${pedido.id}`, { estado: newStatus });
      toast({
        title: 'Éxito',
        description: 'Estado actualizado correctamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchPedidos();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setSelectedPedido(null);
    setFormData({
      texto: '',
      grupo: '',
    });
    onClose();
  };

  const getEstadoBadge = (estado: string) => {
    const color = estado === 'completado' ? 'green' : estado === 'pendiente' ? 'yellow' : 'red';
    return <Badge colorScheme={color}>{estado.toUpperCase()}</Badge>;
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Pedidos</Text>
        <Button leftIcon={<AddIcon />} colorScheme="orange" onClick={onOpen}>
          Nuevo Pedido
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Texto</Th>
            <Th>Estado</Th>
            <Th>Usuario</Th>
            <Th>Grupo</Th>
            <Th>Fecha</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {pedidos.map((pedido) => (
            <Tr key={pedido.id}>
              <Td maxW="300px" isTruncated>{pedido.texto}</Td>
              <Td>{getEstadoBadge(pedido.estado)}</Td>
              <Td>{pedido.usuario}</Td>
              <Td>{pedido.grupo}</Td>
              <Td>{new Date(pedido.fecha).toLocaleDateString()}</Td>
              <Td>
                <HStack spacing={2}>
                  <Select
                    size="sm"
                    value={pedido.estado}
                    onChange={(e) => handleChangeStatus(pedido, e.target.value)}
                    width="120px"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completado">Completado</option>
                    <option value="rechazado">Rechazado</option>
                  </Select>
                  <IconButton
                    aria-label="Eliminar"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(pedido.id)}
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
          <ModalHeader>Nuevo Pedido</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Descripción del Pedido</FormLabel>
                <Textarea
                  value={formData.texto}
                  onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                  placeholder="Describe lo que necesitas..."
                  rows={4}
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
            <Button colorScheme="orange" onClick={handleSubmit}>
              Crear Pedido
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PedidosPage;
