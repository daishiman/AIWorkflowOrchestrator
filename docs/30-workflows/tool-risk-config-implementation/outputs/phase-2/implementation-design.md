# Phase 2: 実装設計書

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | UT-06-001  |
| Phase    | 2          |
| 作成日   | 2026-03-16 |

## 1. TOOL_RISK_CONFIG 定数の設計

```typescript
/**
 * リスクレベル別の動作設定マップ
 *
 * @remarks
 * セキュリティ不変条件:
 * - `TOOL_RISK_CONFIG.high.allowPermanent === false`（恒久許可禁止）
 * - `TOOL_RISK_CONFIG.high.allowTime24h === false`（24時間許可禁止）
 * - `TOOL_RISK_CONFIG.high.allowTime7d === false`（7日間許可禁止）
 *
 * dialogWidth はリスクレベルに比例して大きくなり、ユーザーに操作の重大性を視覚的に伝える。
 * headerColorToken は CSS 変数名で、PermissionDialog のヘッダー背景色を決定する。
 *
 * @see Phase 4 デシジョンテーブル（decision-table-risk-permission.md）
 */
export const TOOL_RISK_CONFIG: Record<RiskLevel, ToolRiskConfigEntry> = {
  low: {
    dialogWidth: 400,
    headerColorToken: "--risk-low",
    allowPermanent: true,
    allowTime24h: true,
    allowTime7d: true,
  },
  medium: {
    dialogWidth: 480,
    headerColorToken: "--risk-medium",
    allowPermanent: true,
    allowTime24h: true,
    allowTime7d: true,
  },
  high: {
    dialogWidth: 640,
    headerColorToken: "--risk-high",
    allowPermanent: false,
    allowTime24h: false,
    allowTime7d: false,
  },
};
```

## 2. security.ts 内の配置位置

### ファイル構成（更新後）

| セクション                       | 行範囲（概算）    | 内容                                                   |
| -------------------------------- | ----------------- | ------------------------------------------------------ |
| 危険パターン定義                 | L1-99             | `DANGEROUS_PATTERNS`                                   |
| ホワイトリスト                   | L100-123          | `ALLOWED_TOOLS_WHITELIST`, `AllowedTool` 型            |
| **ツールリスク設定（新規追加）** | L124-174（概算）  | `RiskLevel`, `ToolRiskConfigEntry`, `TOOL_RISK_CONFIG` |
| ユーティリティ関数               | L175-323+（概算） | `isDangerousCommand` 等5関数                           |

### 配置ルール

- `ALLOWED_TOOLS_WHITELIST` 定数と `AllowedTool` 型の直後（L124付近）に配置
- セクションコメントで区切る: `// --- Tool Risk Configuration ---`
- 既存コードは一切変更しない（追記のみ）

## 3. エクスポート構成

### security.ts からの named export

```typescript
export type RiskLevel = ...;
export interface ToolRiskConfigEntry { ... }
export const TOOL_RISK_CONFIG: Record<RiskLevel, ToolRiskConfigEntry> = { ... };
```

### constants/index.ts の re-export

現在の `index.ts` は個別 export 方式:

```typescript
export {
  DANGEROUS_PATTERNS,
  ALLOWED_TOOLS_WHITELIST,
  isDangerousCommand,
  isProtectedPath,
  matchGlobPattern,
  validateAllowedTools,
  filterAllowedTools,
} from "./security";
export type { AllowedTool } from "./security";
```

追加する re-export:

```typescript
export { TOOL_RISK_CONFIG } from "./security";
export type { RiskLevel, ToolRiskConfigEntry } from "./security";
```

### @repo/shared のメインエントリポイント

`packages/shared/src/index.ts` が `./constants` を re-export していれば、`@repo/shared` から直接 import 可能。確認が必要。
