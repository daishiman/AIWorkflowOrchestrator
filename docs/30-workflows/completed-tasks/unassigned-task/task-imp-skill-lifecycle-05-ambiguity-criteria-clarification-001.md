# TASK-IMP-SKILL-LIFECYCLE-05-AMBIGUITY-CRITERIA-CLARIFICATION-001

## メタ情報

```yaml
issue_number: 1241
```

## メタ情報

| 項目       | 値                                                               |
| ---------- | ---------------------------------------------------------------- |
| タスクID   | TASK-IMP-SKILL-LIFECYCLE-05-AMBIGUITY-CRITERIA-CLARIFICATION-001 |
| カテゴリ   | imp（改善）                                                      |
| 優先度     | 中                                                               |
| 規模       | small                                                            |
| ステータス | 未着手                                                           |
| 発見源     | TASK-SKILL-LIFECYCLE-05 Phase 9 品質検証 / Phase 12              |
| 作成日     | 2026-03-15                                                       |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-SKILL-LIFECYCLE-05 の Phase 9 品質検証で「適切に表示される」「正しく動作する」等の曖昧表現が11件検出された。02-code-quality.md のルール「仕様書・コメントに曖昧表現（適切に、必要に応じて、など）を使わない」に違反している。

### 問題点

曖昧表現がテスト設計書に残ると、テストの合否基準が実行者の解釈に依存し、判定ぶれが起きる。特に16パターンの CTA マトリクスでは、「適切に表示される」が ScoringGate の4段階 × 4CTA のどのパターンを指すのか不明確になる。

### 放置時の影響

- 実装フェーズでテストコードの期待値が曖昧になり、false positive/negative が発生する
- レビュー時に「この CTA は表示されるべきか？」の判断が揺れる
- 将来のタスクで同仕様書を参照する開発者が誤った前提で実装する

## 2. 何を達成するか（What）

### 目的

テスト設計書内の曖昧語を DOM 要素/イベント/値ベースの検証条件へ置換する。

### 最終ゴール

Phase 4 テスト設計書内の全テストケースの期待結果が、`data-testid` / `textContent` / `onClick` 引数等の具体条件で記述されている。

### スコープ

- **含む**: Phase 4 テスト設計書（scoring-gate-cta-matrix.md, flow-test-design.md 等）の曖昧表現修正
- **含まない**: 他のタスクの仕様書、実装コードの修正

### 成果物

| 名前                   | 説明                                         |
| ---------------------- | -------------------------------------------- |
| 曖昧語一覧と置換ルール | 11件の曖昧語 → 具体条件の対応表              |
| テスト設計書更新       | 各 TC の期待結果を具体条件に書き換え         |
| 再流入防止ルール       | 曖昧語検出の grep コマンドと CI チェック定義 |

## 3. どのように実行するか（How）

### 前提条件

- Phase 9 の `ambiguity-detection-report.md` に11件の検出結果が記録されている
- `cta-visibility.ts` の16パターンマトリクスが実装済み

### 推奨アプローチ

曖昧語の洗い出しと置換ルールを先に定義し、TC 単位で具体条件を記載する。CTA マトリクスの検証条件は `CTA_VISIBILITY_MAP` の定義値を直接参照する。

### 3.5. 苦戦しやすいポイント（TASK-SKILL-LIFECYCLE-05 実体験ベース）

- **Record パターンと曖昧表現の関連**: TASK-SKILL-LIFECYCLE-05 で `Record<ScoringGate, CTAVisibility>` を使うことで「全パターンが定義されている」ことを TypeScript が保証した。同様に、テスト設計書でも ScoringGate ごとの期待値を表形式で網羅的に定義すれば曖昧さが解消される
- **文書修正とテストコードの乖離**: 文書だけ修正してテストコードへ反映し忘れやすい。TASK-SKILL-LIFECYCLE-05 で artifacts.json 更新漏れが発生した教訓から、文書修正 → テストコード反映 → 突合確認の3ステップを必ず実行する
- **「適切に」の再流入**: grep で除去した後も、別の表現（「うまく」「正常に」等）で再流入しやすい。CI に曖昧語検出 grep を組み込む

```
# 置換例
❌ 「ScoreGateBadge が適切に表示される」
✅ 「[data-testid="score-gate-badge"] 要素が存在し、textContent が "80点" を含む」

❌ 「CTA が正しく動作する」
✅ 「onClick ハンドラが1回呼び出され、引数が { skillName: "test-skill", route: "workspace" } である」
```

## 4. 実行手順

1. Phase 9 の `ambiguity-detection-report.md` から11件の曖昧語を抽出する
2. 各曖昧語の置換ルール（DOM 条件、イベント回数、引数一致）を `CTA_VISIBILITY_MAP` 定義値に基づいて定義する
3. TC ごとに期待結果を具体条件へ書き換える（scoring-gate-cta-matrix.md, flow-test-design.md 等）
4. 実装側テストケース（`cta-visibility.test.ts`）と突合して差分を解消する
5. 曖昧語検出の grep コマンドを作成し、再流入防止ルールとして記録する

## 5. 完了条件チェックリスト

- [ ] 11件の曖昧語一覧と置換方針が定義されている
- [ ] 対象 TC が具体条件（DOM 要素/イベント/値ベース）へ更新されている
- [ ] テストコード（`cta-visibility.test.ts`）との整合が取れている
- [ ] 再流入防止ルール（grep コマンド）が記録されている
- [ ] `rg -n "適切に|正しく|必要に応じて|など|うまく|正常に"` の実行結果が0件である

## 6. 検証方法

```bash
# 曖昧語残存チェック
rg -n "適切に|正しく|必要に応じて|など|うまく|正常に" \
  docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/

# 仕様書品質検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey --json

# CTA テストとの整合確認
pnpm --filter @repo/shared exec vitest run src/types/__tests__/cta-visibility.test.ts
```

## 7. リスクと対策

| リスク                 | 影響度 | 確率 | 対策                                         |
| ---------------------- | ------ | ---- | -------------------------------------------- |
| 置換漏れが残る         | 中     | 中   | 機械検索（grep）と手動レビューを二重実施する |
| 条件が過剰に細かくなる | 低     | 中   | テスト目的単位で最小条件に絞る               |
| 別表現で曖昧語が再流入 | 中     | 高   | 検出パターンを拡張し CI に組み込む           |

## 8. 参照情報

| ドキュメント              | パス                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Phase 12 未タスクレポート | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-12/unassigned-task-report.md` |
| Phase 9 品質検証成果物    | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-9/`                           |
| 品質要件仕様              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                    |
| workflow 正本             | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`                    |
| CTA 制御マトリクス        | `packages/shared/src/types/cta-visibility.ts`                                                                                  |
| コード品質ルール          | `.claude/rules/02-code-quality.md`                                                                                             |

## 9. 備考

- 文書修正のみで完了とせず、対応テストへの反映確認まで完了条件に含める
- TASK-SKILL-LIFECYCLE-05 で artifacts.json 更新漏れが発生した教訓から「成果物の同期確認」を必ず最終ステップに含める
- 曖昧語検出パターンは将来の Phase 9 でも再利用可能
