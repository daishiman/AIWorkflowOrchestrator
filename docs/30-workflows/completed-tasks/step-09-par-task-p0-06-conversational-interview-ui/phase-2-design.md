# Phase 2: 設計

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 2                           |
| 機能名 | conversational-interview-ui |
| 作成日 | 2026-03-29                  |

## 目的

Phase 1 で定義した要件に基づき、会話型インタビューUI の技術設計を行う。コンポーネント構成、インターフェース、データフロー、エラーハンドリング方針を定義する。

## 実行タスク

- コンポーネント構成の設計
- インターフェース定義
- データフローの設計
- エラーハンドリング方針の定義
- state owner / IPC boundary / preload exposure / renderer local state の分離

## 参照資料

| 資料名       | パス                      | 説明       |
| ------------ | ------------------------- | ---------- |
| Phase 1 要件 | `phase-1-requirements.md` | 要件定義   |
| index.md     | `index.md`                | タスク概要 |

## 実行手順

### ステップ1: コンポーネント構成を設計する

変更対象のコンポーネントと新規コンポーネントの関係を設計する。

### ステップ2: 契約境界を定義する

型定義、API 境界、IPC チャネルに加え、state owner / IPC boundary / preload exposure / renderer local state を明記する。

### ステップ3: データフローを設計する

入力から出力までのデータの流れを設計する。

### ステップ4: エラーハンドリング方針を定義する

想定されるエラーパターンと対処方針を定義する。

### ステップ5: 入力契約マトリクスを作成する

UserInputKind ごとの入力 UI・戻り値・エラー・keyboard 操作・状態保持方針を表に整理する。

## 統合テスト連携

Phase 4 の test matrix で AC ↔ UI 契約が一致するよう、Phase 2 の契約表を参照リンクとして固定する。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                | 仕様参照先                                   |
| ------------------ | ----------------------- | -------------------------------------------- |
| UI/UX              | 会話型 UI のため必須    | `aiworkflow-requirements: ui-ux-*.md`        |
| IPC通信            | plan 連携があるため必須 | `aiworkflow-requirements: api-ipc-*.md`      |
| アーキテクチャ     | state owner 分離が必要  | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | 入力エラーが必要        | `aiworkflow-requirements: error-handling.md` |

## 成果物

| 成果物                       | パス                                              | 説明                               |
| ---------------------------- | ------------------------------------------------- | ---------------------------------- |
| 設計ドキュメント             | `outputs/phase-2/design-document.md`              | 技術設計書                         |
| conversation state contract  | `outputs/phase-2/conversation-state-contract.md`  | state owner / state 分離の契約表   |
| input widget contract matrix | `outputs/phase-2/input-widget-contract-matrix.md` | UserInputKind の入力契約マトリクス |

## 完了条件

- [ ] コンポーネント構成が設計されている
- [ ] インターフェースが定義されている
- [ ] データフローが設計されている
- [ ] エラーハンドリング方針が定義されている
- [ ] state owner / IPC boundary / preload exposure / renderer local state が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. コンポーネント構成の設計
3. 契約境界の設計
4. 入力契約マトリクス作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が全て作成されている

## 次のPhase

Phase 3: 設計レビュー
