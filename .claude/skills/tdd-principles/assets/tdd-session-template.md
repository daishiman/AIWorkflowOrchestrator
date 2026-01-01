# TDDセッションテンプレート

## セッション情報

- **日付**: {{DATE}}
- **対象機能**: {{FEATURE_NAME}}
- **目標**: {{GOAL}}

---

## Phase 1: テスト対象の理解

### 機能仕様

```markdown
【機能概要】
{{FEATURE_DESCRIPTION}}

【入力】

- {{INPUT_1}}
- {{INPUT_2}}

【出力】

- {{OUTPUT_1}}
- {{OUTPUT_2}}

【制約】

- {{CONSTRAINT_1}}
- {{CONSTRAINT_2}}
```

### テストケース一覧

| #   | ケース             | 入力      | 期待結果     | 優先度 |
| --- | ------------------ | --------- | ------------ | ------ |
| 1   | 正常系: {{CASE_1}} | {{INPUT}} | {{EXPECTED}} | High   |
| 2   | 境界値: {{CASE_2}} | {{INPUT}} | {{EXPECTED}} | High   |
| 3   | 異常系: {{CASE_3}} | {{INPUT}} | {{EXPECTED}} | Medium |
| 4   | エッジ: {{CASE_4}} | {{INPUT}} | {{EXPECTED}} | Low    |

---

## Phase 2: TDDサイクル実行

### サイクル 1

#### Red: 失敗するテスト

```typescript
// テストコード
describe("{{TEST_SUBJECT}}", () => {
  it("should {{EXPECTED_BEHAVIOR}}", () => {
    // Arrange
    // Act
    // Assert
  });
});
```

**実行結果**: ❌ 失敗
**エラーメッセージ**: {{ERROR_MESSAGE}}

#### Green: 最小実装

```typescript
// 実装コード（最小限）
```

**実行結果**: ✅ 成功

#### Refactor: 改善

**変更内容**:

- [ ] {{REFACTOR_1}}
- [ ] {{REFACTOR_2}}

**実行結果**: ✅ 成功（リファクタリング後も）

---

### サイクル 2

#### Red: 次のテスト

```typescript
it("should {{NEXT_BEHAVIOR}}", () => {
  // テストコード
});
```

#### Green: 実装追加

```typescript
// 追加実装
```

#### Refactor: 改善

**変更内容**:

- [ ] {{REFACTOR_ITEM}}

---

## Phase 3: 完了チェック

### TDD準拠チェックリスト

- [ ] すべてのテストが実装前に書かれた
- [ ] 各テストは最初に失敗した（Red）
- [ ] テストを通す最小限の実装を行った（Green）
- [ ] リファクタリング後もテストは成功（Refactor）
- [ ] 1テスト1振る舞いを守った

### テスト品質チェックリスト

- [ ] テスト名が説明的（should + 動詞）
- [ ] テストは独立して実行可能
- [ ] モックは必要最小限
- [ ] 境界値テストを含む
- [ ] 異常系テストを含む

### カバレッジ

- 行カバレッジ: {{LINE_COVERAGE}}%
- 分岐カバレッジ: {{BRANCH_COVERAGE}}%
- 関数カバレッジ: {{FUNCTION_COVERAGE}}%

---

## Phase 4: 振り返り

### うまくいったこと

1. {{GOOD_1}}
2. {{GOOD_2}}

### 改善点

1. {{IMPROVE_1}}
2. {{IMPROVE_2}}

### 次回への教訓

1. {{LESSON_1}}
2. {{LESSON_2}}

---

## 成果物

- [ ] テストファイル: `{{TEST_FILE_PATH}}`
- [ ] 実装ファイル: `{{IMPL_FILE_PATH}}`
- [ ] カバレッジレポート: `{{COVERAGE_PATH}}`
