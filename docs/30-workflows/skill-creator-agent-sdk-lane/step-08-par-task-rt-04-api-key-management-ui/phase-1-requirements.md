# Phase 1: 要件定義

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 1                     |
| 機能名 | api-key-management-ui |
| 作成日 | 2026-03-29            |

## 目的

既存の AUTH_KEY 系 IPC チャネルの仕様を確認し、Renderer 側に必要な API キー管理 UI の要件を固定する。

## 実行タスク

- 既存 IPC チャネル（AUTH_KEY_SET/EXISTS/VALIDATE/DELETE）の仕様を確認する
- preload API に公開すべきメソッドの一覧を定義する
- `ApiKeyStatus` 型の要件を定義する
- UI の状態遷移（未設定→検証中→設定済み/エラー）を定義する
- AC-1〜AC-5 への写像を確認する

## 参照資料

| 資料名           | パス                                            | 説明                      |
| ---------------- | ----------------------------------------------- | ------------------------- |
| 要件草案         | `../requirements-draft.md`                      | skill-creator 全体の要件  |
| 親 workflow pack | `../root-workflow-pack/index.md`                | lane 共通不変条件         |
| IPC ハンドラ     | `apps/desktop/src/main/ipc/index.ts`            | AUTH_KEY 系チャネルの実装 |
| preload API      | `apps/desktop/src/preload/skill-creator-api.ts` | 既存 preload パターン     |
| 型定義           | `packages/shared/src/types/skillCreator.ts`     | 現行型定義                |

## 完了条件

- [ ] AUTH_KEY 系 IPC チャネルの仕様が確認されている
- [ ] preload API に公開するメソッド一覧が定義されている
- [ ] `ApiKeyStatus` 型と状態遷移が定義されている
- [ ] UI のバリデーション要件が定義されている
- [ ] AC-1〜AC-5 への写像が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
