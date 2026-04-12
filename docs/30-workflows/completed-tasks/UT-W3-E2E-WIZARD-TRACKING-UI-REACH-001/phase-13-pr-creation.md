# Phase 13: PR作成 - タスク仕様書

> **重要: このPhaseはBLOCKED状態です。PR作成はユーザーの明示的な承認後のみ実施してください。**
>
> Phase 12 完了後、自動的に PR を作成してはいけません。
> 必ずユーザーに「Phase 12 が完了しました。PR を作成してよいですか？」と確認し、
> 明示的な承認（「はい」「作成してください」等）を得てから以下の手順を実行してください。

---

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 13                                                       |
| Phase名    | PR作成                                                   |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| 機能名     | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| タスク種別 | E2E テスト追加（NON_VISUAL から E2E 昇格）               |
| ステータス | **BLOCKED**（ユーザー明示承認待ち）                      |
| 前提Phase  | Phase 12（ドキュメント更新）                             |
| 後続Phase  | なし（最終Phase）                                        |
| 作成日     | 2026-04-12                                               |

---

## 目的

Phase 1〜12 で完了した変更内容（E2E テスト追加・CI 統合・Vite E2E 設定追加）をリポジトリへマージするための Pull Request を作成する。

---

## BLOCKED 状態の解除条件

以下の全条件を満たし、かつユーザーから明示的な承認を得た場合のみ本 Phase を実行する:

| 条件番号 | 条件                                                                   | 確認方法                                       |
| -------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| B-1      | Phase 12 の全成果物（6ファイル）が `outputs/phase-12/` に存在すること  | `ls outputs/phase-12/` で確認                  |
| B-2      | AC-1〜AC-9 が全件 PASS していること                                    | `outputs/phase-9/quality-report.md` 参照       |
| B-3      | `pnpm --filter @repo/desktop test:e2e` が全件 PASS していること        | 最新の E2E テスト実行結果で確認                |
| B-4      | `pnpm --filter @repo/desktop typecheck` が PASS していること           | 最新の型チェック結果で確認                     |
| B-5      | `pnpm --filter @repo/desktop lint` が PASS していること                | 最新の Lint チェック結果で確認                 |
| B-6      | スタブが本番コードに混入していないことが grep 証跡で確認されていること | `outputs/phase-10/final-review-result.md` 参照 |
| B-7      | ユーザーからの明示的な PR 作成承認                                     | ユーザーの発話で確認                           |

---

## PR 作成の前提条件

PR 作成前に以下を全て確認すること:

1. 現在のブランチが main ではなく feature ブランチであること
2. 未コミットの変更がないこと（`git status` で確認）
3. Phase 12 の全成果物が存在すること
4. CI の設定が正しく追加されていること（`.github/workflows/ci.yml` の E2E テストステップ）
5. ブランチがリモートにプッシュされていること

---

## 変更対象ファイル一覧

| ファイル                                           | 変更種別 | 変更内容                                                         |
| -------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | 新規作成 | trackEvent E2E UI 到達確認テスト（TC-03/05/06/08/09/11/12 相当） |
| `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | 新規作成 | trackEvent E2E capture ヘルパー（本番型定義と型整合）            |
| `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | 新規作成 | renderer の trackEvent 差し替え用 E2E スタブ                     |
| `.github/workflows/ci.yml`                         | 変更     | E2E テスト実行ステップ追加・PR ブロック設定                      |
| `apps/desktop/vite.e2e.config.ts`                  | 変更     | trackEvent alias 追加                                            |

---

## 実行タスク

> **BLOCKED: ユーザーの明示的な承認を得るまで以下のタスクを実行しないこと。**

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-13/` へ記録する。

---

### Task 1: PR 作成前確認

**目的**: PR 作成前に変更内容・ブランチ状態・CI 設定を確認する

**実行手順**:

1. 現在のブランチ名を確認する:

```bash
git branch --show-current
```

2. 変更ファイルの最終確認:

```bash
git diff --stat origin/main
```

3. Phase 12 の全成果物が存在することを確認する:

```bash
ls outputs/phase-12/
```

4. 未コミットの変更がないことを確認する:

```bash
git status
```

5. E2E テストを最終実行し、全件 PASS を確認する:

```bash
pnpm --filter @repo/desktop test:e2e
```

6. 確認結果を `outputs/phase-13/pr-creation-result.md` に記録する

---

### Task 2: PR 作成

**目的**: `gh pr create` コマンドで Pull Request を作成する

**PR タイトル案**:

```
test(e2e): スキルウィザード trackEvent UI 到達確認 E2E テスト追加
```

**PR 作成コマンド**:

```bash
gh pr create \
  --title "test(e2e): スキルウィザード trackEvent UI 到達確認 E2E テスト追加" \
  --body "$(cat <<'EOF'
## Summary

- `skill-wizard-tracking.spec.ts`: SkillWizard コンポーネントの trackEvent が各ステップで正しく発火されることを確認する E2E テストを追加（TC-03/05/06/08/09/11/12 相当）
- `wizard-tracking-stub.ts`: 本番型定義と型整合する trackEvent capture ヘルパーを追加
- `trackEvent.e2e-stub.ts`: renderer の trackEvent を E2E 専用に差し替えるスタブを追加
- `.github/workflows/ci.yml`: E2E テスト自動実行ステップを追加し、失敗時に PR をブロックする設定を追加
- `apps/desktop/vite.e2e.config.ts`: trackEvent alias を追加

## 背景

スキルウィザードの trackEvent は NON_VISUAL な単体テスト（Vitest）でのみ検証されていたが、
実際の UI コンポーネントの描画・操作フローを通じたイベント発火確認（UI 到達確認）が不足していた。
Playwright E2E テストを追加することで、コンポーネントの実際の動作レベルでの trackEvent 検証を実現する。

## Test plan

- [ ] AC-1: InfoStep 完了 → ConversationRoundStep 遷移が確認できること
- [ ] AC-2: CompleteStep の 👍 で `skill_skeleton_quality_feedback(satisfied=true)` が発火すること
- [ ] AC-3: CompleteStep の 👎 で `skill_skeleton_quality_feedback(satisfied=false)` が発火すること
- [ ] AC-4: `complete-step-action-execute` で `skill_wizard_next_action(execute)` が発火すること
- [ ] AC-5: `complete-step-action-open-editor` で `skill_wizard_next_action(open_editor)` が発火すること
- [ ] AC-6: `complete-step-action-create-another` で `skill_wizard_next_action(create_another)` が発火すること
- [ ] AC-7: 「もう一度作成」後に InfoStep に戻ること
- [ ] AC-8: `wizard-tracking-stub.ts` と `trackEvent.e2e-stub.ts` が本番型定義と型整合していること
- [ ] AC-9: CI パイプラインで E2E 自動実行・PR ブロックが設定されていること
- [ ] スタブが本番コードに混入していないこと（grep 証跡確認）
- [ ] 既存 E2E テストへの影響がゼロであること（リグレッションなし）
EOF
)"
```

**期待される成果物**: GitHub PR の URL

---

### Task 3: PR 作成後確認

**目的**: PR が正しく作成されたことを確認し、CI ステータスを記録する

**実行手順**:

1. 作成した PR の URL を記録する:

```bash
gh pr view --web
```

2. CI の実行状況を確認する:

```bash
gh pr checks
```

3. E2E テストの CI ステップが実行されていることを確認する
4. PR の詳細情報を `outputs/phase-13/pr-creation-result.md` に記録する

---

## 参照資料

| 参照資料                  | パス                                               | 内容                              |
| ------------------------- | -------------------------------------------------- | --------------------------------- |
| Phase 12 成果物           | `outputs/phase-12/`                                | Phase 12 で作成した全成果物       |
| Phase 9 品質レポート      | `outputs/phase-9/quality-report.md`                | E2E テスト・型チェック・Lint 結果 |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`          | AC 充足確認・grep 証跡            |
| E2E テスト実装ファイル    | `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | PR の変更対象ファイル             |
| E2E スタブヘルパー        | `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | PR の変更対象ファイル             |
| E2E trackEvent スタブ     | `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | PR の変更対象ファイル             |
| CI 設定ファイル           | `.github/workflows/ci.yml`                         | PR の変更対象ファイル             |
| Vite E2E 設定             | `apps/desktop/vite.e2e.config.ts`                  | PR の変更対象ファイル             |

---

## 成果物

| 成果物        | パス                                     | 内容                            |
| ------------- | ---------------------------------------- | ------------------------------- |
| GitHub PR URL | -（PR 作成後にここへ記録）               | マージ対象の Pull Request URL   |
| PR 作成記録   | `outputs/phase-13/pr-creation-result.md` | PR URL・CI ステータス・作成日時 |

---

## 承認後の実行手順

ユーザーから承認を得たら、以下の順序で実行する:

1. Task 1: PR 作成前確認（B-1〜B-6 の全条件を再確認）
2. Task 2: `gh pr create` コマンドで PR を作成
3. Task 3: PR 作成後確認（CI ステータス記録）
4. `outputs/phase-13/pr-creation-result.md` に PR URL と CI ステータスを記録
5. ユーザーへ PR URL を報告

---

## 完了条件

- [ ] ユーザーから PR 作成の明示的な承認を得ていること（BLOCKED 解除）
- [ ] BLOCKED 解除条件 B-1〜B-6 が全て充足されていること
- [ ] Task 1: PR 作成前確認が完了しており、未コミットの変更がないこと
- [ ] Task 2: `gh pr create` コマンドが成功し、GitHub PR URL が取得できていること
- [ ] Task 2: PR タイトルが指定の形式に従っていること
- [ ] Task 2: PR 本文に Summary・背景・Test plan（AC-1〜AC-9）が含まれていること
- [ ] Task 3: CI ステータスが確認されていること（E2E テストステップが実行されていること）
- [ ] Task 3: `outputs/phase-13/pr-creation-result.md` が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] BLOCKED 解除条件 B-1〜B-7 の全件充足を確認した
- [ ] Task 1（PR 作成前確認）を100%完了し、完了を明記した
- [ ] Task 2（PR 作成）を100%完了し、PR URL を記録した
- [ ] Task 3（PR 作成後確認）を100%完了し、CI ステータスを記録した
- [ ] ユーザーへ PR URL を報告した

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **前提**: ユーザーから PR 作成の明示的な承認を得ていること（BLOCKED 解除）
- **後続**: なし（本タスクの最終Phase）

---

## Phase実行記録テンプレート

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### 実行タスク

- BLOCKED 解除確認: [承認日時・承認者]
- Task 1（PR 作成前確認）: [結果]
- Task 2（PR 作成）: [結果・PR URL]
- Task 3（PR 作成後確認）: [CI ステータス]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

- なし（最終Phase）
```
