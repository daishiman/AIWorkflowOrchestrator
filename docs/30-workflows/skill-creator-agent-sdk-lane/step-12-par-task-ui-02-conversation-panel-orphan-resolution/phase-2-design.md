# Phase 2: 設計

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 2                                     |
| Phase名    | 設計                                  |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 1: 要件定義                     |
| 次Phase    | Phase 3: 設計レビュー                 |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

Phase 1 で決定した統合/分離方針に基づき、共有コンポーネント抽出設計、IPC 経路選択設計、ルーティング変更設計を確定する。

## 実行手順

### Step 1: Phase 1 の方針を確認

`outputs/phase-1/spec-extraction-map.md` の方針決定結果を読み込み、設計の前提とする。

### Step 2: 以下の Task を順次実行

## 実行タスク

### Task 1: 統合/分離の設計判断

Phase 1 の方針を具体的な設計に落とし込む:

- **統合の場合**: ConversationPanel の機能を ConversationalInterview に移植する設計
  - 移植対象の機能一覧
  - 削除対象のコード一覧
  - ConversationalInterview の拡張ポイント
- **ルート追加の場合**: App.tsx にルートを追加する設計
  - ルートパス（例: `/skill-creator/conversation`）
  - ナビゲーション導線（サイドバー、ボタン等）
  - 既存ルートとの整合性
- **新規統合の場合**: 新しい統合コンポーネントの設計
  - コンポーネント構造（Props、State）
  - 既存コンポーネントからの継承/委譲関係

### Task 2: 共有コンポーネント抽出設計

QuestionCard を含む共有可能コンポーネントの抽出を設計する:

- **抽出候補コンポーネント**:
  - `QuestionCard.tsx` — 質問レンダリング
  - メッセージバブル / チャット表示コンポーネント
  - 入力フォームコンポーネント
  - 進捗表示コンポーネント

- **配置先の決定**:
  - `apps/desktop/src/renderer/components/shared/` に共通コンポーネントとして配置するか
  - 既存の `skill-creator/` ディレクトリ内に留めるか
  - `packages/ui/` に昇格するか

- **インターフェース設計**:
  - 各コンポーネントの Props 型を統一する
  - IPC 依存を Props 経由の callback に抽象化する

### Task 3: IPC 経路選択設計

session IPC と runtime IPC の使い分けを明確化する:

- **現状の IPC 経路**:

  ```
  ConversationPanel → window.skillCreatorSessionAPI (session IPC)
  ConversationalInterview → runtime IPC (via SkillLifecyclePanel)
  ```

- **設計判断ポイント**:
  - どちらの IPC 経路を正とするか（正本仕様準拠で判定）
  - session IPC 固有の機能（セッション管理等）は runtime IPC で代替可能か
  - IPC 経路の統一が不可能な場合の共存ルール

- **IPC 抽象化設計**:
  ```typescript
  // IPC を抽象化するフック or コンテキスト
  interface ConversationIPCAdapter {
    sendMessage(message: string): Promise<ConversationResponse>;
    getHistory(): Promise<ConversationMessage[]>;
    // ... session/runtime の差異を吸収
  }
  ```

### Task 4: ルーティング変更設計

App.tsx のルーティング変更を設計する:

- 追加/変更するルートの一覧
- ナビゲーション契約（`ui-ux-navigation.md`）との整合性確認
- lazy loading / code splitting の考慮
- TASK-UI-01（ルート昇格）との整合性

### Task 5: デモ HTML クリーンアップ設計

- Phase-11 デモ HTML ファイルの特定
- 削除対象ファイルの一覧
- デモ HTML が参照している機能で本番コードに必要なものの洗い出し

## 参照資料

| 資料名                  | パス                                                                                   | 説明                 |
| ----------------------- | -------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 成果物          | `outputs/phase-1/spec-extraction-map.md`                                               | 方針決定の根拠       |
| Phase 1 比較マトリクス  | `outputs/phase-1/component-comparison-matrix.md`                                       | 機能比較の詳細       |
| ConversationPanel       | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 統合/移植元          |
| ConversationalInterview | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | 統合先候補           |
| App.tsx                 | `apps/desktop/src/renderer/App.tsx`                                                    | ルーティング変更対象 |
| skill-creator-api       | `apps/desktop/src/preload/skill-creator-api.ts`                                        | session IPC 定義     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                       |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| UI/UX ナビゲーション契約  | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ルート設計の正本。ナビゲーション導線の制約 |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | IPC パターン、session/runtime の責務定義   |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC 変更時の同時更新チェックリスト         |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`              | IPC セキュリティパターン                   |

## 多角的チェック観点

| 観点               | 適用判断                         | 確認内容                               |
| ------------------ | -------------------------------- | -------------------------------------- |
| アーキテクチャ     | コンポーネント統合設計のため適用 | 責務分離、依存方向が明確であること     |
| IPC通信            | IPC 経路選択設計のため適用       | 正本仕様準拠、セキュリティパターン準拠 |
| ナビゲーション     | ルーティング変更設計のため適用   | ナビゲーション契約との整合性           |
| コンポーネント設計 | 共有コンポーネント抽出のため適用 | Props 型の統一、IPC 依存の抽象化       |

## 統合テスト連携

- 共有コンポーネントの Props 型が Phase 4 のテストケースに対応すること
- IPC 抽象化レイヤーが Phase 6 の統合テストで検証可能であること
- ルーティング変更が Phase 11 の手動テストで確認可能であること

## 成果物

| 成果物 | パス                                 | 説明                                                      |
| ------ | ------------------------------------ | --------------------------------------------------------- |
| 設計書 | `outputs/phase-2/design-document.md` | 統合/分離設計、共有コンポーネント、IPC 経路、ルーティング |

## 完了条件

- [ ] 統合/分離の具体的な設計が確定している
- [ ] 共有コンポーネントの抽出対象と配置先が決定している
- [ ] IPC 経路の選択（正の経路）が明確に設計されている
- [ ] App.tsx のルーティング変更が設計されている
- [ ] デモ HTML のクリーンアップ対象が特定されている
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
