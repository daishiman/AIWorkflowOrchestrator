# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 8                                                                 |
| Phase名    | リファクタリング                                                  |
| タスクID   | UT-06-001                                                         |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質検証）                                               |
| ステータス | 未実施                                                            |
| 作成日     | 2026-03-16                                                        |
| 機能名     | tool-risk-config-implementation                                   |

---

## 目的

Phase 5 で実装した `packages/shared/src/constants/security.ts` の追加コードに対して、以下の観点でリファクタリングを実施する:

1. JSDoc コメントの品質向上（フィールドごとの説明、`@remarks`、`@see` タグの整備）
2. セクション区切りコメントの整合性確認
3. 命名の一貫性確認（`RiskLevel` / `ToolRiskConfigEntry` / `TOOL_RISK_CONFIG` の命名規約整合）
4. `Record<RiskLevel, ToolRiskConfigEntry>` の型注釈の明示性向上

本タスクはセキュリティ不変条件（high の許可制限）を変更しない。型定義・定数値・エクスポート構成の変更も対象外とする。

## 背景

Phase 5 で `TOOL_RISK_CONFIG` 定数・`RiskLevel` 型・`ToolRiskConfigEntry` インターフェースを実装し、Phase 6-7 でテスト拡充・カバレッジ確認を完了した。本 Phase ではコードの可読性・保守性を向上させるためのリファクタリングを行う。セキュリティ不変条件（high リスクの許可制限）に影響する変更は含まない。リファクタリング後も全テストが PASS することを TDD サイクルの Refactor ステップとして検証する。

---

## 実行タスク

### タスク1: JSDoc コメントの品質チェックと整備

**目的**: Issue #1251 受入基準 #8「JSDoc コメント付与」を完全に満たしているか確認し、不足があれば補完する。

**実行手順**:

1. `packages/shared/src/constants/security.ts` を開き、追加した3要素の JSDoc を確認する:

   **確認対象**:

   | 要素                  | 確認項目                                                                |
   | --------------------- | ----------------------------------------------------------------------- |
   | `RiskLevel` 型        | 型の用途説明（1行以上）が存在するか                                     |
   | `ToolRiskConfigEntry` | interface 全体の説明 + 全5フィールド（各フィールド上に `/** */`）       |
   | `TOOL_RISK_CONFIG`    | 定数の用途、`@remarks`（high の不変条件）、`@see`（デシジョンテーブル） |

2. 不足している JSDoc を補完する（フォーマット例）:

   ```typescript
   /**
    * ツール操作のリスクレベル分類
    *
    * @remarks
    * - "low": Read・Glob・Grep を含む読み取り専用ツール呼び出し
    * - "medium": Write・Edit による局所的なファイル変更操作
    * - "high": Bash によるシステム設定変更・ファイル削除・プロセス実行
    */
   export type RiskLevel = "low" | "medium" | "high";
   ```

   ```typescript
   /**
    * リスクレベルごとのダイアログ・権限設定エントリ
    *
    * @see TOOL_RISK_CONFIG
    */
   export interface ToolRiskConfigEntry {
     /** PermissionDialog の表示幅（px）。リスクが高いほど大きい値 */
     dialogWidth: 400 | 480 | 640;
     /** ダイアログヘッダーの色トークン（CSS変数名、例: "--risk-high"） */
     headerColorToken: string;
     /** 「常に許可」ボタンの表示可否。high では false 固定 */
     allowPermanent: boolean;
     /** 「24時間許可」ボタンの表示可否。high では false 固定 */
     allowTime24h: boolean;
     /** 「7日間許可」ボタンの表示可否。high では false 固定 */
     allowTime7d: boolean;
   }
   ```

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
    * @see Phase 4 デシジョンテーブル（decision-table-risk-permission.md）
    */
   export const TOOL_RISK_CONFIG: Record<RiskLevel, ToolRiskConfigEntry> = { ... };
   ```

3. 補完後に JSDoc フォーマットが既存の `security.ts` スタイルと整合しているか目視確認する

**期待される成果物**:

- 更新済み `packages/shared/src/constants/security.ts`（JSDoc 整備済み）

---

### タスク2: セクション区切りとコード配置の確認

**目的**: `security.ts` 内のコード配置がファイル全体の構造と整合しているかを確認する。

**実行手順**:

1. ファイル先頭からセクション構成を確認する:

   | セクション                   | 内容                                                                                                      |
   | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
   | 危険パターン定義             | `DANGEROUS_PATTERNS`（正規表現配列）                                                                      |
   | ホワイトリスト               | `ALLOWED_TOOLS_WHITELIST`（許可ツール一覧）                                                               |
   | **ツールリスク設定（追加）** | `RiskLevel`, `ToolRiskConfigEntry`, `TOOL_RISK_CONFIG`                                                    |
   | ユーティリティ関数           | `isDangerousCommand`・`matchGlobPattern`・`isProtectedPath`・`validateAllowedTools`・`filterAllowedTools` |

2. Phase 2 設計で決定したセクション区切りコメント `// ─── Tool Risk Configuration ───` が存在することを確認する

3. 追加コードが `ALLOWED_TOOLS_WHITELIST` の直後、ユーティリティ関数の前に配置されていることを確認する

4. 配置が正しくない場合は、コードブロックを移動する

**期待される成果物**:

- 配置確認済み `packages/shared/src/constants/security.ts`

---

### タスク3: 命名一貫性の最終確認

**目的**: 追加した識別子が TypeScript 命名規約（プロジェクト標準）と整合しているかを確認する。

**実行手順**:

1. 以下の命名規約チェックを実行する:

   | 識別子                | 期待する規約                  | 確認結果 |
   | --------------------- | ----------------------------- | -------- |
   | `RiskLevel`           | PascalCase（type alias）      | -        |
   | `ToolRiskConfigEntry` | PascalCase（interface）       | -        |
   | `TOOL_RISK_CONFIG`    | SCREAMING_SNAKE_CASE（const） | -        |
   | `dialogWidth`         | camelCase（interface field）  | -        |
   | `headerColorToken`    | camelCase（interface field）  | -        |
   | `allowPermanent`      | camelCase + `allow` prefix    | -        |
   | `allowTime24h`        | camelCase + `allow` prefix    | -        |
   | `allowTime7d`         | camelCase + `allow` prefix    | -        |

2. `.claude/rules/02-code-quality.md` の「boolean 変数名は `is` / `has` / `can` / `should` / `allow` プレフィックス」規約との整合性を確認する（`allow` は許容）

3. 命名に問題がある場合は修正し、変更があれば `security.test.ts` のテスト識別子も対応修正する

**期待される成果物**:

- 命名確認済み `packages/shared/src/constants/security.ts`
- 命名変更があった場合は対応修正済みの `packages/shared/src/constants/security.test.ts`

---

## 実行手順

### ステップ1: JSDoc コメントの品質チェックと整備

タスク1 に従い、`packages/shared/src/constants/security.ts` 内の `RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG` の JSDoc を確認し、不足があれば補完する。補完後にファイル全体の JSDoc フォーマットが既存スタイルと整合しているか目視確認する。

### ステップ2: セクション区切り・配置確認と命名規約検証

タスク2・タスク3 に従い、セクション区切りコメントの存在、コード配置の正しさ、全識別子の命名規約整合を確認する。問題がある場合はコードを修正し、命名変更があればテストファイルも対応修正する。

### ステップ3: リファクタリング後のテスト再実行と記録

リファクタリング後に `pnpm --filter @repo/shared test` を実行し、全テストが PASS することを確認する。結果を `outputs/phase-8/refactor-plan.md` に記録する。

---

## 参照資料

| 参照資料              | パス                                             | 内容                   |
| --------------------- | ------------------------------------------------ | ---------------------- |
| Phase 5（実装）       | `phase-5-implementation.md`                      | 実装済みコードの確認   |
| Phase 6（テスト拡充） | `phase-6-test-expansion.md`                      | テスト済みケースの確認 |
| Phase 7（カバレッジ） | `phase-7-coverage-check.md`                      | カバレッジ充足確認     |
| 実装対象ファイル      | `packages/shared/src/constants/security.ts`      | リファクタリング対象   |
| テストファイル        | `packages/shared/src/constants/security.test.ts` | テスト整合性確認       |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                       | 内容                 |
| ---------------- | -------------------------------------------------------------------------- | -------------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md` | セキュリティ設計原則 |

---

## 統合テスト連携

- リファクタリング後もセキュリティ不変条件が維持されていることをテストで確認する
- JSDoc コメントの変更は実行時動作に影響しないため、既存テストがすべて PASS であれば整合性が保たれている
- 命名変更（識別子変更）を行った場合は、`packages/shared/src/index.ts` または `constants/index.ts` のエクスポートも対応修正する

---

## 成果物

| 成果物                    | パス                                             | 内容                             |
| ------------------------- | ------------------------------------------------ | -------------------------------- |
| リファクタリング計画      | `outputs/phase-8/refactor-plan.md`               | 実施内容・変更点・非変更点の記録 |
| 更新済み security.ts      | `packages/shared/src/constants/security.ts`      | JSDoc 整備・配置整合済み         |
| 更新済み security.test.ts | `packages/shared/src/constants/security.test.ts` | 命名変更があった場合のみ更新     |

---

## 完了条件

- [ ] `RiskLevel` 型に1行以上の JSDoc コメントが付与されている
- [ ] `ToolRiskConfigEntry` の全5フィールドにフィールドレベルの JSDoc コメントが付与されている
- [ ] `TOOL_RISK_CONFIG` 定数に `@remarks`（不変条件）と `@see`（デシジョンテーブル）が付与されている
- [ ] セクション区切りコメント `// ─── Tool Risk Configuration ───` が存在している
- [ ] 追加コードが `ALLOWED_TOOLS_WHITELIST` 直後・ユーティリティ関数前に配置されている
- [ ] 全識別子が命名規約（PascalCase/SCREAMING_SNAKE_CASE/camelCase）に従っている
- [ ] リファクタリング後のテストが全15件 PASS している（`pnpm --filter @repo/shared test`）
- [ ] `outputs/phase-8/refactor-plan.md` に変更内容と非変更理由が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（3件）が全て確認済みであること

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

- タスク1（JSDoc品質チェック・整備）: （結果を記録）
- タスク2（セクション区切り・配置確認）: （結果を記録）
- タスク3（命名一貫性確認）: （結果を記録）

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了し、カバレッジ基準を充足していること
- **後続**: Phase 9（品質検証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-9-quality-assurance.md`
