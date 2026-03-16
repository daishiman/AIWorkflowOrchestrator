# ToolRiskConfig 実装 - タスク指示書

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UT-06-001                                        |
| タスク名     | ToolRiskConfig 実装                              |
| 分類         | 実装                                             |
| 対象機能     | セキュリティ定数 / Trust & Permission Governance |
| 優先度       | 高                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 依存タスク   | TASK-SKILL-LIFECYCLE-08                          |
| 発見元       | TASK-SKILL-LIFECYCLE-06 Phase 12（未タスク検出） |
| 発見日       | 2026-03-16                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-06（Trust & Permission Governance 仕様策定）の Phase 5 で設計された `TOOL_RISK_CONFIG` 定数の実装が、スコープの都合により本タスクに分割された。Phase 5 の `outputs/phase-5/security.ts` にプロトタイプ定義が存在するが、`packages/shared/src/constants/security.ts` への本番実装と、dialogWidth / headerColorToken の確定値割り当てが未完了である。

### 1.2 問題点・課題

- `TOOL_RISK_CONFIG` が未実装のため、PermissionDialog コンポーネントがリスクレベルに応じたダイアログ幅・ヘッダー色を動的に選択できない
- `dialogWidth` の割り当て（400 / 480 / 640px）と `headerColorToken`（CSS変数名）が設計レベルで未確定
- TASK-SKILL-LIFECYCLE-08 での UI 実装が本定数に依存するため、先行して確定が必要

### 1.3 放置した場合の影響

- PermissionDialog がリスクレベルを無視した固定スタイルで表示される
- TASK-SKILL-LIFECYCLE-08 でのUI実装に設計の曖昧さが波及する
- テストコードの期待値が設計根拠なく決定されるリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

`packages/shared/src/constants/security.ts` に `TOOL_RISK_CONFIG` 定数を実装し、riskLevel ごとの dialogWidth・headerColorToken・allowPermanent 設定を確定する。

### 2.2 最終ゴール

- `TOOL_RISK_CONFIG` が型安全に定義されている（`Record<RiskLevel, ToolRiskConfigEntry>` 型）
- dialogWidth が low:400 / medium:480 / high:640 で割り当てられている
- headerColorToken が CSS 変数名（例: `--risk-low`, `--risk-medium`, `--risk-high`）として確定している
- 単体テストが追加されている（設定値の検証）

### 2.3 スコープ

#### 含むもの

- `packages/shared/src/constants/security.ts` への `TOOL_RISK_CONFIG` 実装
- `TOOL_RISK_CONFIG` の型定義（`ToolRiskConfigEntry` interface）
- 単体テスト追加

#### 含まないもの

- PermissionDialog コンポーネントへの `TOOL_RISK_CONFIG` 適用（TASK-SKILL-LIFECYCLE-08 のスコープ）
- CSS変数の実際の値定義（tailwind.config.js / globals.css）

### 2.4 成果物

- 更新された `packages/shared/src/constants/security.ts`
- 追加または更新されたテストファイル `packages/shared/src/constants/security.test.ts`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-06 が完了していること
- `packages/shared` パッケージのビルドが通ること

### 3.2 依存タスク

| タスクID                | タスク名                      | ステータス |
| ----------------------- | ----------------------------- | ---------- |
| TASK-SKILL-LIFECYCLE-06 | Trust & Permission Governance | 完了       |
| TASK-SKILL-LIFECYCLE-08 | UI実装（本タスクの後続）      | 未実施     |

### 3.3 必要な知識

- TypeScript 型定義（Record, interface）
- `packages/shared` の構成
- Phase 4 の `decision-table-risk-permission.md` に記載された設計根拠

### 3.4 推奨アプローチ

Phase 5 の `outputs/phase-5/security.ts` を参照し、以下の構造で実装する。

```typescript
// packages/shared/src/constants/security.ts

export type RiskLevel = "low" | "medium" | "high";

export interface ToolRiskConfigEntry {
  dialogWidth: 400 | 480 | 640;
  headerColorToken: string; // CSS変数名 e.g. '--risk-low'
  allowPermanent: boolean;
  allowTime24h: boolean;
  allowTime7d: boolean;
}

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

---

## 4. 実行手順

### Phase 1: 設計確認と定数実装

#### 目的

Phase 4 / Phase 5 の設計を参照して確定値を決定し、`security.ts` に実装する。

#### 手順

1. `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md` を参照して dialogWidth と headerColorToken の設計根拠を確認
2. `outputs/phase-5/security.ts` のプロトタイプ定義を確認
3. `packages/shared/src/constants/security.ts` に `TOOL_RISK_CONFIG` を実装
4. `packages/shared` をビルドして型エラーがないことを確認

#### 成果物

- 更新された `packages/shared/src/constants/security.ts`

#### 完了条件

- [ ] `TOOL_RISK_CONFIG` が `Record<RiskLevel, ToolRiskConfigEntry>` 型で定義されている
- [ ] dialogWidth が low:400 / medium:480 / high:640 で設定されている
- [ ] `allowPermanent` が high では false になっている
- [ ] `pnpm --filter @repo/shared build` が通ること

### Phase 2: テスト追加

#### 目的

`TOOL_RISK_CONFIG` の設定値が正しいことを検証するテストを追加する。

#### 手順

1. `packages/shared/src/constants/security.test.ts` を作成または更新
2. 各 riskLevel の設定値を検証するテストを追加
3. `pnpm --filter @repo/shared test` を実行して全テスト PASS を確認

#### 成果物

- `packages/shared/src/constants/security.test.ts`

#### 完了条件

- [ ] 全テストが PASS する
- [ ] `TOOL_RISK_CONFIG.high.allowPermanent === false` を検証するテストがある
- [ ] `TOOL_RISK_CONFIG.high.allowTime24h === false` を検証するテストがある

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `TOOL_RISK_CONFIG` が `packages/shared` に実装されている
- [ ] `RiskLevel` 型が export されている
- [ ] `ToolRiskConfigEntry` interface が export されている
- [ ] dialogWidth が low:400 / medium:480 / high:640 に設定されている
- [ ] headerColorToken が CSS変数名形式（`--risk-*`）で設定されている
- [ ] `allowPermanent` が high のみ false になっている

### 品質要件

- [ ] TypeScript 型エラーが 0 件
- [ ] ESLint エラーが 0 件
- [ ] 単体テストが PASS する

### ドキュメント要件

- [ ] `TOOL_RISK_CONFIG` の各フィールドに JSDoc コメントが付与されている

---

## 6. 検証方法

### テストコマンド

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/shared test
```

### 検証手順

1. ビルドが通ること
2. テストが全 PASS すること
3. `TOOL_RISK_CONFIG.high.allowPermanent` が `false` であること

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                     |
| ------------------------------------ | ------ | -------- | ---------------------------------------- |
| dialogWidth の設計根拠が不明確       | 中     | 低       | Phase 4 の decision-table を必ず参照する |
| TASK-SKILL-LIFECYCLE-08 との設計乖離 | 中     | 中       | UT-06-004 と同時着手して整合性を確認する |

---

## 8. 参照情報

### 関連ドキュメント

| 参照資料             | パス                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 5 プロトタイプ | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/security.ts`                       |
| Phase 4 設計テーブル | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md` |
| Phase 2 設計書       | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/`                                  |

---

## 9. 備考

### 関連タスク

| タスクID  | 関係性                         |
| --------- | ------------------------------ |
| UT-06-004 | 後続（UI実装でこの定数を参照） |
| UT-06-006 | 後続（テスト追加）             |
| UT-06-007 | 後続（テスト追加）             |

### 補足事項

- riskLevel は全て小文字（`'low'`/`'medium'`/`'high'`）で統一すること（DI-05 準拠）
- TASK-SKILL-LIFECYCLE-08 着手前に本タスクを完了すること
