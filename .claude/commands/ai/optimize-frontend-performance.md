---
description: |
  Next.jsフロントエンドのパフォーマンス最適化を実行する専門コマンド。

  LCP、FID、CLS等のCore Web Vitalsを改善し、画像・フォント最適化、
  動的インポート、Code Splittingを適用します。

  🤖 起動エージェント:
  - `.claude/agents/router-dev.md`: Next.js App Router専門エージェント（Phase 2で起動）

  📚 利用可能スキル（router-devエージェントが必要時に参照）:
  **Phase 1（分析時）:** web-performance（必須）
  **Phase 2（最適化時）:** nextjs-app-router, server-components-patterns
  **Phase 3（検証時）:** web-performance（必須）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（対象ページパス、未指定時は全体最適化）
  - allowed-tools: エージェント起動と最小限の確認・ビルド検証用
    • Task: router-devエージェント起動用
    • Read: 既存コンポーネント・ページ確認用
    • Edit: 最適化コード適用用
    • Bash(pnpm run build): ビルド検証・バンドル分析用
  - model: sonnet（標準的なパフォーマンス最適化タスク）

  トリガーキーワード: performance, optimize, frontend, パフォーマンス, 最適化, LCP, Core Web Vitals
argument-hint: "[target-page]"
allowed-tools:
  - Task
  - Read
  - Edit
  - Bash(pnpm run build)
model: sonnet
---

# フロントエンドパフォーマンス最適化

## 目的

`.claude/agents/router-dev.md` エージェントを起動し、Next.jsアプリケーションのフロントエンドパフォーマンスを体系的に最適化します。

## エージェント起動フロー

### Phase 1: ターゲット確認と現状分析

```markdown
対象ページ: "$ARGUMENTS"

引数未指定の場合:
アプリケーション全体のパフォーマンス最適化を実行

引数指定の場合:
指定されたページパス（例: app/dashboard/page.tsx）のみ最適化
```

**現状分析:**
- 既存コンポーネント構造の確認
- 画像・フォント使用状況のチェック
- バンドルサイズの初期測定（`pnpm run build`実行）

### Phase 2: router-dev エージェント起動

Task ツールで `.claude/agents/router-dev.md` を起動:

```markdown
エージェント: .claude/agents/router-dev.md
対象: ${対象ページまたは全体}

依頼内容:
Phase 3（パフォーマンス最適化）のワークフローを実行:

1. **web-performanceスキル参照（必須）:**
   - `.claude/skills/web-performance/SKILL.md` を読み込み
   - 最適化戦略を理解

2. **測定と分析:**
   - バンドル分析スクリプト実行
   - ボトルネック特定
   - 優先順位決定

3. **最適化実装:**
   - 画像を next/image で最適化（priority設定含む）
   - フォントを next/font で最適化（display: swap設定）
   - 重いコンポーネントを動的インポート
   - Code Splitting適用（条件付きコンポーネント）
   - Streaming SSRとSuspense境界追加（必要に応じて）

4. **検証:**
   - ビルド再実行（`pnpm run build`）
   - バンドルサイズ比較
   - Core Web Vitals目標値チェック（LCP ≤2.5s、FID ≤100ms、CLS ≤0.1）

必須要件:
1. 画像には必ず next/image を使用、width/height指定必須
2. フォントには必ず next/font を使用、display: swap推奨
3. 動的インポートには loading fallback を設定
4. 最適化前後でビルド検証を実行
5. Core Web Vitals目標値への改善効果を確認
```

**期待成果物:**
- 最適化されたコンポーネント（next/image、next/font適用）
- 動的インポート実装（重いコンポーネント、条件付きUI）
- loading.tsx追加（非同期ページ）
- ビルドサイズ削減レポート
- Core Web Vitals改善レポート

### Phase 3: 最終検証と報告

- ビルドエラーがないことを確認
- バンドルサイズの改善率を計算
- Core Web Vitals目標値への到達度を報告
- 追加の推奨事項を提示（ISR、Prefetch等）

## 使用例

### 全体最適化

```bash
/ai:optimize-frontend-performance
```

→ アプリケーション全体のパフォーマンスを最適化

### 特定ページ最適化

```bash
/ai:optimize-frontend-performance app/dashboard/page.tsx
```

→ ダッシュボードページのみを最適化

## 最適化チェックリスト

router-devエージェントが以下を実行することを期待:

- [ ] **P0（必須最適化）:**
  - [ ] 画像に next/image 適用（width/height指定）
  - [ ] フォントに next/font 適用（display: swap）
  - [ ] LCP要素に priority 設定
  - [ ] バンドルサイズ分析実行

- [ ] **P1（推奨最適化）:**
  - [ ] 重いコンポーネントを動的インポート
  - [ ] loading.tsx で Streaming SSR 実装
  - [ ] 条件付きUIを Code Splitting
  - [ ] 画像に placeholder="blur" 設定（可能な場合）

- [ ] **P2（高度な最適化）:**
  - [ ] ISR設定（revalidate）の検討
  - [ ] Prefetch最適化の提案
  - [ ] Bundle分析による追加改善提案

## 参照

- エージェント: `.claude/agents/router-dev.md`
- スキル: `.claude/skills/web-performance/SKILL.md`
- リソース:
  - `.claude/skills/web-performance/resources/dynamic-import.md`
  - `.claude/skills/web-performance/resources/image-optimization.md`
  - `.claude/skills/web-performance/resources/font-optimization.md`
  - `.claude/skills/web-performance/resources/code-splitting.md`
