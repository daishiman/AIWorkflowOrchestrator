# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 6                                    |
| Phase名    | テスト拡充                           |
| 前提Phase  | Phase 5（実装）                      |
| 後続Phase  | Phase 7（テストカバレッジ確認）      |
| ステータス | 未実施                               |
| 作成日     | 2026-01-31                           |
| 機能名     | TASK-8C-E: E2Eテストフィクスチャ作成 |

---

## 目的

Phase 4-5 で作成した基本テストに加え、エッジケースや境界値のテストを追加し、フィクスチャの堅牢性を検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: YAML Frontmatter 詳細検証テストの追加

**目的**: SKILL.md の YAML Frontmatter が仕様通りにパースされることを詳細検証する

**実行手順**:

1. `apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts` に以下のテストケースを追加する：

```typescript
describe("YAML Frontmatter Detail Validation", () => {
  // TC-015: test-skill の name が 'test-skill' である
  // TC-016: test-skill の description が 'E2Eテスト用のスキル' である
  // TC-017: test-skill の allowed-tools が ['Read', 'Write', 'Edit', 'Bash'] である
  // TC-018: another-skill の name が 'another-skill' である
  // TC-019: another-skill の allowed-tools が ['Read', 'Glob'] である
});
```

2. テストを実行して全件パスすることを確認する

**期待される成果物**:

- テストケース TC-015〜TC-019 の追加

---

### タスク2: サブリソース詳細検証テストの追加

**目的**: サブリソースの name と description が期待通りに抽出されることを検証する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("Sub-resource Detail Validation", () => {
  // TC-020: test-agent の name が 'test-agent' である
  // TC-021: test-agent の description が 'Test Agent' を含む
  // TC-022: test-ref の name が 'test-ref' である
  // TC-023: test-ref の description が 'Test Reference' を含む
  // TC-024: another-skill の agents が空配列である
  // TC-025: another-skill の references が空配列である
});
```

2. テストを実行して全件パスすることを確認する

**期待される成果物**:

- テストケース TC-020〜TC-025 の追加

---

### タスク3: ファイルシステム構造検証テストの追加

**目的**: フィクスチャのディレクトリ構造が正しいことを検証する

**実行手順**:

1. 以下のテストケースを追加する：

```typescript
describe("Directory Structure Validation", () => {
  // TC-026: __fixtures__/skills/ 配下に3つのディレクトリが存在する
  // TC-027: test-skill/ に agents/ と references/ サブディレクトリが存在する
  // TC-028: another-skill/ にサブディレクトリが存在しない
  // TC-029: invalid-skill/ に SKILL.md が存在しない
});
```

2. テストを実行して全件パスすることを確認する

**期待される成果物**:

- テストケース TC-026〜TC-029 の追加

---

## 参照資料

| 参照資料       | パス                                                         | 内容           |
| -------------- | ------------------------------------------------------------ | -------------- |
| Phase 4 テスト | `apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts` | 基本テスト     |
| Phase 5 実装   | `apps/desktop/src/__tests__/__fixtures__/skills/`            | フィクスチャ   |
| SkillScanner   | `apps/desktop/src/main/services/skill/SkillScanner.ts`       | パースロジック |

---

## 成果物

| 成果物     | パス                                                         | 内容             |
| ---------- | ------------------------------------------------------------ | ---------------- |
| テスト拡充 | `apps/desktop/src/__tests__/fixtures/skills.fixture.test.ts` | 追加テストケース |

---

## 統合テスト連携

テスト拡充により、SkillScanner のパース結果の詳細フィールド（name, description, allowed-tools, agents, references）が正確に検証される。

---

## 多角的チェック観点

| 観点           | 確認内容                                                 |
| -------------- | -------------------------------------------------------- |
| テスタビリティ | 追加テストが独立して実行可能で、既存テストに影響しないか |
| 保守性         | テストケースがフィクスチャ仕様変更時に追従しやすい構造か |
| 網羅性         | エッジケースや境界値が十分にカバーされているか           |

---

## 完了条件

- [ ] TC-015〜TC-019（YAML Frontmatter 詳細検証）が追加されている
- [ ] TC-020〜TC-025（サブリソース詳細検証）が追加されている
- [ ] TC-026〜TC-029（ディレクトリ構造検証）が追加されている
- [ ] 全テストケース（TC-001〜TC-029）がパスしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-07-coverage.md`
