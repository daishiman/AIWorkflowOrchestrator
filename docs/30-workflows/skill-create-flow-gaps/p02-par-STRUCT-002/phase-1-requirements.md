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

`SkillCreatorService.ts` の current branch と upstream の差分を確認し、
`structurePlan` の接続状態と TASK-SW-STRUCT-001 との依存関係を要件・受け入れ基準に落とし込む。
現状コードの実装済み範囲と未完了範囲を切り分ける。

## 実行タスク

- P50チェック: current branch と upstream の差分確認（`void structurePlan` の有無を含む）
- 既存コードの命名規則の記録（camelCase / kebab-case / IPC チャンネル名）
- 前タスクとの差分棚卸し（TASK-SW-STRUCT-001 から増えた/変わった点）
- TASK-SW-STRUCT-001 完了確認基準の定義
- `plan` オブジェクト生成ロジック（:711-725）の現状確認
- 4条件レビュー: 矛盾なし・漏れなし・整合性あり・依存関係整合を確認
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

**【注意】 2026-04-16 の upstream マージにより実装状況が変化しています**

```bash
# SkillCreatorService.ts の最近のコミット履歴確認
git log --oneline -10 -- apps/desktop/src/main/services/skill/SkillCreatorService.ts

# void structurePlan が削除済みか確認（結果0件が期待値）
grep -n "void structurePlan" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# generateSkillMd の呼び出し箇所確認（structurePlan を引数に呼んでいるか）
grep -n "generateSkillMd\|structurePlan" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### 1. 現状コードの確認

**2026-04-16 時点での確認結果（コミット 26891ab1c）:**

| 確認項目                         | 期待する確認内容                                                                     | 状態         |
| -------------------------------- | ------------------------------------------------------------------------------------ | ------------ |
| `void structurePlan` の存在      | 削除済み（0件）                                                                      | **確認済み** |
| `generateSkillMd` との接続       | `if (structurePlan) { await this.generateSkillMd(skillDir, structurePlan); }` が存在 | **確認済み** |
| null フォールバック              | `else if (mode === "create") { logger.warn(...); ensureSkillMdExists(...) }` が存在  | **確認済み** |
| 非 create モードのフォールバック | `else { ensureSkillMdExists(...) }` が存在                                           | **確認済み** |
| `runCreateWorkflow` の `purpose` | まだ `extractPurposeAgent` 文字列（TASK-SW-STRUCT-001 未完了）                       | **未修正**   |

現時点では AC-1〜AC-4 が current branch で確認済みのため、Phase 5 以降は
差分が残る場合のみ実装し、差分がなければ回帰確認を主とする。

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

- [ ] P50チェック実施済み（`void structurePlan` が削除済み・`generateSkillMd` 接続が実装済みを確認）
- [ ] 実装済み分岐（structurePlan あり/null/非 create モード）の動作確認
- [ ] TASK-SW-STRUCT-001 完了確認基準が定義済み（purpose フィールドの修正確認コマンド）
- [ ] AC-1〜AC-5 が検証可能な形で定義されている（AC-1〜AC-4 は current branch の確認結果をドキュメント化）
- [ ] タスク分類を宣言済み
- [ ] スコープ外（LLM 統合・STRUCT-001）との境界が明確
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（current branch と upstream の差分確認）
2. 既存コードの命名規則と前タスク差分の棚卸し
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
