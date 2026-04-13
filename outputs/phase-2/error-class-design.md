# Phase 2: エラークラス設計

## InvalidConfigError

```typescript
export class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConfigError";
  }
}
```

- `Error` を継承
- `this.name = "InvalidConfigError"` でインスタンス識別を可能にする
- `export` で外部（テスト・呼び出し側）から import 可能
- 配置: `cronConverter.ts` の先頭（import の直後）
