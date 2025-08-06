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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import api from '../services/api';

interface Usuario {
  id: number;
  username: string;
  rol: string;
}

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rol: 'usuario',
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedUsuario) {
        // Solo actualizar rol
        await api.put(`/usuarios/${selectedUsuario.id}`, { rol: formData.rol });
        toast({
          title: 'Éxito',
          description: 'Rol de usuario actualizado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Crear nuevo usuario (usando el endpoint de auth)
        await api.post('/auth/register', formData);
        toast({
          title: 'Éxito',
          description: 'Usuario creado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      fetchUsuarios();
      handleClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'No se pudo guardar el usuario',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        toast({
          title: 'Éxito',
          description: 'Usuario eliminado correctamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchUsuarios();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el usuario',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      username: usuario.username,
      password: '',
      rol: usuario.rol,
    });
    onOpen();
  };

  const handleClose = () => {
    setSelectedUsuario(null);
    setFormData({
      username: '',
      password: '',
      rol: 'usuario',
    });
    onClose();
  };

  const getRolBadge = (rol: string) => {
    const color = rol === 'admin' ? 'red' : rol === 'colaborador' ? 'orange' : 'blue';
    const displayText = rol === 'admin' ? 'ADMINISTRADOR' : rol === 'colaborador' ? 'COLABORADOR' : 'USUARIO';
    return <Badge colorScheme={color}>{displayText}</Badge>;
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Gestión de Usuarios</Text>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onOpen}>
          Nuevo Usuario
        </Button>
      </HStack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Usuario</Th>
            <Th>Rol</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {usuarios.map((usuario) => (
            <Tr key={usuario.id}>
              <Td>{usuario.id}</Td>
              <Td>{usuario.username}</Td>
              <Td>{getRolBadge(usuario.rol)}</Td>
              <Td>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Editar rol"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => handleEdit(usuario)}
                  />
                  <IconButton
                    aria-label="Eliminar"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(usuario.id)}
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedUsuario ? 'Editar Rol de Usuario' : 'Nuevo Usuario'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {!selectedUsuario && (
                <>
                  <FormControl isRequired>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Ingresa el nombre de usuario"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Contraseña</FormLabel>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Ingresa la contraseña"
                    />
                  </FormControl>
                </>
              )}

              {selectedUsuario && (
                <FormControl>
                  <FormLabel>Usuario</FormLabel>
                  <Input value={formData.username} isDisabled />
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Rol</FormLabel>
                <Select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                >
                  <option value="usuario">Usuario</option>
                  <option value="colaborador">Colaborador</option>
                  <option value="admin">Administrador</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {selectedUsuario ? 'Actualizar Rol' : 'Crear Usuario'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UsuariosPage;
