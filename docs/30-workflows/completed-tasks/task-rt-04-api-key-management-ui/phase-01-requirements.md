# Phase 1: 要件定義 - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| タスクID   | TASK-RT-04                            |
| Phase      | 1 - 要件定義                          |
| 関連Issue  | #1881                                 |
| 前提タスク | なし（並列確認可能）                  |
| タスク分類 | UI task（既存 auth-key 契約の再利用） |
| ステータス | pending                               |

## 目的

`SettingsView` を主導線、`SkillLifecyclePanel` を補助導線として、同一の `auth-key:*` 契約で API キーの存在確認・保存・検証・削除を扱う。

## 実行タスク

- current contract の棚卸しと drift の特定
- `auth-key:*` と `ApiKeyStatus` の整合確認
- スコープ定義と受入条件の明文化
- Phase 11-13 の証跡要件を先に固定する

## 参照資料

| 資料名                  | パス                                                                                                                                                              | 用途                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| auth-key IPC 正本       | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                                                                                                                    | Main 側の current contract  |
| auth-key Preload API    | `apps/desktop/src/preload/authKeyApi.ts`                                                                                                                          | Renderer への公開面         |
| API キー設定パネル      | `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`                                                                                              | 補助導線 UI                 |
| SkillLifecyclePanel     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                                                                              | 補助導線の統合先            |
| SettingsView            | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                                                                                          | 主導線の参照先              |
| shared type             | `packages/shared/src/types/skillCreator.ts`                                                                                                                       | `ApiKeyStatus` の正本       |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md` / `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md` | canonical UI / IPC contract |

## P50チェック（着手時点の実装状況）

| 確認対象                         | 状態     | 備考                                         |
| -------------------------------- | -------- | -------------------------------------------- |
| `authKeyHandlers.ts`             | 実装済み | `auth-key:set/exists/validate/delete` を提供 |
| `authKeyApi.ts`                  | 実装済み | `window.electronAPI.authKey` を公開          |
| `ApiKeySettingsPanel.tsx`        | 実装済み | 補助導線 UI                                  |
| `SkillLifecyclePanel.tsx`        | 実装済み | `<ApiKeySettingsPanel />` を埋め込み済み     |
| `SettingsView/index.tsx`         | 実装済み | 主導線として `AuthKeySection` を提供         |
| `ApiKeyStatus`                   | 実装済み | `not_set / validating / configured / error`  |
| `skill-creator:*` 新規 namespace | 不要     | 現在の正本では採用しない                     |

## スコープ定義

**含むもの**

- `auth-key:set` / `auth-key:exists` / `auth-key:validate` / `auth-key:delete`
- `AuthKeyStatus` 相当の UI 状態管理
- `ApiKeySettingsPanel` と `SkillLifecyclePanel` の統合
- `SettingsView` との contract 整合確認
- Phase 11 の画面証跡、Phase 12 の compliance check、Phase 13 の blocked 記録

**含まないもの**

- `skill-creator:*` の新規 IPC namespace
- provider ごとの API キー管理の再設計
- `SettingsView` の主導線責務の変更
- commit / PR / push

## 受入条件

- AC-1: `auth-key:exists` が `exists` と `source` を返し、`not-set` / `saved` / `env-fallback` を判別できる
- AC-2: `auth-key:set` が API キーを保存し、成功/失敗を一貫したレスポンスで返す
- AC-3: `auth-key:validate` が入力キーの検証結果を返す
- AC-4: `auth-key:delete` が保存済みキーを削除できる
- AC-5: `SettingsView` 主導線と `SkillLifecyclePanel` 補助導線が同一契約を共有する
- AC-6: `ApiKeyStatus` が `not_set / validating / configured / error` に収束する
- AC-7: エラー出力に API キーの生値が含まれない
- AC-8: Phase 4 / 9 / 11 / 12 の成果物がすべて整合する

## IPC 4層整合性チェック

| 層             | 確認内容                                                  | 対象ファイル                                       |
| -------------- | --------------------------------------------------------- | -------------------------------------------------- |
| 1. Shared type | `ApiKeyStatus` が正本として定義されている                 | `packages/shared/src/types/skillCreator.ts`        |
| 2. Main IPC    | `auth-key:*` を `authKeyHandlers.ts` が処理する           | `apps/desktop/src/main/ipc/authKeyHandlers.ts`     |
| 3. Preload API | `window.electronAPI.authKey` が公開される                 | `apps/desktop/src/preload/authKeyApi.ts`           |
| 4. Renderer    | `ApiKeySettingsPanel` と `SkillLifecyclePanel` が利用する | `apps/desktop/src/renderer/components/skill/*.tsx` |

## 統合テスト連携

- Phase 2 の設計へ current facts を引き継ぐ。
- 受入条件 AC-1〜AC-8 は Phase 4 / 5 / 9 / 11 / 12 の検証へ接続する。

## 成果物

| 成果物           | パス                                       |
| ---------------- | ------------------------------------------ |
| 要件定義サマリー | outputs/phase-1/requirements-definition.md |
| 現状棚卸し       | outputs/phase-1/current-state-inventory.md |
| 受入条件一覧     | outputs/phase-1/acceptance-criteria.md     |

## 完了条件

- [ ] current contract の棚卸しが完了している
- [ ] スコープが `auth-key:*` / `SettingsView` / `SkillLifecyclePanel` に収束している
- [ ] 受入条件 AC-1〜AC-8 が定義されている
- [ ] `skill-creator:*` の新規導入が不要であると明記されている
- [ ] Phase 2 への入力が揃っている

## 次Phase

Phase 2（設計）へ進む。Phase 3 で MAJOR 判定の場合は Phase 2 へ戻る。
