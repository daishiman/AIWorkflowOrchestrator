# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 4                                     |
| Phase名    | テスト作成                            |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 3: 設計レビュー                 |
| 次Phase    | Phase 5: 実装                         |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

共有コンポーネントテストと統合テストを fail-first で先行作成し、実装の正しさを検証できるようにする。

## 実行手順

### Step 1: Phase 2 の設計書を確認

`outputs/phase-2/design-document.md` のコンポーネント構成・IPC 抽象化設計を読み込む。

### Step 2: 以下の Task を順次実行

## 実行タスク

### Task 1: コンポーネントテスト（AC-1, AC-3 対応）

- **ルーティング到達性テスト**: App.tsx のルートから ConversationPanel（または統合先）に到達できることをテスト
  - ルートパスへの遷移で正しいコンポーネントがレンダリングされる
  - 未登録ルートへのアクセスが 404 になる
- **QuestionCard 共有テスト**: QuestionCard が独立してレンダリングできることをテスト
  - 各 UserInputKind（text, select, multiSelect, confirm, freeform）の描画テスト
  - Props の型安全性テスト
- **ConversationPanel / ConversationalInterview 統合テスト**: 統合後のコンポーネントが正しくレンダリングされることをテスト

### Task 2: IPC 経路テスト（AC-2 対応）

- **IPC 抽象化レイヤーテスト**: IPC adapter が正しい IPC 経路を呼び出すことをモックテスト
  - session IPC 経路のテスト
  - runtime IPC 経路のテスト
  - IPC 切り替えが正しく動作することのテスト
- **IPC メッセージ型テスト**: 送受信するメッセージの型が正しいことをテスト

### Task 3: クリーンアップテスト（AC-4 対応）

- **孤立参照の不在テスト**: デモ HTML からの ConversationPanel 参照が存在しないことを grep ベースで確認するテスト
- **不要 import の不在テスト**: 削除予定のコンポーネントが他から import されていないことを確認するテスト

### Task 4: 既存テスト互換性確認（AC-5 対応）

- 既存の ConversationalInterview テスト（存在する場合）が設計変更後も pass することを確認するテストケース
- 既存の SkillLifecyclePanel テストへの影響を確認するテストケース

### テストファイル構成

| テストファイル           | 対応 AC | テスト対象                         |
| ------------------------ | ------- | ---------------------------------- |
| ルーティングテスト       | AC-1    | App.tsx → ConversationPanel 到達性 |
| QuestionCard.test.tsx    | AC-3    | QuestionCard 各 UserInputKind 描画 |
| IPC アダプターテスト     | AC-2    | session/runtime IPC 切り替え       |
| クリーンアップ検証テスト | AC-4    | デモ HTML 参照の不在               |
| 既存テスト互換性テスト   | AC-5    | 既存テストの pass 確認             |

## 参照資料

| 資料名                  | パス                                                                                   | 説明             |
| ----------------------- | -------------------------------------------------------------------------------------- | ---------------- |
| 設計書                  | `outputs/phase-2/design-document.md`                                                   | テスト対象の設計 |
| 設計レビュー結果        | `outputs/phase-3/design-review-gate.md`                                                | gate 通過条件    |
| ConversationPanel       | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | テスト対象       |
| QuestionCard            | `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | テスト対象       |
| ConversationalInterview | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | テスト対象       |

### システム仕様（aiworkflow-requirements）

> テスト作成前に以下の仕様を確認してください。

| 参照資料                  | パス                                                                                                  | 内容                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| テスト標準化              | `.agents/skills/aiworkflow-requirements/references/lessons-learned-skill-lifecycle-test-hardening.md` | コンポーネントテストの標準化 |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`           | IPC テストのモック設計参照   |

## 統合テスト連携

- Phase 5 の実装後に全テストが pass に反転することを期待する
- Phase 6 で UserInputKind 5 種類の網羅テストを追加する

## 成果物

| 成果物           | パス                             | 説明                                         |
| ---------------- | -------------------------------- | -------------------------------------------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | AC 対応表、テストケース一覧、fail-first 状態 |

## 完了条件

- [ ] ルーティング到達性テストが作成されている（fail-first）
- [ ] QuestionCard 各 UserInputKind のテストが作成されている（fail-first）
- [ ] IPC 抽象化レイヤーのテストが作成されている（fail-first）
- [ ] クリーンアップ検証テストが作成されている
- [ ] 既存テストへの影響が確認されている
- [ ] AC-1〜AC-5 との対応表が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
