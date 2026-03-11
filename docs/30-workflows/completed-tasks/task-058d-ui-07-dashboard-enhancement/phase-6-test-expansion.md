# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容       |
| ------------ | ---------- |
| Phase        | 6          |
| Phase名      | テスト拡充 |
| 前提Phase    | Phase 5    |
| 後続Phase    | Phase 7    |
| ステータス   | completed  |
| 作成日       | 2026-03-11 |
| 担当SubAgent | SubAgent-D |

## 目的

正常系だけでなく境界条件・回帰観点まで広げ、
ホーム画面変更の副作用を抑える。

## 実行タスク

- 境界条件追加: displayName なし、invalid timestamp、6件超の activity を追加検証する
- 状態遷移拡充: zero state / loading transition / pending 状態の分岐を拡充する
- 回帰導線確認: `AppDock` / `historySearch` 連携に波及しないことを確認する

## 参照資料

| 参照資料             | パス                                                                              | 内容             |
| -------------------- | --------------------------------------------------------------------------------- | ---------------- |
| Phase 4仕様          | `phase-4-test-creation.md`                                                        | 基本テストケース |
| Phase 5仕様          | `phase-5-implementation.md`                                                       | 実装対象         |
| 設計トレーサビリティ | `outputs/phase-2/traceability-matrix.md`                                          | 要件との対応     |
| テストパターン       | `.agents/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 境界ケース追加   |

## 統合テスト連携

| 観点       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| 状態遷移   | `isLoading` true→false、empty→normal、pending 有無                   |
| 導線回帰   | `historySearch` / `workspace` / `skillCenter` / `agent` への遷移維持 |
| データ境界 | invalid timestamp、6件超、displayName なし                           |

## 多角的チェック観点

| 観点               | 適用判断                                       | 仕様参照先                                          |
| ------------------ | ---------------------------------------------- | --------------------------------------------------- |
| UI/UX              | 状態切替回帰確認で適用                         | `aiworkflow-requirements: ui-ux-*.md`               |
| テスタビリティ     | 境界ケース追加のため適用                       | `aiworkflow-requirements: testing-*.md`             |
| セキュリティ       | 新規外部境界追加なしを回帰観点に含めるため適用 | `aiworkflow-requirements: security-*.md`            |
| エラーハンドリング | invalid data fallback 確認で適用               | `aiworkflow-requirements: error-handling.md`        |
| アクセシビリティ   | 回帰で focus/keyboard を再確認するため適用     | `aiworkflow-requirements: testing-accessibility.md` |

## 成果物

| 成果物         | パス                                     | 内容       |
| -------------- | ---------------------------------------- | ---------- |
| 拡張テスト計画 | `outputs/phase-6/test-expansion-plan.md` | 追加ケース |
| 回帰マトリクス | `outputs/phase-6/regression-matrix.md`   | 影響範囲   |

## 完了条件

- [x] 境界条件が一覧化されている
- [x] 旧 Dashboard 回帰観点が列挙されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 境界ケース追加
3. 回帰ケース追加
4. 導線ケース追加
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] コード成果物の配置先が `apps/desktop/src/renderer/...` と明記されている
- [x] ドキュメント成果物の配置先が `outputs/phase-6/` と明記されている
- [x] `artifacts.json` の Phase 6 記述と整合している

## 次のPhase

Phase 7: テストカバレッジ確認
