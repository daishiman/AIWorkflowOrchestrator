# Phase 3 MINOR 指摘→未タスク自動追跡フロー整備 - タスク指示書

## メタ情報

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-TASK06-006                                                                  |
| タスク名     | Phase 3 MINOR 指摘→未タスク自動追跡フロー整備                                  |
| 分類         | ワークフロー改善                                                               |
| 対象機能     | Phase 3 設計レビュー → Phase 12 未タスク追跡フロー                             |
| 優先度       | 中                                                                             |
| 見積もり規模 | 中規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 skill-feedback-report T-01 |
| 発見日       | 2026-03-17                                                                     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 の Phase 3 で指摘した MINOR-01〜03 が Phase 12 まで正式な追跡パスなしで放置され、Phase 10 最終レビューで同じ内容が再度 MINOR 指摘として登場した。Phase 3 MINOR 指摘から Phase 12 未タスク検出への追跡が手動依存で断絶しやすい構造になっている。

### 1.2 問題点・課題

- Phase 3 設計レビューテンプレートに MINOR 指摘の即時未タスク登録を促すセクションがない。
- `artifacts.json` に MINOR 指摘を候補として記録するフィールドが存在しない。
- Phase 12 の未タスク検出 Task 4 に「Phase 3 MINOR の3ステップ完了確認」が必須チェックとして含まれていない。

### 1.3 放置した場合の影響

- Phase 10 で「再発見」する無駄工数が発生し続ける。
- MINOR 指摘が紛失し、品質改善の機会が失われる。
- 同一問題を異なるフェーズで二重にトリアージするコストが継続する。

### 1.4 苦戦箇所の記録（今回の実装経験から）

**苦戦箇所1: TDD Red→Green での既存テスト回帰見落とし**

- GAP-02 で `status: "error"` → `"disconnected"` に変更した際、既存テスト `llm.test.ts` L231 の期待値更新が漏れた。
- 原因: Phase 5 開始前に既存テストの baseline 確認を行わなかった。
- 解決: `grep -rn '"error"' __tests__/` で既存テスト期待値を事前確認するステップを Phase 5 テンプレートに追加する。
- 関連: P60（IPC テスト応答形式の不一致）

**苦戦箇所2: Phase 3 MINOR が Phase 10 で再発見される問題**

- MINOR-01〜03 は Phase 3 で記録したが、Phase 12 の未タスク検出まで正式な追跡パスがなかった。
- Phase 10 レビュアーが同じ問題を独立して発見し、二重工数が発生した。

## 2. 何を達成するか（What）

### 2.1 目的

Phase 3 設計レビューで検出した MINOR 指摘を即時に未タスク候補として登録し、Phase 12 の未タスク検出 Task 4 で追跡完了を確認できる仕組みを整備する。

### 2.2 最終ゴール

- Phase 3 設計レビューで MINOR 指摘が発生した時点で、未タスク候補が `artifacts.json` に記録される。
- Phase 12 の未タスク検出 Task 4 で「Phase 3 MINOR 指摘の3ステップ完了」が必須チェックとして確認される。
- Phase 10 での「再発見」による二重工数がゼロになる。

### 2.3 スコープ

#### 含むもの

- `phase-template-phase3.md` への MINOR 即時登録テンプレートセクション追加。
- `artifacts.json` スキーマへの `minorIssues` フィールド追加と説明。
- Phase 12 テンプレート（`phase-12-documentation.md` 参照）の Task 4 チェックリストへの「Phase 3 MINOR 追跡完了確認」ステップ追加。
- `scripts/validate-phase-output.js`（または相当するスクリプト）への MINOR→UT 追跡検証ロジック追加（該当スクリプトが存在する場合）。
- `05-task-execution.md` の Phase 12 チェックリストへの記載反映。

#### 含まないもの

- 既存タスクの MINOR 指摘の遡及的な再登録。
- Phase 3 以外のフェーズのレビュー形式変更。
- CI/CD パイプラインへの組み込み。

### 2.4 成果物

- 更新済み `phase-template-phase3.md`（MINOR 即時登録セクション付き）。
- 更新済み `artifacts.json` スキーマ定義またはサンプル。
- 更新済み Phase 12 テンプレート（Task 4 チェックリスト追加）。
- 更新済み `05-task-execution.md`（Phase 12 チェックリスト反映）。

## 3. どのように実現するか（How）

### 3.1 前提条件

- TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 が完了していること。
- 現在の Phase 3 / Phase 12 テンプレートの最新版が参照可能なこと。

### 3.2 依存タスク

- TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001（完了）

### 3.3 必要な知識

- タスク実行ワークフロー（Phase 1-13 の流れ）
- `artifacts.json` のスキーマ構造
- `05-task-execution.md` の Phase 12 チェックリスト

### 3.4 推奨アプローチ

1. 現在の Phase 3 テンプレートを確認し、MINOR 指摘セクションの有無を確認する。
2. `artifacts.json` の既存スキーマを確認し、`minorIssues` フィールドの追加箇所を特定する。
3. Phase 12 テンプレートの Task 4 チェックリストを確認し、追加すべきチェック項目を定義する。
4. 各テンプレートを更新し、`05-task-execution.md` の記載と整合させる。

## 4. 実行手順

1. Phase 3 テンプレートの現状確認:
   ```bash
   find .claude/skills -name "phase-template-phase3.md" -o -name "*phase3*template*" | head -5
   ```
2. `artifacts.json` スキーマの確認:
   ```bash
   cat docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/artifacts.json | head -50
   ```
3. Phase 12 テンプレートの Task 4 チェックリスト確認:
   ```bash
   grep -n "Task 4\|未タスク検出\|Phase 3 MINOR" .claude/rules/05-task-execution.md
   ```
4. Phase 3 テンプレートに以下のセクションを追加する:

   ```markdown
   ## MINOR 指摘の即時登録（判定: MINOR の場合）

   - [ ] 各 MINOR 指摘を `artifacts.json` の `minorIssues` 配列に追記
   - [ ] 指摘内容・影響範囲・未タスク候補 ID を記録
   - [ ] Phase 12 未タスク検出（Task 4）で3ステップ完了を確認する旨を明記
   ```

5. `artifacts.json` に `minorIssues` フィールドを追加する（Phase 3 完了時点で記録）。
6. Phase 12 テンプレートの Task 4 に以下のチェックを追加する:
   ```markdown
   - [ ] `artifacts.json` の `minorIssues` を参照し、全 MINOR 指摘の3ステップ完了を確認
         （①`unassigned-task/` に指示書作成 → ②`task-workflow.md` 残課題テーブルに登録 → ③関連仕様書にリンク追加）
   ```
7. `05-task-execution.md` の Phase 12 チェックリスト（Task 4 セクション）に上記ステップを反映する。

## 5. 完了条件チェックリスト

- [ ] Phase 3 テンプレートに MINOR 即時登録セクションが追加されている
- [ ] `artifacts.json` スキーマに `minorIssues` フィールドの説明/サンプルが追加されている
- [ ] Phase 12 テンプレートの Task 4 に「Phase 3 MINOR 追跡完了確認」チェックが追加されている
- [ ] `05-task-execution.md` のチェックリストと整合が取れている
- [ ] 追加したチェック項目が `06-known-pitfalls.md` の P4 / P3 パターンと矛盾しない

## 6. 検証方法

- `grep -rn "minorIssues\|MINOR.*追跡\|Phase 3 MINOR" .claude/rules/05-task-execution.md` で反映確認。
- `grep -n "minorIssues" docs/30-workflows/*/artifacts.json` でスキーマサンプル確認。
- 次のタスクで Phase 3 を実行し、MINOR 指摘が artifacts.json に記録されることを確認。

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                               |
| --------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------ |
| テンプレート追加が形骸化し実際に記録されない        | 高     | 中       | `validate-phase-output.js` に MINOR→UT 追跡の自動検証を追加        |
| `artifacts.json` スキーマ変更が既存ファイルと非互換 | 中     | 低       | フィールドをオプション（`minorIssues?`）として定義し後方互換を維持 |
| Phase 12 チェック追加により作業工数が増加           | 低     | 中       | チェックは「記録済み minorIssues の確認」のみで新規調査は不要      |

## 8. 参照情報

- `.claude/rules/05-task-execution.md`（Phase 12 チェックリスト）
- `.claude/rules/06-known-pitfalls.md` P3 / P4 / P38
- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/artifacts.json`
- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/phase-12-documentation.md`

## 9. 備考

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 の skill-feedback-report T-01 から抽出。Phase 3 MINOR-01〜03 が Phase 10 で再発見されたことが直接の発見契機。P4（documentation-changelog 早期完了記載）と同様に、「記録されたが追跡されない」問題を防ぐためのフロー整備タスク。
