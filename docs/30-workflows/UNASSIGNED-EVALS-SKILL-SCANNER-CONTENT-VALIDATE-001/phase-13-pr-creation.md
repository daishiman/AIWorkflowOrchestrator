# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 13                                                  |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| 前提Phase  | Phase 12                                            |
| 後続Phase  | - （タスク完了）                                    |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

変更を GitHub Pull Request として提出し、レビューを依頼する。

> **警告: このPhaseはユーザーの明示承認後のみ実施すること**
>
> Phase 1〜12 が全て完了し、ユーザーから「PR を作成してください」という明示的な指示を受けた場合のみ、本 Phase を実行すること。
> 承認なしに PR を作成してはならない。

## 事前チェックリスト

PR 作成前に以下を全て確認すること。

- [ ] Phase 1〜12 が全て完了している（artifacts.json の status が completed）
- [ ] AC-1〜AC-10 が全て PASS している（Phase 10 最終レビュー結果を確認）
- [ ] `pnpm --filter @repo/desktop typecheck` が通過している
- [ ] `pnpm --filter @repo/desktop lint` が通過している
- [ ] `pnpm --filter @repo/desktop test` が全通過している
- [ ] CI（GitHub Actions）がローカルビルドで通過する見込みがある
- [ ] スコープ外ファイルへの誤った変更が含まれていない
  - `fixture EVALS.json` の snake_case → camelCase 移行（対象外）
  - UI 表示側のエラー文言ファイル（対象外）
  - runner/reporter 側の実装ファイル（対象外）

## PR タイトル案

```
feat(skill-scanner): UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 EVALS.json内容バリデーション追加
```

## PR 本文テンプレート

```markdown
## Summary

- `SkillScanner.ts` に EVALS.json コンテンツバリデーションフックを追加
- 空 `{}`・破損 JSON・必須キー欠落の EVALS.json を invalid として検出するように変更
- camelCase / snake_case 両許容ポリシーをコード内コメントとして明文化
- 既存3テスト（with-evals / with-all-others / with-sized-evals）の契約を更新し、破損 EVALS の新規テストケースを追加

## 背景

`SkillScanner.ts` は EVALS.json の**存在とファイルサイズ**しか確認しておらず、JSON の中身を検査していなかった。
その結果、空 `{}` や破損 JSON・必須キー欠落の EVALS.json を持つスキルも valid 扱いでリストに掲載されていた。

本 PR では内容バリデーションを追加し、上記の問題を解消する。

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` 通過
- [ ] `pnpm --filter @repo/desktop lint` 通過
- [ ] `pnpm --filter @repo/desktop test SkillScanner` 全通過（既存3テスト + 新規ケース）
- [ ] 空 `{}` の EVALS.json が invalid として扱われることを確認
- [ ] 破損 JSON の EVALS.json がパースエラーとして処理されることを確認
- [ ] camelCase / snake_case どちらの EVALS.json も valid として受理されることを確認
- [ ] EVALS.json を持たないスキルの挙動が変更前と同じであることを確認（回帰）

## Related Issue

Closes #2329

## スコープ外（本 PR に含まない変更）

- `fixture EVALS.json` の snake_case → camelCase 移行
- UI 表示側のエラー文言リデザイン
- runner/reporter 側の挙動変更
- 共通 evalsvalidator の実装（先行タスク UNASSIGNED-EVALS-VALIDATOR-GUARD-001 側）
```

## gh pr create コマンド例

```bash
# 1. 変更内容の最終確認
git diff --stat

# 2. コミット（まだの場合）
git add apps/desktop/src/main/services/skill/SkillScanner.ts
git add apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
git commit -m "feat(skill-scanner): UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 EVALS.json内容バリデーション追加

- Add content validation hook to SkillScanner for EVALS.json
- Handle empty {}, parse errors, and missing required keys
- Document camelCase/snake_case dual-language policy in code comments
- Update existing 3 tests and add new broken-EVALS test cases

Closes #2329"

# 3. PR 作成
gh pr create \
  --title "feat(skill-scanner): UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 EVALS.json内容バリデーション追加" \
  --body "$(cat <<'EOF'
## Summary

- `SkillScanner.ts` に EVALS.json コンテンツバリデーションフックを追加
- 空 `{}`・破損 JSON・必須キー欠落の EVALS.json を invalid として検出するように変更
- camelCase / snake_case 両許容ポリシーをコード内コメントとして明文化
- 既存3テスト（with-evals / with-all-others / with-sized-evals）の契約を更新し、破損 EVALS の新規テストケースを追加

## Test plan

- [ ] `pnpm --filter @repo/desktop typecheck` 通過
- [ ] `pnpm --filter @repo/desktop lint` 通過
- [ ] `pnpm --filter @repo/desktop test SkillScanner` 全通過
- [ ] 空 `{}` の EVALS.json が invalid として扱われることを確認
- [ ] 破損 JSON がパースエラーとして処理されることを確認
- [ ] camelCase / snake_case 両対応を確認
- [ ] EVALS.json なしスキルの回帰なし確認

## Related Issue

Closes #2329
EOF
)"
```

## 成果物

| 成果物 | パス | 説明                                              |
| ------ | ---- | ------------------------------------------------- |
| -      | -    | PR 作成は GitHub 上の操作のためローカル成果物なし |

## 完了条件

- [ ] 事前チェックリストを全て確認した
- [ ] ユーザーからの明示承認を受けた
- [ ] PR を作成した
- [ ] PR URL を `artifacts.json` の `metadata.prUrl` に記録した
- [ ] レビュアーをアサインした

## タスク100%実行確認【必須】

- [ ] Phase 1〜12 全完了確認
- [ ] 受け入れ基準 AC-1〜AC-10 全 PASS
- [ ] PR 作成完了
