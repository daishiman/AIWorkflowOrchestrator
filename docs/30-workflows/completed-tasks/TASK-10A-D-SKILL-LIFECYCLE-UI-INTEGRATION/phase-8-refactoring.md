# Phase 8: リファクタリング

## メタ情報

| 項目           | 値                                                                                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスク ID      | TASK-10A-D                                                                                                                                                                                                                            |
| タスク名       | スキルライフサイクル UI 統合                                                                                                                                                                                                          |
| Phase          | 8                                                                                                                                                                                                                                     |
| 作成日         | 2026-03-03                                                                                                                                                                                                                            |
| 前 Phase       | Phase 7（カバレッジ確認）                                                                                                                                                                                                             |
| 次 Phase       | Phase 9（品質検証）                                                                                                                                                                                                                   |
| 対象ファイル   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`, `apps/desktop/src/renderer/store/index.ts`, `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`, `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`  |
| テストファイル | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`, `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`, `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` |
| 状態           | 未着手                                                                                                                                                                                                                                |

## 目的

Phase 5-7 で実装した 4 ファイル（agentSlice.ts, store/index.ts, SkillManagementPanel.tsx, ChatPanel.tsx）のコードの品質を改善する。機能変更は行わない（リファクタリング前後で全テストが同一結果になること）。

---

## 実行タスク

- リファクタリング前のテスト状態記録: 対象 3 テストファイルの全件 PASS とテスト件数を記録する
- チェックリスト適用: 8 項目（IPC エラーハンドリング統一 / ビュー切替ロジック抽出 / 状態管理最適化 / コンポーネント分離 / レンダリング最適化 / 命名規則 / 不要 import 除去 / マジックナンバー除去）を順次適用する
- 前後比較テスト: リファクタリング前後で同一テスト結果を確認する
- レポート作成: 判定結果と差分を `outputs/phase-8/refactoring-result.md` に記録する

---

## 参照資料

| 参照資料                | パス                                                                                        | 内容                 |
| ----------------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義        | `phase-1-requirements.md`                                                                   | 受け入れ基準再確認   |
| Phase 2 設計            | `phase-2-design.md`                                                                         | 設計方針との整合確認 |
| Phase 5 実装            | `phase-5-implementation.md`                                                                 | 実装対象確認         |
| Phase 6 テスト拡充      | `phase-6-test-expansion.md`                                                                 | 拡充テスト観点確認   |
| Phase 7 カバレッジ確認  | `phase-7-coverage-check.md`                                                                 | カバレッジ結果確認   |
| UI コンポーネント仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI 仕様              |
| UI 機能仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 機能境界の確認       |
| IPC API 契約            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 操作 API 契約確認    |
| コード品質              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準             |
| セキュリティ            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ     |
| スキル IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | スキル操作の防御観点 |
| 実装パターン            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集       |
| 開発ガイドライン        | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | コーディング規約     |
| 状態管理アーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand 設計原則     |
| レビューゲート基準      | `.claude/skills/task-specification-creator/references/review-gate-criteria.md`              | レビュー判定基準     |

---

## 実行手順

### Step 1: リファクタリング前のテスト状態を記録する

以下の 3 コマンドを実行し、テスト件数と全 PASS を確認する。結果を `outputs/phase-8/refactoring-result.md` の「リファクタリング前」列に記録する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.test.ts
```

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
```

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.test.tsx
```

### Step 2: チェックリスト 8 項目を順次確認・適用する

以下の 8 項目を 1 つずつ確認する。該当する場合は修正を適用し、該当しない場合は「該当なし」の理由を記録する。**1 項目の修正ごとに対象テストを再実行し、全 PASS を確認する。**

#### 2-1: IPC エラーハンドリングパターン統一（agentSlice.ts）

- **判定基準**: agentSlice.ts 内の新規アクション（`analyzeSkill`, `applyImprovements`, `autoImproveSkill`, `createSkill`）のエラーハンドリングが、既存アクション（`fetchSkills`, `removeSkill`）と同一パターンであること
- **統一パターン**: `try { set({ isLoading: true }); const result = await window.electronAPI.skill.xxx(); ... } catch (error) { set({ error: error instanceof Error ? error.message : 'Unknown error' }); } finally { set({ isLoading: false }); }`
- **確認方法**: `grep -A 10 "catch" apps/desktop/src/renderer/store/slices/agentSlice.ts` で catch ブロックのパターンを比較する
- **修正が必要な場合**: 一貫していない catch ブロックを既存パターンに統一する

#### 2-2: ビュー切替ロジック抽出（SkillManagementPanel.tsx）

- **判定基準**: SkillManagementPanel.tsx のビュー切替ロジック（`currentView` の state 管理、ビュー遷移関数群）が以下のいずれかに該当する場合、カスタムフック `useSkillManagementView` として抽出する
  - ビュー切替に関連する useState が 3 つ以上存在する
  - ビュー切替関数（`handleEdit`, `handleAnalyze`, `handleCreate`, `handleBack` 等）が合計 5 つ以上存在する
- **確認方法**: `grep -c "useState\|const handle" apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` で関連 state と関数の数を計測する
- **抽出する場合**: `apps/desktop/src/renderer/components/skill/hooks/useSkillManagementView.ts` に切り出す。戻り値は `{ currentView, selectedSkill, handleEdit, handleAnalyze, handleCreate, handleBack }` とする
- **抽出しない場合**: 該当しない理由を記録する

#### 2-3: ChatPanel 状態管理の最適化（ChatPanel.tsx）

- **確認内容**: `showSkillManagement` の state が ChatPanel 内の `useState` で管理されていること。Zustand Store への昇格は不要であることを確認する
- **判定基準**: showSkillManagement を他のコンポーネントから参照する箇所がない場合は `useState` のままとする。参照箇所が 2 つ以上ある場合は Zustand Store への昇格を検討する
- **確認方法**: `grep -rn "showSkillManagement" apps/desktop/src/renderer/` で参照箇所を検索する

#### 2-4: コンポーネント分離

- **判定基準**: SkillManagementPanel.tsx 内の analysis ビューまたは create ビューのラッパーコード（propsの受け渡し部分）が 30 行を超える場合、ラッパーコンポーネントとして分離する
- **確認方法**: analysis ビューと create ビューのレンダリング部分の行数を確認する
- **分離する場合**: `SkillAnalysisViewWrapper.tsx`, `SkillCreateWizardWrapper.tsx` として分離する
- **分離しない場合**: 30 行以下であれば、分離不要と記録する

#### 2-5: レンダリング最適化

- **確認内容**: 以下のメモ化が適用されていること
  - `filteredImported`（検索クエリでフィルタされたスキル一覧）が `useMemo` でメモ化されている。期待する依存配列: `[importedSkills, searchQuery]`
  - イベントハンドラ（`handleDelete`, `handleAnalyze` 等）で props として渡されるコールバックが `useCallback` でメモ化されている（SkillCard 等の子コンポーネントに渡す場合のみ）
- **確認方法**: `grep -n "useMemo\|useCallback" apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` で使用箇所を確認する
- **修正が必要な場合**: 不足しているメモ化を追加する

#### 2-6: 命名規則

- **確認内容**:
  - boolean 変数: `is` / `has` / `can` / `should` プレフィックスが付いていること（例: `isLoading`, `hasSkills`, `isAnalyzing`）
  - イベントハンドラ: `handle` + 動詞の形式であること（例: `handleDelete`, `handleAnalyze`, `handleCreate`）
  - P45 対策: agentSlice.ts 内の関数引数名が実際のセマンティクスと一致していること（`skillName` に統一されていること。`skillId` が残っていないこと）
- **確認方法**:
  - `grep -n "const is\|const has\|const can\|const should" agentSlice.ts SkillManagementPanel.tsx ChatPanel.tsx` で boolean 命名を確認する
  - `grep -n "skillId" apps/desktop/src/renderer/store/slices/agentSlice.ts` で P45 対策の命名を確認する
- **修正が必要な場合**: 規則に沿わない命名をリネームし、テストファイルの参照も同時に更新する

#### 2-7: 不要 import の除去

- **確認内容**: 4 つの対象ファイルに使用されていない import 文が存在しないこと
- **確認方法**: `cd apps/desktop && pnpm lint` の出力で `no-unused-vars` または `unused-imports` の警告を確認する
- **修正が必要な場合**: 該当する import 文を削除する

#### 2-8: マジックナンバー除去

- **確認内容**: 対象ファイル内の数値リテラル（タイムアウト値、配列のインデックス、ピクセル値）が定数として名前付けされていること
- **確認方法**: `grep -n "[0-9]" apps/desktop/src/renderer/store/slices/agentSlice.ts apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx apps/desktop/src/renderer/components/chat/ChatPanel.tsx` で数値リテラルを検索する
- **除外対象**: Tailwind CSS のクラス内数値（`p-4`, `gap-2` 等）、0 と 1 は除外
- **修正が必要な場合**: `const TOAST_DISPLAY_DURATION_MS = 3000;` のように意味のある名前の定数に置き換える

### Step 3: リファクタリング後のテスト確認

Step 1 と同一の 3 コマンドを再実行し、テスト件数と結果が Step 1 と完全に一致することを確認する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.test.ts
```

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx
```

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.test.tsx
```

### Step 4: 変更内容の確認

```bash
git diff --stat
```

変更ファイルがリファクタリング対象の 4 ファイル（および抽出したフックファイル、テストファイル）のみであることを確認する。無関係なファイルの変更が含まれている場合は `git checkout` で復元する。

### Step 5: リファクタリングレポートの作成

`outputs/phase-8/refactoring-result.md` に以下を記録する:

```markdown
# Phase 8 リファクタリングレポート

## チェックリスト結果

| #   | 項目                      | 結果                 | 変更内容 / 該当なしの理由 |
| --- | ------------------------- | -------------------- | ------------------------- |
| 1   | IPCエラーハンドリング統一 | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 2   | ビュー切替ロジック抽出    | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 3   | ChatPanel状態管理最適化   | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 4   | コンポーネント分離        | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 5   | レンダリング最適化        | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 6   | 命名規則（P45対策含む）   | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 7   | 不要import除去            | ✅適用 / N/A該当なし | （具体的な内容を記載）    |
| 8   | マジックナンバー除去      | ✅適用 / N/A該当なし | （具体的な内容を記載）    |

## テスト結果比較

| テストファイル                | リファクタリング前（件数/PASS） | リファクタリング後（件数/PASS） |
| ----------------------------- | ------------------------------- | ------------------------------- |
| agentSlice.test.ts            | （件数）/（件数）               | （件数）/（件数）               |
| SkillManagementPanel.test.tsx | （件数）/（件数）               | （件数）/（件数）               |
| ChatPanel.test.tsx            | （件数）/（件数）               | （件数）/（件数）               |

## 変更ファイル一覧

（git diff --stat の出力を貼り付け）
```

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、analyze/applyImprovements/autoImprove/create の入力・戻り値契約を一致させる
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する

## 成果物

| 成果物                   | パス                                    | 説明                                 |
| ------------------------ | --------------------------------------- | ------------------------------------ |
| リファクタリングレポート | `outputs/phase-8/refactoring-result.md` | 8 項目のチェック結果とテスト比較結果 |

---

## 完了条件

- [ ] チェックリスト 8 項目の全てを確認した（該当なしの場合もその旨を記録した）
- [ ] 1 項目の修正ごとにテストを再実行し、全 PASS を確認した
- [ ] リファクタリング後の全テスト（3 ファイル）が PASS した
- [ ] リファクタリング前後でテスト件数と結果が同一である（機能変更なし）
- [ ] P45 対策: agentSlice.ts 内に `skillId` の命名ドリフトが残っていない
- [ ] `git diff --stat` で変更ファイルがリファクタリング対象のみである
- [ ] `outputs/phase-8/refactoring-result.md` を作成した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 9: 品質検証
