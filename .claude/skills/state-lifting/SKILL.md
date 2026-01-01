---
name: state-lifting
description: |
  Reactにおける状態リフティングパターンの専門スキル。複数コンポーネント間での状態共有、親コンポーネントへの状態移動、props経由でのデータ伝播、Prop Drilling削減、Context API導入を提供します。

  Anchors:
  • React Documentation (Meta) / 適用: 状態管理・Lifting State Up / 目的: コンポーネント間データ共有設計
  • Thinking in React (React Docs) / 適用: 状態配置決定 / 目的: 最適な状態管理層の判断

  Trigger:
  Use when implementing state lifting between components, sharing state across sibling components, eliminating prop drilling, deciding state placement strategy, or introducing Context API for global state management.
  Keywords: state lifting, props drilling, context provider, component state sharing, react state management
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# State Lifting

## 概要

Reactにおける状態の持ち上げ（Lifting State Up）と状態配置戦略の専門スキル。複数のコンポーネント間で状態を共有する場合、親コンポーネントへ状態を移動させ、props経由で子コンポーネントに渡します。

このスキルは以下のシナリオで活用されます:

- **複数コンポーネント間での状態同期**: 兄弟コンポーネント間での状態共有
- **Prop Drilling削減**: 深いコンポーネント階層でのprops受け渡し削減
- **状態配置戦略**: 最適な状態管理層の決定
- **Context APIの導入**: グローバル状態の管理

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定
3. 現在のコンポーネント構造を分析

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 状態を持つべき親コンポーネントを決定
3. 状態と状態更新関数をpropsで渡す
4. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す
4. コンポーネント間の状態フローが正しく機能するか検証

## Task仕様ナビ

| Task ID | タスク名                   | 説明                                           | 対応レベル | リソース                    | テンプレート                   |
| ------- | -------------------------- | ---------------------------------------------- | ---------- | --------------------------- | ------------------------------ |
| SL-001  | 状態共有の要件分析         | 複数コンポーネント間で共有すべき状態を識別     | Level 1    | Level1_basics.md            | N/A                            |
| SL-002  | 親コンポーネントの決定     | 状態を持つべき最適な親コンポーネントを決定     | Level 1    | state-placement-guide.md    | N/A                            |
| SL-003  | Props経由の状態渡し        | 状態と更新関数をpropsで子に渡す実装            | Level 2    | Level2_intermediate.md      | compound-component-template.md |
| SL-004  | Prop Drilling削減          | 深いコンポーネント階層でのprops削減戦略        | Level 2    | prop-drilling-solutions.md  | context-provider-template.md   |
| SL-005  | Context APIの導入          | Context Providerを使ったグローバル状態管理     | Level 3    | context-patterns.md         | context-provider-template.md   |
| SL-006  | Colocation原則の適用       | 状態と状態を使用するコンポーネントの最適な配置 | Level 3    | colocation-principles.md    | N/A                            |
| SL-007  | 複合コンポーネントパターン | Compound Componentパターンを使った状態共有     | Level 3    | Level3_advanced.md          | compound-component-template.md |
| SL-008  | 状態構造の最適化           | 大規模アプリケーションの状態構造設計           | Level 4    | Level4_expert.md            | N/A                            |
| SL-009  | パフォーマンス最適化       | 不要な再レンダリングの防止                     | Level 4    | Level4_expert.md            | N/A                            |
| SL-010  | 状態構造の自動分析         | スクリプトを使った現在の状態構造分析           | Level 2    | analyze-state-structure.mjs | N/A                            |

## ベストプラクティス

### すべきこと

- **state-placement-guide.mdを参照**: 状態をどこに配置すべきかの指針を確認してから実装する
- **colocation原則を適用**: 状態と状態を使用するコンポーネントの距離を最小化する
- **型安全性を確保**: TypeScriptで状態とpropsの型を明確に定義する
- **Context APIの適切な使用**: Prop Drillingが深くなる場合はContext APIの導入を検討する
- **単一責任の原則**: 各コンポーネントが管理する状態を明確に分離する
- **パフォーマンスを考慮**: useCallbackやuseMemoで不要な再レンダリングを防ぐ
- **Level1_basics.mdを参照**: 基本的な概念と実装パターンを確認してから応用する
- **Level2_intermediate.mdを参照**: 実務的な手順と注意点を整理してから実装する

### 避けるべきこと

- **過度なProp Drilling**: 10階層以上のprops受け渡しは避け、Context APIを検討する
- **グローバル状態の過剰使用**: ローカル状態で十分な場合はグローバル状態を避ける
- **状態の過度な細分化**: 関連する状態を細分化しすぎず、適度にグループ化する
- **アンチパターンの見過ごし**: references/prop-drilling-solutions.mdの反例を確認する
- **状態構造の文書化なし**: 複雑な状態構造は必ずドキュメント化する
- **テストなしの実装**: 状態フローのテストなしに本番環境に進める
- **型定義なし**: JavaScriptで曖昧な型のまま実装することを避ける

## リソース参照

### レベル別ガイド

**基礎（Level 1）**: `references/Level1_basics.md`

- 状態リフティングの基本概念
- シンプルな親子コンポーネント間での状態共有
- propsを使った状態と状態更新関数の渡し方

**実務（Level 2）**: `references/Level2_intermediate.md`

- 複数の兄弟コンポーネント間での状態共有
- Prop Drillingの初期的な対策
- Context APIの基本的な使用方法

**応用（Level 3）**: `references/Level3_advanced.md`

- Compound Componentパターン
- 複雑な状態構造の設計
- カスタムhookによる状態ロジックの抽出

**専門（Level 4）**: `references/Level4_expert.md`

- 大規模アプリケーションの状態構造設計
- パフォーマンス最適化と再レンダリング戦略
- 複雑な状態管理パターン

### テーマ別リソース

**状態配置戦略**: `references/state-placement-guide.md`

- 状態をどこに配置すべきかの意思決定フレームワーク
- 異なるシナリオでの推奨パターン

**Prop Drillingの解決**: `references/prop-drilling-solutions.md`

- Prop Drillingの識別方法
- Context API、Compound Component、カスタムhookなどの解決策

**Context パターン**: `references/context-patterns.md`

- Context APIの効果的な使用パターン
- パフォーマンス最適化テクニック

**Colocation 原則**: `references/colocation-principles.md`

- 状態と状態を使用するコンポーネントの最適な距離
- アーキテクチャパターンへの応用

### スクリプト

**状態構造の分析**: `scripts/analyze-state-structure.mjs`

```bash
node .claude/skills/state-lifting/scripts/analyze-state-structure.mjs <target-directory>
```

現在のコンポーネント構造と状態フローを分析します。

**使用記録**: `scripts/log_usage.mjs`

```bash
node .claude/skills/state-lifting/scripts/log_usage.mjs --task <task-id> --result <result>
```

スキル使用の記録と自動評価を実行します。

**スキル検証**: `scripts/validate-skill.mjs`

```bash
node .claude/skills/state-lifting/scripts/validate-skill.mjs
```

スキル構造とリソースの整合性を検証します。

### テンプレート

**Compound Component**: `assets/compound-component-template.md`

- Compound Componentパターンの実装テンプレート
- 状態共有を効果的に行う設計パターン

**Context Provider**: `assets/context-provider-template.md`

- Context APIを使ったProvider実装テンプレート
- useContexthookの使用パターン

### 従来スキル

**旧SKILL.md**: `references/legacy-skill.md`
以前のバージョンの完全なドキュメント

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/state-lifting/references/Level1_basics.md
cat .claude/skills/state-lifting/references/Level2_intermediate.md
cat .claude/skills/state-lifting/references/Level3_advanced.md
cat .claude/skills/state-lifting/references/Level4_expert.md
cat .claude/skills/state-lifting/references/colocation-principles.md
cat .claude/skills/state-lifting/references/context-patterns.md
cat .claude/skills/state-lifting/references/legacy-skill.md
cat .claude/skills/state-lifting/references/prop-drilling-solutions.md
cat .claude/skills/state-lifting/references/state-placement-guide.md
```

### スクリプト実行

```bash
node .claude/skills/state-lifting/scripts/analyze-state-structure.mjs --help
node .claude/skills/state-lifting/scripts/log_usage.mjs --help
node .claude/skills/state-lifting/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/state-lifting/assets/compound-component-template.md
cat .claude/skills/state-lifting/assets/context-provider-template.md
```

## 変更履歴

| Version | Date       | Changes                                                       |
| ------- | ---------- | ------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に準拠: Anchors/Trigger追加、Task仕様ナビ追加 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                   |
