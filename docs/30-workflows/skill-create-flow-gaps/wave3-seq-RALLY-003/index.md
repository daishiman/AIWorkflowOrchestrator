# TASK-RALLY-003 - UndoサーバーsideRollback API追加

## メタ情報

| 項目                | 値                                                                    |
| ------------------- | --------------------------------------------------------------------- |
| タスクID            | TASK-RALLY-003                                                        |
| 機能名              | undo-server-rollback-api                                              |
| 作成日              | 2026-04-21                                                            |
| ステータス          | pending                                                               |
| 総Phase数           | 13                                                                    |
| 衝突ドメイン        | RuntimeSkillCreatorFacade / creatorHandlers / ConversationalInterview |
| 実行形態            | seq（RALLY-005の IPC権限設計確立後）                                  |
| タスク間依存        | RALLY-005（IPC更新権限設計確立）完了が前提                            |
| chain_id            | RALLY-UNDO-CHAIN-001                                                  |
| chain_position      | 2/2                                                                   |
| implementation_mode | new                                                                   |

---

## chainスコープ

| フィールド                  | 値                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| chain_id                    | RALLY-UNDO-CHAIN-001                                                                                                                 |
| chain_position              | 2/2                                                                                                                                  |
| chain_completion_definition | TASK-RALLY-003 の Phase 12 完了をもって chain 全体が完了。Undo 操作がサーバー状態を巻き戻し、UI とサーバーが同期した状態になること。 |

**depends_on_chain_tasks**:

- TASK-RALLY-005: `workflowSnapshot` の更新権限設計（invoke を正規ソースとする方針）。rollback 後の snapshot 返却仕様がこの設計に依存する。

**provides_to_chain_tasks**:

- なし（chain の最終タスク）

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

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

### タスク間の直列/並列

```
Wave 1（直列前提）: RALLY-005 完了後に本タスクを開始する
  （rollback後のsnapshot返却仕様がRALLY-005の「invoke正規ソース」方針に依存するため）

Wave 3（並列可）: RALLY-003 と RALLY-010〜013 は異なるファイルを触るため並列可
  ただし ConversationalInterview.tsx の handleUndo 変更はRALLY-002完了後が安全
```

### Phase内の直列/並列

```
Phase 1内:
  SubAgent-A（IPC設計: チャンネル定数・ホワイトリスト・ハンドラ設計）┐
  SubAgent-B（Facade設計: rollbackLastInputメソッド設計）             ├ 並列
  SubAgent-C（Renderer側設計: handleUndo更新設計）                    ┘
  ↓
  SubAgent-D（統合・IPC4層整合チェック）← 直列（A・B・C完了後）

Phase 4内:
  テスト作成は IPC層 / Facade層 / Renderer層 で並列作成可

Phase 5（実装）: 依存関係により直列
  1. channels.ts（定数）
  2. types/skillCreator.ts（型）
  3. preload/channels.ts（ホワイトリスト）
  4. RuntimeSkillCreatorFacade.ts（Facade実装）
  5. creatorHandlers.ts（IPCハンドラ）
  6. preload/skill-creator-api.ts（PreloadAPI）
  7. ConversationalInterview.tsx（handleUndo更新）
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
  --workflow docs/30-workflows/skill-create-flow-gaps/p03-seq-RALLY-003 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                |
| ----- | --------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準, P50チェック結果, IPC4層整合計画 |
| 2     | IPC4層設計書, Facade設計書, handleUndo更新設計書          |
| 3     | 設計レビュー結果, ゲート判定, リスク評価表                |
| 4     | テスト仕様書（IPC/Facade/Renderer別シナリオ）             |
| 5     | 実装サマリー, 変更ファイル一覧（7ファイル）               |
| 6     | 回帰テスト結果, シナリオテスト結果                        |
| 7     | カバレッジ確認結果                                        |
| 8     | リファクタリング計画                                      |
| 9     | 品質レポート                                              |
| 10    | 最終レビュー結果, ゲート判定                              |
| 11    | 手動テスト結果（Undo操作のサーバー状態巻き戻し確認）      |
| 12    | 変更サマリー, ドキュメント更新履歴, chain完了記録         |
| 13    | PR作成完了                                                |
