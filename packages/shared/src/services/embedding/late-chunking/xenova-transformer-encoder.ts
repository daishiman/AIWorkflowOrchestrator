import { EmbeddingError } from "../types/errors";
import type { EncoderOutput, IEncoder } from "./late-chunking-types";
import { OutOfMemoryError } from "./late-chunking-types";

const DEFAULT_MODEL = "Xenova/all-MiniLM-L6-v2";

function convertOffsetTensor(tensor: {
  data: ArrayLike<number>;
}): [number, number][] {
  const flat = Array.from(tensor.data);
  const result: [number, number][] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    result.push([flat[i]!, flat[i + 1]!]);
  }
  return result;
}

function sliceHiddenStates(tensor: {
  dims: [number, number, number];
  data: Float32Array;
}): Float32Array[] {
  const seqLen = tensor.dims[1];
  const hiddenSize = tensor.dims[2];
  return Array.from({ length: seqLen }, (_, i) =>
    tensor.data.slice(i * hiddenSize, (i + 1) * hiddenSize),
  );
}

function classifyError(
  cause: unknown,
  ctx: "load" | "encode",
  model: string,
): Error {
  if (cause instanceof EmbeddingError) return cause;

  const msg = cause instanceof Error ? cause.message : String(cause);
  if (cause instanceof RangeError || /out of memory|oom/i.test(msg)) {
    return new OutOfMemoryError(
      ctx === "load"
        ? "モデル読み込み中にメモリ不足が発生しました"
        : "テキストエンコード中にメモリ不足が発生しました",
      { cause },
    );
  }

  return new EmbeddingError(
    ctx === "load"
      ? `モデルの読み込みに失敗しました: ${model}`
      : "テキストのエンコードに失敗しました",
    { cause },
  );
}

export class XenovaTransformerEncoder implements IEncoder {
  private readonly modelName: string;
  private tokenizer: unknown = null;
  private model: unknown = null;
  private loadingPromise: Promise<void> | null = null;

  constructor(modelName: string = DEFAULT_MODEL) {
    this.modelName = modelName;
  }

  private async loadModel(): Promise<void> {
    if (this.tokenizer && this.model) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      try {
        const { AutoTokenizer, AutoModel } =
          await import("@xenova/transformers");
        this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
        this.model = await AutoModel.from_pretrained(this.modelName, {
          output_hidden_states: true,
        } as Record<string, unknown>);
      } catch (cause) {
        this.loadingPromise = null;
        throw classifyError(cause, "load", this.modelName);
      }
    })();

    return this.loadingPromise;
  }

  async encode(text: string): Promise<EncoderOutput> {
    await this.loadModel();

    let inputs: { offset_mapping: { data: ArrayLike<number> } };
    let offsetMapping: [number, number][];
    try {
      const tok = this.tokenizer as (
        text: string,
        opts: unknown,
      ) => { offset_mapping: { data: ArrayLike<number> } };
      inputs = tok(text, { return_offsets_mapping: true });
      offsetMapping = convertOffsetTensor(inputs.offset_mapping);
    } catch (cause) {
      throw classifyError(cause, "encode", this.modelName);
    }

    const mdl = this.model as (inputs: unknown) => Promise<unknown>;
    let outputs: unknown;
    try {
      outputs = await mdl(inputs);
    } catch (cause) {
      throw classifyError(cause, "encode", this.modelName);
    }

    const out = outputs as {
      last_hidden_state?: {
        dims: [number, number, number];
        data: Float32Array;
      };
      hidden_states?: Array<{
        dims: [number, number, number];
        data: Float32Array;
      }>;
    };
    const lastHiddenState = out.last_hidden_state ?? out.hidden_states?.at(-1);

    if (!lastHiddenState) {
      throw new EmbeddingError(
        "モデルの出力から hidden states を取得できませんでした",
      );
    }

    const hiddenStates = sliceHiddenStates(lastHiddenState);
    return { hiddenStates, offsetMapping };
  }
}
