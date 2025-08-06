import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  useToast,
  Container,
  Heading,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un tipo de acceso',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      toast({
        title: 'Login exitoso',
        description: `Bienvenido como ${selectedRole}`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error de login',
        description: 'Usuario o contraseña incorrectos',
        status: 'error',
        duration: 3000,
      });
      // Solo limpiar la contraseña, mantener usuario y tipo de acceso
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Acceso completo a todas las funciones';
      case 'admin':
        return 'Funciones de administración y moderación';
      case 'usuario':
        return 'Acceso a contenido personal y básico';
      default:
        return '';
    }
  };

  return (
    <Container maxW="container.sm" py={10} minH="100vh" display="flex" alignItems="center">
      <VStack spacing={8} w="100%">
        <VStack spacing={4}>
          <HStack spacing={3}>
            <Icon as={FaWhatsapp} boxSize={8} color="green.500" />
            <Heading size="xl" color="green.500">WhatsApp Bot Panel</Heading>
          </HStack>
          <Text color="gray.500" textAlign="center">
            Sistema de gestión y control del bot de WhatsApp
          </Text>
        </VStack>

        <Box 
          w="100%" 
          p={8} 
          bg={bg}
          borderWidth={1} 
          borderColor={borderColor}
          borderRadius="xl" 
          boxShadow="xl"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Tipo de Acceso</FormLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  placeholder="Selecciona el tipo de acceso"
                >
                  <option value="owner">Owner - Acceso Total</option>
                  <option value="admin">Admin - Administración</option>
                  <option value="usuario">User - Básico</option>
                </Select>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {getRoleDescription(selectedRole)}
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Usuario</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  border="1px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'green.500',
                    boxShadow: '0 0 0 1px #38A169'
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold">Contraseña</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  border="1px"
                  borderColor={borderColor}
                  _focus={{
                    borderColor: 'green.500',
                    boxShadow: '0 0 0 1px #38A169'
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="green"
                size="lg"
                width="full"
                isLoading={isLoading}
                loadingText="Iniciando sesión..."
                leftIcon={<Icon as={FaWhatsapp} />}
              >
                Iniciar Sesión
              </Button>
            </VStack>
          </form>
        </Box>

        <Text fontSize="sm" color="gray.400" textAlign="center">
          Panel de Control v2.5 - Bot WhatsApp
        </Text>
      </VStack>
    </Container>
  );
}
