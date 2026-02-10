# Phase 1: 要件チェックリスト

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| タスク名   | スキル状態管理のZustand集約（仕様書準拠） |
| Phase      | 1 - 要件定義                              |
| 作成日     | 2026-02-09                                |
| 最終更新日 | 2026-02-09                                |

---

## 1. 現状分析チェックリスト

### 1.1 状態管理経路の確認

- [x] agentSlice (Zustand) の現状確認 - 23プロパティ、440行
- [x] skillSlice (Zustand) の現状確認 - 14プロパティ、369行
- [x] useSkillExecution (独立Hook) の現状確認 - 5プロパティ、207行

### 1.2 重複プロパティの特定

| プロパティ     | agentSlice                | skillSlice                | useSkillExecution | 確認 |
| -------------- | ------------------------- | ------------------------- | ----------------- | ---- |
| 実行状態       | `executionStatus`         | `skillExecutionStatus`    | `status`          | [x]  |
| 実行ID         | `currentExecutionId`      | `executionId`             | `executionId`     | [x]  |
| ストリーミング | -                         | `streamingMessages`       | `messages`        | [x]  |
| スキル選択     | `selectedSkill`           | `selectedSkillName`       | -                 | [x]  |
| 利用可能スキル | `availableSkills`         | `availableSkillsMetadata` | -                 | [x]  |
| エラー         | `error`                   | `skillError`              | `error`           | [x]  |
| ローディング   | `isLoading`               | `isLoadingSkills`         | -                 | [x]  |
| 権限リクエスト | `pendingPermission`(exec) | `pendingPermission`       | -                 | [x]  |

### 1.3 問題点の確認

- [x] 問題1: 同期ズレのリスク（AgentView/ChatPanel間の状態不整合）
- [x] 問題2: executionIdのRace Condition（ストリームメッセージ損失の可能性）
- [x] 問題3: 仕様書との不整合（arch-state-management.mdとの差異）

---

## 2. 機能要件チェックリスト

### FR-001: agentSliceへの状態統合

- [ ] FR-001-1: 以下のプロパティをagentSliceに統合
  - `availableSkillsMetadata`
  - `importedSkills`
  - `selectedSkillName`
  - `isExecuting`
  - `executionId`
  - `skillExecutionStatus`
  - `streamingMessages`
  - `pendingPermission`
  - `skillError`
  - `isLoadingSkills`
  - `isScanning`
  - `isImporting`
  - `importingSkillName`
- [ ] FR-001-2: skillSliceの型定義を継承し、命名をagentSlice規約に統一
- [ ] FR-001-3: 既存プロパティとの重複を解消し、単一プロパティに集約

### FR-002: skillSliceの削除

- [ ] FR-002-1: `store/slices/skillSlice.ts`を削除
- [ ] FR-002-2: `store/index.ts`から`createSkillSlice`のimportとStore統合を削除
- [ ] FR-002-3: `AppStore`型定義から`SkillSlice`を削除
- [ ] FR-002-4: `useSkillStore`セレクターをagentSliceベースに書き換え

### FR-003: AgentViewのagentSlice経由化

- [ ] FR-003-1: 直接IPC呼び出しをagentSliceアクション経由に変更
- [ ] FR-003-2: `fetchSkills`, `handleImport`, `handleDelete`, `handleExecute`をアクション化
- [ ] FR-003-3: 型アサーション（`as unknown as Skill[]`）を解消

### FR-004: useSkillExecutionのラッパー化

- [ ] FR-004-1: useSkillExecutionを維持し、内部でagentSliceを使用
- [ ] FR-004-2: ローカルuseStateを削除し、agentSliceの状態をセレクト
- [ ] FR-004-3: 既存API（後方互換性）を維持

### FR-005: Race Condition対策

- [ ] FR-005-1: executeSkill呼び出し前にexecutionIdを生成・State設定
- [ ] FR-005-2: IPCリスナーで設定済みexecutionIdによるメッセージフィルタリング
- [ ] FR-005-3: リクエストにexecutionIdを含め、Main Processからの返却と一致検証

### FR-006: IPCイベントハンドラの統合

- [ ] FR-006-1: skillSlice内部ハンドラ（`_handleStreamMessage`等）をagentSliceに移植
- [ ] FR-006-2: `setupSkillListeners.ts`をagentSlice参照に変更
- [ ] FR-006-3: リスナー二重登録防止のガードを維持

---

## 3. 非機能要件チェックリスト

### NFR-001: 状態同期の整合性

- [ ] NFR-001-1: 全スキル状態が単一ソース（agentSlice）で管理される
- [ ] NFR-001-2: コンポーネント間での状態不整合が発生しない
- [ ] NFR-001-3: ストリーミングメッセージの損失が発生しない（1000回実行で0件）

### NFR-002: パフォーマンス

- [ ] NFR-002-1: 再レンダリングが必要なコンポーネントのみに限定
- [ ] NFR-002-2: セレクターでshallow比較を使用し、不要な再計算を防止
- [ ] NFR-002-3: 状態更新レイテンシが既存実装から悪化しない（10%以内）

### NFR-003: 後方互換性

- [ ] NFR-003-1: useSkillExecution戻り値型の維持
- [ ] NFR-003-2: ChatPanel, AgentViewの外部インターフェース維持
- [ ] NFR-003-3: IPCチャンネル仕様の維持

### NFR-004: 保守性

- [ ] NFR-004-1: 統合後のagentSlice行数600行以下
- [ ] NFR-004-2: 状態プロパティを論理グループでセクション分け
- [ ] NFR-004-3: 型定義をインターフェースとして明確に分離

---

## 4. 受け入れ基準チェックリスト

### AC-001: 状態管理の単一化

- [ ] agentSliceに全スキル関連状態が集約されている
- [ ] skillSlice.tsファイルが削除されている
- [ ] store/index.tsからSkillSlice参照が削除されている
- [ ] useSkillExecutionがagentSliceをデータソースとして使用している

### AC-002: Race Conditionの解消

- [ ] executeSkill呼び出し前にexecutionIdがStateに設定される
- [ ] 100回連続実行テストでストリーミングメッセージ損失が0件
- [ ] 同時実行テストで不正executionIdのメッセージが混入しない

### AC-003: テストの合格

- [ ] 既存テスト（skillSliceテスト113件を除く）が全てPASS
- [ ] 新規agentSlice統合テストがPASS（目標: 50件以上）
- [ ] E2Eテスト（スキル選択・実行フロー）がPASS

### AC-004: 型安全性

- [ ] `pnpm typecheck`がエラーなしで完了
- [ ] 型アサーション（`as unknown as`）が解消されている
- [ ] strictモードで全ファイルがコンパイル可能

### AC-005: コード品質

- [ ] `pnpm lint`がエラーなしで完了
- [ ] agentSliceの行数が600行以下
- [ ] 未使用のimportが存在しない

---

## 5. スコープ外確認

- [x] ChatPanelの機能追加（リファクタリングに専念のため除外）
- [x] 新規IPCチャンネルの追加（既存インターフェース変更なし）
- [x] パフォーマンス最適化（別タスクとして切り出し）
- [x] permissionHistorySliceの統合（独立機能として維持）

---

## 6. リスク・前提条件確認

### 6.1 リスク

| リスク               | 影響度 | 発生確率 | 対策                                 | 確認 |
| -------------------- | ------ | -------- | ------------------------------------ | ---- |
| 既存テストの大量修正 | 高     | 高       | skillSliceテストを段階的移行         | [x]  |
| 移行中の機能破壊     | 高     | 中       | フェーズごとにE2Eテスト実行          | [x]  |
| 型定義の不整合       | 中     | 中       | 移行前にインターフェース設計レビュー | [x]  |

### 6.2 前提条件

- [x] TASK-FIX-5-1（SkillAPI統一）が完了している
- [x] skillSliceのテストが全てPASSしている状態から開始
- [x] permissionHistorySliceとのcross-sliceアクセスパターンを維持

---

## 7. 参照資料確認

| 資料                                | 確認 |
| ----------------------------------- | ---- |
| arch-state-management.md            | [x]  |
| interfaces-agent-sdk-integration.md | [x]  |
| 02-code-quality.md                  | [x]  |
| security-electron-ipc.md            | [x]  |
| security-skill-execution.md         | [x]  |
| ui-ux-feature-skill-stream.md       | [x]  |

---

## 8. 統合テスト連携確認

| 接続要件カテゴリ | 確認内容                                                   | 確認 |
| ---------------- | ---------------------------------------------------------- | ---- |
| IPC接続          | skill.execute, skill.abort, skill.stream-messageチャンネル | [x]  |
| 状態同期         | Zustand store → React コンポーネント → IPC リスナー        | [x]  |
| エラー伝達       | Main Process → Renderer Process へのエラー通知             | [x]  |

---

## 9. 完了条件

- [x] 現状分析が完了し、問題点が特定されている
- [x] 機能要件（FR-001〜FR-006）が明確に定義されている
- [x] 非機能要件（NFR-001〜NFR-004）が明確に定義されている
- [x] 受け入れ基準（AC-001〜AC-005）がチェックリスト形式で定義されている
- [x] スコープ外項目が明確に定義されている
- [x] リスクと前提条件が特定されている

---

## 10. 次Phaseへの引き継ぎ事項

### Phase 2（設計）への引き継ぎ

1. **統一状態インターフェース設計**
   - 重複プロパティの統合方針を決定すること
   - 命名規約の統一（agentSlice規約に合わせる）

2. **Race Condition対策**
   - executionId事前生成パターンの詳細設計
   - IPCリクエスト/レスポンスの型拡張

3. **移行計画**
   - 段階的移行ステップの設計
   - テスト移行計画の策定

4. **後方互換性**
   - useSkillExecution、useSkillStoreのAPI維持
   - 既存コンポーネントへの影響最小化
