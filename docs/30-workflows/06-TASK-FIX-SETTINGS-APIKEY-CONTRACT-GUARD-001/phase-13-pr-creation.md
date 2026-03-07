# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 13                                               |
| 機能名     | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001   |
| タスク名   | 設定画面 apiKey.list 契約防御と providers 正規化 |
| 作成日     | 2026-03-06                                       |
| ステータス | 未実施                                           |

## 目的

Phase 1-12 の全成果物を統合し、PR 作成に必要な情報を整理する。実際の commit / push / PR 実行はユーザー指示後に限る。

## 実行タスク

### Task 1: PR 計画

#### ブランチ名

```
fix/settings-apikey-contract-guard-001
```

#### PR タイトル（70 文字以内）

```
fix(settings): ApiKeysSection 契約防御ガードとテスト拡充
```

#### PR 本文テンプレート

```markdown
## Summary

- ApiKeysSection に Renderer 4 層防御（electronAPI 存在チェック / success チェック / Array.isArray / フォールバック UI）を実装
- 残存 gap テスト（EXP-01〜EXP-04）を追加し、カバレッジ基準を充足
- profileHandlers の identities 防御パターン統一を検討し、未タスク化

## Test Plan

- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx` が全 PASS
- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/apiKeyHandlers.test.ts` が全 PASS
- [ ] `pnpm lint` がエラー 0 件
- [ ] `pnpm typecheck` がエラー 0 件
- [ ] ApiKeysSection Line Coverage 90%+, Branch 70%+, Function 90%+

## 関連 Issue

- Closes #<issue-number>

## Pitfall チェック

- [x] P42: .trim() バリデーション確認済み
- [x] P48: Non-null assertion 未使用確認済み
- [x] P1/P25: LOGS.md 2 ファイル更新済み
```

### Task 2: handoff checklist

| #   | チェック項目                                  | 完了 |
| --- | --------------------------------------------- | ---- |
| 1   | `pnpm lint` エラー 0 件                       | [ ]  |
| 2   | `pnpm typecheck` エラー 0 件                  | [ ]  |
| 3   | `pnpm --filter @repo/desktop test` 全 PASS    | [ ]  |
| 4   | カバレッジ基準充足（Phase 7 結果参照）        | [ ]  |
| 5   | Phase 10 ゲート判定が PASS or MINOR           | [ ]  |
| 6   | Phase 11 手動テスト全シナリオ PASS            | [ ]  |
| 7   | Phase 12 LOGS.md 2 ファイル更新済み           | [ ]  |
| 8   | Phase 12 topic-map.md 再生成済み              | [ ]  |
| 9   | Phase 12 未タスク検出（0 件でも出力済み）     | [ ]  |
| 10  | Phase 12 スキルフィードバックレポート作成済み | [ ]  |
| 11  | artifacts.json 全 Phase ステータス更新済み    | [ ]  |

### Task 3: 実行制約の確認

> **重要**: 実際の commit / push / PR 実行は行わない。ユーザーの明示的な指示を待つ。

- commit: ユーザー指示後に `git add` + `git commit` を実行
- push: ユーザー指示後に `git push -u origin fix/settings-apikey-contract-guard-001` を実行
- PR: ユーザー指示後に `gh pr create` を実行
- `--no-verify` は**絶対禁止**（CLAUDE.md 準拠）

### Task 4: CI 確認計画

PR 作成後に以下を確認する（実行はユーザー指示後）。

```bash
# CI ステータス確認
gh pr checks <pr-number>

# CI 失敗時の対応
# 1. 失敗したジョブのログを確認
# 2. ローカルで再現・修正
# 3. 新しいコミットで push（amend ではなく新規コミット）
```

## 参照資料

| 資料名             | パス                                      | 用途             |
| ------------------ | ----------------------------------------- | ---------------- |
| Phase 1-12 成果物  | `outputs/phase-1/` 〜 `outputs/phase-12/` | PR 情報の統合元  |
| CLAUDE.md          | `CLAUDE.md`                               | git 操作禁止事項 |
| 07-git-and-tooling | `.claude/rules/07-git-and-tooling.md`     | PR 作成ルール    |

## 成果物

| 成果物            | パス                                    | 説明                      |
| ----------------- | --------------------------------------- | ------------------------- |
| PR 計画           | `outputs/phase-13/pr-plan.md`           | PR 本文とレビュー観点の案 |
| handoff checklist | `outputs/phase-13/handoff-checklist.md` | 引き継ぎ項目              |

## 完了条件

- [ ] PR 本文案が Summary + Test Plan + 関連 Issue を含んでいる
- [ ] handoff checklist の全項目が確認可能な状態になっている
- [ ] 実際の commit / push / PR を行わない制約が明記されている
- [ ] CI 確認計画が記載されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次の Phase

タスク完了
