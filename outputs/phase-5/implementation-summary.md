# Phase 5: 実装概要 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## 実装の概要

`inferSmartDefaults` 関数を含むスマートデフォルト推論サービスを新規実装した。
ユーザーが入力した `purpose`（目的）と `category`（カテゴリ）から、
スキルウィザード Step 1 の 6 問分の初期値を自動推論する純粋関数。

## 実装ファイル

| ファイル                                                                    | 変更種別 | 内容                                         |
| --------------------------------------------------------------------------- | -------- | -------------------------------------------- |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` | 新規作成 | 推論サービス本体（142行）                    |
| `packages/shared/src/services/skillCreator/index.ts`                        | 更新     | `inferSmartDefaults` を barrel export に追加 |

## 推論ロジック

### 定数定義

```typescript
const TOOL_KEYWORDS = [
  { keyword: "Slack", tool: "slack" },
  { keyword: "GitHub", tool: "github" },
  { keyword: "Notion", tool: "notion" },
];
const SCHEDULED_PATTERN = /毎日|毎週|定期|スケジュール/;
const REALTIME_PATTERN = /リアルタイム|即座|すぐに/;
```

キーワードの追加・変更は `TOOL_KEYWORDS` 定数のみを修正すれば済む設計。

### 3ヘルパー関数

| 関数名                  | 役割                                                                             | 推論対象            |
| ----------------------- | -------------------------------------------------------------------------------- | ------------------- |
| `inferTool(purpose)`    | TOOL_KEYWORDS を先頭から順に評価し、最初に一致したツール名を返す（先勝ちルール） | `tool` フィールド   |
| `inferTiming(purpose)`  | SCHEDULED_PATTERN → REALTIME_PATTERN の順に正規表現マッチ                        | `timing` フィールド |
| `inferFormat(category)` | category の値で条件分岐                                                          | `format` フィールド |

補助関数:

- `normalizePurpose(value)`: null/undefined/空白のみの文字列を空文字に正規化
- `createEmptyResult()`: 全フィールド null の初期値オブジェクトを生成

### 推論フロー

1. `normalizePurpose` で purpose を正規化
2. purpose が非空なら `inferTool` → `inferTiming` を実行
3. purpose に関わらず `inferFormat` を実行（category は独立推論）
4. 推論できたフィールドのログを `inferenceLog` に記録
5. 全フィールドと `inferenceLog` をまとめて返却

## barrel export 追加

```typescript
// packages/shared/src/services/skillCreator/index.ts
export { inferSmartDefaults } from "./smartDefaultReasoningService";
```

テストは `@repo/shared` 経由でインポートすることで barrel の整合性も検証。
