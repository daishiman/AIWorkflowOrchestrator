# Phase 13: PR作成 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                     |
| --------- | ------------------------ |
| タスクID  | TASK-10A-G               |
| Phase     | 13                       |
| 名称      | PR作成                   |
| 依存Phase | Phase 12（ドキュメント） |
| 次Phase   | なし（完了）             |

---

## 目的

全Phase（1-12）の成果物を確認し、コードレビュー用のPull Requestを作成する。

---

## 参照資料

| 参照資料                      | パス                                                                                                                  | 使用目的                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義書            | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-1-requirements.md`                       | PR Summary の要件根拠      |
| Phase 2 設計書                | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`                             | テスト構成説明の根拠       |
| Phase 5 実装書                | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-5-implementation.md`                     | 実装差分の最終確認         |
| Phase 6 テスト拡充書          | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-6-test-expansion.md`                     | 追加テスト内容の転記根拠   |
| Phase 7 カバレッジ書          | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-7-coverage-check.md`                     | Coverage 記載の根拠        |
| Phase 8 リファクタリング書    | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-8-refactoring.md`                        | 仕上げ内容の確認           |
| Phase 9 品質保証書            | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-9-quality-assurance.md`                  | 品質ゲート結果の根拠       |
| Phase 10 最終レビュー書       | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-10-final-review.md`                      | 最終判定の転記根拠         |
| Phase 11 手動テスト書         | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-11-manual-test.md`                       | Manual Test Plan の根拠    |
| Phase 12 ドキュメント書       | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-12-documentation.md`                     | 仕様同期結果の根拠         |
| Phase 12 実装ガイド           | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-12/implementation-guide.md`      | PR 補足説明                |
| Phase 12 仕様更新サマリー     | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-12/spec-update-summary.md`       | 仕様反映結果の確認         |
| Phase 12 変更履歴             | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-12/documentation-changelog.md`   | 更新対象一覧の確認         |
| Phase 12 未タスク検出         | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-12/unassigned-task-detection.md` | 残課題有無の確認           |
| Phase 12 スキルフィードバック | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-12/skill-feedback-report.md`     | テンプレート改善結果の確認 |
| タスク運用ルール              | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                                            | PR作成ルール               |
| Git操作ルール                 | `.claude/rules/07-git-and-tooling.md`                                                                                 | ブランチ・PR規約           |
| 品質要件                      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                           | 品質ゲート基準             |

---

## 前提条件

- Phase 12（ドキュメント）が完了していること
- `artifacts.json` の Phase 1-12 が全て完了ステータスであること
- `pnpm lint` / `pnpm typecheck` が通ること
- 全テストがPASSしていること
- **ユーザーからコミット・PR作成の明示許可が出ていること**

---

## 実行タスク

### Task 1: 成果物最終確認

`artifacts.json` を確認し、全Phaseの成果物が揃っていることを検証する。

| Phase | ステータス確認 | 主要成果物                                                                                                                          |
| ----- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 完了           | phase-1-requirements.md                                                                                                             |
| 2     | 完了           | phase-2-design.md                                                                                                                   |
| 3     | 完了           | phase-3-design-review.md                                                                                                            |
| 4     | 完了           | skillHandlers.create.test.ts, SkillLifecycle.integration.test.tsx                                                                   |
| 5     | 完了           | テスト実装完了（全PASS）                                                                                                            |
| 6     | 完了           | ChatPanel.skill-management.test.tsx 修正                                                                                            |
| 7     | 完了           | coverage-report.md                                                                                                                  |
| 8     | 完了           | リファクタリング済みテストコード                                                                                                    |
| 9     | 完了           | quality-report.md                                                                                                                   |
| 10    | 完了           | final-review-report.md                                                                                                              |
| 11    | 完了           | manual-test-result.md                                                                                                               |
| 12    | 完了           | implementation-guide.md, spec-update-summary.md, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md |

### Task 2: 品質ゲート最終実行

```bash
# Lint
pnpm lint

# TypeCheck
pnpm typecheck

# 対象テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

全て PASS であることを確認する。

### Task 3: コミット

**実行ガード**: ユーザーの明示許可がない限り、このTaskは実行しない。

**ブランチ名**: `docs/TASK-10A-G-lifecycle-test-hardening`（既存ブランチを使用）

**コミットメッセージ**:

```
feat(test): スキルライフサイクル統合テスト強化（TASK-10A-G）

- Layer 1: Main IPC skill:create 契約テスト（14テスト）
- Layer 2: Renderer統合テスト ChatPanel起点（10テスト）
- Layer 3: 既存ChatPanel.skill-management拡張（+4テスト）
- P42準拠3段バリデーション検証
- P9/P31/P39/P40/P48 教訓適用
```

**注意**: `--no-verify` は使用禁止。pre-commit / pre-push フックを必ず通す。

### Task 4: PR作成

**実行ガード**: ユーザーの明示許可がない限り `gh pr create` を実行しない。

**PRタイトル**: `feat(test): TASK-10A-G スキルライフサイクル統合テスト強化`

**PR本文テンプレート**:

````markdown
## Summary

- Main IPC `skill:create` ハンドラの契約テストを追加（14テスト）
  - P42準拠3段バリデーション（型チェック→空文字列→trim空文字列）
  - Sender検証、エラーサニタイズ検証を含む
- ChatPanel起点のRenderer統合テストを追加（10テスト）
  - create→list→analyze→improve の状態遷移を検証
  - Store状態遷移（idle→creating→created/error）を検証
- 既存 ChatPanel.skill-management テストを拡張（+4テスト）
  - skill:create IPC引数形式検証、連続作成時の状態管理

## Test Plan

1. Layer 1 テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
   ```
````

2. Layer 2 テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
   ```
3. Layer 3 テスト実行:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
   ```
4. 回帰テスト:
   ```bash
   cd apps/desktop && pnpm vitest run
   ```
5. 品質ゲート:
   ```bash
   pnpm lint && pnpm typecheck
   ```

## Related Issues

- Depends on: TASK-10A-E（IPC契約定義）, TASK-10A-F（Store駆動ライフサイクルUI）
- Task spec: `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/`

````

**PR作成コマンド**:
```bash
gh pr create \
  --title "feat(test): TASK-10A-G スキルライフサイクル統合テスト強化" \
  --body-file /tmp/pr-body.md \
  --base main \
  --head docs/TASK-10A-G-lifecycle-test-hardening
````

### Task 5: artifacts.json 最終更新

Phase 13 のステータスを `complete` に更新し、PR URLを記録する。

---

## 成果物

| 成果物         | パス                                                                                   | 説明         |
| -------------- | -------------------------------------------------------------------------------------- | ------------ |
| PR URL         | GitHub                                                                                 | マージ待ちPR |
| artifacts.json | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/artifacts.json` | 全Phase完了  |

---

## 統合テスト連携

| 連携対象    | Phase 13 で確認する内容                           | 備考               |
| ----------- | ------------------------------------------------- | ------------------ |
| Phase 1/2   | 要件・設計の最終版が PR 説明と一致するか          | Summary 根拠       |
| Phase 5〜11 | テスト/品質/手動検証結果が Test Plan と一致するか | PR本文へ転記       |
| Phase 12    | 実装ガイドと仕様更新結果が PR に参照されるか      | `## その他` で明示 |

---

## 完了条件

- [ ] `artifacts.json` の Phase 1-12 が全て完了ステータスである
- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] 対象テスト28件が全PASS
- [ ] コミットが `--no-verify` を使用せずに成功している
- [ ] PRが作成され、Summary と Test Plan が記載されている
- [ ] PRタイトルが70文字以内である
- [ ] `artifacts.json` の Phase 13 ステータスが更新されている

---

_このファイルは TASK-10A-G Phase 13 仕様書として作成されました。_
_最終更新: 2026-03-09_
