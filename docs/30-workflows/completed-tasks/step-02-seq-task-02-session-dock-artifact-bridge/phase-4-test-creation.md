# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| Phase名    | テスト作成                                |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1-3                                 |
| 後続Phase  | Phase 5（実装）                           |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

session state、restore、artifact summary、manual share のテスト仕様を定義する。

## 実行タスク

- state machine テスト
- persistence / restore テスト
- manual share テスト
- artifact summary テスト

## 参照資料

| 参照資料       | パス                             | 内容                      |
| -------------- | -------------------------------- | ------------------------- |
| Phase 1 成果物 | `phase-1-requirements.md`        | 要件定義（依存Phase）     |
| Phase 2 成果物 | `phase-2-design.md`              | 設計（依存Phase）         |
| Phase 3 成果物 | `phase-3-design-review.md`       | 設計レビュー（依存Phase） |
| root pack      | `../../phase-4-test-creation.md` | 親パックのテスト作成仕様  |

## 実行手順

### ステップ1: state matrix を作る

各 state の entry / exit / CTA を test case 化する。

### ステップ2: restore case を作る

close → reopen で transcript と artifact が復元されるケースを定義する。

### ステップ3: share case を作る

3 操作と provenance chip が連動するケースを定義する。

## 統合テスト連携

store、preload、renderer 表示の 3 層を跨ぐケースを最低 1 つずつ置く。

## 成果物

| 成果物           | パス                               | 説明                   |
| ---------------- | ---------------------------------- | ---------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`   | ケース一覧             |
| mock 戦略        | `outputs/phase-4/mock-strategy.md` | session / preload mock |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                | 仕様参照先                                   |
| ------------------ | --------------------------------------- | -------------------------------------------- |
| UI/UX              | dock / artifact / share の surface 設計 | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | session state / store 設計              | `aiworkflow-requirements: architecture-*.md` |
| セキュリティ       | transcript share / provenance           | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | aborted state / restore failure         | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 完了条件

- [ ] state / restore / share / artifact の 4 群がテスト対象になっている
- [ ] aborted state の test case がある
- [ ] provenance chip の test case がある
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)
