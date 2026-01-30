# 互換性影響分析レポート - TASK-3-2-F Phase 2

## 影響範囲分析

### 1. vitest.config.ts の environment 変更

| 変更                  | 影響範囲                 | 対応                                                                                    |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------- |
| `happy-dom` → `jsdom` | デフォルトテスト環境変更 | 17ファイルは `@vitest-environment happy-dom` ディレクティブで個別指定済みのため影響なし |

### 2. SkillStreamDisplay テストファイル（4ファイル）

各ファイルが `@vitest-environment happy-dom` ディレクティブを持っているため、vitest.config.tsの変更だけでは不十分。ファイル内ディレクティブも変更する必要がある。

| ファイル                                     | ディレクティブ変更    | 追加修正                          |
| -------------------------------------------- | --------------------- | --------------------------------- |
| SkillStreamDisplay.test.tsx                  | `happy-dom` → `jsdom` | describe.skip → describe（3箇所） |
| SkillStreamDisplay.i18n.test.tsx             | `happy-dom` → `jsdom` | describe.skip → describe（1箇所） |
| SkillStreamDisplay.i18n.integration.test.tsx | `happy-dom` → `jsdom` | describe.skip → describe（1箇所） |
| SkillStreamDisplay.permission.test.tsx       | `happy-dom` → `jsdom` | なし                              |

### 3. 他テストファイルへの影響

以下の13ファイルは `@vitest-environment happy-dom` を持つため、影響なし:

- formatTime.test.ts
- useSlideProject.test.ts
- usePageVisibility.test.ts
- useSkillPermission.test.ts
- useCopyHistory.test.tsx
- useInterval.test.ts
- CopyHistoryContext.test.tsx
- TimestampContext.test.tsx
- WorkspaceSidebar.test.tsx
- WorkspaceSearchPanel.test.tsx
- UnifiedSearchPanel.test.tsx
- StreamingMessage.test.tsx
- CopyHistoryPanel.test.tsx

### 4. setup.ts の変更影響

| 変更内容                          | 影響範囲 | リスク                                                    |
| --------------------------------- | -------- | --------------------------------------------------------- |
| Clipboard APIグローバルモック追加 | 全テスト | 低（navigator.clipboardが未定義の場合のみ設定。条件付き） |

## 修正が必要なファイル一覧

| ファイル                                       | 修正内容                               | 優先度 |
| ---------------------------------------------- | -------------------------------------- | ------ |
| `apps/desktop/vitest.config.ts`                | environment: jsdomに変更               | 必須   |
| `apps/desktop/src/test/setup.ts`               | Clipboard APIモック追加                | 必須   |
| `SkillStreamDisplay.test.tsx`                  | ディレクティブ変更 + describe.skip解消 | 必須   |
| `SkillStreamDisplay.i18n.test.tsx`             | ディレクティブ変更 + describe.skip解消 | 必須   |
| `SkillStreamDisplay.i18n.integration.test.tsx` | ディレクティブ変更 + describe.skip解消 | 必須   |
| `SkillStreamDisplay.permission.test.tsx`       | ディレクティブ変更                     | 必須   |

## パフォーマンスベンチマーク計画

### ベースライン計測

変更前（happy-dom環境）での実行時間を記録する:

```bash
time pnpm --filter @repo/desktop exec vitest run --reporter=verbose 2>&1 | tail -5
```

### 許容範囲

| 指標             | ベースライン        | 許容上限（+20%）   |
| ---------------- | ------------------- | ------------------ |
| 全テスト実行時間 | Phase 5実装前に計測 | ベースライン × 1.2 |

### 測定方法

- テスト実行を3回実施し、中央値を採用する
- 環境変更前後で同一条件（CPU負荷、メモリ状況）で計測する

## リスク評価

| リスク                       | 発生確率 | 影響度 | 軽減策                                              |
| ---------------------------- | -------- | ------ | --------------------------------------------------- |
| jsdomでの他テスト失敗        | 低       | 中     | ディレクティブ個別指定により回避済み                |
| パフォーマンス劣化（+20%超） | 低       | 中     | jsdomは成熟したライブラリで最適化済み               |
| Clipboard APIモック競合      | 低       | 低     | 条件付きグローバルモック + テスト内個別モックで対応 |
| act()警告残存                | 低       | 低     | jsdom環境ではReact concurrent modeに対応            |
