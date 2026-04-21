# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 11                                     |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 10                               |
| 後続Phase  | Phase 12                               |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

NON_VISUAL タスクとして、セッション復元と snapshot 追従の意味論的挙動を手動確認する。

## 実行タスク

1. 通常フロー / 復元フロー / 復元後切替の 3 シナリオを実行する
2. console error と不整合表示の有無を確認する
3. 発見事項を discovered-issues へ記録する

## 実行手順

```bash
pnpm --filter @repo/desktop dev
```

手動シナリオ:

- 通常フロー: snapshot の質問が表示される
- 復元フロー: restored request が即時表示される
- 切替確認: snapshot 到着後に restored value がクリアされる

NON_VISUAL 固定文言:

- `UI/UX変更なしのため Phase 11 スクリーンショット不要`
- primary evidence は `outputs/phase-11/TASK-RALLY-002-manual-test-report.md` とする

## 統合テスト連携

- Phase 4〜7 の regression check と重複しない semantic behavior を確認する
- NON_VISUAL のため screenshot は必須にしない

## 多角的チェック観点（AIが判断）

- 素人思考: コードを知らない利用者目線で意味が破綻していないか
- 因果関係分析: 復元表示から通常表示への切替が説明可能か

## サブタスク管理

| 項目     | 内容               |
| -------- | ------------------ |
| semantic | 質問の表示順と切替 |
| console  | エラー・warning    |
| issues   | follow-up 記録     |

## 参照資料

| 資料名          | パス                    | 用途     |
| --------------- | ----------------------- | -------- |
| Phase 10 成果物 | `outputs/phase-10/*.md` | 前提確認 |

## 成果物

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/TASK-RALLY-002-manual-test-report.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/screenshot-plan.json`

## 完了条件

- [ ] 3シナリオを確認した
- [ ] console を確認した
- [ ] discovered-issues を整理した

## タスク100%実行確認【必須】

- [ ] 実行タスク 1〜3 完了
- [ ] 成果物を全件定義

## 次のPhase

Phase 12: ドキュメント更新
