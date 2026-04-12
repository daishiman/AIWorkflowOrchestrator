# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 10                                             |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 9                                        |
| 後続Phase  | Phase 11                                       |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

AC-1〜AC-5 の充足確認と出荷可否判断を行い、Phase 11（手動テスト）へ進めるかを判定する。

## 実行タスク

- AC-1〜AC-5 の確認コマンドを実行し各行を検証する
- ブロッカー確認テーブルを更新する
- ゲート判定を実施して PASS / FAIL を記録する
- 最終レビュー結果と出荷準備チェックリストを outputs/phase-10/ に出力する

## AC 最終確認テーブル

| AC   | 内容                                                                      | 確認方法                                                                                         | 判定 |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---- |
| AC-1 | `skill-lifecycle-request-input` 参照が全テストファイルから削除されている  | `grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/components/skill/__tests__/` | [ ]  |
| AC-2 | `describe.skip` ブロック内の参照も含めて削除・更新されている              | `grep -n "skill-lifecycle-request-input"` を対象2ファイルに実行                                  | [ ]  |
| AC-3 | 削除後、テストが現行 UI（遷移ボタン化後）を正しく反映した内容になっている | コードレビュー（対象2ファイルの describe.skip ブロック内容を目視確認）                           | [ ]  |
| AC-4 | `pnpm --filter @repo/desktop test:run` が PASS する                       | `pnpm --filter @repo/desktop test:run`                                                           | [ ]  |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                      | `pnpm --filter @repo/desktop typecheck`                                                          | [ ]  |

## AC 確認コマンド

```bash
# AC-1: skill-lifecycle-request-input 参照の残存確認（0件であること）
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/

# AC-2: describe.skip ブロック内の参照確認（0件であること）
grep -n "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# AC-4: テスト実行
pnpm --filter @repo/desktop test:run

# AC-5: 型チェック
pnpm --filter @repo/desktop typecheck
```

## ブロッカー確認

| ID   | 内容                                       | 状態   |
| ---- | ------------------------------------------ | ------ |
| B-01 | `skill-lifecycle-request-input` 参照の残存 | 未確認 |
| B-02 | テストの回帰                               | 未確認 |
| B-03 | TypeScript 型エラー                        | 未確認 |
| B-04 | ESLint エラー                              | 未確認 |

## MINOR 指摘追跡テーブル最終確認

| MINOR ID | 指摘内容 | 解決Phase | 解決状態 |
| -------- | -------- | --------- | -------- |
| -        | なし     | -         | -        |

## ゲート判定

**MAJOR 指摘なし = PASS**

AC-1〜AC-5 が全て満たされており、ブロッカーが 0 件であれば Phase 11 へ進める。

いずれかの AC が未達またはブロッカーが残存する場合は、該当 Phase に差し戻して修正する。

## 出荷準備チェックリスト

- [ ] AC-1: `skill-lifecycle-request-input` 参照削除確認（grep 0件）
- [ ] AC-2: `describe.skip` 内含む全参照削除確認（grep 0件）
- [ ] AC-3: 現行 UI 反映確認（コードレビュー）
- [ ] AC-4: `test:run` PASS 確認
- [ ] AC-5: `typecheck` PASS 確認
- [ ] Phase 1〜9 の全成果物が揃っている
- [ ] ブロッカーが 0 件

## Phase 13 blocked 条件

以下のいずれかに該当する場合、PR 作成をブロックする:

- AC-1〜AC-5 のいずれかが未達
- 既存テストへの回帰が発生
- ユーザーの明示的な承認がない
- Issue #2053 が CLOSED のため PR 不要とユーザーが判断した場合

## 参照資料

| 資料名               | パス                                         | 用途           |
| -------------------- | -------------------------------------------- | -------------- |
| 品質レポート         | `outputs/phase-9/quality-report.md`          | Phase 9 成果物 |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 設計書               | `outputs/phase-2/design-document.md`         | Phase 2 成果物 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物 |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`         | Phase 7 成果物 |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md`      | Phase 8 成果物 |

## 実行手順

1. AC 確認コマンドを実行して各 AC の判定を行う
2. ブロッカー確認テーブルを更新する
3. ゲート判定を実施する（PASS / FAIL）
4. 最終レビュー結果と出荷準備チェックリストを outputs/phase-10/ に出力する

## 統合テスト連携

```bash
# AC-1/AC-2: 旧 testid 参照の完全除去を確認
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/

# AC-4: テスト全件 PASS 確認
pnpm --filter @repo/desktop test:run

# AC-5: 型チェック PASS 確認
pnpm --filter @repo/desktop typecheck
```

## 多角的チェック観点

| 観点            | 確認内容                                  |
| --------------- | ----------------------------------------- |
| AC 充足性       | AC-1〜AC-5 が全て満たされていること       |
| ブロッカー確認  | 既知のブロッカーが全て解消していること    |
| 成果物の完全性  | Phase 1〜9 の全成果物が存在すること       |
| 後続 Phase 準備 | Phase 11 開始に必要な情報が揃っていること |

## 成果物

| 成果物           | パス                                              | 説明                        |
| ---------------- | ------------------------------------------------- | --------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | AC 最終確認とブロッカー判定 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | 出荷準備チェックリスト      |

## 完了条件

- [ ] AC-1〜AC-5 の最終判定が完了
- [ ] ブロッカーが 0 件（または全て解消）
- [ ] Phase 11 開始条件が PASS

## サブタスク管理

| サブタスクID | 内容                        | 状態   |
| ------------ | --------------------------- | ------ |
| ST-10-1      | AC-1〜AC-5 確認コマンド実行 | 未実施 |
| ST-10-2      | ブロッカー確認テーブル更新  | 未実施 |
| ST-10-3      | ゲート判定（PASS/FAIL）     | 未実施 |
| ST-10-4      | 成果物出力                  | 未実施 |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 11: 手動テスト検証
