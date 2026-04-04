# Phase 7: カバレッジ -- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase番号  | 7                     |
| 機能名     | sdk-session-bridge    |
| タスクID   | TASK-SDK-SC-01        |
| 作成日     | 2026-04-02            |
| 依存 Phase | Phase 6（テスト拡充） |

## 目的

`SkillCreatorSdkSession` と `SkillCreatorIpcBridge` のテストカバレッジを計測し、目標値（≥80%）を達成していることを確認する。不足している場合は追加テストを実装する。

## 実行タスク

### Task 7-1: カバレッジ計測コマンド

```bash
pnpm --filter @repo/desktop vitest run --coverage \
  src/main/services/runtime/__tests__/SkillCreatorSdkSession.test.ts \
  src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts
```

または全体計測:

```bash
pnpm --filter @repo/desktop vitest run --coverage --reporter=verbose
```

### Task 7-2: カバレッジ目標

| ファイル                                                           | 目標カバレッジ | 計測対象                      |
| ------------------------------------------------------------------ | -------------- | ----------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts` | ≥ 80%          | statements / branches / lines |
| `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`  | ≥ 80%          | statements / branches / lines |
| `packages/shared/src/types/skillCreatorSession.ts`                 | 対象外         | 型定義のみのため              |
| `packages/shared/src/ipc/channels.ts`（追加部分）                  | 対象外         | 定数定義のみのため            |

### Task 7-3: カバレッジ不足時の対応

カバレッジが 80% を下回る場合、以下のパスを中心に追加テストを作成する:

#### `SkillCreatorSdkSession` で未カバーになりやすいパス

| パス                                            | 追加テストの内容                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| `sendAnswer()` の `pendingResolve` null ガード  | T-03-4: pendingResolve が null のときの警告ログ出力を検証        |
| タイムアウト後の `pendingResolve` null リセット | T-09-4: タイムアウト後に pendingResolve が null になることを検証 |
| セッション二重起動ガード                        | T-07-5: 既存セッション中に startSession() が呼ばれた場合のガード |
| SDK エラーの catch ブロック                     | T-05-4: SDK が非同期で例外を throw した場合の処理                |

#### `SkillCreatorIpcBridge` で未カバーになりやすいパス

| パス                                          | 追加テストの内容                                                   |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `currentSession` が null のまま answer を受信 | T-06-7: セッション未開始時に answer IPC を受信した場合の安全動作   |
| `window.webContents` が無効な場合             | T-06-8: webContents.isDestroyed() が true の場合に send を呼ばない |

### Task 7-4: カバレッジレポートの確認

カバレッジレポートの出力先: `apps/desktop/coverage/`

以下の指標を記録する:

| ファイル                  | Statements | Branches | Lines | 目標達成 |
| ------------------------- | ---------- | -------- | ----- | -------- |
| SkillCreatorSdkSession.ts | %          | %        | %     | - [ ]    |
| SkillCreatorIpcBridge.ts  | %          | %        | %     | - [ ]    |

（実装後に実測値を記入する）

## 参照資料

| 資料名                | パス                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------ |
| Phase 6 テスト拡充    | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-6-test-expansion.md` |
| Vitest カバレッジ設定 | `apps/desktop/vitest.config.ts`                                                      |

## 成果物

| 成果物                   | パス                                                        | 形式        |
| ------------------------ | ----------------------------------------------------------- | ----------- |
| カバレッジレポート       | `apps/desktop/coverage/`                                    | HTML / JSON |
| 追加テスト（必要な場合） | `apps/desktop/src/main/services/runtime/__tests__/`（追記） | TypeScript  |

## 完了条件

- [ ] カバレッジ計測コマンドを実行した
- [ ] `SkillCreatorSdkSession.ts` のカバレッジが ≥ 80% であることを確認した
- [ ] `SkillCreatorIpcBridge.ts` のカバレッジが ≥ 80% であることを確認した
- [ ] カバレッジ不足のパスに追加テストを実装した（不足がある場合）
- [ ] カバレッジレポートの実測値をテーブルに記入した

## 次の Phase

Phase 8: リファクタリング（`phase-8-refactoring.md`）
