# Phase 1: 要件定義

## メタ情報

- Phase: 1
- タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001
- 機能名: SkillInfoStep コンポーネント実装（Step 0: スキル情報入力）
- 作成日: 2026-04-08
- ステータス: **completed**

## 目的

スキル作成ウィザードの Step 0 として機能する `SkillInfoStep` コンポーネントの要件を明確化する。
W0-seq-01 で整備した `SkillInfoFormData` / `SkillCategory` 型を使い、実装パス・受入条件・コードインベントリを確定する。

## ゲート（Phase 1-3 共通・必須）

Phase 4（テスト作成）へ進む前提として、Phase 1-3 で以下の準拠を確認し、Phase 3 で結論を固定する。

| 対象 skill                   | 確認すること（この workflow での最小セット）                                                             | 記録先       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------ |
| `task-specification-creator` | Phase 3 が設計レビューゲートとして機能し、4条件で進行可否判定すること                                    | Phase 3 本文 |
| `aiworkflow-requirements`    | 既存 UI/UX・状態境界・命名・型定義（SkillInfoFormData / SkillCategory）が current facts と矛盾しないこと | Phase 3 本文 |

`aiworkflow-requirements` の最小検索（例）:

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillInfoFormData" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillCreateWizard" -C 3
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillInfoStep" -C 3
```

## SubAgent 分担（Phase 1）

| SubAgent   | 責務                                                                                 | 実行形態          | 完了条件                   |
| ---------- | ------------------------------------------------------------------------------------ | ----------------- | -------------------------- |
| SubAgent-A | 既存 wizard コンポーネントの調査、`SkillInfoFormData` / `SkillCategory` の型構造確認 | SubAgent-B と並列 | 型構造と既存パターンが確定 |
| SubAgent-B | `aiworkflow-requirements` 仕様検索と要件の矛盾・不足・依存関係の初期監査             | SubAgent-A と並列 | 仕様整合の論点が揃う       |
| Lead       | 受入条件（AC-1〜AC-9）とコードインベントリの確定・Phase 2 への受け渡し               | 直列              | Phase 2 の入力が固定される |

## タスク分類

- **タスク種別**: NON_VISUAL タスク（Renderer 内部の計装のみ / 視覚差分なし）
- **影響 Process**: Renderer（ブラウザ環境）のみ
- **新規追加**: `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` / `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`
- **変更のある既存ファイル**: `apps/desktop/src/renderer/components/skill/wizard/index.ts`

## 受入条件（AC）

| AC   | 内容                                                                                          |
| ---- | --------------------------------------------------------------------------------------------- |
| AC-1 | `SkillInfoStep.tsx` が `apps/desktop/src/renderer/components/skill/wizard/` に存在する        |
| AC-2 | `SkillInfoStep` が `SkillInfoFormData` 型（`@repo/shared/types/skillCreator`）を props に使用 |
| AC-3 | スキル名・目的・カテゴリの 3フィールドが描画される                                            |
| AC-4 | カテゴリは `SkillCategory` 型の全値を選択肢として表示する                                     |
| AC-5 | フォーム変更が `onFormDataChange(data: SkillInfoFormData)` コールバックで親へ通知される       |
| AC-6 | `wizard/index.ts` から `SkillInfoStep` が export される                                       |
| AC-7 | `pnpm --filter @repo/desktop typecheck` が PASS する                                          |
| AC-8 | `pnpm --filter @repo/desktop lint` が PASS する                                               |
| AC-9 | `SkillInfoStep.test.tsx` の全テストが PASS する                                               |

## 実行タスク

- [x] （Gate準備）`task-specification-creator` / `aiworkflow-requirements` 準拠監査の観点を Phase 3 に持ち越せる形に整理する
- [x] `packages/shared/src/types/skillCreator.ts` の `SkillInfoFormData` と `SkillCategory` 型構造を把握する
- [x] `apps/desktop/src/renderer/components/skill/wizard/` 配下の既存コンポーネントを調査する
- [x] `apps/desktop/src/renderer/components/skill/wizard/index.ts` の現在のエクスポート一覧を確認する
- [x] 受入条件 AC-1〜AC-9 を仕様書に記録する
- [x] NON_VISUAL タスクとして分類する

## 参照資料

| 資料名                     | パス                                                        | 説明                   |
| -------------------------- | ----------------------------------------------------------- | ---------------------- |
| 共有型定義                 | `packages/shared/src/types/skillCreator.ts`                 | 型定義参照             |
| ウィザード親コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/`        | 既存実装・命名規則     |
| W0-seq-01仕様書            | `docs/30-workflows/skill-wizard-redesign-lane/W0-seq-01-*/` | 依存タスクの完了仕様   |
| W0-seq-02仕様書            | `docs/30-workflows/skill-wizard-redesign-lane/W0-seq-02-*/` | 推論サービス完了仕様   |
| レーンindex                | `docs/30-workflows/skill-wizard-redesign-lane/index.md`     | タスク一覧・依存グラフ |

## 成果物

- 受入条件（AC-1〜AC-9）一覧
- タスク分類（NON_VISUAL）の記録
- コードインベントリ（変更対象ファイル一覧）

## 完了条件

- [x] AC-1〜AC-9 が明文化されている
- [x] NON_VISUAL タスクとして分類されていることが記録されている
- [x] コードインベントリ（変更ファイル一覧）が確定している
