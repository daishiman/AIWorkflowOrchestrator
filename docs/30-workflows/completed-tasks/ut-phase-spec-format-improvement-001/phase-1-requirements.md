# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 1                                                                 |
| Phase名    | 要件定義                                                          |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | -                                                                 |
| 次Phase    | Phase 2: 設計                                                     |
| ステータス | pending                                                           |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

現行の Phase 仕様書テンプレートの問題点を分析し、Task/Step 分離ガイドラインと NON_VISUAL evidence ルールの要件を確定する。タスク種別を明示的に記録する。

## タスク種別宣言

| 項目          | 内容                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスク種別    | docs-only                                                                                                                                                        |
| 判定フラグ    | NON_VISUAL                                                                                                                                                       |
| 理由          | テンプレート `.md` ファイルの編集のみ。UI 表示層への変更なし                                                                                                     |
| Phase 11 証跡 | manual-test-checklist.md / manual-test-result.md / discovered-issues.md / `SKILL.md` family / `LOGS.md` archive / `.claude` ↔ `.agents` parity / validator rerun |

## 実行タスク

1. 現行テンプレートの構造と既存実例を確認する
2. Task/Step 混在と NON_VISUAL screenshot 前提の問題を具体化する
3. VISUAL / NON_VISUAL 判定基準と受入条件を確定する
4. スコープ境界と変更対象ファイルを確定する
5. 参照資料と成果物を定義し、次Phaseへ引き渡す

## 実行手順

### Task 1-1: P50チェック — 現行テンプレートの状態確認

Phase 1 開始時に、改修対象ファイルの現在の実装状態を確認する。

```bash
# phase-spec-template.md の現行構造確認
cat .claude/skills/task-specification-creator/assets/phase-spec-template.md

# Phase 11 / Phase 12 テンプレート相当のセクション確認
grep -n "Phase 11\|Phase 12\|manual-test-checklist\|manual-test-result\|discovered-issues\|NON_VISUAL\|VISUAL\|Task\|Step" \
  .claude/skills/task-specification-creator/assets/phase-spec-template.md

# 参照実例: TASK-P0-01 Phase 12 実例確認
cat docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/phase-12-documentation.md | head -100

# 参照実例: TASK-P0-01 Phase 11 実例確認
cat docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/phase-11-manual-test.md | head -100

# skill-feedback-report の提案確認
cat docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/skill-feedback-report.md
```

| 判定           | 条件                                                    | 対応                           |
| -------------- | ------------------------------------------------------- | ------------------------------ |
| 未修正（想定） | Task/Step 分離ガイドライン未記載、screenshot 前提が残存 | 設計→実装フローで修正を進行    |
| 部分修正済み   | 一部のルールが既に記載されている                        | 既存記述を活かして追記         |
| 既修正         | 両方の改善が既に反映されている                          | スコープ見直しをユーザーに確認 |

### Task 1-2: 問題の具体化

以下の 2 問題を具体例とともに文書化する。

**問題 1: Task と Step の混在**

`phase-12-documentation.md` の実例から、Task 12-1〜12-5（計画）と Step 1-A〜1-G（検証ログ）が同一セクションに混在している箇所を特定し、問題の具体例として抽出する。

- 混在箇所の特定（行番号付き）
- plan と current fact が区別できない理由の言語化
- 改善後の理想構造の素案作成

**問題 2: NON_VISUAL タスクでの screenshot 前提残存**

`phase-11-manual-test.md` と `phase-spec-template.md` の実例から、NON_VISUAL タスクで screenshot が前提になっているセクションを特定する。

- 該当セクションの特定
- false green が発生する具体的なシナリオの文書化
- NON_VISUAL 時の代替 evidence 要件の定義

### Task 1-3: タスク種別判定基準の確定

VISUAL / NON_VISUAL の判定基準を明文化する。

| タスク種別 | 判定基準                                                      | evidence 要件                                    |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------ |
| VISUAL     | UI コンポーネントの表示変更、スタイル変更、レイアウト変更あり | screenshot-plan.json + 実 PNG + vitest/typecheck |
| NON_VISUAL | 表示層変更なし（バックエンド、テンプレート、型定義のみ）      | vitest / typecheck / lint の実行結果のみ         |

判断に迷う場合のフォールバック: **VISUAL 扱い**（より厳格な証跡収集を適用）

### Task 1-4: 受入条件の確定

| AC   | 条件                                                                               | 検証方法               |
| ---- | ---------------------------------------------------------------------------------- | ---------------------- |
| AC-1 | `phase-spec-template.md` に Task/Step 分離ガイドラインが追加されている             | テンプレートdiff確認   |
| AC-2 | Phase 11 テンプレートに「NON_VISUAL の場合 screenshot 不要」ルールが明記されている | テンプレートdiff確認   |
| AC-3 | Phase 12 テンプレートに「実行タスク」と「検証ログ」の分離構造が定義されている      | テンプレートdiff確認   |
| AC-4 | Handlebars 条件分岐による VISUAL / NON_VISUAL の切り替えが正しく動作する           | Handlebars構文チェック |
| AC-5 | 改修済みテンプレートで仮生成した仕様書が既存フォーマットと互換性を保っている       | 仮生成・目視確認       |

### Task 1-5: スコープ境界の確定

**含む**:

- `phase-spec-template.md` の構造改善
- Phase 11 テンプレートへの NON_VISUAL evidence ルール追記
- Phase 12 テンプレートへの「実行タスク」と「検証ログ」の分離構造定義
- `unassigned-task-template.md` への苦戦箇所記載欄の明確化
- テンプレート変更の影響調査

**含まない**:

- 既存の完了済み Phase 仕様書の遡及修正
- Phase 仕様書生成スクリプトのロジック変更
- `skill-fixture-runner` のフィクスチャ追加
- `implementation-guide.md` の使用例必須化

## 参照資料

| 資料名                             | パス                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| phase-spec-template.md（改修対象） | `.claude/skills/task-specification-creator/assets/phase-spec-template.md`                                                            |
| unassigned-task-template.md        | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`                                                       |
| Phase 12 実例（Task/Step混在）     | `docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/phase-12-documentation.md`                 |
| Phase 11 実例（NON_VISUAL証跡）    | `docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/phase-11-manual-test.md`                   |
| skill-feedback-report（発見元）    | `docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/skill-feedback-report.md` |

## 成果物

| 成果物         | パス                                     | 説明                                     |
| -------------- | ---------------------------------------- | ---------------------------------------- |
| 仕様抽出マップ | `outputs/phase-1/spec-extraction-map.md` | 問題具体例・タスク種別判定基準・受入条件 |

## 統合テスト連携

- Phase 2 の設計で本 Phase の要件・AC・判定基準を引き継ぐ。
- `verify-all-specs` / `validate-phase-output` の構造を以降の Phase でも維持する。

## 完了条件

- [ ] P50チェックで改修対象ファイルの現在状態を確認した
- [ ] 問題 1（Task/Step 混在）の具体例が文書化されている
- [ ] 問題 2（NON_VISUAL screenshot 前提残存）の具体例が文書化されている
- [ ] VISUAL / NON_VISUAL 判定基準が確定している
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] 含む / 含まないが明確である
- [ ] タスク種別（NON_VISUAL）が宣言されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
