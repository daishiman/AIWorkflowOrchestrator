# Phase 1: 確定要件仕様

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | UT-06-001  |
| Phase    | 1          |
| 作成日   | 2026-03-16 |
| Issue    | #1251      |

## 1. 確定型定義

### RiskLevel 型

```typescript
export type RiskLevel = "low" | "medium" | "high";
```

- 3段階のリスクレベル分類
- Issue #1251 の受入基準に準拠

### ToolRiskConfigEntry interface

```typescript
export interface ToolRiskConfigEntry {
  dialogWidth: 400 | 480 | 640;
  headerColorToken: string;
  allowPermanent: boolean;
  allowTime24h: boolean;
  allowTime7d: boolean;
}
```

- 5フィールド、全て必須（optional なし）

### TOOL_RISK_CONFIG 定数

```typescript
export const TOOL_RISK_CONFIG: Record<RiskLevel, ToolRiskConfigEntry>;
```

## 2. 各リスクレベルの確定値

| フィールド       | low          | medium          | high          |
| ---------------- | ------------ | --------------- | ------------- |
| dialogWidth      | 400          | 480             | 640           |
| headerColorToken | `--risk-low` | `--risk-medium` | `--risk-high` |
| allowPermanent   | true         | true            | false         |
| allowTime24h     | true         | true            | false         |
| allowTime7d      | true         | true            | false         |

## 3. セキュリティ不変条件

以下の3条件はセキュリティ上変更禁止。テストで保証する:

1. `TOOL_RISK_CONFIG.high.allowPermanent === false`（恒久許可禁止）
2. `TOOL_RISK_CONFIG.high.allowTime24h === false`（24時間許可禁止）
3. `TOOL_RISK_CONFIG.high.allowTime7d === false`（7日間許可禁止）

根拠: フェイルセキュア原則（`.claude/rules/04-electron-security.md`）

## 4. Inventory（変更対象ファイル）

| ファイル                                         | 変更種別 | 内容                                                                    |
| ------------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `packages/shared/src/constants/security.ts`      | 更新     | RiskLevel型、ToolRiskConfigEntry interface、TOOL_RISK_CONFIG 定数を追加 |
| `packages/shared/src/constants/security.test.ts` | 新規     | 単体テスト（9件 + 補完テスト）                                          |
| `packages/shared/src/constants/index.ts`         | 更新     | re-export 追加（RiskLevel, ToolRiskConfigEntry, TOOL_RISK_CONFIG）      |

## 5. エクスポート要件

- `RiskLevel` 型: named export from `security.ts` + re-export from `index.ts`
- `ToolRiskConfigEntry` interface: named export from `security.ts` + re-export from `index.ts`
- `TOOL_RISK_CONFIG` 定数: named export from `security.ts` + re-export from `index.ts`
- 後続タスク UT-06-004 が `@repo/shared` から import して使用可能であること

## 6. 後続タスクへの型エクスポート要件

| 後続タスク                   | 使用シンボル                                           | import パス    |
| ---------------------------- | ------------------------------------------------------ | -------------- |
| UT-06-004 (PermissionDialog) | `TOOL_RISK_CONFIG`, `RiskLevel`, `ToolRiskConfigEntry` | `@repo/shared` |
| TASK-SKILL-LIFECYCLE-08      | `TOOL_RISK_CONFIG`, `RiskLevel`                        | `@repo/shared` |
