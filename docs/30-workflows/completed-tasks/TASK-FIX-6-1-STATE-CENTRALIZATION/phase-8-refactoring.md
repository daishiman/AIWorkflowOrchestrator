# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| Phase名    | リファクタリング                          |
| 前提Phase  | Phase 7 (テストカバレッジ確認)            |
| 後続Phase  | Phase 9 (品質保証)                        |
| ステータス | 未実施                                    |
| 作成日     | 2026-02-09                                |
| タスクID   | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| タスク名   | スキル状態管理のZustand集約（仕様書準拠） |

---

## 目的

TDD Refactorフェーズ：テストを維持しながらコード構造を改善する。skillSliceを削除し、agentSliceへの状態集約を完了する。

## 背景

現在、スキル状態管理が以下の2箇所に分散している：

1. `skillSlice.ts` - スキル一覧・実行・権限管理
2. `agentSlice.ts` - エージェント全般の状態管理

仕様書（arch-state-management.md）に従い、agentSlice単一での状態管理に統合する。

---

## リファクタリング方針

### 全体フロー

```
1. skillSlice.tsの削除
2. skillSliceテストファイルの削除
3. store/index.tsの更新（skillSlice参照削除）
4. useSkillExecution.tsのagentSliceラッパー化
5. ChatPanel.tsxのimport更新
6. 全テスト成功確認
```

---

## 実行手順

### Task 8-1: skillSlice.tsの削除

**対象ファイル**:

```
apps/desktop/src/renderer/store/slices/skillSlice.ts
```

**手順**:

1. skillSlice.tsをgit rmで削除する
2. コンパイルエラーが発生することを確認（期待動作）

**コマンド**:

```bash
git rm apps/desktop/src/renderer/store/slices/skillSlice.ts
```

### Task 8-2: skillSliceテストファイルの削除

**対象ファイル**:

```
apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts
apps/desktop/src/renderer/store/slices/__tests__/skillSlice.edge-cases.test.ts
apps/desktop/src/renderer/store/slices/__tests__/skillSlice.integration.test.ts
apps/desktop/src/renderer/store/slices/__tests__/skillSlice.ipc.test.ts
apps/desktop/src/renderer/store/slices/__tests__/skillSlice.state-transition.test.ts
```

**手順**:

1. 全5ファイルをgit rmで削除する

**コマンド**:

```bash
git rm apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts
git rm apps/desktop/src/renderer/store/slices/__tests__/skillSlice.edge-cases.test.ts
git rm apps/desktop/src/renderer/store/slices/__tests__/skillSlice.integration.test.ts
git rm apps/desktop/src/renderer/store/slices/__tests__/skillSlice.ipc.test.ts
git rm apps/desktop/src/renderer/store/slices/__tests__/skillSlice.state-transition.test.ts
```

### Task 8-3: store/index.tsの更新

**対象ファイル**:

```
apps/desktop/src/renderer/store/index.ts
```

**変更内容**:

1. **import文の削除**:

```typescript
// 削除
import { createSkillSlice, type SkillSlice } from "./slices/skillSlice";
```

2. **AppStore型定義の更新**:

```typescript
// 変更前
export type AppStore = NavigationSlice &
  EditorSlice &
  // ... 他のSlice ...
  AgentSlice &
  ChatEditSlice &
  SkillSlice & // ← 削除
  PermissionHistorySlice;

// 変更後
export type AppStore = NavigationSlice &
  EditorSlice &
  // ... 他のSlice ...
  AgentSlice &
  ChatEditSlice &
  PermissionHistorySlice;
```

3. **Slice合成の更新**:

```typescript
// 変更前
(...args) => ({
  ...createNavigationSlice(...args),
  // ... 他のSlice ...
  ...createSkillSlice(...args),  // ← 削除
  ...createPermissionHistorySlice(...args),
}),

// 変更後
(...args) => ({
  ...createNavigationSlice(...args),
  // ... 他のSlice ...
  ...createPermissionHistorySlice(...args),
}),
```

4. **useSkillStoreセレクタの更新**:

```typescript
// 変更前（skillSlice参照）
export const useSkillStore = () =>
  useAppStore((state) => ({
    // 状態
    availableSkills: state.availableSkills,
    importedSkills: state.importedSkills,
    selectedSkillName: state.selectedSkillName,
    // ...
  }));

// 変更後（agentSlice参照に変更）
// Note: agentSliceにskillSliceの状態が統合されていることを前提
export const useSkillStore = () =>
  useAppStore((state) => ({
    // agentSliceから取得
    availableSkills: state.availableSkills,
    skills: state.skills,
    selectedSkill: state.selectedSkill,
    executionState: state.executionState,
    isLoading: state.isLoading,
    error: state.error,
    // アクション
    setSkills: state.setSkills,
    setAvailableSkills: state.setAvailableSkills,
    selectSkill: state.selectSkill,
    startExecution: state.startExecution,
    stopExecution: state.stopExecution,
    setPermissionRequest: state.setPermissionRequest,
    respondToPermission: state.respondToPermission,
    setLoading: state.setLoading,
    setError: state.setError,
  }));
```

### Task 8-4: useSkillExecution.tsのagentSliceラッパー化

**対象ファイル**:

```
apps/desktop/src/renderer/hooks/useSkillExecution.ts
```

**変更方針**:

- ローカルuseState/useRefを排除
- agentSliceのアクションを呼び出すラッパーに変更
- APIインターフェース（戻り値の型）は維持

**変更内容**:

```typescript
// 変更前
export function useSkillExecution(skillId: string): UseSkillExecutionReturn {
  const [messages, setMessages] = useState<SkillStreamMessage[]>([]);
  const [status, setStatus] = useState<ExecutionStatus>("idle");
  // ... ローカル状態使用

// 変更後
import { useAppStore } from "../store";

export function useSkillExecution(skillId: string): UseSkillExecutionReturn {
  // agentSliceから状態を取得
  const executionState = useAppStore((state) => state.executionState);
  const startExecution = useAppStore((state) => state.startExecution);
  const stopExecution = useAppStore((state) => state.stopExecution);
  const selectedSkill = useAppStore((state) => state.selectedSkill);
  const skills = useAppStore((state) => state.skills);

  // 状態のマッピング
  const status = executionState.status === "executing" ? "running" :
                 executionState.status === "cancelled" ? "aborted" :
                 executionState.status === "error" ? "error" :
                 executionState.status === "idle" ? "idle" : "completed";

  const messages = executionState.messages.map((msg) => ({
    // SkillStreamMessage形式に変換
    executionId: /* current execution id */,
    type: msg.type || "text",
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
  }));

  // ... agentSliceのアクションを使用
}
```

**注意事項**:

- 外部インターフェース（UseSkillExecutionReturn）は変更しない
- 呼び出し元のコードを変更せずに動作する後方互換性を維持

### Task 8-5: ChatPanel.tsxのimport更新

**対象ファイル**:

```
apps/desktop/src/renderer/components/chat/ChatPanel.tsx
```

**確認内容**:

- skillSliceからの直接import有無を確認
- 現状はuseAppStore経由でアクセスしているため、変更不要の可能性が高い
- store/index.tsの変更で自動的に対応される場合、skillSlice参照がある場合のみ対応

**チェックポイント**:

```bash
# skillSlice参照の検索
grep -rn "skillSlice" apps/desktop/src/renderer/components/chat/
```

### Task 8-6: AgentViewのローカルstate確認

**対象ファイル**:

```
apps/desktop/src/renderer/views/AgentView/index.tsx
```

**確認内容**:

- `windowWidth` stateはUIのレスポンシブ制御用であり、ビジネスロジックではない
- 03-state-management.mdの「コンポーネント固有UI」に該当
- **変更不要**（useState維持が適切）

---

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認:

| 確認項目       | コマンド                |
| -------------- | ----------------------- |
| ユニットテスト | `pnpm test`             |
| 統合テスト     | `pnpm test:integration` |
| E2Eテスト      | `pnpm test:e2e`         |

リファクタリング後も以下が維持されていること:

- IPC通信が正常に動作
- 状態同期が正常に動作
- エラーハンドリングが正常に動作

---

## 参照資料

| 参照資料               | パス                                                          | 内容           |
| ---------------------- | ------------------------------------------------------------- | -------------- |
| 状態管理仕様           | `aiworkflow-requirements/references/arch-state-management.md` | 状態配置の原則 |
| skillSlice（削除対象） | `apps/desktop/src/renderer/store/slices/skillSlice.ts`        | 削除対象コード |
| agentSlice（統合先）   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`        | 統合先コード   |
| ストア定義             | `apps/desktop/src/renderer/store/index.ts`                    | Slice合成箇所  |
| useSkillExecution      | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`        | ラッパー化対象 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                   | 内容            |
| ---------------- | -------------------------------------- | --------------- |
| 状態管理ルール   | `.claude/rules/03-state-management.md` | Zustand設計原則 |
| コーディング規約 | `.claude/rules/02-code-quality.md`     | コード品質基準  |

---

## 成果物

| 成果物               | パス                                                                                     | 内容             |
| -------------------- | ---------------------------------------------------------------------------------------- | ---------------- |
| リファクタリング記録 | `docs/30-workflows/TASK-FIX-6-1-STATE-CENTRALIZATION/outputs/phase-8/refactoring-log.md` | 変更内容の記録   |
| 削除ファイル一覧     | `docs/30-workflows/TASK-FIX-6-1-STATE-CENTRALIZATION/outputs/phase-8/deleted-files.md`   | 削除したファイル |

---

## TDD検証

### TDD サイクル確認

```bash
# 各タスク完了後にテスト実行
pnpm --filter @repo/desktop test

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

**確認項目**:

- [ ] リファクタリング後も既存のagentSliceテストが成功する
- [ ] 型エラーがないことを確認
- [ ] ESLintエラーがないことを確認

---

## 完了条件

- [ ] skillSlice.tsが削除されている
- [ ] skillSlice関連テストファイル（5ファイル）が削除されている
- [ ] store/index.tsからskillSlice参照が削除されている
- [ ] useSkillExecution.tsがagentSliceラッパーとして動作している
- [ ] 全テストが成功している
- [ ] TypeScript型エラーがない
- [ ] ESLint警告がない
- [ ] リファクタリング記録が文書化されている
- [ ] **本Phase内の全タスクを100%完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 5, 6, 7 が完了していること（agentSliceへの機能統合済み）
- **後続**: Phase 9 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### リファクタリング結果

- skillSlice.ts削除: {{完了/未完了}}
- テストファイル削除: {{完了/未完了}} ({{削除ファイル数}}/5)
- store/index.ts更新: {{完了/未完了}}
- useSkillExecution.ts更新: {{完了/未完了}}

### テスト結果

- 全テストPASS: {{PASS/FAIL}}
- 型エラー: {{数}}
- Lintエラー: {{数}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-FIX-6-1-STATE-CENTRALIZATION/phase-09-quality-assurance.md`
