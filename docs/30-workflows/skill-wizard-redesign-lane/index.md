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
- **Step 3**: ネクストアクション3カード + 骨格品質フィードバック（👍/👎）+ リカバリーフロー
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

Wave 1（並列・W0完了後 ※02dはW0と同時可）
  W1-par-02a-skill-info-step             # SkillInfoStep.tsx（Step 0）
  W1-par-02b-conversation-round-step     # ConversationRoundStep.tsx（Step 1）
  W1-par-02c-complete-step               # CompleteStep.tsx（完了画面）
  W1-par-02d-lifecycle-panel             # SkillLifecyclePanel.tsx（遷移ボタン化）

Wave 2（並列・W1完了後）
  W2-seq-03a-skill-create-wizard         # SkillCreateWizard.tsx（オーケストレーション）
  W2-seq-03b-wizard-exports              # wizard/index.ts（エクスポート更新）

Wave 3（直列・W2完了後）
  W3-seq-04-usage-tracking               # 使用率計装（trackEvent / NON_VISUAL）
```

## Phase一覧

| Phase | 名称             | 仕様書                                                       | ステータス |
| ----- | ---------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           | pending    |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       | pending    |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         | pending    |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         | pending    |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       | pending    |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | pending    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | pending    |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             | pending    |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | pending    |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         | pending    |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           | pending    |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)       | pending    |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

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
