# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 11                             |
| Phase名    | 手動テスト                     |
| 機能名     | refs-500line-split-maintenance |
| 前提Phase  | Phase 10                       |
| 次Phase    | Phase 12: ドキュメント更新     |
| ステータス | pending                        |
| 作成日     | 2026-04-07                     |

## 目的

docs-only タスクのため、**NON_VISUAL** 判定。UI スクリーンショットは不要。  
手動確認は次の walkthrough を実施し、結果を `outputs/phase-11/manual-test-result.md` に残す。

1. `SKILL.md` のリソース導線から current canonical file へ辿れる
2. `LOGS.md` から archive / history / index へ辿れる
3. `.claude` と `.agents` の mirror parity が取れている（差分なし）
4. validator を replay してエラー 0 件である

**証跡の主ソース**: Phase 6 の TC-01〜TC-06 実行結果（自動確認済み）

## NON_VISUAL 判定の理由

- 本タスクはドキュメントファイルの分離のみ
- UI コンポーネントの変更はゼロ
- 視覚的な変化は発生しない

## 実行タスク

### Task 1: `outputs/phase-11/manual-test-checklist.md` の作成（必須）

docs-only の Phase 11 でも `manual-test-checklist.md` を作成し、実施項目と実行コマンドを固定する。

### Task 2: SKILL.md ナビゲーション確認（2スキル）

目的: `SKILL.md` のリソース導線（`references/`）が分離後の実ファイルへ到達できることを確認する。

```bash
# aiworkflow-requirements: SKILL.md のリソース導線から子ファイルが存在することを確認
rg -n "references/" .claude/skills/aiworkflow-requirements/SKILL.md | while IFS= read -r line; do
  path=$(printf '%s' "$line" | sed -n 's/.*(\(references\/[^)]*\)).*/\1/p')
  file=".claude/skills/aiworkflow-requirements/${path}"
  [ -f "$file" ] && echo "OK: $file" || echo "MISSING: $file"
done

# task-specification-creator: SKILL.md のリソース導線から子ファイルが存在することを確認
rg -n "references/" .claude/skills/task-specification-creator/SKILL.md | while IFS= read -r line; do
  path=$(printf '%s' "$line" | sed -n 's/.*(\(references\/[^)]*\)).*/\1/p')
  file=".claude/skills/task-specification-creator/${path}"
  [ -f "$file" ] && echo "OK: $file" || echo "MISSING: $file"
done
```

### Task 3: LOGS.md ナビゲーション確認（2スキル）

目的: `LOGS.md` から archive / history / index（`indexes/`）へ到達できることを確認する。

```bash
# aiworkflow-requirements: LOGS.md の indexes/references リンクの存在確認（最小）
rg -o "\\((references|indexes)/[^)]+\\)" .claude/skills/aiworkflow-requirements/LOGS.md | while IFS= read -r path; do
  path="${path:1:-1}"
  file=".claude/skills/aiworkflow-requirements/$path"
  [ -f "$file" ] && echo "OK: $file" || echo "MISSING: $file"
done

# task-specification-creator: LOGS.md の indexes/references リンクの存在確認（最小）
rg -o "\\((references|indexes)/[^)]+\\)" .claude/skills/task-specification-creator/LOGS.md | while IFS= read -r path; do
  path="${path:1:-1}"
  file=".claude/skills/task-specification-creator/$path"
  [ -f "$file" ] && echo "OK: $file" || echo "MISSING: $file"
done
```

### Task 4: mirror parity 確認（2スキル）

目的: `.claude` 正本と `.agents` mirror の差分が残っていないことを確認する。

```bash
diff -qr .claude/skills/aiworkflow-requirements/references/ .agents/skills/aiworkflow-requirements/references/ 2>/dev/null | head -50
diff -qr .claude/skills/aiworkflow-requirements/indexes/ .agents/skills/aiworkflow-requirements/indexes/ 2>/dev/null | head -50
diff -qr .claude/skills/task-specification-creator/references/ .agents/skills/task-specification-creator/references/ 2>/dev/null | head -50
diff -qr .claude/skills/task-specification-creator/indexes/ .agents/skills/task-specification-creator/indexes/ 2>/dev/null | head -50

diff -q .claude/skills/aiworkflow-requirements/SKILL.md .agents/skills/aiworkflow-requirements/SKILL.md 2>/dev/null || true
diff -q .claude/skills/task-specification-creator/SKILL.md .agents/skills/task-specification-creator/SKILL.md 2>/dev/null || true

diff -q .claude/skills/aiworkflow-requirements/LOGS.md .agents/skills/aiworkflow-requirements/LOGS.md 2>/dev/null || true
diff -q .claude/skills/task-specification-creator/LOGS.md .agents/skills/task-specification-creator/LOGS.md 2>/dev/null || true
```

### Task 5: validator replay（必須）

目的: 生成インデックスと内部リンクの整合が取れていることを replay で確認する。

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js 2>&1 | tail -30
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/task-refs-500line-split-maintenance-001 --regenerate 2>&1 | tail -30
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js 2>&1 | tail -30
```

### Task 6: 分離後ファイルの可読性確認（目視）

分離後の主要ファイルを目視確認:

- [ ] `task-workflow-completed.md` が目次レベルになっている
- [ ] `patterns.md` が目次レベルになっている
- [ ] 各子ファイルが独立して意味をなすか

## 成果物

| 成果物                   | パス                                        | 説明                     |
| ------------------------ | ------------------------------------------- | ------------------------ |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 実施項目とコマンドの固定 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | NON_VISUAL 確認証跡      |

## 完了条件

- [ ] NON_VISUAL 判定が明記されている
- [ ] `outputs/phase-11/manual-test-checklist.md` が作成されている
- [ ] Phase 6 の TC-01〜TC-06 が証跡として参照されている
- [ ] SKILL.md / LOGS.md のナビゲーション確認が完了
- [ ] mirror parity（`.claude` と `.agents` の references / indexes / SKILL.md / LOGS.md）が差分なし
- [ ] validator replay がエラー 0 件

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
