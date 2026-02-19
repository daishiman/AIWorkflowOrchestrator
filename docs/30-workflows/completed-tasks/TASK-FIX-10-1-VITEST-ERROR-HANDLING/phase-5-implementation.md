# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 5                                   |
| 機能名 | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 作成日 | 2026-02-19                          |

## 目的

`dangerouslyIgnoreUnhandledErrors: true` を削除し、未処理Promise拒否（Unhandled Rejection）を検出可能にする。設定変更後に失敗するテストの根本原因を特定・修正し、全テストをGreen状態にする。

## 実行タスク

- vitest.config.ts修正: `dangerouslyIgnoreUnhandledErrors: true` を `false` に変更し、最終的に該当行自体を削除
- 失敗テスト分析: 設定変更後に失敗するテストを特定し、エラーカテゴリ別に分類
- テストコード修正: 失敗するテストに対して `try/catch`、`await`、`.catch()` を追加し、未処理Promise拒否を解消
- プロダクションコード修正: テストではなく本体コードに原因がある場合の非同期エラーハンドリング修正
- 非同期クリーンアップ: テスト後の非同期処理のクリーンアップ（タイマー、リスナー、Promise chain等）

## 参照資料

| 資料名                 | パス                                                                  | 説明                                 |
| ---------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| vitest.config.ts       | `apps/desktop/vitest.config.ts`                                       | 現行設定（L43に対象設定あり）        |
| テストセットアップ     | `apps/desktop/src/test/setup.ts`                                      | テスト環境のセットアップファイル     |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | プロジェクトのエラーハンドリング規約 |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                  | テスト関連の既知問題と対策           |

## 実行手順

### ステップ1: 失敗テストの特定

1. `apps/desktop/vitest.config.ts` の L43 `dangerouslyIgnoreUnhandledErrors: true` を `dangerouslyIgnoreUnhandledErrors: false` に変更する
2. `cd apps/desktop && pnpm vitest run 2>&1 | tee /tmp/vitest-failures.log` で全テスト実行し、失敗テストのログを記録する
3. 失敗テストをエラーカテゴリ別に分類する

#### エラーカテゴリ分類テーブル

| カテゴリ                               | 典型的なエラーメッセージ                     | 修正方針                                     |
| -------------------------------------- | -------------------------------------------- | -------------------------------------------- |
| await漏れ（非同期関数）                | `Unhandled promise rejection`                | `await` を追加する                           |
| catch漏れ（Promiseチェーン）           | `Unhandled promise rejection: Error: ...`    | `.catch()` ハンドラを追加する                |
| テストクリーンアップ不足               | テスト終了後に非同期コールバックが実行される | `afterEach` でタイマー・リスナーをクリアする |
| モック設定不足                         | モック未設定のPromise関数が拒否される        | モックの `mockResolvedValue` を設定する      |
| プロダクションコードのハンドリング漏れ | 本体コード内のPromise拒否が未処理            | 本体コードに `try/catch` を追加する          |

### ステップ2: カテゴリ別修正（段階的に実施）

各カテゴリを1つずつ修正し、修正ごとにテストを再実行して失敗数の減少を確認する。

#### 2-1: await漏れの修正

- テスト関数で `async` 宣言されているが `await` されていないPromise呼び出しを特定する
- `await` を追加し、テストが正しく非同期完了を待つようにする
- 修正後: `cd apps/desktop && pnpm vitest run --reporter=verbose` で該当テストのPASSを確認する

#### 2-2: catch漏れの修正

- `.then()` チェーンで `.catch()` が欠如しているPromiseを特定する
- 意図的にエラーを期待するテストは `expect(...).rejects.toThrow()` パターンに変換する
- 修正後: 該当テストのPASSを確認する

#### 2-3: テストクリーンアップ不足の修正

- `afterEach` / `afterAll` で以下のクリーンアップを追加する:
  - `vi.clearAllTimers()`: fakeTimers使用時
  - `vi.restoreAllMocks()`: モック使用時
  - IPC リスナーの解除: `removeAllListeners()` 呼び出し
  - 未完了Promiseのキャンセル: AbortController使用時は `abort()` 呼び出し
- 修正後: 該当テストのPASSを確認する

#### 2-4: モック設定不足の修正

- テスト内でモックされていないPromise関数を特定する
- `mockResolvedValue()` または `mockRejectedValue()` でデフォルト値を設定する
- 修正後: 該当テストのPASSを確認する

#### 2-5: プロダクションコードの修正

- テストではなく本体コードに原因がある場合、本体コードの非同期エラーハンドリングを修正する
- `try/catch` ブロックの追加、または `.catch()` ハンドラの追加を行う
- 修正後: 該当テストのPASSを確認する

### ステップ3: 全テストPASS確認

1. `cd apps/desktop && pnpm vitest run` で全テストを実行し、全PASSを確認する
2. PASSを確認後、`dangerouslyIgnoreUnhandledErrors: false` の行自体を削除する
3. 削除後に再度 `cd apps/desktop && pnpm vitest run` で全テストPASSを確認する

### ステップ4: 設計変更記録（該当する場合）

- プロダクションコードの修正を行った場合、修正内容と理由を `outputs/phase-5/design-changes.md` に記録する

## 統合テスト連携【必須】

非同期エラーハンドリングの修正がIPC通信やMain-Renderer連携に影響する場合の確認:

| 実装項目           | 内容                                                            |
| ------------------ | --------------------------------------------------------------- |
| IPC通信テスト      | IPCハンドラのPromise拒否が正しくキャッチされることを確認        |
| サービス層テスト   | サービスメソッドの非同期エラーが呼び出し元に伝播することを確認  |
| Renderer非同期処理 | Reactコンポーネントの非同期処理がクリーンアップされることを確認 |

## アーキテクチャ層別実装

タスクの性質上、以下の全層でテスト修正が発生する可能性がある:

| 層               | 修正観点                                                                  | 修正ファイル配置                         |
| ---------------- | ------------------------------------------------------------------------- | ---------------------------------------- |
| Renderer Process | Reactコンポーネントテストの非同期処理修正（`act()` 漏れ、`waitFor` 不足） | `apps/desktop/src/renderer/**/*.test.ts` |
| Main Process     | サービス層テストのPromise処理修正（`await` 漏れ、`.catch()` 不足）        | `apps/desktop/src/main/**/*.test.ts`     |
| IPC通信          | IPCハンドラテストのエラーハンドリング修正                                 | `apps/desktop/src/main/ipc/**/*.test.ts` |
| Shared           | 共有ユーティリティのPromise処理修正                                       | `packages/shared/**/*.test.ts`           |

## 実装時の注意事項（既知のPitfall対策）

| Pitfall ID | 注意事項                               | 対策                                                                                    |
| ---------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| P5         | リスナー二重登録                       | React StrictModeの`useEffect`二重実行に注意。テストのクリーンアップでリスナーを解除する |
| P9         | モジュールスコープ変数のテスト間リーク | テストごとにモジュールレベル変数をリセット。`beforeEach`でのリセット処理を確認する      |
| P13        | タイマーテストの無限ループ             | `vi.runAllTimers()` ではなく `vi.advanceTimersByTime()` で1ステップずつ進める           |
| P31        | Zustand Store Hooks無限ループ          | 合成Store Hookの関数を`useEffect`依存配列に含めない。個別セレクタを使用する             |
| P39        | happy-dom環境でのuserEvent非互換       | happy-dom環境では`userEvent`を使わず`fireEvent`を使用する                               |
| P40        | テスト実行ディレクトリ依存             | テスト実行は `cd apps/desktop && pnpm vitest run` で実行する                            |

## 設計変更記録

実装中にプロダクションコードの変更が発生した場合、以下に記録する:

| 変更対象ファイル | 変更内容         | 変更理由         |
| ---------------- | ---------------- | ---------------- |
| （実装時に記入） | （実装時に記入） | （実装時に記入） |

- [ ] 乖離内容と理由を `outputs/phase-5/design-changes.md` に記録（該当する場合）
- [ ] Phase 2設計書への影響を評価し、Phase 10レビューで検証できるようにする（該当する場合）

## 成果物

| 成果物                     | パス                                                | 説明                                                  |
| -------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| 修正済vitest.config        | `apps/desktop/vitest.config.ts`                     | `dangerouslyIgnoreUnhandledErrors` 行が削除された設定 |
| 修正済テストファイル       | `apps/desktop/src/**/*.test.ts`                     | 非同期エラーハンドリングが修正されたテスト            |
| 修正済プロダクションコード | `apps/desktop/src/**/*.ts`（該当する場合）          | 非同期エラーハンドリングが修正されたコード            |
| 失敗テスト分析結果         | `outputs/phase-5/failure-analysis.md`               | カテゴリ別の失敗テスト一覧と修正内容                  |
| 設計変更記録               | `outputs/phase-5/design-changes.md`（該当する場合） | プロダクションコード変更の記録                        |

## 完了条件

- [ ] `apps/desktop/vitest.config.ts` から `dangerouslyIgnoreUnhandledErrors` 行が完全に削除されている
- [ ] `cd apps/desktop && pnpm vitest run` で全テストがPASSする
- [ ] 未処理Promise拒否（Unhandled Rejection）が0件である
- [ ] 失敗テスト分析結果（`outputs/phase-5/failure-analysis.md`）が作成されている
- [ ] プロダクションコードを変更した場合、設計変更記録が作成されている
- [ ] アーキテクチャ層別の修正が完了している（Renderer/Main/IPC/Shared）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. ステップ1: 失敗テストの特定とカテゴリ分類
3. ステップ2-1: await漏れの修正
4. ステップ2-2: catch漏れの修正
5. ステップ2-3: テストクリーンアップ不足の修正
6. ステップ2-4: モック設定不足の修正
7. ステップ2-5: プロダクションコードの修正（該当する場合）
8. ステップ3: 全テストPASS確認と設定行の削除
9. 統合テスト連携の実施
10. 成果物の作成・配置
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## TDD検証

```bash
# テスト実行コマンド
cd apps/desktop && pnpm vitest run

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
# - [ ] dangerouslyIgnoreUnhandledErrors 行が存在しないこと
# - [ ] Unhandled Rejection の警告が0件であること
```

## 次のPhase

Phase 6: テスト拡充
