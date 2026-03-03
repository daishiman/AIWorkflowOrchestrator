# Phase 12 Step 0: aiworkflow 仕様抽出結果

## 1. 目的

`task-specification-creator` の Step 0 要件に従い、今回実装（UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001）で参照・更新すべき `aiworkflow-requirements` 仕様を漏れなく抽出し、`必須/条件付き/対象外` を明確化する。

## 2. 抽出方式（Progressive Disclosure）

1. `resource-map.md` でタスク種別に対応する初期候補を選定
2. `topic-map.md` で対象セクションを確認
3. `search-spec.js` で機械検索し、候補の過不足を確認
4. 仕様書ごとに担当SubAgentを割り当て（1仕様書=1SubAgent）

## 3. 実行ログ（要約）

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "Phase 12" --files-only
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SubAgent" --files-only
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "currentViolations" --files-only
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "task-workflow" --files-only
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "lessons-learned" --files-only
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "quality-requirements" --files-only
```

| キーワード             | ヒット件数 | ファイル数 | 判定                         |
| ---------------------- | ---------: | ---------: | ---------------------------- |
| `Phase 12`             |        443 |         24 | 広すぎるため一次候補のみ     |
| `SubAgent`             |        189 |          8 | 今回主題に一致               |
| `currentViolations`    |         66 |          7 | 監査合否基準に一致           |
| `task-workflow`        |        179 |         19 | Step 1-A/1-Cの更新対象に一致 |
| `lessons-learned`      |         80 |         15 | Step 1-A/教訓同期に一致      |
| `quality-requirements` |         22 |         11 | Phase 9品質基準の参照に一致  |

## 4. 抽出結果（仕様書単位）

| 区分           | ファイル                                                                    | 担当SubAgent | 採用理由                                             |
| -------------- | --------------------------------------------------------------------------- | ------------ | ---------------------------------------------------- |
| 必須           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`            | B3           | 抽出起点。候補選定に必須                             |
| 必須           | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`               | B3           | 対象セクション確定に必須                             |
| 必須           | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`             | B3           | 抽出根拠の機械化に必須                               |
| 必須           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | B1           | Step 1-A/1-Cの台帳更新先                             |
| 必須           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | B2           | 苦戦箇所・再利用手順の同期先                         |
| 必須           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | B1           | Phase 9品質基準参照                                  |
| 必須           | `.claude/skills/aiworkflow-requirements/LOGS.md`                            | D            | Step 1-A履歴更新先                                   |
| 必須           | `.claude/skills/aiworkflow-requirements/SKILL.md`                           | D            | Step 1-A変更履歴更新先                               |
| 必須           | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`          | B3           | Step 1-Dの索引再生成                                 |
| 条件付き       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`  | B1           | 品質ゲート定義を変更する場合のみ必要                 |
| 対象外（破棄） | `.claude/skills/aiworkflow-requirements/references/arch-*`                  | -            | 今回は運用テンプレート改善であり、アーキ契約変更なし |
| 対象外（破棄） | `.claude/skills/aiworkflow-requirements/references/api-*`                   | -            | IPC/API契約変更なし                                  |
| 対象外（破棄） | `.claude/skills/aiworkflow-requirements/references/interfaces-*`            | -            | 型契約変更なし                                       |
| 対象外（破棄） | `.claude/skills/aiworkflow-requirements/references/security-*`              | -            | セキュリティ仕様変更なし                             |

## 5. 整合性チェック

- 漏れ確認: `phase-*.md` 内の aiworkflow 参照を全件列挙し、上表の必須/条件付きに包含されることを確認済み
- 矛盾確認: `phase-12-documentation.md` の実行順を `Step 0 -> Step 1-A -> Step 1-B -> Step 1-C -> Step 1-D -> Step 2` に統一済み
- 依存確認: B3（抽出）完了前に B1/B2 を開始しない依存順を維持

## 6. 結論

今回実装に必要な `aiworkflow-requirements` 情報は、必須9件 + 条件付き1件として抽出完了。対象外仕様書は除外理由付きで明示したため、漏れ・過剰参照の両方を抑制できる。
