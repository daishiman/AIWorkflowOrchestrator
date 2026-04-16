# Phase 2: 設計

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 2                                  |
| タスクID   | TASK-SW-CANCEL-004                 |
| 機能名     | skill-creator-cancel-renderer-hook |
| 前提Phase  | Phase 1                            |
| 後続Phase  | Phase 3                            |
| 作成日     | 2026-04-15                         |
| ステータス | pending                            |

## 目的

`cancelGeneration()` への IPC 呼び出し追加の設計を確定する。非同期化の要否・エラーハンドリング方針・呼び出し順序・IPC 4層完全接続の確認を設計書に記録する。

## 設計内容

### 1. cancelGeneration() の修正設計

**現状（修正前）:**

```typescript
const cancelGeneration = useCallback(() => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  // AbortController.abort() で Main Process 側の処理も中断される（将来の意図）
}, [setStage]);
```

**修正後:**

```typescript
const cancelGeneration = useCallback(async () => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setStage("cancelled");
  // IPC 経由でメインプロセスにキャンセルを通知
  await window.skillCreatorAPI?.cancelGeneration?.();
}, [setStage]);
```

### 2. 設計判断

| 判断項目           | 判断                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| 非同期化           | `async` に変更する（`await` で IPC の完了を待つ）                                      |
| エラーハンドリング | オプショナルチェーン（`?.`）で `skillCreatorAPI` が未定義の場合をガード                |
| 呼び出し順序       | `abort()` → `setStage("cancelled")` → IPC の順（UI 状態を先に更新）                    |
| 呼び出し元への影響 | `cancelGeneration` を `async` にしても呼び出し元（ボタンの onClick）は非同期で問題なし |
| IPC 失敗時の扱い   | IPC 失敗は無視（UI 状態は既に `cancelled` になっているため）                           |

### 3. IPC 4層完全接続の確認

| 層                   | 担当タスク         | ステータス |
| -------------------- | ------------------ | ---------- |
| 1. 定数定義          | TASK-SW-CANCEL-001 | 完了       |
| 2. ホワイトリスト    | TASK-SW-CANCEL-002 | 完了       |
| 3. ハンドラ登録      | TASK-SW-CANCEL-003 | 完了       |
| 4. Preload API       | TASK-SW-CANCEL-002 | 完了       |
| 5. Renderer 呼び出し | TASK-SW-CANCEL-004 | 本タスク   |

本タスクで全層が接続される。

### 4. 並行リクエスト防止の考慮

| チェック項目               | 判断                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| キャンセルボタンの連打防止 | `abortControllerRef` を `null` にすることで2回目の呼び出しは no-op になる                                             |
| IPC の二重送信防止         | `abortControllerRef.current?.abort()` の `?.` で null 時は abort() が呼ばれないため、IPC も呼ばれない（設計確認必要） |

## 統合テスト連携【必須】

| 判定項目                      | 基準 | 結果    |
| ----------------------------- | ---- | ------- |
| cancelGeneration 修正設計完了 | 完了 | pending |
| IPC 4層完全接続確認完了       | 完了 | pending |
| 呼び出し元への影響評価完了    | 完了 | pending |

## 多角的チェック観点（AIが判断）

- [ ] `async` 化による `useCallback` の依存配列への影響がないか
- [ ] `window.skillCreatorAPI` が Electron 環境外（テスト）で `undefined` になる場合のガードが正しいか
- [ ] IPC 呼び出しが `void` の場合に `await` が安全か

## サブタスク管理

1. cancelGeneration() 修正設計
2. 非同期化・エラーハンドリング設計
3. IPC 4層完全接続確認表の作成
4. 並行リクエスト防止の考慮記録
5. 成果物の出力

## 成果物

| 成果物 | パス                        | 説明                                   |
| ------ | --------------------------- | -------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | cancelGeneration 修正設計・IPC 4層確認 |

## 完了条件

- [ ] `cancelGeneration()` の修正設計が確定している
- [ ] IPC 4層完全接続の確認表が作成されている
- [ ] 呼び出し元への影響評価が記録されている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビューゲート
