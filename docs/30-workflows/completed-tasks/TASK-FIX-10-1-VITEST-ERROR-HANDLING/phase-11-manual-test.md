# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 11                                  |
| 機能名 | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 作成日 | 2026-02-19                          |

## 目的

自動テストでは検証できない動作（設定ファイル変更の反映、CI環境での挙動、未処理Promise拒否の検出力）を手動で確認する。

## 実行タスク

- 機能テスト: vitest.config.ts変更後の全テスト実行と設定削除の確認
- リグレッションテスト: 既存テストへの影響がないことの確認
- CI環境テスト: CI環境（pnpm test）での実行確認
- 未処理Promise拒否検出テスト: 意図的なunhandled rejectionが検出されることの確認

## 参照資料

| 資料名                 | パス                                      | 説明             |
| ---------------------- | ----------------------------------------- | ---------------- |
| Phase 10 結果          | `outputs/phase-10/final-review-result.md` | 最終レビュー判定 |
| vitest.config.ts       | `apps/desktop/vitest.config.ts`           | 設定変更対象     |
| Vitest公式ドキュメント | https://vitest.dev/config/                | 設定リファレンス |

## テストカテゴリ

- **機能テスト**: `dangerouslyIgnoreUnhandledErrors` 削除後のテスト実行結果
- **リグレッションテスト**: 既存機能（全テストスイート）への影響確認
- **環境テスト**: CI環境での動作確認

## 実行手順

### ステップ1: 設定ファイル確認

`apps/desktop/vitest.config.ts` を開き、`dangerouslyIgnoreUnhandledErrors` 設定が削除されていることを目視で確認する。

### ステップ2: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run
```

全テストがPASSすることを確認する。

### ステップ3: 意図的unhandled rejection検出テスト

一時的にテストファイルを作成し、未処理Promise拒否が検出されることを確認する:

```bash
cd apps/desktop && cat > /tmp/test-unhandled.test.ts << 'EOF'
import { describe, it } from 'vitest';

describe('unhandled rejection detection', () => {
  it('should detect unhandled promise rejection', () => {
    // 意図的にunhandled rejectionを発生させる
    new Promise((_, reject) => reject(new Error('intentional unhandled rejection')));
  });
});
EOF

pnpm vitest run /tmp/test-unhandled.test.ts 2>&1 | head -30
rm /tmp/test-unhandled.test.ts
```

**期待結果**: テストが失敗するか、unhandled rejectionの警告が出力される（`dangerouslyIgnoreUnhandledErrors: true` が削除されたため、未処理拒否が検出される）

### ステップ4: CI環境テスト

プロジェクトルートから全テストを実行し、CI環境と同等の条件で動作確認する:

```bash
pnpm --filter @repo/desktop exec vitest run
```

**期待結果**: 全テストPASS

### ステップ5: テスト結果の記録

全テストケースの結果を `outputs/phase-11/manual-test-result.md` に記録する。

## テストケーステーブル

| No  | カテゴリ             | テスト項目                                             | 前提条件                                 | 操作手順                                                   | 期待結果                                           | 実行結果 | 備考 |
| --- | -------------------- | ------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------- | -------- | ---- |
| 1   | 機能テスト           | `dangerouslyIgnoreUnhandledErrors`設定が削除されている | Phase 5-9完了済み                        | `apps/desktop/vitest.config.ts` を開き設定行の有無を確認   | 設定行が存在しない                                 |          |      |
| 2   | 機能テスト           | 全テストPASS確認                                       | `dangerouslyIgnoreUnhandledErrors`削除済 | `cd apps/desktop && pnpm vitest run` を実行                | 全テストPASS、失敗0件                              |          |      |
| 3   | 機能テスト           | 意図的unhandled rejectionの検出確認                    | 設定削除済み                             | ステップ3の一時テストファイルを実行                        | unhandled rejectionが検出される（テスト失敗/警告） |          |      |
| 4   | リグレッションテスト | CI環境相当での全テスト実行                             | 設定削除済み                             | `pnpm --filter @repo/desktop exec vitest run` を実行       | 全テストPASS                                       |          |      |
| 5   | リグレッションテスト | `--no-file-parallelism` での実行                       | 設定削除済み                             | `cd apps/desktop && pnpm vitest run --no-file-parallelism` | 全テストPASS（テスト間副作用なし）                 |          |      |

## 統合テスト連携【必須】

手動統合テスト確認:

| テスト項目         | 確認内容                                                   | 期待結果       | 実行結果 |
| ------------------ | ---------------------------------------------------------- | -------------- | -------- |
| テスト設定の整合性 | vitest.config.tsの変更が全テストスイートに正しく適用される | 全テストPASS   |          |
| 非同期エラー検出   | 未処理Promise拒否がテスト失敗として報告される              | 検出動作を確認 |          |
| テスト安定性       | 並列/逐次実行の両方で同じ結果が得られる                    | 結果一致       |          |

## 多角的チェック観点

| 観点               | 適用 | 確認内容                                |
| ------------------ | ---- | --------------------------------------- |
| エラーハンドリング | ✅   | 未処理Promise拒否の検出が正しく動作する |
| テスト品質         | ✅   | テスト実行の安定性と信頼性              |
| セキュリティ       | -    | 本タスクではセキュリティ変更なし        |
| UI/UX              | -    | 本タスクではUI変更なし                  |

## 成果物

| 成果物     | パス                                     | 説明           |
| ---------- | ---------------------------------------- | -------------- |
| テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動テスト結果 |

## 完了条件

- [ ] テストケース No.1〜5 が全て実行済み
- [ ] テストケース No.1〜5 が全てPASS
- [ ] 統合テスト手動確認が完了
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. テストケース No.1〜5 の順次実行
3. 統合テスト連携の実施
4. テスト結果文書の作成
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新
