# Phase 2: メソッドシグネチャ設計

## runUpdateWorkflow

```typescript
private async runUpdateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<void>
```

- Phase 5 ではスタブ実装（`logger.warn` のみ）
- AbortSignal を受け取り、`this.throwIfAborted(signal)` で abort チェック
- エラーハンドリング: AbortError は再スロー、その他は `this.logger.warn` + 継続

## runImprovePromptWorkflow

```typescript
private async runImprovePromptWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<void>
```

- Phase 5 ではスタブ実装（`logger.warn` のみ）
- AbortSignal を受け取り、`this.throwIfAborted(signal)` で abort チェック
- エラーハンドリング: AbortError は再スロー、その他は `this.logger.warn` + 継続

## 設計根拠

- `runCreateWorkflow` と同一シグネチャパターン（options + signal）を採用し一貫性を保つ
- 戻り値を `Promise<void>` とすることで、将来の実装拡張時に戻り値を追加しやすい
- `CreateSkillOptions` 型は既存のインポートをそのまま使用
