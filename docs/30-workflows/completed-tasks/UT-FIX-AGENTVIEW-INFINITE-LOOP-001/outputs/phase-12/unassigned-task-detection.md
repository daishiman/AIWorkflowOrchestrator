# 未タスク検出レポート: UT-FIX-AGENTVIEW-INFINITE-LOOP-001

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| Phase    | 12 - ドキュメント                  |
| 作成日   | 2026-02-12                         |
| 再検証日 | 2026-02-12                         |
| 検出件数 | 2件                                |

---

## 検出方法

1. AgentView ソースコードの目視確認（型アサーション箇所の特定）
2. `grep` による他Viewのインラインセレクタ使用状況の調査
3. `grep` による合成Store Hook（`useAgentStore()`, `useAuthModeStore()`, `useLLMStore()`）の使用状況の調査

---

## 検出結果

### UT-1: AgentViewの型アサーション（P24既知問題）

| 項目        | 内容                                                             |
| ----------- | ---------------------------------------------------------------- |
| 検出箇所    | `apps/desktop/src/renderer/views/AgentView/index.tsx` L247, L250 |
| 重要度      | 低（既知）                                                       |
| 関連Pitfall | P24（Store型定義とPreload型定義の不統一）                        |
| 既存タスク  | UT-FIX-5-1-001                                                   |

**詳細:**

```typescript
// L247: importedSkillsの型をSkill[]にアサーション
const skills = importedSkills as unknown as Skill[];

// L250: availableSkillsMetadataの型をSkill[]にアサーション
const availableSkills = availableSkillsMetadata as unknown as Skill[];
```

`agentSlice` の `importedSkills` 型（`ImportedSkill[]`相当）と、`@repo/shared/types/skill` の `Skill` 型が完全に一致しないため、`as unknown as Skill[]` による型アサーションが必要になっている。これは P24 で既に記録済みであり、UT-FIX-5-1-001 で対応予定。

**対応**: 参照のみで実体ファイルが存在しない状態だったため、未タスク指示書を新規作成した。

| 項目         | 内容                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| 作成ファイル | `docs/30-workflows/completed-tasks/task-ut-fix-5-1-001-agentview-type-assertion.md`                   |
| 配置確認     | `ls docs/30-workflows/completed-tasks/task-ut-fix-5-1-001-agentview-type-assertion.md` で存在確認済み |
| 参照更新     | `task-workflow.md` の未タスク参照パスと一致                                                           |

---

### UT-2: 他Viewのインラインセレクタ使用（潜在的P31リスク）

| 項目        | 内容                                                                                |
| ----------- | ----------------------------------------------------------------------------------- |
| 検出箇所    | 複数のView（下記詳細）                                                              |
| 重要度      | 中                                                                                  |
| 関連Pitfall | P31（Zustand Store Hooks無限ループ）                                                |
| 既存タスク  | task-imp-store-hooks-remaining-migration / task-ref-store-hooks-deprecate-composite |

**詳細:**

以下のViewが `useAppStore((state) => state.xxx)` のインラインセレクタパターンを使用している。

| View                      | インラインセレクタ数 | useEffectへの関数依存         | P31リスク                          |
| ------------------------- | -------------------- | ----------------------------- | ---------------------------------- |
| `ChatView/index.tsx`      | 約20個               | あり（`initializeTemplates`） | 低（単一アクション関数の個別取得） |
| `DashboardView/index.tsx` | 3個                  | なし                          | なし                               |
| `GraphView/index.tsx`     | 4個                  | なし                          | なし                               |
| `AuthView/index.tsx`      | 4個                  | なし                          | なし                               |

**分析:**

- **ChatView**: `initializeTemplates` を `useAppStore((state) => state.initializeTemplates)` で個別に取得し、`useEffect` の依存配列に含めている（L90-97）。これは実質的に個別セレクタと同等のパターンであり、Zustandのアクション参照は安定しているため、**現時点でP31の無限ループリスクは低い**。ただし、`store/index.ts` にエクスポートされた個別セレクタHookではなくローカルなインラインセレクタであるため、コード一貫性の観点から移行が望ましい。
- **DashboardView, GraphView, AuthView**: `useEffect` の依存配列にアクション関数を含めていないため、P31のリスクはない。

**対応**: 新規作成ではなく既存未タスクへマッピングした。物理ファイルの存在も確認済み。

| タスクID                                 | 指示書パス                                                                      | 配置確認 |
| ---------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| task-imp-store-hooks-remaining-migration | `docs/30-workflows/unassigned-task/task-imp-store-hooks-remaining-migration.md` | 確認済み |
| task-ref-store-hooks-deprecate-composite | `docs/30-workflows/unassigned-task/task-ref-store-hooks-deprecate-composite.md` | 確認済み |

---

## 合成Store Hook使用状況

合成Store Hook（`useAgentStore()`, `useAuthModeStore()`, `useLLMStore()`）のコンポーネント内使用を調査した。

| Hook                 | 使用箇所（テスト・コメント除く）                        |
| -------------------- | ------------------------------------------------------- |
| `useAgentStore()`    | 0件（使用なし）                                         |
| `useAuthModeStore()` | 0件（使用なし、`store/index.ts` のJSDocコメント内のみ） |
| `useLLMStore()`      | 0件（使用なし、テストファイル内のコメントのみ）         |

全ての合成Store Hookは既に `@deprecated` マーク済みであり、コンポーネントでの実使用は確認されなかった。

---

## まとめ

| #    | 検出項目                   | 新規タスク作成             | 理由                                                       |
| ---- | -------------------------- | -------------------------- | ---------------------------------------------------------- |
| UT-1 | AgentView型アサーション    | 実施（1件新規作成）        | 参照先ファイル欠落を解消し、未タスク指示書を配置           |
| UT-2 | 他Viewのインラインセレクタ | 不要（既存タスクへマップ） | 現時点で無限ループリスクは低い。既存未タスクで段階移行可能 |

---

## 未タスク配置検証（Phase 12 要件）

| 検証項目                                            | 結果 |
| --------------------------------------------------- | ---- |
| 未タスク指示書の物理ファイル存在確認                | PASS |
| `docs/30-workflows/unassigned-task/` 配置規則       | PASS |
| `task-workflow.md` の参照パス整合性（本タスク関連） | PASS |

### 参照整合の機械検証（branch全体）

| 項目             | 結果                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| 実行コマンド     | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` |
| 検査対象リンク数 | 60                                                                                  |
| 参照切れ件数     | 0                                                                                   |
| 判定             | `ALL_LINKS_EXIST`                                                                   |
