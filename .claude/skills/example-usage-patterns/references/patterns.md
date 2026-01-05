# 実践パターン

## 言語別パターン

### JavaScript/TypeScript

**最小限の例:**

```javascript
const result = await fetchData();
console.log(result);
```

**エラーハンドリング付き:**

```javascript
try {
  const result = await fetchData();
  console.log(result);
} catch (error) {
  console.error("Failed:", error.message);
}
```

### Python

**最小限の例:**

```python
result = fetch_data()
print(result)
```

**エラーハンドリング付き:**

```python
try:
    result = fetch_data()
    print(result)
except Exception as e:
    print(f"Failed: {e}")
```

## 用途別パターン

### REST API

```javascript
// GET: リソース取得
const user = await fetch("/api/users/123").then((r) => r.json());

// POST: リソース作成
await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "John" }),
});
```

### CLI

```bash
# 基本使用
mytool --input file.txt

# オプション付き
mytool --input file.txt --output result.txt --verbose
```

### ライブラリ

```javascript
import { MyLib } from "mylib";

// インスタンス化
const lib = new MyLib({ option: "value" });

// メソッド呼び出し
const result = lib.process(data);
```

## アンチパターン

| パターン               | 問題                 | 解決策                   |
| ---------------------- | -------------------- | ------------------------ |
| 複雑すぎる最初の例     | 初心者が理解できない | 最小限から始める         |
| マジックナンバー       | 意味が不明           | 定数化または説明コメント |
| 非現実的なシナリオ     | 実用性がない         | 実際のユースケースを使用 |
| エラーハンドリング欠如 | 失敗時の対処法が不明 | try-catch追加            |
| 非推奨API使用          | 将来動作しなくなる   | 最新APIを使用            |
