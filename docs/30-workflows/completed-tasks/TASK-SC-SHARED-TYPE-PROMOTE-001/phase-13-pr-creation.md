# Phase 13: PR作成

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 13                              |
| タスクID   | TASK-SC-SHARED-TYPE-PROMOTE-001 |
| 機能名     | shared-type-promote             |
| 前提Phase  | Phase 12                        |
| 後続Phase  | -（完了）                       |
| 作成日     | 2026-04-16                      |
| ステータス | skipped                         |

> **重要**: PR作成はユーザーの明示的な指示があるまで実行しない。
> このPhaseは準備のみ行い、実際のPR作成はユーザー承認後に実施する。

## 目的

変更サマリーを整理し、PR本文テンプレートを準備する。
ユーザーの承認後にPRを作成し、CIが全て通過することを確認する。

## 実行タスク

- [ ] 変更内容のサマリー作成（`outputs/phase-13/pr-info.md`）
- [ ] ブランチの最終状態確認
- [ ] コミットログの整理
- [ ] PR本文テンプレート作成
- [ ] **[ユーザー承認待ち]** PR作成
- [ ] **[ユーザー承認待ち]** CI確認

## 参照資料

| 資料名                        | パス                                                                     | 用途                   |
| ----------------------------- | ------------------------------------------------------------------------ | ---------------------- |
| Phase 12 ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`                            | 変更サマリー確認       |
| Phase 12 実装ガイド           | `outputs/phase-12/implementation-guide.md`                               | PR本文に引用           |
| GitHub Issue #2182            | [#2182](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2182) | タスク原本・CLOSED状態 |

## 実行手順

### 1. 変更内容サマリー（昇格実施の場合）

**変更ファイル**:

- `packages/shared/src/types/skillCreator.ts`（新規追加）
- `packages/shared/src/types/index.ts`（re-export 追加）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（ローカル定義削除・import切り替え）
- `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`（テスト追加）

**変更サマリー（昇格不実施の場合）**:

- 変更は workflow spec / output docs のみ。コード変更は行わず、`StructurePlanJson` はローカル定義のまま維持した。
- `docs/30-workflows/TASK-SC-SHARED-TYPE-PROMOTE-001/` 配下の phase 文書と outputs を更新した。

### 2. git ログ確認

```bash
git log --oneline docs/30-workflows/TASK-SC-SHARED-TYPE-PROMOTE-001/ -10
git diff main...HEAD --stat
```

### 3. PR本文テンプレート

```
## Summary

- `StructurePlanJson` インタフェースの参照箇所棚卸しを実施
- [昇格実施の場合] `@repo/shared/types` に型定義を公開し、Single Source of Truth を確立
- [no-op close の場合] ローカル定義を維持し、昇格不要の判断理由を記録

## Changes

[変更ファイル一覧（実体に合わせてどちらかを採用）]

- [昇格実施の場合] `packages/shared/src/types/skillCreator.ts`
- [昇格実施の場合] `packages/shared/src/types/index.ts`
- [昇格実施の場合] `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- [昇格実施の場合] `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`
- [no-op close の場合] `docs/30-workflows/TASK-SC-SHARED-TYPE-PROMOTE-001/*.md`

## Test plan

- [ ] [昇格実施の場合] `pnpm --filter @repo/shared exec tsc --noEmit` PASS
- [ ] [昇格実施の場合] `pnpm --filter @repo/desktop exec tsc --noEmit` PASS
- [ ] [昇格実施の場合] `pnpm --filter @repo/shared test` 全PASS
- [ ] [昇格実施の場合] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts` 全PASS
- [ ] [昇格実施の場合] `pnpm --filter @repo/shared build` → `pnpm --filter @repo/desktop build` 成功
- [ ] [no-op close の場合] Phase 12 の成果物と `artifacts.json` / `outputs/artifacts.json` parity が PASS

## Related

- Refs #2182（Issue は CLOSED 状態）
- Depends on: TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
```

### 4. PR作成（ユーザー承認後）

```bash
# ブランチ push
git push origin docs/task-spec-TASK-SC-SHARED-TYPE-PROMOTE-001

# PR作成
gh pr create \
  --title "TASK-SC-SHARED-TYPE-PROMOTE-001 StructurePlanJson close-out" \
  --body "$(cat outputs/phase-13/pr-body.md)" \
  --base main
```

### 5. CI確認

```bash
# CI ステータス確認
gh pr checks

# 全ての CI が PASS することを確認
```

## 統合テスト連携

| 観点            | 内容                                      |
| --------------- | ----------------------------------------- |
| CI 全PASS       | GitHub Actions の全ジョブが PASS すること |
| PR blocked 解除 | ユーザー承認後にのみ PR 作成を実行        |

## 多角的チェック観点（AIが判断）

- **Issue #2182 のCLOSED状態**: Issue はCLOSEDだが、PR本文では `Refs #2182` として追跡し、実際の変更内容が no-op close か昇格実施かを本文で明示する
- **仕様書のみの場合**: 変更がタスク仕様書ファイルのみの場合、`docs/` プレフィックスのブランチ名が適切

## PR blocked ルール

> **このPhaseはユーザーの明示的な指示があるまで実行しない。**
>
> PR作成コマンド（`gh pr create`）を自律的に実行することは禁止されている。
> ユーザーが「PRを作成して」と明示的に指示するまで待機する。

## サブタスク管理

| サブタスクID | 名称                                 | ステータス |
| ------------ | ------------------------------------ | ---------- |
| T-13-1       | 変更サマリー・PR本文テンプレート作成 | skipped    |
| T-13-2       | [ユーザー承認待ち] PR作成            | blocked    |
| T-13-3       | [ユーザー承認待ち] CI確認            | blocked    |

## 成果物

| 成果物名                                 | パス                          | 種別         |
| ---------------------------------------- | ----------------------------- | ------------ |
| PR情報（変更サマリー・本文テンプレート） | `outputs/phase-13/pr-info.md` | ドキュメント |

## 完了条件

- [ ] `outputs/phase-13/pr-info.md` が作成されていること
- [ ] PR本文テンプレートが準備されていること
- [ ] **[ユーザー承認後]** PR が作成されていること
- [ ] **[ユーザー承認後]** CI が全て PASS していること
- [ ] **[ユーザー承認後]** マージ可能な状態になっていること

## タスク100%実行確認【必須】

- [ ] 変更サマリー作成完了
- [ ] PR本文テンプレート準備完了
- [ ] pr-info.md 作成完了
- [ ] [ユーザー承認待ち] PR作成・CI確認

## 最終タスク完了

Phase 13 完了をもって TASK-SC-SHARED-TYPE-PROMOTE-001 の全フェーズが完了する。

```bash
# タスク完了記録
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-SC-SHARED-TYPE-PROMOTE-001 \
  --phase 13 \
  --artifacts "outputs/phase-13/pr-info.md:PR情報"
```
