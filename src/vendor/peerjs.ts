export interface DataConnection {
  readonly peer: string;
  readonly open: boolean;
  send(data: unknown): void;
  close(): void;
  on(event: 'open', cb: () => void): this;
  on(event: 'close', cb: () => void): this;
  on(event: 'data', cb: (data: unknown) => void): this;
  on(event: 'error', cb: (err: unknown) => void): this;
  on(event: string, cb: (...args: unknown[]) => void): this;
}

export interface PeerOptions {
  debug?: number;
  [key: string]: unknown;
}

export interface ConnectOptions {
  reliable?: boolean;
  [key: string]: unknown;
}

interface GlobalPeerInstance {
  destroyed?: boolean;
  open?: boolean;
  on(event: string, cb: (...args: unknown[]) => void): void;
  connect(peerId: string, options?: ConnectOptions): DataConnection;
  destroy(): void;
}

type GlobalPeerConstructor = new (id?: string, options?: PeerOptions) => GlobalPeerInstance;

function getGlobalPeerConstructor(): GlobalPeerConstructor | null {
  if (typeof globalThis === 'undefined') return null;
  const candidate = (globalThis as unknown as { Peer?: unknown }).Peer;
  return typeof candidate === 'function' ? (candidate as GlobalPeerConstructor) : null;
}

class FallbackDataConnection implements DataConnection {
  public readonly peer: string;
  public readonly open = false;
  private readonly listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  constructor(peerId: string) {
    this.peer = peerId;
  }

  public send(_data: unknown): void {
    // No-op when WebRTC PeerJS script is unavailable; BroadcastChannel handles local sync.
  }

  public close(): void {
    this.emit('close');
  }

  public on(event: string, cb: (...args: unknown[]) => void): this {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(cb);
    return this;
  }

  public emit(event: string, ...args: unknown[]): void {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(...args);
      } catch {
        // Ignore handler errors
      }
    });
  }
}

class DeferredDataConnection implements DataConnection {
  public readonly peer: string;
  private target: DataConnection | null = null;
  private readonly listeners: Array<{ event: string; cb: (...args: unknown[]) => void }> = [];
  private readonly queue: unknown[] = [];
  private closed = false;

  constructor(peerId: string) {
    this.peer = peerId;
  }

  public get open(): boolean {
    return !this.closed && Boolean(this.target?.open);
  }

  public attach(realConn: DataConnection): void {
    if (this.closed) {
      realConn.close();
      return;
    }
    this.target = realConn;
    for (const { event, cb } of this.listeners) {
      realConn.on(event, cb);
    }
    if (realConn.open) {
      this.flush();
    } else {
      realConn.on('open', () => this.flush());
    }
  }

  private flush(): void {
    if (!this.target?.open) return;
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      this.target.send(item);
    }
  }

  public send(data: unknown): void {
    if (this.closed) return;
    if (this.target?.open) {
      this.target.send(data);
    } else {
      this.queue.push(data);
    }
  }

  public close(): void {
    this.closed = true;
    this.queue.length = 0;
    this.target?.close();
  }

  public on(event: string, cb: (...args: unknown[]) => void): this {
    this.listeners.push({ event, cb });
    this.target?.on(event, cb);
    return this;
  }
}

type PeerEventCallback =
  | ((id: string) => void)
  | ((conn: DataConnection) => void)
  | ((err: { type?: string; message?: string }) => void)
  | (() => void)
  | ((...args: unknown[]) => void);

export default class Peer {
  private readonly id?: string;
  private readonly options?: PeerOptions;
  private readonly listeners: Array<{ event: string; cb: (...args: unknown[]) => void }> = [];
  private readonly pendingConnections: Array<{
    peerId: string;
    options?: ConnectOptions;
    proxy: DeferredDataConnection;
  }> = [];

  private inner: GlobalPeerInstance | null = null;
  private waitTimer: ReturnType<typeof setInterval> | null = null;
  private _destroyed = false;

  constructor(id?: string, options?: PeerOptions) {
    this.id = id;
    this.options = options;

    if (!this.tryAttachGlobalPeer()) {
      this.waitForGlobalPeer();
    }
  }

  public get destroyed(): boolean {
    return this._destroyed || Boolean(this.inner?.destroyed);
  }

  public get open(): boolean {
    return Boolean(this.inner?.open);
  }

  private tryAttachGlobalPeer(): boolean {
    if (this._destroyed || this.inner) return true;
    const PeerCtor = getGlobalPeerConstructor();
    if (!PeerCtor) return false;

    try {
      const instance = new PeerCtor(this.id, this.options);
      this.inner = instance;
      for (const { event, cb } of this.listeners) {
        instance.on(event, cb);
      }
      while (this.pendingConnections.length > 0) {
        const pending = this.pendingConnections.shift();
        if (!pending) continue;
        const realConn = instance.connect(pending.peerId, pending.options);
        pending.proxy.attach(realConn);
      }
      return true;
    } catch (err) {
      this.emitLocal('error', err);
      return true;
    }
  }

  private waitForGlobalPeer(): void {
    let attempts = 0;
    this.waitTimer = setInterval(() => {
      attempts += 1;
      if (this._destroyed) {
        this.clearWaitTimer();
        return;
      }
      if (this.tryAttachGlobalPeer()) {
        this.clearWaitTimer();
        return;
      }
      if (attempts >= 25) {
        this.clearWaitTimer();
        this.emitLocal('error', {
          type: 'network',
          message: 'PeerJS CDN unavailable; continuing with local transport.',
        });
      }
    }, 100);
  }

  private clearWaitTimer(): void {
    if (this.waitTimer) {
      clearInterval(this.waitTimer);
      this.waitTimer = null;
    }
  }

  private emitLocal(event: string, ...args: unknown[]): void {
    for (const entry of this.listeners) {
      if (entry.event === event) {
        try {
          entry.cb(...args);
        } catch {
          // Ignore callback error
        }
      }
    }
  }

  public on(event: 'open', cb: (id: string) => void): this;
  public on(event: 'connection', cb: (conn: DataConnection) => void): this;
  public on(event: 'error', cb: (err: { type?: string; message?: string }) => void): this;
  public on(event: 'disconnected' | 'close', cb: () => void): this;
  public on(event: string, cb: (...args: unknown[]) => void): this;
  public on(event: string, cb: PeerEventCallback): this {
    const wrapped = cb as (...args: unknown[]) => void;
    this.listeners.push({ event, cb: wrapped });
    this.inner?.on(event, wrapped);
    return this;
  }

  public connect(peerId: string, options?: ConnectOptions): DataConnection {
    if (this._destroyed) {
      return new FallbackDataConnection(peerId);
    }
    if (this.inner) {
      return this.inner.connect(peerId, options);
    }
    const proxy = new DeferredDataConnection(peerId);
    this.pendingConnections.push({ peerId, options, proxy });
    return proxy;
  }

  public destroy(): void {
    this._destroyed = true;
    this.clearWaitTimer();
    this.pendingConnections.forEach((p) => p.proxy.close());
    this.pendingConnections.length = 0;
    try {
      this.inner?.destroy();
    } catch {
      // Ignore cleanup error
    }
    this.inner = null;
  }
}
