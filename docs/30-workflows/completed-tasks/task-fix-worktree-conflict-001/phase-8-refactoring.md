# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 8                              |
| 機能名 | task-fix-worktree-conflict-001 |
| 作成日 | 2026-04-08                     |

## 目的

Phase 5〜6 の実装コードを見直し、可読性・保守性・冪等性の観点でリファクタリングを行う。
機能の変更は行わず、コード品質の向上のみを目的とする。

---

## 実行タスク

- **タスク1**: シェルスクリプトの品質チェック（shellcheck）
- **タスク2**: `post-merge-index-regenerate.sh` のエラーハンドリング強化
- **タスク3**: `install-git-hooks.sh` の冪等性・ログ出力の改善
- **タスク4**: `.gitattributes` のコメント整理・可読性向上
- **タスク5**: CI ワークフローの設定コメント追加

---

## 実行手順

### ステップ1: shellcheck による静的解析

```bash
# shellcheck が利用可能か確認
which shellcheck || brew install shellcheck

# 対象スクリプトを解析
shellcheck .claude/hooks/post-merge-index-regenerate.sh
shellcheck .claude/scripts/install-git-hooks.sh
```

**主な確認観点**:

- 変数展開の引用符漏れ（SC2086）
- コマンド存在チェックの方法（`which` → `command -v`）
- `set -euo pipefail` の有無

### ステップ2: スクリプトの品質改善点確認

```bash
# post-merge フックの現在の内容確認
cat .claude/hooks/post-merge-index-regenerate.sh

# install-git-hooks.sh の現在の内容確認
cat .claude/scripts/install-git-hooks.sh
```

**改善観点**:

| 観点                 | チェック内容                                     |
| -------------------- | ------------------------------------------------ |
| コマンド存在チェック | `which node` → `command -v node`                 |
| エラーメッセージ     | stderr への出力（`>&2`）が適切か                 |
| ログ出力             | `[post-merge]` プレフィックスで統一されているか  |
| コメント             | スクリプトの目的・使い方が冒頭に記載されているか |

### ステップ3: `.gitattributes` コメント整理

`.gitattributes` の各マージ戦略グループにコメントを追加し、
なぜその戦略を選択したか一目でわかるようにする。

**確認**:

```bash
cat .gitattributes
```

### ステップ4: CI ワークフローのコメント追加

追加した `paths-ignore` と `merge_group:` の意図をコメントで説明する。

---

## 成果物

| 成果物               | 配置先                                  | 形式     |
| -------------------- | --------------------------------------- | -------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-result.md` | Markdown |

---

## 完了条件

- [ ] `shellcheck` で警告・エラーがないこと（または無視する理由が記録されていること）
- [ ] スクリプトのコメント・ログ出力が整理されていること
- [ ] `.gitattributes` に各設定の意図を示すコメントが追加されていること
- [ ] リファクタリング後も AC-1〜AC-8 の全基準を満たしていること

---

## 次 Phase

**Phase 9: 品質保証** — lint・typecheck・既存テストの全パスを確認する。

## 参照資料

- `index.md`
- `artifacts.json`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`

## 統合テスト連携

- 後続 Phase の統合テストと台帳同期の根拠を参照する。
- この Phase 単体では、最終検証は `validate-phase-output.js` と `validate-phase12-implementation-guide.js` で確認する。
