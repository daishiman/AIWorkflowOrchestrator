# Phase 11: 手動テスト（NON_VISUAL）

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 11                                                          |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| 機能名     | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | NON_VISUAL                                                  |
| 前提Phase  | Phase 10（最終レビュー PASS）                               |
| 後続Phase  | Phase 12                                                    |
| 作成日     | 2026-04-12                                                  |
| ステータス | completed                                                   |

## タスク種別判定

**NON_VISUAL** — このタスクは `SkillCreateWizard` の見た目変更ではなく、Q1〜Q6 の入力値を生成処理へ正しく伝播させるデータフロー修正である。画面レイアウトや視覚的な差分は発生しないため、スクリーンショット取得ではなく、単体テストと差分確認で代替検証する。

## 代替確認手順

### 事前確認コマンド

```bash
pnpm --filter @repo/shared exec vitest run src/types/__tests__/buildSkillContext.test.ts src/types/__tests__/buildSkillContext.edge.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.create.context.test.ts src/renderer/store/slices/__tests__/agentSlice.createSkill.context.test.ts
```

### TC-11-NONVISUAL-01: Step 1 の入力値が SkillCreationContext に変換されることを確認

| ステップ | 操作                                                             | 期待結果                                                   |
| -------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| 1        | `buildSkillContext(formData, answers)` の単体テストを確認する    | `skillName` / `category` / `purpose` / Q1〜Q6 が変換される |
| 2        | 空文字・未入力ケースの edge test を確認する                      | すべて `undefined` に正規化され、例外が発生しない          |
| 3        | `selectedOptions` と `freeText` の優先順位が維持されることを確認 | 後方互換を壊さず回答が集約される                           |

### TC-11-NONVISUAL-02: 生成 thunk と IPC 経路の後方互換を確認

| ステップ | 操作                                                    | 期待結果                                         |
| -------- | ------------------------------------------------------- | ------------------------------------------------ |
| 1        | `agentSlice.createSkill.context.test.ts` を確認する     | `context` 付き・なしの両経路が成立する           |
| 2        | `skillHandlers.create.context.test.ts` を確認する       | `buildSkillGenerationPrompt(context)` が呼ばれる |
| 3        | `skillHandlers.create.test.ts` の既存回帰観点を確認する | `context` 未指定の既存呼び出しに影響しない       |

### TC-11-NONVISUAL-03: 生成プロンプトに skillName / category / Q1〜Q6 が反映されることを確認

| ステップ | 操作                                                       | 期待結果                                                      |
| -------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| 1        | `buildSkillGenerationPrompt()` のテストケースを確認する    | `スキル名`、`カテゴリ`、`Q1〜Q6` の各項目が順序付きで含まれる |
| 2        | `SKILL_CATEGORY_LABELS` のラベル表示を確認する             | `category` と日本語ラベルの両方が記録される                   |
| 3        | プロンプトに空行や未入力のノイズが混入しないことを確認する | 空入力は省略され、読みやすい形式でプロンプトが構築される      |

## 発見事項記録

Phase 11 実行時に発見したスコープ外の問題・改善提案は `outputs/phase-11/discovered-issues.md` に記録し、Phase 12 の未タスク検出レポートへ引き渡す。

## 参照資料

| 資料名                 | パス                                                                             | 用途                |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------- |
| Phase 10 最終レビュー  | `outputs/phase-10/final-review-report.md`                                        | 最終確認内容の参照  |
| phase-11-guide         | `.claude/skills/task-specification-creator/references/phase-11-guide.md`         | 手動テスト手順      |
| phase-template-phase11 | `.claude/skills/task-specification-creator/references/phase-template-phase11.md` | NON_VISUAL 判定基準 |

## 成果物

| 成果物                   | パス                                        | 説明                                           |
| ------------------------ | ------------------------------------------- | ---------------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | TC-11-NONVISUAL-01〜03 の実施記録              |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 代替証跡・NON_VISUAL 確認結果サマリ            |
| 発見事項記録             | `outputs/phase-11/discovered-issues.md`     | スコープ外発見事項・改善提案（0 件も出力必須） |

## 完了条件

- [ ] NON_VISUAL タスクの判定理由が明記されていること
- [ ] TC-11-NONVISUAL-01〜03 の実施結果が記録されていること
- [ ] スクリーンショット不要の理由と代替証跡が明記されていること
- [ ] Q1〜Q6 の回答がスキル内容に反映されていることがテストで確認されていること
- [ ] 発見事項記録が作成されていること（0 件も明記）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
