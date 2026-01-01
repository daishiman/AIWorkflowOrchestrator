---
name: headless-ui-principles
description: |
  ヘッドレスUIアーキテクチャとスタイル非依存コンポーネント設計の専門知識。
  Radix UI、Headless UI、React Aria等のライブラリを活用した、
  アクセシビリティを確保しながら完全なスタイル制御を実現する手法。

  **Anchors:**
  - headless-ui-architecture（ヘッドレスUI設計の基本原則）
  - accessibility-wcag（アクセシビリティ実装）
  - component-composition（コンポーネント合成パターン）

  **Triggers:**
  - ヘッドレスUIコンポーネントを実装したい時
  - 完全なスタイル制御が必要な時
  - アクセシビリティを確保しながら再利用可能なコンポーネントを構築したい時
  - ライブラリの選択と導入を検討している時
  - WAI-ARIAパターンを実装する時
allowed-tools:
  - Read
  - Edit
  - Bash
  - Grep
version: 1.0.0
level: intermediate
last_updated: 2025-12-31
---

# ヘッドレスUI原則（Headless UI Principles）

## 概要

ヘッドレスUIは、ロジックとUIの表現を完全に分離するアーキテクチャパターンです。
Radix UI、Headless UI、React Ariaなどのライブラリを活用することで、
アクセシビリティ（WCAG準拠）を確保しながら、完全なスタイル制御を実現できます。

このスキルは、コンポーネント設計、ライブラリ選択、WAI-ARIAパターン実装における
ベストプラクティスと実装手法を習得することを目標としています。

## ワークフロー

### Phase 1: 要件分析と設計方針の決定

**目的**: ヘッドレスUI導入の適切性を判断し、アーキテクチャ方針を確定する

**アクション**:

1. **タスク要件の確認**
   - コンポーネントの機能要件を整理
   - アクセシビリティ要件（WCAG Level）の確認
   - スタイリング制御の必要範囲を把握

2. **ライブラリ選択の検討**
   - `references/library-comparison.md` でRadix UI、Headless UI、React Aria等を比較
   - 既存プロジェクトのエコシステムとの適合性を確認
   - パフォーマンス、バンドルサイズ等の制約を検討

3. **WAI-ARIAパターンの確認**
   - `references/aria-patterns.md` で必要なパターンを特定
   - 対象コンポーネントのロール、属性、状態遷移を整理

### Phase 2: コンポーネント実装とテスト

**目的**: ヘッドレスUI原則に従ってコンポーネントを実装する

**アクション**:

1. **コンポーネント設計**
   - `references/Level2_intermediate.md` でベストプラクティスを確認
   - ロジックとプレゼンテーションの分離設計を実施
   - `assets/headless-component-template.tsx` を参考に実装

2. **カスタムフックの開発**
   - `assets/headless-hook-template.ts` を参考に状態管理ロジックを抽出
   - フックの再利用性と単一責任を意識

3. **アクセシビリティ検証**
   - `scripts/check-a11y.mjs` でWCAG準拠状況を確認
   - キーボード操作、スクリーンリーダー対応を検証
   - `references/Level3_advanced.md` で高度なパターンを確認

### Phase 3: 検証、統合、記録

**目的**: 成果物の品質確保と実行記録の保存

**アクション**:

1. **スキル構造の検証**
   - `scripts/validate-skill.mjs` でコンポーネント実装が仕様に準拠しているか確認

2. **統合テスト**
   - 実装したコンポーネントが既存プロジェクトと正しく統合されるか確認
   - スタイリング、状態管理、イベントハンドリングの動作確認

3. **使用記録の保存**
   - `scripts/log_usage.mjs` を実行してこのスキル使用を記録
   - 今後の改善のため、実装時の知見をメモとして保存

## Task仕様ナビ

以下のテーブルは、一般的なヘッドレスUIタスクと対応するリソース、テンプレート、スクリプトを示しています。

| Task                     | 説明                                              | 関連リソース                                   | 使用テンプレート                  | 検証スクリプト       |
| ------------------------ | ------------------------------------------------- | ---------------------------------------------- | --------------------------------- | -------------------- |
| **ライブラリ選択**       | Radix UI vs Headless UI vs React Aria等の比較検討 | `library-comparison.md`                        | -                                 | `validate-skill.mjs` |
| **コンポーネント実装**   | ロジックとUI表現の分離設計                        | `Level2_intermediate.md`                       | `headless-component-template.tsx` | `check-a11y.mjs`     |
| **カスタムフック開発**   | 再利用可能な状態管理ロジックの抽出                | `Level3_advanced.md`                           | `headless-hook-template.ts`       | `validate-skill.mjs` |
| **アクセシビリティ実装** | WAI-ARIAパターンとキーボード操作対応              | `aria-patterns.md`                             | `headless-component-template.tsx` | `check-a11y.mjs`     |
| **デザインシステム構築** | 複数コンポーネントの統一的な実装方針              | `Level4_expert.md`, `headless-architecture.md` | `headless-component-template.tsx` | `validate-skill.mjs` |
| **レガシーコード理解**   | 旧実装との比較や移行戦略の検討                    | `legacy-skill.md`                              | -                                 | -                    |

## ベストプラクティス

### すべきこと

- **ロジックと表現の完全な分離**: コンポーネントロジック（状態、イベントハンドリング）をカスタムフックやコンテキストに抽出し、プレゼンテーション層と完全に分離する
- **WAI-ARIAパターンの準拠**: コンポーネントの用途に応じた適切なロール、属性、ステート属性を設定し、WCAG 2.1 Level AAの達成を目指す
- **カスタムデザインシステムの構築**: 複数のプロジェクト、チーム間で再利用可能な統一的なコンポーネント基盤を構築する
- **完全なスタイル制御**: Tailwind CSS、CSS Modules、CSS-in-JSなど、プロジェクト固有のスタイリング戦略を自由に選択・実装できる
- **再利用可能なロジックの抽出**: ビジネスロジック（フォーム検証、ドロップダウン開閉等）を再利用可能なカスタムフックとして実装
- **アクセシビリティの継続的検証**: `check-a11y.mjs` でWCAG準拠状況を定期的に確認し、キーボード操作やスクリーンリーダー対応を保証

### 避けるべきこと

- **ライブラリ固有の具体的なスタイルに依存**: Radix UIやHeadless UIのスタイル実装をそのまま使用するのではなく、必ず自分のスタイルシステムで上書きする
- **無検証な機能実装**: `aria-patterns.md` を確認せずにWAI-ARIAパターンを独自に実装することを避ける
- **アクセシビリティの後付け**: コンポーネント実装後にアクセシビリティを追加するのではなく、設計段階から組み込む
- **ボイラープレートコードの増加**: ロジックが複雑になりすぎないよう、テンプレートやパターンの再利用性を常に意識する
- **選定理由なしのライブラリ導入**: `library-comparison.md` での比較検討なく、流行だけでライブラリを選択することを避ける
- **パフォーマンス無視**: 不要なレンダリングやバンドルサイズの肥大化を防ぐため、メモ化やコード分割を適切に実装する

## リソース参照

このスキルは以下のリソースから構成されています。タスクに応じて必要なリソースを参照してください。

### 学習リソース（レベル別）

- **`references/Level1_basics.md`**: ヘッドレスUIの基本概念、設計パターン、初心者向けの実装方法
- **`references/Level2_intermediate.md`**: 実務的なコンポーネント実装、ライブラリ統合、状態管理パターン
- **`references/Level3_advanced.md`**: 複雑なインタラクション、パフォーマンス最適化、カスタムパターン設計
- **`references/Level4_expert.md`**: デザインシステム全体設計、フレームワーク比較、大規模プロジェクトへの応用

### 専門リソース

- **`references/aria-patterns.md`**: WAI-ARIAロール、属性、ステート属性の詳細解説とベストプラクティス
- **`references/headless-architecture.md`**: ヘッドレスUIのアーキテクチャ詳細、ロジック分離パターン、実装戦略
- **`references/library-comparison.md`**: Radix UI、Headless UI、React Aria、Downshift、Ariakitの特徴比較と選択ガイド
- **`references/legacy-skill.md`**: 旧SKILL.mdの全文（参考・履歴用）

### テンプレート

- **`assets/headless-component-template.tsx`**: ロジック分離されたコンポーネント実装テンプレート
- **`assets/headless-hook-template.ts`**: カスタムフック実装テンプレート（状態管理ロジック用）

### ツール・スクリプト

- **`scripts/check-a11y.mjs`**: WCAG準拠状況とアクセシビリティを検証するスクリプト
- **`scripts/validate-skill.mjs`**: コンポーネント実装がスキル仕様に準拠しているか検証
- **`scripts/log_usage.mjs`**: スキル使用の記録と自動評価を行うスクリプト

### 参考文献

- **『Don't Make Me Think』** (Steve Krug): ユーザビリティと情報設計の基本書
- 公式ドキュメント: [Radix UI](https://www.radix-ui.com), [Headless UI](https://headlessui.com), [React Aria](https://react-spectrum.adobe.com/react-aria/)
- WCAG 2.1: [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## コマンドリファレンス

開発時によく使用するコマンド：

```bash
# リソースの読み取り
cat .claude/skills/headless-ui-principles/references/Level1_basics.md
cat .claude/skills/headless-ui-principles/references/library-comparison.md
cat .claude/skills/headless-ui-principles/references/aria-patterns.md

# スクリプト実行
node .claude/skills/headless-ui-principles/scripts/check-a11y.mjs
node .claude/skills/headless-ui-principles/scripts/validate-skill.mjs
node .claude/skills/headless-ui-principles/scripts/log_usage.mjs

# テンプレート参照
cat .claude/skills/headless-ui-principles/assets/headless-component-template.tsx
```

## 変更履歴

| Version | Date       | Changes                                                                                 |
| ------- | ---------- | --------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様への準拠、Trigger/Anchors追加、Task仕様ナビ、詳細ベストプラクティス追加 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                             |
