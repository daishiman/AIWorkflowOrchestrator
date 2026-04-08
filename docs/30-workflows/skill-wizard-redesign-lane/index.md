# スキル作成ウィザード改善 実装レーン

## 概要

スキル作成ウィザードを全面改善するための実装タスク群。  
「テンプレート生成廃止・LLM専用化」「6問固定会話ラリー」「スマートデフォルト」「完了画面再設計」を実現する。

## 実行方針

- タスク分類: NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし）
- 参照 skill: `task-specification-creator` / `aiworkflow-requirements`
- 検証レーン: Phase 1-3 で skill 準拠検証と 30 思考法レビューを並列化し、Phase 4 以降で実装と検証を進める
- 証跡レーン: Phase 11 は NON_VISUAL で console / mock / automation evidence を主証跡にし、Phase 12 は canonical 6 成果物 + step log + 準拠チェックを同一 wave で揃える
- 制約: commit / push / PR はユーザー承認があるまで実行しない。Phase 13 は blocked のまま PR readiness のみ保持する

### SubAgent 配分

| SubAgent | 担当範囲   | 役割                                                                        |
| -------- | ---------- | --------------------------------------------------------------------------- |
| A        | Phase 1-3  | `task-specification-creator` と `aiworkflow-requirements` の skill 準拠検証 |
| B        | Phase 1-3  | 30種の思考法による多角的分析と改善方針の整理                                |
| C        | Phase 4-8  | テスト駆動の実装・拡充・リファクタリング                                    |
| D        | Phase 9-11 | 型 / Lint / Coverage / 手動検証の品質ゲート                                 |
| E        | Phase 12   | canonical 6 成果物 + step log + 仕様準拠チェックの作成                      |
| F        | Phase 13   | ユーザー承認後の PR 準備（blocked 維持）                                    |

## 設計根拠

30種の思考法による3サイクルの検証を経て以下が確定した：

- **Step 0**: 3フィールド（スキル名/目的/カテゴリ）のみ
- **Step 1**: 6問固定・2ページ（3+3）・進捗「質問N/6」常時表示・スマートデフォルト
- **Step 2**: ネクストアクション3カード + 骨格品質フィードバック（👍/👎）+ リカバリーフロー
- **SkillLifecyclePanel**: テキストエリア削除・ウィザード遷移ボタンのみ

## 実行オーケストレーション

| SubAgent  | 役割                                                                                                          | 並列性                 | 主な参照                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| 検証Agent | `task-specification-creator` / `aiworkflow-requirements` との準拠差分を抽出し、矛盾・漏れ・依存関係を固定する | Phase 1-2 で並列       | `.claude/skills/task-specification-creator/SKILL.md`, `.claude/skills/aiworkflow-requirements/SKILL.md` |
| 分析Agent | 30種の思考法をカテゴリ別に適用し、改善仮説とエレガント化方針を作る                                            | 検証Agent と並列       | 変更差分、Phase 2-3、レビュー結果                                                                       |
| 改善Agent | 検証結果と分析結果を統合し、各 Phase の成果物を更新する                                                       | 独立ファイル単位で並列 | Phase 4-12 の各 spec / output                                                                           |

- Phase 1-3 では `検証Agent` と `分析Agent` を並列に走らせ、Phase 3 で統合する。
- 依存のない修正と Phase 12 の成果物生成は並列化する。
- 30種の思考法は `分析Agent` に集約し、判断根拠は Phase 12 の `skill-feedback-report.md` と `phase12-task-spec-compliance-check.md` に残す。

## タスク一覧と並列実行マップ

```
Wave 0（直列・先行必須）
  W0-seq-01-types-skill-info-form        # 型定義（SkillInfoFormData等）
  W0-seq-02-smart-default-reasoning-service  # 推論サービス（inferSmartDefaults / shared）

Wave 1（並列・W0完了後 ※02dはW0と同時可）
  W1-par-02a-skill-info-step             # SkillInfoStep.tsx（Step 0）
  W1-par-02b-conversation-round-step     # ConversationRoundStep.tsx（Step 1）
  W1-par-02c-complete-step               # CompleteStep.tsx（完了画面）
  W1-par-02d-lifecycle-panel             # SkillLifecyclePanel.tsx（遷移ボタン化）

Wave 2（並列・W1完了後）
  W2-seq-03a-skill-create-wizard-2       # SkillCreateWizard.tsx（オーケストレーション）
  W2-seq-03b-wizard-exports              # wizard/index.ts（エクスポート更新）

Wave 3（直列・W2完了後）
  W3-seq-04-usage-tracking               # 使用率計装（trackEvent / NON_VISUAL）
```

- W0-seq-01 は Phase 1-11 の outputs を補完し、Phase 12 の canonical 6 成果物と `artifacts.json` / `outputs/artifacts.json` を同期済み。共有型は `@repo/shared/types/skillCreator` に閉じ、root `@repo/shared` へは拡張しない。
- W0-seq-02 は `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/` 配下で `inferSmartDefaults` を `@repo/shared` から公開し、Phase 12 close-out まで完了済み。root / outputs artifacts と lane index の同期を同波で確認した。
- W1-par-02a は `docs/30-workflows/W1-par-02a-skill-info-step-2/` で Step 0 の仕様・検証・完了記録を整理し、`apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` と `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` を実装済み。Issue #2012 クローズ・PR #2019 マージにより Phase 1-13 完了済み。`SkillInfoFormData` は `@repo/shared/types/skillCreator` の subpath import に閉じている。
- W2-seq-03a は `docs/30-workflows/W2-seq-03a-skill-create-wizard-2/` で `SkillCreateWizard.tsx` の Wave 2 再実装（3ステップ構成・shared `inferSmartDefaults` 統合・NON_VISUAL 計装 5 点）を完了。19件テスト全 PASS・Line Coverage 98.14%・Branch 84%・Function 100%・TypeScript エラー 0・ESLint 警告 0。Phase 1-12 の全 outputs および canonical 6 成果物を作成済み（実装ガイド: `docs/30-workflows/W2-seq-03a-skill-create-wizard-2/outputs/phase-12/implementation-guide.md`）。Phase 13（PR 作成）はユーザー承認待ちで blocked 維持。

## Phase一覧

| Phase | 名称             | 仕様書                                                                                    | ステータス |
| ----- | ---------------- | ----------------------------------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](../W0-seq-01-types-skill-info-form/phase-1-requirements.md)     | completed  |
| 2     | 設計             | [phase-2-design.md](../W0-seq-01-types-skill-info-form/phase-2-design.md)                 | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](../W0-seq-01-types-skill-info-form/phase-3-design-review.md)   | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](../W0-seq-01-types-skill-info-form/phase-4-test-creation.md)   | completed  |
| 5     | 実装             | [phase-5-implementation.md](../W0-seq-01-types-skill-info-form/phase-5-implementation.md) | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](../W0-seq-01-types-skill-info-form/phase-6-test-expansion.md) | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage.md](../W0-seq-01-types-skill-info-form/phase-7-coverage.md)             | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](../W0-seq-01-types-skill-info-form/phase-8-refactoring.md)       | completed  |
| 9     | 品質保証         | [phase-9-qa.md](../W0-seq-01-types-skill-info-form/phase-9-qa.md)                         | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](../W0-seq-01-types-skill-info-form/phase-10-final-review.md)   | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](../W0-seq-01-types-skill-info-form/phase-11-manual-test.md)     | completed  |
| 12    | ドキュメント更新 | [phase-12-docs.md](../W0-seq-01-types-skill-info-form/phase-12-docs.md)                   | completed  |
| 13    | PR作成           | [phase-13-pr.md](../W0-seq-01-types-skill-info-form/phase-13-pr.md)                       | blocked    |

## テストカバレッジ目標

| 対象                                            | 目標     | 観点                              |
| ----------------------------------------------- | -------- | --------------------------------- |
| `apps/desktop/src/renderer/utils/trackEvent.ts` | 100%     | スタブの全分岐                    |
| `SkillCreateWizard.tsx`                         | 90% 以上 | 5つの計装ポイント                 |
| `CompleteStep.tsx`                              | 90% 以上 | `skill_wizard_next_action` の発火 |

## 統合テスト連携

- Phase 1 の AC-01〜AC-05 を Phase 4 の TC-01〜TC-09 に落とし込み、Phase 6 で edge case を追加する。
- Phase 7 で coverage と traceability を確認し、Phase 11 では NON_VISUAL の manual evidence を記録する。
- Phase 12 で `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` をそろえる。
- Phase 13 は user の明示承認があるまで blocked のまま維持する。

## Phase完了時の必須アクション

1. Phase 内の全タスクを 100% 実行する。
2. 必須成果物の存在を確認し、`artifacts.json` と `outputs/artifacts.json` の整合を保つ。
3. 完了条件と未完了理由を明記し、次 Phase へ引き継ぐ。

## 依存グラフ

```
W0-seq-01
 ├─→ W1-par-02a ─┐
 ├─→ W1-par-02b ─┼─→ W2-seq-03a ─→ W3-seq-04
 ├─→ W1-par-02c ─┤
 └─→ W1-par-02d  └─→ W2-seq-03b
                    (W1-par-02a+02b+02c完了後)
```

## ディレクトリ命名規則

| プレフィックス            | 意味                                           |
| ------------------------- | ---------------------------------------------- |
| `W0` / `W1` / `W2` / `W3` | 実行ウェーブ番号（数字が小さいほど先）         |
| `seq-`                    | 前ウェーブの完了を待つ直列実行                 |
| `par-`                    | 同ウェーブ内で並列実行可能                     |
| `-01-` / `-02a-` 等       | タスク識別番号（アルファベットは同Wave内の枝） |

例: `W1-par-02b-conversation-round-step` → Wave 1 / 並列可 / タスク02b

## 最短実装経路

```
所要ウェーブ: 4波
クリティカルパス: W0-seq-01 → W1-par-02a → W2-seq-03a → W3-seq-04
推奨並列Agent数: 4（Wave 1の4タスクを同時実行）
```

## 参照設計書

| ドキュメント            | パス                                                 |
| ----------------------- | ---------------------------------------------------- |
| 設計確定会話ログ        | (本会話)                                             |
| 既存ウィザード実装      | `apps/desktop/src/renderer/components/skill/`        |
| 既存型定義              | `packages/shared/src/types/skill.ts`                 |
| Phase 1-13 フォーマット | `.claude/skills/task-specification-creator/SKILL.md` |
| System spec 正本        | `.claude/skills/aiworkflow-requirements/SKILL.md`    |

## 作成日

2026-04-07
