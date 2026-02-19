# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 10                                  |
| 機能名 | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 作成日 | 2026-02-19                          |

## 目的

実装完了後、`dangerouslyIgnoreUnhandledErrors` 削除とテスト修正の全体的な品質・整合性を検証する。

## 判定基準

| 判定     | 条件                                           | 対応                                                      |
| -------- | ---------------------------------------------- | --------------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                       | Phase 11 へ進行                                           |
| MINOR    | 軽微な指摘あり（コード品質・命名等）           | 全指摘を未タスク仕様書に変換後（省略不可）Phase 11 へ進行 |
| MAJOR    | 重大な問題あり（テスト失敗・未処理エラー残存） | 影響範囲に応じて Phase 1-5 へ戻る                         |
| CRITICAL | 致命的な問題あり（プロダクションコード破壊）   | Phase 1 へ戻りユーザーと要件を再確認                      |

## 実行タスク

- レビュー観点チェック: 下記の全レビュー観点を順次確認し、判定結果を記録する
- 統合テスト結果確認: 全テスト（ユニット/統合）の最終実行結果を確認する
- レビュー結果文書作成: `outputs/phase-10/final-review-result.md` に判定結果を出力する

## 参照資料

| 資料名                 | パス                                      | 説明                              |
| ---------------------- | ----------------------------------------- | --------------------------------- |
| Phase 9 品質検証結果   | `outputs/phase-9/quality-verification.md` | 品質ゲート検証結果                |
| vitest.config.ts       | `apps/desktop/vitest.config.ts`           | 設定変更対象ファイル              |
| エラーハンドリング規約 | `.claude/rules/02-code-quality.md`        | エラーハンドリング原則            |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`      | P22: Vitest Worker 予期しない終了 |

## 実行手順

### ステップ1: 設定変更の完全性確認

以下のコマンドで `dangerouslyIgnoreUnhandledErrors` が完全に削除されていることを確認する:

```bash
grep -rn "dangerouslyIgnoreUnhandledErrors" apps/desktop/
```

**期待結果**: 0件ヒット（完全削除済み）

### ステップ2: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run
```

**期待結果**: 全テストPASS、失敗テスト0件

### ステップ3: 未処理Promise拒否の検出確認

`dangerouslyIgnoreUnhandledErrors` が削除された状態で、未処理Promise拒否が発生するテストが0件であることを確認する。

**確認方法**: ステップ2のテスト結果に `unhandled rejection` や `unhandled error` のログが含まれないこと。

### ステップ4: プロダクションコード非変更確認

```bash
git diff --name-only HEAD~1 -- apps/desktop/src/ | grep -v '\.test\.' | grep -v '__tests__' | grep -v 'vitest.config'
```

**判定基準**:

- テスト修正のみ（プロダクションコード変更なし）の場合: PASS候補
- プロダクションコードに変更がある場合: 変更が未処理Promise拒否の根本原因修正に限定されていることを確認

### ステップ5: テスト間副作用の確認

テストを個別実行し、テスト間の状態リークがないことを確認する:

```bash
cd apps/desktop && pnpm vitest run --no-file-parallelism
```

**期待結果**: 並列実行時と同じ結果（全テストPASS）

### ステップ6: エラーハンドリングパターンの整合性確認

修正されたテストが以下のプロジェクトルールに準拠していることを確認する:

| 確認項目                                  | 準拠ルール                                                |
| ----------------------------------------- | --------------------------------------------------------- |
| try/catchで握りつぶしていない             | `.claude/rules/02-code-quality.md` エラーハンドリング原則 |
| テスト間で状態を共有していない            | `.claude/rules/02-code-quality.md` テスト設計の注意       |
| beforeEachでモックをリセットしている      | `.claude/rules/06-known-pitfalls.md` P9                   |
| タイマーテストでadvanceTimersByTimeを使用 | `.claude/rules/06-known-pitfalls.md` P13                  |

### ステップ7: レビュー結果の記録

上記全観点の結果を `outputs/phase-10/final-review-result.md` に記録する。

## レビュー観点サマリー

| #   | 観点                           | 確認内容                                                | 結果 |
| --- | ------------------------------ | ------------------------------------------------------- | ---- |
| 1   | 設定削除の完全性               | `dangerouslyIgnoreUnhandledErrors` が0件ヒット          |      |
| 2   | テスト全件PASS                 | `pnpm vitest run` で失敗0件                             |      |
| 3   | 未処理Promise拒否ゼロ          | テスト実行ログに `unhandled rejection` なし             |      |
| 4   | プロダクションコード非破壊     | テスト/設定以外のプロダクションコードが変更されていない |      |
| 5   | テスト間副作用なし             | `--no-file-parallelism` でも全テストPASS                |      |
| 6   | エラーハンドリングパターン準拠 | プロジェクトのエラーハンドリング規約に準拠              |      |

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目 | 確認内容                                                    |
| ------------ | ----------------------------------------------------------- |
| 全テスト結果 | ユニット/統合テスト全てPASS                                 |
| テスト安定性 | `--no-file-parallelism` での実行でも全テストPASS            |
| エラー検出力 | `dangerouslyIgnoreUnhandledErrors` 削除後も未処理エラーなし |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                   |
| ------------------ | ---- | ------------------------------------------ |
| エラーハンドリング | ✅   | 非同期エラーが正しくハンドリングされている |
| テスト品質         | ✅   | テスト設計がプロジェクト規約に準拠している |
| セキュリティ       | -    | 本タスクではセキュリティ変更なし           |
| UI/UX              | -    | 本タスクではUI変更なし                     |

## 成果物

| 成果物       | パス                                      | 説明                       |
| ------------ | ----------------------------------------- | -------------------------- |
| レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果と全観点の確認結果 |

## 完了条件

- [ ] 全6レビュー観点で確認完了
- [ ] 判定結果（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] MINOR判定の場合、全指摘を未タスク仕様書に変換済み
- [ ] 統合テスト結果が確認されている
- [ ] `outputs/phase-10/final-review-result.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. ステップ1-6の順次実行
3. 統合テスト連携の実施
4. レビュー結果文書の作成
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING --phase 10
```

## 次のPhase

Phase 11: 手動テスト検証
