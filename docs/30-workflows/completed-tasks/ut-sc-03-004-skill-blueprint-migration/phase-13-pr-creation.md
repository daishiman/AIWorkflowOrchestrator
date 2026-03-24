# Phase 13: 完了・PR 準備 - タスク仕様書

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 13                                     |
| 機能名   | ut-sc-03-004-skill-blueprint-migration |
| タスクID | UT-SC-03-004                           |
| 作成日   | 2026-03-24                             |
| 更新日   | 2026-03-24                             |

---

## 目的

Phase 1-12 の全成果物が揃っていることを最終確認し、PR を準備する。ユーザーの明示承認がない限り、PR は作成しない。

## 背景

UT-SC-03-004 は plan() の出力型 RuntimeSkillCreatorPlanResult を SkillBlueprint 互換に移行するタスクであり、後続タスク w3a（TASK-SC-04-OUTPUT-PERSISTENCE / SkillFileWriter）のブロッカー解消を目的とする。変更対象は型定義（packages/shared）、Facade 実装（apps/desktop）、LLM プロンプト定数の 3 ファイルである。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク 1: 成果物最終確認

**目的**: Phase 1-12 の全成果物が outputs/ に配置されていることを確認する。

**実行手順**:

1. 以下の成果物が存在し、必要な内容が含まれていることを確認する:
   - `outputs/phase-01-requirements-output.md` : 要件定義成果物
   - `outputs/phase-02-design-output.md` : 設計成果物
   - `outputs/phase-03-review-output.md` : 設計レビュー結果
   - Phase 4-6: テスト・実装成果物はプロジェクトの該当ディレクトリに配置（`packages/shared/src/`, `apps/desktop/src/`）
   - `outputs/phase-07-coverage-output.md` : カバレッジ確認結果
   - Phase 8: リファクタリング成果物はプロジェクトの該当ディレクトリに配置
   - `outputs/phase-09-quality-output.md` : 品質検証結果
   - `outputs/phase-10-review-output.md` : 最終レビュー結果
   - `outputs/phase-11/` : 手動テスト結果（4 ファイル: type-compatibility-verification, llm-response-schema-verification, ipc-response-verification, manual-test-report）
   - `outputs/phase-12/` : ドキュメント成果物（6 ファイル: implementation-guide, api-documentation, system-spec-update-summary, documentation-changelog, unassigned-task-detection, skill-feedback-report）

2. `artifacts.json` のステータスが全 Phase で `completed` であることを確認する

3. Phase 12 の検証コマンド結果がエラー 0 件であることを再確認する:

   ```bash
   # SKILL検証
   for skill in skill-creator task-specification-creator aiworkflow-requirements; do
     echo "=== $skill ===" && \
     node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
   done
   ```

4. `quick_validate.js` の Warning 分類（`許容 / 要監視 / 要対応`）が、以下 2 ファイルで同値に記録されていることを確認する:
   - `outputs/phase-12/system-spec-update-summary.md`
   - `outputs/phase-12/documentation-changelog.md`

**期待される成果物**:

- 完了根拠の確認結果（コンソール出力で検証）

---

### タスク 2: PR 準備

**目的**: PR 作成に必要な情報を準備する。

**実行手順**:

1. **ローカル確認チェックリスト**:
   - [ ] `pnpm lint` が通ること
   - [ ] `pnpm typecheck` が通ること
   - [ ] 全テスト PASS であること（`pnpm --filter @repo/shared test`, `pnpm --filter @repo/desktop test`）
   - [ ] `git status` で意図しないファイル変更がないこと
   - [ ] `git diff --stat origin/main...HEAD` で変更範囲が妥当であること
   - [ ] `--no-verify` を使用していないこと

2. **PR 情報**:
   - ブランチ名: `feature/ut-sc-03-004-skill-blueprint-migration`
   - PR タイトル: `feat(types): SkillBlueprint 型追加・plan()出力互換移行 (#UT-SC-03-004)`（70 文字以内）
   - PR ラベル: `enhancement`, `priority:high`
   - PR 本文テンプレート:

     ```markdown
     ## Summary

     - SkillBlueprint 型を `packages/shared/src/types/skillCreator.ts` に追加（SkillCategory, PlannedFile, CategoryTemplate, CATEGORY_TEMPLATES を含む）
     - RuntimeSkillCreatorPlanResult を `extends SkillBlueprint` に変更し、後方互換性を維持しつつ SkillBlueprint 互換を実現
     - LLM レスポンススキーマ（PLAN_RESPONSE_SCHEMA_INSTRUCTION）を拡張し、category/files/reasoning フィールドを追加

     ## Test Plan

     - カバレッジ基準充足（Line: 80%+, Branch: 60%+, Function: 80%+）
     - Graceful degradation テスト: LLM が旧形式で返した場合のデフォルト値適用を検証
     - 後方互換性テスト: 既存フィールド（planId, skillSpec, estimatedSteps 等）が保持されることを検証
     - 型互換性テスト: SkillBlueprint 型の変数に RuntimeSkillCreatorPlanResult 型の値を代入可能であることを検証

     ## Breaking Changes

     なし（後方互換性を維持）

     ## Related

     - 親タスク: TASK-SC-03-PLAN-LLM-PROMPT
     - 後続依存: TASK-SC-04-OUTPUT-PERSISTENCE（SkillFileWriter が SkillBlueprint を使用）
     - 正本: docs/30-workflows/skill-creator-llm-integration/index.md
     ```

3. **コミットメッセージの準備**:
   - `feat(types): SkillBlueprint 型追加・plan()出力互換移行 (#UT-SC-03-004)`

**期待される成果物**:

- PR 準備チェックリストの確認結果

---

### タスク 3: 最終チェックリスト

**目的**: PR 作成前の最終確認を行う。

**実行手順**:

以下の全項目を確認する:

- [ ] `pnpm lint` PASS
- [ ] `pnpm typecheck` PASS
- [ ] 全テスト PASS
- [ ] `--no-verify` 不使用
- [ ] Phase 12 の全 Step 完了（documentation-changelog.md の事後記録で確認）
- [ ] LOGS.md 2 ファイル更新済み（P1/P25）
- [ ] topic-map.md 再生成済み（P2/P27）
- [ ] 未タスク 3 ステップ完了（P3/P38）
- [ ] artifacts.json 全 Phase completed

**期待される成果物**:

- 最終チェックリストの確認結果

---

### タスク 4: ユーザー承認待ち

**目的**: ユーザーの明示承認を得てから PR を作成する。

**実行手順**:

1. ユーザーに以下を報告する:
   - Phase 1-12 の全成果物が揃っていること
   - 検証コマンドがエラー 0 件であること
   - PR の内容（タイトル、Summary、変更範囲）
   - 変更対象ファイル一覧:
     - `packages/shared/src/types/skillCreator.ts`（型定義追加・変更）
     - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（plan() 戻り値構築・パーサー・バリデーション更新）
     - `apps/desktop/src/main/services/runtime/planPromptConstants.ts`（LLM プロンプトスキーマ拡張）
2. ユーザーの承認を待つ
3. 承認後、PR を作成する

> ルール: ユーザーの明示承認がない限り、commit / PR を自動で作成しない。

**ステータス**: blocked（ユーザー承認待ち）

---

## 参照資料

| 参照資料               | パス                                                                             | 内容                    |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| Phase 12 成果物        | `outputs/phase-12/`                                                              | ドキュメント成果物      |
| Phase 11 成果物        | `outputs/phase-11/`                                                              | 手動テスト成果物        |
| Phase 10 成果物        | `outputs/phase-10/`                                                              | 最終レビュー成果物      |
| 正本 index.md          | `docs/30-workflows/skill-creator-llm-integration/index.md`                       | SkillBlueprint 正本定義 |
| phase-template-phase13 | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | Phase 13 テンプレート   |

### システム仕様（aiworkflow-requirements）

| 参照資料                           | パス                                                                                      | 内容                    |
| ---------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| arch-execution-capability-contract | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md` | SkillBlueprint 関連仕様 |
| task-workflow                      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                      | 完了/未タスク台帳       |

### 変更対象コードファイル

| ファイル                     | パス                                                                  | 変更内容                                    |
| ---------------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| skillCreator.ts              | `packages/shared/src/types/skillCreator.ts`                           | SkillBlueprint 型追加・extends 化           |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan() 戻り値・パーサー・バリデーション更新 |
| planPromptConstants.ts       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | LLM プロンプトスキーマ拡張                  |

---

## 成果物

Phase 13 はユーザー承認後に PR を作成するフェーズであり、事前に生成する成果物はない。

| 成果物       | パス   | 内容                 |
| ------------ | ------ | -------------------- |
| Pull Request | GitHub | ユーザー承認後に作成 |

---

## 統合テスト連携

| 連携先         | 連携内容                                                                |
| -------------- | ----------------------------------------------------------------------- |
| Phase 12       | 全成果物と検証結果が PR の根拠となる                                    |
| 後続タスク w3a | PR マージ後、TASK-SC-04-OUTPUT-PERSISTENCE が本タスクの成果物を参照する |
| 親タスク       | TASK-SC-03-PLAN-LLM-PROMPT のサブタスクとして完了報告                   |

---

## 多角的チェック観点

| #   | 観点               | 確認内容                                                   |
| --- | ------------------ | ---------------------------------------------------------- |
| 1   | 成果物完全性       | Phase 1-12 の全成果物が outputs/ に存在する                |
| 2   | artifacts.json     | 全 Phase のステータスが completed である                   |
| 3   | Lint/TypeCheck     | pnpm lint, pnpm typecheck が PASS である                   |
| 4   | テスト             | 全テストが PASS である                                     |
| 5   | --no-verify 不使用 | git commit / push で --no-verify を使用していない          |
| 6   | PR タイトル        | 70 文字以内で Summary が明確である                         |
| 7   | 後方互換性         | Breaking Changes がないことが PR 本文に明記されている      |
| 8   | 後続依存           | TASK-SC-04-OUTPUT-PERSISTENCE との依存関係が明記されている |

---

## 完了条件

- [ ] Phase 1-12 の全成果物が存在し、artifacts.json が全 Phase completed であること
- [ ] 検証コマンド（quick_validate.js）がエラー 0 件であること
- [ ] `quick_validate.js` Warning 分類が Phase 12 成果物 2 ファイルで一致していること
- [ ] `pnpm lint` PASS
- [ ] `pnpm typecheck` PASS
- [ ] 全テスト PASS
- [ ] `--no-verify` を使用していないこと
- [ ] ユーザーの明示承認を得ていること
- [ ] PR が作成され、Summary と Test Plan が記載されていること

---

## サブタスク管理

1. タスク 1: 成果物最終確認
2. タスク 2: PR 準備
3. タスク 3: 最終チェックリスト
4. タスク 4: ユーザー承認待ち

---

## タスク 100% 実行確認チェックリスト

- [ ] 本 Phase 内の全タスク（1-4）を 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次の Phase

Phase 13 が最終 Phase です。

### PR マージ後の必須処理

1. `docs/30-workflows/ut-sc-03-004-skill-blueprint-migration/` を `docs/30-workflows/completed-tasks/` に移動する
2. 以下の後続タスクが開始可能になる:
   - TASK-SC-04-OUTPUT-PERSISTENCE（SkillFileWriter / w3a）
