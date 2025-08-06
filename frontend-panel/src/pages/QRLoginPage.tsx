import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Image,
  useToast,
  Container,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { whatsappService } from '../services/api';

export function QRLoginPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await whatsappService.getQR();
      if (response.qr) {
        setQrCode(response.qr);
        setStatus('waiting_for_scan');
      } else {
        setQrCode(null);
        setStatus('disconnected');
      }
    } catch (error) {
      toast({
        title: 'Error al obtener código QR',
        description: 'No se pudo conectar con el servidor',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await whatsappService.getStatus();
      const currentStatus = response.status?.status || response.status;
      setStatus(currentStatus);
      
      if (currentStatus === 'connected') {
        setQrCode(null);
        toast({
          title: 'WhatsApp conectado',
          description: 'Bot conectado exitosamente',
          status: 'success',
          duration: 3000,
        });
      } else if (currentStatus === 'waiting_for_scan' && !qrCode) {
        // Si está esperando escaneo pero no tenemos QR, intentar obtenerlo
        fetchQRCode();
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await whatsappService.logout();
      setStatus('disconnected');
      setQrCode(null);
      toast({
        title: 'WhatsApp desconectado',
        description: 'Bot desconectado exitosamente',
        status: 'info',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error al desconectar',
        description: 'No se pudo desconectar el bot',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    fetchQRCode();
    
    // Check status every 3 seconds
    const interval = setInterval(checkStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'success';
      case 'waiting_for_scan': return 'warning';
      case 'disconnected': return 'error';
      default: return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'waiting_for_scan': return 'Esperando escaneo';
      case 'disconnected': return 'Desconectado';
      default: return 'Estado desconocido';
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8}>
        <Heading>Conexión WhatsApp Bot</Heading>
        
        <Alert status={getStatusColor(status)}>
          <AlertIcon />
          Estado: {getStatusText(status)}
        </Alert>

        {status === 'connected' ? (
          <VStack spacing={4}>
            <Text fontSize="lg" color="green.500">
              ✅ Bot conectado y funcionando
            </Text>
            <Button colorScheme="red" onClick={handleLogout}>
              Desconectar Bot
            </Button>
          </VStack>
        ) : (
          <Box textAlign="center">
            {isLoading ? (
              <VStack spacing={4}>
                <Spinner size="xl" />
                <Text>Generando código QR...</Text>
              </VStack>
            ) : qrCode ? (
              <VStack spacing={4}>
                <Text fontSize="lg">
                  Escanea este código QR con WhatsApp
                </Text>
                <Box p={4} bg="white" borderRadius="md" boxShadow="md">
                  <Image 
                    src={`data:image/png;base64,${qrCode}`} 
                    alt="QR Code para WhatsApp"
                    maxW="300px"
                    maxH="300px"
                    objectFit="contain"
                  />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    1. Abre WhatsApp en tu teléfono
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    2. Ve a Configuración → Dispositivos vinculados
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    3. Toca "Vincular un dispositivo"
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    4. Escanea este código QR
                  </Text>
                </VStack>
                <Button onClick={fetchQRCode} colorScheme="blue">
                  Generar nuevo código
                </Button>
              </VStack>
            ) : (
              <VStack spacing={4}>
                <Text>No hay código QR disponible</Text>
                <Button onClick={fetchQRCode} colorScheme="blue">
                  Generar código QR
                </Button>
              </VStack>
            )}
          </Box>
        )}
      </VStack>
    </Container>
  );
}
