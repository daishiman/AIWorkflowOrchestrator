# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 11                                                               |
| タスクID   | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001            |
| 機能名     | SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 |
| タスク種別 | NON_VISUAL（docs-only タスク）                                   |
| 前提Phase  | Phase 10（最終レビューPASS）                                     |
| 後続Phase  | Phase 12                                                         |
| 作成日     | 2026-04-11                                                       |
| ステータス | pending                                                          |

## タスク種別判定

**NON_VISUAL** — このタスクはdocs-only（仕様書テンプレート更新＋テストケース追加）であり、
UIコンポーネントの変更を含まない。実地操作による画面確認は不要。

> **[Feedback BEFORE-QUIT-001]** NON_VISUALタスクでは「実地操作不可」を明記し、
> 自動テスト結果 + 既知制限リストを代替記録として残す。
> スクリーンショットは作成しない（`screenshots/` ディレクトリは作成不要）。

## 証跡の主ソース

| 証跡種別           | 内容                               |
| ------------------ | ---------------------------------- |
| 自動テスト         | TC-FB03-01〜09（Vitest実行結果）   |
| テスト件数         | 9件（TC-FB03-01〜09）              |
| テスト結果         | 全件PASS（Phase 6完了時点）        |
| スクリーンショット | 不要（NON_VISUALのため作成しない） |

## スクリーンショットを作成しない理由

このタスクはdocs-onlyであり、変更対象がMarkdownファイル（仕様書テンプレート）と
テストファイルのみ。UIコンポーネント・画面遷移・視覚的変化が存在しないため、
スクリーンショット取得の対象がない。

## docs-only代替検証

| 確認項目         | 実施内容                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| SKILL.md 到達性  | `task-specification-creator` / `aiworkflow-requirements` の canonical path と family file を確認する |
| LOGS.md 到達性   | archive / history への参照が辿れることを確認する                                                     |
| mirror parity    | `.claude` / `.agents` の差分がないことを確認する                                                     |
| validator replay | docs-only 用 validator を再実行できることを確認する                                                  |

## NON_VISUAL代替検証

```bash
# mirror parity 確認
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator

# 自動テスト全件実行（主証跡）
pnpm vitest run --reporter=verbose --grep "SmartDefault"

# 変更ファイル確認
git diff --name-only HEAD

# docs変更内容確認
git diff HEAD -- "**/*.md"
```

## 既知制限リスト

| 制限事項                                         | 理由                                    |
| ------------------------------------------------ | --------------------------------------- |
| 画面証跡なし                                     | UIコンポーネント変更なし（NON_VISUAL）  |
| Phase 11の3層評価（Semantic/Visual/AI UX）は N/A | docs-onlyタスクのため視覚評価対象がない |

## 発見事項記録

Phase 11実行時に発見したスコープ外の問題・改善提案は以下に記録し、
Phase 12の未タスク検出レポートへ引き渡す：

| 発見事項ID       | 内容 | 対応方針 |
| ---------------- | ---- | -------- |
| （実行時に記録） | -    | -        |

## 参照資料

| 資料名                 | パス                                                                             | 用途                 |
| ---------------------- | -------------------------------------------------------------------------------- | -------------------- |
| Phase 10 最終レビュー  | `outputs/phase-10/final-review-report.md`                                        | 最終確認内容の参照   |
| phase-11-guide         | `.claude/skills/task-specification-creator/references/phase-11-guide.md`         | docs-only 手動テスト |
| phase-template-phase11 | `.claude/skills/task-specification-creator/references/phase-template-phase11.md` | NON_VISUAL判定基準   |

## 成果物

| 成果物                   | パス                                        | 説明                                             |
| ------------------------ | ------------------------------------------- | ------------------------------------------------ |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | docs-only 代替検証 / TC-ID 実施可否の記録        |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 証跡ソース・NON_VISUAL理由・自動テスト結果サマリ |
| 発見事項記録             | `outputs/phase-11/discovered-issues.md`     | スコープ外発見事項・改善提案（0件も出力必須）    |

## 完了条件

- [ ] NON_VISUALの判定理由が明記されていること
- [ ] 証跡の主ソース（自動テスト名・件数・結果）が記録されていること
- [ ] docs-only 代替検証（SKILL.md 到達性 / LOGS.md 到達性 / mirror parity / validator replay）が記録されていること
- [ ] スクリーンショットを作成しない理由が記録されていること
- [ ] 手動テストチェックリストが作成されていること
- [ ] 発見事項記録が作成されていること（0件も明記）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新
