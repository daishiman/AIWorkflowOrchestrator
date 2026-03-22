# Phase 9: 品質検証

## メタ情報

| 項目          | 内容                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 9                                                                                                                      |
| 機能名        | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT)                   |
| 作成日        | 2026-03-21                                                                                                             |
| 担当          | -                                                                                                                      |
| ステータス    | 未着手                                                                                                                 |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-8-refactoring.md` |

## 目的

Lint・TypeScript 型チェック・全テスト実行を行い、実装が品質基準を満たしていることを確認する。P31/P48 対策（Zustand 個別セレクタ・useShallow）の適用状況も検証する。この Phase で発見された問題は修正してから Phase 10 へ進む。

## 実行タスク

### タスク1: Lint 実行

```bash
# プロジェクトルートから実行
pnpm --filter @repo/desktop lint

# または apps/desktop から
cd apps/desktop && pnpm lint
```

**確認項目**:

- ESLint エラーが 0 件であること
- `react-hooks/exhaustive-deps` 違反がないこと
- 未使用の `import` がないこと

### タスク2: TypeScript 型チェック

```bash
# プロジェクトルートから実行
pnpm --filter @repo/desktop typecheck

# または apps/desktop から
cd apps/desktop && pnpm typecheck
```

**確認項目**:

- TypeScript エラーが 0 件であること
- `any` 型の使用がないこと
- `@ts-ignore` / `@ts-expect-error` を使用している場合は理由コメントがあること

### タスク3: 全テスト実行

```bash
# apps/desktop ディレクトリから実行（P40対策）
cd apps/desktop

# InlineModelSelector テスト（Phase 4/5/6 で作成したテストを含む）
pnpm vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx

# llm コンポーネント全体のテスト（リグレッションチェック）
pnpm vitest run src/renderer/components/llm/

# apps/desktop 全テスト（広域リグレッションチェック）
pnpm vitest run
```

**確認項目**:

- Phase 4/5/6 で作成した全テスト（T1〜T11）が PASS であること
- 既存テストがすべて PASS のままであること（リグレッションなし）

### タスク4: P31/P48 対策確認

```bash
# 合成Hook（P31禁止パターン）の使用確認
grep -n "useAppStore\|useLLMStore\|useAuthModeStore" \
  apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx

# 個別セレクタの使用確認（正しいパターン）
grep -n "useSelectedProviderId\|useSelectedModelId\|useLLMProviders" \
  apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx

# useShallow 未適用の派生セレクタ確認（P48対策）
grep -n "useShallow" apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx
```

**確認項目**:

- 合成 Hook（`useAppStore()` 等）が直接使用されていないこと（P31対策）
- `.filter()` / `.map()` を返すセレクタに `useShallow` が適用されていること（P48対策）

### タスク5: 品質検証結果の記録

| チェック項目                 | 結果 | 備考 |
| ---------------------------- | ---- | ---- |
| Lint（エラー件数）           | -    | -    |
| TypeScript 型チェック        | -    | -    |
| 新規テスト（T1〜T11）        | -    | -    |
| 既存テスト（リグレッション） | -    | -    |
| P31 対策（個別セレクタ使用） | -    | -    |
| P48 対策（useShallow 適用）  | -    | -    |

（Phase 9 実行時に記入）

## 参照資料

### コード品質ルール

| 資料名           | パス                                   |
| ---------------- | -------------------------------------- |
| コーディング規約 | `.claude/rules/02-code-quality.md`     |
| 状態管理ルール   | `.claude/rules/03-state-management.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                              | 対策                                     |
| ---------- | --------------------------------- | ---------------------------------------- |
| P31        | Zustand Store Hooks 無限ループ    | 個別セレクタの使用を確認                 |
| P40        | テスト実行ディレクトリ依存        | `apps/desktop` から実行する              |
| P48        | useShallow 未適用による無限ループ | 派生セレクタへの `useShallow` 適用を確認 |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                              | 内容                     |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------ |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | 既存UIコンポーネント構造 |
| 状態管理            | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | 状態管理アーキテクチャ   |

## 実行手順

1. **タスク1の実施**: Lint を実行し、エラーを解消する
2. **タスク2の実施**: TypeScript 型チェックを実行し、エラーを解消する
3. **タスク3の実施**: 全テストを実行し、全て PASS であることを確認する
4. **タスク4の実施**: P31/P48 対策の確認を実行する
5. **タスク5の実施**: 結果を記録する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこの Phase で確認・更新する
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと 1 対 1 で突合する

## 成果物

| 成果物                       | パス                                                                                                               | 説明         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------ |
| Phase 9 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-9-quality.md` | 品質検証結果 |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT --phase 9
```

## 完了条件

- [ ] Lint エラーが 0 件であることを確認した
- [ ] TypeScript 型チェックエラーが 0 件であることを確認した
- [ ] T1-1 〜 T11-3 の全テストが PASS であることを確認した
- [ ] 既存テストのリグレッションがないことを確認した
- [ ] P31 対策（合成 Hook の不使用、個別セレクタ使用）を確認した
- [ ] P48 対策（useShallow の適用）を確認した
- [ ] タスク5の結果テーブルを記入した

## 次のPhase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
