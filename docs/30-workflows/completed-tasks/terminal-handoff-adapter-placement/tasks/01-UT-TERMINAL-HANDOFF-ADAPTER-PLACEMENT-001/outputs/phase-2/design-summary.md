# Phase 2: 設計書

## 配置先選定

候補 C（`apps/desktop/src/main/adapters/handoff/`）を採用。

選定理由:

1. 既存パターン（`adapters/llm/`）との一貫性
2. Main → shared の一方向依存を維持
3. Consumer 集約: C1-C3 の全変換ロジックを1モジュールに集約
4. import サイクル回避

## ディレクトリ構成

```text
apps/desktop/src/main/adapters/handoff/
  index.ts                      # re-export
  toHandoffGuidance.ts          # adapter 関数本体
  types.ts                      # adapter 固有の型定義
  __tests__/
    toHandoffGuidance.test.ts   # ユニットテスト
```

## インターフェース設計

### adapter 関数シグネチャ

```typescript
export function toHandoffGuidance(
  source: HandoffSource,
  reason: string,
): HandoffGuidance;
```

### 入力型（Discriminated Union）

```typescript
type HandoffSource =
  | ChatEditHandoffSource
  | AgentHandoffSource
  | SkillHandoffSource
  | BundleHandoffSource;
```

4つの kind: `"chat-edit"`, `"agent"`, `"skill"`, `"bundle"`

### 変換ロジック

switch (source.kind) による exhaustive check 分岐で kind 別 build 関数に委譲。

## セキュリティ設計

4種 shell injection 対策エスケープ + 機密情報（API キーパターン）のサニタイズ。

## 既存コード統合方針

段階的移行（破壊的変更なし）。既存 TerminalHandoffBuilder はそのまま維持。
