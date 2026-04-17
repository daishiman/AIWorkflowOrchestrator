# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 1                                |
| タスクID   | TASK-SW-CANCEL-002               |
| 機能名     | skill-creator-cancel-preload-api |
| 前提Phase  | -                                |
| 後続Phase  | Phase 2                          |
| 作成日     | 2026-04-15                       |
| ステータス | pending                          |

## 目的

`apps/desktop/src/preload/skill-creator-api.ts` と `apps/desktop/src/preload/channels.ts` の現状を確認し、`cancelGeneration` メソッド追加と `ALLOWED_INVOKE_CHANNELS` 登録の要件・受け入れ基準を固定する。

## 対象ファイルの現状確認

### 確認対象1: skill-creator-api.ts

- `SkillCreatorAPI` インターフェース（:69付近）の現在の定義を確認する
- `safeInvoke` の既存使用例（`createSkill` 等）を確認し、`cancelGeneration` の実装パターンを把握する
- `IpcResult<void>` 型の定義と使用例を確認する

### 確認対象2: preload/channels.ts

- `ALLOWED_INVOKE_CHANNELS` の現在の構成を確認する
- `SKILL_CREATOR_CANCEL` が未登録であることを確認する（CANCEL-001 完了後）

### 現状の問題

TASK-SW-CANCEL-001 で `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が追加されたが、以下が未実装:

1. `SkillCreatorAPI` インターフェースに `cancelGeneration` メソッドが存在しない
2. `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を呼び出す実装が存在しない
3. `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が未登録

`safeInvoke` は `invokeWithTimeout` → ホワイトリスト検証を行うため、`ALLOWED_INVOKE_CHANNELS` への登録なしに invoke は動作しない。

## 要件

### 機能要件

1. `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` を追加する
2. `cancelGeneration` の実装として `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を使用する
3. `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を追加する

### 非機能要件

1. 既存テストを壊さない
2. `pnpm typecheck` PASS
3. 既存の `safeInvoke` パターンと一致した実装

## 受け入れ基準

| ID   | 受け入れ基準                                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------- |
| AC-1 | `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` が定義されている |
| AC-2 | 実装が `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を呼び出している                                  |
| AC-3 | `ALLOWED_INVOKE_CHANNELS` に `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が含まれている                          |
| AC-4 | `pnpm typecheck` が PASS する（型エラーなし）                                                            |

## IPC 4層接続における本タスクの位置づけ

| 層  | 担当                               | タスク             | ステータス   |
| --- | ---------------------------------- | ------------------ | ------------ |
| 1   | 定数定義（shared channels.ts）     | TASK-SW-CANCEL-001 | 完了         |
| 2   | ホワイトリスト（preload channels） | TASK-SW-CANCEL-002 | **本タスク** |
| 3   | ハンドラー登録（main ipcMain）     | TASK-SW-CANCEL-003 | 後続         |
| 4   | Preload API（contextBridge）       | TASK-SW-CANCEL-002 | **本タスク** |
| 5   | Renderer 呼び出し（フック修正）    | TASK-SW-CANCEL-004 | 後続         |

## 統合テスト連携【必須】

| 判定項目                        | 基準     | 結果    |
| ------------------------------- | -------- | ------- |
| AC-1〜AC-4 が全て定義されている | 定義済み | pending |

## 多角的チェック観点（AIが判断）

- [ ] `safeInvoke` の戻り値型が `Promise<IpcResult<void>>` と一致するか
- [ ] `ALLOWED_INVOKE_CHANNELS` の登録形式（他エントリの形式）と一致しているか

## サブタスク管理

1. `skill-creator-api.ts` の `SkillCreatorAPI` インターフェース・`safeInvoke` 使用例確認
2. `preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` 現状確認
3. AC-1〜AC-4 を受け入れ基準として確定
4. 要件定義書・受け入れ基準の成果物作成

## 成果物

| 成果物       | パス                                         | 説明                     |
| ------------ | -------------------------------------------- | ------------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 要件・背景・対象ファイル |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-4               |

## 完了条件

- [ ] 対象ファイルの現状が確認されている
- [ ] AC-1〜AC-4 が固定されている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
