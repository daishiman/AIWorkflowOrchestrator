# Phase 6: テスト拡充

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| フェーズ     | 6                                    |
| フェーズ名   | テスト拡充                           |
| 目的         | カバレッジ目標達成に向けた追加テスト |
| 前提フェーズ | Phase 5: 実装                        |
| 次フェーズ   | Phase 7: テストカバレッジ確認        |
| 想定成果物   | 追加テストケース                     |

---

## 1. 目的

Phase 4 で作成した基本テストに加え、エッジケース・境界値・異常系のテストを追加し、カバレッジ目標（Line Coverage 80%以上）を達成する。

---

## 2. 実行タスク

### Task 6-1: エッジケーステスト追加

**目的**: 境界値・エッジケースのテストを追加する

**追加テストケース**:

```typescript
describe("isDangerousCommand - Edge Cases", () => {
  it("should handle whitespace variations", () => {
    expect(isDangerousCommand("  rm -rf  /")).toBe(true);
    expect(isDangerousCommand("sudo  apt-get")).toBe(true);
  });

  it("should handle commands in different positions", () => {
    // コマンドの先頭
    expect(isDangerousCommand("rm -rf / && ls")).toBe(true);
    // コマンドの中間
    expect(isDangerousCommand("ls && rm -rf /")).toBe(true);
    // コマンドの末尾
    expect(isDangerousCommand("cd / ; rm -rf")).toBe(true);
  });

  it("should detect dangerous patterns in complex commands", () => {
    expect(isDangerousCommand("bash -c 'rm -rf /'")).toBe(true);
    expect(isDangerousCommand("nohup sudo apt-get &")).toBe(true);
  });

  it("should not false-positive on similar but safe patterns", () => {
    // "su" を含むが "su -" や "su " ではない
    expect(isDangerousCommand("suspend")).toBe(false);
    expect(isDangerousCommand("sudo-less")).toBe(false);
  });
});
```

### Task 6-2: 保護パスエッジケーステスト追加

**目的**: 保護パスのエッジケースをテストする

**追加テストケース**:

```typescript
describe("isProtectedPath - Edge Cases", () => {
  it("should handle paths with trailing slashes", () => {
    expect(isProtectedPath("/etc/")).toBe(true);
    expect(isProtectedPath("/etc")).toBe(false); // /etc/** には /etc 単体はマッチしない
  });

  it("should handle deeply nested paths", () => {
    expect(isProtectedPath("/etc/nginx/sites-available/default")).toBe(true);
    expect(isProtectedPath("/var/log/nginx/access.log")).toBe(true);
  });

  it("should handle relative-like paths", () => {
    expect(isProtectedPath("./home/user/.bashrc")).toBe(false); // 絶対パスでない
  });

  it("should handle paths with special characters", () => {
    expect(isProtectedPath("/etc/my-config.d/file")).toBe(true);
    expect(isProtectedPath("/var/log/app.2024-01-01.log")).toBe(true);
  });
});
```

### Task 6-3: Globパターンエッジケーステスト追加

**目的**: matchGlobPattern() のエッジケースをテストする

**追加テストケース**:

```typescript
describe("matchGlobPattern - Edge Cases", () => {
  it("should handle multiple ** in pattern", () => {
    expect(matchGlobPattern("/a/b/c/d/e", "/**/c/**")).toBe(true);
  });

  it("should handle adjacent wildcards", () => {
    expect(matchGlobPattern("/etc/passwd", "/**/*")).toBe(true);
  });

  it("should handle patterns without wildcards", () => {
    expect(matchGlobPattern("/exact/path", "/exact/path")).toBe(true);
    expect(matchGlobPattern("/exact/path", "/different/path")).toBe(false);
  });

  it("should handle HOME not set", () => {
    const originalHome = process.env.HOME;
    delete process.env.HOME;

    try {
      // HOME未設定時は ~ が空文字に展開される
      expect(matchGlobPattern("/.ssh/id_rsa", "~/.ssh/**")).toBe(true);
    } finally {
      process.env.HOME = originalHome;
    }
  });

  it("should handle regex special characters in path", () => {
    expect(matchGlobPattern("/path/with.dot", "/path/with.dot")).toBe(true);
    expect(matchGlobPattern("/path/with+plus", "/path/with+plus")).toBe(true);
    expect(matchGlobPattern("/path/with(paren)", "/path/with(paren)")).toBe(
      true,
    );
  });
});
```

### Task 6-4: ツール検証エッジケーステスト追加

**目的**: validateAllowedTools/filterAllowedTools のエッジケースをテストする

**追加テストケース**:

```typescript
describe("validateAllowedTools - Edge Cases", () => {
  it("should handle duplicate tools", () => {
    expect(validateAllowedTools(["Read", "Read", "Write"])).toBe(true);
  });

  it("should handle whitespace in tool names", () => {
    expect(validateAllowedTools([" Read"])).toBe(false);
    expect(validateAllowedTools(["Read "])).toBe(false);
    expect(validateAllowedTools(["Re ad"])).toBe(false);
  });

  it("should handle null/undefined gracefully", () => {
    // TypeScript的には許可されないが、実行時のロバスト性確認
    expect(() => validateAllowedTools(null as unknown as string[])).toThrow();
    expect(() =>
      validateAllowedTools(undefined as unknown as string[]),
    ).toThrow();
  });
});

describe("filterAllowedTools - Edge Cases", () => {
  it("should handle duplicate tools", () => {
    expect(filterAllowedTools(["Read", "Read", "Write"])).toEqual([
      "Read",
      "Read",
      "Write",
    ]);
  });

  it("should preserve order", () => {
    expect(filterAllowedTools(["Write", "Invalid", "Read"])).toEqual([
      "Write",
      "Read",
    ]);
  });
});
```

### Task 6-5: パフォーマンステスト追加（オプション）

**目的**: 大量データに対するパフォーマンスを確認する

**追加テストケース**:

```typescript
describe("Performance Tests", () => {
  it("should handle many tool checks efficiently", () => {
    const tools = Array(1000).fill("Read");
    const start = performance.now();
    validateAllowedTools(tools);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // 100ms以内
  });

  it("should handle long command strings efficiently", () => {
    const longCommand = "ls ".repeat(10000);
    const start = performance.now();
    isDangerousCommand(longCommand);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // 100ms以内
  });
});
```

---

## 3. テスト実行コマンド

```bash
# 全テストを実行
pnpm --filter @repo/shared test -- --run

# カバレッジを含めて実行
pnpm --filter @repo/shared test -- --run --coverage

# 特定のテストのみ
pnpm --filter @repo/shared test -- --run -t "Edge Cases"
```

---

## 4. 参照資料

| 資料名     | パス                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| 基本テスト | `./phase-4-test-creation.md`                                                |
| 実装       | `./phase-5-implementation.md`                                               |
| 品質基準   | `.claude/skills/task-specification-creator/references/quality-standards.md` |

---

## 5. 完了条件

- [ ] Task 6-1 完了: エッジケーステスト追加
- [ ] Task 6-2 完了: 保護パスエッジケーステスト追加
- [ ] Task 6-3 完了: Globパターンエッジケーステスト追加
- [ ] Task 6-4 完了: ツール検証エッジケーステスト追加
- [ ] Task 6-5 完了: パフォーマンステスト追加（オプション）
- [ ] 全テストがパス

---

## 6. 統合テスト連携【必須】

> **N/A**: 本タスクは定数・ユーティリティ関数のみのため、統合テスト連携は対象外です。

---

## 7. 成果物

| 成果物     | パス                                                       | 状態     |
| ---------- | ---------------------------------------------------------- | -------- |
| 追加テスト | `packages/shared/src/constants/__tests__/security.test.ts` | 更新待ち |

---

## 8. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 9. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. Task 6-1: エッジケーステスト追加
2. Task 6-2: 保護パスエッジケーステスト追加
3. Task 6-3: Globパターンエッジケーステスト追加
4. Task 6-4: ツール検証エッジケーステスト追加
5. Task 6-5: パフォーマンステスト追加
6. 全テストの実行・確認
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
