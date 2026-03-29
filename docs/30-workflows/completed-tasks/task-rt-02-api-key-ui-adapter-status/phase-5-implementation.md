# Phase 5: 実装

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 5                                    |
| Phase名    | 実装                                 |
| 前提Phase  | Phase 4                              |
| 後続Phase  | Phase 6                              |
| ステータス | spec_created                         |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |

## 目的

`ApiKeysSection` に接続状態表示と retry UX を最小変更で追加し、既存 API key フローを維持したまま Red テストを Green にする。

## 実行タスク

- helper 実装: health 結果から UI 状態を導出する
- UI 実装: badge / failure reason / retry CTA を追加する
- refresh 実装: mount、save/delete、retry 時の再評価フローを整える

## 実行手順

### タスク1: 状態導出 helper 実装

目的:

- `ProviderStatus` と `HealthCheckResult` から `initializing/ready/failed` を導出する

制約:

- 新規 shared 型は追加しない
- helper は Renderer 側に閉じる

### タスク2: `ApiKeysSection` の局所 state 拡張

目的:

- provider ごとの health 結果、進行中フラグ、retry 対象を管理する

制約:

- global `llmSlice` は変更しない
- 既存 save/delete/validate フローの state と干渉させない

### タスク3: 表示実装

目的:

- provider 行に status badge を表示する
- failed 時は retry CTA を表示する
- failure reason を補助表示する

### タスク4: refresh 実装

目的:

- mount 後に登録済み provider を順次確認する
- save/delete 後は provider 一覧と該当 health を再読込する
- retry は対象 provider のみ再確認する

## 統合テスト連携【必須】

| 判定項目                   | 基準 | 結果   |
| -------------------------- | ---- | ------ |
| helper 単体テスト          | 100% | 未実施 |
| `ApiKeysSection` UI テスト | 100% | 未実施 |
| retry シナリオ             | 100% | 未実施 |
| 回帰シナリオ               | 100% | 未実施 |

## 参照資料

| 参照資料        | パス                                                                      | 内容                                 |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------ |
| 現行 UI         | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx` | 実装対象                             |
| health IPC      | `apps/desktop/src/main/handlers/llm.ts`                                   | `handleCheckHealth()`                |
| preload surface | `apps/desktop/src/preload/index.ts`                                       | `window.electronAPI.llm.checkHealth` |

## 成果物

| 成果物       | パス                                        | 説明                               |
| ------------ | ------------------------------------------- | ---------------------------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更ファイル、実装判断、テスト結果 |

## 完了条件

- [ ] helper 実装が完了している
- [ ] `ApiKeysSection` への状態表示追加が完了している
- [ ] retry UX が対象行単位で動作する
- [ ] 既存 save/delete/validate フローに回帰がない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
