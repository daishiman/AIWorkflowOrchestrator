---
description: |
  アクセシビリティ自動監査（axe-core + WCAG 2.1 AA）
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - WebSearch
argument-hint: [--scope page|component|all] [--wcag-level A|AA|AAA] [--fix-mode auto|manual]
model: sonnet
---

# アクセシビリティ自動監査コマンド

## 目的

axe-coreを使用してWCAG 2.1 AA準拠のアクセシビリティ自動監査を実行します。
違反箇所の特定と修正提案を提供します。

## 使用方法

```bash
/ai:run-accessibility-audit [--scope page|component|all]
```

### 引数

- `--scope` (オプション): 監査対象スコープ
  - `page`: ページ単位でのスキャン
  - `component`: コンポーネント単位でのスキャン
  - `all`: 全体スキャン（デフォルト）

## 実行フロー

### Phase 1: 環境確認

1. axe-core/playwright インストール確認
2. テスト対象の特定
3. 除外パターンの確認

### Phase 2: スキャン実行

**重要**: このフェーズでは、@frontend-tester エージェントが Playwright MCP を使用してブラウザ自動化を実行します。

```typescript
// tests/a11y/accessibility.test.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit', () => {
  test('home page should pass WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

### Phase 3: 結果分析

**違反レベル**:
- `critical`: 即座に修正必須（スクリーンリーダー使用不可等）
- `serious`: 重大な問題（コントラスト不足等）
- `moderate`: 中程度の問題
- `minor`: 軽微な問題

**チェック項目（WCAG 2.1 AA）**:
- 代替テキスト（alt属性）
- カラーコントラスト（4.5:1以上）
- キーボードナビゲーション
- フォーカス可視性
- ラベル関連付け
- 見出し階層
- ARIA属性の正確性

### Phase 4: レポート生成

```markdown
# アクセシビリティ監査レポート

## サマリー
- 総ページ数: X
- 違反数: Y
- 合格率: Z%

## 違反一覧

### Critical (0件)
なし

### Serious (2件)

#### 1. color-contrast
- **場所**: .button-secondary
- **問題**: テキストと背景のコントラスト比が3.5:1（要件: 4.5:1）
- **修正提案**: テキスト色を #333 → #1a1a1a に変更

#### 2. label
- **場所**: input#email
- **問題**: 関連付けられたラベルがない
- **修正提案**: <label for="email"> を追加
```

### Phase 5: 修正提案

違反に対する具体的な修正コードを提案。

## エージェント起動

Task ツールで `@frontend-tester` エージェントを起動し、以下を依頼:

コンテキスト:
- スコープ: "$ARGUMENTS" または "all"
- WCAGレベル: AA（デフォルト）
- 修正モード: manual（デフォルト）

@frontend-tester エージェントに以下を依頼:
- Phase 1: 環境確認とテスト対象特定
- Phase 2: axe-coreスキャン実行（**Playwright MCP 使用**）
- Phase 3: 結果分析と違反分類
- Phase 4: レポート生成
- Phase 5: 修正提案

**重要な実装方針**:
- @frontend-tester が **Playwright MCP** を使用してブラウザ自動化を実行
- axe-core の最新WCAG基準は **WebSearch** で確認
- 実ブラウザ検証により、キーボードナビゲーション・スクリーンリーダー互換性をテスト

期待される成果物:
- アクセシビリティ監査レポート（HTML, JSON, CSV）
- 違反修正コード提案（適用前レビュー必須）
- テストファイル（tests/a11y/accessibility.test.ts）
- CI/CD統合設定（.github/workflows/accessibility.yml）

品質基準:
- WCAG 2.1 AA完全準拠
- カラーコントラスト 4.5:1以上
- キーボードナビゲーション完全対応
- スクリーンリーダー互換性確認済み

## 成果物

### 1. 監査レポート
- `reports/accessibility/audit-{timestamp}.html` - ビジュアルレポート
- `reports/accessibility/audit-{timestamp}.json` - 機械可読形式
- `reports/accessibility/violations.csv` - 違反一覧（Excel互換）

### 2. 自動修正候補
- `reports/accessibility/fixes/` - 修正提案コード（適用前レビュー必須）

### 3. テストファイル
- `tests/a11y/accessibility.test.ts` - Playwright + axe-core テスト

### 4. CI/CD統合設定
- `.github/workflows/accessibility.yml` - 自動監査ワークフロー

## 使用例

```bash
# 全体スキャン
/ai:run-accessibility-audit

# ページ単位
/ai:run-accessibility-audit --scope page

# コンポーネント単位
/ai:run-accessibility-audit --scope component
```

## WCAG 2.1 AAチェックリスト

### 知覚可能（Perceivable）
- [ ] 画像に代替テキストがある
- [ ] 動画にキャプションがある
- [ ] コントラスト比が4.5:1以上

### 操作可能（Operable）
- [ ] キーボードのみで操作可能
- [ ] フォーカス可視
- [ ] タイムアウトに余裕がある

### 理解可能（Understandable）
- [ ] ページの言語が指定されている
- [ ] フォームにラベルがある
- [ ] エラーメッセージが明確

### 堅牢（Robust）
- [ ] HTMLが妥当
- [ ] ARIA属性が正確

## 参照

- `.claude/agents/frontend-tester.md`
- `.claude/skills/frontend-testing/SKILL.md`
- `.claude/skills/accessibility-wcag/SKILL.md`
