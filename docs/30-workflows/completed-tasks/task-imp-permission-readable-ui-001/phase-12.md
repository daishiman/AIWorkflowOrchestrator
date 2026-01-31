# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 12                                  |
| フェーズ名   | ドキュメント更新                    |
| カテゴリ     | 文書化                              |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

Phase 12の4つの必須タスクを実行する。実装ガイド（2パート構成）、システム仕様書更新、ドキュメント更新履歴、未タスク検出レポートを作成する。

---

## タスク

- Task 1: 実装ガイド作成（2パート構成）
  - **Part 1（初学者・中学生レベル）**: 概念説明（日常の例え話、専門用語なし）
  - **Part 2（開発者・技術者レベル）**: 技術的詳細（TypeScriptインターフェース、API、コード例）
  - `outputs/phase-12/implementation-guide.md` に出力する

- Task 2: システム仕様書更新（2ステップ）
  - **Step 1-A**: 「完了タスク」セクションにtask-imp-permission-readable-ui-001の完了記録を追加
  - **Step 1-B**: 関連する仕様書の実装状況テーブルを更新
  - **Step 1-C**: 関連タスクテーブルのステータスを更新（arch-state-management.md等）
  - **Step 2**（条件付き）: 新規インターフェースが追加された場合、システム仕様書を更新
  - LOGS.md（aiworkflow-requirements + task-specification-creator の両方）を更新する

- Task 3: ドキュメント更新履歴作成
  - `outputs/phase-12/documentation-changelog.md` に更新内容を記録する
  - artifacts.json の Phase 12 ステータスを complete に更新する

- Task 4: 未タスク検出レポート作成（0件でも出力必須）
  - 元タスク仕様書の「スコープ外」項目を確認する
  - Phase 3/10レビュー結果のMINOR判定事項を確認する
  - Phase 11手動テストのスコープ外発見事項を確認する
  - コードコメント（TODO/FIXME/HACK/XXX）をスキャンする
  - `outputs/phase-12/unassigned-task-detection.md` に出力する

---

## 参照資料

| ドキュメント               | パス                                                                         | 説明               |
| -------------------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 5実装                | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`       | 文書化対象         |
| Phase 5実装                | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`            | 文書化対象         |
| Phase 11手動テストレポート | `outputs/phase-11/manual-test-report.md`                                     | 発見事項確認       |
| Phase 3レビューレポート    | `outputs/phase-3/design-review-report.md`                                    | MINOR事項確認      |
| Phase 10レビューレポート   | `outputs/phase-10/final-review-report.md`                                    | MINOR事項確認      |
| 未タスク指示書             | `docs/30-workflows/unassigned-task/task-imp-permission-readable-ui-001.md`   | スコープ外項目確認 |
| 仕様更新フロー             | `spec-update-workflow.md` (task-specification-creator)                       | 仕様更新手順       |
| UI/UXエージェント実行      | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md` | 関連仕様書         |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | 関連タスクテーブル |

---

## 手順

### Task 1 実行手順

1. `outputs/phase-12/implementation-guide.md` を作成する
2. **Part 1（中学生レベル）** を以下のルールで記述する：
   - 日常生活での例え話を**必ず**含める
   - 専門用語は使わない（使う場合は即座に説明）
   - 「なぜ必要か」を先に説明してから「何をするか」を説明
   - 例: 「アプリがあなたのパソコンで何かしようとする時、『何をしますか？』と聞いてくるダイアログがあります。これまでは、パソコンの専門用語でしか説明していなかったので、初めて使う人には分かりにくかったのです。例えるなら、レストランのメニューが全部料理の専門用語で書かれているようなものです。今回の改善で、日本語で分かりやすく説明するようにしました。」

3. **Part 2（技術者レベル）** を以下の内容で記述する：
   - TypeScriptインターフェース・型定義
   - `getDescription()` APIシグネチャと使用例
   - ツール別テンプレート一覧
   - エラーハンドリング・フォールバック仕様
   - ARIA属性・アクセシビリティ実装詳細
   - 設定可能なパラメータ一覧

### Task 2 実行手順

**Step 1-A: 完了タスク記録**

1. `spec-update-workflow.md` を読み込み、更新手順を確認する
2. 関連するシステム仕様書（`ui-ux-agent-execution.md` 等）の「完了タスク」セクションに追加する
3. LOGS.md（aiworkflow-requirements）を更新する
4. LOGS.md（task-specification-creator）を更新する

**Step 1-B: 実装状況テーブル更新**

1. 関連仕様書の実装状況テーブルを確認する
2. 「PermissionDialog人間可読UI」関連の行を更新する

**Step 1-C: 関連タスクテーブル更新**

1. `arch-state-management.md` 等の「関連タスク」テーブルを確認する
2. task-imp-permission-readable-ui-001 のステータスを「完了」に更新する

**Step 1-D: topic-map.md 更新**

1. `topic-map.md` を読み込み、permissionDescriptions関連のトピックエントリを追加する
2. キーワード→仕様書ファイルのマッピングを更新する（例: `permissionDescriptions` → `ui-ux-agent-execution.md`）

**Step 2: システム仕様更新（条件付き）**

1. 新規インターフェース（`getDescription`関数の型等）が追加されている場合：
   - `ui-ux-agent-execution.md` に permissionDescriptions の仕様を追加する
2. 新規インターフェースがない場合（内部実装のみ）：
   - 「新規インターフェースの追加なし、内部実装変更のみ」と記録する

### Task 3 実行手順

1. `outputs/phase-12/documentation-changelog.md` を作成する
2. 以下のフォーマットで記載する：

   ```markdown
   # ドキュメント更新履歴

   ## 更新日: YYYY-MM-DD

   ## タスク: task-imp-permission-readable-ui-001

   ### 更新内容

   | 文書                    | 更新タイプ | 内容                      |
   | ----------------------- | ---------- | ------------------------- |
   | implementation-guide.md | 新規作成   | 実装ガイド（2パート構成） |
   | (仕様書名)              | 更新       | (更新内容)                |
   ```

3. artifacts.json の Phase 12 ステータスを更新する：
   - `generate-documentation-changelog.js` スクリプトを参照し、更新履歴のフォーマットを確認する
   - `complete-phase.js` スクリプトの手順に従い、artifacts.json のPhase 12ステータスを `complete` に更新する：
     ```bash
     # artifacts.json の Phase 12 status を "complete" に更新
     # complete-phase.js の実行手順を参照
     ```

### Task 4 実行手順

1. 以下のソースから未タスク候補を検出する：

| ソース               | 確認内容                                                     |
| -------------------- | ------------------------------------------------------------ |
| 元タスク仕様書       | 「スコープ外」: 多言語対応、AI生成動的説明、カスタマイズ設定 |
| Phase 3レビュー結果  | MINOR判定事項                                                |
| Phase 10レビュー結果 | MINOR判定事項                                                |
| Phase 11手動テスト   | スコープ外発見事項・改善提案                                 |
| コードコメント       | TODO/FIXME/HACK/XXX                                          |

2. 検出コマンドを実行する：

   ```bash
   cd apps/desktop && grep -rn "TODO\|FIXME\|HACK\|XXX" src/renderer/components/skill/permissionDescriptions.ts src/renderer/components/skill/PermissionDialog.tsx
   ```

3. `outputs/phase-12/unassigned-task-detection.md` を作成する（0件でも必須）

---

## 統合テストアクション

| カテゴリ       | 確認内容                                   |
| -------------- | ------------------------------------------ |
| 文書品質       | Part 1が中学生レベルで理解可能か確認       |
| 仕様整合性     | システム仕様書との整合性確認               |
| 未タスク網羅性 | 全ソースからの未タスク候補が検出されている |

---

## システム開発観点チェック

| 観点               | 該当 | 確認内容                                             |
| ------------------ | ---- | ---------------------------------------------------- |
| UI/UX（Apple HIG） | ○    | UI変更の実装ガイドが適切にドキュメント化されている   |
| アーキテクチャ     | ○    | Renderer層のモジュール配置がドキュメント化されている |

### Electronデスクトップアプリ観点

| 層                 | 該当 | 確認内容                             |
| ------------------ | ---- | ------------------------------------ |
| フロントエンド     | ○    | Renderer層の実装ガイドに含まれている |
| バックエンド(Main) | ×    | Main側変更なし（ドキュメント対象外） |

---

## 成果物

| 成果物名             | パス                                            | 種別     | 説明                               |
| -------------------- | ----------------------------------------------- | -------- | ---------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | document | Part 1（中学生）+ Part 2（技術者） |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | document | 更新内容の記録                     |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | document | 未タスク候補一覧（0件でも出力）    |

---

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル）が作成されている
- [ ] Part 1に日常生活の例え話が含まれている
- [ ] Part 1に専門用語が使われていない（使用時は即座に説明）
- [ ] 実装ガイド Part 2（技術者レベル）が作成されている
- [ ] Part 2にTypeScriptインターフェース/型定義が含まれている
- [ ] Part 2にAPIシグネチャと使用例が含まれている
- [ ] Part 2にエラーハンドリング・エッジケース説明が含まれている
- [ ] Step 1-A: 完了タスク記録が追加されている
- [ ] Step 1-B: 実装状況テーブルが更新されている
- [ ] Step 1-C: 関連タスクテーブルのステータスが更新されている
- [ ] Step 1-D: topic-map.mdが更新されている
- [ ] Step 2: システム仕様更新の判断が記録されている
- [ ] LOGS.md（aiworkflow-requirements）が更新されている
- [ ] LOGS.md（task-specification-creator）が更新されている
- [ ] ドキュメント更新履歴が作成されている
- [ ] artifacts.json が更新されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力済み）
- [ ] 成果物3件が全て `outputs/phase-12/` に生成されている

---

## 次のフェーズ

Phase 13: PR作成 → Pull Request作成
