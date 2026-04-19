# リファクタ後再テスト計画

## 実行コマンド

```bash
ESBUILD_BINARY_PATH=... vitest run --root packages/shared "src/services/embedding/__tests__/late-chunking"
```

## 確認ポイント

- [ ] 31テスト全件GREEN
- [ ] TypeScript型チェックPASS
- [ ] 既存テスト（pipeline/batch）に影響なし
