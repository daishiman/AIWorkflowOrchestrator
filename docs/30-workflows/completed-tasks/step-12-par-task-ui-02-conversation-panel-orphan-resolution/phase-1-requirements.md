# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 1                                     |
| Phase名    | 要件定義                              |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | -                                     |
| 次Phase    | Phase 2: 設計                         |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

SkillCreatorConversationPanel と ConversationalInterview の 2 つの会話型 UI を機能比較し、session IPC / runtime IPC の差分を分析し、統合か分離かの方針を決定する。

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# ConversationPanel のルート登録状況
grep -n "ConversationPanel\|SkillCreatorConversation" apps/desktop/src/renderer/App.tsx

# ConversationPanel の import / 参照箇所
grep -rn "SkillCreatorConversationPanel" apps/desktop/src/renderer/

# ConversationalInterview の参照箇所
grep -rn "ConversationalInterview" apps/desktop/src/renderer/

# QuestionCard の参照箇所
grep -rn "QuestionCard" apps/desktop/src/renderer/

# session IPC API の定義
grep -n "skillCreatorSessionAPI\|session" apps/desktop/src/preload/skill-creator-api.ts

# デモ HTML ファイルの参照
grep -rn "ConversationPanel\|SkillCreatorConversation" apps/desktop/ --include="*.html"
```

| 判定           | 条件                                            | 対応                             |
| -------------- | ----------------------------------------------- | -------------------------------- |
| 未統合（想定） | ConversationPanel にルートがなく孤立している    | 統合/分離方針を新規策定して進行  |
| 部分統合       | ルートはないが一部コード共有がある              | 共有部分を活かして統合方針を策定 |
| 既統合         | ルートが存在し ConversationalInterview と統合済 | スコープ見直しをユーザーに確認   |

## 実行タスク

### Task 1: 2つの会話UIの機能比較

SkillCreatorConversationPanel と ConversationalInterview の機能を網羅的に比較する:

- **UI 機能**: チャット表示、入力フォーム、質問レンダリング、進捗表示、エラーハンドリング
- **IPC 依存**: session IPC（`window.skillCreatorSessionAPI`）vs runtime IPC
- **状態管理**: ローカル state、コンテキスト、外部 store の使い分け
- **コンポーネント構成**: QuestionCard、MessageBubble 等のサブコンポーネント
- **props / API**: 親コンポーネントからの受け渡しインターフェース

機能比較マトリクスを作成し、重複機能・固有機能・欠損機能を明確にする。

### Task 2: session IPC / runtime IPC 差分分析

- `apps/desktop/src/preload/skill-creator-api.ts` の session IPC API を洗い出す
- ConversationalInterview が使用する runtime IPC パスを洗い出す
- 2 つの IPC 経路のチャネル名、引数型、戻り値型を比較する
- どちらの IPC 経路が正本仕様（`interfaces-agent-sdk-skill-reference.md`）に準拠しているかを判定する
- session IPC のみの機能、runtime IPC のみの機能を特定する

### Task 3: 統合か分離かの方針決定

Task 1・Task 2 の結果に基づき、以下の選択肢を評価する:

| 方針       | 概要                                                          | メリット                   | デメリット                             |
| ---------- | ------------------------------------------------------------- | -------------------------- | -------------------------------------- |
| 統合       | ConversationPanel の機能を ConversationalInterview に吸収する | IPC 経路の統一、コード削減 | ConversationPanel 固有機能の喪失リスク |
| ルート追加 | ConversationPanel に正式ルートを追加し両方を維持する          | 既存コードへの影響最小     | IPC 経路の分散が残る                   |
| 新規統合   | 両方の良い部分を取り込んだ新しい統合コンポーネントを作成する  | 最適な設計が可能           | 実装コスト大                           |

方針決定の判断基準:

- 正本仕様（ナビゲーション契約、IPC 契約）との整合性
- 既存テストへの影響最小化
- QuestionCard 等の共有コンポーネントの再利用性

### Task 4: 受入条件の確定

| AC   | 条件                                                                 | 検証方法          |
| ---- | -------------------------------------------------------------------- | ----------------- |
| AC-1 | SkillCreatorConversationPanel が正式なルートを持つ、または統合される | 手動テスト / UT   |
| AC-2 | session IPC と runtime IPC の使い分けが明確化される                  | 設計レビュー / UT |
| AC-3 | QuestionCard 等の共有可能コンポーネントが整理される                  | コードレビュー    |
| AC-4 | 孤立した参照（デモ HTML）がクリーンアップされる                      | grep 検索で確認   |
| AC-5 | 既存テストが pass する                                               | `pnpm test` 実行  |

### Task 5: スコープ境界

- **含む**: 会話 UI の統合/ルート追加、IPC 経路の明確化、共有コンポーネント整理、デモ HTML クリーンアップ
- **含まない**: 新規 IPC チャネル設計、SkillLifecyclePanel の全面再設計、Electron メインプロセスの大規模改修

## 参照資料

| 資料名                        | パス                                                                                   | 説明                           |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| SkillCreatorConversationPanel | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 孤立した会話 UI 本体           |
| QuestionCard                  | `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | 質問レンダリングコンポーネント |
| ConversationalInterview       | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | 既存の埋め込みインタビュー UI  |
| App.tsx                       | `apps/desktop/src/renderer/App.tsx`                                                    | ルーティング定義               |
| skill-creator-api             | `apps/desktop/src/preload/skill-creator-api.ts`                                        | session IPC API 定義           |
| skillCreator types            | `packages/shared/src/types/skillCreator.ts`                                            | 共有型定義                     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                    |
| ------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| UI/UX ナビゲーション契約  | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | ルーティング・ナビゲーション設計の正本  |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService、IPC パターンの仕様 |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC 修正時の整合性チェック              |

## 多角的チェック観点

| 観点           | 適用判断                                   | 確認内容                       |
| -------------- | ------------------------------------------ | ------------------------------ |
| アーキテクチャ | 2 つの会話 UI の並立解消のため適用         | コンポーネント責務分離が明確か |
| IPC通信        | session IPC / runtime IPC の整理のため適用 | IPC 経路の正本仕様準拠         |
| ナビゲーション | ルート追加 / 統合のため適用                | ナビゲーション契約との整合性   |

## 成果物

| 成果物             | パス                                             | 説明                               |
| ------------------ | ------------------------------------------------ | ---------------------------------- |
| 仕様抽出マップ     | `outputs/phase-1/spec-extraction-map.md`         | IPC 差分分析、方針決定の根拠       |
| コンポーネント比較 | `outputs/phase-1/component-comparison-matrix.md` | 2 つの会話 UI の機能比較マトリクス |

## 完了条件

- [ ] P50チェックで対象ファイルの現在状態を確認した
- [ ] 2 つの会話 UI の機能比較マトリクスが作成されている
- [ ] session IPC / runtime IPC の差分が分析されている
- [ ] 統合か分離かの方針が決定されている
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] 含む / 含まないが明確である
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
