# Phase 6: テスト拡充 — name/description 空フィールドガード

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 |
| Phase     | 6 — テスト拡充                              |
| 作成日    | 2026-02-27                                  |
| 前提Phase | Phase 5（実装）完了、全テスト Green         |
| 次Phase   | Phase 7（カバレッジ確認）                   |
| Issue     | #913                                        |

## 目的

Phase 5 の実装に対してテストを拡充し、カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を目指す。境界値テスト、組合せテスト、YAML frontmatter の実パターンテストを追加する。

## 実行タスク

### Task 6-1: 現在のカバレッジ測定

Phase 5 完了時点のカバレッジを測定し、不足箇所を特定する。

```bash
cd .claude/skills/skill-creator && pnpm vitest run scripts/__tests__/quick_validate.test.js --coverage
```

カバレッジレポートから、以下の観点でギャップを分析する:

- `validateSkill` 関数内の未カバー行
- 分岐（if/else）の片方のみカバーされている箇所
- `QuickValidationResult` クラスのメソッドカバレッジ

### Task 6-2: 追加テストケースの設計と作成

テストファイル: `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`

既存テストファイルの末尾（Phase 4 で追加した TC-GUARD シリーズの後）に以下のテストグループを追加する。

#### テストグループ 1: 境界値テスト拡充

```javascript
// ---------------------------------------------------------------------------
// Phase 6: 空フィールドガード 境界値テスト拡充
// ---------------------------------------------------------------------------

describe("空フィールドガード: 境界値テスト", () => {
  it("TC-GUARD-BV-001: name が1文字 'a' の場合、正常にパスする", () => {
    // 1文字の有効な name は最小有効値
    // valid-skill フィクスチャの name は "valid-skill" なので、
    // 直接 1 文字 name のフィクスチャは不要（regex テストで担保済み）
    // 代わりに valid-skill が正常動作することを再確認
    const result = runValidate("valid-skill");
    expect(result.exitCode).toBe(0);
  });

  it("TC-GUARD-BV-002: name がタブ文字のみ '\\t' の場合、Error が出る", () => {
    // タブ文字は trim() で除去される → 空文字列判定
    // ただし parseFrontmatter の regex が \t をどう処理するかはパーサー依存
    // このテストは Phase 5 実装の trim() 動作を確認する
    const result = runValidate("name-whitespace-only");
    const output = result.stdout + result.stderr;
    expect(result.exitCode).not.toBe(0);
  });

  it("TC-GUARD-BV-003: description が改行のみの場合の動作確認", () => {
    // description: | で始まり、内容が空行のみの場合
    // parseFrontmatter はマルチライン値を trim() して返す
    // 空行のみ → trim() 後に "" → 配列ではなく空文字列
    // 現在の empty-name-desc フィクスチャで間接的に確認
    const result = runValidate("empty-name-desc");
    const output = result.stdout + result.stderr;
    expect(output).toContain("結果:");
    expect(output).not.toContain("TypeError");
  });
});
```

#### テストグループ 2: 組合せテスト

```javascript
// ---------------------------------------------------------------------------
// Phase 6: 空フィールドガード 組合せテスト
// ---------------------------------------------------------------------------

describe("空フィールドガード: 組合せテスト", () => {
  it("TC-GUARD-COMBO-001: name 空 + description 空 の場合、両方の Error が出る", () => {
    const result = runValidate("empty-name-desc");
    const output = result.stdout + result.stderr;
    expect(output).toContain("name フィールドが存在しないか無効です");
    expect(output).toContain("description フィールドが存在しないか無効です");
    expect(countErrors(output)).toBeGreaterThanOrEqual(2);
  });

  it("TC-GUARD-COMBO-002: name スペースのみ + description スペースのみ の場合、両方の Error が出る", () => {
    // 両方スペースのみのフィクスチャがないため、個別テストの結果から推論
    // name-whitespace-only: name Error あり
    // desc-whitespace-only: desc Error あり
    const nameResult = runValidate("name-whitespace-only");
    const nameOutput = nameResult.stdout + nameResult.stderr;
    expect(nameOutput).toContain("name フィールドが存在しないか無効です");

    const descResult = runValidate("desc-whitespace-only");
    const descOutput = descResult.stdout + descResult.stderr;
    expect(descOutput).toContain(
      "description フィールドが存在しないか無効です",
    );
  });

  it("TC-GUARD-COMBO-003: frontmatter なし → 既存の 'YAML frontmatter が見つかりません' Error（変更なし）", () => {
    // frontmatter 自体がない場合、name/description 検証に到達しない
    const result = runValidate("no-frontmatter");
    const output = result.stdout + result.stderr;
    expect(output).toContain("frontmatter");
    // name/description の Error は出ない（frontmatter Error で早期 return）
    expect(output).not.toContain("name フィールド");
    expect(output).not.toContain("description フィールド");
  });
});
```

#### テストグループ 3: Error メッセージ精度テスト

```javascript
// ---------------------------------------------------------------------------
// Phase 6: 空フィールドガード Error メッセージ精度テスト
// ---------------------------------------------------------------------------

describe("空フィールドガード: Error メッセージ精度", () => {
  it("TC-GUARD-MSG-001: name 空の Error メッセージが正確な文言を含む", () => {
    const result = runValidate("empty-name-desc");
    const output = result.stdout + result.stderr;
    // 正確な文言を検証（部分一致ではなく完全一致に近い検証）
    expect(output).toMatch(/name フィールドが存在しないか無効です/);
  });

  it("TC-GUARD-MSG-002: description 空の Error メッセージが正確な文言を含む", () => {
    const result = runValidate("name-valid-desc-empty");
    const output = result.stdout + result.stderr;
    expect(output).toMatch(/description フィールドが存在しないか無効です/);
  });

  it("TC-GUARD-MSG-003: valid-skill で '存在しないか無効です' メッセージが出ない", () => {
    const result = runValidate("valid-skill");
    const output = result.stdout + result.stderr;
    expect(output).not.toContain("存在しないか無効です");
  });
});
```

#### テストグループ 4: リグレッション拡充

```javascript
// ---------------------------------------------------------------------------
// Phase 6: 空フィールドガード リグレッション拡充
// ---------------------------------------------------------------------------

describe("空フィールドガード: リグレッション拡充", () => {
  it("TC-GUARD-RG-001: 既存 boundary-64-name フィクスチャの動作が変わらない", () => {
    const result = runValidate("boundary-64-name");
    const output = result.stdout + result.stderr;
    // 64文字 name は長さ制限を通過する
    expect(output).not.toContain("64 文字を超えています");
    // ディレクトリ名不一致の Warning は維持
    expect(countWarnings(output)).toBeGreaterThanOrEqual(1);
  });

  it("TC-GUARD-RG-002: 既存 boundary-1024-desc フィクスチャの動作が変わらない", () => {
    const result = runValidate("boundary-1024-desc");
    const output = result.stdout + result.stderr;
    // 1024文字 description は長さ制限を通過する
    expect(output).not.toContain("1024 文字を超えています");
  });

  it("TC-GUARD-RG-003: 既存 invalid-name フィクスチャの Error が維持される", () => {
    const result = runValidate("invalid-name");
    const output = result.stdout + result.stderr;
    expect(result.exitCode).not.toBe(0);
    expect(output).toContain("ハイフンケース");
  });

  it("TC-GUARD-RG-004: 3つの実スキルが全て Error 0件で検証を通過する", () => {
    const skillNames = [
      "skill-creator",
      "task-specification-creator",
      "aiworkflow-requirements",
    ];
    for (const skillName of skillNames) {
      const result = runValidateSkill(join(SKILLS_DIR, skillName));
      const output = result.stdout + result.stderr;
      expect(countErrors(output)).toBe(0);
    }
  });
});
```

#### 追加テストケース一覧

| ID                 | カテゴリ       | フィクスチャ          | 検証内容                                  |
| ------------------ | -------------- | --------------------- | ----------------------------------------- |
| TC-GUARD-BV-001    | 境界値         | valid-skill           | 有効な name の最小パターン確認            |
| TC-GUARD-BV-002    | 境界値         | name-whitespace-only  | タブ等の空白文字の trim 動作確認          |
| TC-GUARD-BV-003    | 境界値         | empty-name-desc       | 改行のみ description の動作確認           |
| TC-GUARD-COMBO-001 | 組合せ         | empty-name-desc       | name 空 + description 空 → 両方 Error     |
| TC-GUARD-COMBO-002 | 組合せ         | 各フィクスチャ        | スペースのみ × 2 の独立動作確認           |
| TC-GUARD-COMBO-003 | 組合せ         | no-frontmatter        | frontmatter なし → name/desc 検証に未到達 |
| TC-GUARD-MSG-001   | メッセージ精度 | empty-name-desc       | name Error メッセージ文言の正確性         |
| TC-GUARD-MSG-002   | メッセージ精度 | name-valid-desc-empty | description Error メッセージ文言の正確性  |
| TC-GUARD-MSG-003   | メッセージ精度 | valid-skill           | 有効スキルで新 Error メッセージが出ない   |
| TC-GUARD-RG-001    | リグレッション | boundary-64-name      | 64文字 name の既存動作維持                |
| TC-GUARD-RG-002    | リグレッション | boundary-1024-desc    | 1024文字 desc の既存動作維持              |
| TC-GUARD-RG-003    | リグレッション | invalid-name          | 不正 name の既存 Error 維持               |
| TC-GUARD-RG-004    | リグレッション | 実スキル ×3           | 実スキルの Error 0件維持                  |

### Task 6-3: テスト実行と全 PASS 確認

```bash
cd .claude/skills/skill-creator && pnpm vitest run scripts/__tests__/quick_validate.test.js
```

全テスト（Phase 4 の TC-GUARD + Phase 6 の追加テスト + 既存テスト全て）が PASS することを確認する。

## 参照資料

| 資料                 | パス                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト仕様   | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-4-test-creation.md`  |
| Phase 5 実装仕様     | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-5-implementation.md` |
| カバレッジ基準       | `.claude/rules/02-code-quality.md#カバレッジ基準`                                                         |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                               |
| error-handling       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                     |

## 統合テスト連携

| シナリオカテゴリ | 検証内容                              | テスト ID                 |
| ---------------- | ------------------------------------- | ------------------------- |
| 境界値検証       | 最小/最大値でのバリデーション動作     | TC-GUARD-BV-001 〜 003    |
| 組合せ検証       | name + description の独立性確認       | TC-GUARD-COMBO-001 〜 003 |
| メッセージ精度   | Error メッセージの文言が仕様どおり    | TC-GUARD-MSG-001 〜 003   |
| リグレッション   | 既存フィクスチャ + 実スキルの動作維持 | TC-GUARD-RG-001 〜 004    |

## 多角的チェック観点

- [ ] 追加テストが既存テスト ID と衝突しない（TC-GUARD-BV, TC-GUARD-COMBO, TC-GUARD-MSG, TC-GUARD-RG プレフィックス）
- [ ] 各テストが独立して実行可能で、実行順序に依存しない
- [ ] `runValidate` はフィクスチャ検証、`runValidateSkill` は実スキル検証に限定して使い分けている
- [ ] テスト間で状態を共有していない（P9 対策）

## 成果物

| 成果物             | 配置先                                                                              |
| ------------------ | ----------------------------------------------------------------------------------- |
| 追加テストコード   | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`（末尾追記） |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`（カバレッジ測定結果）                          |

## 完了条件

- [ ] 13 個の追加テストケース（TC-GUARD-BV, COMBO, MSG, RG）が追加されている
- [ ] 全テスト（既存 + Phase 4 + Phase 6）が PASS
- [ ] カバレッジ測定が完了し、結果がドキュメント化されている
- [ ] テスト実行が10秒以内に完了する

## 次の Phase

Phase 7（カバレッジ確認）へ進む。Phase 7 ではカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の充足を確認する。
