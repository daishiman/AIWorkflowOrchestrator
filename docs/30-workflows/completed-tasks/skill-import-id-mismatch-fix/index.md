# UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: organisms/SkillImportDialog skill.id/skill.name 不一致バグ修正

## メタ情報

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001                                                  |
| タスク名     | organisms/SkillImportDialog が skill.id（ハッシュ）を skillName として渡すバグの修正 |
| 分類         | バグ修正                                                                             |
| 優先度       | 高（スキルインポート機能が100%失敗するため）                                         |
| 見積もり規模 | 小規模                                                                               |
| ステータス   | 未実施                                                                               |
| 発見日       | 2026-02-22                                                                           |
| ブランチ     | `fix/ut-fix-skill-import-id-mismatch-001`                                            |

## 概要

`organisms/SkillImportDialog` がスキル選択時に `skill.id`（SHA-256ハッシュの先頭16文字）を使用し、その値が `skillName` パラメータとしてIPCハンドラに到達する。ハンドラ内の `getSkillByName(skillName)` は `skill.name`（人間可読名）と比較するため、ハッシュ値とは一致せず `null` を返し、`IMPORT_ERROR` がスローされる。

## Phase構成

| Phase | 名称               | 仕様書                         | ステータス |
| ----- | ------------------ | ------------------------------ | ---------- |
| 1     | 要件定義           | `phase-1-requirements.md`      | 未実施     |
| 2     | 設計               | `phase-2-design.md`            | 未実施     |
| 3     | 設計レビューゲート | `phase-3-design-review.md`     | 未実施     |
| 4     | テスト作成         | `phase-4-test-creation.md`     | 未実施     |
| 5     | 実装               | `phase-5-implementation.md`    | 未実施     |
| 6     | テスト拡充         | `phase-6-test-expansion.md`    | 未実施     |
| 7     | カバレッジ確認     | `phase-7-coverage-check.md`    | 未実施     |
| 8     | リファクタリング   | `phase-8-refactoring.md`       | 未実施     |
| 9     | 品質保証           | `phase-9-quality-assurance.md` | 未実施     |
| 10    | 最終レビュー       | `phase-10-final-review.md`     | 未実施     |
| 11    | 手動テスト検証     | `phase-11-manual-test.md`      | 未実施     |
| 12    | ドキュメント更新   | `phase-12-documentation.md`    | 未実施     |
| 13    | PR作成             | `phase-13-pr-creation.md`      | 未実施     |

## 修正対象ファイル

| ファイル          | パス                                                                                                    | 変更内容                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| SkillImportDialog | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | `onImport` 呼び出し時に `id -> name` 変換を追加 |
| AgentView         | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   | `handleImport` 引数名修正                       |
| テスト            | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | テストケース更新                                |

## 前提タスク

| タスクID                            | 概要                      | ステータス |
| ----------------------------------- | ------------------------- | ---------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001   | skill:import 引数形式統一 | ✅ 完了    |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | skill:import 戻り値型変換 | ✅ 完了    |

## 関連Pitfall

| Pitfall ID | タイトル                                      | 関連性               |
| ---------- | --------------------------------------------- | -------------------- |
| P44        | skill:import/remove IPCインターフェース不整合 | 直接関連（解決済み） |
| P45        | IPC引数命名の契約ドリフト                     | 直接関連（解決済み） |
| P39        | happy-dom環境でのuserEvent非互換              | テスト作成時の注意   |
| P40        | テスト実行ディレクトリ依存                    | テスト実行時の注意   |

## 参照資料

| 資料名                     | パス                                                                                                              | 説明                            |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| タスク指示書               | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-task-ut-fix-skill-import-id-mismatch-001.md` | 元のタスク指示書                |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                     | IPC引数の整合性確認手順         |
| API IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                              | `skill:import` チャンネル仕様   |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                       | 契約ドリフト防止パターン        |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                                              | P44, P45（IPC引数契約ドリフト） |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                 | skill:import チャンネル契約     |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                      | agentSlice設計                  |
