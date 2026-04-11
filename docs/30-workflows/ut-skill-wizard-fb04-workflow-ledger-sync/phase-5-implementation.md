# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 5                                                           |
| Phase名    | 実装                                                        |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | docs-only                                                   |
| 前提Phase  | Phase 4                                                     |
| 後続Phase  | Phase 6                                                     |
| ステータス | 未実施                                                      |
| 作成日     | 2026-04-11                                                  |

---

## 目的

Phase 4 で定義した TC-01〜TC-06 を PASS させるために、3 つの変更対象ファイルへの追記を実施する。
docs-only タスクにおける「実装」はコード変更ではなくテンプレートファイルへの追記作業である。

## 背景

Phase 3 の設計レビューゲートを通過した設計内容（`outputs/phase-2/` の 4 設計書）に基づき、
以下の 3 ファイルへの追記を行う。また、FB-RT-03 対策として実装計画書に修正ファイル一覧を
必須記載し、`.agents/skills/` mirror との同期確認まで本 Phase のスコープとする。

---

## 修正ファイル一覧【FB-RT-03 対策・必須記載】

| No  | 修正ファイル                                                                                | 変更種別 | 変更内容要約                               |
| --- | ------------------------------------------------------------------------------------------- | -------- | ------------------------------------------ |
| 1   | `.claude/skills/task-specification-creator/SKILL.md`                                        | 追記     | よくある漏れテーブル末尾に [FB-04] 行      |
| 2   | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 追記     | 三者同期チェックリストセクション追加       |
| 3   | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | 追記     | Step 1-A に三者同期ステップ追記            |
| 4   | `.agents/skills/task-specification-creator/`（mirror）                                      | 同期確認 | rsync または diff で `.claude/` と一致確認 |

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-5/` へ記録する。

### タスク1: 実装計画書の作成

**目的**: 3 ファイルへの追記内容と手順を文書化し、実行前にレビュー可能な状態にする

**実行手順**:

1. Phase 2 の 4 設計書（`outputs/phase-2/`）を参照し、追記内容を最終確認する
2. 各ファイルの挿入位置・追記文言を実装計画書に明記する
3. 成果物 `outputs/phase-5/implementation-plan.md` に記録する

**期待される成果物**:

- `outputs/phase-5/implementation-plan.md`

---

### タスク2: SKILL.md よくある漏れテーブルへの [FB-04] エントリ追記

**目的**: TC-01〜TC-03 を PASS させる変更を実施する

**実行手順**:

1. `.claude/skills/task-specification-creator/SKILL.md` を開き、「よくある漏れ」テーブルの末尾行を確認する
2. Phase 2 の `outputs/phase-2/skill-md-entry-design.md` に記載の文言で `[FB-04]` エントリを追記する
3. 追記後の状態を確認し、既存エントリとのフォーマット整合性を検証する

**追記内容（設計書より）**:

```markdown
| [FB-04] | Phase 12 close-out 時に ledger / lane index / artifacts の同期更新を漏らすパターン | Phase 12 テンプレートの「三者同期チェックリスト」に従い、5 同期対象ファイルを一括更新する |
```

**期待される状態**:

- `SKILL.md` のよくある漏れテーブルに `[FB-04]` 行が存在する（TC-01 PASS）
- `[FB-04]` の「漏れパターン」欄に具体的な同期漏れが記述されている（TC-02 PASS）
- `[FB-04]` の「防止方法」欄に具体的な対策が記述されている（TC-03 PASS）

---

### タスク3: phase12-task-spec-compliance-template.md への三者同期チェックリスト追記

**目的**: TC-04〜TC-05 を PASS させる変更を実施する

**実行手順**:

1. `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` を開く
2. Step 1-A 完了条件の直後の位置を確認する
3. Phase 2 の `outputs/phase-2/compliance-template-design.md` に記載のチェックリストセクションを追記する

**追記内容（設計書より）**:

```markdown
### ledger / lane index / artifacts 三者同期チェックリスト

Phase 12 close-out では以下の 5 ファイルを同一ターンで同期すること:

| No  | 同期対象ファイル                                                                      | 更新内容                            |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | `task-workflow.md`（backlog ledger）                                                  | 完了タスクを backlog から削除       |
| 2   | `task-workflow-completed.md`（completed ledger）                                      | 完了タスクの completed 記録追加     |
| 3   | `lane/index.md`（lane index）                                                         | lane ステータス・タスク参照を更新   |
| 4   | `outputs/artifacts.json`（workflow artifacts）                                        | Phase ステータスを completed に更新 |
| 5   | `.claude/skills/task-specification-creator/outputs/artifacts.json`（skill artifacts） | skill 成果物ステータス更新          |

- [ ] `task-workflow.md` から完了タスクエントリを削除または completed に移動した
- [ ] `task-workflow-completed.md` に完了タスクのレコードを追記した
- [ ] `lane/index.md` のステータス・参照リンクを現在の事実に更新した
- [ ] `outputs/artifacts.json` の Phase ステータスを `phase12_completed` に更新した
- [ ] `.claude/skills/task-specification-creator/outputs/artifacts.json` を更新した（該当する場合）
```

**期待される状態**:

- `phase12-task-spec-compliance-template.md` に三者同期チェックリストセクションが存在する（TC-04 PASS）
- チェックリストに 5 同期対象ファイルが全件含まれている（TC-05 PASS）

---

### タスク4: phase-12-documentation-guide.md Step 1-A への三者同期手順追記

**目的**: TC-06 を PASS させる変更を実施する

**実行手順**:

1. `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` を開く
2. Step 1-A のセクションを確認し、既存手順ステップの末尾位置を特定する
3. Phase 2 の `outputs/phase-2/guide-step1a-design.md` に記載の手順を追記する

**追記内容（設計書より）**:

```markdown
#### 三者同期手順（Step 1-A 完了条件）

Phase 12 close-out 時は以下の順序で 5 ファイルを同期する:

1. `task-workflow.md` を開き、完了タスクエントリを削除または `completed` ステータスに更新する
2. `task-workflow-completed.md` を開き、完了タスクのレコードを末尾に追記する
3. `lane/index.md` を開き、lane ステータスとタスク参照リンクを現在の事実に更新する
4. `outputs/artifacts.json` を開き、Phase ステータスを `phase12_completed` に更新する
5. `.claude/skills/task-specification-creator/outputs/artifacts.json` を開き、skill 成果物ステータスを更新する（該当する場合）
6. `phase12-task-spec-compliance-template.md` の「三者同期チェックリスト」で 5 件全て ✓ を確認する
```

**期待される状態**:

- `phase-12-documentation-guide.md` の Step 1-A に三者同期手順が存在する（TC-06 PASS）

---

### タスク5: .agents/skills/ mirror との同期確認

**目的**: AC-6 を満たすために `.agents/skills/` mirror を `.claude/skills/` と同期させる

**実行手順**:

1. `.agents/skills/task-specification-creator/` と `.claude/skills/task-specification-creator/` の diff を確認する
2. 差分が存在する場合は rsync または手動コピーで同期する
3. 同期後の diff が 0 件であることを確認する
4. 同期確認結果を `outputs/phase-5/change-log.md` に記録する

**確認コマンド（参考）**:

```bash
diff -r \
  .claude/skills/task-specification-creator/ \
  .agents/skills/task-specification-creator/
```

**期待される状態**:

- `.agents/skills/task-specification-creator/` が `.claude/skills/` と完全に一致している（AC-6 PASS）

---

## 参照資料

| 参照資料                   | パス                                                                                        | 内容                           |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 4 テスト計画書       | `outputs/phase-4/test-plan.md`                                                              | TC-01〜TC-06 の PASS 条件      |
| Phase 4 テストケース詳細   | `outputs/phase-4/test-cases.md`                                                             | 各 TC の期待結果（実装の基準） |
| Phase 2 SKILL.md 設計書    | `outputs/phase-2/skill-md-entry-design.md`                                                  | [FB-04] エントリの最終文言     |
| Phase 2 テンプレート設計書 | `outputs/phase-2/compliance-template-design.md`                                             | チェックリスト構造・最終文言   |
| Phase 2 ガイド設計書       | `outputs/phase-2/guide-step1a-design.md`                                                    | Step 1-A 追記手順の最終文言    |
| Phase 2 整合性確認記録     | `outputs/phase-2/design-consistency-check.md`                                               | AC 充足確認（実装判断の根拠）  |
| Phase 3 レビュー結果       | `outputs/phase-3/design-review-result.md`                                                   | PASS 判定確認                  |
| SKILL.md（変更対象）       | `.claude/skills/task-specification-creator/SKILL.md`                                        | 追記対象                       |
| Phase 12 準拠テンプレート  | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 追記対象                       |
| Phase 12 ガイド            | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | 追記対象                       |

---

## 成果物

| 成果物     | パス                                     | 内容                                                 |
| ---------- | ---------------------------------------- | ---------------------------------------------------- |
| 実装計画書 | `outputs/phase-5/implementation-plan.md` | 3 ファイルへの追記内容・挿入位置・手順の文書         |
| 変更ログ   | `outputs/phase-5/change-log.md`          | 各ファイルの before/after 差分と mirror 同期確認記録 |

---

## 統合テスト連携（Phase 1〜11は必須）

- docs-only タスクのため自動テストは不要
- TC-01〜TC-06 の PASS 確認は Phase 6 以降で実施する
- mirror 同期確認（AC-6）は本 Phase 完了前に実施する

---

## 完了条件

- [ ] 修正ファイル一覧（4 件）が `outputs/phase-5/implementation-plan.md` に記載されていること
- [ ] `.claude/skills/task-specification-creator/SKILL.md` に `[FB-04]` エントリが追記されていること
- [ ] `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` に三者同期チェックリストが追記されていること
- [ ] `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` の Step 1-A に三者同期手順が追記されていること
- [ ] `.agents/skills/task-specification-creator/` が `.claude/skills/` と同期されていること（diff 0 件）
- [ ] `outputs/phase-5/implementation-plan.md` が作成されていること
- [ ] `outputs/phase-5/change-log.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了し、TC-01〜TC-06 の期待結果が定義されていること
- **後続**: Phase 6（テスト拡充）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- 実装計画書作成: [結果]
- SKILL.md [FB-04] 追記: [結果]
- phase12-task-spec-compliance-template.md 三者同期チェックリスト追記: [結果]
- phase-12-documentation-guide.md Step 1-A 手順追記: [結果]
- .agents/skills/ mirror 同期確認: [結果]

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

`docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-6-test-expansion.md`
