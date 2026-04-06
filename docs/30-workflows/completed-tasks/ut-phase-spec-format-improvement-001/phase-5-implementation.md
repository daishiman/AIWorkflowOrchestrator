# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 5                                                                 |
| Phase名    | 実装                                                              |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | Phase 4: テスト作成                                               |
| 次Phase    | Phase 6: テスト拡充                                               |
| ステータス | pending                                                           |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

Phase 2 の設計に基づき、`phase-spec-template.md` と `unassigned-task-template.md` を実際に改修する。docs-only / spec_created の canonical ルールに合わせ、Phase 4 で定義した TC-01〜TC-07 をパスする実装を行う。

## 実装計画

### 変更ファイル一覧

| 種別 | ファイルパス                                                                   | 変更内容                                                    |
| ---- | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| 修正 | `.claude/skills/task-specification-creator/assets/phase-spec-template.md`      | Task/Step 分離ガイドライン追加・IS_NON_VISUAL / VISUAL 分岐 |
| 修正 | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md` | 苦戦箇所記載欄の明確化                                      |

## 実行タスク

### Task 5-1: 現行テンプレートの読み込みと差分計画

実装前に現行テンプレートを読み込み、追加箇所を特定する。

```bash
# 現行テンプレートの確認
cat .claude/skills/task-specification-creator/assets/phase-spec-template.md

# Phase 11 セクションの確認
grep -n "Phase 11\|manual-test-checklist\|manual-test-result\|discovered-issues\|IS_NON_VISUAL\|screenshot\|evidence" \
  .claude/skills/task-specification-creator/assets/phase-spec-template.md

# Phase 12 セクションの確認
grep -n "Phase 12\|Task 12\|実行タスク\|検証ログ\|phase12-task-spec-compliance-check" \
  .claude/skills/task-specification-creator/assets/phase-spec-template.md
```

### Task 5-2: `phase-spec-template.md` の改修

以下の変更を `phase-spec-template.md` に加える。

**変更 1: Task/Step 分離ガイドラインの追加**

Phase 仕様書の冒頭または「実行タスク」セクション前に以下のガイドラインを追加:

```markdown
<!-- Task/Step 分離ガイドライン
  - 実行タスク（このセクション）: plan。命令形・現在形で記述
  - 検証ログ・実行結果: current fact。outputs/ 配下の成果物ファイルに過去形・完了形で記録
  - 境界ルール: 仕様書本文には「何をやるべきか」のみ記述する
-->
```

**変更 2: Phase 11 の NON_VISUAL evidence 分岐追加**

Phase 11 テンプレート相当のセクションに以下を追加:

```handlebars
{{#if IS_NON_VISUAL}}
  ### NON_VISUAL タスクの evidence ルール 本タスクは
  **NON_VISUAL**（表示層変更なし）のため: - **screenshot は不要**:
  `screenshot-plan.json` を生成しない - **primary evidence**:
  `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md`
  - **追加確認**: `verify-all-specs` / `validate-phase-output` /
  `verify-unassigned-links` の再実行を記録する

{{else}}
  ### VISUAL タスクの evidence ルール 本タスクは
  **VISUAL**（表示層変更あり）のため: - `screenshot-plan.json` の生成が必須 - 実
  PNG ファイルの取得が必須 - vitest / typecheck / lint の実行結果が必須 -
  `manual-test-checklist.md` / `manual-test-result.md` に `TC-ID ↔ PNG`
  を記録する

{{/if}}
```

**変更 3: Phase 12「実行タスク」と「検証ログ」の分離構造追加**

Phase 12 テンプレート相当のセクションに以下の構造を定義:

```handlebars
## Phase 12 実行タスク（計画） > **重要**: 以下はタスクの「定義（plan）」です。
> 実行結果・判定根拠は `outputs/phase-12/`
配下の成果物ファイルに記録してください。 >
本セクションに実行ログを直接記述しないこと（plan と current fact
を分離するため）。 ### Task 12-1: 実装ガイドの作成 --- ## Phase 12
検証ログ記録先（current fact）
各タスクの実行結果は以下のファイルに記録する（仕様書本文には記述しない）: | Task
| 記録先 | 記述形式 | | ---- | ------ | -------- | | Task 1 |
`outputs/phase-12/implementation-guide.md` | 過去形・完了形 | | Task 2 |
`outputs/phase-12/system-spec-update-summary.md` | 過去形・完了形 | | Task 3 |
`outputs/phase-12/documentation-changelog.md` | 過去形・完了形 | | Task 4 |
`outputs/phase-12/unassigned-task-detection.md` | 過去形・完了形 | | Task 5 |
`outputs/phase-12/skill-feedback-report.md` | 過去形・完了形 | | Task 6 |
`outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence |
```

### Task 5-3: `unassigned-task-template.md` の改修

既存の「備考」セクションに「苦戦箇所」記載欄を明確化する。

```markdown
## 9. 備考

### 苦戦箇所【記入必須】

> このタスクの実施において苦戦した箇所を具体的に記録してください。
> Phase 12 の skill-feedback-report に反映される重要な情報です。
> 「特になし」の場合はその旨を明記してください。

（実施後に記録）
```

### Task 5-4: 改修後の差分確認

```bash
# 変更内容の確認
git diff .claude/skills/task-specification-creator/assets/phase-spec-template.md
git diff .claude/skills/task-specification-creator/assets/unassigned-task-template.md

# Handlebars 構文チェック（node.js 使用）
node -e "
const fs = require('fs');
const template = fs.readFileSync('.claude/skills/task-specification-creator/assets/phase-spec-template.md', 'utf8');
// 基本的な Handlebars タグのバランス確認
const openTags = (template.match(/\{\{#/g) || []).length;
const closeTags = (template.match(/\{\{\//g) || []).length;
console.log('Open tags:', openTags, '/ Close tags:', closeTags);
if (openTags !== closeTags) console.error('FAIL: Unbalanced Handlebars tags');
else console.log('PASS: Handlebars tags balanced');
"
```

## 成果物

| 成果物               | パス                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| 改修対象テンプレート | `.claude/skills/task-specification-creator/assets/phase-spec-template.md`      |
| 改修対象テンプレート | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md` |

## 参照資料

| 資料名               | パス                                                                      |
| -------------------- | ------------------------------------------------------------------------- |
| Phase 2 設計書       | `outputs/phase-2/design-doc.md`                                           |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`                                           |
| 改修対象             | `.claude/skills/task-specification-creator/assets/phase-spec-template.md` |

## 統合テスト連携

- Phase 6 以降の検証で、改修済みテンプレートを前提に追加テストと品質確認を行う。
- Phase 9/10 で本実装差分が既存フォーマットと矛盾しないことを最終確認する。

## 完了条件

- [ ] `phase-spec-template.md` に Task/Step 分離ガイドラインが追加されている
- [ ] Phase 11 テンプレートに IS_NON_VISUAL / VISUAL 分岐が追加されている
- [ ] Phase 12 テンプレートに「実行タスク」と「検証ログ」の分離構造が追加されている
- [ ] `unassigned-task-template.md` の苦戦箇所記載欄が明確化されている
- [ ] Handlebars タグのバランスが確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
