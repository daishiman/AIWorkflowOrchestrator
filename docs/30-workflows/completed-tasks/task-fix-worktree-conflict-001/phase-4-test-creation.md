# Phase 4: テスト作成

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 4                              |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

4 core サブタスク（FIX-001-A〜D）の動作確認シナリオ・検証手順を定義する。
本タスクはシェルスクリプト・設定ファイル変更が主体のため、自動ユニットテストではなく
**ローカル git 操作による動作確認シナリオ**を設計する。

---

## 実行タスク

- **タスク1**: FIX-001-A 検証シナリオ設計（EVALS.json 並列マージテスト）
- **タスク2**: FIX-001-B 検証シナリオ設計（CI スキップ動作確認）
- **タスク3**: FIX-001-C 検証シナリオ設計（post-merge フック動作確認）
- **タスク4**: FIX-001-D 検証シナリオ設計（SKILL.md 分割後の merge=union 確認）
- **タスク5**: テストマトリクス作成

---

## テストマトリクス

| TC番号  | 対象      | シナリオ                                                     | 期待結果                                                             | AC   |
| ------- | --------- | ------------------------------------------------------------ | -------------------------------------------------------------------- | ---- |
| TC-A-01 | FIX-001-A | 2ブランチが EVALS.json を異なる値で更新してマージ            | コンフリクトマーカーなし、現ブランチの値が保持され、消失が検知できる | AC-2 |
| TC-A-02 | FIX-001-A | マージ後の EVALS.json を jq で検証                           | JSON 構造が有効（jq エラーなし）、状態値の破損がない                 | AC-2 |
| TC-B-01 | FIX-001-B | `.claude/skills/*/LOGS.md` のみ変更した PR を push           | CI ワークフローがスキップされる                                      | AC-3 |
| TC-B-02 | FIX-001-B | アプリコード（`apps/desktop/src/`）を変更した PR を push     | CI ワークフローが実行される                                          | AC-3 |
| TC-C-01 | FIX-001-C | `git merge` 実行後に post-merge フックが起動する             | indexes/\*.json が再生成され、消えた情報が復元される                 | AC-4 |
| TC-C-02 | FIX-001-C | install-git-hooks.sh を 2 回実行                             | エラーなし・worktree-safe hook が正しく配置される                    | AC-4 |
| TC-C-03 | FIX-001-C | generate-index.js が存在しない状態で post-merge フックを実行 | エラーで止まらず正常終了する                                         | AC-4 |
| TC-D-01 | FIX-001-D | 2ブランチが SKILL-changelog.md に追記してマージ              | コンフリクトマーカーなし、両ブランチの追記が統合される               | AC-5 |
| TC-D-02 | FIX-001-D | 全スキルの SKILL-changelog.md の存在確認                     | 全スキルに SKILL-changelog.md が存在する                             | AC-6 |
| TC-D-03 | FIX-001-D | SKILL.md に変更履歴セクションが残存していないか確認          | grep で変更履歴キーワードが検出されない                              | AC-6 |

---

## 検証シナリオ詳細

### TC-A-01〜02: EVALS.json 並列マージテスト

```bash
# テスト環境セットアップ
cd /tmp && git clone <repo> test-evals && cd test-evals

# ブランチ A
git checkout -b test/evals-branch-a
echo '{"current_level": 3, "total_usage_count": 10}' \
  > .claude/skills/aiworkflow-requirements/EVALS.json
git add . && git commit -m "branch-a: update EVALS"

# ブランチ B（main から分岐）
git checkout main && git checkout -b test/evals-branch-b
echo '{"current_level": 4, "total_usage_count": 20}' \
  > .claude/skills/aiworkflow-requirements/EVALS.json
git add . && git commit -m "branch-b: update EVALS"

# マージ実行（コンフリクトなしを期待）
git merge test/evals-branch-a

# 検証: JSON が有効であること
jq . .claude/skills/aiworkflow-requirements/EVALS.json && echo "PASS: JSON valid"
```

### TC-C-01〜03: post-merge フック動作確認

```bash
# フックインストール確認
HOOK_PATH="$(git rev-parse --git-path hooks/post-merge)"
test -x "$HOOK_PATH" && echo "PASS: hook executable" || echo "FAIL: hook not executable"

# マージ後のフック自動実行確認
git merge <branch-name>
# → "[post-merge] indexes/*.json を再生成中..." が出力されること

# 冪等性確認
bash .claude/scripts/install-git-hooks.sh
bash .claude/scripts/install-git-hooks.sh  # 2回目
echo "PASS: 冪等インストール確認"
```

### TC-D-01: SKILL-changelog.md 並列マージテスト

```bash
# ブランチ A: changelog に追記
git checkout -b test/changelog-a
echo -e "\n## v1.1 - 2026-04-08\n- 機能追加 A" \
  >> .claude/skills/aiworkflow-requirements/SKILL-changelog.md
git add . && git commit -m "changelog-a"

# ブランチ B: changelog に追記
git checkout main && git checkout -b test/changelog-b
echo -e "\n## v1.2 - 2026-04-08\n- 機能追加 B" \
  >> .claude/skills/aiworkflow-requirements/SKILL-changelog.md
git add . && git commit -m "changelog-b"

# マージ（コンフリクトなしを期待）
git merge test/changelog-a
grep "機能追加 A" .claude/skills/aiworkflow-requirements/SKILL-changelog.md && echo "PASS"
grep "機能追加 B" .claude/skills/aiworkflow-requirements/SKILL-changelog.md && echo "PASS"
```

---

## 成果物

| 成果物           | 配置先                                      | 形式     |
| ---------------- | ------------------------------------------- | -------- |
| テストマトリクス | `outputs/phase-4/test-matrix.md`            | Markdown |
| 検証シナリオ詳細 | `outputs/phase-4/verification-scenarios.md` | Markdown |

---

## 完了条件

- [ ] TC-A-01〜02、TC-B-01〜02、TC-C-01〜03、TC-D-01〜03 の全シナリオが定義されていること
- [ ] テストマトリクスが `outputs/phase-4/test-matrix.md` に記録されていること
- [ ] 各 TC の期待結果と AC との対応が明確であること

---

## 次 Phase

**Phase 5: 実装** — Phase 4 で定義した core シナリオ（FIX-001-A〜D）を GREEN にするための実装を行う。依存する FIX-001-E / FIX-001-F は Phase 2 で設計済みの dependent タスクとして Phase 5 で実装する。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
