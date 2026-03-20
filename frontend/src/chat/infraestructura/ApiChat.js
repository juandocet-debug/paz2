/**
 * ApiChat.js — Adaptador de infraestructura para la API de chat.
 */
import { enviar } from '../../compartido/infraestructura/ClienteHttp.js';

export function enviarMensaje(message, history = []) {
  return enviar('/chat', { message, history });
}
