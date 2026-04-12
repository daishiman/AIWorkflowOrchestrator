# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 4                                              |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 3                                        |
| 後続Phase  | Phase 5                                        |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

変更前の状態（`describe.skip` 内の旧 testid 参照）を確認し、
変更後の回帰テスト計画を作成する。
NON_VISUAL クリーンアップタスクのため、新規テスト作成は最小限とし、
既存テストの PASS 確認を中心に設計する。

## Private Method テスト方針

N/A — 本タスクはテストファイルのみの変更であり、実装コードの変更を伴わない。
`pnpm --filter @repo/desktop test:run` による全テスト実行で AC を検証する。

## Phase 4 事前確認: 既存ユーティリティ重複検出

```bash
# 削除済み testid の残存確認（対象2ファイル）
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/

# describe.skip ブロックの確認
grep -rn "describe.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/

# 現行 testid の確認（参照用）
grep -rn "skill-lifecycle-open-wizard-button" \
  apps/desktop/src/renderer/components/skill/__tests__/
```

## テスト方針

NON_VISUAL クリーンアップタスクのため、以下の方針を採用する。

- **新規テスト作成**: 不要（テストファイルの削除・書き換えのみ）
- **変更前確認**: `describe.skip` ブロック内の旧 testid 参照箇所を特定して記録する
- **変更後確認**: 全アクティブテストが PASS することを確認する

## テストマトリクス

| TC番号 | テスト名                                                    | 対象ファイル                                 | 期待結果 |
| ------ | ----------------------------------------------------------- | -------------------------------------------- | -------- |
| TC-1   | llm-generation.test.tsx 内に旧 testid 参照が存在しないこと  | SkillLifecyclePanel.llm-generation.test.tsx  | PASS     |
| TC-2   | auth-regression.test.tsx 内に旧 testid 参照が存在しないこと | SkillLifecyclePanel.auth-regression.test.tsx | PASS     |
| TC-3   | describe.skip 外の全アクティブテストが PASS すること        | 対象2ファイルを含む全テスト                  | 全 PASS  |
| TC-4   | pnpm --filter @repo/desktop typecheck が PASS すること      | TypeScript 型チェック                        | PASS     |

## テスト検証コマンド

```bash
# TC-1/TC-2: 旧 testid 残存確認（0件が期待値）
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/

# TC-3: 全テスト実行（変更後）
pnpm --filter @repo/desktop test:run

# TC-3 verbose: 詳細確認
pnpm --filter @repo/desktop test:run --reporter=verbose

# TC-4: 型チェック
pnpm --filter @repo/desktop typecheck
```

## 参照資料

| 資料名           | パス                                         | 用途           |
| ---------------- | -------------------------------------------- | -------------- |
| 設計書           | `outputs/phase-2/design-document.md`         | Phase 2 成果物 |
| 設計レビュー     | `outputs/phase-3/gate-decision.md`           | Phase 3 成果物 |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | Phase 3 成果物 |

## 実行手順

1. `grep` コマンドで `skill-lifecycle-request-input` 参照箇所を特定し記録する
2. `describe.skip` ブロックの内容を確認して変更スコープを明確にする
3. テストマトリクス TC-1〜TC-4 を定義する
4. 成果物を `outputs/phase-4/` に出力する

## 実行タスク

- grep で旧 testid 参照箇所を特定し記録する
- describe.skip ブロックの内容を確認して変更スコープを明確にする
- テストマトリクス TC-1〜TC-4 を定義する
- 検証コマンドを確定する
- テスト仕様書を outputs/phase-4/ に出力する

## 統合テスト連携

- 全テスト PASS を `pnpm --filter @repo/desktop test:run` で確認
- 旧 testid の残存ゼロを `grep` で静的確認

## 多角的チェック観点

| 観点       | 確認内容                                                                      |
| ---------- | ----------------------------------------------------------------------------- |
| 網羅性     | `describe.skip` ブロック内を含む全参照箇所が対象になっているか                |
| 命名一貫性 | テスト名が AC 番号と対応しているか                                            |
| 影響範囲   | `skip` 内のテストは元々実行されないため、アクティブなテストへの影響がないこと |

## 成果物

| 成果物       | パス                                    | 説明                                 |
| ------------ | --------------------------------------- | ------------------------------------ |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | テストマトリクスと検証コマンドの記録 |

## 完了条件

- [ ] テストマトリクスの TC-1〜TC-4 が定義済み
- [ ] 旧 testid 参照箇所の一覧が記録されている
- [ ] 検証コマンドが確定している
- [ ] テスト仕様書が成果物として記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 旧 testid 参照箇所の特定
2. `describe.skip` ブロック内容の確認
3. テストマトリクス作成
4. 検証コマンド定義
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 5: 実装
