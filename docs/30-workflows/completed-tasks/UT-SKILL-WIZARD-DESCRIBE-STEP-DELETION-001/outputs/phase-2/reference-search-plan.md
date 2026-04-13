# 参照検索計画

## 実行コマンド

```bash
# 1. import 文での参照確認
grep -r "import.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"

# 2. export 文での再エクスポート確認
grep -r "export.*DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"

# 3. JSX 要素としての使用確認
grep -r "<DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"

# 4. wizard/index.ts の現状確認
grep -n "DescribeStep" apps/desktop/src/renderer/components/skill/wizard/index.ts
```

## Phase 1 での確認結果

- `wizard/index.ts`: エクスポート行 2 件（削除必要）
- `DescribeStep.test.tsx`: import 行 1 件（ファイルごと削除）
- その他：コメント・文字列のみ（変更不要）

## 削除後の期待

- `grep -r "import.*DescribeStep" apps/ packages/` → 出力なし
