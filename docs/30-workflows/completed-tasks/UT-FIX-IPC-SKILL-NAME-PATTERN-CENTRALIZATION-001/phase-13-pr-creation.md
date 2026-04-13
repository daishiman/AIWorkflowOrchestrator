# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 13                                                 |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 12                                           |
| 後続Phase  | -                                                  |
| 作成日     | 2026-04-06                                         |
| ステータス | blocked                                            |

---

> **重要: PR 作成にはユーザーの明示的承認が必要です。**
>
> 本 Phase では、ユーザーが明示的に「PR を作成してください」と指示するまで `gh pr create` を実行してはなりません。
> 承認がない場合はローカル確認と差分要約のみを行い、`outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` の作成で終了します。

---

## 目的

提出準備を完了し、ユーザー承認後のみ PR 作成へ進む。
レビュアーが変更内容・影響範囲・テスト結果を迅速に把握できる PR を作成する。

## 背景

`SKILL_NAME_PATTERN` の shared 一元化が完了し、全テスト・typecheck・lint が PASS した状態でのマージを確実にするため、PR 作成前にユーザーの明示的承認を必須とする。

## SubAgentチーム編成

| SubAgent   | 関心ごと         | 主担当                                      |
| ---------- | ---------------- | ------------------------------------------- |
| SubAgent-A | Main/shared 責務 | 差分要約・変更内容整理                      |
| SubAgent-B | Preload/API 契約 | 型契約・公開境界の変更説明                  |
| SubAgent-C | Renderer/UX 契約 | 影響なし確認・ラベル設定                    |
| SubAgent-D | 統合監査         | 承認条件確認・PR 本文最終調整・引き継ぎ記録 |

## 実行タスク

- 提出差分整理: レビューに必要な差分説明を整理する
- 承認条件確認: ユーザー明示承認がある場合のみ PR 作成へ進む
- 引き継ぎ記録: 次担当者が迷わない引き継ぎ情報を固定する

## 参照資料

| 参照資料               | パス                                              | 説明            |
| ---------------------- | ------------------------------------------------- | --------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| アーキテクチャ設計     | `outputs/phase-2/design-document.md`              | Phase 2 成果物  |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物  |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物  |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物  |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物  |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物  |
| リファクタリング計画   | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物  |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物  |
| 品質レポート           | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| リスク台帳             | `outputs/phase-9/risk-register.md`                | Phase 9 成果物  |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 是正計画               | `outputs/phase-10/corrective-action-plan.md`      | Phase 10 成果物 |
| 出荷準備チェック       | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md`          | Phase 11 成果物 |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`              | Phase 11 成果物 |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`             | Phase 11 成果物 |
| 実装ガイド             | `outputs/phase-12/implementation-guide.md`        | Phase 12 成果物 |
| 仕様更新サマリー       | `outputs/phase-12/system-spec-update-summary.md`  | Phase 12 成果物 |
| 更新履歴               | `outputs/phase-12/documentation-changelog.md`     | Phase 12 成果物 |
| 未タスク検出           | `outputs/phase-12/unassigned-task-detection.md`   | Phase 12 成果物 |
| スキルフィードバック   | `outputs/phase-12/skill-feedback-report.md`       | Phase 12 成果物 |

## PR 情報

### ブランチ命名

```
feat/ut-fix-ipc-skill-name-pattern-centralization-001
```

### PR タイトル

```
refactor(shared): スキル名バリデーション正規表現を shared 定数に一元化
```

### PR 本文テンプレート

```markdown
## 概要

`SKILL_NAME_PATTERN` 定数を `packages/shared/src/constants/skillName.ts` に一元定義し、
`SkillScanner.ts` と `init_skill.js` の両方が単一の信頼源を参照する構造にリファクタリングしました。

## 変更内容

- `packages/shared/src/constants/skillName.ts` を新規作成し `SKILL_NAME_PATTERN` を export
- `packages/shared/src/constants/index.ts` に `export * from './skillName'` を追加
- `apps/desktop/src/main/claude-cli/SkillScanner.ts`: ローカル定義を削除し `@repo/shared/constants` から import に変更
- `.claude/skills/skill-creator/scripts/init_skill.js`: インライン定義を削除し `import { SKILL_NAME_PATTERN } from '@repo/shared/constants'` 参照に変更
- `.agents/skills/skill-creator/scripts/init_skill.js`: mirror 同期（`.claude` 側と同内容に統一）

## テスト計画

- [x] `pnpm typecheck` PASS（エラー 0 件）
- [x] `pnpm lint` PASS（エラー 0 件）
- [x] `pnpm --filter @repo/shared test` 全 PASS
- [x] `pnpm --filter @repo/desktop test` 回帰なし
- [x] `pnpm --filter @repo/shared build` 成功・`dist/src/constants/index.cjs` および `dist/src/constants/index.js` 存在確認済み
- [x] `.claude` ↔ `.agents` mirror parity 確認済み（diff 0 行）

## 関連 Issue

- Task: UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
- 関連候補: UT-FIX-SKILL-NAME-LENGTH-VALIDATION-001、UT-FIX-SKILL-NAME-JAPANESE-INPUT-UX-001
```

### ラベル

```
refactoring, packages/shared
```

## PR 作成前確認チェックリスト

- [ ] `outputs/phase-13/local-check-result.md` が作成済みである
- [ ] `outputs/phase-13/change-summary.md` が作成済みである
- [ ] ユーザーの明示的承認を得ている
- [ ] `feat/ut-fix-ipc-skill-name-pattern-centralization-001` ブランチが作成済みである
- [ ] 全変更ファイルがコミット済みである
- [ ] `pnpm typecheck` が PASS している
- [ ] `pnpm lint` が PASS している
- [ ] 全テストが PASS している
- [ ] mirror parity が確認済みである（diff 0 行）
- [ ] PR タイトルが規約に準拠している（`refactor(shared):` プレフィックス）
- [ ] PR 本文に概要・変更内容・テスト計画・関連 Issue が含まれている
- [ ] ラベル `refactoring` と `packages/shared` を設定する

## 実行手順

1. 差分要約とローカル確認の結果を整理し、`outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` を作成する。
2. 承認条件チェックでユーザー明示承認の有無を確認する。
3. 承認がない場合は PR 作成を実行せず、`outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` の作成のみで終了する。
4. 承認がある場合は以下を実行する:
   ```bash
   git checkout -b feat/ut-fix-ipc-skill-name-pattern-centralization-001
   gh pr create \
     --title "refactor(shared): スキル名バリデーション正規表現を shared 定数に一元化" \
     --body "$(cat outputs/phase-13/change-summary.md)" \
     --label "refactoring" \
     --label "packages/shared"
   ```

## 統合テスト連携

- Phase 12 の documentation-changelog と system-spec-update-summary を PR 情報の根拠にする。
- 承認がない場合は local-check-result と change-summary のみを残して blocked にする。

## 多角的チェック観点

| 観点     | 確認内容                                              |
| -------- | ----------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                    |
| 漏れ     | 要件から成果物への未反映項目がないか確認する          |
| 整合性   | PR 本文の変更内容が実際の差分と一致しているか確認する |
| 依存関係 | 依存 Phase との入力出力が整合しているか確認する       |

## 成果物

| 成果物           | パス                                     | 説明                 |
| ---------------- | ---------------------------------------- | -------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | ローカル確認の要約   |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | レビュー向け差分要約 |
| PR 情報          | `outputs/phase-13/pr-info.md`            | PR URL 等の整理      |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md` | 承認後の作成結果     |

※ PR 作成自体は成果物ではなく、ユーザー承認後の実行アクションである。

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] ユーザー明示承認の有無を確認・記録済み
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## PR 作成制約

- ユーザーの明示承認がある場合だけ PR 作成へ進む。
- 明示承認がない場合は `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` の作成で終了する。

## 次のPhase

Phase -: -
