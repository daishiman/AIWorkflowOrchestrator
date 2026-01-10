---
name: tdd-red-green-refactor
description: |
  Red-Green-Refactorサイクルを中心にTDDを実行するための専門スキル。
  失敗テストの設計、最小実装、リファクタを反復し、品質と速度を両立する。

  Anchors:
  • Test-Driven Development: By Example / 適用: RGRサイクル / 目的: 反復の規律
  • Refactoring (Martin Fowler) / 適用: 改善手順 / 目的: 振る舞い維持
  • xUnit Test Patterns / 適用: テスト設計 / 目的: 表現の一貫性

  Trigger:
  Use when focusing on the red-green-refactor cycle, coaching TDD execution, or reviewing cycle quality.
  red-green-refactor, TDD cycle, failing test, minimal implementation, refactoring
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# tdd-red-green-refactor

## 概要

Red-Green-Refactorの各フェーズを明確にし、短いサイクルで品質を改善するスキル。

---

## ワークフロー

### Phase 1: Redフェーズ設計

**目的**: 失敗理由が明確なテストを作成する。

**アクション**:

1. 期待する振る舞いを定義する
2. 失敗するテストを記述する
3. テスト命名を整える

**Task**: `agents/red-phase.md` を参照

### Phase 2: Greenフェーズ実行

**目的**: 最小実装でテストを通す。

**アクション**:

1. 最小実装でテストを成功させる
2. 余計な最適化を避ける
3. 改善候補を記録する

**Task**: `agents/green-phase.md` を参照

### Phase 3: Refactorフェーズ改善

**目的**: 振る舞いを変えずに設計を改善する。

**アクション**:

1. 重複や複雑性を抽出する
2. 安全な改善から実施する
3. サイクルログを更新する

**Task**: `agents/refactor-phase.md` を参照

---

## Task仕様ナビ

| Task           | 起動タイミング | 入力        | 出力       |
| -------------- | -------------- | ----------- | ---------- |
| red-phase      | Phase 1開始時  | 仕様・要求  | Redテスト  |
| green-phase    | Phase 2開始時  | Redテスト   | Green実装  |
| refactor-phase | Phase 3開始時  | Green実装   | RGRログ更新 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項                         | 理由                               |
| -------------------------------- | ---------------------------------- |
| Redで失敗理由を明確にする        | Greenの最小実装が決まりやすい      |
| Greenは最小実装に徹する          | 過剰設計を避ける                   |
| Refactorを毎サイクル実施する     | 品質低下を防げる                   |

### 避けるべきこと

| 禁止事項                     | 問題点                             |
| ---------------------------- | ---------------------------------- |
| Redを飛ばして実装を始める   | サイクルの規律が崩れる             |
| Greenで過剰な実装を行う     | 改善対象が増える                   |
| Refactorを省略する           | 技術的負債が蓄積する               |

---

## リソース参照

### scripts/（決定論的処理）

| スクリプト                         | 機能                         |
| ---------------------------------- | ---------------------------- |
| `scripts/validate-rgr-log.mjs`     | サイクルログを検証する       |
| `scripts/log_usage.mjs`            | 使用記録をLOGS.mdに記録する  |

### references/（詳細知識）

| リソース          | パス                                                     | 読込条件     |
| ----------------- | -------------------------------------------------------- | ------------ |
| 基礎              | [references/Level1_basics.md](references/Level1_basics.md) | 初回利用時   |
| 実務パターン      | [references/Level2_intermediate.md](references/Level2_intermediate.md) | 実務適用時 |
| 高度改善          | [references/Level3_advanced.md](references/Level3_advanced.md) | 改善時       |
| エキスパート      | [references/Level4_expert.md](references/Level4_expert.md) | 高難度対応時 |
| Redフェーズ       | [references/red-phase.md](references/red-phase.md) | Phase 1      |
| Greenフェーズ     | [references/green-phase.md](references/green-phase.md) | Phase 2      |
| Refactorフェーズ  | [references/refactor-phase.md](references/refactor-phase.md) | Phase 3      |
| テスト命名        | [references/test-naming.md](references/test-naming.md) | Phase 1      |
| アンチパターン    | [references/tdd-anti-patterns.md](references/tdd-anti-patterns.md) | 全フェーズ |

### assets/（テンプレート）

| アセット                         | 用途                       |
| -------------------------------- | -------------------------- |
| `assets/test-template.md`        | テスト設計テンプレート     |
| `assets/rgr-cycle-log.md`        | RGRサイクルログ            |

