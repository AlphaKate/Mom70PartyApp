import Peer, { DataConnection } from 'peerjs';
import { GameState, P2PMessage } from '../types/game';

export type HostConnectionStatus = 'connecting' | 'ready' | 'local-only' | 'error';
export type PlayerConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'local-only'
  | 'reconnecting'
  | 'disconnected';

interface P2PEnvelope {
  __mom70: true;
  msgId: string;
  sender: string;
  message: P2PMessage;
}

function normalizeRoomCode(roomCode: string): string {
  const cleaned = roomCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');
  return cleaned || '7070';
}

function sanitizeId(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_-]/g, '') || 'guest';
}

function generateMsgId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

function isEnvelope(data: unknown): data is P2PEnvelope {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as Partial<P2PEnvelope>).__mom70 === true &&
    typeof (data as Partial<P2PEnvelope>).msgId === 'string' &&
    typeof (data as Partial<P2PEnvelope>).message === 'object'
  );
}

function isP2PMessage(data: unknown): data is P2PMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as { type?: unknown }).type === 'string' &&
    'payload' in data
  );
}

class SeenMessageTracker {
  private readonly seen = new Set<string>();
  private readonly queue: string[] = [];
  private readonly maxSize: number;

  constructor(maxSize = 300) {
    this.maxSize = maxSize;
  }

  hasSeenOrAdd(id: string): boolean {
    if (this.seen.has(id)) {
      return true;
    }
    this.seen.add(id);
    this.queue.push(id);
    if (this.queue.length > this.maxSize) {
      const oldest = this.queue.shift();
      if (oldest) {
        this.seen.delete(oldest);
      }
    }
    return false;
  }
}

// Lightweight fallback in case BroadcastChannel is unavailable in a restricted environment.
const memoryBusListeners = new Map<string, Set<(env: P2PEnvelope) => void>>();

function subscribeMemoryBus(
  channelName: string,
  handler: (env: P2PEnvelope) => void
): () => void {
  let listeners = memoryBusListeners.get(channelName);
  if (!listeners) {
    listeners = new Set();
    memoryBusListeners.set(channelName, listeners);
  }
  listeners.add(handler);
  return () => {
    listeners?.delete(handler);
    if (listeners && listeners.size === 0) {
      memoryBusListeners.delete(channelName);
    }
  };
}

function publishMemoryBus(channelName: string, env: P2PEnvelope): void {
  const listeners = memoryBusListeners.get(channelName);
  if (!listeners) return;
  listeners.forEach((listener) => {
    try {
      listener(env);
    } catch {
      // Ignore individual listener errors
    }
  });
}

export class HostP2PManager {
  private readonly roomCode: string;
  private readonly channelName: string;
  private readonly onMessage: (msg: P2PMessage) => void;
  private readonly onStatusChange?: (status: HostConnectionStatus) => void;
  private readonly seenMessages = new SeenMessageTracker();
  private readonly connections = new Map<string, DataConnection>();

  private peer: Peer | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribeBus: (() => void) | null = null;
  private lastState: GameState | null = null;
  private destroyed = false;
  private peerRetries = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    roomCode: string,
    onMessage: (msg: P2PMessage) => void,
    onStatusChange?: (status: HostConnectionStatus) => void
  ) {
    this.roomCode = normalizeRoomCode(roomCode);
    this.channelName = `mom70-room-${this.roomCode}`;
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;

    this.onStatusChange?.('connecting');
    this.initLocalTransport();
    this.initPeer();
  }

  private initLocalTransport(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event: MessageEvent) => {
          this.handleIncomingData(event.data, 'local');
        };
      } catch {
        this.broadcastChannel = null;
      }
    }

    if (!this.broadcastChannel) {
      this.unsubscribeBus = subscribeMemoryBus(this.channelName, (env) => {
        this.handleIncomingData(env, 'local');
      });
    }
  }

  private initPeer(): void {
    if (this.destroyed) return;

    const hostPeerId = `mom70-host-${this.roomCode}`;
    try {
      const peer = new Peer(hostPeerId, { debug: 0 });
      this.peer = peer;

      peer.on('open', () => {
        if (this.destroyed) return;
        this.peerRetries = 0;
        this.onStatusChange?.('ready');
      });

      peer.on('connection', (conn) => {
        if (this.destroyed) {
          conn.close();
          return;
        }
        this.attachConnection(conn);
      });

      peer.on('error', (err) => {
        if (this.destroyed) return;
        const errType = (err as { type?: string } | undefined)?.type;
        if (errType === 'unavailable-id' && this.peerRetries < 2) {
          this.peerRetries += 1;
          try {
            peer.destroy();
          } catch {
            // Ignore cleanup errors
          }
          this.peer = null;
          this.retryTimer = setTimeout(() => {
            this.initPeer();
          }, 800);
          return;
        }
        // Keep local BroadcastChannel active even if WebRTC signaling server is unreachable
        this.onStatusChange?.('local-only');
      });

      peer.on('disconnected', () => {
        if (!this.destroyed) {
          this.onStatusChange?.('local-only');
        }
      });
    } catch {
      this.onStatusChange?.('local-only');
    }
  }

  private attachConnection(conn: DataConnection): void {
    const connKey = `${conn.peer}-${Math.random().toString(36).slice(2, 6)}`;
    this.connections.set(connKey, conn);

    conn.on('open', () => {
      if (this.destroyed) return;
      if (this.lastState) {
        const syncEnv: P2PEnvelope = {
          __mom70: true,
          msgId: generateMsgId('host-sync'),
          sender: 'host',
          message: { type: 'GAME_STATE_UPDATE', payload: this.lastState },
        };
        try {
          conn.send(syncEnv);
        } catch {
          // Ignore send errors on closing channel
        }
      }
    });

    conn.on('data', (data) => {
      this.handleIncomingData(data, 'webrtc', conn);
    });

    conn.on('close', () => {
      this.connections.delete(connKey);
    });

    conn.on('error', () => {
      this.connections.delete(connKey);
    });
  }

  private handleIncomingData(
    raw: unknown,
    source: 'local' | 'webrtc',
    replyConn?: DataConnection
  ): void {
    if (this.destroyed) return;

    let msg: P2PMessage | null = null;
    if (isEnvelope(raw)) {
      if (raw.sender === 'host') return;
      if (this.seenMessages.hasSeenOrAdd(raw.msgId)) return;
      msg = raw.message;
    } else if (isP2PMessage(raw)) {
      msg = raw;
    }

    if (!msg) return;

    if (msg.type === 'PING' && this.lastState) {
      const replyEnv: P2PEnvelope = {
        __mom70: true,
        msgId: generateMsgId('host-pong'),
        sender: 'host',
        message: { type: 'GAME_STATE_UPDATE', payload: this.lastState },
      };
      if (source === 'webrtc' && replyConn?.open) {
        try {
          replyConn.send(replyEnv);
        } catch {
          // Ignore
        }
      } else {
        this.sendLocal(replyEnv);
      }
      return;
    }

    if (msg.type === 'GAME_STATE_UPDATE') return;

    this.onMessage(msg);
  }

  private sendLocal(env: P2PEnvelope): void {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(env);
      } catch {
        // Ignore closed channel error
      }
    } else {
      publishMemoryBus(this.channelName, env);
    }
  }

  public broadcast(state: GameState): void {
    if (this.destroyed) return;
    this.lastState = state;

    const env: P2PEnvelope = {
      __mom70: true,
      msgId: generateMsgId('host'),
      sender: 'host',
      message: { type: 'GAME_STATE_UPDATE', payload: state },
    };

    this.sendLocal(env);

    this.connections.forEach((conn, key) => {
      if (!conn.open) return;
      try {
        conn.send(env);
      } catch {
        this.connections.delete(key);
      }
    });
  }

  public destroy(): void {
    this.destroyed = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    this.connections.forEach((conn) => {
      try {
        conn.close();
      } catch {
        // Ignore
      }
    });
    this.connections.clear();

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // Ignore
      }
      this.peer = null;
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // Ignore
      }
      this.broadcastChannel = null;
    }

    if (this.unsubscribeBus) {
      this.unsubscribeBus();
      this.unsubscribeBus = null;
    }
  }
}

export class PlayerP2PClient {
  private readonly roomCode: string;
  private readonly playerId: string;
  private readonly channelName: string;
  private readonly onStateUpdate: (state: GameState) => void;
  private readonly onConnectionChange?: (
    connected: boolean,
    status?: PlayerConnectionStatus
  ) => void;
  private readonly seenMessages = new SeenMessageTracker();
  private readonly pendingPeerQueue: P2PEnvelope[] = [];

  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribeBus: (() => void) | null = null;
  private destroyed = false;
  private peerConnected = false;
  private retryAttempts = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private localReadyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    roomCode: string,
    playerId: string,
    onStateUpdate: (state: GameState) => void,
    onConnectionChange?: (connected: boolean, status?: PlayerConnectionStatus) => void
  ) {
    this.roomCode = normalizeRoomCode(roomCode);
    this.playerId = sanitizeId(playerId);
    this.channelName = `mom70-room-${this.roomCode}`;
    this.onStateUpdate = onStateUpdate;
    this.onConnectionChange = onConnectionChange;

    this.onConnectionChange?.(false, 'connecting');
    this.initLocalTransport();
    this.initPeer();

    // Ask an already-open local host for the current state immediately.
    this.sendPingLocal();

    // If running locally (split-screen / multi-tab), mark local transport usable without blocking UI.
    this.localReadyTimer = setTimeout(() => {
      if (!this.destroyed && !this.peerConnected) {
        this.onConnectionChange?.(true, 'local-only');
      }
    }, 200);
  }

  private initLocalTransport(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event: MessageEvent) => {
          this.handleIncomingData(event.data);
        };
      } catch {
        this.broadcastChannel = null;
      }
    }

    if (!this.broadcastChannel) {
      this.unsubscribeBus = subscribeMemoryBus(this.channelName, (env) => {
        this.handleIncomingData(env);
      });
    }
  }

  private sendPingLocal(): void {
    const pingEnv: P2PEnvelope = {
      __mom70: true,
      msgId: generateMsgId(this.playerId),
      sender: this.playerId,
      message: { type: 'PING', payload: { timestamp: Date.now() } },
    };
    this.sendLocal(pingEnv);
  }

  private initPeer(): void {
    if (this.destroyed) return;

    const suffix = Math.random().toString(36).slice(2, 6);
    const clientPeerId = `mom70-player-${this.roomCode}-${this.playerId}-${suffix}`;
    const hostPeerId = `mom70-host-${this.roomCode}`;

    try {
      const peer = new Peer(clientPeerId, { debug: 0 });
      this.peer = peer;

      peer.on('open', () => {
        if (this.destroyed) return;
        this.connectToHost(peer, hostPeerId);
      });

      peer.on('error', () => {
        if (this.destroyed) return;
        this.scheduleReconnect();
      });

      peer.on('disconnected', () => {
        if (this.destroyed) return;
        this.peerConnected = false;
        this.onConnectionChange?.(true, 'local-only');
      });
    } catch {
      this.onConnectionChange?.(true, 'local-only');
    }
  }

  private connectToHost(peer: Peer, hostPeerId: string): void {
    if (this.destroyed) return;

    try {
      const conn = peer.connect(hostPeerId, { reliable: true });
      this.conn = conn;

      conn.on('open', () => {
        if (this.destroyed) return;
        this.peerConnected = true;
        this.retryAttempts = 0;
        this.onConnectionChange?.(true, 'connected');
        this.flushPendingQueue();
      });

      conn.on('data', (data) => {
        this.handleIncomingData(data);
      });

      conn.on('close', () => {
        if (this.destroyed) return;
        this.peerConnected = false;
        this.onConnectionChange?.(true, 'reconnecting');
        this.scheduleReconnect();
      });

      conn.on('error', () => {
        if (this.destroyed) return;
        this.peerConnected = false;
        this.scheduleReconnect();
      });
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.destroyed || this.retryTimer || this.retryAttempts >= 6) return;
    this.retryAttempts += 1;
    const delayMs = Math.min(1500 * this.retryAttempts, 5000);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.destroyed) return;
      if (this.peer && !this.peer.destroyed && this.peer.open) {
        this.connectToHost(this.peer, `mom70-host-${this.roomCode}`);
      } else {
        try {
          this.peer?.destroy();
        } catch {
          // Ignore
        }
        this.peer = null;
        this.initPeer();
      }
    }, delayMs);
  }

  private handleIncomingData(raw: unknown): void {
    if (this.destroyed) return;

    let msg: P2PMessage | null = null;
    if (isEnvelope(raw)) {
      if (raw.sender === this.playerId) return;
      if (this.seenMessages.hasSeenOrAdd(raw.msgId)) return;
      msg = raw.message;
    } else if (isP2PMessage(raw)) {
      msg = raw;
    }

    if (!msg) return;

    if (msg.type === 'GAME_STATE_UPDATE') {
      this.onConnectionChange?.(
        true,
        this.peerConnected ? 'connected' : 'local-only'
      );
      this.onStateUpdate(msg.payload);
    }
  }

  private sendLocal(env: P2PEnvelope): void {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(env);
      } catch {
        // Ignore
      }
    } else {
      publishMemoryBus(this.channelName, env);
    }
  }

  private flushPendingQueue(): void {
    if (!this.conn || !this.conn.open) return;
    while (this.pendingPeerQueue.length > 0) {
      const next = this.pendingPeerQueue.shift();
      if (!next) continue;
      try {
        this.conn.send(next);
      } catch {
        this.pendingPeerQueue.unshift(next);
        break;
      }
    }
  }

  public send(msg: P2PMessage): void {
    if (this.destroyed) return;

    const env: P2PEnvelope = {
      __mom70: true,
      msgId: generateMsgId(this.playerId),
      sender: this.playerId,
      message: msg,
    };

    // Always send via local BroadcastChannel for instant same-device/split-screen delivery.
    this.sendLocal(env);

    // Also send (or queue) over WebRTC DataConnection for cross-device phones/TV.
    if (this.conn && this.conn.open) {
      try {
        this.conn.send(env);
      } catch {
        this.enqueueForPeer(env);
      }
    } else {
      this.enqueueForPeer(env);
    }
  }

  private enqueueForPeer(env: P2PEnvelope): void {
    if (this.pendingPeerQueue.length >= 50) {
      this.pendingPeerQueue.shift();
    }
    this.pendingPeerQueue.push(env);
  }

  public destroy(): void {
    this.destroyed = true;

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.localReadyTimer) {
      clearTimeout(this.localReadyTimer);
      this.localReadyTimer = null;
    }

    if (this.conn) {
      try {
        this.conn.close();
      } catch {
        // Ignore
      }
      this.conn = null;
    }

    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // Ignore
      }
      this.peer = null;
    }

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {
        // Ignore
      }
      this.broadcastChannel = null;
    }

    if (this.unsubscribeBus) {
      this.unsubscribeBus();
      this.unsubscribeBus = null;
    }

    this.pendingPeerQueue.length = 0;
  }
}
