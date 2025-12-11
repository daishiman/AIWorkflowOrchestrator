# テストケース設計テンプレート

## 対象機能

- **機能名**: {{FUNCTION_NAME}}
- **説明**: {{DESCRIPTION}}
- **入力**: {{INPUT_PARAMETERS}}
- **出力**: {{OUTPUT}}

---

## 1. 入力パラメータの分析

### パラメータ一覧

| パラメータ  | 型       | 範囲/制約      | 必須   |
| ----------- | -------- | -------------- | ------ |
| {{PARAM_1}} | {{TYPE}} | {{CONSTRAINT}} | Yes/No |
| {{PARAM_2}} | {{TYPE}} | {{CONSTRAINT}} | Yes/No |

---

## 2. 同値クラスの定義

### パラメータ: {{PARAM_1}}

#### 有効同値クラス

| ID  | クラス         | 値の範囲  | 代表値    |
| --- | -------------- | --------- | --------- |
| VE1 | {{CLASS_NAME}} | {{RANGE}} | {{VALUE}} |
| VE2 | {{CLASS_NAME}} | {{RANGE}} | {{VALUE}} |

#### 無効同値クラス

| ID  | クラス         | 値の範囲  | 代表値    |
| --- | -------------- | --------- | --------- |
| IE1 | {{CLASS_NAME}} | {{RANGE}} | {{VALUE}} |
| IE2 | {{CLASS_NAME}} | {{RANGE}} | {{VALUE}} |

---

## 3. 境界値の特定

### パラメータ: {{PARAM_1}}

| 境界   | 値        | 期待結果 | 理由     |
| ------ | --------- | -------- | -------- |
| 下限-1 | {{VALUE}} | 無効     | 範囲外   |
| 下限   | {{VALUE}} | 有効     | 境界上   |
| 下限+1 | {{VALUE}} | 有効     | 境界付近 |
| 上限-1 | {{VALUE}} | 有効     | 境界付近 |
| 上限   | {{VALUE}} | 有効     | 境界上   |
| 上限+1 | {{VALUE}} | 無効     | 範囲外   |

---

## 4. エッジケースの特定

| ケース    | 値          | 期待結果     | 備考 |
| --------- | ----------- | ------------ | ---- |
| null      | `null`      | {{EXPECTED}} |      |
| undefined | `undefined` | {{EXPECTED}} |      |
| 空        | `""` / `[]` | {{EXPECTED}} |      |
| 特殊文字  | {{VALUE}}   | {{EXPECTED}} |      |

---

## 5. テストケース一覧

### 正常系

| ID   | 説明     | 入力      | 期待結果     | 優先度 |
| ---- | -------- | --------- | ------------ | ------ |
| TC01 | {{DESC}} | {{INPUT}} | {{EXPECTED}} | High   |
| TC02 | {{DESC}} | {{INPUT}} | {{EXPECTED}} | High   |

### 境界値

| ID   | 説明   | 入力      | 期待結果     | 優先度 |
| ---- | ------ | --------- | ------------ | ------ |
| TC10 | 下限値 | {{INPUT}} | {{EXPECTED}} | High   |
| TC11 | 上限値 | {{INPUT}} | {{EXPECTED}} | High   |

### 異常系

| ID   | 説明         | 入力      | 期待結果 | 優先度 |
| ---- | ------------ | --------- | -------- | ------ |
| TC20 | 範囲外（下） | {{INPUT}} | エラー   | High   |
| TC21 | 範囲外（上） | {{INPUT}} | エラー   | High   |
| TC22 | null入力     | `null`    | エラー   | Medium |

### エッジケース

| ID   | 説明   | 入力      | 期待結果     | 優先度 |
| ---- | ------ | --------- | ------------ | ------ |
| TC30 | 空入力 | {{INPUT}} | {{EXPECTED}} | Medium |
| TC31 | 特殊値 | {{INPUT}} | {{EXPECTED}} | Low    |

---

## 6. 組み合わせテスト（該当する場合）

### パラメータの組み合わせ

```
パラメータA × パラメータB

     | B1 | B2 | B3 |
-----|----|----|----|
  A1 | ✓  | ✓  |    |
  A2 | ✓  |    | ✓  |
  A3 |    | ✓  | ✓  |
```

| ID   | A   | B   | 期待結果     |
| ---- | --- | --- | ------------ |
| TC40 | A1  | B1  | {{EXPECTED}} |
| TC41 | A1  | B2  | {{EXPECTED}} |

---

## 7. 実装

```typescript
import { describe, it, expect } from 'vitest';

describe('{{FUNCTION_NAME}}', () => {
  describe('正常系', () => {
    it.each([
      { input: {{INPUT}}, expected: {{EXPECTED}}, desc: '{{DESC}}' },
    ])('should $desc', ({ input, expected }) => {
      expect({{FUNCTION_NAME}}(input)).toBe(expected);
    });
  });

  describe('境界値', () => {
    it.each([
      { input: {{MIN}}, expected: {{EXPECTED}}, desc: '下限値' },
      { input: {{MAX}}, expected: {{EXPECTED}}, desc: '上限値' },
    ])('should handle $desc', ({ input, expected }) => {
      expect({{FUNCTION_NAME}}(input)).toBe(expected);
    });
  });

  describe('異常系', () => {
    it.each([
      { input: {{INVALID}}, desc: '{{DESC}}' },
    ])('should reject $desc', ({ input }) => {
      expect(() => {{FUNCTION_NAME}}(input)).toThrow();
    });
  });
});
```

---

## 8. チェックリスト

### 完了確認

- [ ] すべての有効同値クラスをテストしたか？
- [ ] すべての無効同値クラスをテストしたか？
- [ ] すべての境界値をテストしたか？
- [ ] エッジケースをテストしたか？
- [ ] 組み合わせが必要な場合、適切な戦略を使用したか？

### 品質確認

- [ ] テストは独立しているか？
- [ ] テスト名は説明的か？
- [ ] 期待結果は明確か？
- [ ] 優先度は適切か？
