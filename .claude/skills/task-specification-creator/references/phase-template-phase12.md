# Phase Template Phase12

## 対象

Phase 12 の documentation update。

## 必須タスク

1. implementation guide
2. system spec update summary
3. documentation changelog
4. unassigned-task detection
5. skill feedback report
6. phase12-task-spec-compliance-check（Task 1〜5 の全完了確認）

## Phase 10 MINOR 追跡テーブル

Phase 10 で MINOR 判定された指摘がある場合、Phase 12 で追跡結果を記録する。

| MINOR ID | 指摘内容 | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| -------- | -------- | ------------- | ------------- | -------- | ---------- |
| ...      | ...      | Phase 5/8/12  | Phase 10/12   | ...      | 解決済/未タスク化 |

- Phase 10 MINOR は全て未タスク仕様書に変換するか、Phase 12 内で解決する（省略不可）
- `documentation-changelog.md` に追跡結果を記録する

## docs-only モードフラグ

設計タスク（docs-only）の場合、以下の挙動が変わる:

| 項目 | 通常タスク | docs-only タスク |
| ---- | ---------- | ---------------- |
| Step 1-G 検証コマンド | 実行して結果記録 | **必要コマンドを実行して結果記録**（`verify/validate/links/skill validation` を含む） |
| implementation-guide Part 2 | 実装詳細・コード例 | 型定義・配置ルール・使用例 |
| Step 1-B 実装状況 | `completed` | `spec_created` |

## 出力テンプレ

| file | 最低限必要な内容 |
| --- | --- |
| `implementation-guide.md` | Part 1 / Part 2、validator 要件 |
| `system-spec-update-summary.md` | Step 1 / Step 2 の結果 |
| `documentation-changelog.md` | 変更ファイル、validator 結果、current/baseline |
| `unassigned-task-detection.md` | 0件でも summary を残す |
| `skill-feedback-report.md` | 改善点 or 改善点なし |
| `phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の準拠チェック |
| `phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の準拠チェック |

## 設計タスク向け補足（SF-02, SF-03対応）

### システム仕様書更新の2段階方式（SF-02対応）

設計タスクでは `.claude/skills/` への実更新がPR時まで保留されがちなため、以下の2段階方式を標準とする。

> **worktree 環境での注意（P57 再発防止）**: worktree でのコンフリクトリスクを理由に `.claude/skills/` の実更新を先送りしてはならない。`仕様策定のみ` / `実行予定` などの planned wording を残さず、Phase 12 完了前に実更新を行うこと。コンフリクトリスクより仕様書と実装の乖離リスクの方が高い。

| ステージ | タイミング | 内容 | 必須 |
| --- | --- | --- | --- |
| Step 2A: 計画記録 | Task 2 開始時 | 更新予定ファイルと変更内容を列挙し、完了前に必ず実更新結果へ置換する形で `system-spec-update-summary.md` に記録 | ✅ |
| Step 2B: 実更新 | Task 2 完了前 | 実際に `.claude/skills/` 配下の仕様書を更新し、planned wording を除去 | ✅ |

`仕様策定のみ` / `実行予定` / `保留として記録` 等の planned wording は Phase 12 完了前に全て実更新ログへ昇格すること。

**planned wording 残存確認コマンド（完了前に必ず実行）**:

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "planned wording なし"
```

### 設計タスク特有の未タスク検出パターン（SF-03対応）

設計タスクでは未タスクが「全て実装タスク」になるパターンが標準。以下の4パターンを必ずチェックする。

| パターン | 候補の例 | 優先度目安 |
| --- | --- | --- |
| **型定義→実装** | 型を定義したが、ハンドラ側のランタイム実装が未完了 | 高 |
| **契約→テスト** | IPC契約・インターフェースを設計したが、対応する統合テストが未作成 | 中 |
| **UI仕様→コンポーネント** | 画面仕様を設計したが、Reactコンポーネントが未実装 | 中 |
| **仕様書間差異→設計決定** | 複数仕様書で矛盾する記述が残り、どちらが正しいか決定できていない | 高 |

**SF-03 チェック手順**:

1. Phase 1 要件定義の受入基準を再確認し「将来対応」とした項目を列挙する
2. Phase 2/3 設計・レビューの MINOR 判定事項をリストアップする
3. 上記4パターンと照合し、未タスク化対象を確定する
4. 0件でも `unassigned-task-detection.md` に「設計タスクパターン確認済み、0件」と明記する

## 未タスク配置先ディレクトリの明示（P38 再発防止）

未タスク指示書は必ず以下のディレクトリに配置する。配置先の判断を省略しない。

| 条件 | 配置先 |
| --- | --- |
| 未完了の未タスク（通常） | `docs/30-workflows/unassigned-task/` |
| completed workflow 由来の継続 backlog | `docs/30-workflows/completed-tasks/<workflow>/unassigned-task/` |
| 完了済み standalone UT | `docs/30-workflows/completed-tasks/*.md` |
| legacy | `docs/30-workflows/completed-tasks/unassigned-task/` |

**確認コマンド（Phase 12 完了前に必ず実行）**:

```bash
# 未タスク指示書の物理ファイル存在を確認
ls docs/30-workflows/unassigned-task/

# current workflow 起点でのリンク整合確認
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-12/unassigned-task-detection.md
```

## 成果物ファイル名の照合チェック

Phase 12 の成果物ファイル名がテンプレートと一致していることを確認する。名前の不一致はバリデーションスクリプトの検出漏れを引き起こす。

| テンプレート上の名前 | 正しいファイル名 |
| --- | --- |
| 未タスク検出レポート | `unassigned-task-detection.md` |
| ドキュメント更新履歴 | `documentation-changelog.md` |
| 実装ガイド | `implementation-guide.md` |
| スキルフィードバック | `skill-feedback-report.md` |
| 仕様書更新サマリー | `system-spec-update-summary.md` |

**注意**: `unassigned-task-report.md` のような類似名ファイルを作成しないこと。正式名称は `unassigned-task-detection.md` である。

## 関連ガイド

- [phase-12-documentation-guide.md](phase-12-documentation-guide.md) — Task 12-1〜12-6 の詳細手順
- [spec-update-workflow.md](spec-update-workflow.md) — Step 1/2 の実行フロー
- [spec-update-validation-matrix.md](spec-update-validation-matrix.md) — 完了判定コマンド
- [phase-11-12-guide.md](phase-11-12-guide.md) — Phase 12 完了条件チェックリスト（全項目）
