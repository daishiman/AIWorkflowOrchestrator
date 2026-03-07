# Phase 8: リファクタリング

## メタ情報

| 項目           | 値                                                                                                                                                                                                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスク ID      | TASK-10A-F                                                                                                                                                                                                                                                                                                            |
| タスク名       | スキルライフサイクル UI の Store 駆動統合                                                                                                                                                                                                                                                                             |
| 機能名         | store-driven-lifecycle-ui                                                                                                                                                                                                                                                                                             |
| Phase          | 8                                                                                                                                                                                                                                                                                                                     |
| 作成日         | 2026-03-07                                                                                                                                                                                                                                                                                                            |
| 前 Phase       | Phase 7（カバレッジ確認）                                                                                                                                                                                                                                                                                             |
| 次 Phase       | Phase 9（品質検証）                                                                                                                                                                                                                                                                                                   |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`, `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`, `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`, `apps/desktop/src/renderer/store/slices/agentSlice.ts`, `apps/desktop/src/renderer/store/index.ts` |
| テストファイル | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts`, `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`, `apps/desktop/src/renderer/components/skill/hooks/__tests__/useSkillAnalysis.test.ts`                                                                       |
| 状態           | 未着手                                                                                                                                                                                                                                                                                                                |

## 目的

Phase 5-7 で実装した Store 駆動統合（直接 IPC 呼び出し排除）のコードの品質を改善する。機能変更は行わない（リファクタリング前後で全テストが同一結果になること）。

---

## 実行タスク

- リファクタリング前のテスト状態記録: 対象テストファイルの全件 PASS とテスト件数を記録する
- チェックリスト適用: 8 項目（store action パターン統一 / useSkillAnalysis フック整理 / テストヘルパー共通化 / 型定義配置整理 / 不要 import 除去 / 命名規則 / マジックナンバー除去 / レンダリング最適化）を順次適用する
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
| Phase 7 カバレッジ確認  | `phase-7-coverage-verification.md`                                                          | カバレッジ結果確認   |
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

## リファクタリングルール

- 外部インターフェース（agentSlice の action 名、セレクタ名、コンポーネントの Props 型）は変更しない
- テストは全て通り続ける（Green 維持）
- P31 対策（個別セレクタ使用）を崩さない
- P48 対策（useShallow 適用）を崩さない
- 1 項目の修正ごとにテストを再実行し、Green を維持する

---

## 実行手順

### Step 1: リファクタリング前のテスト状態を記録する

以下のコマンドを実行し、テスト件数と全 PASS を確認する。結果を `outputs/phase-8/refactoring-result.md` の「リファクタリング前」列に記録する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.test.ts
```

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/hooks/__tests__/useSkillAnalysis.test.ts
```

### Step 2: チェックリスト 8 項目を順次確認・適用する

以下の 8 項目を 1 つずつ確認する。該当する場合は修正を適用し、該当しない場合は「該当なし」の理由を記録する。**1 項目の修正ごとに対象テストを再実行し、全 PASS を確認する。**

#### 2-1: store action の loading/error 状態遷移パターン統一（agentSlice.ts）

- **判定基準**: agentSlice.ts 内の新規アクション（`analyzeSkill`, `applyImprovements`, `autoImproveSkill`, `createSkill`）のエラーハンドリングが、既存アクション（`fetchSkills`, `removeSkill`）と同一パターンであること
- **統一パターン**: `try { set({ isXxxLoading: true, xxxError: null }); const result = await ...; set({ xxxResult: result, isXxxLoading: false }); } catch (error) { set({ xxxError: error instanceof Error ? error.message : 'Unknown error', isXxxLoading: false }); }`
- **確認方法**: `grep -A 10 "catch" apps/desktop/src/renderer/store/slices/agentSlice.ts` で catch ブロックのパターンを比較する
- **修正が必要な場合**: 一貫していない catch ブロックを既存パターンに統一する

#### 2-2: useSkillAnalysis フックの責務整理（hooks/useSkillAnalysis.ts）

- **判定基準**: useSkillAnalysis.ts の内部で直接 IPC 呼び出しが Phase 5 で Store アクション呼び出しに置き換えられた後、元の IPC 呼び出しコード（コメントアウト含む）やデッドコードが残っていないこと
- **確認方法**: `grep -n "window.electronAPI\|// .*electronAPI\|/\*.*electronAPI" apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で残存コードを検索する
- **修正が必要な場合**: コメントアウトされた旧コード、未使用の変数宣言、到達不能コードを削除する

#### 2-3: テストヘルパーの共通化

- **判定基準**: agentSlice.test.ts と useSkillAnalysis.test.ts で `window.electronAPI` のモック設定が重複して定義されている箇所が 3 つ以上ある場合、テストヘルパー関数として共通化する
- **確認方法**: `grep -c "electronAPI" apps/desktop/src/renderer/store/slices/__tests__/agentSlice.test.ts apps/desktop/src/renderer/components/skill/hooks/__tests__/useSkillAnalysis.test.ts` でモック設定の重複数を確認する
- **共通化する場合**: テストファイル内のトップレベルにヘルパー関数 `createMockElectronAPI()` を定義し、各 `beforeEach` から呼び出す形に統一する。テストファイル間で共有するファイルは作成しない（テストファイル間の依存を避ける）
- **共通化しない場合**: 重複が 2 箇所以下であれば共通化不要と記録する

#### 2-4: 型定義の配置整理

- **判定基準**: Phase 5 で追加した型（`SkillCreateResult`, `SkillAnalysisResult`, `SkillImprovement` 等）が以下の配置ルールに従っていること
  - Store 内部でのみ使用する型: `agentSlice.ts` 内で定義
  - コンポーネントと Store の両方で使用する型: `packages/shared/src/types/` 配下で定義
  - コンポーネント内部でのみ使用する型: 各コンポーネントファイル内で定義
- **確認方法**: `grep -rn "export.*type\|export.*interface" apps/desktop/src/renderer/store/slices/agentSlice.ts apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で型定義の配置を確認する
- **修正が必要な場合**: 配置ルールに違反している型を正しい場所に移動する

#### 2-5: 不要 import の除去

- **確認内容**: 対象ファイルに使用されていない import 文が存在しないこと
- **確認方法**: `cd apps/desktop && pnpm lint` の出力で `no-unused-vars` または `unused-imports` の警告を確認する
- **修正が必要な場合**: 該当する import 文を削除する

#### 2-6: 命名規則

- **確認内容**:
  - boolean 変数: `is` / `has` / `can` / `should` プレフィックスが付いていること（例: `isAnalyzing`, `isCreating`）
  - イベントハンドラ: `handle` + 動詞の形式であること（例: `handleAnalyze`, `handleCreate`）
  - P45 対策: agentSlice.ts 内の関数引数名が実際のセマンティクスと一致していること（`skillName` に統一されていること。`skillId` が残っていないこと）
- **確認方法**:
  - `grep -n "skillId" apps/desktop/src/renderer/store/slices/agentSlice.ts apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で P45 命名ドリフトを確認する
- **修正が必要な場合**: 規則に沿わない命名をリネームし、テストファイルの参照も同時に更新する

#### 2-7: マジックナンバー除去

- **確認内容**: 対象ファイル内の数値リテラル（タイムアウト値、リトライ回数、配列のインデックス）が定数として名前付けされていること
- **確認方法**: `grep -n "[0-9]" apps/desktop/src/renderer/store/slices/agentSlice.ts apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で数値リテラルを検索する
- **除外対象**: Tailwind CSS のクラス内数値（`p-4`, `gap-2` 等）、0 と 1 は除外
- **修正が必要な場合**: `const ANALYSIS_TIMEOUT_MS = 30000;` のように意味のある名前の定数に置き換える

#### 2-8: レンダリング最適化（SkillCreateWizard.tsx, useSkillAnalysis.ts）

- **確認内容**:
  - Store セレクタの取得が個別セレクタ（`useAnalyzeSkill()`, `useCreateSkill()` 等）で行われていること（P31 対策維持）
  - `.filter()` / `.map()` で配列を返す派生セレクタが `useShallow` でラップされていること（P48 対策維持）
  - イベントハンドラで子コンポーネントに渡すコールバックが `useCallback` でメモ化されていること
- **確認方法**:
  - `grep -n "useShallow\|useMemo\|useCallback" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` で使用箇所を確認する
- **修正が必要な場合**: 不足しているメモ化を追加する

### Step 3: リファクタリング後のテスト確認

Step 1 と同一の 3 コマンドを再実行し、テスト件数と結果が Step 1 と完全に一致することを確認する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.test.ts
```

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/hooks/__tests__/useSkillAnalysis.test.ts
```

### Step 4: 変更内容の確認

```bash
git diff --stat
```

変更ファイルがリファクタリング対象ファイル（およびテストファイル）のみであることを確認する。無関係なファイルの変更が含まれている場合は `git checkout` で復元する。

### Step 5: リファクタリングレポートの作成

`outputs/phase-8/refactoring-result.md` に以下を記録する:

```markdown
# Phase 8 リファクタリングレポート

## チェックリスト結果

| #   | 項目                              | 結果               | 変更内容 / 該当なしの理由 |
| --- | --------------------------------- | ------------------ | ------------------------- |
| 1   | store action パターン統一         | 適用 / N/A該当なし | （具体的な内容を記載）    |
| 2   | useSkillAnalysis フック整理       | 適用 / N/A該当なし | （具体的な内容を記載）    |
| 3   | テストヘルパー共通化              | 適用 / N/A該当なし | （具体的な内容を記載）    |
| 4   | 型定義配置整理                    | 適用 / N/A該当なし | （具体的な内容を記載）    |
| 5   | 不要 import 除去                  | 適用 / N/A該当なし | （具体的な内容を記載）    |
| 6   | 命名規則（P45 対策含む）          | 適用 / N/A該当なし | （具体的な内容を記載）    |
| 7   | マジックナンバー除去              | 適用 / N/A該当なし | （具体的な内容を記載）    |
| 8   | レンダリング最適化（P31/P48維持） | 適用 / N/A該当なし | （具体的な内容を記載）    |

## テスト結果比較

| テストファイル             | リファクタリング前（件数/PASS） | リファクタリング後（件数/PASS） |
| -------------------------- | ------------------------------- | ------------------------------- |
| agentSlice.test.ts         | （件数）/（件数）               | （件数）/（件数）               |
| SkillCreateWizard.test.tsx | （件数）/（件数）               | （件数）/（件数）               |
| useSkillAnalysis.test.ts   | （件数）/（件数）               | （件数）/（件数）               |

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
- [ ] P31 対策: 個別セレクタの使用が崩れていない
- [ ] P48 対策: useShallow の適用が崩れていない
- [ ] P45 対策: agentSlice.ts 内に `skillId` の命名ドリフトが残っていない
- [ ] `git diff --stat` で変更ファイルがリファクタリング対象のみである
- [ ] `outputs/phase-8/refactoring-result.md` を作成した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 9: 品質検証
