# 状態管理集約 - タスク指示書

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| タスク名     | スキル状態管理のZustand集約（仕様書準拠） |
| 分類         | リファクタリング                          |
| 対象機能     | Zustand Store（スキル関連slice）          |
| 優先度       | 高                                        |
| 見積もり規模 | 中規模                                    |
| ステータス   | 未実施                                    |
| 発見元       | 無限ループ問題調査（Phase 12相当）        |
| 発見日       | 2026-02-03                                |
| 関連Phase    | Phase 6（TASK-6-1の前提修正）             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル機能の状態管理が3つの異なる経路で行われている。仕様書（specification.md §3.1）では`agentSlice`（単一）での状態管理を定義しているが、現在は`skillSlice`, `skillExecutionSlice`, `agentSlice`の3つが混在。

### 1.2 問題点・課題

| 問題                                  | 影響                               |
| ------------------------------------- | ---------------------------------- |
| 同じデータを複数箇所で管理            | 同期ズレのリスク                   |
| AgentViewがローカルstateを持つ        | Zustand storeと状態が乖離          |
| ChatPanelとAgentViewが異なるAPIを使用 | 動作の不整合                       |
| executionIdのタイミング問題           | race conditionによるメッセージ損失 |
| useSkillExecutionの独立した状態       | skillSliceとの二重管理             |

**状態管理の3経路**:
| 経路 | 使用コンポーネント | 問題点 |
|------|------------------|--------|
| skillSlice (Zustand) | ChatPanel | 正規ルート |
| ローカルstate | AgentView | store非経由 |
| useSkillExecution (独立hook) | 一部コンポーネント | 独自状態 |

**executionIdのタイミング問題（Race Condition）**:

```
executeSkill() 実行フロー:

T1: set({ isExecuting: true, streamingMessages: [] }) ← メッセージをクリア
    |
T2: await window.electronAPI.skill.execute() ← IPC呼び出し開始
    |
T2a: Main ProcessからIPCストリームメッセージ到着 ← この時点で...
     → _handleStreamMessage()が呼ばれる
     → executionId はまだ null の可能性がある
    |
T3: set({ executionId: response.executionId }) ← executionId設定（遅い）
```

### 1.3 放置した場合の影響

- スキル実行時の状態不整合（無限ループの原因となった）
- メッセージの損失
- UIの不整合（あるコンポーネントでは実行中、別では完了など）

---

## 2. 何を達成するか（What）

### 2.1 目的

仕様書に準拠した単一の状態管理（agentSlice）を確立する。

### 2.2 最終ゴール

1. `agentSlice`に全スキル状態を集約（仕様書準拠）
2. `skillSlice`, `skillExecutionSlice`を削除
3. AgentViewのローカルstateをagentSlice経由に変更
4. `useSkillExecution`をagentSliceのラッパーに変更

### 2.3 スコープ

#### 含むもの

- skillSlice → agentSliceへの統合
- skillExecutionSlice → agentSliceへの統合
- AgentViewのローカルstate排除
- useSkillExecutionの修正
- race condition対策

#### 含まないもの

- 新しい状態の追加（それはTASK-6-1で実施）
- UI変更
- SkillAPIの変更（TASK-FIX-5-1で実施済み前提）

### 2.4 成果物

| 成果物                      | 説明                                  |
| --------------------------- | ------------------------------------- |
| 統合されたagentSlice        | 全スキル状態を管理                    |
| 削除対象ファイル            | skillSlice.ts, skillExecutionSlice.ts |
| 修正されたAgentView         | ローカルstate排除                     |
| 修正されたuseSkillExecution | agentSliceラッパー                    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-1-1-TYPE-ALIGNMENT完了
- TASK-FIX-4-1-IPC-CONSOLIDATION完了
- TASK-FIX-5-1-SKILL-API-UNIFICATION完了

### 3.2 依存タスク

- TASK-FIX-5-1-SKILL-API-UNIFICATION（SkillAPIが統一されていること）

### 3.3 必要な知識

- Zustand状態管理
- React hooks
- Electron IPC通信

### 3.4 推奨アプローチ

1. 仕様書（specification.md §4）の状態定義を正とする
2. agentSliceを拡張して全状態を含む
3. 他のslice/stateを段階的に移行
4. 不要なファイルを削除

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従う。

### Step 1: 現在の状態管理の棚卸し

#### 目的

3つの状態管理経路の全容を把握

#### 手順

1. `skillSlice.ts`の状態・アクションをリストアップ
2. `skillExecutionSlice.ts`の状態・アクションをリストアップ
3. `agentSlice.ts`の状態・アクションをリストアップ
4. AgentViewのローカルstateを特定
5. useSkillExecutionの内部状態を特定

#### 成果物

- 状態管理棚卸しリスト

### Step 2: 統一状態設計

#### 目的

仕様書に準拠した統一状態を設計

#### 手順

1. 仕様書の状態定義（SkillContextValue）を確認
2. 3つの経路を統合した状態を設計
3. race condition対策を含める

**統一状態設計（仕様書準拠）**:

```typescript
interface AgentSliceState {
  // スキル一覧
  availableSkills: SkillMetadata[];
  importedSkills: ImportedSkill[];

  // 選択・実行
  selectedSkill: string | null;
  isExecuting: boolean;
  executionId: string | null;

  // ストリーミング
  streamingMessages: SkillStreamMessage[];

  // エラー
  error: string | null;

  // アクション
  fetchSkills: () => Promise<void>;
  importSkill: (skillId: string) => Promise<void>;
  removeSkill: (skillId: string) => Promise<void>;
  selectSkill: (skillId: string | null) => void;
  executeSkill: (prompt: string) => Promise<void>;
  abortExecution: () => void;

  // IPCイベントハンドラ（内部）
  _handleStreamMessage: (message: SkillStreamMessage) => void;
  _handleComplete: (data: { executionId: string }) => void;
  _handleError: (data: { executionId: string; error: string }) => void;
}
```

#### 成果物

- 統一状態設計書

### Step 3: agentSlice拡張

#### 目的

agentSliceに全状態を集約

#### 手順

1. `agentSlice.ts`に新しい状態・アクションを追加
2. race condition対策（executionIdの事前設定）を実装
3. IPCイベントリスナーをsetupSkillListenersで設定

**race condition対策**:

```typescript
executeSkill: async (prompt: string) => {
  // 1. 先にexecutionIdを生成（UUID）
  const tempExecutionId = generateUUID();

  set({
    isExecuting: true,
    streamingMessages: [],
    executionId: tempExecutionId, // ← 先に設定
  });

  try {
    // 2. IPC呼び出し
    const response = await window.electronAPI.skill.execute({
      prompt,
      tempExecutionId, // サーバーに渡す
    });

    // 3. サーバーからのexecutionIdで更新
    set({ executionId: response.executionId });
  } catch (error) {
    set({ error: error.message, isExecuting: false });
  }
};
```

#### 成果物

- 拡張されたagentSlice.ts

### Step 4: 移行と削除

#### 目的

不要なファイルを削除し、呼び出し元を修正

#### 手順

1. AgentViewのローカルstateをagentSlice使用に変更
2. useSkillExecutionをagentSliceのラッパーに変更
3. skillSlice.tsを削除
4. skillExecutionSlice.tsを削除
5. テスト実行

#### 成果物

- 修正されたAgentView
- 修正されたuseSkillExecution
- 削除されたファイル

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] agentSlice単一で全スキル状態を管理
- [ ] skillSlice.tsが削除されている
- [ ] skillExecutionSlice.tsが削除されている
- [ ] AgentViewにローカルstateがない
- [ ] useSkillExecutionがagentSliceのラッパー

### 品質要件

- [ ] 全テストがPASS
- [ ] race conditionが解消
- [ ] 状態の同期ズレがない

### ドキュメント要件

- [ ] 状態管理変更の記録

---

## 6. 検証方法

### テストケース

1. スキル実行→完了の状態遷移
2. 並行メッセージ受信時の状態整合性
3. エラー発生時の状態回復
4. 中断（abort）時の状態クリーンアップ

### 検証手順

1. 単体テスト実行
2. E2Eテスト実行
3. 手動での状態遷移確認

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                     |
| ---------------------- | ------ | -------- | ------------------------ |
| 状態移行時のデータ損失 | 高     | 中       | 段階的移行、テストで検証 |
| パフォーマンス低下     | 中     | 低       | セレクタ最適化           |
| 既存テストの破壊       | 中     | 高       | テスト修正を先行         |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-import-agent-system/specification.md` §4（状態管理）
- `apps/desktop/src/renderer/store/slices/skillSlice.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`

### 参考資料

- Zustand Best Practices
- React State Management Patterns

---

## 9. 備考

### 発見経緯

無限ループ問題の調査中に、AgentViewのuseCallback依存配列に`isLoading`が含まれていたことが直接原因と判明。しかし、その背景には3つの状態管理経路の存在があり、どこの状態を参照すべきか不明確だったことが根本原因。

### 補足事項

このタスクはTASK-6-1（SkillSlice）の前提となる修正タスク。TASK-6-1では仕様書に基づく完全な状態管理を実装するが、本タスクでは既存の分散を集約する。

**仕様書との整合性**:
仕様書では`agentSlice`を維持し、型のみ拡張することを想定している。本タスクはその方針に沿って、skillSlice/skillExecutionSliceの機能をagentSliceに統合する。
