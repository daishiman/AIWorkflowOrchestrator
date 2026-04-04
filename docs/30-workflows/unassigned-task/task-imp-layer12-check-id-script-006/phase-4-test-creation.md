# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 4                               |
| 機能名    | imp-layer12-check-id-script-006 |
| 作成日    | 2026-04-04                      |
| 前提Phase | Phase 3                         |
| 後続Phase | Phase 5                         |

## 目的

Phase 5（スクリプト実装）の前に、スクリプトのユニットテストを作成し、全て FAIL（スクリプト未実装）であることを確認する（TDD Red フェーズ）。

## 実行タスク

### タスク1: テーブル行抽出関数のテスト作成

**目的**: `extractCheckIdsFromSpec()` が例示値を除外し、テーブル行のみから check ID を抽出することを確認するテストを作成する

**テストケース**:

```javascript
describe("extractCheckIdsFromSpec", () => {
  it("should extract check IDs from table rows", () => {
    const content = `
| Check ID | 検証内容 |
| -------- | -------- |
| L1-001 | SKILL.md の存在確認 | \`error\` |
| L2-007 | output-schema.json が有効な JSON か確認 | \`error\` |
    `;
    const ids = extractCheckIdsFromSpec(content);
    expect(ids).toContain("L1-001");
    expect(ids).toContain("L2-007");
    expect(ids).toHaveLength(2);
  });

  it("should NOT extract example check IDs from guideline text", () => {
    const content = `
## Layer 拡張ガイドライン
1. 該当 Layer の現在の最大連番 + 1 を新しい check ID とする（例: Layer 2 に追加なら L2-008）
    `;
    const ids = extractCheckIdsFromSpec(content);
    expect(ids).not.toContain("L2-008");
    expect(ids).toHaveLength(0);
  });

  it("should handle L2-008 when it appears as a real table row", () => {
    const content = `
| L2-008 | 新しいチェック | \`warning\` | 条件を満たす |
    `;
    const ids = extractCheckIdsFromSpec(content);
    expect(ids).toContain("L2-008");
  });

  it("should extract all 19 check IDs from the actual spec file", () => {
    const content = fs.readFileSync(SPEC_FILE_PATH, "utf-8");
    const ids = extractCheckIdsFromSpec(content);
    expect(ids).toHaveLength(19);
  });
});
```

**成果物**: `scripts/__tests__/verify-check-id-parity.test.js` 内 `extractCheckIdsFromSpec` テストスイート

### タスク2: 実装ファイル抽出関数のテスト作成

**目的**: `extractCheckIdsFromImpl()` が実装ファイルから check ID を正確に抽出することを確認するテストを作成する

**テストケース**:

```javascript
describe("extractCheckIdsFromImpl", () => {
  it("should extract check IDs from implementation file", () => {
    const content = `
      checkId: 'L1-001',
      checkId: 'L2-003',
    `;
    const ids = extractCheckIdsFromImpl(content);
    expect(ids).toContain("L1-001");
    expect(ids).toContain("L2-003");
  });

  it("should return sorted unique IDs", () => {
    const content = `
      checkId: 'L1-001',
      checkId: 'L1-001',  // 重複
      checkId: 'L2-003',
    `;
    const ids = extractCheckIdsFromImpl(content);
    expect(ids).toHaveLength(2);
    expect(ids).toEqual(["L1-001", "L2-003"]);
  });
});
```

**成果物**: `scripts/__tests__/verify-check-id-parity.test.js` 内 `extractCheckIdsFromImpl` テストスイート

### タスク3: 突き合わせ・差分検出のテスト作成

**目的**: `compareCheckIds()` が差分を正確に検出することを確認するテストを作成する

**テストケース**:

```javascript
describe("compareCheckIds", () => {
  it("should return PASS when IDs match", () => {
    const result = compareCheckIds(["L1-001", "L2-001"], ["L1-001", "L2-001"]);
    expect(result.passed).toBe(true);
    expect(result.onlyInImpl).toHaveLength(0);
    expect(result.onlyInSpec).toHaveLength(0);
  });

  it("should detect ID in spec but not in impl", () => {
    const result = compareCheckIds(["L1-001"], ["L1-001", "L2-008"]);
    expect(result.passed).toBe(false);
    expect(result.onlyInSpec).toContain("L2-008");
  });

  it("should detect ID in impl but not in spec", () => {
    const result = compareCheckIds(["L1-001", "L1-002"], ["L1-001"]);
    expect(result.passed).toBe(false);
    expect(result.onlyInImpl).toContain("L1-002");
  });
});
```

**成果物**: `scripts/__tests__/verify-check-id-parity.test.js` 内 `compareCheckIds` テストスイート

### TDD Red 確認

スクリプト実装前に上記テストを実行し、全て FAIL であることを確認する:

```bash
node --test scripts/__tests__/verify-check-id-parity.test.js
# または
pnpm vitest run scripts/__tests__/verify-check-id-parity.test.js
```

期待: 全テストが FAIL（スクリプト未実装のため）

## 参照資料

| 資料名         | パス                                      |
| -------------- | ----------------------------------------- |
| Phase 2 設計書 | `outputs/phase-2/design.md`               |
| Phase 3 結果   | `outputs/phase-3/design-review-result.md` |
| Phase 1 要件   | `outputs/phase-1/script-requirements.md`  |

## 成果物

| 成果物         | パス                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| ユニットテスト | `scripts/__tests__/verify-check-id-parity.test.js`（または設計で決定したパス） |

## 完了条件

- [ ] `extractCheckIdsFromSpec` のテスト（例示値除外を含む）が作成されている
- [ ] `extractCheckIdsFromImpl` のテストが作成されている
- [ ] `compareCheckIds` の差分検出テストが作成されている
- [ ] TDD Red 確認: 全テストを実行し、全て FAIL であることを確認済み
- [ ] テストファイルが所定のパスに配置されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 5: 実装（TDD: Green）
