# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| Phase      | 12                                                               |
| タスクID   | UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001            |
| 機能名     | SmartDefault AC-4 フォールバック仕様のフィールド独立推論性明示化 |
| 前提Phase  | Phase 11（手動テスト完了）                                       |
| 後続Phase  | Phase 13                                                         |
| 作成日     | 2026-04-11                                                       |
| ステータス | pending                                                          |

## 目的

6つの必須タスクを完了し、タスクのドキュメント更新を完結させる。

## Task 12-1: 実装ガイド作成（2パート構成）【必須】

### Part 1（初学者・中学生レベル）

**日常生活での例え話**:

> SmartDefaultは「自動補完機能」のようなものです。たとえば、Googleマップで出発地だけ
> 入力すると、目的地はまだ決まっていなくても、地図はすぐ表示されます。
> 出発地（purpose）が空欄でも、行きたい場所のカテゴリ（category）が「レストラン」と
> 入力されていれば、「徒歩圏内のレストラン」という絞り込み（format）は独立して動きます。
> 各情報は互いに邪魔しあわず、それぞれ独立して働くのです。

**なぜ必要か**:

SmartDefaultの各フィールドが独立していることを明示することで、
「purposeが空なら全フィールドが動かない」という誤解を防ぎます。

**何をするか**:

task-specification-creator スキルのAC-4定義に「フィールド間独立推論性」の説明を追加し、
同じ誤解が将来のタスクで繰り返されないようにします。

### Part 2（開発者・技術者レベル）

**インターフェース定義**:

```typescript
// SmartDefault フィールド独立推論の型定義
interface SmartDefaultResult {
  purpose: string | null; // 空白入力時: null（他フィールドへの影響なし）
  category: string | null; // 独立推論: purposeがnullでも推論可能
  format: string | null; // 独立推論: category からのみ推論可能
}

// フィールド独立推論の原則
// - 各フィールドは独自の推論ロジックを持つ
// - あるフィールドのnullが他フィールドに連鎖しない
// - フィールド間に明示的な依存関係がない限り独立評価
```

**APIシグネチャ**:

```typescript
inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult
```

**使用例**:

```typescript
// 誤用例（アンチパターン）
if (!input.purpose) {
  return { purpose: null, category: null, format: null }; // NG: 全フィールドをnullにしてはいけない
}

// 正用例
const purpose = input.purpose?.trim() || null; // purposeのみ独立評価
const tool = inferTool(purpose); // purposeから tool を推論
const timing = inferTiming(purpose); // purposeから timing を推論
const format = inferFormat(input.category); // categoryからのみ独立推論
```

**エラーハンドリング / エッジケース**:

| ケース                                    | 期待動作                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `purpose` が空文字 / `undefined` / `null` | `purpose` は `null`、他フィールドは独立評価を継続                                                   |
| `category` が未選択                       | `format` は `null`、`purpose` 由来の tool / timing は継続                                           |
| 空白のみの `purpose`                      | `trim()` 後に空文字として扱い、`purpose` のみ `null`                                                |
| `purpose` と `category` の両方が有効      | `purpose` から tool / timing、`category` から format を独立に推論し、片方の失敗で他方を巻き込まない |

**設定可能なパラメータ**:

| パラメータ | 型               | 説明                                         |
| ---------- | ---------------- | -------------------------------------------- |
| purpose    | `string \| null` | 空白・undefined → null（他フィールド非連鎖） |
| category   | `string \| null` | purposeとは独立して format を推論            |
| format     | `string \| null` | categoryからのみ独立推論                     |

成果物: `outputs/phase-12/implementation-guide.md`

> 補足: `format` は `purpose` からは推論しない。`purpose` は tool / timing、`category` は format を担当する。

## Task 12-2: システム仕様書更新（2ステップ）【必須】

### Step 1-A: タスク完了記録

- `task-workflow.md` に完了タスク記録を追加
- `task-workflow-completed.md` / `task-workflow-backlog.md` の該当エントリを current facts に同期（該当する場合）
- `SKILL.md` 変更履歴 2ファイル更新:
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/task-specification-creator/SKILL.md`
- LOGS.md 2ファイル更新:
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
  - `.claude/skills/task-specification-creator/LOGS.md`
- `topic-map.md` 更新（新規セクション追加時）

### Step 1-B: 実装状況テーブル更新

docs-onlyタスクのため: `spec_created` として記録（`completed` ではない）

### Step 1-C: 関連タスクテーブル更新

- 検出元タスク `UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001` の関連タスクテーブルを更新
- `UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001` のステータスを current facts へ

### Step 2: システム仕様更新（条件付き）

AC-4定義への追記は既存インターフェースの**変更ではなく補足追記**のため、
Step 2（新規インターフェース追加）は **N/A** とし、その判断根拠を `system-spec-update-summary.md` に明記する。

成果物: `outputs/phase-12/system-spec-update-summary.md`

## Task 12-3: ドキュメント更新履歴作成【必須】

全Step（1-A/1-B/1-C/1-D/1-E/1-F/1-G/Step 2）の結果を個別に明記する（「該当なし」も記録）。
`artifacts.json` / `outputs/artifacts.json` の parity と current/baseline の差分も記録する。

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js
```

成果物: `outputs/phase-12/documentation-changelog.md`

## Task 12-4: 未タスク検出レポート作成【必須・0件でも出力必須】

### 検出ソース

| ソース                     | 確認項目                           |
| -------------------------- | ---------------------------------- |
| Phase 3レビュー MINOR指摘  | 未タスク化対象                     |
| Phase 10レビュー MINOR指摘 | 未タスク化対象                     |
| Phase 11発見事項           | スコープ外発見事項                 |
| コードコメント             | TODO/FIXME（テストファイル追加分） |

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan docs/30-workflows/ut-skill-wizard-fb-03-fallback-spec-clarification-001 \
  --output .tmp/unassigned-candidates.json
```

- 1件以上の候補が出た場合は `docs/30-workflows/unassigned-task/` に指示書を作成し、`task-workflow.md` / 関連仕様書 / `verify-unassigned-links.js` を同波で更新する

成果物: `outputs/phase-12/unassigned-task-detection.md`

## Task 12-5: スキルフィードバックレポート作成【必須・改善点なしでも出力必須】

| 観点             | 記録内容                           |
| ---------------- | ---------------------------------- |
| テンプレート改善 | AC-4定義テンプレートの漏れや曖昧さ |
| ワークフロー改善 | フィールド独立性の機械検証余地     |
| ドキュメント改善 | 横断ガイドライン化の候補           |

成果物: `outputs/phase-12/skill-feedback-report.md`

## Task 12-6: phase12-task-spec-compliance-check【必須・最終確認】

Phase 12 の Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 を 1 ファイルへ集約した root evidence。

- `outputs/phase-12/*.md` の成果物存在確認
- Task 12-1〜12-5 の実質監査
- Step 1-A〜1-G の実更新確認
- Step 2 の current fact / no-op / domain sync 確認
- validator 結果、root parity、artifacts 同期、planned wording 0件の記録
- 未充足が 1 つでもある場合は `PASS` を断言しない

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## Phase 12 事前チェックリスト【着手前確認】

- [ ] `outputs/artifacts.json` と各 `phase-*.md` のartifact名が1対1で照合済み
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` を含む6成果物の出力先が揃っている
- [ ] Phase 1で記録したタスク分類（docs-only）が現状と一致している
- [ ] LOGS.md 2ファイル更新対象が特定されている

## 参照資料

| 資料名                       | パス                                                                                   | 用途         |
| ---------------------------- | -------------------------------------------------------------------------------------- | ------------ |
| Phase 11 手動テスト結果      | `outputs/phase-11/manual-test-result.md`                                               | 証跡確認     |
| spec-update-workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step手順確認 |
| phase-12-documentation-guide | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task詳細手順 |

## 成果物

| 成果物                       | パス                                                     | 説明                              |
| ---------------------------- | -------------------------------------------------------- | --------------------------------- |
| 実装ガイド（Part 1/2）       | `outputs/phase-12/implementation-guide.md`               | 初学者向け + 技術者向けの2パート  |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C + Step 2 の更新記録 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 全Step結果の記録                  |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須                   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須            |
| 準拠チェック                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の最終確認        |

## 完了条件

- [ ] Task 12-1〜12-6が全件完了していること
- [ ] 6成果物が全件作成されていること
- [ ] LOGS.md 2ファイルが更新されていること（aiworkflow-requirements + task-specification-creator）
- [ ] `outputs/artifacts.json` が `phase13_blocked` で root `artifacts.json` と同期されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR作成（ユーザーの明示的承認後のみ実施）
