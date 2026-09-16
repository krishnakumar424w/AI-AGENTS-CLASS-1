import { Tool, ToolSchema, OpenAIToolFormat } from './types.js';

export const MAX_CONSECUTIVE_TOOL_FAILURES = 3;
export const TRACEBACK_CHAR_LIMIT = 800;

export function createTool(
  name: string,
  description: string,
  schema: ToolSchema,
  fn: (args: any) => any
): Tool {
  return {
    name,
    description,
    schema,
    fn,
    toOpenAI(): OpenAIToolFormat {
      return {
        type: 'function',
        function: {
          name: this.name,
          description: this.description,
          parameters: this.schema,
        },
      };
    },
  };
}

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private failures: Map<string, number> = new Map();

  constructor(toolsList?: Tool[]) {
    if (toolsList) {
      for (const t of toolsList) {
        this.register(t);
      }
    }
  }

  register(t: Tool): void {
    this.tools.set(t.name, t);
    this.failures.set(t.name, 0);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  names(): string[] {
    return Array.from(this.tools.keys()).sort();
  }

  schemas(): OpenAIToolFormat[] {
    return Array.from(this.tools.values()).map((t) => t.toOpenAI());
  }

  resetFailures(): void {
    for (const name of this.tools.keys()) {
      this.failures.set(name, 0);
    }
  }

  getFailures(name: string): number {
    return this.failures.get(name) || 0;
  }

  dispatch(name: string, args: Record<string, any>): Record<string, any> {
    // 1. Unknown tool
    const t = this.tools.get(name);
    if (!t) {
      return {
        error: 'UnknownTool',
        message: `No tool named '${name}'.`,
        available_tools: this.names(),
        hint: 'Choose one of the available tools, or answer without a tool.',
      };
    }

    // 2. Circuit breaker
    const currentFailures = this.failures.get(name) || 0;
    if (currentFailures >= MAX_CONSECUTIVE_TOOL_FAILURES) {
      return {
        error: 'ToolDisabled',
        message: `'${name}' has failed ${MAX_CONSECUTIVE_TOOL_FAILURES} times in a row and is no longer available for this run.`,
        hint: 'Do not call this tool again. Report the problem to the user.',
      };
    }

    // 3. Validate required arguments
    for (const req of t.schema.required || []) {
      if (args[req] === undefined || args[req] === null) {
        this.failures.set(name, currentFailures + 1);
        return {
          error: 'InvalidArguments',
          message: `Missing required argument '${req}'.`,
          expected_schema: t.schema,
          hint: 'Correct the arguments to match the schema and call it again.',
        };
      }
    }

    // 4. Execution
    try {
      const result = t.fn(args);
      this.failures.set(name, 0); // success resets failure counter
      return typeof result === 'object' && result !== null ? result : { result };
    } catch (err: any) {
      this.failures.set(name, currentFailures + 1);
      const stack = err?.stack || String(err);
      const truncatedStack = stack.length > TRACEBACK_CHAR_LIMIT
        ? stack.slice(-TRACEBACK_CHAR_LIMIT)
        : stack;

      return {
        error: err?.name || 'Error',
        message: err?.message || String(err),
        traceback: truncatedStack,
        hint: 'Read the error, adjust your approach, and try once more.',
      };
    }
  }
}
