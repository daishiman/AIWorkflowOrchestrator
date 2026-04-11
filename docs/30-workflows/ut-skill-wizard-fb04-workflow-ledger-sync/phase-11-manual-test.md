# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 11                                                                          |
| Phase名    | 手動テスト                                                                  |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001                              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化                 |
| タスク種別 | docs-only                                                                   |
| 評価方針   | **NON_VISUAL**（スクリーンショット不要・自動テスト結果が primary evidence） |
| 前提Phase  | Phase 10                                                                    |
| 後続Phase  | Phase 12                                                                    |
| ステータス | 未実施                                                                      |
| 作成日     | 2026-04-11                                                                  |

---

## 目的

Phase 4〜9 で実施した自動テスト・ツールチェックの結果を primary evidence として整理し、
docs-only タスクとして適切な手動確認チェックリストを完了させる。

## 背景

本タスクは **NON_VISUAL** タスクである。

**NON_VISUAL の理由**:
テンプレートファイル（`.claude/skills/task-specification-creator/` 配下）の更新のみであり、
UI の変更は一切ない。スクリーンショットで確認できる画面変化が存在しないため、
スクリーンショットは不要であり作成しない。

---

## 手動テスト方針（NON_VISUAL）

> **[NON_VISUAL 宣言]**
>
> - 本 Phase はスクリーンショットを作成しない
> - primary evidence は自動テスト・ツールチェックの結果である
> - `manual-test-result.md` のメタ情報に「証跡の主ソース」と「スクリーンショットを作らない理由」を必ず明記すること

### primary evidence として使用するもの

| 証跡種別              | コマンド / 確認方法                                                                                            | 確認内容                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| TypeScript 型チェック | `pnpm typecheck`                                                                                               | 型エラーなしであること           |
| Lint チェック         | `pnpm lint`                                                                                                    | lint エラーなしであること        |
| mirror 同期確認       | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                 | diff が 0（差分なし）であること  |
| SKILL.md 追記確認     | `grep -n "FB-04" .claude/skills/task-specification-creator/SKILL.md`                                           | `[FB-04]` エントリが存在すること |
| テンプレート追記確認  | `grep -n "三者同期" .claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | チェックリストが存在すること     |
| ガイド追記確認        | `grep -n "三者同期" .claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Step 1-A の手順が存在すること    |

### `manual-test-result.md` メタ情報への必須記載事項

`outputs/phase-11/manual-test-result.md` の冒頭メタ情報セクションに以下を必ず明記すること：

```markdown
## テスト方針メタ情報

| 項目                                | 内容                                                               |
| ----------------------------------- | ------------------------------------------------------------------ |
| 評価方針                            | NON_VISUAL                                                         |
| 証跡の主ソース（自動テスト名/件数） | pnpm typecheck / pnpm lint / diff -qr（mirror同期）/ grep確認 4種  |
| スクリーンショットを作らない理由    | テンプレートファイル更新のみ・UI変更なし・画面確認対象が存在しない |
```

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-11/` へ記録する。

### タスク1: 自動テスト・ツールチェック結果の整理

**目的**: primary evidence となる自動テスト・ツールチェックの結果を収集・整理する

**実行手順**:

1. `pnpm typecheck` を実行し、結果を記録する
2. `pnpm lint` を実行し、結果を記録する
3. `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator` を実行し、結果を記録する
4. 3 変更対象ファイルに対して grep 確認を実施し、追記内容の存在を確認する
5. 結果を `outputs/phase-11/manual-test-result.md` に記録する（メタ情報セクションを先頭に配置）

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク2: 手動確認チェックリスト実施

**目的**: 自動テストでは確認できない読みやすさ・配置の妥当性を手動で確認する

**実行手順**:

1. `.claude/skills/task-specification-creator/SKILL.md` を開き、`[FB-04]` エントリが正しい位置（「よくある漏れ」テーブル）に追加されていることを確認する
2. `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` を開き、三者同期チェックリストが読みやすい位置にあることを確認する
3. `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` を開き、Step 1-A の記述が自然な流れで読めることを確認する
4. 確認結果を `outputs/phase-11/manual-test-checklist.md` に記録する

**手動確認チェックリスト**:

- [ ] `SKILL.md` の `[FB-04]` エントリが「よくある漏れ」テーブルの正しい位置に追加されていること
- [ ] `[FB-04]` エントリの「漏れパターン」欄と「防止方法」欄が既存エントリと同じフォーマットであること
- [ ] `phase12-task-spec-compliance-template.md` の三者同期チェックリストが Phase 12 の実行フローに沿った読みやすい位置にあること
- [ ] 三者同期チェックリストの同期対象ファイルが 5 件（backlog ledger / completed ledger / lane index / workflow artifacts / skill artifacts）全て明示されていること
- [ ] `phase-12-documentation-guide.md` の Step 1-A の三者同期ステップが前後の記述と自然な流れで読めること
- [ ] 追記内容に誤字・脱字・リンク切れがないこと

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`

---

### タスク3: 発見された問題の記録

**目的**: 手動確認で発見された問題（MINOR 指摘等）を記録する

**実行手順**:

1. タスク1・タスク2 で発見した問題点を列挙する
2. 問題の重大度（MINOR / MAJOR / CRITICAL）を判定する
3. MINOR 指摘は未タスク化の対象として記録する
4. `outputs/phase-11/discovered-issues.md` に記録する

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料                   | パス                                                                                        | 内容                             |
| -------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 10 最終レビュー結果  | `outputs/phase-10/final-review-result.md`                                                   | 最終レビューゲートの判定結果     |
| SKILL.md                   | `.claude/skills/task-specification-creator/SKILL.md`                                        | [FB-04] エントリの確認対象       |
| Phase 12 準拠テンプレート  | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 三者同期チェックリストの確認対象 |
| Phase 12 ガイド            | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Step 1-A 手順の確認対象          |
| unassigned-task-guidelines | `docs/30-workflows/unassigned-task/unassigned-task-guidelines.md`                           | MINOR 指摘の未タスク化ルール     |

---

## 成果物

| 成果物                   | パス                                        | 内容                                                                  |
| ------------------------ | ------------------------------------------- | --------------------------------------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 手動確認項目の実施結果（PASS/FAIL）                                   |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | primary evidence（自動テスト結果）・NON_VISUAL メタ情報を含む総合結果 |
| 発見された問題           | `outputs/phase-11/discovered-issues.md`     | 手動確認で発見された問題点・MINOR 指摘の未タスク化記録                |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テスト観点: `pnpm typecheck` と `pnpm lint` がエラーなしであること
- mirror 同期確認: `.agents/skills/` と `.claude/skills/` の diff が 0 であること
- NON_VISUAL のため、統合テスト結果が手動テストの primary evidence となること

---

## 完了条件

- [ ] `pnpm typecheck` がエラーなしで完了していること
- [ ] `pnpm lint` がエラーなしで完了していること
- [ ] mirror 同期確認（`diff -qr`）の結果が差分 0 であること
- [ ] grep 確認で 3 変更対象ファイルの追記内容が全件存在することが確認されていること
- [ ] 手動確認チェックリストの全項目が PASS していること
- [ ] `manual-test-result.md` のメタ情報に「証跡の主ソース（自動テスト名/件数）」と「スクリーンショットを作らない理由」が明記されていること
- [ ] `outputs/phase-11/manual-test-checklist.md` が作成されていること
- [ ] `outputs/phase-11/manual-test-result.md` が作成されていること
- [ ] `outputs/phase-11/discovered-issues.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が完了していること（最終レビューゲート PASS）
- **後続**: Phase 12（ドキュメント・close-out）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 実行タスク

- 自動テスト・ツールチェック結果の整理: [結果]
- 手動確認チェックリスト実施: [PASS/FAIL]
- 発見された問題の記録: [件数]

### 発見事項

- 良かった点:
- 問題点（MINOR指摘）:
- 未タスク化した指摘:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-12-documentation.md`
