# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 6                               |
| 機能名    | imp-layer12-check-id-script-006 |
| 作成日    | 2026-04-04                      |
| 前提Phase | Phase 5                         |
| 後続Phase | Phase 7                         |

## 目的

Phase 5 で実装したスクリプトのエッジケース・境界値・将来拡張シナリオのテストを追加し、回帰ガードを強化する。

## 実行タスク

### タスク1: エッジケーステストの追加

**目的**: 異常系・境界値の動作を確認するテストを追加する

**追加テストケース**:

```javascript
describe("edge cases", () => {
  it("should handle empty file content gracefully", () => {
    const ids = extractCheckIdsFromSpec("");
    expect(ids).toHaveLength(0);
  });

  it("should handle file with only guideline text (no table rows)", () => {
    const content = `
## ガイドライン
次の check ID は L5-001 から始めること。
L3-004 については将来的に L3-005 を追加予定。
    `;
    const ids = extractCheckIdsFromSpec(content);
    expect(ids).toHaveLength(0);
  });

  it("should handle table row with extra spaces", () => {
    const content = "|  L1-001  | SKILL.md の存在確認 | `error` |";
    const ids = extractCheckIdsFromSpec(content);
    expect(ids).toContain("L1-001");
  });

  it("should return non-zero exit code when impl file not found", () => {
    // CLI の終了コード 2 のテスト
    const result = spawnSync("node", [
      "scripts/verify-check-id-parity.js",
      "--impl",
      "nonexistent.ts",
    ]);
    expect(result.status).toBe(2);
  });
});
```

### タスク2: 将来拡張シナリオのテスト

**目的**: check ID が 30 件超に増えた場合の動作を確認するテストを追加する

**追加テストケース**:

```javascript
describe("future expansion scenarios", () => {
  it("should handle 30+ check IDs without hardcoding", () => {
    // L1-001 〜 L5-006 の 30 件以上のテーブル行を生成
    const rows = [];
    for (let layer = 1; layer <= 5; layer++) {
      for (let num = 1; num <= 6; num++) {
        const id = `L${layer}-${String(num).padStart(3, "0")}`;
        rows.push(`| ${id} | チェック内容 | \`error\` | 条件 |`);
      }
    }
    const content = rows.join("\n");
    const ids = extractCheckIdsFromSpec(content);
    expect(ids).toHaveLength(30);
  });

  it("should correctly distinguish L2-007 (real) from L2-008 (example in text)", () => {
    const content = `
| L2-007 | output-schema.json が有効な JSON か確認 | \`error\` |
## 拡張ガイドライン
次に追加する場合は L2-008 から始めること。
    `;
    const ids = extractCheckIdsFromSpec(content);
    expect(ids).toContain("L2-007");
    expect(ids).not.toContain("L2-008");
  });
});
```

### タスク3: 統合テスト（実ファイル使用）の追加

**目的**: 実際のファイルを使った統合テストを追加する

**追加テストケース**:

```javascript
describe("integration with real files", () => {
  it("should pass parity check with current real files", () => {
    const implContent = fs.readFileSync(DEFAULT_IMPL_PATH, "utf-8");
    const specContent = fs.readFileSync(DEFAULT_SPEC_PATH, "utf-8");
    const implIds = extractCheckIdsFromImpl(implContent);
    const specIds = extractCheckIdsFromSpec(specContent);
    const result = compareCheckIds(implIds, specIds);
    expect(result.passed).toBe(true);
  });
});
```

## 参照資料

| 資料名         | パス                                                              |
| -------------- | ----------------------------------------------------------------- |
| Phase 5 実装   | `scripts/verify-check-id-parity.js`（または設計書で決定したパス） |
| Phase 4 テスト | `scripts/__tests__/verify-check-id-parity.test.js`                |

## 成果物

| 成果物             | パス                                                          |
| ------------------ | ------------------------------------------------------------- |
| 拡張ユニットテスト | `outputs/phase-6/extended-test-commands.md`（拡張テスト一覧） |

## 完了条件

- [ ] エッジケーステスト（空ファイル・ガイドラインのみ・余分スペース・ファイル未存在）が追加されている
- [ ] 将来拡張シナリオのテスト（30 件超・L2-007 vs L2-008 区別）が追加されている
- [ ] 統合テスト（実ファイル使用）が追加されている
- [ ] 追加テストが全て PASS している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 7: カバレッジ確認
