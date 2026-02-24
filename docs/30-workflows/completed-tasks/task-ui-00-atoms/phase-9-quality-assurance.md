# Phase 9: 品質保証 — TASK-UI-00-ATOMS Atoms共通コンポーネント

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| Phase      | 9                                                  |
| Phase名    | 品質保証（Lint・型チェック・全テスト・ビルド検証） |
| タスクID   | TASK-UI-00-ATOMS                                   |
| 作成日     | 2026-02-22                                         |
| 前提Phase  | Phase 8（リファクタリング完了）                    |
| 後続Phase  | Phase 10（最終レビュー）                           |
| ステータス | 未着手                                             |
| 依存タスク | TASK-UI-00-TOKENS（デザイントークン実装済み）      |

## 目的

Phase 5-8 の実装・テスト・リファクタリングを経た7コンポーネントに対して、ESLint, TypeScript型チェック, 全テスト実行, ビルド検証の4項目を実施し、品質ゲートを通過させる。全項目でエラー0件を達成し、Phase 10（最終レビュー）に進む準備を完了する。

## 背景

品質保証は「個別のテストが通っている」だけでは不十分であり、プロジェクト全体のコード品質基準（ESLint ルール、TypeScript strict モード）との整合性、既存コンポーネントとの互換性、ビルド可能性を統合的に検証する必要がある。

---

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: ESLint 検証

**目的**: 全7コンポーネントの実装コードとテストコードが ESLint ルールに準拠していることを確認する

**実行コマンド**:

```bash
cd apps/desktop && pnpm lint
```

**検証対象ファイル**:

| #   | ファイルパス                                                               |
| --- | -------------------------------------------------------------------------- |
| 1   | `src/renderer/components/atoms/StatusIndicator/index.tsx`                  |
| 2   | `src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx`   |
| 3   | `src/renderer/components/atoms/FilterChip/index.tsx`                       |
| 4   | `src/renderer/components/atoms/FilterChip/FilterChip.test.tsx`             |
| 5   | `src/renderer/components/atoms/Badge/index.tsx`                            |
| 6   | `src/renderer/components/atoms/Badge/Badge.test.tsx`                       |
| 7   | `src/renderer/components/atoms/SkeletonCard/index.tsx`                     |
| 8   | `src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx`         |
| 9   | `src/renderer/components/atoms/SuggestionBubble/index.tsx`                 |
| 10  | `src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` |
| 11  | `src/renderer/components/atoms/EmptyState/index.tsx`                       |
| 12  | `src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`             |
| 13  | `src/renderer/components/atoms/RelativeTime/index.tsx`                     |
| 14  | `src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx`         |
| 15  | `src/renderer/components/atoms/index.ts`                                   |

**合格基準**: 上記15ファイルで ESLint エラー 0件、警告 0件

**エラー発生時の対応**:

| エラー種別                | 対応方法                              |
| ------------------------- | ------------------------------------- |
| `@typescript-eslint/*` 系 | 型定義を修正する                      |
| `react-hooks/*` 系        | Hook の依存配列を修正する（P31 参照） |
| `import/order` 系         | import 順序を修正する                 |
| `no-unused-vars` 系       | 未使用変数・import を削除する         |

**成果物**: `outputs/phase-9/lint-report.md`

---

### Task 2: TypeScript 型チェック

**目的**: 全コンポーネントが TypeScript strict モードで型エラー0件であることを確認する

**実行コマンド**:

```bash
cd apps/desktop && pnpm typecheck
```

**合格基準**: 型エラー 0件

**型チェック重点確認ポイント**:

| #   | 確認ポイント                                                        | 関連コンポーネント                 |
| --- | ------------------------------------------------------------------- | ---------------------------------- |
| 1   | `BadgeProps` の `variant` に `"primary"` が正しく追加されている     | Badge                              |
| 2   | `EmptyStateProps` の `action` ユニオン型が正しく定義されている      | EmptyState                         |
| 3   | `EmptyStateProps` の `mood` リテラル型が正しく定義されている        | EmptyState                         |
| 4   | `RelativeTimeProps` の `timestamp` が `string` 型で定義されている   | RelativeTime                       |
| 5   | Phase 8 で抽出した共通ユーティリティの型が正しく定義されている      | 共通ユーティリティ（抽出した場合） |
| 6   | `atoms/index.ts` のエクスポートで型推論が正しく動作する             | 全コンポーネント                   |
| 7   | 既存コンポーネント（Badge, EmptyState）の型が後方互換を維持している | Badge, EmptyState                  |

**エラー発生時の対応**:

| エラー種別               | 対応方法                               |
| ------------------------ | -------------------------------------- |
| 型の不一致               | Props 型定義を修正する                 |
| 未定義プロパティアクセス | optional chaining (`?.`) を追加する    |
| `any` 型の使用           | 明示的な型定義に置き換える             |
| import 解決エラー        | パスエイリアスまたは相対パスを修正する |

**成果物**: `outputs/phase-9/typecheck-report.md`

---

### Task 3: 全テスト実行

**目的**: 新規追加テスト + 既存テストが全てPASSすることを確認する

**実行コマンド**:

```bash
cd apps/desktop && pnpm vitest run
```

**合格基準**: 全テストPASS（失敗0件、スキップは理由付きで許容）

**確認項目**:

| #   | 確認項目                                                     | 判定基準                |
| --- | ------------------------------------------------------------ | ----------------------- |
| 1   | StatusIndicator テスト: 基本 + Phase 6 追加分が全PASS        | 失敗0件                 |
| 2   | FilterChip テスト: 基本 + Phase 6 追加分が全PASS             | 失敗0件                 |
| 3   | Badge テスト: 既存17件 + 拡張分 + Phase 6 追加分が全PASS     | 失敗0件                 |
| 4   | SkeletonCard テスト: 基本 + Phase 6 追加分が全PASS           | 失敗0件                 |
| 5   | SuggestionBubble テスト: 基本 + Phase 6 追加分が全PASS       | 失敗0件                 |
| 6   | EmptyState テスト: 既存6件 + 拡張分 + Phase 6 追加分が全PASS | 失敗0件                 |
| 7   | RelativeTime テスト: 基本 + Phase 6 追加分が全PASS           | 失敗0件                 |
| 8   | 他のコンポーネントテストに影響がないこと                     | 既存テスト全体で失敗0件 |

**テスト失敗時の対応**:

| 失敗パターン               | 対応方法                              |
| -------------------------- | ------------------------------------- |
| リファクタリング起因の失敗 | Phase 8 の変更を修正する              |
| テスト間の状態リーク（P9） | `beforeEach` でリセット処理を追加する |
| タイマーテスト失敗（P13）  | `vi.advanceTimersByTime()` に変更する |
| happy-dom起因の失敗（P39） | `fireEvent` に変更する                |

**成果物**: `outputs/phase-9/test-report.md`

---

### Task 4: ビルド検証

**目的**: 全コンポーネントがプロダクションビルドでエラーなくコンパイルされることを確認する

**実行コマンド**:

```bash
cd apps/desktop && pnpm build
```

**合格基準**: ビルド成功（エラー0件）

**確認項目**:

| #   | 確認項目                                              | 判定基準         |
| --- | ----------------------------------------------------- | ---------------- |
| 1   | Renderer バンドルに7コンポーネントが含まれる          | ビルドエラーなし |
| 2   | Tree-shaking で未使用コードが除去される               | ビルド成功       |
| 3   | CSS カスタムプロパティ参照がビルドエラーにならない    | ビルド成功       |
| 4   | `atoms/index.ts` のエクスポートが正しくバンドルされる | ビルド成功       |

---

### Task 5: 品質ゲート判定

**目的**: 全4項目（ESLint, TypeScript, テスト, ビルド）の結果を総合的に評価し、Phase 10 進行の可否を判定する

**判定マトリクス**:

| #   | 品質カテゴリ       | 合格基準                                         | Phase 10 進行可否 |
| --- | ------------------ | ------------------------------------------------ | ----------------- |
| 1   | 機能品質           | 全7コンポーネントが仕様通り動作                  | 必須              |
| 2   | テスト品質         | カバレッジ基準達成（Phase 7 確認済み）           | 必須              |
| 3   | コード品質（Lint） | ESLint エラー 0件、警告 0件                      | 必須              |
| 4   | 型安全性           | TypeScript 型エラー 0件                          | 必須              |
| 5   | テスト安定性       | 全テスト PASS（フレーキーなし）                  | 必須              |
| 6   | ビルド可能性       | `pnpm build` 成功                                | 必須              |
| 7   | セキュリティ品質   | `dangerouslySetInnerHTML` 不使用                 | 必須              |
| 8   | 後方互換性         | Badge 既存17テスト + EmptyState 既存6テスト PASS | 必須              |

**判定結果**:

| 判定 | 条件                            | アクション            |
| ---- | ------------------------------- | --------------------- |
| PASS | 全8項目が合格基準を満たす       | Phase 10 へ進む       |
| FAIL | 1項目以上が合格基準を満たさない | 該当 Phase に戻り修正 |

**成果物**: `outputs/phase-9/quality-gate-result.md`

---

## 参照資料

| 参照                                                                 | パス                                                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Atoms仕様書                                                          | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` |
| Phase 5 実装成果物                                                   | `docs/30-workflows/completed-tasks/task-ui-00-atoms/phase-5-implementation.md`              |
| 品質要件                                                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 |
| UIコンポーネント仕様                                                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     |
| UIデザインシステム                                                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  |
| UIアーキテクチャ                                                     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                   |
| コード品質ルール                                                     | `.claude/rules/02-code-quality.md`                                                          |
| P9: テスト間リーク                                                   | `.claude/rules/06-known-pitfalls.md#P9`                                                     |
| P13: タイマー無限ループ                                              | `.claude/rules/06-known-pitfalls.md#P13`                                                    |
| P39: happy-dom非互換                                                 | `.claude/rules/06-known-pitfalls.md#P39`                                                    |
| P40: ディレクトリ依存                                                | `.claude/rules/06-known-pitfalls.md#P40`                                                    |
| 実装サマリー（7コンポーネント実装・R-1〜R-6対応・barrel export更新） | `outputs/phase-5/implementation-summary.md`                                                 | Phase 5 成果物 |
| コード品質分析結果                                                   | `outputs/phase-8/code-quality-analysis.md`                                                  | Phase 8 成果物 |
| リファクタリングログ                                                 | `outputs/phase-8/refactoring-log.md`                                                        | Phase 8 成果物 |

## 統合テスト連携

Phase 9 では `pnpm vitest run`（全テスト）を実行する。これにはATOMS以外のテストも含まれるため、7コンポーネントの変更が他のコンポーネントに悪影響を与えないことを検証する。Badge と EmptyState は既存テスト（17件 + 6件）を含めた後方互換性確認が必須。

## 成果物

| #   | 成果物             | パス                                     |
| --- | ------------------ | ---------------------------------------- |
| 1   | ESLintレポート     | `outputs/phase-9/lint-report.md`         |
| 2   | 型チェックレポート | `outputs/phase-9/typecheck-report.md`    |
| 3   | テストレポート     | `outputs/phase-9/test-report.md`         |
| 4   | 品質ゲート判定結果 | `outputs/phase-9/quality-gate-result.md` |

## 完了条件

- [ ] Task 1: `cd apps/desktop && pnpm lint` でエラー 0件、警告 0件
- [ ] Task 2: `cd apps/desktop && pnpm typecheck` で型エラー 0件
- [ ] Task 3: `cd apps/desktop && pnpm vitest run` で全テスト PASS
- [ ] Task 3: Badge 既存17テスト + EmptyState 既存6テスト の維持確認
- [ ] Task 4: `cd apps/desktop && pnpm build` でビルド成功
- [ ] Task 5: セキュリティ検証 — 7コンポーネントで `dangerouslySetInnerHTML` が使用されていない
- [ ] Task 5: 品質ゲート判定が PASS（全8項目合格）
- [ ] 成果物4ファイル（`outputs/phase-9/` 配下）が全て作成されている

## Phase末端アクション【必須】

- [ ] 成果物ファイル（`outputs/phase-9/` 配下4ファイル）を作成
- [ ] `artifacts.json` の Phase 9 ステータスを `completed` に更新

## 依存関係

- **前提**: Phase 8（リファクタリング完了）
- **入力**: Phase 5-8 のコンポーネント実装7個 + テストファイル7個 + リファクタリング済みコード
- **出力**: 品質検証レポート4ファイル + 品質ゲート判定結果

## 次のPhase

Phase 10（最終レビュー）へ進む。Phase 10 では多角的品質・整合性検証を実施し、PASS/MINOR/MAJOR/CRITICAL の判定を行う。
