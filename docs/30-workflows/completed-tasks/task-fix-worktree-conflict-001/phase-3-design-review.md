# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 3                              |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

Phase 2 で確定した 4 core サブタスク（FIX-001-A〜D）の設計整合性・後方互換性・リスクをレビューし、
PASS / MINOR / MAJOR を判定して Phase 4 への進行可否を決定する。

---

## 実行タスク

- **タスク1**: FIX-001-A レビュー（EVALS.json merge=ours の整合性確認）
- **タスク2**: FIX-001-B レビュー（CI paths-ignore の影響範囲確認）
- **タスク3**: FIX-001-C レビュー（post-merge フックの冪等性・エラーハンドリング確認）
- **タスク4**: FIX-001-D レビュー（SKILL.md 分割の全スキル適用可能性確認）
- **タスク5**: Phase 4 開始条件の確定（PASS / MINOR / MAJOR 判定）

---

## 参照資料

| 資料名                     | パス                                     | 説明                   |
| -------------------------- | ---------------------------------------- | ---------------------- |
| Phase 2 設計決定記録       | `outputs/phase-2/design-decisions.md`    | レビュー対象設計       |
| Phase 2 サブタスク詳細設計 | `outputs/phase-2/subtask-design.md`      | フックスクリプト設計等 |
| Phase 1 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-8 との照合    |
| 現在の .gitattributes      | `.gitattributes`                         | 設定変更の確認         |
| CI ワークフロー            | `.github/workflows/ci.yml`               | FIX-001-B 設計対象     |

---

## 実行手順

### ステップ1: FIX-001-A レビュー

```bash
# EVALS.json の現在の内容構造を確認（JSON の有効性確認）
ls .claude/skills/*/EVALS.json .agents/skills/*/EVALS.json 2>/dev/null

# jq で JSON が有効かどうか確認（1ファイル例）
jq . .claude/skills/aiworkflow-requirements/EVALS.json
```

**レビュー観点**:

| 観点               | チェック内容                                          | 判定基準     |
| ------------------ | ----------------------------------------------------- | ------------ |
| JSON 構造の有効性  | 全 EVALS.json が `jq .` でエラーなく解析できること    | PASS / MAJOR |
| merge=ours の影響  | 現ブランチ優先により失われる情報の有無                | PASS / MINOR |
| 保存・復元境界     | 失われる場合でも follow-up で戻せる設計になっているか | PASS / MINOR |
| JSONL 移行との整合 | merge=ours は JSONL 移行の前段として矛盾しないこと    | PASS         |

**期待判定**: PASS（merge=ours への変更は最小リスク）

---

### ステップ2: FIX-001-B レビュー

```bash
# CI の現在の on: セクションを確認
head -50 .github/workflows/ci.yml

# 既存の paths-ignore があれば確認
grep -A 10 "paths-ignore" .github/workflows/ci.yml
```

**レビュー観点**:

| 観点                         | チェック内容                                              | 判定基準     |
| ---------------------------- | --------------------------------------------------------- | ------------ |
| paths-ignore の適切性        | `.claude/**` / `.agents/**` はアプリコードを含まないこと  | PASS         |
| merge_group: の必要性        | GitHub Merge Queue を使用している場合に CI が漏れないこと | PASS / MINOR |
| 既存の paths-ignore との重複 | 既存設定と競合・重複しないこと                            | PASS / MINOR |
| CI スキップの安全性          | スキルファイル変更がアプリコードに影響しないことを確認    | PASS         |

**期待判定**: PASS（影響範囲が明確に限定されている）

---

### ステップ3: FIX-001-C レビュー

**レビュー観点**:

| 観点                     | チェック内容                                               | 判定基準     |
| ------------------------ | ---------------------------------------------------------- | ------------ |
| 冪等性                   | install-git-hooks.sh を 2 回実行しても副作用がないこと     | PASS         |
| エラーハンドリング       | generate-index.js が存在しない場合にフックが失敗しないこと | PASS         |
| session-init.sh との統合 | 既存の session-init.sh のフローを壊さないこと              | PASS / MINOR |
| bash 互換性              | zsh 固有の記法を使用していないこと                         | PASS         |
| タイムアウト             | 30 秒以内に完了すること（NFR-1）                           | PASS / MAJOR |
| 復元性                   | 失われた indexes の情報を再生成で戻せること                | PASS / MINOR |

```bash
# generate-index.js の存在・実行可能性確認
ls -la .claude/skills/aiworkflow-requirements/scripts/generate-index.js

# session-init.sh の現在の内容確認（追加箇所の特定）
cat .claude/hooks/session-init.sh
```

**期待判定**: PASS（設計がシンプルで副作用が限定的）

---

### ステップ4: FIX-001-D レビュー

```bash
# 全スキルの SKILL.md に変更履歴セクションが存在するか確認
for f in .claude/skills/*/SKILL.md .agents/skills/*/SKILL.md; do
  echo "=== $f ===";
  grep -n "変更履歴\|Changelog\|History" "$f" || echo "(変更履歴なし)";
done

# 対象スキル数を確認
echo "claude skills: $(ls -d .claude/skills/*/ 2>/dev/null | wc -l)"
echo "agents skills: $(ls -d .agents/skills/*/ 2>/dev/null | wc -l)"
```

**レビュー観点**:

| 観点                                  | チェック内容                                       | 判定基準     |
| ------------------------------------- | -------------------------------------------------- | ------------ |
| 全スキルへの適用可能性                | 変更履歴セクションが存在しないスキルの処理方針     | PASS / MINOR |
| SKILL-changelog.md のフォーマット統一 | テンプレートが全スキルに適用できること             | PASS         |
| SKILL.md からの削除後の整合性         | 変更履歴削除後も SKILL.md が仕様として完結すること | PASS         |
| .gitattributes 追加の影響             | 既存の merge 設定と重複・競合しないこと            | PASS         |

**期待判定**: PASS（ただし変更履歴がないスキルは MINOR として記録）

---

### ステップ5: 総合判定

| 判定  | 意味                 | 対応                                      |
| ----- | -------------------- | ----------------------------------------- |
| PASS  | 設計に問題なし       | Phase 4 へ進む                            |
| MINOR | 軽微な指摘あり       | MINOR 追跡テーブルに記録し Phase 4 へ進む |
| MAJOR | 設計に重大な問題あり | Phase 2 に戻り再設計                      |

**MINOR 追跡テーブル（発見時に記録）**:

| ID   | サブタスク | 指摘内容   | 対応方針   | 対応 Phase |
| ---- | ---------- | ---------- | ---------- | ---------- |
| M-01 | （記入欄） | （記入欄） | （記入欄） | （記入欄） |

---

## 完了条件

- [ ] FIX-001-A〜D の全サブタスクに対してレビューを実施し、判定結果を記録していること
- [ ] MAJOR 判定がないこと（MAJOR の場合は Phase 2 に戻る）
- [ ] MINOR 指摘がある場合は追跡テーブルに記録されていること
- [ ] `outputs/phase-3/design-review-result.md` に総合判定が記録されていること

---

## 成果物

| 成果物             | 配置先                                    | 形式     |
| ------------------ | ----------------------------------------- | -------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Markdown |
| MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`       | Markdown |

---

## 次 Phase

**Phase 4: テスト作成** — 4 core サブタスクの動作確認シナリオ・検証手順を定義する。

**ゲート条件**: 総合判定が PASS または MINOR のみの場合に Phase 4 へ進む。MAJOR が 1 件でもあれば Phase 2 へ戻る。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
