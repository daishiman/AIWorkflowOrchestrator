# Phase 12: ドキュメント — TASK-UI-00-ATOMS

## メタ情報

| 項目               | 値                                   |
| ------------------ | ------------------------------------ |
| タスクID           | TASK-UI-00-ATOMS                     |
| Phase              | 12 — ドキュメント                    |
| 前提Phase          | Phase 11（手動テスト）完了           |
| 成果物ディレクトリ | `task-ui-00-atoms/outputs/phase-12/` |

## 目的

実装ガイド・システム仕様書・変更履歴・未タスク検出レポート・スキルフィードバックレポートを作成し、タスク完了に必要な全ドキュメントを整備する。

## 背景

> **最重要**: Phase 12 は漏れが最も発生しやすい Phase。必ず全項目を逐次確認する。
> 参照: P1（LOGS.md 2ファイル）、P2（topic-map.md）、P3（未タスク3ステップ）、P4（早期完了記載）、P25-P28（Phase 12固有の落とし穴）、P29（SKILL.md変更履歴）、P43（サブエージェントrate limit）

### 事前チェック（Phase 12 開始時の必須確認）

- [ ] **P1対策**: LOGS.md 2ファイル更新が必要（aiworkflow-requirements + task-specification-creator）
- [ ] **P2/P27対策**: topic-map.md 再生成が必要（仕様書に変更があれば必ず再生成）
- [ ] **P3対策**: 未タスク管理は3ステップ全完了が必要（指示書 → 残課題テーブル → 関連仕様書リンク）
- [ ] **P4対策**: documentation-changelog.md に全Step確認前に「完了」と記載しない
- [ ] **P29対策**: SKILL.md 変更履歴テーブルも更新が必要
- [ ] **P43対策**: サブエージェントへの仕様書更新委譲は3ファイル以下/エージェントに分割

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明

**出力先**: `outputs/phase-12/implementation-guide.md` の前半部分

**必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座にカッコ書きで説明）
- 図や表を活用して視覚的に説明

**各コンポーネントの日常例え**:

| コンポーネント   | 推奨する日常例え                                                           |
| ---------------- | -------------------------------------------------------------------------- |
| StatusIndicator  | 信号機。赤は止まれ、青は進めのように、コンポーネントの今の状態を色で伝える |
| FilterChip       | 洋服店のサイズタグ。「S」「M」「L」から欲しいものだけを選ぶ仕組み          |
| Badge            | 手紙の赤い封蝋（ふうろう）。「ここに注目!」と伝える小さな目印              |
| SkeletonCard     | レストランで料理が来る前のプレースマット。「もうすぐ届きますよ」の目印     |
| SuggestionBubble | お店の店員さんの「こちらはいかがですか?」という提案カード                  |
| EmptyState       | 引っ越し直後の部屋。「まだ何もないけど、こうやって始めましょう」の案内板   |
| RelativeTime     | 友達との会話での「さっき」「3分前」「昨日」という時間の言い方              |

**構成テンプレート**:

```markdown
## 1. このプロジェクトの「レゴブロック」たち

### 1.1 Atomic Design って何？

[レゴブロックの例えで Atoms/Molecules/Organisms を説明]

### 1.2 デザイントークンって何？

[お店の制服の色ルールに例えて説明]

### 1.3 各コンポーネントの紹介

[7つのコンポーネントを日常例えで順に説明]
```

#### Part 2: 技術者向け実装詳細

**出力先**: `outputs/phase-12/implementation-guide.md` の後半部分

**必須セクション**:

1. **全7コンポーネントのインターフェース/型定義**
   - TypeScript の interface 定義をコードブロックで記載
   - 各 props の説明（型・デフォルト値・必須/任意）

2. **使用例（コードスニペット）**
   - 各コンポーネントの基本使用例
   - props のバリエーション例

3. **デザイントークンマッピング表**

   | コンポーネント   | 使用トークン                                                                                 |
   | ---------------- | -------------------------------------------------------------------------------------------- |
   | StatusIndicator  | `--status-primary`, `--status-success`, `--status-error`, `--status-warning`, `--text-muted` |
   | FilterChip       | `--bg-secondary`, `--accent-primary`, `--text-primary`, `--text-muted`                       |
   | Badge            | `--accent-primary`, `--bg-tertiary`, `--text-primary`                                        |
   | SkeletonCard     | `--bg-secondary`, `--bg-tertiary`                                                            |
   | SuggestionBubble | `--bg-secondary`, `--accent-primary`, `--text-primary`                                       |
   | EmptyState       | `--text-muted`, `--accent-primary`, `--bg-secondary`                                         |
   | RelativeTime     | `--text-muted`                                                                               |

4. **ARIA属性一覧**（Phase 10 Task 1-2 のテーブルと同内容）

5. **テスト実行コマンド**

   ```bash
   # 全Atomsテスト実行
   cd apps/desktop && pnpm vitest run src/renderer/components/atoms/

   # 個別コンポーネントテスト
   cd apps/desktop && pnpm vitest run src/renderer/components/atoms/StatusIndicator/
   cd apps/desktop && pnpm vitest run src/renderer/components/atoms/FilterChip/
   cd apps/desktop && pnpm vitest run src/renderer/components/atoms/Badge/
   cd apps/desktop && pnpm vitest run src/renderer/components/atoms/SkeletonCard/
   cd apps/desktop && pnpm vitest run src/renderer/components/atoms/SuggestionBubble/
   cd apps/desktop && pnpm vitest run src/renderer/components/atoms/EmptyState/
   cd apps/desktop && pnpm vitest run src/renderer/components/atoms/RelativeTime/

   # カバレッジ付き実行
   cd apps/desktop && pnpm vitest run --coverage src/renderer/components/atoms/
   ```

6. **既知の落とし穴と対策**
   - P39: happy-dom 環境では `fireEvent` を使用（`userEvent` 禁止）
   - P40: テスト実行は `cd apps/desktop` してから（P40対策）
   - P9: `beforeEach` でモジュールスコープ変数をリセット
   - P13: タイマーテストは `vi.advanceTimersByTime` を使用

### Task 1-A: aiworkflow-requirements 必須抽出（本実装範囲）

`aiworkflow-requirements/indexes/resource-map.md` を起点に、Atoms実装で必要な仕様を抽出して実装ガイドと仕様更新に反映する。

| カテゴリ             | 必須仕様ファイル                                            | 反映先                                         |
| -------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| UIコンポーネント     | `ui-ux-components.md`                                       | Task 2 Step 1-A/1-B の完了記録とステータス更新 |
| デザインシステム     | `ui-ux-design-system.md`                                    | Task 2 Step 1-A/Step 2（トークン更新）         |
| UI設計原則           | `ui-ux-design-principles.md`                                | Task 1 Part 1/Part 2 のApple HIG/WCAG記載      |
| UIアーキテクチャ     | `arch-ui-components.md`                                     | Task 1 Part 2 のAtomic Design責務説明          |
| コンポーネントテスト | `testing-component-patterns.md`, `testing-accessibility.md` | Task 1 Part 2 のテスト戦略・a11y検証記載       |
| 品質要件             | `quality-requirements.md`                                   | Task 1 Part 2 のカバレッジ/品質ゲート記載      |

非該当（更新対象外）: `api-*.md`, `database-*.md`, `security-*.md`（今回のAtoms実装でAPI/DB/認証仕様変更なし）

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

以下のファイルを**全て**更新する:

| #   | 更新対象ファイル                      | 更新内容                                    |
| --- | ------------------------------------- | ------------------------------------------- |
| 1   | 該当する `ui-ux-components.md`        | タスク完了セクション追加                    |
| 2   | 該当する `ui-ux-design-system.md`     | タスク完了セクション追加                    |
| 3   | `aiworkflow-requirements/LOGS.md`     | タスク完了記録追加                          |
| 4   | `task-specification-creator/LOGS.md`  | タスク完了記録追加（**P1: 2ファイル両方**） |
| 5   | `aiworkflow-requirements/SKILL.md`    | 変更履歴テーブル更新（**P29対策**）         |
| 6   | `task-specification-creator/SKILL.md` | 変更履歴テーブル更新（**P29対策**）         |

**LOGS.md 更新フォーマット**:

```markdown
### TASK-UI-00-ATOMS: Atoms共通コンポーネント実装（{完了日}完了）

| 項目         | 値                                                  |
| ------------ | --------------------------------------------------- |
| テスト数     | {実際のテスト数 — grep -c "it(" で正確にカウント}   |
| 発見課題     | {Phase 10/11で検出した課題数}                       |
| ドキュメント | implementation-guide.md, documentation-changelog.md |

#### テスト結果サマリー

| カテゴリ     | PASS | FAIL |
| ------------ | ---- | ---- |
| Unit Tests   |      |      |
| a11y Tests   |      |      |
| Theme Tests  |      |      |
| Manual Tests |      |      |
```

#### Step 1-B: 実装状況テーブル更新

- [ ] `ui-ux-components.md` のAtomsセクションで以下のステータスを更新:
  - StatusIndicator: 「未実装」→「完了」
  - FilterChip: 「未実装」→「完了」
  - Badge: 「拡張予定」→「完了」
  - SkeletonCard: 「未実装」→「完了」
  - SuggestionBubble: 「未実装」→「完了」
  - EmptyState: 「拡張予定」→「完了」
  - RelativeTime: 「未実装」→「完了」
- [ ] 仕様書作成のみで実装未着手の項目がある場合は、`completed` ではなく `spec_created` を適用

#### Step 1-C: 関連タスクテーブル更新

以下のコマンドで関連仕様書を検索し、全て更新する:

```bash
grep -rn "TASK-UI-00-ATOMS" .claude/skills/aiworkflow-requirements/references/
grep -rn "TASK-UI-00-ATOMS" .claude/skills/task-specification-creator/references/
grep -rn "TASK-UI-00-ATOMS" docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/
```

- [ ] 検索で発見された全仕様書のタスク参照テーブルでステータスを更新

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- [ ] 上記コマンドを実行し、topic-map.md が再生成された
- [ ] 再生成後のdiffを確認し、想定通りの更新内容である

#### Step 1-E: 未タスク指示書の登録整合（検出時必須）

- [ ] 未タスクが1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成
- [ ] `task-workflow.md` と関連仕様書の残課題テーブルに全件登録
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行しリンク整合を確認

#### Step 2: システム仕様更新（該当する場合）

**更新判断**:

- 新規コンポーネント5つ（StatusIndicator, FilterChip, SkeletonCard, SuggestionBubble, RelativeTime）のインターフェースが追加された
- 既存コンポーネント2つ（Badge, EmptyState）のインターフェースが拡張された

**以下の場合にシステム仕様を更新する**:

| 条件                                      | 対象仕様書                  | 更新有無 |
| ----------------------------------------- | --------------------------- | -------- |
| 新規コンポーネントインターフェース追加    | `ui-ux-components.md`       | 要更新   |
| デザイントークン使用パターン追加          | `ui-ux-design-system.md`    | 要更新   |
| Atomsの公開API変更（index.ts export追加） | `interfaces-*.md`（該当時） | 要確認   |

**注意**: IPC 変更はないため、`api-ipc-*.md` / `security-*.md` の更新は不要。

### Task 3: documentation-changelog.md

**出力先**: `outputs/phase-12/documentation-changelog.md`

**必須要件**:

- 更新した**全**仕様書の変更内容を記録
- 各 Step（1-A / 1-B / 1-C / 1-D / 1-E / Step 2）の結果を**個別に**明記
- **P4対策**: 全 Step 確認前に「完了」と記載しない

**テンプレート**:

```markdown
# Documentation Changelog — TASK-UI-00-ATOMS

## Step 1-A: タスク完了記録

| # | ファイル | 更新内容 | 完了 |
| 1 | ui-ux-components.md | 完了タスクセクション追加 | |
| 2 | ui-ux-design-system.md | 完了タスクセクション追加 | |
| 3 | aiworkflow-requirements/LOGS.md | タスク完了記録 | |
| 4 | task-specification-creator/LOGS.md | タスク完了記録 | |
| 5 | aiworkflow-requirements/SKILL.md | 変更履歴更新 | |
| 6 | task-specification-creator/SKILL.md | 変更履歴更新 | |

## Step 1-B: 実装状況テーブル

| # | ファイル | 更新内容 | 完了 |
| 1 | ui-ux-components.md | Atoms 7コンポーネントのステータス更新 | |

## Step 1-C: 関連タスクテーブル

| # | ファイル | 更新内容 | 完了 |
[grep結果に基づいて記載]

## Step 1-D: topic-map.md 再生成

| # | ファイル | 更新内容 | 完了 |
| 1 | topic-map.md | generate-index.js で再生成 | |

## Step 1-E: 未タスク登録整合

| # | ファイル | 更新内容 | 完了 |
| 1 | docs/30-workflows/unassigned-task/ | 未タスク指示書作成（検出時） | |
| 2 | task-workflow.md | 残課題テーブル登録（検出時） | |
| 3 | verify-unassigned-links.js 結果 | 参照リンク整合確認 | |

## Step 2: システム仕様更新

| # | ファイル | 更新内容 | 完了 |
[該当する場合に記載]

## 苦戦箇所の記録

[実装で苦戦した箇所を記録]

## 最終確認

- [ ] 全 Step の結果が記録されている
- [ ] 「完了」は全項目確認後に記載した
```

### Task 4: 未タスク検出レポート

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

**必須要件**: **0件でも作成必須**

#### 検出ソース（全て実施する）

| #   | 検出ソース                          | コマンド/方法                                       |
| --- | ----------------------------------- | --------------------------------------------------- |
| 1   | Phase 3 設計レビュー MINOR 指摘     | `outputs/phase-3/` レビュー結果を参照               |
| 2   | Phase 10 最終レビュー MINOR 指摘    | `outputs/phase-10/final-review-result.md` を参照    |
| 3   | Phase 11 手動テスト発見事項         | `outputs/phase-11/manual-test-result.md` を参照     |
| 4   | 各Phase成果物の「将来対応」「TODO」 | `grep -rn "TODO\|FIXME\|HACK\|XXX" outputs/` で検索 |
| 5   | コードベースの TODO/FIXME           | 以下のコマンドで検索:                               |

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" \
  apps/desktop/src/renderer/components/atoms/StatusIndicator/ \
  apps/desktop/src/renderer/components/atoms/FilterChip/ \
  apps/desktop/src/renderer/components/atoms/Badge/ \
  apps/desktop/src/renderer/components/atoms/SkeletonCard/ \
  apps/desktop/src/renderer/components/atoms/SuggestionBubble/ \
  apps/desktop/src/renderer/components/atoms/EmptyState/ \
  apps/desktop/src/renderer/components/atoms/RelativeTime/
```

#### UI コンポーネント実装時の横断的検出パターン

以下の観点で未タスクを検出する（unassigned-task-guidelines.md 準拠）:

- [ ] ダークモード完全対応（3テーマ全てでの視覚的品質）
- [ ] アクセシビリティ追加対応（スクリーンリーダー最適化、高コントラストモード）
- [ ] レスポンシブ追加対応（超小画面 <320px 等）

#### 検出した未タスクの3ステップ処理

検出件数が1件以上の場合、**全ての**未タスクに対して以下の3ステップを実施する:

1. **指示書作成**: `docs/30-workflows/unassigned-task/` に指示書を作成
   - ファイル命名規則: `task-ui-atoms-{改善領域}.md`
   - 品質基準: Why/What/How 構成（unassigned-task-guidelines.md 準拠）
   - 親タスク教訓反映セクションを含める
2. **残課題テーブル登録**: `task-workflow.md` に登録
3. **関連仕様書リンク追加**: 関連する仕様書に参照リンクを追加

- [ ] 物理ファイル存在確認: `ls docs/30-workflows/unassigned-task/task-ui-atoms-*.md`

#### 0件の場合

以下の形式で明示的に記録する:

```markdown
## 未タスク検出結果

検出件数: 0件

### 検索実施記録

| # | 検出ソース | 実施日 | 結果 |
| 1 | Phase 3 レビュー MINOR | {日付} | 0件 |
| 2 | Phase 10 レビュー MINOR | {日付} | 0件 |
| 3 | Phase 11 手動テスト | {日付} | 0件 |
| 4 | 成果物 TODO/FIXME | {日付} | 0件 |
| 5 | コードベース TODO/FIXME | {日付} | 0件 |
| 6 | 横断的検出パターン | {日付} | 0件 |
```

### Task 5: スキルフィードバックレポート

**出力先**: `outputs/phase-12/skill-feedback-report.md`

**必須要件**: **改善点がなくても作成必須**（P28対策）

**記録すべき観点**:

- タスク仕様書の品質（曖昧な箇所、不足情報）
- Phase 実行フローの改善点
- ツール・スクリプトの改善要望
- 落とし穴の追加候補

## 参照資料

| 参照                                                                 | パス                                                                                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------- |
| Atoms仕様書                                                          | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/00-2-atoms-components.md`                                 |
| Phase 2 設計成果物                                                   | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-2-design.md`                       |
| Phase 5 実装成果物                                                   | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-5-implementation.md`               |
| Phase 6 テスト拡充成果物                                             | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-6-test-expansion.md`               |
| Phase 7 カバレッジ成果物                                             | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-7-coverage-check.md`               |
| Phase 8 リファクタ成果物                                             | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-8-refactoring.md`                  |
| Phase 9 品質成果物                                                   | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/phase-9-quality-assurance.md`            |
| Phase 11-12 ガイド                                                   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                              |
| 仕様更新フロー                                                       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                           |
| 未タスクガイドライン                                                 | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                                     |
| UIコンポーネント仕様                                                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                  |
| UIデザインシステム                                                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                               |
| UIデザイン原則                                                       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                           |
| UIアーキテクチャ                                                     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                |
| テストパターン                                                       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                        |
| a11yテスト                                                           | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                             |
| 品質要件                                                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                              |
| Phase 10 レビュー結果                                                | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/outputs/phase-10/final-review-result.md` |
| Phase 11 手動テスト結果                                              | `docs/30-workflows/skill-import-agent-system/tasks/ui-overhaul/task-ui-00-atoms/outputs/phase-11/manual-test-result.md`  |
| 既存コンポーネント分析                                               | `outputs/phase-1/existing-component-analysis.md`                                                                         | Phase 1 成果物  |
| コンポーネント要件定義                                               | `outputs/phase-1/component-requirements.md`                                                                              | Phase 1 成果物  |
| アクセシビリティ要件                                                 | `outputs/phase-1/accessibility-requirements.md`                                                                          | Phase 1 成果物  |
| テーマ要件                                                           | `outputs/phase-1/theme-requirements.md`                                                                                  | Phase 1 成果物  |
| 後方互換性要件                                                       | `outputs/phase-1/backward-compatibility-requirements.md`                                                                 | Phase 1 成果物  |
| インターフェース設計                                                 | `outputs/phase-2/interface-design.md`                                                                                    | Phase 2 成果物  |
| 実装サマリー（7コンポーネント実装・R-1〜R-6対応・barrel export更新） | `outputs/phase-5/implementation-summary.md`                                                                              | Phase 5 成果物  |
| コード品質分析結果                                                   | `outputs/phase-8/code-quality-analysis.md`                                                                               | Phase 8 成果物  |
| リファクタリングログ                                                 | `outputs/phase-8/refactoring-log.md`                                                                                     | Phase 8 成果物  |
| ESLintレポート                                                       | `outputs/phase-9/lint-report.md`                                                                                         | Phase 9 成果物  |
| 型チェックレポート                                                   | `outputs/phase-9/typecheck-report.md`                                                                                    | Phase 9 成果物  |
| テストレポート                                                       | `outputs/phase-9/test-report.md`                                                                                         | Phase 9 成果物  |
| 品質ゲート判定結果                                                   | `outputs/phase-9/quality-gate-result.md`                                                                                 | Phase 9 成果物  |
| 要件-実装整合性検証                                                  | `outputs/phase-10/requirements-implementation-alignment.md`                                                              | Phase 10 成果物 |
| テストカバレッジ総括                                                 | `outputs/phase-10/test-coverage-summary.md`                                                                              | Phase 10 成果物 |
| デザイントークン監査                                                 | `outputs/phase-10/design-token-audit.md`                                                                                 | Phase 10 成果物 |
| テーマテスト結果                                                     | `outputs/phase-11/theme-test-result.md`                                                                                  | Phase 11 成果物 |
| レスポンシブテスト結果                                               | `outputs/phase-11/responsive-test-result.md`                                                                             | Phase 11 成果物 |
| インタラクションテスト結果                                           | `outputs/phase-11/interaction-test-result.md`                                                                            | Phase 11 成果物 |
| アクセシビリティテスト結果                                           | `outputs/phase-11/accessibility-test-result.md`                                                                          | Phase 11 成果物 |

## 統合テスト連携

- Phase 10 MINOR 指摘 → Task 4 未タスク検出の入力
- Phase 11 発見事項 → Task 4 未タスク検出の入力
- Phase 3 MINOR 指摘 → Task 4 未タスク検出の入力（対応済み確認も含む）

## 成果物

| #   | 成果物                        | パス                                            |
| --- | ----------------------------- | ----------------------------------------------- |
| 1   | 実装ガイド（Part 1 + Part 2） | `outputs/phase-12/implementation-guide.md`      |
| 2   | ドキュメント変更履歴          | `outputs/phase-12/documentation-changelog.md`   |
| 3   | 未タスク検出レポート          | `outputs/phase-12/unassigned-task-detection.md` |
| 4   | スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`     |

## 完了条件

- [ ] Phase 12 の全Task（Task 1〜Task 5）を完了し、成果物を作成した

### Task 1: 実装ガイド

- [ ] Part 1: 全7コンポーネントに日常例えが含まれている
- [ ] Part 1: 専門用語を使っていない（使用時はカッコ書き説明あり）
- [ ] Part 1: Atomic Design を「レゴブロック」で例えている
- [ ] Part 1: デザイントークンを「お店の制服の色ルール」で例えている
- [ ] Part 2: 全7コンポーネントのインターフェース定義が記載されている
- [ ] Part 2: 全7コンポーネントの使用例コードスニペットが記載されている
- [ ] Part 2: デザイントークンマッピング表が記載されている
- [ ] Part 2: ARIA属性一覧が記載されている
- [ ] Part 2: テスト実行コマンドが記載されている（P40対策: `cd apps/desktop` 形式）
- [ ] Part 2: 既知の落とし穴と対策（P39/P40/P9/P13）が記載されている

### Task 2: システム仕様書更新

- [ ] Step 1-A: `ui-ux-components.md` に完了タスクセクション追加
- [ ] Step 1-A: `ui-ux-design-system.md` に完了タスクセクション追加
- [ ] Step 1-A: `aiworkflow-requirements/LOGS.md` 更新済み
- [ ] Step 1-A: `task-specification-creator/LOGS.md` 更新済み（**P1: 2ファイル両方**）
- [ ] Step 1-A: `aiworkflow-requirements/SKILL.md` 変更履歴更新済み（**P29対策**）
- [ ] Step 1-A: `task-specification-creator/SKILL.md` 変更履歴更新済み（**P29対策**）
- [ ] Step 1-B: `ui-ux-components.md` の Atoms 実装ステータス 7件更新済み
- [ ] Step 1-C: `grep` で関連仕様書を検索し、全て更新済み
- [ ] Step 1-D: `topic-map.md` を再生成済み（**P2/P27対策**）
- [ ] Step 1-E: 未タスク検出時に指示書作成・残課題登録・リンク整合確認を全て実施済み
- [ ] Step 2: システム仕様更新の要否を判断し、必要な場合は更新済み

### Task 3: documentation-changelog.md

- [ ] 更新した全仕様書の変更内容が記録されている
- [ ] 各 Step（1-A/1-B/1-C/1-D/1-E/Step 2）の結果が個別に明記されている
- [ ] 苦戦箇所が記録されている
- [ ] 全 Step 確認後に「完了」と記載した（**P4対策**）

### Task 4: 未タスク検出レポート

- [ ] 全6検出ソースを実施した
- [ ] 横断的検出パターン（ダークモード/a11y/レスポンシブ）を確認した
- [ ] 0件の場合でもレポートを作成した
- [ ] 1件以上の場合、3ステップ全完了:
  - [ ] `docs/30-workflows/unassigned-task/` に指示書作成（**P38: 配置先注意**）
  - [ ] `task-workflow.md` 残課題テーブルに登録
  - [ ] 関連仕様書に参照リンク追加
- [ ] 物理ファイル存在確認を `ls` で実施した

### Task 5: スキルフィードバックレポート

- [ ] レポートを作成した（**P28対策: 改善点0件でも必須**）

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 12 ステータスを `completed` に更新
- [ ] 全5タスクの完了を確認してからステータスを更新（P4対策: 早期完了記載禁止）
- [ ] LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（P43対策）

## 依存関係

| 方向 | Phase / タスク           | 内容                               |
| ---- | ------------------------ | ---------------------------------- |
| 前提 | Phase 11（手動テスト）   | 手動テスト結果を未タスク検出に活用 |
| 前提 | Phase 10（最終レビュー） | レビュー結果を未タスク検出に活用   |
| 前提 | Phase 3（設計レビュー）  | レビュー結果を未タスク検出に活用   |
| 後続 | Phase 13（PR作成）       | ドキュメント完了後にPR準備         |

## 次のPhase

→ Phase 13（PR作成）`phase-13-pr-creation.md`
