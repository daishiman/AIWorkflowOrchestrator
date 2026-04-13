# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 13                                                    |
| 機能名     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001    |
| タスク名   | ConversationRoundStep semantic default 入力元拡張対応 |
| 前提Phase  | Phase 12                                              |
| 後続Phase  | 完了                                                  |
| 作成日     | 2026-04-11                                            |
| ステータス | pending                                               |

---

## 目的

ユーザーの明示的な承認を得てから PR を作成する。

> **⚠️ 重要**: ユーザーから「PR を作成してください」の明示的な指示があるまで、
> commit・push・PR 作成のいずれも**自動実行禁止**。

---

## 実行タスク

### Task 1: PR 作成前の最終チェック

PR 作成前に以下を全て確認する。

#### 全 Phase 完了確認

| Phase | タイトル           | 確認方法                                            |
| ----- | ------------------ | --------------------------------------------------- |
| 1     | 要件定義           | `outputs/phase-1/requirements-definition.md` の存在 |
| 2     | 設計               | `outputs/phase-2/` の成果物確認                     |
| 3     | 設計レビューゲート | `outputs/phase-3/gate-decision.md` が PASS          |
| 4     | テスト作成         | `outputs/phase-4/` の成果物確認                     |
| 5     | TDD Red            | `outputs/phase-5/` の成果物確認                     |
| 6     | TDD Green          | `outputs/phase-6/` の成果物確認                     |
| 7     | TDD Refactor       | `outputs/phase-7/` の成果物確認                     |
| 8     | 統合確認           | `outputs/phase-8/` の成果物確認                     |
| 9     | コードレビュー     | `outputs/phase-9/` の成果物確認                     |
| 10    | セルフレビュー     | `outputs/phase-10/` の成果物確認                    |
| 11    | 最終確認           | `outputs/phase-11/` の成果物確認                    |
| 12    | ドキュメント更新   | `outputs/phase-12/` の 6 成果物が全て存在           |

#### 品質チェック

```bash
# Lint チェック
pnpm lint

# 型チェック
pnpm typecheck
```

両コマンドでエラー 0 件を確認すること。

#### 変更ファイル確認

```bash
git diff --name-only main
```

**期待される変更ファイル:**

| ファイル                                                                      | 種別 |
| ----------------------------------------------------------------------------- | ---- |
| `packages/shared/src/types/skill-wizard-label-map.ts`                         | 新規 |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 修正 |
| `outputs/phase-3/design-decisions.md`                                         | 修正 |

---

### Task 2: ブランチ作成

```bash
git checkout -b refactor/skill-wizard-semantic-default-label-map
```

> ブランチ名は `refactor/skill-wizard-semantic-default-label-map` を使用する。
> 既にブランチが存在する場合はそのまま使用する。

---

### Task 3: コミット

以下のメッセージでコミットする。

```
refactor(skill-wizard): ConversationRoundStep semantic default 変換テーブルを shared に外部化

- packages/shared/src/types/skill-wizard-label-map.ts を新規作成
- QuestionSemanticLabelMap 型と SEMANTIC_LABEL_MAP 定数を定義
- resolveSemanticLabel() を shared マッピング参照へ変更（後方互換）
- applySmartDefaults() のユニットテストを N件に強化

Closes #2042

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

> `N件` は実際のテスト件数に置き換えること。

**コマンド例:**

```bash
git add packages/shared/src/types/skill-wizard-label-map.ts
git add apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
git add outputs/phase-3/design-decisions.md
git commit -m "$(cat <<'EOF'
refactor(skill-wizard): ConversationRoundStep semantic default 変換テーブルを shared に外部化

- packages/shared/src/types/skill-wizard-label-map.ts を新規作成
- QuestionSemanticLabelMap 型と SEMANTIC_LABEL_MAP 定数を定義
- resolveSemanticLabel() を shared マッピング参照へ変更（後方互換）
- applySmartDefaults() のユニットテストを N件に強化

Closes #2042

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: PR 作成

以下の内容で PR を作成する。

**タイトル:**

```
refactor(skill-wizard): semantic default 変換テーブルを shared に外部化（#2042）
```

**ボディ:**

```markdown
## Summary

- `resolveSemanticLabel()` の変換テーブルを `packages/shared` に集約
- `QuestionSemanticLabelMap` 型と `SEMANTIC_LABEL_MAP` 定数を新規作成
- `applySmartDefaults()` のユニットテストを強化（10件以上）
- `outputs/phase-3/design-decisions.md` に正準形マッピング表を追記

## Test plan

- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` で全件 PASS 確認
- [ ] `pnpm typecheck` でエラー0件確認
- [ ] `pnpm lint` でエラー0件確認
- [ ] ウィザードの semantic default 変換動作確認（手動 or 自動）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**コマンド例:**

```bash
gh pr create \
  --title "refactor(skill-wizard): semantic default 変換テーブルを shared に外部化（#2042）" \
  --body "$(cat <<'EOF'
## Summary

- \`resolveSemanticLabel()\` の変換テーブルを \`packages/shared\` に集約
- \`QuestionSemanticLabelMap\` 型と \`SEMANTIC_LABEL_MAP\` 定数を新規作成
- \`applySmartDefaults()\` のユニットテストを強化（10件以上）
- \`outputs/phase-3/design-decisions.md\` に正準形マッピング表を追記

## Test plan

- [ ] \`pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx\` で全件 PASS 確認
- [ ] \`pnpm typecheck\` でエラー0件確認
- [ ] \`pnpm lint\` でエラー0件確認
- [ ] ウィザードの semantic default 変換動作確認（手動 or 自動）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

### Task 5: CI 確認

PR 作成後に CI ステータスを確認する。

```bash
# CI ステータス確認
gh run view

# または PR に紐づく check を確認
gh pr checks
```

全チェックが PASS していることを確認する。
失敗した場合は内容を確認し、修正コミットを追加する。

---

## PR 作成の実行条件

> **⚠️ 自動実行禁止**

以下の条件を全て満たした場合のみ実行する:

| 条件                                        | 確認方法                             |
| ------------------------------------------- | ------------------------------------ |
| ユーザーから「PR を作成してください」の指示 | 明示的な発話・テキスト入力による指示 |
| Phase 1〜12 が全て完了している              | Task 1 の完了確認チェック            |
| `pnpm lint` / `pnpm typecheck` がエラー 0   | Task 1 の品質チェック結果            |

**ユーザーの承認なしに commit・push・PR 作成を実行した場合は規約違反となる。**

---

## 参照資料

| 資料名                       | パス                                        | 用途                   |
| ---------------------------- | ------------------------------------------- | ---------------------- |
| Phase 12 成果物              | `outputs/phase-12/`                         | 最終確認・引き継ぎ内容 |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`  | PR 説明文の参考        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md` | 改善点の把握           |
| git log                      | `git log --oneline main..HEAD`              | コミット内容の確認     |
| git diff                     | `git diff --name-only main`                 | 変更ファイルの確認     |

---

## 成果物

| 成果物名 | 内容                        | 必須             |
| -------- | --------------------------- | ---------------- |
| PR URL   | 作成された PR の GitHub URL | ✅（承認後のみ） |

> PR URL はユーザーへの報告として返すこと。

---

## 完了条件

- [ ] ユーザーから PR 作成の明示的な承認を得ている
- [ ] Task 1（最終チェック）が全項目 PASS している
- [ ] Task 2（ブランチ作成）が完了している
- [ ] Task 3（コミット）が完了している（`--no-verify` 禁止）
- [ ] Task 4（PR 作成）が完了し、PR URL を取得している
- [ ] Task 5（CI 確認）で全チェックが PASS している
- [ ] PR がマージ待ち、またはマージ済みの状態になっている

---

## タスク100%実行確認【必須】

- [ ] Task 1: PR 作成前の最終チェック（Phase 完了 / lint / typecheck / diff） ✅
- [ ] Task 2: ブランチ作成 ✅
- [ ] Task 3: コミット（`--no-verify` 不使用） ✅
- [ ] Task 4: PR 作成（タイトル・ボディ・Test plan 含む） ✅
- [ ] Task 5: CI 確認（全チェック PASS） ✅
- [ ] ユーザーへの PR URL 報告 ✅

---

## 次Phase

**完了** — このタスクの全 Phase が終了する。
