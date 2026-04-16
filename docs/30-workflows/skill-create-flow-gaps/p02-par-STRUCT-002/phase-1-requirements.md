# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 1                                             |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | -                                             |
| 後続Phase  | Phase 2                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | pending                                       |

## 目的

`SkillCreatorService.ts` の行 126 にある `void structurePlan` を削除し、
`structurePlan` を `generate_skill_md.js` に渡す接続配線の要件と受け入れ基準を固定する。
現状コードを確認し、TASK-SW-STRUCT-001 との依存関係を明確にする。

## 実行タスク

- P50チェック: 対象コードの現状確認（`:126` の `void structurePlan` の存在確認）
- TASK-SW-STRUCT-001 完了確認基準の定義
- `plan` オブジェクト生成ロジック（:180-194）の現状確認
- 受け入れ基準定義: AC-1〜AC-5 を検証可能な形で固定
- タスク分類宣言

## 参照資料

| 資料名                  | パス                                                                                    | 用途                         |
| ----------------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| phase-1-analysis.md     | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-1-analysis.md` | 問題3の現状分析              |
| phase-2-solution.md     | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` | 解決アプローチB              |
| phase-3-review.md       | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-3-review.md`   | タスク粒度確認               |
| TASK-SW-STRUCT-001 仕様 | `docs/30-workflows/skill-create-flow-gaps/p01-par-STRUCT-001/`                          | 前提タスク確認               |
| SkillCreatorService.ts  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                           | 修正対象ファイル（:105-194） |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# SkillCreatorService.ts の最近のコミット履歴確認
git log --oneline -10 -- apps/desktop/src/main/services/skill/SkillCreatorService.ts

# void structurePlan の存在確認（:126 付近）
grep -n "void structurePlan" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# structurePlan の宣言・使用箇所の確認
grep -n "structurePlan" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# plan オブジェクト生成箇所の確認（:180-194 付近）
grep -n "const plan\|generate_skill_md" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### 1. 現状コードの確認

設計書（phase-1-analysis.md）で特定された問題を実際のコードで確認する:

| 確認項目                       | 期待する確認内容                                                             |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `:126` の `void structurePlan` | `void structurePlan;` コメント付きプレースホルダーが存在すること             |
| `plan` オブジェクトの独立性    | `:180-194` の `plan` が `structurePlan` と無関係な固定値で構成されていること |
| `runCreateWorkflow` の戻り値   | `StructurePlanJson` を返すことを確認                                         |

### 2. TASK-SW-STRUCT-001 完了確認基準の定義

本タスクの Phase 5（実装）開始前に TASK-SW-STRUCT-001 の完了を確認すること。

確認コマンド:

```bash
# runCreateWorkflow の purpose フィールドが options.description ベースになっているか確認
grep -n "purpose\|extractPurposeAgent" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

TASK-SW-STRUCT-001 完了後の期待状態:

- `structurePlan.purpose` に `options.description` が設定されている
- `structurePlan.agents` がエージェント名の文字列リストになっている
- `structurePlan.features` が適切な値で設定されている

### 3. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                                               | 検証方法                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| AC-1 | 行 126 の `void structurePlan` が削除されている                                                            | コードレビュー（`grep -n "void structurePlan"` の結果が0件）               |
| AC-2 | `create` モード時は `structurePlan` の内容を `plan` オブジェクトに反映して `generate_skill_md.js` に渡す   | テスト: `create` モードで生成した SKILL.md が `structurePlan` の内容を含む |
| AC-3 | `create` 以外のモード（`collaborative` / `orchestrate` 等）は既存の固定値 `plan` でフォールバックする      | テスト: `collaborative` モードの既存テストが全て PASS する                 |
| AC-4 | `structurePlan` が `null` の場合（`runCreateWorkflow` フォールバック時）もフォールバック `plan` を使用する | テスト: `structurePlan` が null の場合にフォールバック `plan` が使われる   |
| AC-5 | `collaborative` モードの既存テストが全てパスし続ける                                                       | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/`     |

### 4. タスク分類の宣言

| 分類項目   | 値                                       |
| ---------- | ---------------------------------------- |
| タスク種別 | バグ修正タスク                           |
| UIタスク   | 非UIタスク（メインプロセス内部変更のみ） |
| 可視性     | NON_VISUAL                               |
| テスト種別 | ユニットテスト（SkillCreatorService 層） |

### 5. スコープ外の明確化

本タスク（TASK-SW-STRUCT-002）のスコープ外:

- `runCreateWorkflow` の出力仕様修正（TASK-SW-STRUCT-001 のスコープ）
- LLM 統合（実際のAI生成処理との接続）— 別タスクへ分離済み
- `generate_skill_md.js` スクリプト自体の変更（スコープ外）

## 統合テスト連携【必須】

| 判定項目                      | 基準     | 結果    |
| ----------------------------- | -------- | ------- |
| `void structurePlan` 存在確認 | 確認済み | pending |
| `plan` 生成ロジックの確認     | 確認済み | pending |
| TASK-SW-STRUCT-001 依存確認   | 確認済み | pending |

## 多角的チェック観点

| 観点               | チェック内容                                                                        |
| ------------------ | ----------------------------------------------------------------------------------- |
| 前提タスク整合     | TASK-SW-STRUCT-001 完了後に `structurePlan` が正しいデータを持つことを確認済みか    |
| フォールバック設計 | `create` 以外のモードで既存 `plan` がフォールバックとして機能する設計になっているか |
| null 安全性        | `structurePlan` が null の場合の安全なフォールバックが設計に含まれているか          |
| 後方互換性         | 既存の `collaborative` モードテストが引き続き PASS することを AC-5 で担保しているか |

## 成果物

| 成果物     | パス                              | 説明                          |
| ---------- | --------------------------------- | ----------------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 機能要件・非機能要件・AC 一覧 |

## 完了条件

- [ ] P50チェック実施済み（`:126` の `void structurePlan` が存在することを確認）
- [ ] `plan` オブジェクト生成ロジックが `structurePlan` と無関係であることを確認済み
- [ ] TASK-SW-STRUCT-001 完了確認基準が定義済み
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] タスク分類を宣言済み
- [ ] スコープ外（LLM 統合・STRUCT-001）との境界が明確
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（`:126` の `void structurePlan` 確認）
2. `plan` オブジェクト生成ロジックの確認
3. TASK-SW-STRUCT-001 完了確認基準の定義
4. 受け入れ基準（AC-1〜AC-5）の固定
5. タスク分類の宣言
6. スコープ外の明確化
7. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 2: 設計
