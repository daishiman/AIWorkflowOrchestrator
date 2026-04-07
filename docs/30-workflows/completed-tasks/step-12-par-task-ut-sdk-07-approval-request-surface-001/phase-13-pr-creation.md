# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 13                                                                    |
| Phase名    | PR作成                                                                |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 12: ドキュメント更新                                            |
| 次Phase    | -（最終Phase）                                                        |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 重要: 自動実行禁止

> **PR作成はユーザーの明示的な承認後にのみ実行する。このPhaseは自動実行しない。**

## 最低限の記録（Phase 13 テンプレート準拠）

- なぜ blocked か: ユーザー承認が未了のため
- user approval の有無: 未承認
- Phase 12 までの完了根拠: `outputs/phase-12/*` と `artifacts.json` の完了記録
- local check の結果要約: Electron 起動 / `pnpm test` / typecheck / lint の確認結果
- `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` の作成
- `pr-info.md` / `pr-creation-result.md` を作成できる状態かどうか

## 目的

ユーザーの承認を得た後、`/ai:diff-to-pr` スキルを使用して PR を作成する。

## 実行タスク

- ユーザーにローカル動作確認を依頼する。
- 変更サマリーを提示し、PR 作成の許可を確認する。
- 許可後に `/ai:diff-to-pr` を実行し、PR 情報を記録する。

## 参照資料

| 参照資料          | パス                                                     | 内容            |
| ----------------- | -------------------------------------------------------- | --------------- |
| Phase 11 成果物   | `outputs/phase-11/manual-test-result.md`                 | UI 証跡         |
| Phase 12 成果物   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | PR 前の準拠確認 |
| Phase 12 更新履歴 | `outputs/phase-12/documentation-changelog.md`            | 変更一覧        |
| Issue             | `#1694`                                                  | 関連 Issue      |

## 実行手順

### Step 1: ユーザーへのローカル確認依頼と `local-check-result.md` 作成

PR 作成前に、ユーザーに以下の確認を依頼する:

1. Electron アプリを起動して approval request の動作を確認
2. Phase 11 のスクリーンショットで AC-2・AC-4 の達成を確認
3. `pnpm test` でテストが全て GREEN であることをローカルで確認

### Step 2: 変更サマリーの提示と `change-summary.md` 作成

ユーザーに以下のサマリーを提示し、PR 作成の許可を確認する:

**変更内容**:

- `apps/desktop/src/preload/skill-creator-api.ts`: `onApprovalRequest` listener 追加
- `apps/desktop/src/renderer/components/skill/ApprovalRequestPanel.tsx`: 新規作成
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`: approval UI 統合
- （条件付き）`packages/shared/src/types/skillCreator.ts`: `ApprovalRequest` 型追加

**解決する問題**:

- approval:request surface が未接続だった AC-4（危険操作の確認）を Renderer レベルで機能させる
- GitHub Issue #1694 をクローズ

### Step 3: ユーザー承認後に `/ai:diff-to-pr` を実行し、`pr-info.md` を作成/更新

```
/ai:diff-to-pr
```

PR タイトル案: `feat(skill-creator): approval:request surface を Renderer に追加 (#1694)`

PR 本文に含めるべき内容:

- 変更の背景（TASK-SDK-07 Phase 12 の未タスク）
- AC-1〜AC-4 の達成確認
- スクリーンショット証跡（Phase 11）
- 関連 Issue: #1694

## 統合テスト連携

- Phase 13 の local check / change summary / PR 情報は、次回以降の PR 再作成やレビュー対応に再利用する。
- PR 作成前に Phase 12 の compliance check と Phase 11 の証跡が揃っていることを必須条件とする。

## 成果物

| 成果物           | パス                                     | 説明                           |
| ---------------- | ---------------------------------------- | ------------------------------ |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | ローカル確認の実施結果         |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | PR 前の変更要約                |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR URL・変更サマリー・承認記録 |

## 完了条件

- [ ] ユーザーがローカルで動作確認を完了した
- [ ] ユーザーが PR 作成を明示的に承認した
- [ ] `outputs/phase-13/local-check-result.md` が作成されている
- [ ] `outputs/phase-13/change-summary.md` が作成されている
- [ ] `/ai:diff-to-pr` を実行した
- [ ] PR が作成され、URL が確認された
- [ ] GitHub Issue #1694 が PR にリンクされている
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している
