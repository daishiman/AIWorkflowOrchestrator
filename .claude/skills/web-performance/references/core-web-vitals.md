# Core Web Vitals

## 概要

Core Web Vitalsは、Googleが定義するWebページの品質指標。
ユーザー体験の3つの側面（読み込み、インタラクティブ性、視覚的安定性）を測定する。

## メトリクス定義

### LCP (Largest Contentful Paint)

**測定対象**: ビューポート内の最大コンテンツ要素の描画時間

| 評価     | 閾値    |
| -------- | ------- |
| 良好     | ≤ 2.5秒 |
| 改善必要 | ≤ 4.0秒 |
| 不良     | > 4.0秒 |

**対象要素**:

- `<img>` 要素
- `<video>` のポスター画像
- `url()` で読み込まれる背景画像
- テキストブロック

**改善アプローチ**:

1. LCP要素にpriority属性を付与
2. サーバーレスポンス時間の短縮
3. レンダリングブロックリソースの除去
4. 画像の最適化（WebP/AVIF）

### FID (First Input Delay) / INP

**測定対象**: ユーザーの最初の操作から応答までの遅延

| 評価     | 閾値 (FID) | 閾値 (INP) |
| -------- | ---------- | ---------- |
| 良好     | ≤ 100ms    | ≤ 200ms    |
| 改善必要 | ≤ 300ms    | ≤ 500ms    |
| 不良     | > 300ms    | > 500ms    |

**改善アプローチ**:

1. 長いJavaScriptタスクの分割
2. 不要なJavaScriptの削除
3. コード分割と動的インポート
4. Web Workerへのオフロード

### CLS (Cumulative Layout Shift)

**測定対象**: ページ読み込み中のレイアウトシフト累積値

| 評価     | 閾値   |
| -------- | ------ |
| 良好     | ≤ 0.1  |
| 改善必要 | ≤ 0.25 |
| 不良     | > 0.25 |

**主な原因**:

- サイズ未指定の画像
- 動的に挿入されるコンテンツ
- Webフォントによるフラッシュ（FOUT/FOIT）
- 非同期読み込みの広告

**改善アプローチ**:

1. 画像にwidth/height属性を指定
2. aspect-ratioでスペースを予約
3. next/fontでフォントを最適化
4. スケルトンUIでプレースホルダーを表示

## 測定方法

### Lighthouse

```bash
# CLIでの実行
npx lighthouse https://example.com --output=json --output-path=./report.json

# Chrome DevTools
# Lighthouse タブ → Generate report
```

### PageSpeed Insights

```
https://pagespeed.web.dev/
```

### web-vitals ライブラリ

```typescript
import { onLCP, onFID, onCLS } from "web-vitals";

onLCP(console.log);
onFID(console.log);
onCLS(console.log);
```

## Next.js固有の考慮事項

### App Router

- Server Componentsで初期HTMLを高速化
- Streamingでプログレッシブレンダリング
- 自動的なコード分割

### Image Optimization

- next/imageで自動最適化
- priority属性でLCP画像を優先
- placeholder="blur"でCLS防止

### Font Optimization

- next/fontでフォント最適化
- display: 'swap'でFOUT対策
- サブセット化でファイルサイズ削減
