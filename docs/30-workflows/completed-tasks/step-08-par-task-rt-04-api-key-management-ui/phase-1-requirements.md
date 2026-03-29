# Phase 1: 要件定義

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 1                     |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

SkillLifecyclePanel に本当に必要な API キー導線が何かを current facts で固定し、重複 UI を増やさない要件へ再定義する。

## 実行タスク

- 現行の Settings / authKey / SkillLifecycle 契約を棚卸しする
- 汎用 API キー管理と Claude/AuthKey 導線の責務境界を定義する
- AC-1〜AC-6 を検証可能な要件へ写像する

## 参照資料

| 資料名          | パス                                                                                                   | 説明                        |
| --------------- | ------------------------------------------------------------------------------------------------------ | --------------------------- |
| メイン仕様      | `index.md`                                                                                             | タスク全体定義              |
| lane 要件       | `../skill-creator-agent-sdk-lane/requirements-draft.md`                                                | 元要求                      |
| lane pack       | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md`                                          | 共通制約                    |
| Skill UI        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                   | 統合先                      |
| Settings UI     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                              | 既存汎用UI                  |
| preload authKey | `apps/desktop/src/preload/authKeyApi.ts`                                                               | AuthKey 契約                |
| preload bridge  | `apps/desktop/src/preload/index.ts`                                                                    | `window.electronAPI` 公開面 |
| system spec     | `.agents/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | APIキー系整合仕様           |

## 実行手順

### ステップ1: current facts を固定する

1. `SkillLifecyclePanel.tsx` に既存の AuthKey 導線があるか確認する。
2. Settings 側 `ApiKeysSection` の責務を記録する。
3. `window.electronAPI.authKey` / `window.electronAPI.apiKey` の公開面を比較する。

### ステップ2: 要件を分解する

1. UI責務、preload責務、型責務、テスト責務へ分解する。
2. Anthropic/AuthKey 専用導線と汎用 provider 管理の境界を定義する。
3. env-fallback を含む状態一覧を定義する。

### ステップ3: 受入基準へ写像する

1. 各要件を AC-1〜AC-6 へ対応付ける。
2. スコープ外項目を明示する。
3. Phase 2 へ渡す未確定論点を列挙する。

## 統合テスト連携

- Phase 4 で UI・IPC・状態遷移の test matrix を起こす。
- Phase 5 で `SkillLifecyclePanel` と preload 契約の接続テストを追加する。
- Phase 6 で env-fallback / error path を補強する。

## 成果物

| 成果物                   | パス                                         | 説明       |
| ------------------------ | -------------------------------------------- | ---------- |
| current facts マトリクス | `outputs/phase-1/current-facts-matrix.md`    | 実装棚卸し |
| 要件定義書               | `outputs/phase-1/requirements-definition.md` | 要件本文   |
| 受入基準表               | `outputs/phase-1/acceptance-criteria.md`     | AC 対応表  |

## 完了条件

- [ ] current facts が Settings / authKey / SkillLifecycle の3系統で整理されている
- [ ] 重複 UI を避ける責務境界が定義されている
- [ ] AC-1〜AC-6 への写像が作成されている
- [ ] スコープ外と未確定論点が明示されている
- [ ] **本Phase内の全タスクを100%実行完了**
