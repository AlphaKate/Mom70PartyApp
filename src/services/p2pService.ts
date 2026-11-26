import Peer, { DataConnection } from 'peerjs';
import { GameContent, GameState, P2PMessage } from '../types/game';

export type HostConnectionStatus = 'connecting' | 'ready' | 'local-only' | 'error';
export type PlayerConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'local-only'
  | 'reconnecting'
  | 'disconnected';

const WEBRTC_CHUNK_SIZE = 32768; // 32 KB safe across Chrome, Safari iOS, Firefox SCTP
const CHUNK_STALE_MS = 30000;
const MEDIA_TOKEN_PREFIX = '@@M';
const MEDIA_TOKEN_SUFFIX = '@@';

export interface WireGameStateEnvelope {
  __wireState: true;
  contentVersion: number;
  omitContent?: boolean;
  mediaTable?: string[];
  state: Omit<GameState, 'content'> & { content?: GameContent };
}

interface P2PEnvelope {
  __mom70: true;
  msgId: string;
  sender: string;
  message: P2PMessage;
  wireState?: WireGameStateEnvelope;
}

export interface P2PChunkPacket {
  __mom70_chunk: true;
  transferId: string;
  idx: number;
  total: number;
  data: string;
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

function isChunkPacket(data: unknown): data is P2PChunkPacket {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as Partial<P2PChunkPacket>).__mom70_chunk === true &&
    typeof (data as Partial<P2PChunkPacket>).transferId === 'string' &&
    typeof (data as Partial<P2PChunkPacket>).idx === 'number' &&
    typeof (data as Partial<P2PChunkPacket>).total === 'number' &&
    typeof (data as Partial<P2PChunkPacket>).data === 'string'
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

/**
 * Deduplicates repeated data:image/ URLs across memoryPairs, puzzles, and wishes
 * into a single mediaTable (~3x smaller wire payload), and optionally omits unchanged content.
 */
export function packGameStateForWire(
  state: GameState,
  contentVersion: number,
  omitContent = false
): WireGameStateEnvelope {
  if (omitContent) {
    const { content: _omitted, ...rest } = state;
    return {
      __wireState: true,
      contentVersion,
      omitContent: true,
      state: rest,
    };
  }

  const mediaTable: string[] = [];
  const mediaIndex = new Map<string, string>();

  const intern = (value?: string): string | undefined => {
    if (!value || !value.startsWith('data:image/')) return value;
    const existing = mediaIndex.get(value);
    if (existing) return existing;
    const token = `${MEDIA_TOKEN_PREFIX}${mediaTable.length}${MEDIA_TOKEN_SUFFIX}`;
    mediaTable.push(value);
    mediaIndex.set(value, token);
    return token;
  };

  const packedContent: GameContent = {
    ...state.content,
    memoryPairs: state.content.memoryPairs.map((pair) => ({
      ...pair,
      imageA: intern(pair.imageA) ?? pair.imageA,
      imageB: intern(pair.imageB) ?? pair.imageB,
    })),
    puzzles: state.content.puzzles.map((puz) => ({
      ...puz,
      imageUrl: intern(puz.imageUrl) ?? puz.imageUrl,
    })),
  };

  const packedWishes = state.wishes.map((w) =>
    w.selfieDataUrl ? { ...w, selfieDataUrl: intern(w.selfieDataUrl) } : w
  );

  return {
    __wireState: true,
    contentVersion,
    omitContent: false,
    mediaTable: mediaTable.length > 0 ? mediaTable : undefined,
    state: {
      ...state,
      wishes: packedWishes,
      content: packedContent,
    },
  };
}

/**
 * Restores a WireGameStateEnvelope back into a complete GameState using mediaTable and cachedContent.
 */
export function unpackGameStateFromWire(
  wire: WireGameStateEnvelope,
  cachedContent: GameContent | null,
  cachedContentVersion: number
): { state: GameState | null; contentUpdated: boolean; needsFullSync: boolean } {
  const mediaTable = wire.mediaTable ?? [];
  const resolve = (value?: string): string | undefined => {
    if (!value) return value;
    if (value.startsWith(MEDIA_TOKEN_PREFIX) && value.endsWith(MEDIA_TOKEN_SUFFIX)) {
      const idx = Number(value.slice(MEDIA_TOKEN_PREFIX.length, -MEDIA_TOKEN_SUFFIX.length));
      if (Number.isInteger(idx) && idx >= 0 && idx < mediaTable.length) {
        return mediaTable[idx];
      }
    }
    return value;
  };

  if (wire.omitContent) {
    if (!cachedContent || cachedContentVersion !== wire.contentVersion) {
      return { state: null, contentUpdated: false, needsFullSync: true };
    }
    return {
      state: {
        ...wire.state,
        content: cachedContent,
      } as GameState,
      contentUpdated: false,
      needsFullSync: false,
    };
  }

  const rawContent = wire.state.content;
  if (!rawContent) {
    return { state: null, contentUpdated: false, needsFullSync: true };
  }

  const restoredContent: GameContent = {
    ...rawContent,
    memoryPairs: rawContent.memoryPairs.map((pair) => ({
      ...pair,
      imageA: resolve(pair.imageA) ?? pair.imageA,
      imageB: resolve(pair.imageB) ?? pair.imageB,
    })),
    puzzles: rawContent.puzzles.map((puz) => ({
      ...puz,
      imageUrl: resolve(puz.imageUrl) ?? puz.imageUrl,
    })),
  };

  const restoredWishes = wire.state.wishes.map((w) =>
    w.selfieDataUrl ? { ...w, selfieDataUrl: resolve(w.selfieDataUrl) } : w
  );

  return {
    state: {
      ...wire.state,
      wishes: restoredWishes,
      content: restoredContent,
    } as GameState,
    contentUpdated: true,
    needsFullSync: false,
  };
}

/**
 * Splits a large P2P payload into 32KB JSON chunks for reliable WebRTC transmission.
 */
export function splitIntoChunks(
  payload: unknown,
  chunkSize = WEBRTC_CHUNK_SIZE
): P2PChunkPacket[] | null {
  const serialized = JSON.stringify(payload);
  if (serialized.length <= chunkSize) {
    return null;
  }
  const transferId = generateMsgId('chk');
  const total = Math.ceil(serialized.length / chunkSize);
  const chunks: P2PChunkPacket[] = [];
  for (let i = 0; i < total; i += 1) {
    chunks.push({
      __mom70_chunk: true,
      transferId,
      idx: i,
      total,
      data: serialized.slice(i * chunkSize, (i + 1) * chunkSize),
    });
  }
  return chunks;
}

/**
 * Reassembles chunked WebRTC packets back into the original envelope.
 */
export class ChunkReassembler {
  private readonly buffers = new Map<
    string,
    { total: number; parts: string[]; received: number; updatedAt: number }
  >();

  public push(packet: P2PChunkPacket): unknown | null {
    this.cleanupStale();
    if (packet.total <= 0 || packet.idx < 0 || packet.idx >= packet.total) {
      return null;
    }

    let entry = this.buffers.get(packet.transferId);
    if (!entry) {
      entry = {
        total: packet.total,
        parts: new Array<string>(packet.total),
        received: 0,
        updatedAt: Date.now(),
      };
      this.buffers.set(packet.transferId, entry);
    }

    if (entry.parts[packet.idx] === undefined) {
      entry.parts[packet.idx] = packet.data;
      entry.received += 1;
      entry.updatedAt = Date.now();
    }

    if (entry.received >= entry.total) {
      this.buffers.delete(packet.transferId);
      try {
        return JSON.parse(entry.parts.join(''));
      } catch {
        return null;
      }
    }
    return null;
  }

  private cleanupStale(): void {
    const now = Date.now();
    this.buffers.forEach((entry, key) => {
      if (now - entry.updatedAt > CHUNK_STALE_MS) {
        this.buffers.delete(key);
      }
    });
  }

  public clear(): void {
    this.buffers.clear();
  }
}

function sendOverWebRTC(conn: DataConnection, payload: P2PEnvelope): void {
  const chunks = splitIntoChunks(payload);
  if (!chunks) {
    conn.send(payload);
    return;
  }
  for (const chunk of chunks) {
    conn.send(chunk);
  }
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
  private readonly reassembler = new ChunkReassembler();
  private readonly connections = new Map<string, DataConnection>();
  private readonly peerContentVersions = new Map<string, number>();

  private peer: Peer | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribeBus: (() => void) | null = null;
  private lastState: GameState | null = null;
  private lastContentRef: GameContent | null = null;
  private contentVersion = 0;
  private localSentContentVersion = -1;
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

  private buildStateEnvelope(
    state: GameState,
    prefix: string,
    omitContent: boolean
  ): P2PEnvelope {
    const wireState = packGameStateForWire(state, this.contentVersion, omitContent);
    return {
      __mom70: true,
      msgId: generateMsgId(prefix),
      sender: 'host',
      // Keep message.type = GAME_STATE_UPDATE for compatibility, with lightweight payload
      message: {
        type: 'GAME_STATE_UPDATE',
        payload: wireState.state as GameState,
      },
      wireState,
    };
  }

  private attachConnection(conn: DataConnection): void {
    const connKey = `${conn.peer}-${Math.random().toString(36).slice(2, 6)}`;
    this.connections.set(connKey, conn);

    conn.on('open', () => {
      if (this.destroyed) return;
      if (this.lastState) {
        const syncEnv = this.buildStateEnvelope(this.lastState, 'host-sync', false);
        try {
          sendOverWebRTC(conn, syncEnv);
          this.peerContentVersions.set(connKey, this.contentVersion);
        } catch {
          // Ignore send errors on closing channel
        }
      }
    });

    conn.on('data', (data) => {
      this.handleIncomingData(data, 'webrtc', conn, connKey);
    });

    conn.on('close', () => {
      this.connections.delete(connKey);
      this.peerContentVersions.delete(connKey);
    });

    conn.on('error', () => {
      this.connections.delete(connKey);
      this.peerContentVersions.delete(connKey);
    });
  }

  private handleIncomingData(
    raw: unknown,
    source: 'local' | 'webrtc',
    replyConn?: DataConnection,
    replyConnKey?: string
  ): void {
    if (this.destroyed) return;

    let decoded: unknown = raw;
    if (isChunkPacket(raw)) {
      decoded = this.reassembler.push(raw);
      if (!decoded) return;
    }

    let msg: P2PMessage | null = null;
    if (isEnvelope(decoded)) {
      if (decoded.sender === 'host') return;
      if (this.seenMessages.hasSeenOrAdd(decoded.msgId)) return;
      msg = decoded.message;
    } else if (isP2PMessage(decoded)) {
      msg = decoded;
    }

    if (!msg) return;

    if (msg.type === 'PING' && this.lastState) {
      const replyEnv = this.buildStateEnvelope(this.lastState, 'host-pong', false);
      if (source === 'webrtc' && replyConn?.open) {
        try {
          sendOverWebRTC(replyConn, replyEnv);
          if (replyConnKey) {
            this.peerContentVersions.set(replyConnKey, this.contentVersion);
          }
        } catch {
          // Ignore
        }
      } else {
        this.sendLocal(replyEnv);
        this.localSentContentVersion = this.contentVersion;
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

    if (state.content !== this.lastContentRef) {
      this.lastContentRef = state.content;
      this.contentVersion += 1;
    }

    // Local BroadcastChannel / memoryBus: send full content only when contentVersion changes
    const localOmit = this.localSentContentVersion === this.contentVersion;
    const localEnv = this.buildStateEnvelope(state, 'host-local', localOmit);
    this.sendLocal(localEnv);
    this.localSentContentVersion = this.contentVersion;

    // WebRTC peers: send full chunked state once per contentVersion, then <2KB delta updates
    let cachedFullEnv: P2PEnvelope | null = null;
    let cachedLiteEnv: P2PEnvelope | null = null;

    this.connections.forEach((conn, key) => {
      if (!conn.open) return;
      const peerHasContent = this.peerContentVersions.get(key) === this.contentVersion;
      try {
        if (peerHasContent) {
          if (!cachedLiteEnv) {
            cachedLiteEnv = this.buildStateEnvelope(state, 'host-lite', true);
          }
          sendOverWebRTC(conn, cachedLiteEnv);
        } else {
          if (!cachedFullEnv) {
            cachedFullEnv = this.buildStateEnvelope(state, 'host-full', false);
          }
          sendOverWebRTC(conn, cachedFullEnv);
          this.peerContentVersions.set(key, this.contentVersion);
        }
      } catch {
        this.connections.delete(key);
        this.peerContentVersions.delete(key);
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
    this.peerContentVersions.clear();
    this.reassembler.clear();

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
  private readonly reassembler = new ChunkReassembler();
  private readonly pendingPeerQueue: P2PEnvelope[] = [];

  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private unsubscribeBus: (() => void) | null = null;
  private cachedContent: GameContent | null = null;
  private cachedContentVersion = -1;
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
    this.sendPing();

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

  private sendPing(): void {
    const pingEnv: P2PEnvelope = {
      __mom70: true,
      msgId: generateMsgId(this.playerId),
      sender: this.playerId,
      message: { type: 'PING', payload: { timestamp: Date.now() } },
    };
    this.sendLocal(pingEnv);
    if (this.conn && this.conn.open) {
      try {
        sendOverWebRTC(this.conn, pingEnv);
      } catch {
        // Ignore
      }
    }
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

    let decoded: unknown = raw;
    if (isChunkPacket(raw)) {
      decoded = this.reassembler.push(raw);
      if (!decoded) return;
    }

    let msg: P2PMessage | null = null;
    let wireState: WireGameStateEnvelope | undefined;

    if (isEnvelope(decoded)) {
      if (decoded.sender === this.playerId) return;
      if (this.seenMessages.hasSeenOrAdd(decoded.msgId)) return;
      msg = decoded.message;
      wireState = decoded.wireState;
    } else if (isP2PMessage(decoded)) {
      msg = decoded;
    }

    if (!msg) return;

    if (msg.type === 'GAME_STATE_UPDATE') {
      let resolvedState: GameState | null = msg.payload;

      if (wireState && wireState.__wireState) {
        const unpacked = unpackGameStateFromWire(
          wireState,
          this.cachedContent,
          this.cachedContentVersion
        );
        if (unpacked.needsFullSync || !unpacked.state) {
          // Player missed the content broadcast (e.g. joined mid-game) — request full state
          this.sendPing();
          return;
        }
        if (unpacked.contentUpdated) {
          this.cachedContent = unpacked.state.content;
          this.cachedContentVersion = wireState.contentVersion;
        }
        resolvedState = unpacked.state;
      } else if (resolvedState?.content) {
        this.cachedContent = resolvedState.content;
      }

      if (resolvedState) {
        this.onConnectionChange?.(
          true,
          this.peerConnected ? 'connected' : 'local-only'
        );
        this.onStateUpdate(resolvedState);
      }
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
        sendOverWebRTC(this.conn, next);
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
        sendOverWebRTC(this.conn, env);
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
    this.reassembler.clear();

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
