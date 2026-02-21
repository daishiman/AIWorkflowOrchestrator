# UT-FIX-SKILL-IMPORT-RETURN-TYPE-001: skill:import IPCハンドラ戻り値型不整合修正 - ワークフローインデックス

## 概要

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名   | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 機能名     | skill-import-return-type-fix                                                 |
| 分類       | バグ修正                                                                     |
| 規模       | 小                                                                           |
| ステータス | Phase 1〜12 完了（Phase 13はPR作成待ち）                                     |
| 作成日     | 2026-02-21                                                                   |
| ブランチ名 | `fix/ut-fix-skill-import-return-type-001`                                    |

---

## 問題の概要

### 現在の不整合

skill:import IPCハンドラの戻り値型に不整合が存在する。Main Process側のハンドラは`ImportResult`型（`{ success, importedCount, errors }`）を返すが、Preload側の型宣言は`ImportedSkill`を期待しており、Renderer側の`agentSlice.ts`は`ImportedSkill`として`importedSkills`配列に格納する。結果として、UIのスキル一覧にスキル情報が正しく表示されない。

### 型定義の差異

| プロパティ      | `ImportResult`（現在の戻り値） | `ImportedSkill`（期待される戻り値） |
| --------------- | ------------------------------ | ----------------------------------- |
| `success`       | ✅ `boolean`                   | ❌ 存在しない                       |
| `importedCount` | ✅ `number`                    | ❌ 存在しない                       |
| `errors`        | ✅ `string[]`                  | ❌ 存在しない                       |
| `name`          | ❌ 存在しない                  | ✅ `string`                         |
| `description`   | ❌ 存在しない                  | ✅ `string`                         |
| `path`          | ❌ 存在しない                  | ✅ `string`                         |
| `importedAt`    | ❌ 存在しない                  | ✅ `Date`                           |
| `status`        | ❌ 存在しない                  | ✅ `"active" \| "inactive"`         |
| `agents`        | ❌ 存在しない                  | ✅ `AgentDefinition[]`              |
| `allowedTools`  | ❌ 存在しない                  | ✅ `string[]`                       |

### 修正方針

ハンドラ内で`importSkills()`実行後に`getSkillByName()`を呼び出し、`ImportedSkill`型のデータを取得して返却する。

---

## 修正対象ファイル

| ファイルパス                                                                            | 修正内容                               |
| --------------------------------------------------------------------------------------- | -------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                            | ハンドラロジック修正（2ステップ化）    |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             | テストのモック戻り値・アサーション修正 |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | モック戻り値を`ImportedSkill`型に修正  |

---

## Phase一覧

| Phase | 名称               | ステータス | 仕様書パス                         |
| ----- | ------------------ | ---------- | ---------------------------------- |
| 1     | 要件定義           | 完了       | `phase-1-requirements.md`          |
| 2     | 設計               | 完了       | `phase-2-design.md`                |
| 3     | 設計レビューゲート | 完了       | `phase-3-design-review.md`         |
| 4     | テスト作成         | 完了       | `phase-4-test-creation.md`         |
| 5     | 実装               | 完了       | `phase-5-implementation.md`        |
| 6     | テスト拡充         | 完了       | `phase-6-test-expansion.md`        |
| 7     | カバレッジ確認     | 完了       | `phase-7-coverage-verification.md` |
| 8     | リファクタリング   | 完了       | `phase-8-refactoring.md`           |
| 9     | 品質検証           | 完了       | `phase-9-quality-assurance.md`     |
| 10    | 最終レビュー       | 完了       | `phase-10-final-review.md`         |
| 11    | 手動テスト検証     | 完了       | `phase-11-manual-testing.md`       |
| 12    | ドキュメント更新   | 完了       | `phase-12-documentation.md`        |
| 13    | 完了・PR準備       | 保留       | `phase-13-completion.md`           |

---

## 関連タスク

| タスクID                          | 関係     | 説明                                         | ステータス |
| --------------------------------- | -------- | -------------------------------------------- | ---------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 同時推奨 | skill:import引数形式修正（同一ハンドラ修正） | 完了       |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 先行事例 | skill:remove IPCインターフェース不整合修正   | 完了       |

---

## 関連パターン（既知の落とし穴）

| Pitfall ID | タイトル                                      | 関連性                                                 |
| ---------- | --------------------------------------------- | ------------------------------------------------------ |
| P23        | API二重定義の型管理複雑性                     | Preload型宣言とMain実装の不整合                        |
| P32        | 型定義の二箇所同時更新必須                    | shared/types.ts と preload/types.ts の同期             |
| P42        | .trim()バリデーション漏れ                     | 引数バリデーション3段チェック                          |
| P44        | skill:import/remove IPCインターフェース不整合 | 本タスクの原因パターン（引数修正は完了、戻り値が残存） |

---

## 参照資料

| 資料名             | パス                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| タスク指示書（元） | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-task-ut-fix-skill-import-return-type-001.md` |
| IPC Agent仕様書    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                              |
| SDK Skill型仕様書  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                 |
| 実装パターン集     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                       |
| セキュリティ仕様書 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                      |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                                              |

---

## 現在の運用状態

1. Phase 1〜12 は完了済み（成果物は `outputs/phase-*` を参照）
2. Phase 13 は PR作成待ち（ユーザー許可なしでPR作成しない）
3. 仕様の正本は `/.claude/skills/aiworkflow-requirements/` 側を参照
