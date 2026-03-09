# システム仕様調査レポート

## タスク概要

TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 の再監査結果を、workflow 本文・system spec・skill docs の三層で整合させるための調査記録。

**調査日**: 2026-03-09
**調査範囲**: workflow 本文、Phase 11/12 成果物、`arch-state-management.md`、`task-workflow.md`、`task-specification-creator` テンプレート群

---

## 1. 結論

- コード本体の主機能は成立していた
  - `agentSlice.executeSkill` に再入ガードあり
  - `ChatPanel` は `useIsSkillExecuting()` へ移行済み
- ドリフトは主に文書・証跡・テンプレート側に残っていた
  - workflow `index.md` が未実施表示
  - Phase 11 がスクリーンショット証跡未整備
  - Phase 12 実装ガイドが validator 未達
  - `validate-phase-output --phase 12` という誤コマンド例が残存
- 残未タスクは 1 件
  - `UT-FIX-CANCEL-SKILL-CONCURRENCY-GUARD-001`

## 2. 状態管理仕様

### 1.1 AgentSlice の設計原則

**ファイル**: `apps/desktop/src/store/slices/agentSlice.ts` (Zustand Slice)

**状態プロパティ** (arch-state-management.md v3.8.2 以降):

| プロパティ          | 型                               | 初期値      | 説明                                    |
| ------------------- | -------------------------------- | ----------- | --------------------------------------- |
| `availableSkills`   | `SkillMetadata[]`                | `[]`        | 利用可能なスキル一覧                    |
| `importedSkills`    | `ImportedSkill[]`                | `[]`        | インポート済みスキル一覧                |
| `selectedSkillName` | `string \| null`                 | `null`      | 選択中のスキル名                        |
| **`isExecuting`**   | **`boolean`**                    | **`false`** | **実行中フラグ（並行ガード対象）**      |
| **`executionId`**   | **`string \| null`**             | **`null`**  | **現在の実行ID（race condition対策）**  |
| `executionStatus`   | `SkillExecutionStatus \| null`   | `null`      | 実行ステータス（executing/completed等） |
| `streamingMessages` | `SkillStreamMessage[]`           | `[]`        | ストリーミングメッセージ配列            |
| `pendingPermission` | `SkillPermissionRequest \| null` | `null`      | 保留中の権限リクエスト                  |
| `skillError`        | `string \| null`                 | `null`      | エラー情報                              |

### 1.2 アクションメソッド

**重要アクション**:

| メソッド              | シグネチャ                                | 目的                             |
| --------------------- | ----------------------------------------- | -------------------------------- |
| `executeSkill`        | `(prompt: string) => Promise<void>`       | **スキル実行（並行ガード対象）** |
| `abortExecution`      | `() => void`                              | 実行中断                         |
| `respondToPermission` | `(approved: boolean, remember?: boolean)` | 権限リクエスト応答               |
| `clearError`          | `() => void`                              | エラークリア                     |

### 2.3 Race Condition 対策（TASK-FIX-6-1で追加）

**対策内容** (arch-state-management.md セクション "race condition対策"):

| 対策項目                 | 説明                                                     | 目的                 |
| ------------------------ | -------------------------------------------------------- | -------------------- |
| executionId事前生成      | executeSkill()開始時にUUID生成、IPC呼び出し前にState設定 | 状態先行確保         |
| ストリームフィルタリング | \_handleStreamMessage等でexecutionIdを検証               | 遅延メッセージの破棄 |
| **並行実行禁止**         | isExecuting===true時に新規executeSkill()をスキップ       | **本タスクの対象**   |

### 2.4 状態管理の設計制約

**出典**: [03-state-management.md](../.claude/rules/03-state-management.md)

- **ドメイン分離**: agentSlice は Agent/Skill 実行に特化した単一責務
- **個別セレクタ**: `useIsExecuting()`, `useExecutionId()` など個別セレクタで再レンダー最適化
- **non-null assertion 禁止**: P48/P52 に準拠し `result.data?.providers` 形式を使用
- **Store全体参照禁止**: 必ず個別セレクタ経由で必要フィールドのみ取得

---

## 3. Phase 11/12 再監査で確認した事実

### 3.1 画面証跡

以下を `outputs/phase-11/screenshots/` に再取得した。

- `TC-11-01-agent-view-executing.png`
- `TC-11-02-agent-execution-disabled-input.png`
- `TC-11-03-chat-panel-disabled-toggle.png`

### 3.2 validator / コマンド実態

- `validate-phase12-implementation-guide.js` は Part 1/2 の内容要件まで見る
- `validate-phase-output.js` は workflow path の位置引数のみを受け付ける
- `validate-phase11-screenshot-coverage.js` は `phase-11-manual-test.md` と `manual-test-result.md` の両方に screenshot 参照が必要

## 4. Agent SDK インターフェース

### 2.1 executeSkill 型定義

**ファイル**: `packages/shared/src/agent/types.ts`

**Preload API** (IPC Bridge 経由):

```typescript
window.agentAPI.query(prompt: string, options?: QueryOptions): Promise<void>
```

**IPC チャネル**:

| チャネル        | 方向            | 説明           |
| --------------- | --------------- | -------------- |
| `agent:query`   | Renderer → Main | クエリ実行     |
| `agent:abort`   | Renderer → Main | クエリ中断     |
| `agent:message` | Main → Renderer | メッセージ送信 |

### 2.2 AgentStatus 型

**定義** (interfaces-agent-sdk.md 型定義セクション):

| プロパティ  | 型                | 説明               |
| ----------- | ----------------- | ------------------ |
| `status`    | `AgentStatusType` | ステータス種別     |
| `timestamp` | `number`          | 更新タイムスタンプ |
| `error`     | `string?`         | エラーメッセージ   |

**AgentStatusType 値**:

- `not_initialized` - 未初期化
- `initializing` - 初期化中
- `initialized` - 初期化完了
- `error` - エラー状態

### 2.3 isExecuting フラグの型定義

**出典**: arch-state-management.md

```typescript
isExecuting: boolean; // agentSlice 状態定義
```

**使用目的**:

1. Renderer: UI コンポーネントの disable 制御
2. Main: 並行実行禁止ガード
3. IPC: 実行状況を State で管理

---

## 5. 実装パターン

### 3.1 ガード（Guard Clause）パターン

**定義**: 関数入口で条件チェックし、不正値を早期リターンで処理

**場所**: architecture-implementation-patterns.md には明示的パターン記載なし（S12-S15参照）

**実装例** (agentSlice executeSkill):

```typescript
// ガード: 既に実行中なら処理を スキップ
if (isExecuting) {
  console.warn("Agent execution already in progress");
  return; // 並行実行禁止
}

// executionId を事前生成して State に設定
const newExecutionId = generateUUID();
set((state) => ({
  ...state,
  isExecuting: true,
  executionId: newExecutionId,
}));
```

### 3.2 並行制御パターン

**参照**: arch-state-management.md v3.8.2（TASK-FIX-SKILL-IMPORT）

| パターン          | 説明                                      | 適用箇所                |
| ----------------- | ----------------------------------------- | ----------------------- |
| idempotency guard | isExecuting===true → スキップ             | executeSkill()          |
| executionId 検証  | ストリームメッセージの executionId を確認 | \_handleStreamMessage() |
| 状態先行確保      | IPC呼び出し前に状態を確定                 | executeSkill() 開始時   |

### 3.3 関連パターンID

| パターン | 説明                                          | 参照                                         |
| -------- | --------------------------------------------- | -------------------------------------------- |
| S12      | Props最小化（Atoms層のStore依存排除）         | architecture-implementation-patterns.md L118 |
| S13      | Record型バリアント定義（型安全）              | architecture-implementation-patterns.md L149 |
| P31      | Zustand Store Hooks無限ループ（既解決）       | 06-known-pitfalls.md                         |
| P42      | .trim() バリデーション漏れ（P45/P52の前段）   | 06-known-pitfalls.md                         |
| P48      | useShallow 未適用による派生セレクタ無限ループ | 06-known-pitfalls.md                         |

---

## 6. UI/UX 仕様

### 4.1 disabled 制御の規定

**ファイル**: `ui-ux-agent-execution.md`

#### AgentMessageInput の disabled 制御

| 状態                | 送信ボタン | テキスト入力 | 根拠                 |
| ------------------- | ---------- | ------------ | -------------------- |
| **idle**            | 有効       | 有効         | 初期状態             |
| **executing**       | **無効**   | **無効**     | **isExecuting=true** |
| **streaming**       | **無効**   | **無効**     | ストリーミング処理中 |
| awaiting_permission | 無効       | 無効         | 権限確認待ち         |

#### AgentExecutionControls のボタン状態

| ボタン     | idle | executing/streaming | awaiting_permission | completed/error |
| ---------- | ---- | ------------------- | ------------------- | --------------- |
| キャンセル | 無効 | **有効**            | **有効**            | 無効            |
| クリア     | 有効 | 無効                | 無効                | 有効            |

**実装箇所**: `apps/desktop/src/renderer/components/molecules/AgentMessageInput/`

### 4.2 視覚フィードバック仕様

**ファイル**: `ui-ux-agent-execution.md` ステータスインジケータセクション

| 状態                | 視覚表現                   | 補足                 |
| ------------------- | -------------------------- | -------------------- |
| idle                | なし                       | 初期状態             |
| **executing**       | **ローディングスピナー**   | isExecuting の視認   |
| streaming           | カーソル点滅               | 応答受信中           |
| awaiting_permission | モーダル表示               | PermissionDialog     |
| completed           | 成功アイコン（緑チェック） | SkillExecutionStatus |
| error               | エラーアイコン（赤×）      | skillError != null   |
| cancelled           | キャンセルアイコン         | ユーザー中断         |

#### SkillStreamingView のステータス表示

| ステータス | バッジ表示 | 条件                          |
| ---------- | ---------- | ----------------------------- |
| executing  | 実行中     | **isExecuting === true**      |
| permission | 権限待ち   | pendingPermission !== null    |
| completed  | 完了       | executionStatus === completed |
| error      | エラー     | skillError !== null           |
| idle       | （非表示） | 初期状態・待機中              |

**参照**: ui-ux-agent-execution.md L413-421

---

## 7. タスク管理

### 5.1 task-workflow.md での登録状況

**タスクID**: `TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001`

**現在のステータス**:

| 検証項目                              | 結果    | 備考                     |
| ------------------------------------- | ------- | ------------------------ |
| verify-all-specs                      | ✅ PASS | 基本仕様検証OK           |
| validate-phase-output                 | ✅ PASS | Phase 12仕様構造OK       |
| validate-phase12-implementation-guide | ✅ PASS | 実装ガイド内容要件も充足 |

**結論**: workflow12 は再監査後に PASS へ是正済み。未完は `abortExecution` ガードのみ。

### 5.2 関連タスク

| 関連タスク            | 説明                                  | 状態    |
| --------------------- | ------------------------------------- | ------- |
| TASK-FIX-6-1          | agentSlice の race condition 対策追加 | ✅ 完了 |
| TASK-FIX-SKILL-IMPORT | idempotency guard パターン確立        | ✅ 完了 |
| UT-FIX-5-4            | Agent SDK API 型不整合修正            | ✅ 完了 |

### 7.3 未タスク検出

**検出**: `UT-FIX-CANCEL-SKILL-CONCURRENCY-GUARD-001`

- 指示書: `docs/30-workflows/completed-tasks/unassigned-task/task-fix-cancel-skill-concurrency-guard-001.md`
- 理由: `abortExecution` は execute 側と同レベルの再入ガードがまだない

---

## 6. 設計制約と注意点

### 6.1 並行制御の設計判断

| 判断基準            | 採用方式                              | 根拠                               |
| ------------------- | ------------------------------------- | ---------------------------------- |
| 単一実行保証        | isExecuting フラグ + ガード           | SkillExecutor シングルスレッド前提 |
| Race condition 防止 | executionId 事前生成 + メッセージ検証 | 非同期ストリーム処理の状態乖離防止 |
| UI 反応性           | Zustand 個別セレクタ経由              | P31/P48 回避                       |

### 6.2 TypeScript 型安全化

**参照**: interfaces-agent-sdk.md「SDK 型安全統合（TASK-9B-I）」セクション

- API キーは `env: { ANTHROPIC_API_KEY: string }` 形式
- AbortController インスタンスを直接渡す
- PermissionMode は SDK 実型に準拠（`default`/`acceptEdits` など）

### 6.3 セキュリティ原則

**IPC セキュリティ** (04-electron-security.md):

- Main Process で引数バリデーション（P42準拠の3段：型チェック → 空文字列 → トリム）
- エラーメッセージはサニタイズして Renderer に返す
- 機密情報（APIキー等）は Main に留める

---

## 調査結果サマリ

### ✅ 確認した仕様

1. **agentSlice**: `isExecuting`/`executionId` による並行制御設計が既に確立
2. **Agent SDK**: IPC チャネルと型定義が interfaces-agent-sdk.md で詳細に定義
3. **UI/UX**: disabled 制御とステータス表示の規定が ui-ux-agent-execution.md に明示
4. **実装パターン**: S12-S15 により Atoms 層の Props 最小化パターンが標準化
5. **タスク管理**: task-workflow.md に本タスク登録済み、ステータス追跡可能

### ⚠️ 未実装項目

- **implementation-guide**: Phase 12 で作成が必須（現在未着手）
  - 中学生レベルの概念説明が必須
  - agentSlice の並行制御フロー図が必要
  - UI disabled 制御のタイミング図が必要

### 📋 次フェーズの推奨

1. **Phase 12-Task 1**: 中学生レベル概念説明（isExecuting フラグの「一度に1つ」アナロジー）
2. **Phase 12-Task 2**: シーケンス図（executeSkill → isExecuting=true → UI disabled）
3. **Phase 12-Task 3**: API 契約チェックリスト（agentSlice 型とUI Props の整合確認）

---

**調査完了**: 2026-03-09
