# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| タスク名   | スキル状態管理のZustand集約（仕様書準拠） |
| Phase      | 1 - 要件定義                              |
| 分類       | リファクタリング                          |
| 作成日     | 2026-02-09                                |
| 最終更新日 | 2026-02-09                                |

---

## 1. 背景・現状分析

### 1.1 現状のスキル状態管理経路

現在、スキル機能の状態管理は以下の3つの異なる経路で行われている。

| 経路                         | 使用箇所           | 実装ファイル                         | 状態プロパティ数 |
| ---------------------------- | ------------------ | ------------------------------------ | ---------------- |
| agentSlice (Zustand)         | AgentView          | `store/slices/agentSlice.ts` (440行) | 23               |
| skillSlice (Zustand)         | ChatPanel          | `store/slices/skillSlice.ts` (369行) | 14               |
| useSkillExecution (独立Hook) | 一部コンポーネント | `hooks/useSkillExecution.ts` (207行) | 5                |

### 1.2 重複する状態プロパティ

以下の状態が複数箇所で重複管理されている。

| プロパティ     | agentSlice                         | skillSlice                | useSkillExecution |
| -------------- | ---------------------------------- | ------------------------- | ----------------- |
| 実行状態       | `executionStatus`                  | `skillExecutionStatus`    | `status`          |
| 実行ID         | `currentExecutionId`               | `executionId`             | `executionId`     |
| ストリーミング | -                                  | `streamingMessages`       | `messages`        |
| スキル選択     | `selectedSkill`                    | `selectedSkillName`       | -                 |
| 利用可能スキル | `availableSkills`                  | `availableSkillsMetadata` | -                 |
| エラー         | `error`                            | `skillError`              | `error`           |
| ローディング   | `isLoading`                        | `isLoadingSkills`         | -                 |
| 権限リクエスト | `executionState.pendingPermission` | `pendingPermission`       | -                 |

### 1.3 発生している問題

#### 問題1: 同期ズレのリスク

同じデータが複数箇所で管理されているため、以下のシナリオで同期ズレが発生する可能性がある。

| シナリオ                                                                                | 影響                       |
| --------------------------------------------------------------------------------------- | -------------------------- |
| AgentViewでスキル実行後、ChatPanelでの状態が更新されない                                | UIの不整合、ユーザーの混乱 |
| skillSliceでストリーミングメッセージを受信しても、useSkillExecutionの状態に反映されない | メッセージの重複または欠落 |
| 一方のSliceでエラーをクリアしても、他方に残存                                           | エラー表示の不整合         |

#### 問題2: executionIdのRace Condition

現在の`executeSkill`の実装フロー。

```
1. executeSkill呼び出し
2. IPC経由でMain Processに送信
3. Main Processからストリームメッセージが送信開始
4. IPC応答を受信
5. executionIdをStateに設定  ← この時点でストリームメッセージが既に届いている可能性
```

**問題**: ステップ3-4の間にストリームメッセージが到着した場合、`executionId`がまだ設定されていないためメッセージがフィルタリングされ、損失する。

#### 問題3: 仕様書との不整合

`arch-state-management.md`では以下のように定義されている。

| 仕様書での定義                               | 現状                     |
| -------------------------------------------- | ------------------------ |
| `agentSlice`がエージェント・スキル管理を担当 | skillSliceが並立して存在 |
| 単一のSliceで状態管理                        | 3経路に分散              |

---

## 2. 機能要件

### 2.1 FR-001: agentSliceへの状態統合

| 要件ID   | 要件内容                                                                                                                                                                                                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-001-1 | agentSliceに以下のプロパティを統合する: `availableSkillsMetadata`, `importedSkills`, `selectedSkillName`, `isExecuting`, `executionId`, `skillExecutionStatus`, `streamingMessages`, `pendingPermission`, `skillError`, `isLoadingSkills`, `isScanning`, `isImporting`, `importingSkillName` |
| FR-001-2 | 統合後の状態プロパティはskillSliceの型定義を継承し、命名を`agentSlice`の規約に統一する                                                                                                                                                                                                       |
| FR-001-3 | agentSliceの既存プロパティ（`skills`, `selectedSkill`等）との重複を解消し、単一のプロパティに集約する                                                                                                                                                                                        |

### 2.2 FR-002: skillSliceの削除

| 要件ID   | 要件内容                                                            |
| -------- | ------------------------------------------------------------------- |
| FR-002-1 | `store/slices/skillSlice.ts`を削除する                              |
| FR-002-2 | `store/index.ts`から`createSkillSlice`のimportとStore統合を削除する |
| FR-002-3 | `AppStore`型定義から`SkillSlice`を削除する                          |
| FR-002-4 | `useSkillStore`セレクターをagentSliceベースに書き換える             |

### 2.3 FR-003: AgentViewのagentSlice経由化

| 要件ID   | 要件内容                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------ |
| FR-003-1 | AgentViewの直接IPC呼び出し（`window.electronAPI.skill.*`）をagentSliceのアクション経由に変更する |
| FR-003-2 | `fetchSkills`, `handleImport`, `handleDelete`, `handleExecute`をagentSliceアクションで実装する   |
| FR-003-3 | 型アサーション（`as unknown as Skill[]`）を解消する                                              |

### 2.4 FR-004: useSkillExecutionのラッパー化

| 要件ID   | 要件内容                                                                |
| -------- | ----------------------------------------------------------------------- |
| FR-004-1 | useSkillExecutionフックを維持し、内部でagentSliceを使用するよう変更する |
| FR-004-2 | ローカルuseStateを削除し、agentSliceの状態をセレクトする                |
| FR-004-3 | 既存のuseSkillExecution利用箇所のAPIは変更しない（後方互換性維持）      |

### 2.5 FR-005: Race Condition対策

| 要件ID   | 要件内容                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------- |
| FR-005-1 | `executeSkill`呼び出し前にexecutionIdを生成し、Stateに設定する                                            |
| FR-005-2 | IPCリスナーは設定済みのexecutionIdでメッセージをフィルタリングする                                        |
| FR-005-3 | IPC呼び出しのリクエストにexecutionIdを含め、Main Processから返却されるexecutionIdと一致することを検証する |

### 2.6 FR-006: IPCイベントハンドラの統合

| 要件ID   | 要件内容                                                                                                                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| FR-006-1 | skillSliceの内部ハンドラ（`_handleStreamMessage`, `_handleComplete`, `_handleError`, `_handlePermissionRequest`）をagentSliceに移植する |
| FR-006-2 | `setupSkillListeners.ts`をagentSliceを参照するよう変更する                                                                              |
| FR-006-3 | リスナー二重登録防止のガードを維持する                                                                                                  |

---

## 3. 非機能要件

### 3.1 NFR-001: 状態同期の整合性

| 要件ID    | 要件内容                                                     | 検証方法                                             |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| NFR-001-1 | 全てのスキル関連状態が単一のソース（agentSlice）で管理される | コードレビューで複数箇所での状態管理がないことを確認 |
| NFR-001-2 | コンポーネント間での状態不整合が発生しない                   | 統合テストで複数コンポーネントの同期を検証           |
| NFR-001-3 | ストリーミングメッセージの損失が発生しない                   | Race Conditionテストで1000回の実行で損失0件を確認    |

### 3.2 NFR-002: パフォーマンス

| 要件ID    | 要件内容                                                         | 検証方法                                                      |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| NFR-002-1 | 状態更新時の再レンダリングが必要なコンポーネントのみに限定される | React DevTools Profilerで不要な再レンダリングがないことを確認 |
| NFR-002-2 | セレクターはshallow比較を使用し、不要な再計算を防止する          | テストでセレクターの参照安定性を検証                          |
| NFR-002-3 | 状態更新のレイテンシが既存実装から悪化しない                     | ベンチマークテストで10%以内の差異を確認                       |

### 3.3 NFR-003: 後方互換性

| 要件ID    | 要件内容                                                                | 検証方法                                 |
| --------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| NFR-003-1 | useSkillExecution フックのAPI（戻り値の型）は変更しない                 | 既存テストが全てPASSすることを確認       |
| NFR-003-2 | ChatPanel, AgentViewの外部インターフェース（Props, Handle）は変更しない | コンポーネントテストがPASSすることを確認 |
| NFR-003-3 | IPCチャンネルの仕様は変更しない                                         | IPC統合テストがPASSすることを確認        |

### 3.4 NFR-004: 保守性

| 要件ID    | 要件内容                                             | 検証方法                            |
| --------- | ---------------------------------------------------- | ----------------------------------- |
| NFR-004-1 | 統合後のagentSliceの行数は600行以下とする            | ファイルサイズ確認                  |
| NFR-004-2 | 状態プロパティは論理的なグループでセクション分けする | コードレビュー                      |
| NFR-004-3 | 型定義はインターフェースとして明確に分離する         | TypeScript strictモードでエラーなし |

---

## 4. 受け入れ基準

### 4.1 AC-001: 状態管理の単一化

- [ ] agentSliceに全スキル関連状態が集約されている
- [ ] skillSlice.tsファイルが削除されている
- [ ] store/index.tsからSkillSliceの参照が削除されている
- [ ] useSkillExecutionがagentSliceをデータソースとして使用している

### 4.2 AC-002: Race Conditionの解消

- [ ] executeSkill呼び出し前にexecutionIdがStateに設定される
- [ ] 100回連続実行テストでストリーミングメッセージの損失が0件である
- [ ] 同時実行テストで不正なexecutionIdのメッセージが混入しない

### 4.3 AC-003: テストの合格

- [ ] 既存の全テスト（skillSliceテスト113件を除く）がPASSする
- [ ] 新規追加のagentSlice統合テストがPASSする（目標: 50件以上）
- [ ] E2Eテスト（スキル選択・実行フロー）がPASSする

### 4.4 AC-004: 型安全性

- [ ] `pnpm typecheck`がエラーなしで完了する
- [ ] 型アサーション（`as unknown as`）が解消されている
- [ ] strictモードで全ファイルがコンパイル可能

### 4.5 AC-005: コード品質

- [ ] `pnpm lint`がエラーなしで完了する
- [ ] agentSliceの行数が600行以下である
- [ ] 未使用のimportが存在しない

---

## 5. スコープ外

以下の項目は本タスクのスコープ外とする。

| 項目                                     | 理由                                 |
| ---------------------------------------- | ------------------------------------ |
| ChatPanelの機能追加                      | 本タスクはリファクタリングに専念する |
| 新規IPCチャンネルの追加                  | 既存インターフェースの変更なし       |
| パフォーマンス最適化（キャッシュ導入等） | 別タスクとして切り出す               |
| permissionHistorySliceの統合             | 独立した機能として維持               |

---

## 6. リスク・前提条件

### 6.1 リスク

| リスク               | 影響度 | 発生確率 | 対策                                         |
| -------------------- | ------ | -------- | -------------------------------------------- |
| 既存テストの大量修正 | 高     | 高       | skillSliceテストをagentSlice用に段階的に移行 |
| 移行中の機能破壊     | 高     | 中       | フェーズごとにE2Eテストを実行                |
| 型定義の不整合       | 中     | 中       | 移行前にインターフェース設計をレビュー       |

### 6.2 前提条件

| 前提条件                                                        |
| --------------------------------------------------------------- |
| TASK-FIX-5-1（SkillAPI統一）が完了している                      |
| skillSliceのテストが全てPASSしている状態から開始する            |
| permissionHistorySliceとのcross-sliceアクセスパターンを維持する |

---

## 7. 参照資料

| 資料                         | パス                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| 状態管理仕様書               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`            |
| スキル関連インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` |
| エラーハンドリング仕様       | `.claude/rules/02-code-quality.md`                                                      |
| Electron IPCセキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            |
| スキル実行セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`         |
| SkillStreamDisplay仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`       |
| 現agentSlice実装             | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                  |
| 現skillSlice実装             | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                                  |
| useSkillExecution            | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                                  |
| ChatPanel                    | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                               |
| AgentView                    | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                   |

---

## 8. 統合テスト連携【必須】

接続要件（IPC/状態管理）を要件に明記:

| 接続要件カテゴリ | 記載内容                                                    |
| ---------------- | ----------------------------------------------------------- |
| IPC接続          | skill.execute, skill.abort, skill.stream-message チャンネル |
| 状態同期         | Zustand store → React コンポーネント → IPC リスナー         |
| エラー伝達       | Main Process → Renderer Process へのエラー通知              |

---

## 9. 成果物

| 成果物                  | 説明                       |
| ----------------------- | -------------------------- |
| phase-1-requirements.md | 本ドキュメント（要件定義） |

---

## 10. 次Phase

Phase 2: 設計 → `phase-2-design.md`
