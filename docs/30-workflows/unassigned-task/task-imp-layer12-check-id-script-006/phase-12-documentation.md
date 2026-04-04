# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目      | 値                                                                                                                                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase     | 12                                                                                                                                                                                                       |
| 機能名    | imp-layer12-check-id-script-006                                                                                                                                                                          |
| 作成日    | 2026-04-04                                                                                                                                                                                               |
| 前提Phase | Phase 11（手動テスト検証）完了                                                                                                                                                                           |
| 後続Phase | Phase 13（PR作成）                                                                                                                                                                                       |
| 成果物    | `outputs/phase-12/`（implementation-guide.md, system-spec-update-summary.md, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md, phase12-task-spec-compliance-check.md） |

## 目的

check ID 突き合わせスクリプトの実装内容をドキュメントに反映し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12 実行前に以下を確認する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P29: SKILL.md 変更履歴の更新漏れ

## 実行タスク

- Task 12-1: 実装ガイド作成（2パート構成）
- Task 12-2: システムドキュメント更新（2ステップ）
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出（0件でも出力必須）
- Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）
- Task 12-6: phase12-task-spec-compliance-check（Task 1〜5 の全完了確認）

---

## Task 12-1: 実装ガイド作成【必須・2パート構成】

### Part 1: 概念的説明（中学生レベル）

**記述ルール**:

- 日常生活の例え話を必ず含める（「たとえば」を最低 1 回使う）
- 「なぜ必要か」を先に説明してから「何をするか」を説明する
- 専門用語は使わない

**テンプレート**:

```markdown
### check ID 突き合わせスクリプトとは

#### なぜ必要か

スキルの定義書（仕様書）と実際のプログラムが「言っていることが一致しているか」を
確認するのは大切な作業です。たとえば、学校のテスト範囲表と実際の問題が
ずれていたら困りますよね。それと同じで、仕様書とプログラムがずれていると
バグの原因になります。

このスクリプトは「仕様書に書かれたチェック項目の番号」と
「プログラムに実装されたチェック項目の番号」を自動で照合してくれます。

#### 落とし穴：例示値の誤検知

仕様書には「次に追加するなら L2-008 から」というような説明が書かれることがあります。
たとえば料理レシピに「このページの次は 8 ページ目です」と書かれているようなものです。
単純に「L2-008 という文字を探す」と、この説明文まで引っかかってしまいます。
このスクリプトは「テーブルの行だけ」を対象にすることで、この問題を解決しています。
```

### Part 2: 技術的詳細（開発者向け）

以下を含めること:

- スクリプトのファイルパスと実行コマンド
- `extractCheckIdsFromImpl` / `extractCheckIdsFromSpec` / `compareCheckIds` の関数シグネチャ
- テーブル行スコープの正規表現パターン（`/^\|\s+(L[1-4]-\d{3})\s+\|/gm`）の説明
- 例示値除外の仕組み（`lessons-learned.md` への参照）
- CLI オプション（`--impl` / `--spec` / `--help`）
- 終了コード定義（0/1/2）
- CI への組み込み例

### 成果物

| 成果物     | パス                                       |
| ---------- | ------------------------------------------ |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` |

---

## Task 12-2: システムドキュメント更新【必須・2ステップ】

### Step 1: タスク完了記録【必須】

#### Step 1-A: 仕様書完了記録

- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方必須** — P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新（**P29対策**）
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新（**P29対策**）

#### Step 1-B: 実装状況テーブル更新

- [ ] `task-workflow.md` の残課題テーブルで本タスクを「完了」に更新する

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "check-id-script-006\|check ID.*スクリプト" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成

### Step 2: システム仕様更新【本タスクは不要の可能性が高い】

**更新判断基準**:

| 更新必要                      | 更新不要           |
| ----------------------------- | ------------------ |
| 新規インターフェース/型の追加 | スクリプト追加のみ |
| 既存インターフェースの変更    | 内部実装の詳細変更 |

> スクリプト追加のみでインターフェース変更がなければ Step 2 は N/A。実装後に再判定すること。

### 成果物

| 成果物           | パス                                             |
| ---------------- | ------------------------------------------------ |
| 仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md` |

---

## Task 12-3: ドキュメント更新履歴作成【必須】

Task 12-1 / 12-2 で実施した全更新の履歴を記録する。全 Step の結果を個別に明記する（「該当なし」も記録）。

### 成果物

| 成果物               | パス                                          |
| -------------------- | --------------------------------------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` |

---

## Task 12-4: 未タスク検出【0件でも出力必須】

### 確認ソース

| ソース             | 確認項目                      |
| ------------------ | ----------------------------- |
| Phase 10 レビュー  | MINOR 判定の指摘事項          |
| Phase 11 発見事項  | `discovered-issues.md` の内容 |
| スクリプトコメント | TODO/FIXME/HACK/XXX           |

### 検出コマンド

```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" scripts/verify-check-id-parity.js \
  scripts/__tests__/verify-check-id-parity.test.js || echo "検出なし"
```

### 成果物

| 成果物               | パス                                            |
| -------------------- | ----------------------------------------------- |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |

---

## Task 12-5: スキルフィードバックレポート作成【改善点なしでも出力必須】

### 確認観点

| 観点             | 確認内容                                                                            |
| ---------------- | ----------------------------------------------------------------------------------- |
| テンプレート改善 | スクリプト系タスクの Phase テンプレートに改善余地があるか                           |
| ワークフロー改善 | テーブル行スコープ正規表現の設計パターンを他タスクに横展開できるか                  |
| ドキュメント改善 | `lessons-learned.md` の形式を `patterns-lessons-and-pitfalls.md` に昇格させるべきか |

### 成果物

| 成果物                       | パス                                        |
| ---------------------------- | ------------------------------------------- |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md` |

---

## Task 12-6: phase12-task-spec-compliance-check【必須】

Task 12-1〜12-5 の成果物が Phase 12 の完了条件を満たしているかを最終確認する。

### 成果物

| 成果物   | パス                                                     |
| -------- | -------------------------------------------------------- |
| 準拠確認 | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

---

## 成果物

| 成果物                       | パス                                                     | 必須 |
| ---------------------------- | -------------------------------------------------------- | ---- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | ✅   |
| 仕様更新サマリー             | `outputs/phase-12/system-spec-update-summary.md`         | ✅   |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | ✅   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | ✅   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | ✅   |
| 準拠確認レポート             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   |

## 完了条件

- [ ] Task 12-1: 実装ガイドが 2 パート構成で作成されている
- [ ] Task 12-1: Part 1 に「たとえば」が最低 1 回含まれている
- [ ] Task 12-2 Step 1-A: `aiworkflow-requirements/LOGS.md` を更新した
- [ ] Task 12-2 Step 1-A: `task-specification-creator/LOGS.md` を更新した（**P1, P25対策**）
- [ ] Task 12-2 Step 1-A: `aiworkflow-requirements/SKILL.md` 変更履歴を更新した（**P29対策**）
- [ ] Task 12-2 Step 1-A: `task-specification-creator/SKILL.md` 変更履歴を更新した（**P29対策**）
- [ ] Task 12-2 Step 1-D: topic-map.md を再生成した
- [ ] Task 12-3: `documentation-changelog.md` を作成した
- [ ] Task 12-4: `unassigned-task-detection.md` を作成した（0件でも出力）
- [ ] Task 12-5: `skill-feedback-report.md` を作成した（改善点なしでも出力）
- [ ] Task 12-6: `phase12-task-spec-compliance-check.md` を作成した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 13: PR作成（`phase-13-pr-creation.md`）
