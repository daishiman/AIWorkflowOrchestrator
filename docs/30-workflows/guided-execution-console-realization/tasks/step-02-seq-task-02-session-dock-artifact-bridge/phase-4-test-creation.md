# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| Phase名    | テスト作成                                |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1-3                                 |
| 後続Phase  | Phase 5（実装）                           |
| ステータス | not_started                               |
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

- 依存Phase: Phase 1, Phase 2, Phase 3
- task 要件: `phase-1-requirements.md`
- task 設計: `phase-2-design.md`
- task 設計レビュー: `phase-3-design-review.md`
- root pack: `../../phase-4-test-creation.md`

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

## 完了条件

- [ ] state / restore / share / artifact の 4 群がテスト対象になっている
- [ ] aborted state の test case がある
- [ ] provenance chip の test case がある
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)
