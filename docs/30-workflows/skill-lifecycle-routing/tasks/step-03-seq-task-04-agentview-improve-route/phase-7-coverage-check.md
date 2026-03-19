# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 |
| フェーズ | Phase 7                              |
| 機能名   | agentview-improve-route              |
| 作成日   | 2026-03-17                           |
| 依存     | Phase 6 成果物（outputs/phase-6/）   |

## 目的

カバレッジ基準を充足していることを計測・確認する。基準未達の場合は Phase 6 に戻りテストを追加する。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行タスク

### Task 1: カバレッジ計測

- [ ] `pnpm --filter @repo/desktop exec vitest run --coverage` を実行
- [ ] 対象ファイルのカバレッジ数値を抽出する
  - `AgentView/index.tsx` または該当コンポーネントファイル
  - `SkillAnalysisView/index.tsx` または該当コンポーネントファイル
  - CTA バナーコンポーネントファイル

### Task 2: 基準充足判定

- [ ] Line Coverage が 80% 以上であることを確認
- [ ] Branch Coverage が 60% 以上であることを確認
- [ ] Function Coverage が 80% 以上であることを確認

### Task 3: 未達時の対応

- [ ] いずれかの基準が未達の場合 → Phase 6 に戻り不足テストを追加
- [ ] 全基準を充足した場合 → Phase 8 へ進む

### Task 4: カバレッジ数値の記録

- [ ] 各ファイルの Line / Branch / Function カバレッジ数値を `outputs/phase-7/coverage-summary.md` に記録
- [ ] 未カバーの行・分岐を `outputs/phase-7/uncovered-lines.md` にリストアップ

## 参照資料

- Phase 6 成果物: `outputs/phase-6/`
- カバレッジ基準: `.claude/rules/02-code-quality.md`

## 実行手順

1. vitest coverage を実行してレポート取得
2. 対象ファイルの数値を確認
3. 全基準充足 → Phase 8 へ / 未達 → Phase 6 へ戻る

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

```
outputs/phase-7/
  coverage-summary.md    # ファイルごとのカバレッジ数値
  uncovered-lines.md     # 未カバー行・分岐の一覧
  gate-result.md         # PASS / FAIL の判定結果
```

## 完了条件

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上
- [ ] `gate-result.md` に PASS が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次 Phase

基準充足 → Phase 8: リファクタリング
未達 → Phase 6: テスト拡充 に戻る
