declare module "@xenova/transformers" {
  export class AutoTokenizer {
    static from_pretrained(modelName: string): Promise<AutoTokenizer>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tokenize(text: string, options?: Record<string, unknown>): any;

    decode(ids: number[]): string;
  }

  export class AutoModel {
    static from_pretrained(
      modelName: string,
      options?: Record<string, unknown>,
    ): Promise<AutoModel>;
  }
}
