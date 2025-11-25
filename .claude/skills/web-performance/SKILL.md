---
name: web-performance
description: |
  Next.jsアプリケーションのパフォーマンス最適化を専門とするスキル。
  Core Web Vitals改善、バンドルサイズ最適化、画像/フォント最適化を実現します。

  専門分野:
  - 動的インポート: React.lazy、next/dynamic による遅延読み込み
  - 画像最適化: next/image、画像フォーマット、レスポンシブ画像
  - フォント最適化: next/font、フォントサブセット、表示戦略
  - Code Splitting: ルートベース、コンポーネントベース分割

  使用タイミング:
  - Core Web Vitals（LCP、FID、CLS）を改善する時
  - バンドルサイズを削減したい時
  - 画像やフォントの読み込みを最適化する時
  - 初期ロード時間を短縮したい時

  Use proactively when implementing performance optimizations,
  code splitting, or image/font optimization.
version: 1.0.0
---

# Web Performance

## 概要

このスキルは、Next.js App Routerにおけるパフォーマンス最適化の
ベストプラクティスを提供します。Core Web Vitalsの改善と
ユーザー体験の向上を実現します。

**核心哲学**:
- **Speed First**: 初期ロードの最小化とインタラクション最適化
- **Progressive Loading**: 必要な時に必要なものだけを読み込む
- **Measurable**: 測定可能な指標に基づく最適化

**主要な価値**:
- Core Web Vitals（LCP、FID、CLS）の改善
- バンドルサイズの最適化
- ユーザー体験の向上

## リソース構造

```
web-performance/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── dynamic-import.md                       # 動的インポートガイド
│   ├── image-optimization.md                   # 画像最適化ガイド
│   ├── font-optimization.md                    # フォント最適化ガイド
│   └── code-splitting.md                       # Code Splittingガイド
├── scripts/
│   └── analyze-bundle.mjs                      # バンドル分析スクリプト
└── templates/
    ├── dynamic-import-template.md              # 動的インポートテンプレート
    └── image-component-template.md             # 画像コンポーネントテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# 動的インポートガイド
cat .claude/skills/web-performance/resources/dynamic-import.md

# 画像最適化ガイド
cat .claude/skills/web-performance/resources/image-optimization.md

# フォント最適化ガイド
cat .claude/skills/web-performance/resources/font-optimization.md

# Code Splittingガイド
cat .claude/skills/web-performance/resources/code-splitting.md
```

### スクリプト実行

```bash
# バンドル分析
node .claude/skills/web-performance/scripts/analyze-bundle.mjs <build-output-dir>
```

### テンプレート参照

```bash
# 動的インポートテンプレート
cat .claude/skills/web-performance/templates/dynamic-import-template.md

# 画像コンポーネントテンプレート
cat .claude/skills/web-performance/templates/image-component-template.md
```

## いつ使うか

### シナリオ1: 初期ロード最適化
**状況**: ページの初期読み込みが遅い

**適用条件**:
- [ ] LCPが2.5秒を超えている
- [ ] バンドルサイズが大きい
- [ ] 不要なJavaScriptが初期ロードに含まれている

**期待される成果**: LCPの改善、TTFBの短縮

### シナリオ2: インタラクション最適化
**状況**: ユーザー操作への応答が遅い

**適用条件**:
- [ ] FID/INPが100msを超えている
- [ ] 重いコンポーネントがある
- [ ] サードパーティスクリプトが多い

**期待される成果**: インタラクション応答性の向上

### シナリオ3: 視覚的安定性
**状況**: ページ読み込み時にレイアウトがずれる

**適用条件**:
- [ ] CLSが0.1を超えている
- [ ] 画像サイズが未指定
- [ ] フォントがFOUTを引き起こしている

**期待される成果**: 視覚的安定性の向上

## 知識領域

### 領域1: 動的インポート

**next/dynamic**:
```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // クライアントのみ
})
```

**React.lazy（Client Components内）**:
```typescript
'use client'
import { lazy, Suspense } from 'react'

const LazyComponent = lazy(() => import('./LazyComponent'))
```

**詳細は**: `resources/dynamic-import.md` を参照

### 領域2: 画像最適化

**next/image**:
```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="説明"
  width={800}
  height={600}
  priority // LCP画像の場合
  placeholder="blur"
/>
```

**詳細は**: `resources/image-optimization.md` を参照

### 領域3: フォント最適化

**next/font**:
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
```

**詳細は**: `resources/font-optimization.md` を参照

### 領域4: Code Splitting

**ルートベース分割**（自動）:
- App Routerは各ルートを自動的に分割
- Layoutは共有、Pageは個別バンドル

**コンポーネントベース分割**:
- 条件付きコンポーネントをdynamic importで分割
- モーダル、ドロワー、タブコンテンツなど

**詳細は**: `resources/code-splitting.md` を参照

## ワークフロー

### Phase 1: 測定
1. Lighthouseでベースラインを測定
2. Core Web Vitalsを記録
3. バンドルサイズを分析

### Phase 2: 分析
1. ボトルネックを特定
2. 優先順位を決定
3. 改善計画を策定

### Phase 3: 最適化
1. 画像/フォント最適化
2. 動的インポート適用
3. Code Splitting実装

### Phase 4: 検証
1. Lighthouseで再測定
2. 改善効果を確認
3. 回帰テスト実施

### Phase 5: 監視
1. Real User Monitoring設定
2. パフォーマンスバジェット設定
3. 継続的な監視

## 設計原則

### 遅延読み込みの原則
Above the Fold（ファーストビュー）以外は遅延読み込みを検討する。

### 優先度の原則
LCP要素には`priority`を設定し、その他は遅延読み込みする。

### 測定の原則
最適化前後で必ず測定し、効果を検証する。

### 予算の原則
パフォーマンスバジェットを設定し、超過を監視する。

## Core Web Vitals目標値

| 指標 | 良好 | 改善が必要 | 不良 |
|------|------|-----------|------|
| LCP | ≤2.5s | ≤4.0s | >4.0s |
| FID | ≤100ms | ≤300ms | >300ms |
| INP | ≤200ms | ≤500ms | >500ms |
| CLS | ≤0.1 | ≤0.25 | >0.25 |

## 関連スキル

- `.claude/skills/nextjs-app-router/SKILL.md` - ルーティング構造
- `.claude/skills/server-components-patterns/SKILL.md` - データフェッチ最適化
- `.claude/skills/seo-optimization/SKILL.md` - SEO最適化

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
