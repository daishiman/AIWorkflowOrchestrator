# Phase 2: 設計

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 2                                   |
| 機能名 | session-resume-renderer-integration |
| 作成日 | 2026-03-29                          |

## 目的

Phase 1 で定義した要件に基づき、セッション復元のレンダラー統合の技術設計を行う。コンポーネント構成、インターフェース、データフローに加えて、`session_id`、`resume` / `continue` / `forkSession`、互換性判定の設計を定義する。

## 実行タスク

- コンポーネント構成の設計
- インターフェース定義
- データフローの設計
- topology / validation path の設計
- IPC 4層整合表の作成
- DI 境界の型配置判断
- `session_id` / `manifestHash` / provenance の保存形の設計
- `resume` / `continue` / `forkSession` の選択条件設計
- エラーハンドリング方針の定義

## 参照資料

| 資料名       | パス                                                                           | 説明       |
| ------------ | ------------------------------------------------------------------------------ | ---------- |
| Phase 1 要件 | `phase-1-requirements.md`                                                      | 要件定義   |
| index.md     | `index.md`                                                                     | タスク概要 |
| RT-06        | `../step-08-par-task-rt-06-claude-sdk-message-contract-normalization/index.md` | SDK 契約   |

## 実行手順

### ステップ1: コンポーネント構成を設計する

変更対象のコンポーネントと新規コンポーネントの関係を設計する。

### ステップ2: インターフェースを定義する

型定義、API 境界、IPC チャネルを設計する。

### ステップ3: データフローを設計する

入力から出力までのデータの流れを設計する。

### ステップ4: resume / compatibility を設計する

- `session_id` を primary key として保持する
- `manifestHash` / `sourceRoot` / `resolvedSkillPath` で resume 互換性を再判定する
- 非互換なら `resume` ではなく新規開始または `forkSession` を選択する

### ステップ5: エラーハンドリング方針を定義する

想定されるエラーパターンと対処方針を定義する。

## トポロジー（concern 別）

| concern       | 主担当        | 境界                          |
| ------------- | ------------- | ----------------------------- |
| Session API   | main + IPC    | Facade を IPC で公開          |
| Renderer UI   | renderer      | UI 状態は renderer に閉じる   |
| Compatibility | shared + main | manifest/source snapshot 判定 |
| Cleanup       | main          | TTL 管理                      |

## Validation Path（command 単位）

| 検証対象    | コマンド/方法                         | 期待結果 |
| ----------- | ------------------------------------- | -------- |
| unit        | `pnpm vitest run -t "session resume"` | pass     |
| integration | 既存 integration suite                | pass     |
| UI          | Phase 11 手動 + screenshot            | pass     |

## IPC 4層整合表

| 層             | 確認内容               | 想定ファイル                                    |
| -------------- | ---------------------- | ----------------------------------------------- |
| 定数定義       | IPC_CHANNELS 追加      | `packages/shared/src/ipc/channels.ts`           |
| ホワイトリスト | preload allowlist 登録 | `apps/desktop/src/preload/`                     |
| ハンドラ登録   | `ipcMain.handle` 登録  | `apps/desktop/src/main/ipc/index.ts`            |
| Preload API    | renderer から呼べる    | `apps/desktop/src/preload/skill-creator-api.ts` |

## DI 境界の型配置

| 条件                   | 配置先                       |
| ---------------------- | ---------------------------- |
| main + renderer で共有 | `packages/shared/`           |
| main 内のみ            | `apps/desktop/src/main/`     |
| renderer 内のみ        | `apps/desktop/src/renderer/` |

## 統合テスト連携

| テスト項目 | 確認内容                   | 期待結果 |
| ---------- | -------------------------- | -------- |
| IPC        | session list/detail の往復 | success  |
| resume     | 互換判定とフォールバック   | success  |

## 多角的チェック観点（AIが判断）

- システム: IPC 4層の欠落や責務混在がないか
- 戦略・価値: UI 追加が最小の複雑性で目的を満たすか
- 問題解決: simpler alternative が存在しないか

## サブタスク管理

| Subtask | 内容                   | 依存 |
| ------- | ---------------------- | ---- |
| ST-1    | IPC 4層整合表の作成    | なし |
| ST-2    | validation path の定義 | ST-1 |
| ST-3    | DI 境界の型配置判断    | ST-1 |

## 成果物

| 成果物           | パス                                 | 説明       |
| ---------------- | ------------------------------------ | ---------- |
| 設計ドキュメント | `outputs/phase-2/design-document.md` | 技術設計書 |

## 完了条件

- [ ] コンポーネント構成が設計されている
- [ ] インターフェースが定義されている
- [ ] データフローが設計されている
- [ ] `session_id` / compatibility / resume 選択条件が定義されている
- [ ] エラーハンドリング方針が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 実行タスクに列挙した項目が全て完了
- [ ] 成果物が出力されている

## 次Phase

Phase 3: 設計レビュー
