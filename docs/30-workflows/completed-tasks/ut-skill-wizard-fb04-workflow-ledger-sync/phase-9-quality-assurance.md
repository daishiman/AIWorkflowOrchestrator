# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 9                                                           |
| Phase名    | 品質保証                                                    |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | docs-only                                                   |
| 前提Phase  | Phase 8                                                     |
| 後続Phase  | Phase 10                                                    |
| ステータス | 未実施                                                      |
| 作成日     | 2026-04-11                                                  |

---

## 目的

Phase 5〜8 で変更した 3 ファイルの品質を静的検証（構造・整合性・リンク確認）で担保し、
Phase 10（最終レビューゲート）へ進める状態にあることを確認する。

## 背景

docs-only タスクのため、品質保証の手段はコンパイル・テスト実行ではなく以下の静的検証に限定する：

1. Markdown 構文の正しさ（見出し階層・チェックリスト形式・テーブル整合）
2. 追記内容と既存項目の重複チェック
3. `.agents/skills/` mirror と `.claude/skills/` の差分チェック
4. `validate-phase-output.js` による構造検証
5. `verify-unassigned-links.js` によるリンク存在確認

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-9/` へ記録する。

### タスク1: Markdown 構文検証

**目的**: 変更した 3 ファイルの Markdown 構文が正しいことを確認する

**実行手順**:

1. 対象 3 ファイルを通読し、以下の構文要素を確認する:
   - 見出し階層（`#` → `##` → `###` の飛び越しがないこと）
   - チェックリスト形式（`- [ ] ` の形式が統一されていること）
   - テーブルのヘッダー行・区切り行・データ行の整合性
   - コードブロックの開閉ペア
2. 問題が発見された場合は即座に修正する
3. 確認結果を `outputs/phase-9/quality-report.md` に記録する

**確認対象ファイル**:

| ファイル                                                                                    | 確認観点                           |
| ------------------------------------------------------------------------------------------- | ---------------------------------- |
| `.claude/skills/task-specification-creator/SKILL.md`                                        | テーブル行追加の構文整合           |
| `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | チェックリスト形式・見出し階層     |
| `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | 手順ステップの番号連続性・形式統一 |

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（Markdown 構文検証セクション）

---

### タスク2: 既存項目との重複チェック

**目的**: 追記したチェックリストが既存項目と重複していないことを確認する

**実行手順**:

1. `phase12-task-spec-compliance-template.md` の追記前後セクションを比較する
2. 意味的に同一または類似する項目が重複していないことを確認する
3. `SKILL.md` の「よくある漏れ」テーブルで `[FB-04]` エントリが他エントリと重複していないことを確認する
4. 重複が発見された場合は Phase 8 の手順に従い修正する
5. 確認結果を `outputs/phase-9/quality-report.md` に記録する

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（重複チェックセクション追記）

---

### タスク3: `.agents/skills/` mirror 差分チェック

**目的**: `.agents/skills/` mirror と `.claude/skills/` の差分が 0 であることを確認する

**実行手順**:

1. 以下のコマンドで差分を確認する:

```bash
diff -qr \
  .claude/skills/task-specification-creator/ \
  .agents/skills/task-specification-creator/
```

2. 差分が発生している場合は `.agents/skills/` 側を `.claude/skills/` に同期する:

```bash
# 差分ファイルを特定して個別コピー
cp .claude/skills/task-specification-creator/SKILL.md \
   .agents/skills/task-specification-creator/SKILL.md

cp ".claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md" \
   ".agents/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md"

cp ".claude/skills/task-specification-creator/references/phase-12-documentation-guide.md" \
   ".agents/skills/task-specification-creator/references/phase-12-documentation-guide.md"
```

3. 同期後に再度 `diff -qr` を実行して差分 0 を確認する
4. 確認結果を `outputs/phase-9/quality-report.md` に記録する

**期待結果**: `diff -qr` コマンドの出力が空（差分なし）

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（mirror 差分チェックセクション追記）

---

### タスク4: `validate-phase-output.js` による構造検証

**目的**: Phase 成果物の構造が仕様に準拠していることを `validate-phase-output.js` で確認する

**実行手順**:

1. `validate-phase-output.js` を Phase 9 の成果物に対して実行する:

```bash
node .claude/scripts/validate-phase-output.js \
  --phase 9 \
  --task-id UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001
```

2. PASS / FAIL の結果を確認する
3. FAIL の場合は指摘内容に従い修正する
4. 実行結果を `outputs/phase-9/quality-report.md` に記録する

**期待結果**: `validate-phase-output.js` が PASS を返すこと

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（validate-phase-output 実行結果セクション追記）

---

### タスク5: `verify-unassigned-links.js` によるリンク存在確認

**目的**: 変更ファイル内のリンクが全て存在するファイルを指していることを確認する

**実行手順**:

1. `verify-unassigned-links.js` を変更対象 3 ファイルに対して実行する:

```bash
node .claude/scripts/verify-unassigned-links.js \
  --files \
  ".claude/skills/task-specification-creator/SKILL.md" \
  ".claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md" \
  ".claude/skills/task-specification-creator/references/phase-12-documentation-guide.md"
```

2. `ALL_LINKS_EXIST` が出力されることを確認する
3. 存在しないリンクが検出された場合は修正する
4. 実行結果を `outputs/phase-9/quality-report.md` に記録する

**期待結果**: 全リンクについて `ALL_LINKS_EXIST` が確認されること

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（verify-unassigned-links 実行結果セクション追記）

---

### タスク6: Phase 1 受け入れ基準（AC-1〜AC-6）の最終確認

**目的**: 品質保証フェーズの総仕上げとして、AC-1〜AC-6 が全て充足されていることを確認する

**実行手順**:

1. `outputs/phase-1/acceptance-criteria.md` を参照し、AC-1〜AC-6 を確認する
2. 変更後の 3 ファイルが各 AC を充足していることを確認する
3. 充足状況を `outputs/phase-9/quality-report.md` の AC 確認テーブルに記録する

**AC 確認テーブル（記録フォーマット）**:

| AC番号 | 受け入れ基準                                                                             | 充足状況 | 確認方法         |
| ------ | ---------------------------------------------------------------------------------------- | -------- | ---------------- |
| AC-1   | `SKILL.md` の「よくある漏れ」テーブルに `[FB-04]` エントリが追加されていること           | TBD      | ファイル内容確認 |
| AC-2   | `phase12-task-spec-compliance-template.md` に三者同期チェックリストが追加されていること  | TBD      | ファイル内容確認 |
| AC-3   | 同期対象ファイル（backlog/completed/lane-index/artifacts × 2）が全件明示されていること   | TBD      | ファイル内容確認 |
| AC-4   | チェックリストが Phase 12 の必須完了条件として組み込まれていること                       | TBD      | 構造確認         |
| AC-5   | `phase-12-documentation-guide.md` の Step 1-A 手順に三者同期ステップが追記されていること | TBD      | ファイル内容確認 |
| AC-6   | `.agents/skills/` mirror が `.claude/skills/` と同期されていること                       | TBD      | diff確認         |

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（AC 確認テーブル完成版）

---

## 参照資料

| 参照資料                              | パス                                                                                        | 内容                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 1 受け入れ基準                  | `outputs/phase-1/acceptance-criteria.md`                                                    | AC-1〜AC-6 の定義                 |
| Phase 8 リファクタリング記録          | `outputs/phase-8/refactoring-log.md`                                                        | リファクタリング後の変更内容確認  |
| validate-phase-output.js              | `.claude/scripts/validate-phase-output.js`                                                  | Phase 成果物構造検証スクリプト    |
| verify-unassigned-links.js            | `.claude/scripts/verify-unassigned-links.js`                                                | リンク存在確認スクリプト          |
| SKILL.md                              | `.claude/skills/task-specification-creator/SKILL.md`                                        | 変更対象ファイル（AC-1 確認）     |
| phase12-task-spec-compliance-template | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 変更対象ファイル（AC-2/3/4 確認） |
| phase-12-documentation-guide.md       | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | 変更対象ファイル（AC-5 確認）     |

---

## 成果物

| 成果物       | パス                                | 内容                                              |
| ------------ | ----------------------------------- | ------------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全静的検証の実施記録・AC-1〜AC-6 最終充足確認結果 |

**`outputs/phase-9/quality-report.md` のフォーマット**:

```markdown
# Phase 9 品質レポート

## 1. Markdown 構文検証

- SKILL.md: [PASS/FAIL + 詳細]
- phase12-task-spec-compliance-template.md: [PASS/FAIL + 詳細]
- phase-12-documentation-guide.md: [PASS/FAIL + 詳細]

## 2. 既存項目との重複チェック

- 重複なし / 重複あり（修正済み）: [結果]

## 3. `.agents/skills/` mirror 差分チェック

- `diff -qr` 実行結果: [出力内容]
- 差分: 0 件 / N 件（同期済み）

## 4. `validate-phase-output.js` 実行結果

- 実行結果: PASS / FAIL
- 詳細: [出力内容]

## 5. `verify-unassigned-links.js` 実行結果

- 実行結果: ALL_LINKS_EXIST / リンク切れ N 件（修正済み）
- 詳細: [出力内容]

## 6. AC-1〜AC-6 最終確認

| AC番号 | 受け入れ基準 | 充足状況 | 確認方法         |
| ------ | ------------ | -------- | ---------------- |
| AC-1   | ...          | PASS     | ファイル内容確認 |
| ...    | ...          | ...      | ...              |

## 総合判定

- 静的検証: PASS / FAIL
- AC 充足: 全件 PASS / 未充足 N 件
- Phase 10 進行可否: 可 / 不可（要修正）
```

---

## 統合テスト連携（Phase 1〜11は必須）

- 接続要件: docs-only タスクのため統合テストなし
- 確認事項: `.agents/skills/` mirror との差分が 0 であることをもって同期完了とみなす

---

## 完了条件

- [ ] 変更した 3 ファイルの Markdown 構文が正しいこと
- [ ] 追記したチェックリストが既存項目と重複していないこと
- [ ] `.agents/skills/` mirror との差分が 0 であること（`diff -qr` 確認）
- [ ] `validate-phase-output.js` で PASS が確認されていること
- [ ] `verify-unassigned-links.js` で ALL_LINKS_EXIST が確認されていること
- [ ] AC-1〜AC-6 が全件 PASS であることが `outputs/phase-9/quality-report.md` に記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 実行タスク

- Markdown 構文検証: [PASS/FAIL]
- 既存項目との重複チェック: [結果]
- `.agents/skills/` mirror 差分チェック: [差分件数]
- `validate-phase-output.js` 実行: [PASS/FAIL]
- `verify-unassigned-links.js` 実行: [ALL_LINKS_EXIST / リンク切れ件数]
- AC-1〜AC-6 最終確認: [全件PASS / 未充足件数]

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

`docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-10-final-review.md`
