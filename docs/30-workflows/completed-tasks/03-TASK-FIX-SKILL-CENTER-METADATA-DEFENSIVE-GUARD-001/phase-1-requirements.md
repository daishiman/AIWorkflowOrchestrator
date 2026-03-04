# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 1                                                  |
| 機能名     | TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 |
| タスク名   | SkillCenter UI の欠損メタデータ耐性強化            |
| 前提Phase  | -                                                  |
| 後続Phase  | 設計                                               |
| 作成日     | 2026-03-04                                         |
| ステータス | pending                                            |

## 目的

対象タスクの再現条件・受け入れ基準・スコープを確定する。

## 背景

実データに型期待を満たさない項目が混在し、undefined.length と toLowerCase 例外で画面全体が落ちる事象が発生した。

## SubAgent分担

| SubAgent | 担当                                               |
| -------- | -------------------------------------------------- |
| A        | Hook防御（`useSkillCenter` / `useFeaturedSkills`） |
| B        | Component防御（`SkillCard` / `SkillDetailPanel`）  |
| C        | 欠損入力テスト・Phase 12仕様同期                   |

## 実行タスク

- 要件整理: 失敗条件・成功条件・再現手順を整理する
- 受け入れ基準化: Given/When/Then を定義する
- スコープ確定: 影響範囲と非対象を明文化する
- 差分網羅監査: 本ブランチ差分の反映漏れを検出する
- 仕様抽出監査: aiworkflow-requirements 参照の過不足を判定する
- 多角監査: 20思考フレームで矛盾/漏れ/依存を点検する

## 参照資料

| 資料名         | パス                                                                            | 用途          |
| -------------- | ------------------------------------------------------------------------------- | ------------- |
| API/IPC 正本   | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md              | IPC契約確認   |
| Interface 正本 | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md | 型・契約確認  |
| 状態管理正本   | .claude/skills/aiworkflow-requirements/references/arch-state-management.md      | Store同期確認 |
| UI仕様正本     | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md   | 画面要件確認  |
| UI部品正本     | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md           | 表示契約確認  |
| UIアーキ正本   | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md         | 責務境界確認  |
| テストFixture  | .claude/skills/aiworkflow-requirements/references/testing-fixtures.md           | 欠損入力設計  |
| エラー処理正本 | .claude/skills/aiworkflow-requirements/references/error-handling.md             | 例外方針確認  |
| 教訓正本       | .claude/skills/aiworkflow-requirements/references/lessons-learned.md            | 再発防止確認  |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. 実行タスクを順に処理し、成果物へ反映する。
3. 完了条件を検証し、次Phaseへ引き継ぐ。

## 統合テスト連携（Phase 1〜11）

- Main/Preload/Renderer の接続点を明示してテスト観点へ反映する。
- 不具合再現条件を自動テストと手動テスト双方へ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                         | 参照仕様                   |
| ------------------ | -------------------------------- | -------------------------- |
| セキュリティ       | sender検証・入力検証・境界防御   | security-\*.md             |
| UI/UX              | 表示崩れ・導線・アクセシビリティ | ui-ux-\*.md                |
| アーキテクチャ     | 責務分離と依存方向               | architecture-\*.md         |
| API/IPC            | 引数・戻り値・エラー契約         | api-_.md / interfaces-_.md |
| エラーハンドリング | 例外分類と利用者通知             | error-handling.md          |

## 成果物

| 成果物       | パス                                                    | 内容                 |
| ------------ | ------------------------------------------------------- | -------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`            | FR/NFR と再現条件    |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                | Given/When/Then      |
| スコープ定義 | `outputs/phase-1/scope-definition.md`                   | 対象・非対象         |
| 差分監査     | `outputs/phase-1/branch-diff-coverage.md`               | 本ブランチ差分網羅性 |
| 抽出監査     | `outputs/phase-1/aiworkflow-requirements-extraction.md` | 仕様抽出の過不足判定 |
| 多角監査     | `outputs/phase-1/multi-thinking-consistency-audit.md`   | 20思考フレーム監査   |

## 完了条件

- [ ] 実行タスクの成果物が定義されている
- [ ] 参照仕様との整合根拠を記録する
- [ ] 差分網羅監査・抽出監査・多角監査の3監査成果物を作成する
- [ ] 次Phaseへの引き継ぎ事項を記録する
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase内で定義した成果物を全件記録
- [ ] 引き継ぎ事項を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001
```

## Phase実行記録

| 項目         | 記録    |
| ------------ | ------- |
| 実行タスク   | pending |
| 発見事項     | pending |
| 引き継ぎ事項 | pending |

## 次のPhase

Phase 2 設計
