import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  HStack,
  Button,
  useToast,
  Input,
  Select,
  VStack,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import api from '../services/api';

interface Log {
  id: number;
  tipo: string;
  comando: string;
  usuario: string;
  grupo: string;
  fecha: string;
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [filters, setFilters] = useState({
    tipo: '',
    usuario: '',
    comando: '',
  });
  const toast = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs');
      setLogs(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los logs',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const applyFilters = () => {
    let filtered = logs;

    if (filters.tipo) {
      filtered = filtered.filter(log => log.tipo.toLowerCase().includes(filters.tipo.toLowerCase()));
    }

    if (filters.usuario) {
      filtered = filtered.filter(log => log.usuario.toLowerCase().includes(filters.usuario.toLowerCase()));
    }

    if (filters.comando) {
      filtered = filtered.filter(log => log.comando.toLowerCase().includes(filters.comando.toLowerCase()));
    }

    setFilteredLogs(filtered);
  };

  const getTipoBadge = (tipo: string) => {
    const color = tipo === 'comando' ? 'blue' : tipo === 'error' ? 'red' : tipo === 'warning' ? 'yellow' : 'green';
    return <Badge colorScheme={color}>{tipo.toUpperCase()}</Badge>;
  };

  const clearFilters = () => {
    setFilters({
      tipo: '',
      usuario: '',
      comando: '',
    });
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">Logs del Sistema</Text>
        <Button leftIcon={<RepeatIcon />} onClick={fetchLogs}>
          Actualizar
        </Button>
      </HStack>

      {/* Filtros */}
      <Box mb={6} p={4} borderWidth={1} borderRadius="md">
        <Text fontSize="lg" fontWeight="semibold" mb={3}>Filtros</Text>
        <VStack spacing={3}>
          <HStack spacing={4} width="100%">
            <Select
              placeholder="Filtrar por tipo"
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              maxW="200px"
            >
              <option value="comando">Comando</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </Select>

            <Input
              placeholder="Filtrar por usuario"
              value={filters.usuario}
              onChange={(e) => setFilters({ ...filters, usuario: e.target.value })}
              maxW="200px"
            />

            <Input
              placeholder="Filtrar por comando"
              value={filters.comando}
              onChange={(e) => setFilters({ ...filters, comando: e.target.value })}
              maxW="200px"
            />

            <Button onClick={clearFilters} size="sm">
              Limpiar Filtros
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Text mb={4} color="gray.600">
        Mostrando {filteredLogs.length} de {logs.length} logs
      </Text>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Fecha</Th>
            <Th>Tipo</Th>
            <Th>Comando</Th>
            <Th>Usuario</Th>
            <Th>Grupo</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredLogs.map((log) => (
            <Tr key={log.id}>
              <Td>{new Date(log.fecha).toLocaleString()}</Td>
              <Td>{getTipoBadge(log.tipo)}</Td>
              <Td>
                <Text fontFamily="mono" fontSize="sm">
                  {log.comando}
                </Text>
              </Td>
              <Td>{log.usuario}</Td>
              <Td maxW="200px" isTruncated>{log.grupo}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {filteredLogs.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text color="gray.500">No se encontraron logs con los filtros aplicados</Text>
        </Box>
      )}
    </Box>
  );
};

export default LogsPage;
