# Phase 9: 品質保証

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 9                              |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

既存テスト・lint・typecheck への影響がないことを確認し、本タスクの変更が既存機能を壊していないことを保証する。

---

## 実行タスク

- **タスク1**: 既存テストの全パス確認
- **タスク2**: lint チェック
- **タスク3**: typecheck（TypeScript への影響がないことの確認）
- **タスク4**: .gitattributes の設定整合性チェック
- **タスク5**: CI ワークフローの YAML 構文チェック

---

## 実行手順

```bash
# 既存テストへの影響確認（本タスクはシェルスクリプト・設定変更のみのため影響なし見込み）
pnpm --filter @repo/desktop test --run 2>&1 | tail -20

# lint チェック
pnpm lint 2>&1 | tail -20

# typecheck（TypeScript ファイルを変更していないため影響なし見込み）
pnpm --filter @repo/desktop typecheck 2>&1 | tail -10

# .gitattributes の構文チェック（git が認識できるか）
git check-attr --all .claude/skills/aiworkflow-requirements/LOGS.md
git check-attr --all .claude/skills/aiworkflow-requirements/EVALS.json
git check-attr --all .claude/skills/aiworkflow-requirements/SKILL-changelog.md

# CI YAML の構文チェック（python-yaml または actionlint）
command -v actionlint && actionlint .github/workflows/ci.yml || echo "actionlint なし（スキップ）"
```

---

## チェックリスト

| チェック項目        | コマンド                        | 期待結果               |
| ------------------- | ------------------------------- | ---------------------- |
| 既存テスト          | `pnpm test --run`               | 全 PASS                |
| ESLint              | `pnpm lint`                     | エラーなし             |
| TypeScript          | `pnpm typecheck`                | エラーなし             |
| .gitattributes 認識 | `git check-attr --all`          | 設定が正しく認識される |
| CI YAML 構文        | `actionlint`                    | 構文エラーなし         |
| shellcheck          | `shellcheck .claude/hooks/*.sh` | 警告・エラーなし       |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | Markdown |

---

## 完了条件

- [ ] 既存テストが全 PASS であること
- [ ] lint / typecheck がエラーなしであること
- [ ] `.gitattributes` の設定が `git check-attr` で正しく認識されること
- [ ] CI YAML に構文エラーがないこと
- [ ] `outputs/phase-9/quality-check-result.md` に結果が記録されていること

---

## 次 Phase

**Phase 10: 最終レビューゲート** — AC-1〜AC-8 の最終確認と Phase 11 進行可否の判定。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
