# Phase 5 Implementation Diff

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 5                                    |
| タイプ | docs-only / NON_VISUAL               |
| 実施日 | 2026-04-06                           |
| 対象   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 |

## 変更サマリー

| ファイル                                                                       | 変更種別 | 内容                                                                              |
| ------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/assets/phase-spec-template.md`      | 修正     | Task/Step 分離ルール追加・Phase 11 NON_VISUAL 分岐追加・Phase 12 記録分離方針追加 |
| `.claude/skills/task-specification-creator/assets/unassigned-task-template.md` | 修正     | 苦戦箇所記載欄の明確化（備考セクション拡充）                                      |

## 変更詳細

### 変更 1: Task/Step 分離ルール（`phase-spec-template.md`）

`## 実行タスク` セクション直下に以下の blockquote ガイドラインを追加した:

```markdown
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - `TASKS[*].steps` は実行前の手順だけを書く。実行結果、判定、取得値は書かない。
> - current fact は `Phase実行記録` または `outputs/phase-{{PHASE_NUMBER}}/` 配下の成果物へ記録する。
> - Phase 11 / Phase 12 の証跡は、本文と成果物を混在させずに分離する。
```

- **AC-1 対応**: plan と current fact の境界を仕様書本文レベルで明示
- **TC-04 対応**: 一読でセクション責務が判別可能

### 変更 2: Phase 11 NON_VISUAL/VISUAL 分岐（`phase-spec-template.md`）

`{{#if IS_PHASE_11}}` ブロック内に `{{#if IS_NON_VISUAL}}` / `{{else}}` 条件分岐を追加した:

```handlebars
{{#if IS_PHASE_11}}
  ## Phase 11 手動テスト方針

  {{#if IS_NON_VISUAL}}
    - `manual-test-checklist.md` を必ず作成する - `screenshot-plan.json`
    は生成しない - primary evidence は `vitest` / `typecheck` / `lint` /
    テンプレート仮生成確認 - `manual-test-result.md` には `TC-ID ↔
    evidence`、NON_VISUAL である理由、代替 evidence を明記する -
    placeholder-only の証跡は PASS 扱いにしない

  {{else}}
    - `manual-test-checklist.md` を必ず作成する - `screenshot-plan.json` と PNG
    証跡を必須とする - `manual-test-result.md` に `TC-ID ↔ PNG` の対応を明記する
    - placeholder-only の証跡は PASS 扱いにしない

  {{/if}}
{{/if}}
```

- **AC-2 対応**: NON_VISUAL では screenshot 不要を明記
- **TC-02 対応**: docs-only タスクで screenshot-plan.json が生成されない

### 変更 3: Phase 12 記録分離方針（`phase-spec-template.md`）

`{{#if IS_PHASE_12}}` ブロックに「実行タスクは plan」「成果物ファイルは current fact」の分離方針を追加した:

```handlebars
{{#if IS_PHASE_12}}
  ## Phase 12 記録分離方針 - `実行タスク` は plan、`Phase実行記録` と
  `outputs/phase-12/*.md` は current fact として扱う -
  `phase12-task-spec-compliance-check.md` は Task / Step / validator /
  artifacts.json / current-baseline の同値性を集約する root evidence
  として必ず作成する - docs-only / spec_created workflow では Step 1-B の status
  を `spec_created` とし、`completed` へ置き換えない - 仕様更新の有無は
  `documentation-changelog.md` と `system-spec-update-summary.md`
  で同じ結論にする - spec 変更がある場合は `topic-map.md` を同 wave で再生成する
{{/if}}
```

- **AC-3 対応**: 実行タスク（plan）と検証ログ（current fact）の分離構造
- **TC-01, TC-03 対応**: Task 12-6 の root evidence が成果物に含まれる

### 変更 4: 苦戦箇所記載欄の明確化（`unassigned-task-template.md`）

`## 9. 備考` セクションの「苦戦箇所」記載欄を以下の構造に明確化した:

```markdown
### 苦戦箇所【記入必須】

> 実行中に迷った点、判断に時間がかかった点、再利用したい回避策を具体的に記録してください。
> Phase 11 / Phase 12 由来の苦戦箇所は、少なくとも 1 つの source evidence ファイル名を併記してください。
> Phase 12 の skill-feedback-report へ転記できる粒度で書くこと。
> 「特になし」の場合も、その旨を明記してください。

| 項目     | 内容                 |
| -------- | -------------------- |
| 症状     | {{何に困ったか}}     |
| 原因     | {{なぜ迷ったか}}     |
| 対応     | {{どう解決したか}}   |
| 再発防止 | {{次回どう避けるか}} |
```

- **AC-1 対応補完**: 苦戦箇所が skill-feedback-report へ流れる粒度を確保
- **TC-07 対応**: 苦戦箇所欄が明確に定義されている

## Handlebars タグバランス確認

```
Open tags ({{#): 12
Close tags ({{/): 12
判定: PASS
```

## 完了確認

- [x] phase-spec-template.md に Task/Step 分離ルール追加
- [x] Phase 11 IS_NON_VISUAL / VISUAL 分岐追加
- [x] Phase 12 記録分離方針追加
- [x] unassigned-task-template.md 苦戦箇所記載欄明確化
- [x] Handlebars タグバランス PASS
