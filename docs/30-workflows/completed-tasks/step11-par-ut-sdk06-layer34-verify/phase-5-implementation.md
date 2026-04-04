# Phase 5: 実装

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 5                                 |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

Phase 4 で定義したテストケースを `SkillCreatorVerificationEngine.test.ts` に実装し、まず red を確認し、その後 Layer3/4 実装で green にする。

## SubAgent 分担

| SubAgent | 担当範囲                                                 | 実行形態         | 完了条件                                                |
| -------- | -------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| A        | `createSkillFixture` 拡張                                | 直列の起点       | `referenceFiles` / `skillMdReferenceLinks` を受け取れる |
| B        | `describe("Layer 3 checks")`                             | A 完了後に並列   | T-L3-01〜T-L3-10 が定義される                           |
| C        | `describe("Layer 4 checks")`                             | A 完了後に並列   | T-L4-01〜T-L4-08 が定義される                           |
| D        | `describe("verify→improve→reverify loop")` / engine stub | B/C 完了後に直列 | T-LOOP-01〜T-LOOP-04 と stub が揃う                     |

### 並列/直列ルール

- 直列（必須）: `createSkillFixture` の interface 変更とファイル生成ロジックは、全テストの共通依存のため最初に固定する。
- 並列（推奨）: Layer 3 / Layer 4 の各 `describe(...)` ブロックは独立しているため並列で実装してよい。
- 直列（必須）: `verify→improve→reverify` は Layer3/4 両方の checks が揃ってから閉じる（結合の前提）。
- 単一ファイルでも「ブロック単位での作業分割」は可能だが、同一箇所の同時編集で衝突するため、担当ブロックの追加位置を事前に分ける。

## 実装順

| 順序 | 対象                                        | 理由                                           |
| ---- | ------------------------------------------- | ---------------------------------------------- |
| 1    | `packages/shared/src/types/skillCreator.ts` | `layer3` / `layer4` 型が必要なら最初に固定する |
| 2    | `createSkillFixture`                        | すべての test case の共通依存を閉じる          |
| 3    | `describe("Layer 3 checks")`                | Layer 3 を先に red に落とす                    |
| 4    | `describe("Layer 4 checks")`                | Layer 4 を並列で実装する                       |
| 5    | `describe("verify→improve→reverify loop")`  | 2 系統の check を統合して閉じる                |
| 6    | `SkillCreatorVerificationEngine.ts` stub    | 最後に green へ寄せる                          |

## 実行タスク

- `createSkillFixture` ヘルパーを拡張して `referenceFiles` / `skillMdReferenceLinks` を対応させる
- `describe("Layer 3 checks")` ブロックを実装する（T-L3-01〜T-L3-10）
- `describe("Layer 4 checks")` ブロックを実装する（T-L4-01〜T-L4-08）
- `describe("verify→improve→reverify loop")` ブロックを実装する（T-LOOP-01〜T-LOOP-04）
- `SkillCreatorVerificationEngine.ts` に Layer3/4 の stub 実装を追加して テストを green にする

> 補足: `createSkillFixture` の拡張後、Layer3 と Layer4 の実装は並列で進めてよい。結合テストと engine stub はその後に直列で閉じる。

## 参照資料

| 資料名             | パス                                                                                      | 説明            |
| ------------------ | ----------------------------------------------------------------------------------------- | --------------- |
| Phase 4 テスト定義 | `phase-4-test-creation.md`                                                                | it() 文の一覧   |
| 既存テストファイル | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | 追加先ファイル  |
| 既存実装ファイル   | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | Layer3/4 追加先 |

## 実装手順

### ステップ1: `createSkillFixture` を拡張する

`SkillFixtureOptions` インターフェースに以下を追加する:

```typescript
interface SkillFixtureOptions {
  // 既存フィールド（変更なし）
  skillMd?: string | false;
  agents?: Record<string, string> | false;
  references?: boolean;
  outputSchema?: string | false;

  // 追加フィールド
  /** references/ 配下に配置するファイル群 key: ファイル名, value: 内容 */
  referenceFiles?: Record<string, string>;
  /** SKILL.md 内に参照として記載する references/ パス一覧 */
  skillMdReferenceLinks?: string[];
}
```

`createSkillFixture` 関数に以下を追加する:

```typescript
if (options.referenceFiles && Object.keys(options.referenceFiles).length > 0) {
  const refsDir = path.join(skillDir, "references");
  await fs.mkdir(refsDir, { recursive: true });
  for (const [name, content] of Object.entries(options.referenceFiles)) {
    await fs.writeFile(path.join(refsDir, name), content);
  }
}

if (options.skillMdReferenceLinks && options.skillMdReferenceLinks.length > 0) {
  // SKILL.md 本文に参照が存在することをテストできればよいので、末尾追記で十分
  const skillPath = path.join(skillDir, "SKILL.md");
  const current = await fs.readFile(skillPath, "utf-8");
  const appended =
    current +
    `\n\n## References\n` +
    options.skillMdReferenceLinks.map((p) => `- ${p}`).join("\n") +
    `\n`;
  await fs.writeFile(skillPath, appended);
}
```

### ステップ2: `describe("Layer 3 checks")` を実装する

`SkillCreatorVerificationEngine.test.ts` に以下のブロックを追加する:

```typescript
describe("Layer 3 checks", () => {
  describe("L3-001: output-schema.json $schema フィールド", () => {
    it("T-L3-01: $schema フィールドがある場合 L3-001 が info を返す", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S",
        agents: {
          "a.md": "# A\n\n## 責務\nDoes important things for the system",
        },
        outputSchema: JSON.stringify({
          $schema: "http://json-schema.org/draft-07/schema#",
          type: "object",
        }),
      });
      const checks = await engine.verify(dir);
      expect(findCheck(checks, "L3-001")?.severity).toBe("info");
      expect(findCheck(checks, "L3-001")?.layer).toBe("layer3");
    });

    it("T-L3-02: $schema フィールドがない場合 L3-001 が warning を返す", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S",
        agents: { "a.md": "# A\n\n## 責務\nDoes things" },
        outputSchema: JSON.stringify({ type: "object" }),
      });
      const checks = await engine.verify(dir);
      expect(findCheck(checks, "L3-001")?.severity).toBe("warning");
    });
  });

  // ... T-L3-03〜T-L3-10 は同様のパターンで実装する
});
```

### ステップ3: `describe("Layer 4 checks")` を実装する

```typescript
describe("Layer 4 checks", () => {
  describe("L4-001: Anchors リスト項目", () => {
    it("T-L4-01: Anchors セクションにリスト項目が 1 件以上ある場合 L4-001 が info を返す", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## Anchors\n- anchor1\n- anchor2",
        agents: { "a.md": "# A\n\n## 責務\nDoes things" },
      });
      const checks = await engine.verify(dir);
      expect(findCheck(checks, "L4-001")?.severity).toBe("info");
      expect(findCheck(checks, "L4-001")?.layer).toBe("layer4");
    });

    it("T-L4-02: Anchors セクションにリスト項目がない場合 L4-001 が error を返す", async () => {
      const dir = await createSkillFixture(tmpDir, {
        skillMd: "# S\n\n## Anchors\nNo list items here.",
        agents: { "a.md": "# A\n\n## 責務\nDoes things" },
      });
      const checks = await engine.verify(dir);
      expect(findCheck(checks, "L4-001")?.severity).toBe("error");
    });
  });

  // ... T-L4-03〜T-L4-08 は同様のパターンで実装する
});
```

### ステップ4: `describe("verify→improve→reverify loop")` を実装する

```typescript
describe("verify→improve→reverify loop", () => {
  it("T-LOOP-01: L4-001 が fail する fixture を改善後に re-verify で info になること", async () => {
    // 1. fail fixture を作成する
    const dir = await createSkillFixture(tmpDir, {
      skillMd: "# S\n\n## Anchors\nNo list items.",
      agents: { "a.md": "# A\n\n## 責務\nDoes things" },
    });

    // 2. 初回 verify: L4-001 が error
    const firstChecks = await engine.verify(dir);
    expect(findCheck(firstChecks, "L4-001")?.severity).toBe("error");

    // 3. improve: SKILL.md を修正する
    await fs.writeFile(
      path.join(dir, "SKILL.md"),
      "# S\n\n## Anchors\n- anchor1\n- anchor2",
    );

    // 4. re-verify: L4-001 が info
    const secondChecks = await engine.verify(dir);
    expect(findCheck(secondChecks, "L4-001")?.severity).toBe("info");
  });
});
```

### ステップ5: `SkillCreatorVerificationEngine.ts` に Layer3/4 stub を追加する

テストを green にするため、`SkillCreatorVerificationEngine.ts` に Layer3/4 の実装を追加する:

- `validateLayer3(skillDir)`: L3-001〜L3-004 のチェックを実装する
- `validateLayer4(skillDir)`: L4-001〜L4-003 のチェックを実装する
- `verify()` メソッドに `layer3Checks` と `layer4Checks` を追加する

## 検証コマンド

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts
pnpm --filter @repo/desktop vitest run
```

## 統合テスト連携

- 全テストが green になったことを `pnpm vitest run` で確認する
- Phase 6 で edge case をさらに追加する

## 成果物

| 成果物                 | パス                                                                                      | 説明                      |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------------------------- |
| 実装済みテストファイル | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | Layer3/4 テストケース追加 |
| 実装済み実装ファイル   | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | Layer3/4 検証ロジック追加 |
| 実装順メモ             | `outputs/phase-5/implementation-sequencing.md`                                            | 依存順と並列順の記録      |

## 完了条件

- [ ] `createSkillFixture` に `referenceFiles` が追加されている
- [ ] `createSkillFixture` に `skillMdReferenceLinks` が追加されている
- [ ] T-L3-01〜T-L3-10 が実装されている
- [ ] T-L4-01〜T-L4-08 が実装されている
- [ ] T-LOOP-01〜T-LOOP-04 が実装されている
- [ ] `pnpm vitest run` で全テストが pass する
- [ ] 既存 Layer1/2 テストにデグレなし
- [ ] 実装順が明示されている
- [ ] 検証コマンドが明示されている
- [ ] `outputs/phase-5/implementation-sequencing.md` が成果物として明示されている
- [ ] **本Phase内の全タスクを100%実行完了**
