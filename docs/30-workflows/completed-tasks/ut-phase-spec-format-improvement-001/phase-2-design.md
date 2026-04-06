# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 2                                                                 |
| Phase名    | 設計                                                              |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | Phase 1: 要件定義                                                 |
| 次Phase    | Phase 3: 設計レビュー                                             |
| ステータス | pending                                                           |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

Phase 1 の要件定義に基づき、Task/Step 分離ガイドラインと NON_VISUAL evidence ルールの具体的な設計を行う。テンプレートへの組み込み方法（Handlebars 構文含む）を設計する。

## 実行タスク

### Task 2-1: Task/Step 分離ガイドラインの設計

**設計方針**:

- `実行タスク` セクション: plan（何をやるべきか）を記述する。命令形・未来形を使用
- `検証ログ / 実行記録` セクション: current fact（何が実際に行われたか）を記述する。過去形・完了形を使用

**分離ルール定義**:

| 区分         | 記述場所           | 文体         | 内容                                 |
| ------------ | ------------------ | ------------ | ------------------------------------ |
| 実行タスク   | 仕様書本文（計画） | 命令形・現在 | 何をやるべきか（Task定義）           |
| 検証ログ     | 成果物ファイル     | 過去形・完了 | 何が実際に行われたか（Step実行結果） |
| サブステップ | 仕様書内（Task内） | 命令形・現在 | Task内の具体的なアクション定義       |

**Handlebars 構造案**:

```handlebars
## 実行タスク（計画）

{{#each tasks}}
  ### Task
  {{phase}}-{{index}}:
  {{name}}

  {{description}}

{{/each}}

--- ## 検証ログ（成果物記録先） > 実行後、各Task の結果は `outputs/phase-{{phase}}/`
配下の成果物ファイルに記録する。 >
本セクションには実行ログを直接記述しない（plan と current fact
を分離するため）。
```

### Task 2-2: NON_VISUAL evidence ルールの設計

**IS_NON_VISUAL / VISUAL 分岐設計**:

```handlebars
{{#if IS_NON_VISUAL}}
  ## NON_VISUAL タスクの evidence ルール
  本タスクは表示層変更なし（NON_VISUAL）のため、以下のルールを適用する: -
  screenshot は不要: `screenshot-plan.json` を生成しない - primary evidence は
  `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md`
  - 追加の自動検証は `verify-all-specs` / `validate-phase-output` /
  `verify-unassigned-links` を優先する - `SKILL.md` family、`LOGS.md`
  archive、`.claude` ↔ `.agents` parity を同波で確認する

{{else}}
  ## VISUAL タスクの evidence ルール
  本タスクは表示層変更あり（VISUAL）のため、以下の evidence を必須とする: -
  `screenshot-plan.json` の生成 - 実 PNG ファイルの取得 - vitest / typecheck /
  lint の実行結果 - `manual-test-checklist.md` / `manual-test-result.md` に
  `TC-ID ↔ PNG` を記録する

{{/if}}
```

### Task 2-3: Phase 12 テンプレート分離構造の設計

Phase 12 の仕様書テンプレートに「実行タスク」と「検証ログ」の分離構造を追加する設計:

```handlebars
## Phase 12 実行タスク（計画） > 以下は Phase 12
で実行すべきタスクの定義である。 > 実行結果・判定根拠は `outputs/phase-12/`
配下のファイルに記録すること。 > 本セクションには実行ログを直接記述しない（plan
と current fact を分離するため）。 ### Task 12-1: 実装ガイドの作成 --- ## Phase
12 検証ログ記録先（current fact）
各タスクの実行結果は以下のファイルに記録する（仕様書本文には記述しない）: | Task
| 記録先ファイル | 記述形式 | | ---- | -------------- | -------- | | Task 1 |
`outputs/phase-12/implementation-guide.md` | 過去形・完了形 | | Task 2 |
`outputs/phase-12/system-spec-update-summary.md` | 過去形・完了形 | | Task 3 |
`outputs/phase-12/documentation-changelog.md` | 過去形・完了形 | | Task 4 |
`outputs/phase-12/unassigned-task-detection.md` | 過去形・完了形 | | Task 5 |
`outputs/phase-12/skill-feedback-report.md` | 過去形・完了形 | | Task 6 |
`outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence |
```

### Task 2-4: 変更ファイルの特定

| 対象ファイル                         | 変更内容                                                        | 変更種別 |
| ------------------------------------ | --------------------------------------------------------------- | -------- |
| `assets/phase-spec-template.md`      | Task/Step 分離ガイドライン追加・IS_NON_VISUAL / VISUAL 分岐追加 | 修正     |
| `assets/unassigned-task-template.md` | 苦戦箇所記載欄の明確化                                          | 修正     |

## 参照資料

| 資料名                         | パス                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| Phase 1 成果物（要件定義）     | `outputs/phase-1/spec-extraction-map.md`                                                |
| phase-spec-template.md（現行） | `.claude/skills/task-specification-creator/assets/phase-spec-template.md`               |
| Phase 12 テンプレート詳細      | `.claude/skills/task-specification-creator/references/phase-template-phase12-detail.md` |
| Phase 11 テンプレート詳細      | `.claude/skills/task-specification-creator/references/phase-template-phase11-detail.md` |

## 成果物

| 成果物 | パス                            | 説明                                             |
| ------ | ------------------------------- | ------------------------------------------------ |
| 設計書 | `outputs/phase-2/design-doc.md` | Task/Step分離設計・NON_VISUAL evidenceルール設計 |

## 統合テスト連携

- Phase 3 のレビューで本設計の AC-1〜AC-5 を再確認する。
- `validate-phase-output` の構造要件を満たしたまま Phase 4 のテストケースへつなげる。

## 完了条件

- [ ] Task/Step 分離ガイドラインの設計が完了している
- [ ] NON_VISUAL evidence ルールの Handlebars 構文案が設計されている
- [ ] Phase 12 テンプレートの「実行タスク」/「検証ログ」分離構造が設計されている
- [ ] 変更対象ファイルが特定されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
