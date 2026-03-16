# Phase 5: 実装（Green状態） - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | 実装（Green状態）               |
| タスクID   | UT-06-001                       |
| 前提Phase  | Phase 4（テスト作成）           |
| 後続Phase  | Phase 6（テスト拡充）           |
| ステータス | 未実施                          |
| 作成日     | 2026-03-16                      |
| 機能名     | tool-risk-config-implementation |

---

## 目的

`packages/shared/src/constants/security.ts` に `RiskLevel` 型・`ToolRiskConfigEntry` interface・`TOOL_RISK_CONFIG` 定数を追加し、Phase 4 で作成したテスト9件を全件 PASS（Green状態）にする。TDD の Red → Green → Refactor サイクルの第2ステップを完了する。

---

## 背景

Phase 4 で作成したテストファイルは現在 Red 状態（全9件失敗）である。本 Phase ではプロダクションコードを追加することで Green 状態に移行する。実装は Phase 2 で設計した型定義・定数値に従い、既存の `security.ts`（323行）に追記する。既存のコードは変更しない。

---

## 実行タスク

### タスク1: security.ts への型定義・定数追加

**目的**: `security.ts` に `RiskLevel` 型、`ToolRiskConfigEntry` interface、`TOOL_RISK_CONFIG` 定数を追加する。

**実行手順**:

1. `packages/shared/src/constants/security.ts` の現在の末尾（L323）を確認する

2. `security.ts` のファイル末尾（`filterAllowedTools` 関数定義の直後、L323 の後）に以下のコードブロックを追加する。`as const satisfies` は使用しない（`Record<RiskLevel, ToolRiskConfigEntry>` 型アノテーションで型安全性は十分に確保される）:

   ```typescript
   // ─── Tool Risk Configuration ──────────────────────────────────────────────────

   /**
    * ツール操作のリスクレベル分類
    *
    * @remarks
    * - low: 読み取り系・安全な操作（Read, Glob, Grep, WebSearch）
    * - medium: 書き込み系・変更を伴う操作（Write, Edit）
    * - high: 破壊的・不可逆な操作（Bash による外部コマンド・スクリプト実行）
    */
   export type RiskLevel = "low" | "medium" | "high";

   /**
    * リスクレベルごとのダイアログ・権限設定エントリ
    */
   export interface ToolRiskConfigEntry {
     /** PermissionDialog の表示幅（px）。リスクが高いほど大きい */
     dialogWidth: 400 | 480 | 640;
     /** ダイアログヘッダーの色トークン（CSS変数名、例: "--risk-low"） */
     headerColorToken: string;
     /** 「常に許可」ボタンの表示可否。high リスクでは false（恒久許可禁止） */
     allowPermanent: boolean;
     /** 「24時間許可」ボタンの表示可否。high リスクでは false（時間制限許可禁止） */
     allowTime24h: boolean;
     /** 「7日間許可」ボタンの表示可否。high リスクでは false（時間制限許可禁止） */
     allowTime7d: boolean;
   }

   /**
    * リスクレベル別の動作設定マップ
    *
    * @remarks
    * セキュリティ不変条件:
    * - `high.allowPermanent === false`: high リスクの恒久許可は禁止
    * - `high.allowTime24h === false`: high リスクの24時間許可は禁止
    * - `high.allowTime7d === false`: high リスクの7日間許可は禁止
    *
    * dialogWidth はリスクレベルに比例して大きくなり、ユーザーに操作の重大性を視覚的に伝える。
    * headerColorToken は CSS 変数名で、PermissionDialog のヘッダー背景色を決定する。
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

3. ファイル保存後、TypeScript のビルドエラーがないことを確認する:

   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175921-wt-3
   pnpm --filter @repo/shared build 2>&1 | tail -20
   ```

**期待される成果物**:

- `packages/shared/src/constants/security.ts`（型定義・定数追加済み）

---

### タスク2: テストを実行して Green 状態を確認

**目的**: Phase 4 で作成したテスト9件が全件 PASS することを確認する。

**実行手順**:

1. テストを実行する:

   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175921-wt-3
   pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts --reporter=verbose
   ```

2. 実行結果を確認し、全9件 PASS であることを検証する:
   - `キー網羅性 > RiskLevel の全3キーが存在する`: PASS
   - `dialogWidth 値検証 > low の dialogWidth は 400`: PASS
   - `dialogWidth 値検証 > medium の dialogWidth は 480`: PASS
   - `dialogWidth 値検証 > high の dialogWidth は 640`: PASS
   - `headerColorToken 形式検証 > 全エントリが '--risk-' プレフィックスを持つ`: PASS
   - `セキュリティ不変条件 > high.allowPermanent は false`: PASS
   - `セキュリティ不変条件 > high.allowTime24h は false`: PASS
   - `セキュリティ不変条件 > high.allowTime7d は false`: PASS
   - `low/medium リスクの許可フラグ > low と medium の全 allow フラグは true`: PASS

3. テスト結果を `outputs/phase-5/green-state-confirmation.md` に記録する

**期待される成果物**:

- `docs/30-workflows/tool-risk-config-implementation/outputs/phase-5/green-state-confirmation.md`

---

### タスク3: エクスポート確認

**目的**: `packages/shared/src/constants/index.ts` の re-export 状況を確認し、`RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG` が re-export されていない場合は追加する。

**実行手順**:

1. `packages/shared/src/constants/index.ts` を確認する:

   ```bash
   cat packages/shared/src/constants/index.ts
   ```

2. `security.ts` からのエクスポート行が存在するか確認する:
   - `export * from "./security"` または `export { TOOL_RISK_CONFIG, RiskLevel, ToolRiskConfigEntry } from "./security"` の形式で存在するか確認

3. もし `security.ts` の全エクスポートが含まれている場合（`export * from "./security"`）、新規追加した型・定数も自動的に re-export される。個別エクスポートの場合は3件を追加する。

4. `@repo/shared` のメインエントリポイント（`packages/shared/src/index.ts`）からも到達可能か確認する

**期待される成果物**:

- `packages/shared/src/constants/index.ts`（必要な場合のみ更新）

---

## 参照資料

| 参照資料               | パス                                             | 内容                                     |
| ---------------------- | ------------------------------------------------ | ---------------------------------------- |
| Phase 2 実装設計       | `outputs/phase-2/implementation-design.md`       | 定数値・配置位置・エクスポート構成の設計 |
| Phase 4 テストファイル | `packages/shared/src/constants/security.test.ts` | 9件のテストケース（実装の完了判定基準）  |
| Phase 4 Red確認        | `outputs/phase-4/red-state-confirmation.md`      | テスト失敗理由の記録                     |
| 現行 security.ts       | `packages/shared/src/constants/security.ts`      | 既存のセキュリティ定数（追記対象）       |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                            | 内容                                                                |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`      | セキュリティ設計原則（セキュリティ不変条件の根拠）                  |
| スキル実行セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | security.ts の既存エクスポート一覧・`@repo/shared` エクスポートパス |

---

## 実行手順

### ステップ1: 型定義・定数の追加

タスク1 の手順に従い、`packages/shared/src/constants/security.ts` の末尾に `RiskLevel` 型、`ToolRiskConfigEntry` interface、`TOOL_RISK_CONFIG` 定数を追加する。追加後にビルドエラーがないことを確認する。

### ステップ2: Green 状態の確認

タスク2 のテスト実行コマンドを実行し、Phase 4 で作成した全9件のテストが PASS（Green 状態）であることを確認する。結果を `outputs/phase-5/green-state-confirmation.md` に記録する。

### ステップ3: エクスポート確認と .claude 正本更新

タスク3 の手順に従い、`packages/shared/src/constants/index.ts` で新規追加した型・定数が re-export されていることを確認する。`.claude` 配下の正本に該当する更新がある場合はこのステップで実施する。

---

## 統合テスト連携

- `packages/shared` の既存テスト（`security.test.ts` に既存テストが存在する場合）が引き続き PASS することを確認する
- 新規追加したエクスポートが `@repo/shared` パッケージの型チェックを通過することを確認する

---

## 成果物

| 成果物                  | パス                                          | 内容                                                    |
| ----------------------- | --------------------------------------------- | ------------------------------------------------------- |
| security.ts（更新済み） | `packages/shared/src/constants/security.ts`   | RiskLevel / ToolRiskConfigEntry / TOOL_RISK_CONFIG 追加 |
| Green状態確認レポート   | `outputs/phase-5/green-state-confirmation.md` | 全9件 PASS の実行ログ記録                               |

---

## TDD検証セクション

### Green状態の確認基準

| 確認項目           | 期待値 | 確認方法                                          |
| ------------------ | ------ | ------------------------------------------------- |
| テスト総件数       | 9件    | `vitest run --reporter=verbose` の出力を確認      |
| PASS件数           | 9件    | 全件 PASS であることを確認                        |
| FAIL件数           | 0件    | 失敗テストが存在しないことを確認                  |
| ビルドエラー       | 0件    | `pnpm --filter @repo/shared build` が成功すること |
| TypeScript型エラー | 0件    | 追加した型定義に型エラーがないことを確認          |

### セキュリティ不変条件の実装確認

| 不変条件              | 実装値  | テストによる保証 |
| --------------------- | ------- | ---------------- |
| `high.allowPermanent` | `false` | テストケース #6  |
| `high.allowTime24h`   | `false` | テストケース #7  |
| `high.allowTime7d`    | `false` | テストケース #8  |

---

## 完了条件

- [ ] `packages/shared/src/constants/security.ts` に `RiskLevel` 型が追加されている
- [ ] `packages/shared/src/constants/security.ts` に `ToolRiskConfigEntry` interface が追加されている
- [ ] `packages/shared/src/constants/security.ts` に `TOOL_RISK_CONFIG` 定数が追加されている
- [ ] `TOOL_RISK_CONFIG.high.allowPermanent === false` が実装されている
- [ ] `TOOL_RISK_CONFIG.high.allowTime24h === false` が実装されている
- [ ] `TOOL_RISK_CONFIG.high.allowTime7d === false` が実装されている
- [ ] `pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts` が全9件 PASS する
- [ ] `pnpm --filter @repo/shared build` がエラー 0 件で成功する
- [ ] `outputs/phase-5/green-state-confirmation.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] テストが Green 状態（全9件 PASS）であることを実行ログで確認
- [ ] ビルドが成功していることを確認
- [ ] 成果物（security.ts 更新 + Green状態確認レポート）が生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了し、テストが Red 状態であること
- **後続**: Phase 6（テスト拡充）で異常系・境界値テストを追加する

---

## Phase実行記録

Phase完了後、以下を記録してください:

### 実行タスク

- タスク1（security.ts への型定義・定数追加）: （実行後に記入）
- タスク2（Green 状態確認）: （実行後に記入）
- タスク3（エクスポート確認）: （実行後に記入）

### 発見事項

- 良かった点: （実行後に記入）
- 問題点: （実行後に記入）
- 改善提案: （実行後に記入）

### 次Phase への引き継ぎ事項

- （実行後に記入）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-6-test-expansion.md`
