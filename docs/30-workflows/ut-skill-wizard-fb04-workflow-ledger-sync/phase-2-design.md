# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 2                                                           |
| Phase名    | 設計                                                        |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | docs-only                                                   |
| 前提Phase  | Phase 1                                                     |
| 後続Phase  | Phase 3                                                     |
| ステータス | 未実施                                                      |
| 作成日     | 2026-04-11                                                  |

---

## 目的

Phase 1 で確定した変更対象ファイル 3 件に対して、具体的な追記内容（チェックリスト文言・配置場所・構造）を設計する。

## 背景

Phase 1 で確定した AC-1〜AC-6 を満たすために、以下の設計を行う：

1. `SKILL.md` よくある漏れテーブルへの `[FB-04]` エントリ設計
2. `phase12-task-spec-compliance-template.md` への三者同期チェックリストセクション設計
3. `phase-12-documentation-guide.md` Step 1-A への手順追記設計

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-2/` へ記録する。

### タスク1: SKILL.md よくある漏れエントリ設計

**目的**: `[FB-04]` エントリの文言を設計する

**実行手順**:

1. 既存エントリの文言パターン（`[Feedback SC-13-1]` 等）を確認する
2. 「漏れパターン」欄と「防止方法」欄の文言をドラフトする
3. 既存エントリと整合するフォーマットで最終化する

**期待される成果物**:

- `outputs/phase-2/skill-md-entry-design.md`

---

### タスク2: phase12-task-spec-compliance-template.md チェックリスト設計

**目的**: 三者同期チェックリストの配置場所・構造・文言を設計する

**実行手順**:

1. テンプレートの現行チェックリスト構造を確認する
2. 三者同期チェックリストの挿入位置を決定する（Step 1-A 完了条件直後 推奨）
3. チェックリスト項目を設計する（5 同期対象ファイルを網羅）
4. 設計書を `outputs/phase-2/compliance-template-design.md` に記録する

**設計内容（案）**:

```markdown
### ledger / lane index / artifacts 三者同期チェックリスト

Phase 12 close-out では以下の5ファイルを同一ターンで同期すること:

| No  | 同期対象ファイル                                               | 更新内容                           |
| --- | -------------------------------------------------------------- | ---------------------------------- |
| 1   | `task-workflow.md`（backlog ledger）                           | 完了タスクをbacklogから削除        |
| 2   | `task-workflow-completed.md`（completed ledger）               | 完了タスクのcompleted記録追加      |
| 3   | `lane/index.md`（lane index）                                  | laneステータス・タスク参照を更新   |
| 4   | `outputs/artifacts.json`（workflow artifacts）                 | Phaseステータスを completed に更新 |
| 5   | `.claude/skills/.../outputs/artifacts.json`（skill artifacts） | skill成果物ステータス更新          |

- [ ] `task-workflow.md` から完了タスクエントリを削除または completed に移動した
- [ ] `task-workflow-completed.md` に完了タスクのレコードを追記した
- [ ] `lane/index.md` のステータス・参照リンクを現在の事実に更新した
- [ ] `outputs/artifacts.json` の Phase ステータスを `phase12_completed` に更新した
- [ ] `.claude/skills/task-specification-creator/outputs/artifacts.json` を更新した（該当する場合）
```

**期待される成果物**:

- `outputs/phase-2/compliance-template-design.md`

---

### タスク3: phase-12-documentation-guide.md Step 1-A 手順設計

**目的**: Step 1-A の手順に三者同期ステップを追記する設計を行う

**実行手順**:

1. `phase-12-documentation-guide.md` の Step 1-A 現行記述を確認する
2. 追記位置（Step 1-A の既存ステップ末尾）を決定する
3. 追記文言を設計する
4. 設計書を `outputs/phase-2/guide-step1a-design.md` に記録する

**期待される成果物**:

- `outputs/phase-2/guide-step1a-design.md`

---

### タスク4: 設計の整合性確認

**目的**: 3 つの設計が互いに矛盾なく整合していることを確認する

**実行手順**:

1. 3 設計の同期対象ファイルリストが一致していることを確認する
2. チェックリスト文言が冗長・矛盾していないことを確認する
3. AC-1〜AC-6 が設計で全て充足されていることを確認する
4. 整合性確認結果を `outputs/phase-2/design-consistency-check.md` に記録する

**期待される成果物**:

- `outputs/phase-2/design-consistency-check.md`

---

## 参照資料

| 参照資料                  | パス                                                                                        | 内容                         |
| ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 成果物            | `outputs/phase-1/requirements-definition.md`                                                | AC一覧・変更対象ファイル     |
| SKILL.md                  | `.claude/skills/task-specification-creator/SKILL.md`                                        | よくある漏れテーブル現行構造 |
| Phase 12 準拠テンプレート | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 現行チェックリスト構造       |
| Phase 12 ガイド           | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Step 1-A 現行記述            |
| spec-update-workflow      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Phase 12 同期ルール          |

---

## 成果物

| 成果物                  | パス                                            | 内容                         |
| ----------------------- | ----------------------------------------------- | ---------------------------- |
| SKILL.md エントリ設計書 | `outputs/phase-2/skill-md-entry-design.md`      | FB-04 エントリの文言設計     |
| テンプレート追記設計書  | `outputs/phase-2/compliance-template-design.md` | チェックリスト構造・文言設計 |
| ガイド Step 1-A 設計書  | `outputs/phase-2/guide-step1a-design.md`        | Step 1-A 手順追記設計        |
| 整合性確認記録          | `outputs/phase-2/design-consistency-check.md`   | AC充足確認・3設計の整合確認  |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合ポイント/契約: テンプレート変更が既存チェックリスト構造と整合すること
- 確認事項: 追記内容が既存 validator（`validate-phase-output.js`）で検出されないこと

---

## 完了条件

- [ ] 3 つの変更対象ファイルに対する設計書（4 件）が作成されていること
- [ ] AC-1〜AC-6 が設計で全て充足されていることが確認されていること
- [ ] 整合性確認が完了し、矛盾・漏れがないこと
- [ ] 同期対象ファイルが 5 件すべて設計に含まれていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- SKILL.md エントリ設計: [結果]
- テンプレートチェックリスト設計: [結果]
- ガイド Step 1-A 設計: [結果]
- 整合性確認: [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-3-design-review.md`
