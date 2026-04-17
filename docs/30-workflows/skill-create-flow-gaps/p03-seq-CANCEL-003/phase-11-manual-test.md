# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 11                                |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 10                          |
| 後続Phase  | Phase 12                          |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

ビルド確認・型チェック・`SKILL_CREATOR_CANCEL` ハンドラーが実際に登録されているかを手動で確認する。

## 実行手順

### 1. ビルド確認

```bash
pnpm --filter @repo/desktop build
```

### 2. 型チェック（モノレポ全体）

```bash
pnpm typecheck
```

### 3. 手動テストシナリオ

| シナリオ                                                  | 手順                                                                                      | 期待結果                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `cancelCurrentOperation` が public メソッドとして存在する | TypeScript ファイルから `service.cancelCurrentOperation()` を参照                         | 型エラーなく参照できる                               |
| `SKILL_CREATOR_CANCEL` ハンドラーが登録される             | アプリ起動後にメインプロセスログでハンドラー登録を確認                                    | ログに登録メッセージが表示される（設定次第）         |
| Preload 経由での cancelGeneration invoke が届く           | CANCEL-002 完了後、DevTools Console で `window.skillCreatorAPI.cancelGeneration()` を実行 | メインプロセスで `cancelCurrentOperation` が呼ばれる |

## 統合テスト連携【必須】

| 判定項目                                    | 基準 | 結果    |
| ------------------------------------------- | ---- | ------- |
| ビルド成功                                  | 成功 | pending |
| 型チェック PASS（モノレポ全体）             | PASS | pending |
| cancelCurrentOperation が public で参照可能 | 確認 | pending |

## 多角的チェック観点（AIが判断）

- [ ] `unregisterSkillCreatorHandlers()` がアプリ終了時に正しく呼ばれるか（既存の呼び出し箇所を確認）
- [ ] CANCEL-004 が完了していない状態での E2E 動作確認が必要か

## サブタスク管理

1. ビルド確認
2. 型チェック（モノレポ全体）
3. cancelCurrentOperation の参照確認
4. 手動テスト結果の記録

## 成果物

| 成果物         | パス                                     | 説明               |
| -------------- | ---------------------------------------- | ------------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動確認結果の記録 |

## 完了条件

- [ ] ビルドが成功している
- [ ] モノレポ全体の型チェックが PASS
- [ ] `cancelCurrentOperation` が public メソッドとして参照可能
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
