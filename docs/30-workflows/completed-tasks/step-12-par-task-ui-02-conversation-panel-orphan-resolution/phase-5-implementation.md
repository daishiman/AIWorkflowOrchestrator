# Phase 5: 実装

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 5                                     |
| Phase名    | 実装                                  |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 4: テスト作成                   |
| 次Phase    | Phase 6: テスト拡充                   |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

Phase 2 の設計に基づき、コンポーネント統合/ルート追加を実装し、孤立参照をクリーンアップし、Phase 4 のテストを pass させる。

## 実行手順

### Step 1: Phase 4 のテストが fail-first であることを確認

```bash
pnpm --filter @repo/desktop test
```

### Step 2: 以下の Task を順次実行

### Step 3: Phase 4 のテストが全て pass することを確認

## 実行タスク

### Task 1: コンポーネント統合/ルート追加（AC-1 対応）

Phase 2 の設計判断に従い、以下のいずれかを実装する:

- **統合の場合**:
  - ConversationPanel の機能を ConversationalInterview に移植する
  - ConversationPanel の export を削除または deprecated にする
  - SkillLifecyclePanel 内での ConversationalInterview の動作を確認する

- **ルート追加の場合**:
  - `App.tsx` に ConversationPanel のルートを追加する
  - ナビゲーション UI（サイドバー、ボタン等）から導線を追加する
  - lazy loading を適用する

- **新規統合の場合**:
  - 新しい統合コンポーネントを作成する
  - 既存の ConversationPanel / ConversationalInterview からコードを移植する
  - App.tsx にルートを追加する

### Task 2: IPC 経路の明確化（AC-2 対応）

- Phase 2 で設計した IPC 経路選択を実装する
- session IPC と runtime IPC の使い分けルールをコードコメントで明記する
- IPC 抽象化レイヤー（adapter / hook）を実装する（必要な場合）
- 不要な IPC 経路のコードを整理する

### Task 3: 共有コンポーネント整理（AC-3 対応）

- QuestionCard 等の共有可能コンポーネントを設計で決定した配置先に移動する
- import パスを更新する
- Props 型を統一する
- IPC 依存を Props 経由の callback に変換する（必要な場合）

### Task 4: 孤立参照クリーンアップ（AC-4 対応）

- Phase-11 デモ HTML ファイルを削除する
- ConversationPanel への孤立した参照を全て除去する
- 不要な import 文を削除する
- 削除したファイルの一覧を記録する

### Task 5: 既存テスト維持確認（AC-5 対応）

- 全テストを実行し pass することを確認する:
  ```bash
  pnpm --filter @repo/desktop test
  pnpm --filter @repo/shared test
  ```
- 型チェックを実行する:
  ```bash
  pnpm --filter @repo/desktop typecheck
  ```

## 参照資料

| 資料名                  | パス                                                                                   | 説明                 |
| ----------------------- | -------------------------------------------------------------------------------------- | -------------------- |
| 設計書                  | `outputs/phase-2/design-document.md`                                                   | 実装の根拠           |
| テストマトリクス        | `outputs/phase-4/test-matrix.md`                                                       | fail-first テスト    |
| ConversationPanel       | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 修正/統合対象        |
| QuestionCard            | `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | 移動/整理対象        |
| ConversationalInterview | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | 統合先候補           |
| App.tsx                 | `apps/desktop/src/renderer/App.tsx`                                                    | ルーティング変更対象 |
| skill-creator-api       | `apps/desktop/src/preload/skill-creator-api.ts`                                        | IPC 整理対象         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                           | 内容                         |
| ------------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| UI/UX ナビゲーション契約  | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | ルート追加時の制約           |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC 変更時の同時更新チェック |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | セキュリティパターン         |

## 多角的チェック観点

| 観点               | 適用判断                     | 確認内容                    |
| ------------------ | ---------------------------- | --------------------------- |
| アーキテクチャ     | コンポーネント統合のため適用 | 既存パターンと一致すること  |
| IPC通信            | IPC 経路整理のため適用       | IPC 契約チェックリスト準拠  |
| ナビゲーション     | ルーティング変更のため適用   | ナビゲーション契約準拠      |
| エラーハンドリング | IPC 呼び出しの変更のため適用 | graceful degradation の維持 |

## 統合テスト連携

- Phase 4 で定義した fail-first テストが全て pass に反転することを確認する
- Phase 6 で追加のテストケースを拡充する

## 成果物

| 成果物   | パス                                       | 説明                                            |
| -------- | ------------------------------------------ | ----------------------------------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更点、統合/ルート追加内容、クリーンアップ結果 |

## 完了条件

- [ ] ConversationPanel が正式なルートを持つ、または統合されている（AC-1）
- [ ] IPC 経路の使い分けが明確化されている（AC-2）
- [ ] QuestionCard 等の共有コンポーネントが整理されている（AC-3）
- [ ] デモ HTML がクリーンアップされている（AC-4）
- [ ] Phase 4 のテストが全て pass する（AC-5）
- [ ] 型チェックが pass する
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
