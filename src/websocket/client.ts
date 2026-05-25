import { atom } from 'nanostores';
import type { WsEvent } from '../types';

export type WsConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

let ws: WebSocket | null = null;
let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let currentUrl = '';
let currentProjectId = '';
let intentionalClose = false;
let listeners: Map<string, Set<(payload: Record<string, unknown>) => void>> = new Map();

export const $wsStatus = atom<WsConnectionState>('disconnected');
export const $wsUrl = atom('');
export const $wsProjectId = atom('');

export function connectWs(url: string, projectId: string) {
  if (ws && ws.readyState === WebSocket.OPEN && currentProjectId === projectId) return;

  intentionalClose = false;
  currentUrl = url;
  currentProjectId = projectId;
  $wsUrl.set(url);
  $wsProjectId.set(projectId);
  reconnectAttempt = 0;

  doConnect();
}

function doConnect() {
  if (!currentUrl || !currentProjectId) return;

  intentionalClose = false;
  const url = `${currentUrl}?projectId=${currentProjectId}`;
  $wsStatus.set(reconnectAttempt > 0 ? 'reconnecting' : 'connecting');

  try {
    ws = new WebSocket(url);
  } catch {
    scheduleReconnect();
    return;
  }

  ws.onopen = () => {
    reconnectAttempt = 0;
    $wsStatus.set('connected');
  };

  ws.onmessage = (event) => {
    try {
      const msg: WsEvent = JSON.parse(event.data);
      const eventListeners = listeners.get(msg.type);
      if (eventListeners) {
        eventListeners.forEach((cb) => cb(msg.payload));
      }
      // Also dispatch to wildcard listeners
      const allListeners = listeners.get('*');
      if (allListeners) {
        allListeners.forEach((cb) => cb(msg as unknown as Record<string, unknown>));
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    if (!intentionalClose) {
      $wsStatus.set('disconnected');
      scheduleReconnect();
    }
  };

  ws.onerror = () => {
    ws?.close();
  };
}

function scheduleReconnect() {
  if (intentionalClose) return;
  const delay = Math.min(RECONNECT_BASE_MS * Math.pow(2, reconnectAttempt), RECONNECT_MAX_MS);
  reconnectAttempt++;
  $wsStatus.set('reconnecting');
  reconnectTimer = setTimeout(() => doConnect(), delay);
}

export function disconnectWs() {
  intentionalClose = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  ws?.close();
  ws = null;
  $wsStatus.set('disconnected');
}

export function onWsEvent(type: string, callback: (payload: Record<string, unknown>) => void): () => void {
  if (!listeners.has(type)) {
    listeners.set(type, new Set());
  }
  listeners.get(type)!.add(callback);
  return () => {
    listeners.get(type)?.delete(callback);
  };
}
