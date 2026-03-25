# アーキテクチャルール

> 正本: `aiworkflow-requirements/references/architecture-overview.md`, `architecture-monorepo.md`

## レイヤー依存方向

```
Renderer → Preload (contextBridge) → Main → External Services
```

- DO: 上位層から下位層への一方向依存を厳守
- DO: Renderer↔Main の通信は必ず IPC（Preload Bridge 経由）
- DON'T: レイヤーを逆方向に import しない
- DON'T: Renderer から Node.js API を直接使用しない

## モノレポ構造

| パッケージ        | 責務                        | 依存先         |
| ----------------- | --------------------------- | -------------- |
| `apps/desktop`    | Electron デスクトップアプリ | `@repo/shared` |
| `apps/web`        | Next.js Web アプリ          | `@repo/shared` |
| `apps/backend`    | バックエンドサーバー        | `@repo/shared` |
| `packages/shared` | 共有型定義・ユーティリティ  | なし（末端）   |

- DO: 共有コードは `packages/shared` に配置
- DON'T: `apps/` 間で直接 import しない（`packages/` 経由のみ）
- DON'T: 幽霊依存を作らない — `import` するなら自身の `package.json` に宣言
  → 失敗事例: [06-known-pitfalls.md#P8](./06-known-pitfalls.md)

## UI/UX デザイン哲学

### Apple Human Interface Guidelines 準拠

- **Clarity**: テキストは読みやすく、アイコンは明確、階層は一目で理解可能
- **Deference**: UI装飾を控え、コンテンツに主役を譲る
- **Depth**: レイヤーと自然なモーションで空間的な奥行きを表現

### カラーパレット（Apple HIG System Colors 準拠）

> 出典: [Apple Human Interface Guidelines — Color](https://developer.apple.com/design/human-interface-guidelines/color)

**ライトモード:**

| 用途               | Apple 名称                | 値                      |
| ------------------ | ------------------------- | ----------------------- |
| 背景               | systemBackground          | `#FFFFFF`               |
| セカンダリ背景     | secondarySystemBackground | `#F2F2F7`               |
| ターシャリ背景     | systemGray5               | `#E5E5EA`               |
| プライマリテキスト | label                     | `#000000`               |
| セカンダリテキスト | secondaryLabel            | `rgba(60, 60, 67, 0.6)` |
| アクセント         | systemBlue                | `#007AFF`               |
| 成功               | systemGreen               | `#34C759`               |
| エラー             | systemRed                 | `#FF3B30`               |
| 警告               | systemOrange              | `#FF9500`               |
| ボーダー           | opaqueSeparator           | `#C6C6C8`               |

**ダークモード:**

| 用途               | Apple 名称                | 値                         |
| ------------------ | ------------------------- | -------------------------- |
| 背景               | systemBackground          | `#000000`                  |
| セカンダリ背景     | secondarySystemBackground | `#1C1C1E`                  |
| ターシャリ背景     | tertiarySystemBackground  | `#2C2C2E`                  |
| プライマリテキスト | label                     | `#FFFFFF`                  |
| セカンダリテキスト | secondaryLabel            | `rgba(235, 235, 245, 0.6)` |
| アクセント         | systemBlue                | `#0A84FF`                  |
| 成功               | systemGreen               | `#30D158`                  |
| エラー             | systemRed                 | `#FF453A`                  |
| 警告               | systemOrange              | `#FF9F0A`                  |
| ボーダー           | opaqueSeparator           | `#38383A`                  |

- DON'T: 高彩度な色を大面積に使わない
- DON'T: ダークモード風の暗い背景をデフォルトにしない
- DO: ライト/ダーク両モードで Apple 公式のシステムカラーを使用する
- DON'T: Tailwind Slate（青みがかった灰色）を light/dark テーマに使用しない — Apple の中性灰を使う

### ビジュアルスタイル

- DO: 8px グリッドでスペーシングを統一
- DO: 角丸は `8px` 〜 `12px` でコンポーネント間を統一
- DO: 影は繊細に（カード: `0 1px 3px rgba(0,0,0,0.04)`）
- DO: 十分な余白で呼吸感のあるレイアウト
- DO: システムフォント（`-apple-system`, `BlinkMacSystemFont`）を優先
- DON'T: 装飾的な要素でコンテンツを圧迫しない

### インタラクション

- DO: すべての操作にフィードバック（ホバー、アクティブ、フォーカス状態）
- DO: アニメーションは 200-300ms、目的を持ったものだけ
- DO: 破壊的操作は確認ダイアログで保護
- DON'T: 無意味な装飾アニメーションを追加しない

### アクセシビリティ（WCAG 2.1 AA）

- DO: コントラスト比 4.5:1 以上（通常テキスト）、3:1 以上（大テキスト / UI部品）
- DO: キーボード操作で全機能にアクセス可能
- DO: ARIA ラベルを適切に付与
- DON'T: 色だけで情報を伝えない（アイコンやテキストを併用）

## 設計原則

- **単一責務 (SRP)**: 1ファイル1責務
- **関心の分離 (SoC)**: UI / ビジネスロジック / データアクセスを分離
- **依存性逆転 (DIP)**: 具象ではなく抽象に依存
- **Feature Cohesion**: 関連ファイルを近い場所に配置
- **Atomic Design**: atoms → molecules → organisms でコンポーネントを構成
