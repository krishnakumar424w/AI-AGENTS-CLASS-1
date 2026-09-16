import { Message } from './types.js';

export const TOOL_RESULT_CHAR_LIMIT = 2000;

export function capToolOutput(payload: Record<string, any>): string {
  const text = JSON.stringify(payload);
  if (text.length <= TOOL_RESULT_CHAR_LIMIT) {
    return text;
  }

  return JSON.stringify({
    truncated: true,
    original_length: text.length,
    preview: text.slice(0, TOOL_RESULT_CHAR_LIMIT),
    hint: 'Output was truncated. Narrow your query if you need the rest.',
  });
}

export class ConversationStore {
  private threadsMap: Map<string, Message[]> = new Map();
  public keepLast: number;

  constructor(keepLast: number = 20) {
    this.keepLast = keepLast;
  }

  load(threadId: string): Message[] {
    const list = this.threadsMap.get(threadId) || [];
    return JSON.parse(JSON.stringify(list));
  }

  save(threadId: string, messages: Message[]): void {
    this.threadsMap.set(threadId, this.trim(messages));
  }

  clear(threadId: string): void {
    this.threadsMap.delete(threadId);
  }

  threads(): string[] {
    return Array.from(this.threadsMap.keys()).sort();
  }

  trim(messages: Message[]): Message[] {
    if (messages.length <= this.keepLast + 1) {
      return [...messages];
    }

    const system = messages.length > 0 && messages[0].role === 'system' ? [messages[0]] : [];
    const body = messages.slice(system.length);

    let cut = Math.max(0, body.length - this.keepLast);
    // Walk forward past any orphan tool messages so we never break tool/tool_calls pairing!
    while (cut < body.length && body[cut].role === 'tool') {
      cut++;
    }

    return [...system, ...body.slice(cut)];
  }
}
