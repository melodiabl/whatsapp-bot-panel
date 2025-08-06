import React, { useState, useEffect } from 'react';

interface ProviderAporte {
  id: number;
  titulo: string;
  tipo: string;
  proveedor: string;
  archivo: {
    path: string;
    size: number;
    nombre: string;
  };
  fecha: string;
  descripcion: string;
  metadata: any;
}

interface ProviderStats {
  detallado: Array<{
    proveedor: string;
    manhwa_titulo: string;
    contenido_tipo: string;
    total: number;
    total_size: number;
    ultimo_aporte: string;
  }>;
  resumen: Array<{
    proveedor: string;
    total_aportes: number;
    espacio_usado: number;
    manhwas_diferentes: number;
  }>;
}

const ProveedoresPage: React.FC = () => {
  const [aportes, setAportes] = useState<ProviderAporte[]>([]);
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    proveedor: '',
    manhwa: '',
    tipo: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  // Estados de UI
  const [showStats, setShowStats] = useState(false);
  const [selectedAporte, setSelectedAporte] = useState<ProviderAporte | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadAportes();
    loadStats();
  }, []);

  // Cargar aportes con filtros
  const loadAportes = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/proveedores/aportes?${queryParams}`);
      if (!response.ok) throw new Error('Error cargando aportes');
      
      const data = await response.json();
      setAportes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await fetch('/api/proveedores/estadisticas');
      if (!response.ok) throw new Error('Error cargando estadísticas');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  // Aplicar filtros
  const handleFilterChange = (field: string, value: string) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    loadAportes();
  };

  const clearFilters = () => {
    setFiltros({
      proveedor: '',
      manhwa: '',
      tipo: '',
      fecha_desde: '',
      fecha_hasta: ''
    });
    setTimeout(loadAportes, 100);
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatear fecha
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color del chip según el tipo
  const getTypeColor = (tipo: string) => {
    const colors: { [key: string]: string } = {
      'capítulo': '#1976d2',
      'extra': '#9c27b0',
      'ilustración': '#2e7d32',
      'pack': '#ed6c02',
      'desconocido': '#d32f2f'
    };
    return colors[tipo] || '#666';
  };

  // Ver detalles del aporte
  const viewDetails = (aporte: ProviderAporte) => {
    setSelectedAporte(aporte);
    setDetailsOpen(true);
  };

  // Descargar archivo
  const downloadFile = async (aporte: ProviderAporte) => {
    try {
      const response = await fetch(`/api/proveedores/download/${aporte.id}`);
      if (!response.ok) throw new Error('Error descargando archivo');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = aporte.archivo.nombre;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error descargando archivo:', err);
    }
  };

  if (loading && aportes.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>
          📁 Contenido de Proveedores
        </h1>
        <div>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{ marginRight: '8px', padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
          >
            📊 {showStats ? 'Ocultar' : 'Ver'} Estadísticas
          </button>
          <button
            onClick={() => { loadAportes(); loadStats(); }}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#1976d2', color: 'white', cursor: 'pointer' }}
          >
            🔄 Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', marginBottom: '16px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px', color: '#c62828' }}>
          ❌ {error}
        </div>
      )}

      {/* Estadísticas */}
      {showStats && stats && (
        <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px' }}>📊 Estadísticas de Proveedores</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {stats.resumen.map((proveedor, index) => (
              <div key={index} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>{proveedor.proveedor}</h3>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                  📄 {proveedor.total_aportes} aportes
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                  💾 {formatFileSize(proveedor.espacio_usado)}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                  📚 {proveedor.manhwas_diferentes} manhwas diferentes
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>🔍 Filtros</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Título Manhwa:</label>
            <input
              type="text"
              value={filtros.manhwa}
              onChange={(e) => handleFilterChange('manhwa', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Proveedor:</label>
            <select
              value={filtros.proveedor}
              onChange={(e) => handleFilterChange('proveedor', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">Todos</option>
              {stats?.resumen.map((p) => (
                <option key={p.proveedor} value={p.proveedor}>
                  {p.proveedor}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Tipo:</label>
            <select
              value={filtros.tipo}
              onChange={(e) => handleFilterChange('tipo', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="">Todos</option>
              <option value="capítulo">Capítulo</option>
              <option value="extra">Extra</option>
              <option value="ilustración">Ilustración</option>
              <option value="pack">Pack</option>
              <option value="desconocido">Desconocido</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Desde:</label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Hasta:</label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={applyFilters}
              style={{ flex: 1, padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#1976d2', color: 'white', cursor: 'pointer' }}
            >
              Filtrar
            </button>
            <button
              onClick={clearFilters}
              style={{ flex: 1, padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de aportes */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #ddd' }}>
          <h2 style={{ margin: 0 }}>📋 Aportes Automáticos ({aportes.length})</h2>
        </div>
        
        {aportes.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
            ℹ️ No se encontraron aportes con los filtros aplicados.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Título del Manhwa</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Tipo</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Proveedor</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Archivo</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Tamaño</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {aportes.map((aporte) => (
                  <tr key={aporte.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {aporte.titulo}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: getTypeColor(aporte.tipo)
                        }}
                      >
                        {aporte.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#1976d2', fontWeight: 'bold' }}>
                      {aporte.proveedor}
                    </td>
                    <td style={{ padding: '12px' }}>
                      📄 {aporte.archivo.nombre}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {formatFileSize(aporte.archivo.size)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {formatDate(aporte.fecha)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => viewDetails(aporte)}
                          style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '12px' }}
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => downloadFile(aporte)}
                          style={{ padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '12px' }}
                          title="Descargar archivo"
                        >
                          📥
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {detailsOpen && selectedAporte && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px' }}>📋 Detalles del Aporte</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <strong>Título del Manhwa:</strong>
                <p style={{ margin: '4px 0' }}>{selectedAporte.titulo}</p>
              </div>
              <div>
                <strong>Tipo de Contenido:</strong>
                <p style={{ margin: '4px 0' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getTypeColor(selectedAporte.tipo)
                    }}
                  >
                    {selectedAporte.tipo}
                  </span>
                </p>
              </div>
              <div>
                <strong>Proveedor:</strong>
                <p style={{ margin: '4px 0' }}>{selectedAporte.proveedor}</p>
              </div>
              <div>
                <strong>Fecha de Procesamiento:</strong>
                <p style={{ margin: '4px 0' }}>{formatDate(selectedAporte.fecha)}</p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Descripción:</strong>
              <p style={{ margin: '4px 0' }}>{selectedAporte.descripcion}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <strong>Información del Archivo:</strong>
              <div style={{ padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px', marginTop: '8px' }}>
                <p style={{ margin: '4px 0' }}>📄 <strong>Nombre:</strong> {selectedAporte.archivo.nombre}</p>
                <p style={{ margin: '4px 0' }}>📊 <strong>Tamaño:</strong> {formatFileSize(selectedAporte.archivo.size)}</p>
                <p style={{ margin: '4px 0' }}>📁 <strong>Ruta:</strong> {selectedAporte.archivo.path}</p>
              </div>
            </div>

            {selectedAporte.metadata && Object.keys(selectedAporte.metadata).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Metadatos Adicionales:</strong>
                <pre style={{ 
                  padding: '12px', 
                  backgroundColor: '#f0f0f0', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  overflow: 'auto',
                  marginTop: '8px'
                }}>
                  {JSON.stringify(selectedAporte.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => downloadFile(selectedAporte)}
                style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#1976d2', color: 'white', cursor: 'pointer' }}
              >
                📥 Descargar Archivo
              </button>
              <button
                onClick={() => setDetailsOpen(false)}
                style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedoresPage;
