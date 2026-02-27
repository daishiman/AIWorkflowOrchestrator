# Phase 4: テスト作成（TDD: Red）— name/description 空フィールドガード

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 |
| Phase     | 4 — テスト作成                              |
| 作成日    | 2026-02-27                                  |
| 前提Phase | Phase 3（設計レビュー）PASS                 |
| 次Phase   | Phase 5（実装）                             |
| Issue     | #913                                        |

## 目的

`quick_validate.js` の `name`/`description` フィールドに対する空フィールドガードのテストを**実装に先行して**作成する（TDD: Red フェーズ）。Phase 5 で実装する P42 準拠 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）に対応するテストケースを定義し、全テストが**失敗状態（Red）**であることを確認する。

## 実行タスク

### Task 4-1: バグの根本原因と修正対象の確認

Phase 5 で修正する箇所を正確に把握する。テスト設計の根拠となる。

| 行番号  | 現在のコード                       | 問題                                                                                                    |
| ------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 140     | `if (!frontmatter.name)`           | `parseFrontmatter` が `name:` を `[]`（配列）としてパースした場合、`![]` は `false` で guard を通過する |
| 158     | `if (!frontmatter.description)`    | 同上。空の description が配列になり guard を通過する                                                    |
| 185     | `desc.toLowerCase().includes(...)` | `desc` が配列の場合 `TypeError: desc.toLowerCase is not a function` でクラッシュする                    |
| 143-153 | `name.length`, `regex.test(name)`  | `name` が配列の場合、`name.length` は配列長（0）を返し、`regex.test(name)` は `""` に対してテストする   |
| N/A     | スペースのみ `"   "` の値          | `!"   "` は `false`（truthy文字列）で guard を通過し、`.trim()` なしでは検出不能                        |

**`parseFrontmatter` の動作仕様**（`utils.js` L139-193）:

- `name:` → `value === ""` → 配列ブランチに入り `frontmatter.name = []` となる
- `name:    ` → `value = "   "` → `value !== ""` かつ `!value.startsWith("-")` → `frontmatter.name = "   "` となる
- `name: valid-name` → `frontmatter.name = "valid-name"`（正常）

### Task 4-2: テストフィクスチャの作成

以下のフィクスチャを `.claude/skills/skill-creator/scripts/__tests__/fixtures/` 配下に新規作成する。

#### フィクスチャ 1: `name-whitespace-only`

```
mkdir -p .claude/skills/skill-creator/scripts/__tests__/fixtures/name-whitespace-only
```

`SKILL.md` の内容:

```markdown
---
name:
description: |
  Valid description with Anchors: keyword1, keyword2
  Trigger: Use when testing whitespace name validation
---

# name-whitespace-only

Skill with whitespace-only name field.
```

**期待動作（Phase 5 実装後）**: name がスペースのみのため validation error。
**現在の動作**: `!"   "` は `false` で guard を通過し、`name.length > 64` は `false`、`regex.test("   ")` は `false` → 「ハイフンケースではありません」Error が出るが、エラーメッセージが不正確。

#### フィクスチャ 2: `desc-whitespace-only`

```
mkdir -p .claude/skills/skill-creator/scripts/__tests__/fixtures/desc-whitespace-only
```

`SKILL.md` の内容:

```markdown
---
name: desc-whitespace-only
description:
---

# desc-whitespace-only

Skill with whitespace-only description field.
```

**期待動作（Phase 5 実装後）**: description がスペースのみのため validation error。
**現在の動作**: `!"   "` は `false` で guard を通過 → `desc.length > 1024` は `false` → `desc.includes("<")` は `false` → `desc.toLowerCase().includes("use when")` は `false` → Warning のみ（Error なし）。

#### フィクスチャ 3: `name-valid-desc-empty`

```
mkdir -p .claude/skills/skill-creator/scripts/__tests__/fixtures/name-valid-desc-empty
```

`SKILL.md` の内容:

```markdown
---
name: name-valid-desc-empty
description:
---

# name-valid-desc-empty

Skill with valid name but empty description.
```

**期待動作（Phase 5 実装後）**: description が空のため validation error。name は正常。
**現在の動作**: `description:` が `[]` にパースされ、`desc.toLowerCase()` で `TypeError` クラッシュ。

#### フィクスチャ 4: `name-empty-desc-valid`

```
mkdir -p .claude/skills/skill-creator/scripts/__tests__/fixtures/name-empty-desc-valid
```

`SKILL.md` の内容:

```markdown
---
name:
description: |
  Valid description with Anchors: keyword1, keyword2
  Trigger: Use when testing empty name validation
---

# name-empty-desc-valid

Skill with empty name but valid description.
```

**期待動作（Phase 5 実装後）**: name が空配列のため validation error。description は正常。
**現在の動作**: `name:` が `[]` にパースされ、`![]` は `false` で guard を通過、`regex.test([])` → `regex.test("")` → `false` → 「ハイフンケースではありません」Error が出るが、エラーメッセージが不正確。

### Task 4-3: テストケースの作成

テストファイル: `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`

既存テストファイルの末尾に以下のテストグループを追加する。既存テストは一切変更しない。

#### テストグループ: 空フィールドガードテスト

```javascript
// ===========================================================================
// Phase 4 (TDD Red): 空フィールドガードテスト
// タスクID: UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001
// ===========================================================================

describe("空フィールドガード: name フィールド", () => {
  it("TC-GUARD-001: name が空（parseFrontmatterで配列化）の場合、'name フィールドが存在しないか無効です' Error が出る", () => {
    // empty-name-desc: name: → parseFrontmatter が [] を返す
    const result = runValidate("empty-name-desc");
    const output = result.stdout + result.stderr;
    expect(result.exitCode).not.toBe(0);
    expect(output).toContain("name フィールドが存在しないか無効です");
  });

  it("TC-GUARD-002: name がスペースのみ '   ' の場合、'name フィールドが存在しないか無効です' Error が出る", () => {
    const result = runValidate("name-whitespace-only");
    const output = result.stdout + result.stderr;
    expect(result.exitCode).not.toBe(0);
    expect(output).toContain("name フィールドが存在しないか無効です");
  });

  it("TC-GUARD-003: name 空 + description 有効 の組合せで、name の Error のみ発生し description は正常処理される", () => {
    const result = runValidate("name-empty-desc-valid");
    const output = result.stdout + result.stderr;
    expect(result.exitCode).not.toBe(0);
    expect(output).toContain("name フィールドが存在しないか無効です");
    // description は有効なので description のエラーは出ない
    expect(output).not.toContain(
      "description フィールドが存在しないか無効です",
    );
  });
});

describe("空フィールドガード: description フィールド", () => {
  it("TC-GUARD-004: description が空（parseFrontmatterで配列化）の場合、TypeError ではなく 'description フィールドが存在しないか無効です' Error が出る", () => {
    // name-valid-desc-empty: description: → parseFrontmatter が [] を返す
    const result = runValidate("name-valid-desc-empty");
    const output = result.stdout + result.stderr;
    // TypeError でクラッシュしないこと
    expect(output).not.toContain("TypeError");
    expect(output).not.toContain("not a function");
    // 適切な validation error が出ること
    expect(output).toContain("description フィールドが存在しないか無効です");
  });

  it("TC-GUARD-005: description がスペースのみ '   ' の場合、'description フィールドが存在しないか無効です' Error が出る", () => {
    const result = runValidate("desc-whitespace-only");
    const output = result.stdout + result.stderr;
    expect(result.exitCode).not.toBe(0);
    expect(output).toContain("description フィールドが存在しないか無効です");
  });

  it("TC-GUARD-006: name 有効 + description 空 の組合せで、description の Error のみ発生し name は正常処理される", () => {
    const result = runValidate("name-valid-desc-empty");
    const output = result.stdout + result.stderr;
    // name は有効なのでハイフンケース判定は正常
    expect(output).not.toContain("name フィールドが存在しないか無効です");
    // description の Error が出ること
    expect(output).toContain("description フィールドが存在しないか無効です");
  });
});

describe("空フィールドガード: リグレッション", () => {
  it("TC-GUARD-007: valid-skill の検証結果が変更なし（Error 0件、exitCode 0）", () => {
    const result = runValidate("valid-skill");
    expect(result.exitCode).toBe(0);
    expect(countErrors(result.stdout + result.stderr)).toBe(0);
  });

  it("TC-GUARD-008: empty-name-desc で TypeError/クラッシュが発生しない", () => {
    const result = runValidate("empty-name-desc");
    const output = result.stdout + result.stderr;
    // 結果行が出力されていること（クラッシュしていない）
    expect(output).toContain("結果:");
    // TypeError が出力されていないこと
    expect(output).not.toContain("TypeError");
  });
});
```

#### テストケース一覧（TC-GUARD シリーズ）

| ID           | カテゴリ       | フィクスチャ          | 検証内容                                                 | 期待結果                   |
| ------------ | -------------- | --------------------- | -------------------------------------------------------- | -------------------------- |
| TC-GUARD-001 | name 異常系    | empty-name-desc       | name が `[]`（空配列）の場合の Error メッセージ          | Error（適切メッセージ）    |
| TC-GUARD-002 | name 異常系    | name-whitespace-only  | name がスペースのみの場合の Error メッセージ（P42 trim） | Error（適切メッセージ）    |
| TC-GUARD-003 | 組合せ         | name-empty-desc-valid | name 空 + description 有効の組合せ                       | name Error のみ            |
| TC-GUARD-004 | desc 異常系    | name-valid-desc-empty | description が `[]` の場合に TypeError にならない        | Error（クラッシュなし）    |
| TC-GUARD-005 | desc 異常系    | desc-whitespace-only  | description がスペースのみの場合の Error メッセージ      | Error（適切メッセージ）    |
| TC-GUARD-006 | 組合せ         | name-valid-desc-empty | name 有効 + description 空の組合せ                       | desc Error のみ            |
| TC-GUARD-007 | リグレッション | valid-skill           | 有効なスキルの検証結果が変わらない                       | exitCode 0、Error 0件      |
| TC-GUARD-008 | リグレッション | empty-name-desc       | TypeError/クラッシュが発生せず結果行が出力される         | 結果行出力、TypeError なし |

### Task 4-4: Red 状態の確認

テストを実行し、新規テスト（TC-GUARD-001 〜 TC-GUARD-008）が**全て失敗**することを確認する。

```bash
cd .claude/skills/skill-creator && pnpm vitest run scripts/__tests__/quick_validate.test.js
```

**期待する失敗パターン**:

- TC-GUARD-001: 現在の Error メッセージは「name フィールドが存在しません」ではなく「ハイフンケースではありません」→ メッセージ不一致で FAIL
- TC-GUARD-002: 現在はスペースのみでも guard を通過し、別の Error メッセージが出る → FAIL
- TC-GUARD-003: name が配列のため、メッセージが不正確 → FAIL
- TC-GUARD-004: `desc.toLowerCase()` で TypeError が発生しクラッシュ → FAIL
- TC-GUARD-005: スペースのみ description は guard を通過 → FAIL
- TC-GUARD-006: description 空で TypeError クラッシュの影響 → FAIL
- TC-GUARD-007: 既存テストなので **PASS** する（リグレッション確認用）
- TC-GUARD-008: TypeError が発生するため FAIL

**既存テスト（TC-N, TC-E, TC-B, TC-OP, TC-WC, TC-RG, TC-EC, TC-IT シリーズ）は全て PASS** のままであること。TC-EC-004 は現在の動作を記録するテストであり、Phase 5 実装後も意図どおり動作する。

## 参照資料

| 資料                         | パス                                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| 対象スクリプト               | `.claude/skills/skill-creator/scripts/quick_validate.js`                                                 |
| ユーティリティ               | `.claude/skills/skill-creator/scripts/utils.js`                                                          |
| 既存テストファイル           | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`                                  |
| フィクスチャディレクトリ     | `.claude/skills/skill-creator/scripts/__tests__/fixtures/`                                               |
| P42: trim バリデーション漏れ | `.claude/rules/06-known-pitfalls.md#P42`                                                                 |
| Phase 1 要件定義             | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-1-requirements.md`  |
| Phase 2 設計書               | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-2-design.md`        |
| Phase 3 設計レビュー         | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-3-design-review.md` |
| claude-code-skills-structure | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md`                      |
| quality-requirements         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                              |

## 統合テスト連携

| シナリオカテゴリ   | 検証内容                                            | テスト ID                   |
| ------------------ | --------------------------------------------------- | --------------------------- |
| フィクスチャ整合性 | 新規フィクスチャが正しいディレクトリ構造を持つ      | TC-GUARD-001 〜 006         |
| 既存テスト後方互換 | 既存の全テスト（TC-N 〜 TC-IT）が引き続き PASS する | TC-GUARD-007 + 既存全テスト |
| クラッシュ防止     | TypeError でプロセスが異常終了しない                | TC-GUARD-004, TC-GUARD-008  |

## 多角的チェック観点

- [ ] 新規テストケースが既存テストと ID が衝突しない（TC-GUARD プレフィックス）
- [ ] フィクスチャ SKILL.md の YAML frontmatter が `parseFrontmatter` で正しくパースされることを手動確認
- [ ] テスト実行環境が Node.js ESM（Vitest 標準環境、happy-dom/jsdom ではない）であることを確認
- [ ] 既存テスト TC-EC-004（empty-name-desc の動作記録テスト）との整合性を確認

## 成果物

| 成果物                              | 配置先                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------- |
| テストコード（追記）                | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`          |
| フィクスチャ: name-whitespace-only  | `.claude/skills/skill-creator/scripts/__tests__/fixtures/name-whitespace-only/`  |
| フィクスチャ: desc-whitespace-only  | `.claude/skills/skill-creator/scripts/__tests__/fixtures/desc-whitespace-only/`  |
| フィクスチャ: name-valid-desc-empty | `.claude/skills/skill-creator/scripts/__tests__/fixtures/name-valid-desc-empty/` |
| フィクスチャ: name-empty-desc-valid | `.claude/skills/skill-creator/scripts/__tests__/fixtures/name-empty-desc-valid/` |

## 完了条件

- [ ] 4 つの新規フィクスチャが作成されている
- [ ] 8 つの新規テストケース（TC-GUARD-001 〜 TC-GUARD-008）がテストファイルに追加されている
- [ ] TC-GUARD-001 〜 TC-GUARD-006, TC-GUARD-008 が**失敗状態（Red）**である
- [ ] TC-GUARD-007（リグレッション）は **PASS** している
- [ ] 既存テスト（TC-N, TC-E, TC-B, TC-OP, TC-WC, TC-RG, TC-EC, TC-IT シリーズ）が全て **PASS** している
- [ ] テスト実行コマンドがエラーなく完了する（個別テスト FAIL はあるが、テストフレームワーク自体のエラーではない）

## 次の Phase

Phase 5（実装: TDD Green）へ進む。Phase 5 では `quick_validate.js` の Line 140, 158 のバリデーションを `typeof === "string" && .trim() !== ""` に変更し、全テストを PASS させる。
