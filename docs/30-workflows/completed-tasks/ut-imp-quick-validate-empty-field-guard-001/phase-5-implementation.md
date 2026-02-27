# Phase 5: 実装（TDD: Green）— name/description 空フィールドガード

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 |
| Phase     | 5 — 実装                                    |
| 作成日    | 2026-02-27                                  |
| 前提Phase | Phase 4（テスト作成）完了                   |
| 次Phase   | Phase 6（テスト拡充）                       |
| Issue     | #913                                        |

## 目的

Phase 4 で作成した Red 状態のテスト（TC-GUARD-001 〜 TC-GUARD-008）を**全て PASS（Green）**させるための最小限の実装を行う。`quick_validate.js` の `name`/`description` フィールド検証を P42 準拠の 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）に変更する。

## 実行タスク

### Task 5-1: name フィールド検証の修正（Line 139-155）

**修正対象**: `.claude/skills/skill-creator/scripts/quick_validate.js` Line 139-155

**修正前**:

```javascript
  // 4. name フィールドの検証
  if (!frontmatter.name) {
    result.addError("name フィールドが存在しません");
  } else {
    const name = frontmatter.name;
    if (name.length > 64) {
```

**修正後**:

```javascript
  // 4. name フィールドの検証（P42準拠: 3段バリデーション）
  if (
    typeof frontmatter.name !== "string" ||
    frontmatter.name.trim() === ""
  ) {
    result.addError("name フィールドが存在しないか無効です");
  } else {
    const name = frontmatter.name.trim();
    if (name.length > 64) {
```

**修正内容の詳細**:

| 段階 | チェック内容                           | 防御対象                                                            |
| ---- | -------------------------------------- | ------------------------------------------------------------------- |
| 1    | `typeof frontmatter.name !== "string"` | `undefined`, `null`, `[]`（配列）, `123`（数値）, `true`（boolean） |
| 2    | `frontmatter.name.trim() === ""`       | `""`（空文字列）, `"   "`（スペースのみ）                           |
| 3    | `const name = frontmatter.name.trim()` | 前後の空白を除去してから後続の検証に使用                            |

**Error メッセージの変更**: 「存在しません」→「存在しないか無効です」に変更する。これにより、フィールドが存在するが無効な値（配列、スペースのみ）のケースも正確にカバーする。

**後続コードへの影響**: `const name = frontmatter.name.trim()` により、前後に空白がある有効な name（例: `" valid-name "` ）も正しくトリムされてから検証される。既存の有効な name には前後空白がないため、既存動作に影響しない。

### Task 5-2: description フィールド検証の修正（Line 157-193）

**修正対象**: `.claude/skills/skill-creator/scripts/quick_validate.js` Line 157-193

**修正前**:

```javascript
  // 5. description フィールドの検証
  if (!frontmatter.description) {
    result.addError("description フィールドが存在しません");
  } else {
    const desc = frontmatter.description;
    if (desc.length > 1024) {
```

**修正後**:

```javascript
  // 5. description フィールドの検証（P42準拠: 3段バリデーション）
  if (
    typeof frontmatter.description !== "string" ||
    frontmatter.description.trim() === ""
  ) {
    result.addError("description フィールドが存在しないか無効です");
  } else {
    const desc = frontmatter.description.trim();
    if (desc.length > 1024) {
```

**修正内容の詳細**:

| 段階 | チェック内容                                  | 防御対象                                                         |
| ---- | --------------------------------------------- | ---------------------------------------------------------------- |
| 1    | `typeof frontmatter.description !== "string"` | `undefined`, `null`, `[]`（配列）, 数値, boolean                 |
| 2    | `frontmatter.description.trim() === ""`       | `""`（空文字列）, `"   "`（スペースのみ）                        |
| 3    | `const desc = frontmatter.description.trim()` | トリム後の値で後続の検証（長さ、角括弧、Anchors、Trigger）を実行 |

**TypeError 防止**: この修正により、`desc.toLowerCase()` (Line 185) に配列が渡される問題が解消される。非文字列値は `typeof` チェックで早期拒否され、`toLowerCase()` には必ず文字列が渡る。

**Error メッセージの変更**: name と同様に「存在しません」→「存在しないか無効です」に変更する。

### Task 5-3: 既存テスト TC-EC-004 との整合性確認

既存テスト `TC-EC-004` は `empty-name-desc` フィクスチャの動作を記録するテストである:

```javascript
it("TC-EC-004: name/descriptionフィールドが空文字の場合の動作を記録する", () => {
  const result = runValidate("empty-name-desc");
  const output = result.stdout + result.stderr;
  expect(output.length).toBeGreaterThan(0);
  expect(output).toMatch(/name.*存在しません|Error|エラー|not a function/);
});
```

Phase 5 実装後の動作:

- `empty-name-desc` → name が `[]`（配列）→ `typeof` チェックで「name フィールドが存在しないか無効です」Error
- description も `[]` → 「description フィールドが存在しないか無効です」Error
- 出力に「エラー」が含まれるため、`TC-EC-004` の `expect(output).toMatch(/name.*存在しません|Error|エラー|not a function/)` は引き続き PASS する

**結論**: 既存テスト TC-EC-004 の修正は不要。

### Task 5-4: Green 状態の確認

全テストを実行し、TC-GUARD-001 〜 TC-GUARD-008 が**全て PASS** であることを確認する。

```bash
cd .claude/skills/skill-creator && pnpm vitest run scripts/__tests__/quick_validate.test.js
```

**期待結果**:

- TC-GUARD-001 〜 TC-GUARD-008: 全て PASS
- 既存テスト（TC-N 〜 TC-IT シリーズ）: 全て PASS
- TC-EC-004: PASS（整合性維持）

### Task 5-5: 設計変更記録

Phase 2 設計書からの乖離を記録する。

| 設計書記載内容                   | 実装での変更                                  | 理由                                                    |
| -------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| `value.trim() !== ""` のみ記載   | `typeof value !== "string"` を先行チェック    | 配列型が渡される場合を防御（`parseFrontmatter` の仕様） |
| `const name = frontmatter.name`  | `const name = frontmatter.name.trim()` に変更 | 前後空白を除去して後続検証の精度を向上                  |
| Error メッセージ「存在しません」 | 「存在しないか無効です」に変更                | 空配列やスペースのみの場合もカバー                      |

## 参照資料

| 資料                         | パス                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| 対象スクリプト               | `.claude/skills/skill-creator/scripts/quick_validate.js`                                                 |
| Phase 2 設計仕様             | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-2-design.md`        |
| Phase 4 テスト仕様           | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-4-test-creation.md` |
| P42: trim バリデーション漏れ | `.claude/rules/06-known-pitfalls.md#P42`                                                                 |
| parseFrontmatter 実装        | `.claude/skills/skill-creator/scripts/utils.js` L139-193                                                 |
| claude-code-skills-process   | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`                        |
| security-input-validation    | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`                         |

## 統合テスト連携

| シナリオカテゴリ   | 検証内容                                   | テスト ID                   |
| ------------------ | ------------------------------------------ | --------------------------- |
| バリデーション動作 | 3 段バリデーションが全非文字列型を拒否する | TC-GUARD-001 〜 006         |
| リグレッション     | 既存の全テストが PASS のまま               | TC-GUARD-007 + 既存全テスト |
| クラッシュ防止     | TypeError が発生しない                     | TC-GUARD-004, TC-GUARD-008  |

## 多角的チェック観点

- [ ] 修正箇所が Line 140 付近と Line 158 付近の 2 箇所のみであること
- [ ] Error メッセージが日本語で統一されていること
- [ ] `trim()` の呼び出しが `typeof` チェック後に行われていること（非文字列で `trim()` を呼ばない）
- [ ] 既存の `addError`/`addWarning`/`addPassed` パターンに従っていること
- [ ] `eslint` / `prettier` のフォーマットに準拠していること

## 成果物

| 成果物       | 配置先                                                              |
| ------------ | ------------------------------------------------------------------- |
| 修正コード   | `.claude/skills/skill-creator/scripts/quick_validate.js` (L139-193) |
| 設計変更記録 | 本仕様書 Task 5-5 セクション                                        |

## 完了条件

- [ ] `quick_validate.js` の name 検証（Line 140 付近）が `typeof === "string" && trim() !== ""` に変更されている
- [ ] `quick_validate.js` の description 検証（Line 158 付近）が同様に変更されている
- [ ] `const name = frontmatter.name.trim()` で後続検証にトリム済み値を使用している
- [ ] `const desc = frontmatter.description.trim()` で後続検証にトリム済み値を使用している
- [ ] Error メッセージが「存在しないか無効です」に変更されている
- [ ] TC-GUARD-001 〜 TC-GUARD-008 が全て PASS（Green）
- [ ] 既存テスト（TC-N 〜 TC-IT シリーズ）が全て PASS
- [ ] TC-EC-004 が PASS

## 次の Phase

Phase 6（テスト拡充）へ進む。Phase 6 では追加の境界値テスト、組合せテスト、カバレッジ不足箇所のテストを追加する。
