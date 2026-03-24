# Phase 13: 完了・PR準備

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| Phase    | 13                         |
| 機能名   | safety-gate-preload-api    |
| タスクID | UT-06-003-PRELOAD-API-IMPL |
| 作成日   | 2026-03-23                 |
| 前提     | Phase 12 ドキュメント完了  |

## 目的

成果物の最終確認を行い、ユーザーの明示的な許可を得てから PR を作成する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示し PR 作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: CI が通過したことを確認

## 参照資料

| 資料名                  | パス                                          | 説明             |
| ----------------------- | --------------------------------------------- | ---------------- |
| Phase 10 レビュー       | `phase-10-final-review.md`                    | 最終レビュー結果 |
| Phase 11 手動テスト     | `phase-11-manual-test.md`                     | 手動テスト結果   |
| Phase 12 ドキュメント   | `phase-12-documentation.md`                   | ドキュメント     |
| documentation-changelog | `outputs/phase-12/documentation-changelog.md` | 変更履歴         |

## Blocked ステータス

**現在のステータス**: Blocked（ユーザー承認待ち）

**Blocked 理由**: user の明示承認がない限り、commit/PR を自動で作成しない（Phase 13 ルール）

**user approval**: 未取得

## Phase 12 完了根拠

| Phase | 完了条件                        | 状態         |
| ----- | ------------------------------- | ------------ |
| 1     | 要件定義（FR/NFR/AC）完了       | 完了         |
| 2     | 設計完了                        | 完了         |
| 3     | 設計レビュー PASS               | 完了         |
| 4     | テスト作成（T-1〜T-6）完了      | 完了         |
| 5     | 実装完了                        | 完了         |
| 6-7   | テスト拡充 + カバレッジ確認完了 | 完了         |
| 8     | リファクタリング判断完了        | 完了         |
| 9     | 品質検証 PASS                   | 完了         |
| 10    | 最終レビュー判定完了            | 完了（PASS） |
| 11    | 手動テスト完了                  | 完了         |
| 12    | ドキュメント更新完了            | 完了         |

## 実行手順

### ステップ 1: 最終チェックリスト

- [ ] 全テスト PASS（`cd apps/desktop && pnpm vitest run`）
- [ ] 型チェック PASS（`cd apps/desktop && pnpm typecheck`）
- [ ] Lint PASS（`cd apps/desktop && pnpm lint`）
- [ ] P27 バリデーション PASS
- [ ] Phase 12 全 Task 完了

### ステップ 2: ローカル動作確認依頼

ユーザーにローカル環境での動作確認を依頼する。

### ステップ 3: 変更サマリー提示と許可確認

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### ステップ 4: PR 作成（ユーザー許可後）

`/ai:diff-to-pr` を実行する。

### ステップ 5: CI 確認

PR が作成され、CI が通過したことを確認する。

## ローカルチェック結果要約

| チェック項目       | コマンド                                 | 結果                      |
| ------------------ | ---------------------------------------- | ------------------------- |
| テスト             | `cd apps/desktop && pnpm vitest run`     | PASS（117テスト全件PASS） |
| 型チェック         | `cd apps/desktop && pnpm typecheck`      | PASS（エラー0件）         |
| Lint               | `cd apps/desktop && pnpm lint`           | Blocked（PR作成時に実行） |
| P27 バリデーション | `grep -rn ... \| grep -v "IPC_CHANNELS"` | PASS（出力なし）          |

## 成果物一覧

### プロダクションコード

| ファイル                                | 変更内容                          |
| --------------------------------------- | --------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | `evaluateSafety` interface + 実装 |

### テストコード

| ファイル                                                              | テスト数 |
| --------------------------------------------------------------------- | -------- |
| `apps/desktop/src/preload/__tests__/skill-api.evaluateSafety.test.ts` | 6        |

### PR 情報

#### ブランチ名

```
feature/ut-06-003-preload-api-impl
```

#### PR タイトル

```
feat(preload): add evaluateSafety to SkillAPI (#1290)
```

#### PR 本文テンプレート

```markdown
## Summary

- SafetyGate Preload API に `evaluateSafety` メソッドを追加
- Renderer -> Preload -> Main の IPC 通信チェーンを完成
- `safeInvoke` + `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` 定数使用（P27準拠）

## Test Plan

- [ ] Preload テスト全 PASS（6テストケース）
- [ ] TypeScript 型チェック PASS
- [ ] ESLint PASS
- [ ] P27 バリデーション（ハードコード文字列なし）
```

## 統合テスト連携

Phase 13 では統合テスト連携は CI 通過確認をもって最終確認とする。

## 多角的チェック観点（AIが判断）

| 観点         | 適用 | 確認内容                                 |
| ------------ | ---- | ---------------------------------------- |
| セキュリティ | 該当 | PR 本文に P27 バリデーション結果を含める |
| コード品質   | 該当 | CI 通過確認                              |

## サブタスク管理

1. 最終チェックリストの実行
2. ローカル動作確認依頼
3. 変更サマリー提示と許可確認
4. PR 作成（ユーザー許可後）
5. CI 確認

## 成果物

| 成果物 | パス                          | 説明      |
| ------ | ----------------------------- | --------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL 等 |

## 完了条件

- [ ] 最終チェックリスト全項目 PASS
- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PR が作成されている
- [ ] CI が通過している
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

（最終Phase — 完了）
