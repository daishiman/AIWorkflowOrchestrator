# Phase 2: 設計

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 2                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 1で定義した要件（FR-01〜FR-04, NFR-01〜NFR-03）を満たすための技術設計を行う。Store層のガードパターンとUI層のdisabled制御の二重防御アーキテクチャを設計する。

## 実行タスク

- Store層ガード設計: `executeSkill` 関数冒頭の `isExecuting` ガードパターンを設計
- UI層回帰設計: 既存の実行中UIガード面の回帰確認方針を設計
- 二重防御アーキテクチャ: Store層 + UI層の防御が独立に機能する設計を策定

## 参照資料

| 資料名                 | パス                                                                                                              | 説明                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 1 要件定義       | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-1-requirements.md` | FR/NFR/AC定義               |
| agentSlice実装         | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                            | 現在のexecuteSkill実装      |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                      | Zustand Store設計の正本仕様 |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                       | 並行制御の実装パターン      |
| 要件定義書             | `outputs/phase-1/requirements-analysis.md`                                                                        | Phase 1 成果物              |

### システム仕様（aiworkflow-requirements）

- `arch-state-management.md`: Zustand Storeの状態更新パターン
- `interfaces-agent-sdk-skill.md`: `executeSkill` / `skillExecutionStatus` 契約
- `api-ipc-agent.md`: `skill:execute` 契約
- `ui-ux-agent-execution.md`: 実行中UIの disabled / hidden 契約
- `ui-ux-feature-skill-stream.md`: ChatPanel / SkillStreamingView 連動
- `architecture-implementation-patterns.md`: ガードパターンのリファレンス実装

### 前提Phase成果物

| 資料名         | パス                                                                                                              | 用途                |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-1-requirements.md` | FR/NFR/AC定義の参照 |

## 実行手順

### ステップ1: Store層ガード設計

#### 修正対象: `executeSkill` 関数（agentSlice.ts L742-797）

**現在のコード（問題箇所）:**

```typescript
executeSkill: async (prompt) => {
    const { selectedSkillName } = get();
    if (!selectedSkillName) return;
    // ← isExecuting チェックがない
    // ... authKey事前検証 ...
    const tempExecutionId = generateExecutionId();
    set({
      isExecuting: true,  // ← 非同期処理後に初めてtrueになる
      // ...
    });
```

**修正後の設計:**

```typescript
executeSkill: async (prompt) => {
    const { selectedSkillName, isExecuting } = get();
    if (!selectedSkillName) return;

    // 並行実行ガード: 既に実行中の場合は即座に拒否
    if (isExecuting) return;

    // ... 以降の処理は変更なし ...
```

**設計判断:**

| 判断項目                 | 決定                             | 理由                                       |
| ------------------------ | -------------------------------- | ------------------------------------------ |
| ガード位置               | `selectedSkillName` チェック直後 | 最も早い段階で拒否し、副作用を防止         |
| ガードの戻り値           | `void`（暗黙的return）           | エラーを投げず静かに拒否（UXを損なわない） |
| `isExecuting` の取得方法 | `get()` で分割代入               | Zustandの同期的な状態取得で競合なし        |
| ログ出力                 | なし                             | P20準拠（テスト環境でのログ出力汚染防止）  |

### ステップ2: UI層回帰設計

#### 対象コンポーネントの特定

現行実装では、二重実行を直接防ぐUI面は既に複数存在する。今回の必須変更は Store 層ガードであり、UI層は以下の既存挙動を回帰対象として扱う:

- `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`: `isExecuting === true` でボタン非表示
- `apps/desktop/src/renderer/views/AgentExecutionView/AgentExecutionView.tsx`: `AgentMessageInput` に `disabled={isExecuting}`
- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`: `skill-management-toggle` に `disabled={isExecuting}`、`SkillStreamingView` を条件表示

**回帰確認ポイント:**

```typescript
const { selectedSkillName, isExecuting } = get();
if (!selectedSkillName) return;
if (isExecuting) return;

// 既存UI側は store の isExecuting を反映済みであることを回帰確認する
// - ExecuteButton: isExecuting=true で null render
// - AgentExecutionView: AgentMessageInput disabled
// - ChatPanel: skill-management-toggle disabled + SkillStreamingView render
```

**設計判断:**

| 判断項目               | 決定                                       | 理由                                                                             |
| ---------------------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| UI変更の必須性         | 原則なし                                   | 既存UI面が `isExecuting` を既に反映しているため、今回の必須変更は Store 層ガード |
| `isExecuting` 参照方式 | 個別セレクタまたはプリミティブ直接セレクタ | P31は合成Hookで問題化するため、`useAppStore((s) => s.isExecuting)` 自体は非違反  |
| disabled / hidden 制御 | 既存UI仕様を維持                           | ExecuteButton / AgentExecutionView / ChatPanel の既存挙動を回帰確認対象に固定    |

### ステップ2-B: 選択肢比較と採用理由

| 比較軸                     | 案A: Store 層のみ最小修正 | 案B: Store + UI 全面改修 |
| -------------------------- | ------------------------- | ------------------------ |
| 根本原因への到達           | 高い                      | 高い                     |
| 変更量                     | 最小                      | 大                       |
| 既存 UI 再利用             | 最大                      | 低い                     |
| 回帰リスク                 | 低い                      | 高い                     |
| Phase 12 更新範囲          | 明確で小さい              | 広がりやすい             |
| 今回の branch 実態への適合 | 高い                      | 低い                     |

**採用結論**:

- 主変更は案Aを採用する
- ただし UX 保証を弱めないため、UI は「未変更でよい」ではなく「既存ガード面を回帰対象として固定する」という監査方針を合わせて採用する
- これにより、実装変更量は最小化しつつ、受け入れ基準 AC-04 / AC-05 を独立に満たせる

### ステップ3: 二重防御アーキテクチャ

```
[ユーザークリック]
      │
      ▼
  ┌─────────────┐
  │  UI層ガード  │  ← 既存UIが disabled / hidden / streaming で実行中を表現
  │  (1st防御)   │
  └──────┬──────┘
         │ (disabledが効かない場合: プログラム的呼び出し等)
         ▼
  ┌─────────────┐
  │ Store層ガード│  ← if (isExecuting) return; で実行を拒否
  │  (2nd防御)   │
  └──────┬──────┘
         │ (両方通過した場合のみ)
         ▼
  ┌─────────────┐
  │ 実行開始     │  ← set({ isExecuting: true, ... })
  └─────────────┘
```

**二重防御の必要性:**

1. UI層のみの防御では、テストやプログラム的な呼び出しで回避される
2. Store層のみの防御では、ユーザーに視覚的フィードバックが提供されない
3. 両方を独立に実装することで、どちらか一方が機能しなくても安全性が保たれる

### ステップ4: 影響範囲分析

| ファイル                                          | 変更内容                                                    | リスク |
| ------------------------------------------------- | ----------------------------------------------------------- | ------ |
| `agentSlice.ts`                                   | `executeSkill` 冒頭にガード追加（1行）                      | 低     |
| `views/AgentView/index.tsx`                       | 既存 `ExecuteButton` 連携の回帰確認                         | 低     |
| `views/AgentExecutionView/AgentExecutionView.tsx` | 既存 disabled 入力の回帰確認                                | 低     |
| `components/chat/ChatPanel.tsx`                   | 既存 toggle disabled / streaming 表示の回帰確認             | 低     |
| 既存テストファイル                                | 新ガードに合わせたテストケース追加 / 既存UI回帰テストの拡張 | 低     |

**変更量の見積もり:**

- Store層: 2行追加（`isExecuting` の分割代入追加 + `if` ガード追加）
- UI層: 原則コード変更なし（必要時のみ既存ガード面の微修正）
- テスト: Storeガード新規 + 既存UI回帰テスト拡張

### ステップ5: listener 復元経路の設計考慮

- `apps/desktop/src/renderer/store/setupSkillListeners.ts` は `onComplete` / `onError` を Store の `_handleComplete` / `_handleError` に接続している
- そのため本タスクの受け入れは、`executeSkill` 冒頭の再入ガードだけでなく、完了・失敗後に `isExecuting` が正しく戻る経路まで含めて評価する
- Phase 6 と Phase 11 では、listener 由来の状態復元が維持されていることを追加で確認する

## 統合テスト連携（Phase 1〜11は必須）

- Store層ガードの単体テスト設計を策定（Phase 4で実装）
- UI層disabled制御のコンポーネントテスト設計を策定（Phase 4で実装）
- 二重防御の結合テスト設計を策定（Phase 6で実装）

## 多角的チェック観点（AIが判断）

| 観点             | 適用 | チェック内容                                           |
| ---------------- | ---- | ------------------------------------------------------ |
| 状態管理         | 該当 | `get().isExecuting` の同期取得が競合しないことを確認   |
| UI/UX            | 該当 | disabled状態の視覚的フィードバックがHIG準拠であること  |
| アクセシビリティ | 該当 | disabled属性がスクリーンリーダーで正しく認識されること |

## 成果物

| 成果物 | パス                                                                                                        | 説明           |
| ------ | ----------------------------------------------------------------------------------------------------------- | -------------- |
| 設計書 | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md` | 本ドキュメント |

## 完了条件

- [ ] Store層ガードの挿入位置と実装パターンが決定されている
- [ ] UI層の回帰確認対象（ExecuteButton / AgentExecutionView / ChatPanel）が決定されている
- [ ] 案A / 案B の比較と採用理由が明文化されている
- [ ] 二重防御アーキテクチャ図が作成されている
- [ ] 影響範囲分析で変更対象ファイルが特定されている
- [ ] listener 復元経路の確認方針が設計に含まれている
- [ ] P31/P48の適用境界が正しく整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー
