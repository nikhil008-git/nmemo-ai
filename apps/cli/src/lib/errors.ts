export class NmemoError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "NmemoError";
    }
  }
  
  export function messageFromError(error: unknown): string {
    return error instanceof Error ? error.message : "Unexpected error";
  }