# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 13                               |
| 機能名    | imp-layer12-check-id-script-006  |
| 作成日    | 2026-04-04                       |
| 前提Phase | Phase 12（ドキュメント更新）完了 |
| 後続Phase | なし（最終Phase）                |
| 成果物    | `outputs/phase-13/pr-info.md`    |

## 目的

ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認してタスクを完了する。

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

## 実行タスク

- Task 1: ユーザーにローカル動作確認を依頼
- Task 2: 変更サマリー提示と PR 作成許可確認
- Task 3: ユーザー許可後に `/ai:diff-to-pr` を実行
- Task 4: CI 通過確認
- Task 5: タスクディレクトリを completed-tasks に移動

## 実行手順

### Task 1: ユーザーにローカル動作確認を依頼【必須】

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

**依頼内容**:

1. `node scripts/verify-check-id-parity.js` を実行し、終了コード 0 で PASS することを確認
2. `--help` オプションの動作を確認
3. `outputs/phase-12/implementation-guide.md` の内容を確認

**重要**: ユーザーから動作確認完了の報告を受けるまで次のステップに進まないこと。

### Task 2: 変更サマリー提示と PR 作成許可確認【必須】

**提示内容**:

- 変更ファイル一覧（`git diff --stat` の結果）
- 追加内容の概要:
  - `scripts/verify-check-id-parity.js`（check ID 突き合わせスクリプト本体）
  - `scripts/__tests__/verify-check-id-parity.test.js`（ユニットテスト）
  - `lessons-learned.md`（grep 誤検知問題の教訓）
- Phase 11 手動テスト結果サマリー
- Phase 12 ドキュメント更新結果サマリー

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### Task 3: PR 作成（ユーザー許可後）【許可必須】

```
/ai:diff-to-pr
```

**フォールバック（`/ai:diff-to-pr` が使えない場合）**:

```bash
git add scripts/verify-check-id-parity.js \
        scripts/__tests__/verify-check-id-parity.test.js

git commit -m "tooling: check ID 突き合わせスクリプトを追加

- verify-check-id-parity.js: 実装と仕様書の check ID を突き合わせ
- テーブル行スコープの正規表現で例示値（L2-008 等）の誤検知を防止
- 終了コード 0/1/2 で CI 組み込みに対応

Closes: task-imp-layer12-check-id-script-006"

git push -u origin $(git branch --show-current)

gh pr create \
  --title "tooling: check ID 突き合わせスクリプト追加（例示値誤検知対策）" \
  --body "$(cat <<'EOF'
## Summary
- SkillCreatorVerificationEngine の check ID と仕様書の定義を自動突き合わせするスクリプトを追加
- テーブル行スコープの正規表現により、拡張ガイドライン内の例示値（L2-008 等）の誤検知を防止
- 終了コード 0（PASS）/1（FAIL）/2（エラー）で CI 組み込みに対応

## Test plan
- [ ] `node scripts/verify-check-id-parity.js` が終了コード 0 で PASS する
- [ ] 例示値 L2-008 が差分リストに現れない
- [ ] ユニットテスト全件 PASS
- [ ] Phase 12: LOGS.md x2 / SKILL.md x2 更新済み

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 4: CI 通過確認【必須】

- PR が作成されていること
- CI が通過していること
- CI が失敗した場合は原因を調査し、修正後に再プッシュ

### Task 5: タスクディレクトリを completed-tasks に移動【必須】

```bash
mv docs/30-workflows/unassigned-task/task-imp-layer12-check-id-script-006/ \
   docs/30-workflows/completed-tasks/

ls docs/30-workflows/completed-tasks/ | grep check-id-script-006

git add docs/30-workflows/
git commit -m "docs(workflows): task-imp-layer12-check-id-script-006 を completed-tasks に移動"
git push
```

## 成果物

| 成果物 | パス                          | 必須 |
| ------ | ----------------------------- | ---- |
| PR情報 | `outputs/phase-13/pr-info.md` | ✅   |

## 完了条件

- [ ] Task 1: ユーザーにローカル動作確認を依頼し、確認完了の報告を受けた
- [ ] Task 2: 変更サマリーを提示し、PR 作成の明示的な許可を得た
- [ ] Task 3: 全変更がコミットされ、PR が作成されている
- [ ] Task 4: CI が通過している
- [ ] Task 5: `outputs/phase-13/pr-info.md` が作成されている
- [ ] Task 5: タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

なし（本タスクの最終 Phase）
