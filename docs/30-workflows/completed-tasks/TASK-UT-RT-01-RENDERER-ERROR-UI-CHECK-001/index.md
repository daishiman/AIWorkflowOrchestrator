# TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001 - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001                                |
| タスク名     | Renderer 側エラーメッセージ UI 表示 E2E 確認                             |
| カテゴリ     | 検証 / follow-up                                                         |
| 対象機能     | SkillLifecyclePanel.tsx / IPC エラーメッセージ伝搬                       |
| 優先度       | 中                                                                       |
| 規模         | 小規模                                                                   |
| ステータス   | phase12_completed                                                        |
| 作成日       | 2026-04-13                                                               |
| 総Phase数    | 13                                                                       |
| GitHub Issue | [#2007](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2007) |

---

## 背景・目的

TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 では Main 層のエラーメッセージ伝搬を統一した。
IPC ブリッジ（preload の `onWorkflowStateChanged`）も variadic 化され、`webContents.send(channel, snapshot, errorMessage)` で送信した errorMessage が Renderer 側コールバックの第2引数として受け取れるよう実装済みである。

しかし、Renderer 側（`SkillLifecyclePanel.tsx`）でエラーメッセージが実際に画面上に表示されるかについての E2E テストまたは手動テストによる証跡は存在しない。
本タスクは、この E2E 経路を Vitest テストで検証することを目的とする。

## 実行方針

- Phase 1 で 30 思考法の適用マップと 3 lane 分割を固定する
- Phase 2 では設計判断に絞り、Phase 1 の要件を再掲しない
- Phase 3 / 10 は gate 専用として扱い、lane を増やさない
- Phase 12 では `task-workflow` / `task-workflow-completed` / `lane/index` / `artifacts.json` / `outputs/artifacts.json` / `LOGS` / `topic-map` を同一 wave で同期する

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス        |
| ----- | -------------------- | ------------------------------------------------------------ | ----------------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed         |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | pending           |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | pending           |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending           |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | pending           |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending           |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending           |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending           |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending           |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | pending           |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed         |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | phase12_completed |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked           |

---

## 依存関係

| タスク                                                 | 内容                                   |
| ------------------------------------------------------ | -------------------------------------- |
| TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 | IPC ワイヤリング完了が前提（完了済み） |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                |
| ----- | ----------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, 仕様抽出結果, 調査メモ, トレーサビリティ行列                    |
| 2     | テスト設計書, アプローチ選定結果, テスト戦略, 依存整合マトリクス                          |
| 3     | 設計レビュー結果, ゲート判定, 矛盾チェック表                                              |
| 4     | テスト仕様書, Red結果, テストケース一覧                                                   |
| 5     | 実装サマリー, 変更ファイル一覧, 修正差分記録                                              |
| 6     | 拡張テストケース, 回帰テスト結果, 異常系結果                                              |
| 7     | カバレッジ計画, 未到達分析, トレーサビリティ網羅率                                        |
| 8     | リファクタ計画, 再テスト計画, 責務境界マップ                                              |
| 9     | 品質レポート, リスク台帳, 因果ループ監査                                                  |
| 10    | 最終レビュー結果, 是正計画, 出荷準備チェック                                              |
| 11    | 手動テスト結果, 証跡インデックス, スクリーンショット計画                                  |
| 12    | 実装ガイド, 仕様更新サマリー, 更新履歴, 未タスク検出, スキルフィードバック, Task2実行ログ |
| 13    | -                                                                                         |

---

_このファイルは task-specification-creator に従い作成されました。_
_作成日: 2026-04-13_
