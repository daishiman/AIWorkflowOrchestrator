# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 12                             |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

実装内容を将来の開発者が理解・運用できるよう、実装ガイド・仕様更新サマリー・変更ログ・未タスク検出・スキルフィードバック・準拠確認を記録する。
`aiworkflow-requirements` スキルの参照情報も更新する。

---

## 実行タスク

- **タスク1**: 実装ガイドの作成（新規フック・スクリプトの使い方）
- **タスク2**: ドキュメント変更ログの記録
- **タスク3**: lessons-learned へのフィードバック記録
- **タスク4**: 未割り当てタスクの検出（EVALS.json JSONL 移行タスク）
- **タスク5**: タスク仕様書コンプライアンスチェック

---

## 実行手順

### ステップ1: 実装ガイドの作成

`outputs/phase-12/implementation-guide.md` に以下を記録する:

**記載内容**:

1. `.gitattributes` マージ戦略の一覧と理由
   - `merge=union`: LOGS.md、references/\*.md、SKILL-changelog.md（追記型）
   - `merge=ours`: EVALS.json、indexes/\*.json（自動生成・JSON 構造）
2. post-merge フックの使い方
   - インストール: `bash .claude/scripts/install-git-hooks.sh`
   - 自動インストール: Claude Code セッション開始時（session-init.sh）
   - 手動実行: `HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)" && bash "$HOOK_PATH"`
3. gwt() の post-merge フック自動インストール連携
4. tmux B 起動時の `CLAUDE_SKIP_HEAVY_HOOKS=1` 設定
5. SKILL-changelog.md の記法・追記ルール
6. EVALS.json JSONL 移行の将来課題

### ステップ2: ドキュメント変更ログ

```bash
# 変更されたファイルの一覧を記録
git diff --name-only main...HEAD | sort
```

### ステップ3: lessons-learned フィードバック

`.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` に以下を追記する（append-only）:

**記録内容**:

- `merge=union` vs `merge=ours` の使い分け基準
  - 追記型テキスト → `merge=union`
  - JSON 構造・自動生成ファイル → `merge=ours` + post-merge 再生成
- 並列ブランチ数が多い場合の CI コスト削減手法（paths-ignore + merge_group:）
- SKILL.md の静的仕様と変更履歴の分離パターン
- gwt() の新規 worktree 自動フック導線と tmux の heavy hook skip 導線

### ステップ4: 未割り当てタスク検出

以下の将来タスクを検出・記録する:

| タスク                 | 概要                                                                                                      | 優先度 |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| EVALS.json JSONL 移行  | `{"level": 3, "count": 10, "date": "..."}` の形式で 1 行 1 レコード化。merge=union で完全に追記型にできる | 中     |
| Merge Queue の正式導入 | GitHub Merge Queue（merge_group:）を組織レベルで有効化し、直列マージを自動化                              | 低     |

### ステップ5: タスク仕様書コンプライアンスチェック

```bash
# Phase 1〜13 の仕様書が全て存在することを確認
for i in $(seq 1 13); do
  ls docs/30-workflows/task-fix-worktree-conflict-001/phase-${i}-*.md 2>/dev/null \
    && echo "Phase $i: OK" || echo "Phase $i: MISSING"
done

# artifacts.json の整合性確認
jq '.phases | length' docs/30-workflows/task-fix-worktree-conflict-001/artifacts.json
# → 13 であること
```

---

## 成果物

| 成果物                       | 配置先                                                   | 形式     |
| ---------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Markdown |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| ドキュメント変更ログ         | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| 仕様準拠確認                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

---

## 完了条件

- [ ] `outputs/phase-12/implementation-guide.md` に post-merge フックの使い方が記載されていること
- [ ] `outputs/phase-12/system-spec-update-summary.md` に Step 1-A〜3 の更新結果が記載されていること
- [ ] lessons-learned に本タスクの知見が追記されていること
- [ ] `outputs/phase-12/unassigned-task-detection.md` に未タスク検出結果が記録されていること
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` に Phase 12 の準拠確認が記録されていること
- [ ] 将来タスク（EVALS.json JSONL 移行）が記録されていること
- [ ] タスク仕様書コンプライアンスチェックが完了していること

---

## 次 Phase

**Phase 13: PR 作成** — ローカル品質チェックを実施し、PR を作成する。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
