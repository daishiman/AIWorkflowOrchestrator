# Phase 2: テスト戦略

## テストファイル配置

```
apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

（既存ファイルに新規 describe ブロックを追加）

## private method テスト方針

`resolveSemanticLabel()` を `@repo/shared/types/skillWizard` からエクスポートするため、
直接テスト可能。TC-07（DI テスト）は直接 `resolveSemanticLabel` を呼び出して検証する。

`applySmartDefaults()` は `ConversationRoundStep.tsx` からエクスポートし、
TC-08〜TC-10 で直接呼び出して検証する。

## テストマトリクス

| TC番号 | テスト名                            | 対象                 | 検証方法                    |
| ------ | ----------------------------------- | -------------------- | --------------------------- |
| TC-01  | q1 "自分だけ" → "自分のみ"          | resolveSemanticLabel | 直接呼び出し                |
| TC-02  | q5 "slack" → "Slack"                | resolveSemanticLabel | 直接呼び出し                |
| TC-03  | q5 "github" → "GitHub"              | resolveSemanticLabel | 直接呼び出し                |
| TC-04  | undefined 入力 → undefined          | resolveSemanticLabel | 直接呼び出し                |
| TC-05  | 未定義 questionId → フォールバック  | resolveSemanticLabel | 直接呼び出し                |
| TC-06  | 未定義 rawValue → フォールバック    | resolveSemanticLabel | 直接呼び出し                |
| TC-07  | カスタム labelMap DI                | resolveSemanticLabel | 直接呼び出し（カスタムmap） |
| TC-08  | applySmartDefaults 全フィールド変換 | applySmartDefaults   | 直接呼び出し                |
| TC-09  | inferSmartDefaults 返り値形式       | applySmartDefaults   | 直接呼び出し                |
| TC-10  | 回帰テスト（既存動作保持）          | applySmartDefaults   | 直接呼び出し                |
| TC-11  | 空文字列入力のハンドリング          | resolveSemanticLabel | 直接呼び出し                |
| TC-12  | SEMANTIC_LABEL_MAP import 確認      | import               | toBeDefined()               |
