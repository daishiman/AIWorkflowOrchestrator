# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 4                                                           |
| Phase名    | テスト作成                                                  |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | docs-only                                                   |
| 前提Phase  | Phase 3                                                     |
| 後続Phase  | Phase 5                                                     |
| ステータス | 未実施                                                      |
| 作成日     | 2026-04-11                                                  |

---

## 目的

docs-only タスクにおける「テスト」として、変更対象テンプレートの構造的整合性検証と
チェックリスト項目の完全性確認手順を定義し、Phase 5 の実装前に期待される状態を明文化する。

## 背景

本タスクはコード変更を含まないため、従来のユニットテスト・E2E テストは対象外である。
代わりに以下の 2 種類の検証を「テスト」として定義する：

1. **構造的整合性検証**: 変更対象 3 ファイルが正しい構造でエントリ/セクションを保持していること
2. **チェックリスト項目の完全性確認**: 5 同期対象ファイルが全件チェックリストに含まれていること

---

## 命名規則確認【TDD Red 前に必須】

> **[FB-SDK-07-4 対策]** TDD Red フェーズに入る前に Phase 1〜3 の命名規則を確認する。

| 確認項目                                 | 確認結果（Phase 1 調査済み）                                        |
| ---------------------------------------- | ------------------------------------------------------------------- |
| SKILL.md よくある漏れテーブルの列名      | `漏れパターン` / `防止方法` 2列構成（`[Feedback SC-13-1]` 形式）    |
| phase12-task-spec-compliance-template.md | `- [ ] <動詞> + <目的語>` 形式のチェックリスト                      |
| phase-12-documentation-guide.md Step 1-A | `## Task N: <名称>` → 配下に `- [ ] ...` 形式のステップ             |
| FB エントリの形式                        | `[FB-04]` （既存パターン: `[Feedback SC-13-1]` の短縮形として統一） |

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-4/` へ記録する。

### タスク1: テスト計画書の作成

**目的**: TC-01〜TC-06 のテストケース一覧と検証手順を文書化する

**実行手順**:

1. Phase 1 の AC-1〜AC-6 と Phase 2/3 の設計内容を参照する
2. TC-01〜TC-06 の各テストケースに対して「検証コマンドまたは手順」を定義する
3. 成果物 `outputs/phase-4/test-plan.md` に記録する

**期待される成果物**:

- `outputs/phase-4/test-plan.md`

---

### タスク2: テストケース詳細の作成

**目的**: TC-01〜TC-06 の詳細（前提条件・手順・期待結果・判定基準）を定義する

**実行手順**:

1. 以下の TC-01〜TC-06 を各変更対象ファイルの before/after 確認観点で記述する
2. 各テストケースに期待結果と PASS/FAIL 判定基準を明記する
3. 成果物 `outputs/phase-4/test-cases.md` に記録する

**テストケース一覧**:

| TC ID | 対象ファイル                                                                                | 確認観点                                                           | AC 対応 |
| ----- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------- |
| TC-01 | `.claude/skills/task-specification-creator/SKILL.md`                                        | よくある漏れテーブルに `[FB-04]` エントリが存在すること            | AC-1    |
| TC-02 | `.claude/skills/task-specification-creator/SKILL.md`                                        | `[FB-04]` の「漏れパターン」欄が具体的な同期漏れを記述していること | AC-1    |
| TC-03 | `.claude/skills/task-specification-creator/SKILL.md`                                        | `[FB-04]` の「防止方法」欄が具体的な対策を記述していること         | AC-1    |
| TC-04 | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 三者同期チェックリストセクションが存在すること                     | AC-2    |
| TC-05 | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | チェックリストが 5 同期対象ファイルを全件含んでいること            | AC-3    |
| TC-06 | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Step 1-A に三者同期手順が追記されていること                        | AC-5    |

**TC-01 詳細**:

- 前提条件: Phase 5 の実装完了後
- 手順: `SKILL.md` のよくある漏れテーブルを目視確認する
- 期待結果: テーブル内に `[FB-04]` を含む行が 1 件以上存在する
- PASS 判定: `[FB-04]` 行が存在する

**TC-02 詳細**:

- 前提条件: TC-01 PASS
- 手順: `[FB-04]` エントリの「漏れパターン」欄の文言を確認する
- 期待結果: 「ledger/lane/artifacts の同期漏れ」または同等の具体的な記述が存在する
- PASS 判定: 抽象的・空欄でなく具体的な同期漏れパターンが記述されている

**TC-03 詳細**:

- 前提条件: TC-01 PASS
- 手順: `[FB-04]` エントリの「防止方法」欄の文言を確認する
- 期待結果: Phase 12 close-out 時の三者同期チェックリスト使用など具体的な対策が記述されている
- PASS 判定: 実行者が具体的なアクションを取れる防止方法が記述されている

**TC-04 詳細**:

- 前提条件: Phase 5 の実装完了後
- 手順: `phase12-task-spec-compliance-template.md` を確認し、三者同期チェックリストセクションを探す
- 期待結果: `### ledger / lane index / artifacts 三者同期チェックリスト` 相当の見出しが存在する
- PASS 判定: 三者同期チェックリストのセクションが存在し、Step 1-A 完了条件直後に配置されている

**TC-05 詳細**:

- 前提条件: TC-04 PASS
- 手順: TC-04 で確認したチェックリストセクションの項目を列挙し、5 同期対象ファイルを全件確認する
- 期待結果: 以下の 5 件がすべてチェックリストに含まれている
  1. `task-workflow.md`（backlog ledger）
  2. `task-workflow-completed.md`（completed ledger）
  3. `lane/index.md`（lane index）
  4. `outputs/artifacts.json`（workflow artifacts）
  5. `.claude/skills/task-specification-creator/outputs/artifacts.json`（skill artifacts）
- PASS 判定: 5 件全件の参照・チェック項目が存在する

**TC-06 詳細**:

- 前提条件: Phase 5 の実装完了後
- 手順: `phase-12-documentation-guide.md` の Step 1-A セクションを確認し、三者同期手順を探す
- 期待結果: Step 1-A 配下に三者同期を行う手順ステップが追記されている
- PASS 判定: Step 1-A の手順リストに三者同期に関する記述が 1 件以上存在する

**期待される成果物**:

- `outputs/phase-4/test-cases.md`

---

## 参照資料

| 参照資料                   | パス                                                                                        | 内容                                |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                                                    | AC-1〜AC-6（テストケース根拠）      |
| Phase 1 現状確認記録       | `outputs/phase-1/current-state.md`                                                          | before 状態（Red 前提確認）         |
| Phase 2 SKILL.md 設計書    | `outputs/phase-2/skill-md-entry-design.md`                                                  | TC-01〜TC-03 の期待値参照           |
| Phase 2 テンプレート設計書 | `outputs/phase-2/compliance-template-design.md`                                             | TC-04〜TC-05 の期待値参照           |
| Phase 2 ガイド設計書       | `outputs/phase-2/guide-step1a-design.md`                                                    | TC-06 の期待値参照                  |
| Phase 3 レビュー結果       | `outputs/phase-3/design-review-result.md`                                                   | PASS 判定確認（レビューゲート通過） |
| SKILL.md                   | `.claude/skills/task-specification-creator/SKILL.md`                                        | テスト対象ファイル（before）        |
| Phase 12 準拠テンプレート  | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | テスト対象ファイル（before）        |
| Phase 12 ガイド            | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | テスト対象ファイル（before）        |

---

## 成果物

| 成果物           | パス                            | 内容                                        |
| ---------------- | ------------------------------- | ------------------------------------------- |
| テスト計画書     | `outputs/phase-4/test-plan.md`  | TC-01〜TC-06 の一覧・検証手順・スケジュール |
| テストケース詳細 | `outputs/phase-4/test-cases.md` | 各 TC の前提条件・手順・期待結果・判定基準  |

---

## 統合テスト連携（Phase 1〜11は必須）

- docs-only タスクのため自動テストは不要
- TC-01〜TC-06 はいずれも「Phase 5 実装後の after 状態」を手動確認する形式
- Phase 9（品質保証）にて TC-01〜TC-06 の全件 PASS を最終確認する

---

## 完了条件

- [ ] TC-01〜TC-06 の詳細（前提条件・手順・期待結果・判定基準）が定義されていること
- [ ] 5 同期対象ファイルが TC-05 に全件含まれていること
- [ ] Phase 1 の AC-1〜AC-6 と TC-01〜TC-06 のトレーサビリティが確認されていること
- [ ] `outputs/phase-4/test-plan.md` が作成されていること
- [ ] `outputs/phase-4/test-cases.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS 判定で完了していること
- **後続**: Phase 5（実装）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- テスト計画書作成: [結果]
- テストケース詳細作成: [結果]

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

`docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-5-implementation.md`
