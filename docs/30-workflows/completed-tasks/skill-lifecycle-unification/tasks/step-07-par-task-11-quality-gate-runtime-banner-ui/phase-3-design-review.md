# Phase 3 - 設計レビュー

## メタ情報

| 項目       | 値                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| タスクID   | TASK-IMP-LIFECYCLE-QUALITY-RUNTIME-UI-001                                                                                                        |
| Phase      | 3 / 13                                                                                                                                           |
| 名称       | 設計レビュー                                                                                                                                     |
| 目的       | QualityGateLabel と RuntimeBanner の設計妥当性を多角的に検証する                                                                                 |
| 前 Phase   | Phase 2（設計）: `outputs/phase-2/design-document.md` が完了していること                                                                         |
| 次 Phase   | PASS / MINOR → Phase 4（テスト作成）、MAJOR（設計問題）→ Phase 2 へ戻る、MAJOR（要件問題）→ Phase 1 へ戻る                                       |
| 成果物パス | `docs/30-workflows/skill-lifecycle-unification/tasks/step-07-par-task-11-quality-gate-runtime-banner-ui/outputs/phase-3/design-review-report.md` |

## 目的

Phase 2 の設計成果物（QualityGateLabel・RuntimeBanner のコンポーネント設計）が以下の基準を満たしているかを検証する。

1. getScoreGate の全戻り値パターンをカバーしているか
2. ui-ux-realization.md の UI 契約を満たしているか
3. Apple HIG カラーパレットに準拠しているか
4. 既存 StatusBadge からの移行パスに破壊的変更がないか
5. アクセシビリティ要件（WCAG 2.1 AA）を満たしているか

## 参照資料

| 資料                 | パス                                                                           | 参照目的                       |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| Phase 2 成果物       | `outputs/phase-2/design-document.md`                                           | レビュー対象の設計定義         |
| UI/UX 契約           | `docs/30-workflows/skill-lifecycle-unification/ui-ux-realization.md`（L32-38） | execute/improve の UI 契約原文 |
| ScoringGate 型定義   | `packages/shared/src/types/skill-improver.ts`（L322-366）                      | 全戻り値パターンの確認         |
| Apple HIG カラー     | `.claude/rules/01-architecture.md`（カラーパレットセクション）                 | カラーパレット準拠確認         |
| アーキテクチャルール | `.claude/rules/01-architecture.md`（アクセシビリティセクション）               | WCAG 2.1 AA 要件               |
| 既存 StatusBadge     | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`（L50-67）  | 移行パスの破壊的変更確認       |

## 実行タスク

### Task 3-1: QualityGateLabel が getScoreGate の全戻り値パターンをカバーしているか

**チェック対象**: Phase 2 の Task 2-1 / Task 2-2

**検証内容**:

`getScoreGate(score)` は `ScoringGate` 型の4値（NEEDS_IMPROVEMENT / SAVE_ALLOWED / USE_ALLOWED / RECOMMENDED）を返す。

| 確認項目                                                                   | 合否 |
| -------------------------------------------------------------------------- | ---- |
| `qualityGateLabelStyles` に NEEDS_IMPROVEMENT のスタイルが定義されている   | -    |
| `qualityGateLabelStyles` に SAVE_ALLOWED のスタイルが定義されている        | -    |
| `qualityGateLabelStyles` に USE_ALLOWED のスタイルが定義されている         | -    |
| `qualityGateLabelStyles` に RECOMMENDED のスタイルが定義されている         | -    |
| ゲート別ラベル定義テーブルに4行すべてが定義されている                      | -    |
| TypeScript の `Record<ScoringGate, string>` によって網羅性が強制されている | -    |

**判定基準**: 6項目すべて PASS であること。1項目でも不足がある場合は MAJOR（設計問題）として Phase 2 へ戻る。

### Task 3-2: RuntimeBanner が ui-ux-realization.md 「実行経路と trust 境界を同時に見せる」を満たすか

**チェック対象**: Phase 2 の Task 2-4 / Task 2-5 / Task 2-6

**ui-ux-realization.md L37 の原文要件**:

> execute ステップ必須 UI: runtime banner、permission、result summary
> 実行経路と trust 境界を同時に見せる

| 確認項目                                                                                                          | 合否 |
| ----------------------------------------------------------------------------------------------------------------- | ---- |
| RuntimeBanner の Props に `executionStatus` が必須フィールドとして定義されている                                  | -    |
| RuntimeBanner の Props に `runtimeMode` が必須フィールドとして定義されている                                      | -    |
| RuntimeBanner の Props に `trustLevel` が必須フィールドとして定義されている                                       | -    |
| 「実行経路」（integrated / handoff / subscription）がバナー上に表示される設計になっている                         | -    |
| 「trust 境界」（permission mode の4値）がバナー上に表示される設計になっている                                     | -    |
| 実行中（running）状態で `onAbort` コールバックによる停止操作が設計されている                                      | -    |
| ui-ux-realization.md L40 の注記「runtime banner の実装は StatusBadge として実現」との整合が設計書に明記されている | -    |

**判定基準**: 7項目すべて PASS であること。runtimeMode または trustLevel が Props から欠落している場合は MAJOR（要件問題）として Phase 1 へ戻る。

### Task 3-3: Apple HIG カラーパレットに準拠しているか

**チェック対象**: Phase 2 の Task 2-2 / Task 2-5

**Apple HIG カラー準拠チェック** (`.claude/rules/01-architecture.md` カラーパレット参照):

| 確認項目                                                                                 | 期待値             | 合否 |
| ---------------------------------------------------------------------------------------- | ------------------ | ---- |
| NEEDS_IMPROVEMENT の背景色が `--status-error`（systemRed #FF3B30）を使用している         | `--status-error`   | -    |
| SAVE_ALLOWED の背景色が `--status-warning`（systemOrange #FF9500）を使用している         | `--status-warning` | -    |
| USE_ALLOWED の背景色が `--status-success`（systemGreen #34C759）を使用している           | `--status-success` | -    |
| RECOMMENDED の背景色が `--status-success`（systemGreen #34C759）を使用している           | `--status-success` | -    |
| RuntimeBanner の running インジケーターが `--status-primary`（systemBlue）を使用している | `--status-primary` | -    |
| Tailwind の `slate` カラーが使用されていない（Apple 中性灰への準拠）                     | 使用なし           | -    |
| CSS 変数（`var(--...)`）を使用し、ハードコードカラーコードが含まれていない               | CSS 変数のみ       | -    |

**判定基準**: 7項目すべて PASS であること。ハードコードカラーが1件でもある場合は MINOR として指摘し、Phase 2 への差し戻しなしに対応する。

### Task 3-4: 既存 StatusBadge からの移行パスに破壊的変更がないか

**チェック対象**: Phase 2 の Task 2-6

| 確認項目                                                                                                                   | 合否 |
| -------------------------------------------------------------------------------------------------------------------------- | ---- |
| `SkillStreamingViewProps` の追加フィールド（runtimeMode / trustLevel / provider / model）がすべてオプション型（`?`）である | -    |
| 追加フィールドが未指定の場合に既存の StatusBadge と同等の表示にフォールバックする設計が明記されている                      | -    |
| `StatusBadge` コンポーネント自体（L50-67）を削除するか保持するかが設計書に明記されている                                   | -    |
| 既存テスト（`data-testid="status-badge"` を参照するテスト）への影響範囲が設計書に明記されている                            | -    |
| `SkillStreamingView` の既存 `data-testid` 属性（`skill-streaming-view` 等）が変更されていない                              | -    |

**判定基準**: 5項目すべて PASS であること。必須フィールドへの変更がある場合は MAJOR（設計問題）として Phase 2 へ戻る。

### Task 3-5: アクセシビリティ要件（WCAG 2.1 AA）を満たすか

**チェック対象**: Phase 2 の Task 2-2 / Task 2-5

| 確認項目                                                                                                                           | WCAG 基準     | 合否 |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---- |
| QualityGateLabel に `aria-label` が定義されている（英語 ARIA ラベルテーブルが定義済み）                                            | WCAG 1.3.1    | -    |
| RuntimeBanner に `role="status"` または適切な ARIA ロールが設計されている                                                          | WCAG 4.1.3    | -    |
| 色だけで情報を伝えていない（テキストラベルを併用している）                                                                         | WCAG 1.4.1    | -    |
| QualityGateLabel の背景色とテキスト色のコントラスト比が 4.5:1 以上になる設計である（`--status-*` + `--text-inverse` の組み合わせ） | WCAG 1.4.3 AA | -    |
| RuntimeBanner の停止ボタン（onAbort）に `aria-label="スキル実行を中止する"` が設計されている                                       | WCAG 4.1.2    | -    |

**判定基準**: 5項目すべて PASS であること。`aria-label` が欠落している場合は MINOR として指摘し、Phase 4（テスト作成）前に対応する。

## レビュー判定基準

| 判定  | 条件                                                                                                         | 次のアクション                                 |
| ----- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| PASS  | Task 3-1 から Task 3-5 の全項目が PASS                                                                       | Phase 4（テスト作成）へ進む                    |
| MINOR | MINOR 指摘が1件以上・MAJOR 指摘なし                                                                          | 指摘を未タスク仕様書に変換後 Phase 4 へ進む    |
| MAJOR | runtimeMode / trustLevel が必須フィールドから欠落、または QualityGateLabel が ScoringGate 値を網羅していない | 影響範囲に応じて Phase 1 または Phase 2 へ戻る |

## 成果物

`outputs/phase-3/design-review-report.md`

以下の6セクションを含む。

1. **レビュー判定**: PASS / MINOR / MAJOR のいずれかを明記
2. **Task 3-1 チェック結果**: QualityGateLabel の網羅性検証
3. **Task 3-2 チェック結果**: RuntimeBanner の UI 契約適合性検証
4. **Task 3-3 チェック結果**: Apple HIG カラー準拠検証
5. **Task 3-4 チェック結果**: 後方互換性検証
6. **Task 3-5 チェック結果**: アクセシビリティ要件検証
7. **指摘事項一覧**: MINOR 指摘は未タスク仕様書への変換パスを含む

## 完了条件

- [ ] design-review-report.md が `outputs/phase-3/` に作成されている
- [ ] 判定（PASS / MINOR / MAJOR）が明記されている
- [ ] Task 3-1 から Task 3-5 の全チェック項目に合否が記録されている
- [ ] MINOR 判定の場合: 指摘事項が全て未タスク仕様書に変換されている
- [ ] MAJOR 判定の場合: 影響フェーズ（Phase 1 または Phase 2）が特定されている
- [ ] PASS または MINOR の場合: Phase 4（テスト作成）着手の前提条件が満たされている

## 次 Phase

判定 PASS / MINOR の場合: Phase 4 - テスト作成
判定 MAJOR（設計問題）の場合: Phase 2 - 設計 へ戻る
判定 MAJOR（要件問題）の場合: Phase 1 - 要件定義 へ戻る
