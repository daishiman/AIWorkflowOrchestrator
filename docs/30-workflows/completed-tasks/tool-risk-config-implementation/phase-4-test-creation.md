# Phase 4: テスト作成（Red状態） - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| Phase名    | テスト作成（Red状態）           |
| タスクID   | UT-06-001                       |
| 前提Phase  | Phase 3（設計レビューゲート）   |
| 後続Phase  | Phase 5（実装）                 |
| ステータス | 未実施                          |
| 作成日     | 2026-03-16                      |
| 機能名     | tool-risk-config-implementation |

---

## 目的

Phase 2 のテスト設計書（`outputs/phase-2/test-design.md`）に基づき、`packages/shared/src/constants/security.test.ts` を新規作成する。この段階では `TOOL_RISK_CONFIG`、`RiskLevel`、`ToolRiskConfigEntry` が未実装のため、テストは **Red 状態**（全件失敗）となる。TDD の Red → Green → Refactor サイクルの第1ステップを完了する。

---

## 背景

TDD ではテストを先に書くことで、実装に必要なインターフェース・制約・不変条件を明確にする。`TOOL_RISK_CONFIG` はセキュリティ不変条件（high リスクの許可制限）を持つため、テストで制約を先に定義することが特に重要である。後続の Phase 5 実装者は、このテストが全件 PASS することを完了の判定基準として使用する。

---

## 実行タスク

### タスク1: テストファイルの新規作成（Red状態）

**目的**: `packages/shared/src/constants/security.test.ts` を新規作成し、9件のテストケースを実装する。

**実行手順**:

1. 以下の内容でテストファイルを新規作成する:

   ```typescript
   // packages/shared/src/constants/security.test.ts
   import { describe, it, expect } from "vitest";
   import {
     TOOL_RISK_CONFIG,
     type RiskLevel,
     type ToolRiskConfigEntry,
   } from "./security";

   describe("TOOL_RISK_CONFIG", () => {
     describe("キー網羅性", () => {
       it("RiskLevel の全3キー（low / medium / high）が存在する", () => {
         const keys = Object.keys(TOOL_RISK_CONFIG);
         expect(keys).toContain("low");
         expect(keys).toContain("medium");
         expect(keys).toContain("high");
         expect(keys).toHaveLength(3);
       });
     });

     describe("dialogWidth 値検証", () => {
       it("low の dialogWidth は 400 である", () => {
         expect(TOOL_RISK_CONFIG.low.dialogWidth).toBe(400);
       });

       it("medium の dialogWidth は 480 である", () => {
         expect(TOOL_RISK_CONFIG.medium.dialogWidth).toBe(480);
       });

       it("high の dialogWidth は 640 である", () => {
         expect(TOOL_RISK_CONFIG.high.dialogWidth).toBe(640);
       });
     });

     describe("headerColorToken 形式検証", () => {
       it("全エントリの headerColorToken が '--risk-' プレフィックスを持つ", () => {
         const levels: RiskLevel[] = ["low", "medium", "high"];
         for (const level of levels) {
           expect(TOOL_RISK_CONFIG[level].headerColorToken).toMatch(/^--risk-/);
         }
       });
     });

     describe("セキュリティ不変条件（high リスク）", () => {
       it("high.allowPermanent は false である（恒久許可禁止）", () => {
         expect(TOOL_RISK_CONFIG.high.allowPermanent).toBe(false);
       });

       it("high.allowTime24h は false である（24時間許可禁止）", () => {
         expect(TOOL_RISK_CONFIG.high.allowTime24h).toBe(false);
       });

       it("high.allowTime7d は false である（7日間許可禁止）", () => {
         expect(TOOL_RISK_CONFIG.high.allowTime7d).toBe(false);
       });
     });

     describe("low / medium リスクの許可フラグ", () => {
       it("low と medium の全 allow フラグは true である", () => {
         const permissiveLevels: RiskLevel[] = ["low", "medium"];
         for (const level of permissiveLevels) {
           const entry = TOOL_RISK_CONFIG[level];
           expect(entry.allowPermanent).toBe(true);
           expect(entry.allowTime24h).toBe(true);
           expect(entry.allowTime7d).toBe(true);
         }
       });
     });
   });
   ```

2. ファイル作成後、テストを実行して Red 状態（全件失敗）を確認する:

   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260316-175921-wt-3
   pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts --reporter=verbose 2>&1 | head -50
   ```

3. 失敗理由を記録する（型エラー or モジュール未エクスポートエラーであることを確認）

**期待される成果物**:

- `packages/shared/src/constants/security.test.ts`（新規作成）

---

### タスク2: TDD Red 状態の確認

**目的**: テストが適切な理由で失敗していることを確認する。

**実行手順**:

1. テスト失敗メッセージを確認し、以下のいずれかであることを確認する:
   - `TOOL_RISK_CONFIG` が `security.ts` からエクスポートされていない
   - `RiskLevel` 型が `security.ts` からエクスポートされていない
   - `ToolRiskConfigEntry` 型が `security.ts` からエクスポートされていない

2. テスト失敗の理由を `outputs/phase-4/red-state-confirmation.md` に記録する:
   - 失敗したテスト件数: 9件
   - 失敗理由のカテゴリ: インポートエラー（未実装）
   - Phase 5 で解消される見込み: インポートエラーは実装後に解消される

**期待される成果物**:

- `docs/30-workflows/tool-risk-config-implementation/outputs/phase-4/red-state-confirmation.md`

---

## 参照資料

| 参照資料           | パス                                        | 内容                                       |
| ------------------ | ------------------------------------------- | ------------------------------------------ |
| Phase 2 テスト設計 | `outputs/phase-2/test-design.md`            | テストケース設計書（10件の設計を参照）     |
| Phase 2 型定義設計 | `outputs/phase-2/type-design.md`            | RiskLevel / ToolRiskConfigEntry の型設計   |
| 現行 security.ts   | `packages/shared/src/constants/security.ts` | 既存のセキュリティ定数（追加対象ファイル） |
| Phase 3 判定結果   | `outputs/phase-3/gate-decision.md`          | PASS/MINOR 判定と残課題                    |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                                   | 内容               |
| -------------- | -------------------------------------------------------------------------------------- | ------------------ |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns-core.md` | テスト設計パターン |

---

## 実行手順

### ステップ1: テストファイル作成

タスク1 の実行手順に従い、`packages/shared/src/constants/security.test.ts` を新規作成する。9件のテストケースを含むテストファイルを生成する。

### ステップ2: Red 状態の確認

タスク1 のテスト実行コマンドを実行し、全9件が失敗（Red 状態）であることをターミナル出力で確認する。

### ステップ3: 失敗理由の記録と検証

タスク2 の手順に従い、失敗理由がインポートエラー（未実装）であることを確認し、`outputs/phase-4/red-state-confirmation.md` に記録する。

---

## 統合テスト連携

- テスト対象は `packages/shared/src/constants/security.ts` のみ
- 外部依存なし（純粋な定数とユーティリティ関数のテスト）
- Phase 5 実装完了後に同テストファイルで Green 状態を確認する

---

## 成果物

| 成果物                | パス                                             | 内容                              |
| --------------------- | ------------------------------------------------ | --------------------------------- |
| テストファイル（Red） | `packages/shared/src/constants/security.test.ts` | 9件のテストケース（全件失敗状態） |
| Red状態確認レポート   | `outputs/phase-4/red-state-confirmation.md`      | 失敗理由の記録                    |

---

## TDD検証セクション

### Red状態の確認基準

| 確認項目                   | 期待値           | 確認方法                                     |
| -------------------------- | ---------------- | -------------------------------------------- |
| テスト総件数               | 9件              | `vitest run --reporter=verbose` の出力を確認 |
| 失敗件数                   | 9件              | 全件失敗であることを確認                     |
| 失敗理由                   | インポートエラー | `SyntaxError` / `TypeError` の発生を確認     |
| テスト構文エラーがないこと | エラーなし       | テストファイル自体の構文は正しいことを確認   |

### テストケース一覧（9件）

| #   | describe ブロック             | テストケース名                              | 検証内容                              |
| --- | ----------------------------- | ------------------------------------------- | ------------------------------------- |
| 1   | キー網羅性                    | RiskLevel の全3キーが存在する               | `Object.keys` で3件、各キーの存在確認 |
| 2   | dialogWidth 値検証            | low の dialogWidth は 400                   | `toBe(400)`                           |
| 3   | dialogWidth 値検証            | medium の dialogWidth は 480                | `toBe(480)`                           |
| 4   | dialogWidth 値検証            | high の dialogWidth は 640                  | `toBe(640)`                           |
| 5   | headerColorToken 形式検証     | 全エントリが `--risk-` プレフィックスを持つ | `/^--risk-/` 正規表現マッチ           |
| 6   | セキュリティ不変条件          | high.allowPermanent は false                | `toBe(false)` - 恒久許可禁止          |
| 7   | セキュリティ不変条件          | high.allowTime24h は false                  | `toBe(false)` - 24時間許可禁止        |
| 8   | セキュリティ不変条件          | high.allowTime7d は false                   | `toBe(false)` - 7日間許可禁止         |
| 9   | low/medium リスクの許可フラグ | low と medium の全 allow フラグは true      | 6フラグ（2エントリ×3フラグ）確認      |

---

## 完了条件

- [ ] `packages/shared/src/constants/security.test.ts` が新規作成されている
- [ ] テストケースが9件実装されている（キー網羅性1件、dialogWidth3件、headerColorToken1件、セキュリティ不変条件3件、許可フラグ1件）
- [ ] テストを実行した結果、全9件が失敗（Red状態）であることが確認されている
- [ ] 失敗理由がインポートエラー（未実装）であることが確認されている
- [ ] `outputs/phase-4/red-state-confirmation.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（2タスク）を100%実行完了
- [ ] テストファイルが Red 状態であることを実行ログで確認
- [ ] 成果物（テストファイル + Red状態確認レポート）が生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS または MINOR で完了していること
- **後続**: Phase 5（実装）でテストを Green 状態にする

---

## Phase実行記録

Phase完了後、以下を記録してください:

### 実行タスク

- タスク1（テストファイル新規作成）: （実行後に記入）
- タスク2（TDD Red 状態確認）: （実行後に記入）

### 発見事項

- 良かった点: （実行後に記入）
- 問題点: （実行後に記入）
- 改善提案: （実行後に記入）

### 次Phase への引き継ぎ事項

- （実行後に記入）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/tool-risk-config-implementation/phase-5-implementation.md`
