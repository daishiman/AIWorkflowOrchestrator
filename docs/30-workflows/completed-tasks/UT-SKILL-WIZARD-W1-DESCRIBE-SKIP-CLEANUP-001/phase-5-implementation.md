# Phase 5: 実装

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 5                                              |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 4                                        |
| 後続Phase  | Phase 6                                        |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

`describe.skip` 内の旧 testid 参照（`skill-lifecycle-request-input`）の
削除・書き換えを実施し、現行 UI（遷移ボタン化後）を正しく反映した
テストファイルの状態にする。

## 実装計画

### 新規作成ファイル

なし

### 修正ファイル

| ファイル                                                                                            | 変更内容                                                 |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`  | `skill-lifecycle-request-input` 参照の削除または書き換え |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | `skill-lifecycle-request-input` 参照の削除または書き換え |

## 実装手順

1. `SkillLifecyclePanel.llm-generation.test.tsx` を開き、`describe.skip` ブロックを確認する
2. `skill-lifecycle-request-input` を参照している行を特定する
3. 該当行を削除、または現行 testid（`skill-lifecycle-open-wizard-button` 等）への参照に書き換える
4. `SkillLifecyclePanel.auth-regression.test.tsx` でも同様に実施する
5. `pnpm --filter @repo/desktop test:run` を実行して全テスト PASS を確認する
6. `pnpm --filter @repo/desktop typecheck` で型チェックが PASS することを確認する

## 主要実装コマンド

```bash
# 削除済み testid の残存確認（変更前）
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/

# 現行 testid の確認（書き換え先の参照）
grep -rn "skill-lifecycle-open-wizard-button" \
  apps/desktop/src/renderer/components/skill/__tests__/

# 変更後: 全テスト実行
pnpm --filter @repo/desktop test:run

# 変更後: 型チェック
pnpm --filter @repo/desktop typecheck

# 変更後: 旧 testid が残存していないことを確認（0件が期待値）
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/
```

## 既存テスト回帰確認（baseline）

```bash
# 実装前の baseline 確認（skip 以外のテストが PASS していること）
pnpm --filter @repo/desktop test:run

# 実装後の回帰確認
pnpm --filter @repo/desktop test:run
```

## canUseTool 適用範囲と制約

本タスクはテストファイルのみの変更であり、SDK/IPC を含まないため N/A。

## IPC ハンドラ register/unregister ペアの確認

本タスクはIPCを含まないため N/A。

## 参照資料

| 資料名       | パス                                    | 用途                                 |
| ------------ | --------------------------------------- | ------------------------------------ |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4 成果物（変更スコープの記録） |

## 実行タスク

- SkillLifecyclePanel.llm-generation.test.tsx の describe.skip ブロックを確認する
- llm-generation ファイルの旧 testid 参照を削除・更新する
- SkillLifecyclePanel.auth-regression.test.tsx の describe.skip ブロックを確認する
- auth-regression ファイルの旧 testid 参照を削除・更新する
- 全テスト実行して PASS を確認する
- 型チェックを実行して PASS を確認する
- 成果物を outputs/phase-5/ に出力する

## 統合テスト連携

```bash
# 全テスト実行（アクティブなテストの回帰確認）
pnpm --filter @repo/desktop test:run

# verbose で詳細確認
pnpm --filter @repo/desktop test:run --reporter=verbose
```

## 多角的チェック観点

| 観点         | 確認内容                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| 最小変更原則 | `skill-lifecycle-request-input` 参照の削除のみ。他の testid は変更しない |
| 回帰安全性   | `describe.skip` 外のアクティブなテストが全件 PASS することを確認する     |
| 完全性       | 2ファイル両方の `describe.skip` ブロック内を確認し、漏れなく対処する     |

## 成果物

| 成果物           | パス                                        | 説明                              |
| ---------------- | ------------------------------------------- | --------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容と変更箇所の要約          |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 修正した2ファイルの変更差分の記録 |

## 完了条件

- [ ] `SkillLifecyclePanel.llm-generation.test.tsx` から `skill-lifecycle-request-input` 参照が削除・更新されている
- [ ] `SkillLifecyclePanel.auth-regression.test.tsx` から `skill-lifecycle-request-input` 参照が削除・更新されている
- [ ] `pnpm --filter @repo/desktop test:run` が PASS する
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] 実装サマリーが記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. `llm-generation.test.tsx` の `describe.skip` ブロック確認
2. `llm-generation.test.tsx` の旧 testid 参照を削除・更新
3. `auth-regression.test.tsx` の `describe.skip` ブロック確認
4. `auth-regression.test.tsx` の旧 testid 参照を削除・更新
5. 全テスト実行（PASS 確認）
6. 型チェック実行（PASS 確認）
7. 成果物出力

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

Phase 6: テスト拡充
