# Phase 13: PR作成 — TASK-UI-00-ATOMS

## メタ情報

| 項目               | 値                                   |
| ------------------ | ------------------------------------ |
| タスクID           | TASK-UI-00-ATOMS                     |
| Phase              | 13 — PR作成                          |
| 前提Phase          | Phase 12（ドキュメント）完了         |
| 成果物ディレクトリ | `task-ui-00-atoms/outputs/phase-13/` |

## 目的

Phase 1〜12 の全成果物を含むコミットを作成し、Pull Request を準備する。PR作成はユーザーの明示的な許可を得てから実行する。

## 背景

TASK-UI-00-ATOMS は TASK-UI-00-MOLECULES / TASK-UI-00-ORGANISMS のブロッカーであり、このPRのマージが後続タスクの開始条件となる。PRの品質（説明の明確さ、テスト結果の提示）が後続タスクの実施者の理解に直結する。

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: 変更内容の最終確認

#### 1-1. 変更ファイル一覧確認

以下のコマンドで変更内容を確認する:

```bash
git diff --stat main...HEAD
```

#### 1-2. 期待される変更ファイル

| カテゴリ           | ファイルパス                                                                            | 種類 |
| ------------------ | --------------------------------------------------------------------------------------- | ---- |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/StatusIndicator/StatusIndicator.tsx`        | 新規 |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/StatusIndicator/index.ts`                   | 新規 |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/FilterChip/FilterChip.tsx`                  | 新規 |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/FilterChip/index.ts`                        | 新規 |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/SkeletonCard/SkeletonCard.tsx`              | 新規 |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/SkeletonCard/index.ts`                      | 新規 |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.tsx`      | 新規 |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.ts`                  | 新規 |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.tsx`              | 新規 |
| 新規コンポーネント | `apps/desktop/src/renderer/components/atoms/RelativeTime/index.ts`                      | 新規 |
| 既存拡張           | `apps/desktop/src/renderer/components/atoms/Badge/Badge.tsx`                            | 変更 |
| 既存拡張           | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.tsx`                  | 変更 |
| エクスポート       | `apps/desktop/src/renderer/components/atoms/index.ts`                                   | 変更 |
| テスト             | `apps/desktop/src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx`   | 新規 |
| テスト             | `apps/desktop/src/renderer/components/atoms/FilterChip/FilterChip.test.tsx`             | 新規 |
| テスト             | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`                       | 変更 |
| テスト             | `apps/desktop/src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx`         | 新規 |
| テスト             | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` | 新規 |
| テスト             | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`             | 変更 |
| テスト             | `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx`         | 新規 |

#### 1-3. 変更内容の検証

- [ ] 新規ファイルが全て存在する
- [ ] 変更ファイルの diff が意図した内容である
- [ ] 不要なファイル（デバッグ用 console.log、.env 等）が含まれていない
- [ ] 仕様書（docs/）の変更が Phase 12 で更新したもののみである

### Task 2: コミット準備

#### 2-1. ブランチ名

```
feature/task-ui-00-atoms
```

- [ ] 現在のブランチ名が `feature/task-ui-00-atoms` または `feature/task-ui-00-atoms-specs` である

#### 2-2. コミット前チェック

以下を全て確認してからコミットする:

```bash
# Lint チェック
cd apps/desktop && pnpm lint

# 型チェック
pnpm typecheck

# 全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/atoms/
```

- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] 全テストが PASS

#### 2-3. コミットメッセージ

```
feat(atoms): StatusIndicator・FilterChip・SkeletonCard・SuggestionBubble・RelativeTime新規追加、Badge・EmptyState拡張

- Apple HIG準拠デザイントークン適用（CSS変数ベース、3テーマ対応）
- WCAG 2.1 AAアクセシビリティ対応（ARIA属性・キーボード操作・コントラスト比）
- 全テストPASS（Line Coverage ≥80%, Branch Coverage ≥60%, Function Coverage ≥80%）
- Badge既存17テスト + EmptyState既存6テスト 後方互換性維持

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Task 3: PR作成（**ユーザー許可後のみ実行**）

> **重要**: PR作成はユーザーの明示的な許可を得てから実行する。自動実行しない。

#### 3-1. PR タイトル

```
feat(atoms): Atoms共通コンポーネント実装（TASK-UI-00-ATOMS）
```

（70文字以内）

#### 3-2. PR 本文テンプレート

```markdown
## Summary

- StatusIndicator・FilterChip・SkeletonCard・SuggestionBubble・RelativeTime の5コンポーネントを新規作成
- Badge に primary variant・content props を追加、EmptyState に suggestions・compact・mood を追加
- Apple HIG準拠デザイントークン（CSS変数）・WCAG 2.1 AA・3テーマ（kanagawa-dragon/light/dark）対応

## Test plan

- [ ] 全Atomsユニットテスト PASS: `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/`
- [ ] Badge 既存17テスト PASS（後方互換性）
- [ ] EmptyState 既存6テスト PASS（後方互換性）
- [ ] カバレッジ基準達成: Line ≥80%, Branch ≥60%, Function ≥80%
- [ ] 3テーマでの手動表示確認済み
- [ ] キーボード操作確認済み（FilterChip, SuggestionBubble）
- [ ] VoiceOver 読み上げ確認済み

## Related

- Blocks: TASK-UI-00-MOLECULES, TASK-UI-00-ORGANISMS
- Depends on: TASK-UI-00-TOKENS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

#### 3-3. PR作成コマンド

```bash
gh pr create \
  --title "feat(atoms): Atoms共通コンポーネント実装（TASK-UI-00-ATOMS）" \
  --body "$(cat <<'EOF'
## Summary
- StatusIndicator・FilterChip・SkeletonCard・SuggestionBubble・RelativeTime の5コンポーネントを新規作成
- Badge に primary variant・content props を追加、EmptyState に suggestions・compact・mood を追加
- Apple HIG準拠デザイントークン（CSS変数）・WCAG 2.1 AA・3テーマ（kanagawa-dragon/light/dark）対応

## Test plan
- [ ] 全Atomsユニットテスト PASS: `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/`
- [ ] Badge 既存17テスト PASS（後方互換性）
- [ ] EmptyState 既存6テスト PASS（後方互換性）
- [ ] カバレッジ基準達成: Line ≥80%, Branch ≥60%, Function ≥80%
- [ ] 3テーマでの手動表示確認済み
- [ ] キーボード操作確認済み（FilterChip, SuggestionBubble）
- [ ] VoiceOver 読み上げ確認済み

## Related
- Blocks: TASK-UI-00-MOLECULES, TASK-UI-00-ORGANISMS
- Depends on: TASK-UI-00-TOKENS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 4: CI 確認

PR作成後、以下を確認する:

- [ ] GitHub Actions のビルドが成功
- [ ] GitHub Actions の Lint チェックが PASS
- [ ] GitHub Actions の型チェックが PASS
- [ ] GitHub Actions の全テストが PASS

CI 失敗時の対応:

1. 失敗ログを確認
2. ローカルで再現・修正
3. 追加コミットをプッシュ
4. CI の再実行を確認

## 参照資料

| 参照                       | パス                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------- |
| Atoms仕様書                | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md`                                 |
| Phase 2 設計成果物         | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-2-design.md`                       |
| Phase 5 実装成果物         | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-5-implementation.md`               |
| Phase 6 テスト拡充成果物   | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-6-test-expansion.md`               |
| Phase 7 カバレッジ成果物   | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-7-coverage-check.md`               |
| Phase 8 リファクタ成果物   | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-8-refactoring.md`                  |
| Phase 9 品質成果物         | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-9-quality-assurance.md`            |
| Phase 10 レビュー結果      | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/outputs/phase-10/final-review-result.md` |
| Phase 11 手動テスト結果    | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/outputs/phase-11/manual-test-result.md`  |
| Git/PRルール               | `.claude/rules/07-git-and-tooling.md`                                                                                    |
| Phase 12 成果物            | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/outputs/phase-12/`                       |
| UIコンポーネント仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                  |
| UIアーキテクチャ           | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                |
| 要件-実装整合性検証        | `outputs/phase-10/requirements-implementation-alignment.md`                                                              | Phase 10 成果物 |
| テストカバレッジ総括       | `outputs/phase-10/test-coverage-summary.md`                                                                              | Phase 10 成果物 |
| デザイントークン監査       | `outputs/phase-10/design-token-audit.md`                                                                                 | Phase 10 成果物 |
| テーマテスト結果           | `outputs/phase-11/theme-test-result.md`                                                                                  | Phase 11 成果物 |
| レスポンシブテスト結果     | `outputs/phase-11/responsive-test-result.md`                                                                             | Phase 11 成果物 |
| インタラクションテスト結果 | `outputs/phase-11/interaction-test-result.md`                                                                            | Phase 11 成果物 |
| アクセシビリティテスト結果 | `outputs/phase-11/accessibility-test-result.md`                                                                          | Phase 11 成果物 |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`                                                                               | Phase 12 成果物 |
| 変更履歴                   | `outputs/phase-12/documentation-changelog.md`                                                                            | Phase 12 成果物 |
| 未タスク検出レポート       | `outputs/phase-12/unassigned-task-detection.md`                                                                          | Phase 12 成果物 |
| スキルフィードバック       | `outputs/phase-12/skill-feedback-report.md`                                                                              | Phase 12 成果物 |

## 統合テスト連携

- Phase 9 品質検証結果（Lint・型チェック・テスト PASS）をコミット前チェックで再確認
- Phase 12 documentation-changelog.md で更新した仕様書が全てコミットに含まれていることを確認

## 成果物

| #   | 成果物         | パス                          |
| --- | -------------- | ----------------------------- |
| 1   | PR情報レポート | `outputs/phase-13/pr-info.md` |

**pr-info.md の記載内容**:

- PR URL
- PR 番号
- コミットハッシュ
- 変更ファイル数
- CI 結果ステータス

## 完了条件

- [ ] Task 1: `git diff --stat` で変更ファイル一覧が期待通り
- [ ] Task 1: 不要ファイル（.env、console.log、デバッグコード）が含まれていない
- [ ] Task 2: `pnpm lint` PASS
- [ ] Task 2: `pnpm typecheck` PASS
- [ ] Task 2: 全 Atoms テスト PASS
- [ ] Task 2: コミットメッセージが規約通り（`feat(atoms):` プレフィックス、Co-Authored-By 含む）
- [ ] Task 2: `--no-verify` を使用していない
- [ ] Task 3: ユーザーの明示的な許可を得てからPRを作成した
- [ ] Task 3: PR タイトルが70文字以内
- [ ] Task 3: PR 本文に Summary + Test Plan が含まれている
- [ ] Task 4: CI が全て PASS（または失敗時の対応が完了）
- [ ] `outputs/phase-13/pr-info.md` が作成されている

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 13 ステータスを `completed` に更新
- [ ] `artifacts.json` の全体ステータスを `completed` に更新
- [ ] PR URL をユーザーに報告

## 依存関係

| 方向 | Phase / タスク           | 内容                         |
| ---- | ------------------------ | ---------------------------- |
| 前提 | Phase 12（ドキュメント） | 全ドキュメント完了後にPR準備 |
| 後続 | TASK-UI-00-MOLECULES     | マージ後に開始可能           |
| 後続 | TASK-UI-00-ORGANISMS     | マージ後に開始可能           |

## 次のPhase

→ タスク完了。マージ後に TASK-UI-00-MOLECULES / TASK-UI-00-ORGANISMS が開始可能になる。
