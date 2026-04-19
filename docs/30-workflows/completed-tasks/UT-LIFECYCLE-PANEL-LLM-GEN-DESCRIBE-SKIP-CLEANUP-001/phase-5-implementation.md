# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| PhaseID    | 5                                                              |
| Phase名    | 実装                                                           |
| タスクID   | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前Phase    | Phase 4                                                        |
| 次Phase    | Phase 6                                                        |
| 作成日     | 2026-04-18                                                     |
| ステータス | pending                                                        |

## 目的

Phase 4 のベースライン記録と testid 確認結果を基に、
`SkillLifecyclePanel.llm-generation.test.tsx` に対して実際のクリーンアップを実施する。
削除対象5件の describe.skip ブロック削除、修正対象3件の describe.skip 解消（昇格 or 削除）、
snapshot 系4件の処置、旧 API モック宣言の整理を順序立てて行う。

## 実行タスク

- [ ] Step 1: 削除対象5件（U-1/U-2/U-6/U-10/U-12）の describe.skip ブロック削除
- [ ] Step 2: 修正対象3件（U-4/U-11/U-8b）の処置（testid 確認結果に基づき昇格 or 削除）
- [ ] Step 3: snapshot 系4件（U-18b/U-19b/U-20b/U-21）の処置（設計方針に基づき昇格 or 削除）
- [ ] Step 4: 旧 API モック宣言（mockPlanSkill / mockDetectMode）の整理
- [ ] Step 5: beforeEach 内の旧 API 設定コードの整理
- [ ] Step 6: クリーンアップ後の vitest 実行で全アクティブテストが PASS することを確認

## 参照資料

| 資料名                                      | パス                                                                                               | 用途                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 4 ベースライン記録                    | `outputs/phase-4/baseline-test-result.md`                                                          | クリーンアップ前の PASS 状態の参照 |
| Phase 4 testid 確認記録                     | `outputs/phase-4/testid-confirmation.md`                                                           | U-4/U-11/U-8b の処置方針確認       |
| Phase 4 モック宣言出現箇所一覧              | `outputs/phase-4/mock-declaration-map.md`                                                          | 削除行番号の特定                   |
| Phase 3 レビュー結果                        | `outputs/phase-3/gate-decision.md`                                                                 | 処置分類の最終確定内容             |
| SkillLifecyclePanel.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 実装対象ファイル                   |

## 実行手順

### Step 1: 削除対象5件の describe.skip ブロック削除

旧フロー依存の describe.skip ブロックを削除する。各ブロックはコメントヘッダー（`// ===`）を含む
セクション単位で削除する。

```bash
# 削除前の状態確認（行番号でセクション範囲を特定）
grep -n "U-1:\|U-2:\|U-6:\|U-10:\|U-12:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### 削除対象ブロックの確認コマンド

```bash
# U-1 セクション（detectMode → planSkill sequential call）
grep -n "U-1:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-2 セクション（backward compatibility - detectMode='create' skips planSkill）
grep -n "U-2:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-6 セクション（terminal_handoff triggers handoff guidance display）
grep -n "U-6:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-10 セクション（planSkill failure propagates error）
grep -n "U-10:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# U-12 セクション（planSkill API unavailable graceful degradation）
grep -n "U-12:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

削除は各セクションの `// ===` コメントヘッダーから `});` の終端までをまとめて削除する。
エディタまたは `Edit` ツールで該当ブロックを削除する。

#### Step 1 後の確認

```bash
# 削除後の describe.skip 残数確認（5件削除後は7件以下になるはず）
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 削除後の vitest 実行（アクティブテストが PASS することを確認）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  --reporter=verbose
```

### Step 2: 修正対象3件の処置

Phase 4 の testid 確認結果（`outputs/phase-4/testid-confirmation.md`）に基づき処置する。

#### U-4: isGenerating guard prevents double invocation

```bash
# testid 確認結果に基づく処置
# - skill-lifecycle-prepare-button が存在する場合: describe.skip → describe に変更
# - 存在しない場合: ブロックごと削除

# 処置後の確認
grep -n "U-4:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### U-11: empty input validation

```bash
# testid 確認結果に基づく処置
# - テキストエリア testid が存在する場合: describe.skip → describe に変更し、
#   detectMode 呼び出しの期待値を現行 API（createSkill 等）に合わせて修正
# - 存在しない場合: ブロックごと削除

grep -n "U-11:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### U-8b: canonical binding drift prevention

```bash
# testid 確認結果に基づく処置
# - currentPlanResult.skillSpec が現行実装に存在する場合:
#   planSkill 依存を除去し、executePlan のみで再現可能なら describe に昇格
# - 存在しない場合: ブロックごと削除

grep -n "U-8b:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### Step 2 後の確認

```bash
# Step 2 後の vitest 実行（修正した describe が PASS することを確認）
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  --reporter=verbose
```

### Step 3: snapshot 系4件の処置

Phase 2 設計書の方針に基づき処置する。

#### U-20b: cancel clears approved snapshot symmetrically

```bash
# clearGenerationState ベースで再現可能か確認
# → 再現可能なら describe.skip → describe に変更
# → 旧 planSkill 参照が残る場合はブロックごと削除
grep -n "U-20b:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### U-21: approved snapshot behavior after execute failure

```bash
# 旧 planSkill 依存が残る場合はブロックごと削除
# executePlan の mock chain のみで再現できる場合は describe に昇格
grep -n "U-21:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### U-18b / U-19b

```bash
# skill-lifecycle-prepare-button の存在確認結果に基づき処置
# 存在しない場合は両方削除
grep -n "U-18b:\|U-19b:" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

#### Step 3 後の確認

```bash
# Step 3 後の vitest 実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  --reporter=verbose
```

### Step 4: 廃止済み API モック宣言の整理

Phase 4 のモック宣言出現箇所一覧（`outputs/phase-4/mock-declaration-map.md`）に基づき、
アクティブなテストで使用されていないモック宣言を削除する。

```bash
# Step 1〜3 完了後、残存する describe.skip と使用状況を確認
grep -n "mockPlanSkill\|mockDetectMode" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# アクティブなテストで mockExecutePlan が使用されているか確認（削除不可の場合あり）
grep -n "mockExecutePlan" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx | \
  grep -v "describe\.skip"
```

削除対象（アクティブテストで使用されていないもの）:

- `const mockPlanSkill = vi.fn();` 宣言行
- `const mockDetectMode = vi.fn();` 宣言行
- `beforeEach` 内の `mockPlanSkill.mockResolvedValue(...)` 設定
- `beforeEach` 内の `mockDetectMode.mockResolvedValue(...)` 設定
- `window.skillCreatorAPI` オブジェクト内の `planSkill:` / `detectMode:` プロパティ

### Step 5: beforeEach 内の廃止済み API 設定コードの整理

```bash
# beforeEach 内の廃止済み API 設定箇所を確認
grep -n -A 5 "beforeEach" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx | \
  grep -A 3 "planSkill\|detectMode"

# window.skillCreatorAPI オブジェクトの現在の構造確認
grep -n -A 15 "skillCreatorAPI = {" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

`window.skillCreatorAPI` に含まれる `planSkill:` と `detectMode:` プロパティを削除する
（アクティブなテストに影響しないことを確認してから実施）。

### Step 6: クリーンアップ後の全体確認

```bash
# describe.skip の残数確認
echo "--- 残存 describe.skip 数 ---"
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# 対象ファイル単体 vitest 実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  --reporter=verbose

# SkillLifecyclePanel 関連テスト全体確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

| 判定項目                                                          | 基準                             | 結果    |
| ----------------------------------------------------------------- | -------------------------------- | ------- |
| 削除対象5件（U-1/U-2/U-6/U-10/U-12）の describe.skip が消えている | 対象ブロックが存在しない         | pending |
| 修正対象3件（U-4/U-11/U-8b）の describe.skip が解消されている     | .skip なし or ブロック削除       | pending |
| snapshot 系4件（U-18b/U-19b/U-20b/U-21）の処置が完了              | .skip なし or ブロック削除       | pending |
| 廃止済み API モック宣言（mockPlanSkill/mockDetectMode）が整理済み | 使用箇所がない場合は宣言削除済み | pending |
| アクティブなテストが全件 PASS                                     | vitest が全 PASS                 | pending |
| `pnpm --filter @repo/desktop typecheck` が PASS                   | TypeScript エラーなし            | pending |

## 多角的チェック観点

| 観点                            | チェック内容                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| アクティブテストへの影響        | 削除・修正が既存のアクティブな describe（U-3/U-5/U-7〜U-17 等）に影響しないか            |
| モック削除の副作用              | mockPlanSkill / mockDetectMode 削除後に TypeScript コンパイルエラーが出ないか            |
| ステップ順序の妥当性            | Step 1→2→3→4→5 の順で実施することで、各ステップ後に PASS 確認できているか                |
| window.skillCreatorAPI の整合性 | beforeEach 後の API オブジェクトが現行アクティブテストで必要なプロパティを保持しているか |

## サブタスク管理

1. Step 1: 削除対象5件の describe.skip ブロック削除
2. Step 1 後の vitest PASS 確認
3. Step 2: 修正対象3件（U-4/U-11/U-8b）の処置
4. Step 2 後の vitest PASS 確認
5. Step 3: snapshot 系4件の処置
6. Step 3 後の vitest PASS 確認
7. Step 4: 旧 API モック宣言の整理
8. Step 5: beforeEach 内の旧 API 設定コードの整理
9. Step 6: 全体確認（vitest + typecheck + lint）
10. 成果物の出力

## 成果物

| 成果物           | パス                                        | 説明                                     |
| ---------------- | ------------------------------------------- | ---------------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 各ステップの実施結果・削除行数・残存状況 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルと変更内容の概要         |

## 完了条件

- [ ] 削除対象5件（U-1/U-2/U-6/U-10/U-12）の describe.skip ブロックが削除済み
- [ ] 修正対象3件（U-4/U-11/U-8b）が describe に昇格またはブロック削除済み
- [ ] snapshot 系4件（U-18b/U-19b/U-20b/U-21）が処置済み
- [ ] 廃止済み API モック宣言（mockPlanSkill / mockDetectMode）がアクティブテストへの影響なく整理済み
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` が全 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が 0 error
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
```

## 次Phase

Phase 6（テスト拡充）へ進む。
