# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 4                                    |
| Phase名    | テスト作成                           |
| 前提Phase  | Phase 3（設計レビューゲート）        |
| 後続Phase  | Phase 5（実装）                      |
| ステータス | 未実施                               |
| 作成日     | 2026-01-31                           |
| 機能名     | TASK-8C-E: E2Eテストフィクスチャ作成 |

---

## 目的

フィクスチャの正当性を検証するテストを先に作成する。フィクスチャファイルがまだ存在しないため、テストは FAIL する（Red 状態）。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: フィクスチャ検証テストの作成

**目的**: フィクスチャファイルの存在と構造を検証するテストを作成する

**実行手順**:

1. テストファイルを作成する: `apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts`
2. 以下のテストケースを実装する：

```typescript
// テストケース一覧
describe("E2E Skill Fixtures", () => {
  // TC-001: test-skill/SKILL.md が存在する
  // TC-002: test-skill/SKILL.md の YAML Frontmatter が正しい
  // TC-003: test-skill/agents/test-agent.md が存在する
  // TC-004: test-skill/references/test-ref.md が存在する
  // TC-005: another-skill/SKILL.md が存在する
  // TC-006: another-skill/SKILL.md の YAML Frontmatter が正しい
  // TC-007: invalid-skill/README.md が存在する
  // TC-008: invalid-skill/SKILL.md が存在しない
});
```

3. SkillScanner を使ったパーステストを追加する：

```typescript
describe("SkillScanner Fixture Integration", () => {
  // TC-009: SkillScanner がフィクスチャディレクトリを正しくスキャンできる
  // TC-010: test-skill が ScannedSkillMetadata として取得される
  // TC-011: test-skill の agents 配列に test-agent が含まれる
  // TC-012: test-skill の references 配列に test-ref が含まれる
  // TC-013: another-skill が ScannedSkillMetadata として取得される
  // TC-014: invalid-skill が結果に含まれない
});
```

4. テスト仕様書を `outputs/phase-04/test-specification.md` に出力する

**期待される成果物**:

- テストファイル: `apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts`
- テスト仕様書: `outputs/phase-04/test-specification.md`

---

### タスク2: テスト実行確認（Red 状態）

**目的**: テストが正しく FAIL することを確認する

**実行手順**:

1. テストを実行する：
   ```bash
   pnpm --filter @repo/desktop vitest run src/__tests__/fixtures/skills.fixture.test.ts
   ```
2. 全テストケースが FAIL することを確認する（フィクスチャファイルが未作成のため）
3. FAIL 理由が「ファイルが存在しない」であることを確認する（テストコード自体のバグではないこと）

**期待される成果物**:

- テスト実行結果（FAIL 確認）

---

## 参照資料

| 参照資料            | パス                                                                  | 内容             |
| ------------------- | --------------------------------------------------------------------- | ---------------- |
| Phase 2 設計書      | `outputs/phase-02/fixture-design.md`                                  | フィクスチャ設計 |
| SkillScanner 実装   | `apps/desktop/src/main/services/skill/SkillScanner.ts`                | パースロジック   |
| SkillScanner テスト | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts` | テスト参考       |
| テスト戦略          | `docs/00-requirements/02-non-functional-requirements.md`              | テストピラミッド |

---

## 成果物

| 成果物         | パス                                                         | 内容                   |
| -------------- | ------------------------------------------------------------ | ---------------------- |
| テストファイル | `apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts` | フィクスチャ検証テスト |
| テスト仕様書   | `outputs/phase-04/test-specification.md`                     | テストケース一覧       |

---

## 統合テスト連携

フィクスチャ検証テストは、SkillScanner との統合テストを含む。SkillScanner の `scanAll()` メソッドをフィクスチャディレクトリに対して実行し、期待される `ScannedSkillMetadata` が返されることを検証する。

---

## 多角的チェック観点

| 観点           | 確認内容                                             |
| -------------- | ---------------------------------------------------- |
| テスタビリティ | テストが独立して実行可能か（外部依存なし）           |
| 保守性         | テストケースがフィクスチャ仕様変更時に追従しやすいか |

---

## 完了条件

- [ ] テストファイル `skills.fixture.test.ts` が作成されている
- [ ] TC-001〜TC-014 のテストケースが実装されている
- [ ] テスト実行結果が全件 FAIL（Red 状態）であることが確認されている
- [ ] FAIL 理由がフィクスチャ未作成によるものであることが確認されている
- [ ] テスト仕様書が outputs/phase-04/ に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-05-implementation.md`
