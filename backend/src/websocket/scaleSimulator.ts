import { WebSocketServer, WebSocket } from 'ws';

let scaleState = {
  isActive: false,
  weight: 0,
  stable: true,
};

let clients: Set<WebSocket> = new Set();
let simulationInterval: NodeJS.Timeout | null = null;

/**
 * Simula el comportamiento de una balanza real
 * Genera pesos aleatorios con variaciones realistas
 */
function simulateWeight() {
  if (!scaleState.isActive) {
    scaleState.weight = 0;
    scaleState.stable = true;
    return;
  }

  // Simular peso con variaciones
  // Peso base entre 0.1 y 5 kg
  const baseWeight = Math.random() * 4.9 + 0.1;

  // Agregar pequeñas variaciones para simular inestabilidad
  const variation = (Math.random() - 0.5) * 0.05; // ±0.025 kg

  scaleState.weight = Math.round((baseWeight + variation) * 1000) / 1000; // 3 decimales

  // La balanza está estable si el peso no varía mucho
  scaleState.stable = Math.abs(variation) < 0.01;
}

/**
 * Envía el estado actual de la balanza a todos los clientes conectados
 */
function broadcastState() {
  const message = JSON.stringify({
    type: 'weight-update',
    data: scaleState,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Inicia el servidor WebSocket para la balanza
 */
export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  console.log('⚖️  ================================');
  console.log(`✅ Servidor WebSocket (Balanza) corriendo en ws://localhost:${port}`);
  console.log('⚖️  ================================');

  wss.on('connection', (ws) => {
    console.log('🔌 Cliente conectado a la balanza');
    clients.add(ws);

    // Enviar estado actual inmediatamente
    ws.send(
      JSON.stringify({
        type: 'weight-update',
        data: scaleState,
        timestamp: new Date().toISOString(),
      })
    );

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'start-weighing':
            console.log('⚖️  Balanza activada');
            scaleState.isActive = true;

            // Iniciar simulación si no está corriendo
            if (!simulationInterval) {
              simulationInterval = setInterval(() => {
                simulateWeight();
                broadcastState();
              }, 200); // Actualizar cada 200ms para simular lectura en tiempo real
            }
            break;

          case 'stop-weighing':
            console.log('⚖️  Balanza detenida');
            scaleState.isActive = false;
            scaleState.weight = 0;
            scaleState.stable = true;
            broadcastState();
            break;

          case 'tare':
            console.log('⚖️  Balanza tarada (peso a cero)');
            scaleState.weight = 0;
            broadcastState();
            break;

          case 'get-state':
            ws.send(
              JSON.stringify({
                type: 'weight-update',
                data: scaleState,
                timestamp: new Date().toISOString(),
              })
            );
            break;

          default:
            console.log('⚠️  Comando desconocido:', data.type);
        }
      } catch (error) {
        console.error('❌ Error al procesar mensaje:', error);
      }
    });

    ws.on('close', () => {
      console.log('🔌 Cliente desconectado de la balanza');
      clients.delete(ws);

      // Si no hay más clientes, detener la simulación
      if (clients.size === 0 && simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
        scaleState.isActive = false;
        scaleState.weight = 0;
        scaleState.stable = true;
      }
    });

    ws.on('error', (error) => {
      console.error('❌ Error en WebSocket:', error);
    });
  });

  return wss;
}
