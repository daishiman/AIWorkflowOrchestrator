# テスト計画書: Custom Execution Environment UI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | AGENT-006                       |
| タスク名 | Custom Execution Environment UI |
| Phase    | 4                               |
| 作成日   | 2026-01-13                      |

---

## テスト戦略

### TDDアプローチ

本Phaseでは**Red-Green-Refactor**のRedフェーズとして、実装前に失敗するテストを作成する。

```
Phase 4 (Red)     : テスト作成 → 全テスト失敗
Phase 5 (Green)   : 実装 → テストパス
Phase 8 (Refactor): リファクタリング → テスト維持
```

### テストレベル

| レベル         | ツール       | 対象                   |
| -------------- | ------------ | ---------------------- |
| ユニットテスト | Vitest       | 関数、コンポーネント   |
| 統合テスト     | Vitest + RTL | コンポーネント連携     |
| セキュリティ   | Vitest + RTL | sandbox, CSP, sanitize |

---

## テスト対象一覧

### ユニットテスト

| テスト対象                 | ファイルパス                                                               | ケース数 | 優先度 |
| -------------------------- | -------------------------------------------------------------------------- | -------- | ------ |
| SplitLayout                | `components/organisms/SplitLayout/__tests__/index.test.tsx`                | 12       | 高     |
| EnvironmentSelector        | `components/molecules/EnvironmentSelector/__tests__/index.test.tsx`        | 11       | 中     |
| ExecutionEnvironment       | `components/organisms/ExecutionEnvironment/__tests__/index.test.tsx`       | 10       | 高     |
| HTMLPreviewEnvironment     | `components/organisms/HTMLPreviewEnvironment/__tests__/index.test.tsx`     | 30+      | 高     |
| MarkdownPreviewEnvironment | `components/organisms/MarkdownPreviewEnvironment/__tests__/index.test.tsx` | 15       | 中     |
| sanitizeHTML               | `utils/__tests__/sanitize.test.ts`                                         | 35+      | 高     |

### 統合テスト

| テスト対象         | ファイルパス                                        | ケース数 | 優先度 |
| ------------------ | --------------------------------------------------- | -------- | ------ |
| agentSlice Preview | `store/slices/__tests__/agentSlice.preview.test.ts` | 15       | 高     |

### セキュリティテスト

| テスト対象     | ファイルパス                                 | ケース数 | 優先度 |
| -------------- | -------------------------------------------- | -------- | ------ |
| iframe sandbox | `security/__tests__/iframe-sandbox.test.tsx` | 15       | 高     |
| CSP            | `security/__tests__/csp.test.tsx`            | 20       | 高     |

---

## テストカバレッジ目標

| メトリクス | 目標値 |
| ---------- | ------ |
| Line       | 80%    |
| Branch     | 60%    |
| Function   | 80%    |

### 重点カバレッジ領域

1. **セキュリティ関連**: 100%目標
   - sanitizeHTML関数
   - sandbox属性設定
   - CSP設定

2. **コアコンポーネント**: 80%以上
   - SplitLayout
   - HTMLPreviewEnvironment
   - ExecutionEnvironment

3. **状態管理**: 90%以上
   - agentSlice拡張部分

---

## テストケース詳細

### SplitLayout (12 cases)

```
レンダリング:
  - 左右のパネルが表示される
  - 右パネルを非表示にできる
  - ディバイダーが表示される

分割比率:
  - 初期比率が適用される
  - ドラッグで比率を変更できる
  - 最小比率を下回らない
  - 最大比率を超えない
  - デフォルトの比率は50

アクセシビリティ:
  - ディバイダーがフォーカス可能
  - キーボードで比率を調整できる（右矢印）
  - キーボードで比率を調整できる（左矢印）
  - aria属性が設定されている
```

### HTMLPreviewEnvironment (30+ cases)

```
レンダリング:
  - iframeが表示される
  - HTMLコンテンツがiframe内に表示される
  - 空のコンテンツでもエラーにならない

セキュリティ - sandbox:
  - sandbox属性が設定される
  - デフォルトでallow-same-originのみ許可
  - allow-scriptsが含まれていない
  - allow-popupsが含まれていない
  - allow-top-navigationが含まれていない

セキュリティ - CSP:
  - CSP meta tagがiframe内に含まれる
  - script-src 'none'が設定される
  - connect-src 'none'が設定される
  - form-action 'none'が設定される

セキュリティ - HTMLサニタイズ:
  - scriptタグが除去される
  - onerror属性が除去される
  - onload属性が除去される
  - onclick属性が除去される
  - javascript: URLが除去される
  - iframeタグが除去される
  - objectタグが除去される
  - embedタグが除去される
  - formタグが除去される

安全なHTMLの保持:
  - 通常のHTMLタグは保持される
  - style属性は保持される
  - class属性は保持される
  - img src (https) は保持される
  - data: URL (image) は保持される
```

### sanitizeHTML (35+ cases)

```
危険なタグの除去:
  - script, iframe, object, embed, form, input, button, select, textarea

危険な属性の除去:
  - onerror, onload, onclick, onmouseover, onmouseout
  - onmousedown, onmouseup, onkeydown, onkeyup, onkeypress
  - onfocus, onblur, onchange, onsubmit, onreset, onselect

javascript: URL:
  - href, src, 大文字, 空白含み

data: URL:
  - text/html除去, image/png許可

安全なHTML保持:
  - 標準タグ, style, class, id, https, mailto
```

---

## 実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# ウォッチモード
pnpm --filter @repo/desktop test:watch

# カバレッジ付き
pnpm --filter @repo/desktop test:coverage

# 特定ファイル
pnpm --filter @repo/desktop test -- SplitLayout
pnpm --filter @repo/desktop test -- HTMLPreviewEnvironment
pnpm --filter @repo/desktop test -- sanitize
```

---

## Red状態の確認

Phase 4完了時点では、すべてのテストが失敗状態（Red）であることを確認する:

```bash
# テスト実行（すべて失敗することを確認）
pnpm --filter @repo/desktop test

# 期待される結果: すべてのテストがFAIL
# 理由: 実装がまだ存在しないため
```

---

## 作成されたテストファイル

### ソースディレクトリ

| カテゴリ    | ファイルパス                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Unit        | `apps/desktop/src/renderer/components/organisms/SplitLayout/__tests__/index.test.tsx`                |
| Unit        | `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/__tests__/index.test.tsx`     |
| Unit        | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/__tests__/index.test.tsx`       |
| Unit        | `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/__tests__/index.test.tsx` |
| Unit        | `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/__tests__/index.test.tsx`        |
| Unit        | `apps/desktop/src/renderer/utils/__tests__/sanitize.test.ts`                                         |
| Integration | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.preview.test.ts`                        |
| Security    | `apps/desktop/src/renderer/security/__tests__/iframe-sandbox.test.tsx`                               |
| Security    | `apps/desktop/src/renderer/security/__tests__/csp.test.tsx`                                          |

---

## 完了確認

- [x] SplitLayoutテストが作成されている
- [x] EnvironmentSelectorテストが作成されている
- [x] ExecutionEnvironmentテストが作成されている
- [x] HTMLPreviewEnvironmentテストが作成されている
- [x] MarkdownPreviewEnvironmentテストが作成されている
- [x] sanitizeHTMLテストが作成されている
- [x] agentSlice拡張テストが作成されている
- [x] セキュリティテスト（sandbox）が作成されている
- [x] セキュリティテスト（CSP）が作成されている
- [x] テスト計画書が作成されている
- [x] すべてのテストがRed状態（失敗）である
