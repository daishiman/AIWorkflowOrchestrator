# Phase 8: リファクタリング - クエリ分類器

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 8                              |
| タスクID     | CONV-07-01                     |
| Phase名      | リファクタリング               |
| 前提Phase    | Phase 7 (テストカバレッジ確認) |
| 次Phase      | Phase 9 (品質保証)             |
| 推定作業時間 | 2時間                          |
| ステータス   | 未着手                         |

---

## 目的

TDD（テスト駆動開発）のRefactor段階として、テストを維持しながらコードの品質を改善する。可読性・保守性・拡張性の向上を図る。

---

## リファクタリング観点

### 1. コード品質

| 観点             | チェック項目                    |
| ---------------- | ------------------------------- |
| 重複コード       | 共通ロジックの抽出・共有        |
| 関数の長さ       | 単一責務原則に基づく分割        |
| 命名             | 意図が明確な命名への変更        |
| コメント         | JSDocの充実、不要コメントの削除 |
| マジックナンバー | 定数化・設定化                  |

### 2. 設計品質

| 観点                 | チェック項目              |
| -------------------- | ------------------------- |
| インターフェース設計 | 過不足のないメソッド定義  |
| 依存関係             | 適切な依存性注入          |
| エラーハンドリング   | 一貫したResult型の使用    |
| 型安全性             | any型の排除、厳密な型定義 |

---

## リファクタリング項目

### 1. 定数の抽出

```typescript
// packages/shared/src/services/search/constants.ts

/**
 * クエリタイプ別の検索重み
 */
export const SEARCH_WEIGHTS_BY_TYPE = {
  local: { keyword: 0.35, semantic: 0.35, graph: 0.3 },
  global: { keyword: 0.2, semantic: 0.3, graph: 0.5 },
  relationship: { keyword: 0.2, semantic: 0.2, graph: 0.6 },
  hybrid: { keyword: 0.33, semantic: 0.33, graph: 0.34 },
} as const;

/**
 * 信頼度閾値
 */
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
} as const;

/**
 * ルールベースの分類信頼度
 */
export const RULE_BASED_CONFIDENCE = {
  GLOBAL: 0.8,
  RELATIONSHIP: 0.8,
  LOCAL: 0.7,
} as const;
```

### 2. 共通ロジックの抽出

```typescript
// packages/shared/src/services/search/utils.ts

/**
 * 助詞・ストップワードセット
 */
export const STOP_WORDS = new Set([
  // 日本語
  "は",
  "が",
  "を",
  "に",
  "の",
  "と",
  "で",
  "も",
  "や",
  "か",
  "て",
  "だ",
  "です",
  "ます",
  "する",
  "ある",
  "いる",
  "について",
  // 英語
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "what",
  "how",
  "why",
]);

/**
 * クエリからキーワードを抽出
 */
export function extractKeywords(query: string): string[] {
  return query
    .split(/[\s、,。.?！!？]+/)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word.toLowerCase()));
}

/**
 * 引用符内のエンティティを抽出
 */
export function extractQuotedEntities(query: string): string[] {
  const patterns = [
    /"([^"]+)"/g,
    /'([^']+)'/g,
    /「([^」]+)」/g,
    /『([^』]+)』/g,
  ];

  const entities = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(query)) !== null) {
      entities.add(match[1]);
    }
  }
  return Array.from(entities);
}

/**
 * 大文字で始まる単語（固有名詞候補）を抽出
 */
export function extractProperNouns(query: string): string[] {
  const pattern = /\b([A-Z][a-zA-Z]+)\b/g;
  const entities = new Set<string>();
  let match;
  while ((match = pattern.exec(query)) !== null) {
    entities.add(match[1]);
  }
  return Array.from(entities);
}
```

### 3. 分類器の共通基底クラス

```typescript
// packages/shared/src/services/search/base-query-classifier.ts

import type { QueryType, SearchWeights } from "./types";
import { SEARCH_WEIGHTS_BY_TYPE } from "./constants";

/**
 * 分類器の共通基底クラス
 */
export abstract class BaseQueryClassifier {
  /**
   * クエリタイプに応じた検索重みを取得
   *
   * 全ての分類器で共通の実装を使用する
   */
  getSearchWeights(type: QueryType): SearchWeights {
    return SEARCH_WEIGHTS_BY_TYPE[type];
  }
}
```

### 4. パターン定義の分離

```typescript
// packages/shared/src/services/search/patterns.ts

/**
 * グローバルクエリパターン（日本語）
 */
export const GLOBAL_PATTERNS_JA: RegExp[] = [
  /全体(の|は)/,
  /概要/,
  /テーマ/,
  /主(な|要な)話題/,
  /何について/,
  /どんな内容/,
  /要約/,
  /まとめ/,
];

/**
 * グローバルクエリパターン（英語）
 */
export const GLOBAL_PATTERNS_EN: RegExp[] = [
  /overview/i,
  /summary/i,
  /what is this (about|document)/i,
  /main (topic|theme)/i,
];

/**
 * 関係性クエリパターン
 */
export const RELATIONSHIP_PATTERNS = [
  { pattern: /(.+)と(.+)の関係/, extractEntities: true },
  { pattern: /(.+)と(.+)の違い/, extractEntities: true },
  { pattern: /(.+)と(.+)の比較/, extractEntities: true },
  { pattern: /(.+)が(.+)に与える影響/, extractEntities: true },
  { pattern: /なぜ(.+)が(.+)/, extractEntities: true },
  { pattern: /(.+)はなぜ(.+)/, extractEntities: true },
  { pattern: /(.+)と(.+)はどう関連/, extractEntities: true },
  { pattern: /relationship between/i, extractEntities: false },
  { pattern: /difference between/i, extractEntities: false },
  { pattern: /compare (.+) (and|with) (.+)/i, extractEntities: true },
  { pattern: /how does (.+) (affect|impact) (.+)/i, extractEntities: true },
] as const;

/**
 * 関係ヒント検出パターン
 */
export const RELATION_HINT_PATTERNS = [
  { pattern: /違い|difference|compare/i, hint: "comparison" },
  { pattern: /関係|relationship|related/i, hint: "relationship" },
  { pattern: /影響|affect|impact/i, hint: "causation" },
  { pattern: /なぜ|why|reason/i, hint: "reason" },
] as const;
```

---

## リファクタリング後のテスト確認

```bash
# 全テスト実行
pnpm --filter @repo/shared test

# カバレッジ確認（リファクタリング後も基準維持）
pnpm --filter @repo/shared test:coverage

# 型チェック
pnpm --filter @repo/shared typecheck
```

---

## リファクタリングチェックリスト

| 項目                       | 完了 |
| -------------------------- | ---- |
| 定数の抽出（constants.ts） | [ ]  |
| ユーティリティ関数の抽出   | [ ]  |
| パターン定義の分離         | [ ]  |
| 共通基底クラスの作成       | [ ]  |
| JSDocコメントの充実        | [ ]  |
| 命名の改善                 | [ ]  |
| テストが全て通る           | [ ]  |
| カバレッジ基準を維持       | [ ]  |
| TypeScript型エラーなし     | [ ]  |
| ESLint警告なし             | [ ]  |

---

## システム仕様（aiworkflow-requirements）

> リファクタリング時に以下のシステム仕様との整合性を維持してください。

| 参照資料         | パス                                                                         | 確認内容       |
| ---------------- | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | パターン準拠   |
| コーディング規約 | `.claude/skills/aiworkflow-requirements/references/technology-core.md`       | コードスタイル |

---

## 成果物

| 成果物               | 配置先                                                         |
| -------------------- | -------------------------------------------------------------- |
| 定数ファイル         | `packages/shared/src/services/search/constants.ts`             |
| ユーティリティ       | `packages/shared/src/services/search/utils.ts`                 |
| パターン定義         | `packages/shared/src/services/search/patterns.ts`              |
| 基底クラス           | `packages/shared/src/services/search/base-query-classifier.ts` |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                           |

---

## 完了条件

- [ ] 定数が適切に抽出されている
- [ ] 共通ロジックがユーティリティに抽出されている
- [ ] パターン定義が分離されている
- [ ] JSDocコメントが充実している
- [ ] 全てのテストがパスしている
- [ ] カバレッジ基準を維持している
- [ ] TypeScript型エラーがない
- [ ] ESLint警告がない
- [ ] リファクタリング記録が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 9（品質保証）へ進み、静的解析・セキュリティ・パフォーマンスを検証する。
