---
name: state-management
description: |
  フロントエンドの状態管理戦略、ライブラリ選定、非同期状態設計、正規化と最適化を支援するスキル。
  状態のスコープ整理から実装・検証までを一貫して支援する。

  Anchors:
  • Learning React / 適用: Hooks基礎 / 目的: 状態分類と責務分離
  • Redux Essentials / 適用: Redux Toolkit運用 / 目的: 予測可能な状態管理
  • Vue 3 Composition API / 適用: Vue状態管理 / 目的: Composition API活用
  • Domain-Driven Design / 適用: 状態モデリング / 目的: ドメイン境界の整合

  Trigger:
  Use when selecting a state management approach, designing global/local state, handling async state, or optimizing state structure.
  state management, redux, zustand, context api, async state
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# state-management

## 概要

状態管理の要件整理からライブラリ選定、状態構造設計、検証までを体系化する。

---

## ワークフロー

### Phase 1: 状態要件の整理

**目的**: 状態の種類とスコープを整理する

**アクション**:

1. `references/foundations.md` で状態分類の基礎を確認する
2. 状態のスコープと更新頻度を整理する

**Task**: `agents/sm-001-requirements-analysis.md` を参照

### Phase 2: ライブラリ選定

**目的**: 要件に合致する状態管理ライブラリを選定する

**アクション**:

1. `references/library-selection.md` で比較軸を整理する
2. 学習コストと運用負荷を評価する

**Task**: `agents/sm-002-library-selection.md` を参照

### Phase 3: 状態構造とデータフロー設計

**目的**: 状態スキーマとデータフローを設計する

**アクション**:

1. `references/state-architecture.md` で正規化指針を確認する
2. `assets/state-structure-template.ts` を基に設計する
3. `assets/store-setup-template.ts` を参照して初期構成を作る

**Task**: `agents/sm-003-state-architecture.md` を参照

### Phase 4: 非同期状態と検証

**目的**: 非同期状態の設計と検証計画を確定する

**アクション**:

1. `references/async-state.md` で非同期パターンを整理する
2. `references/testing-debugging.md` でテスト方針を決める
3. `assets/async-state-template.ts` と `assets/state-test-template.ts` を適用する

**Task**: `agents/sm-004-validation-and-debugging.md` を参照

---

## Task仕様ナビ

| Task                            | 起動タイミング | 入力                     | 出力             |
| ------------------------------- | -------------- | ------------------------ | ---------------- |
| sm-001-requirements-analysis    | Phase 1開始時  | 機能一覧、状態の例       | 状態整理表       |
| sm-002-library-selection        | Phase 2開始時  | 状態整理表、技術スタック | 選定レポート     |
| sm-003-state-architecture       | Phase 3開始時  | 状態整理表、選定レポート | 状態構造設計書   |
| sm-004-validation-and-debugging | Phase 4開始時  | 状態構造設計書、API仕様  | 非同期・検証計画 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照
**注記**: Task名は目的に合わせて定義する

---

## ベストプラクティス

### すべきこと

| 推奨事項                     | 理由                                |
| ---------------------------- | ----------------------------------- |
| 状態のスコープを明確化する   | 責務分離と保守性が高まる            |
| 派生状態は計算で済ませる     | 重複と不整合を防げる                |
| 非同期状態はstatusで管理する | ローディング/失敗の判断が容易になる |
| 選定理由を文書化する         | チーム合意と運用が安定する          |

### 避けるべきこと

| 禁止事項                     | 問題点                               |
| ---------------------------- | ------------------------------------ |
| すべてをグローバル状態化する | 影響範囲が広がりデバッグが困難になる |
| 状態の重複管理               | データ不整合を生む                   |
| 非同期状態の失敗を放置する   | UI劣化と障害調査の難化につながる     |
| 選定理由の欠落               | チーム内の方針がぶれる               |

---

## リソース参照

### scripts/（決定論的処理）

| スクリプト                   | 機能             |
| ---------------------------- | ---------------- |
| `scripts/validate-skill.mjs` | スキル構造の検証 |
| `scripts/log_usage.mjs`      | 使用記録の保存   |

### references/（詳細知識）

| リソース         | パス                                                                 | 読込条件         |
| ---------------- | -------------------------------------------------------------------- | ---------------- |
| 状態基礎         | [references/foundations.md](references/foundations.md)               | 状態整理の開始時 |
| ライブラリ選定   | [references/library-selection.md](references/library-selection.md)   | 選定基準整理時   |
| 状態構造設計     | [references/state-architecture.md](references/state-architecture.md) | スキーマ設計時   |
| 非同期状態       | [references/async-state.md](references/async-state.md)               | 非同期設計時     |
| テストとデバッグ | [references/testing-debugging.md](references/testing-debugging.md)   | 検証計画時       |

### assets/（テンプレート・素材）

| アセット                             | 用途                       |
| ------------------------------------ | -------------------------- |
| `assets/state-structure-template.ts` | 状態スキーマ雛形           |
| `assets/store-setup-template.ts`     | ストア初期化雛形           |
| `assets/async-state-template.ts`     | 非同期状態雛形             |
| `assets/state-test-template.ts`      | テスト雛形                 |
| `assets/documentation-template.md`   | 設計判断の記録テンプレート |
