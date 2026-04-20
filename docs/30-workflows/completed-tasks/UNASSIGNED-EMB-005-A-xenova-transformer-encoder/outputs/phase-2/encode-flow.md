# encode() 内部フロー図と擬似コード

## フロー図

```
encode(text)
  ├─ await loadModel()
  │     ├─ if (tokenizer && model) return        ← 冪等ガード
  │     ├─ if (loadingPromise) return loadingPromise ← 並行ガード
  │     ├─ loadingPromise = _doLoad()
  │     │     ├─ const { AutoTokenizer, AutoModel } = await import("@xenova/transformers")
  │     │     ├─ tokenizer = await AutoTokenizer.from_pretrained(modelName)
  │     │     └─ model = await AutoModel.from_pretrained(modelName, { output_hidden_states: true })
  │     └─ catch(cause) → classifyError(cause, "load", modelName) → throw
  │
  ├─ inputs = tokenizer(text, { return_offsets_mapping: true })
  │
  ├─ offsetMapping = convertOffsetTensor(inputs.offset_mapping)
  │     └─ flat [s0,e0,s1,e1,...] → [number,number][]
  │
  ├─ outputs = await model(inputs)
  │
  ├─ lastHiddenState = outputs.last_hidden_state ?? outputs.hidden_states?.at(-1)
  │
  ├─ if (!lastHiddenState) throw EmbeddingError("hidden states 取得失敗")
  │
  ├─ hiddenStates = sliceHiddenStates(lastHiddenState)
  │     └─ [batch=1, seqLen, hiddenSize] → Float32Array[] (length=seqLen)
  │
  └─ return { hiddenStates, offsetMapping }   ← Promise<EncoderOutput> AC-2
```

## 擬似コード（詳細）

```typescript
async encode(text: string): Promise<EncoderOutput> {
  await this.loadModel();

  // トークナイズ（offset_mapping を要求）
  const tok = this.tokenizer as { (text: string, opts: unknown): unknown };
  const inputs = tok(text, { return_offsets_mapping: true }) as {
    offset_mapping: { data: ArrayLike<number> };
  };

  // offset変換: flat → [number,number][]
  const offsetMapping = convertOffsetTensor(inputs.offset_mapping);

  // 推論
  const mdl = this.model as { (inputs: unknown): Promise<unknown> };
  let outputs: unknown;
  try {
    outputs = await mdl(inputs);
  } catch (cause) {
    throw classifyError(cause, "encode", this.modelName);
  }

  // hidden states 取得（fallback 付き）
  const out = outputs as {
    last_hidden_state?: { dims: [number, number, number]; data: Float32Array };
    hidden_states?: Array<{ dims: [number, number, number]; data: Float32Array }>;
  };
  const lastHiddenState = out.last_hidden_state ?? out.hidden_states?.at(-1);
  if (!lastHiddenState) {
    throw new EmbeddingError("モデルの出力から hidden states を取得できませんでした");
  }

  // hiddenStates スライス: [1, seqLen, hiddenSize] → Float32Array[]
  const hiddenStates = sliceHiddenStates(lastHiddenState);

  return { hiddenStates, offsetMapping };
}
```

## loadModel 擬似コード

```typescript
private async loadModel(): Promise<void> {
  if (this.tokenizer && this.model) return;
  if (this.loadingPromise) return this.loadingPromise;
  this.loadingPromise = (async () => {
    try {
      const { AutoTokenizer, AutoModel } = await import("@xenova/transformers");
      this.tokenizer = await AutoTokenizer.from_pretrained(this.modelName);
      this.model = await AutoModel.from_pretrained(this.modelName, {
        output_hidden_states: true,
      });
    } catch (cause) {
      this.loadingPromise = null; // 失敗時はリセット（再試行可能に）
      throw classifyError(cause, "load", this.modelName);
    }
  })();
  return this.loadingPromise;
}
```

## 最終 return の型保証（AC-2）

```typescript
return {
  hiddenStates, // Float32Array[] ← sliceHiddenStates の戻り値型
  offsetMapping, // [number, number][] ← convertOffsetTensor の戻り値型
};
// 型は Promise<EncoderOutput> に推論される
```
