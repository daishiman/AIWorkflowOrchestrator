# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 1                                                              |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001                      |
| 機能名     | SkillCreateWizard / LLM生成テスト describe.skip クリーンアップ |
| 前提Phase  | -                                                              |
| 後続Phase  | Phase 2                                                        |
| 作成日     | 2026-04-16                                                     |
| ステータス | pending                                                        |

## 目的

`SkillCreateWizard.llm-generation.test.tsx` の現在状態を精査し、削除済みであれば
その事実を基点に残存参照の整理へ切り替える。ファイルがまだ存在する場合のみ、
旧テスト案に含まれていた 30 件の `describe.skip` の削除（選択肢A）または部分再利用（選択肢B）の方針を決定する。
受け入れ基準 AC-1〜AC-5 を固定し、後続 Phase への入力を確定する。

## 実行タスク

- [ ] P0チェック: `SkillCreateWizard.llm-generation.test.tsx` の存在確認（current worktree で削除済みかを先に判定）
- [ ] P50チェック: `SkillCreateWizard.llm-generation.test.tsx` の現状確認（`describe.skip` 件数の確認）
- [ ] 問題点の整理: デッドコード蓄積・CI信頼性低下・新規参入者の混乱・エッジケースカバレッジ欠落の4点を明示
- [ ] 選択肢A（削除済み確認）vs 選択肢B（部分再利用）の評価と方針候補の文書化
- [ ] 受け入れ基準 AC-1〜AC-5 の固定
- [ ] タスク分類の宣言: CLEANUPタスク / テストファイルのみ変更 / NON_VISUAL

## 参照資料

| 資料名                                    | パス                                                                                             | 用途                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| SkillCreateWizard.llm-generation.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済み確認・describe.skip 件数の確認            |
| SkillCreateWizard.test.tsx                | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | 新フロー（createSkill）のカバレッジ確認           |
| SkillCreateWizard.tsx                     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                               | generationMode / planSkill / executePlan 変更確認 |
| GitHub Issue #2102                        | [#2102](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2102)                         | タスク背景・要件原本                              |
| aiworkflow-requirements refs              | `.claude/skills/aiworkflow-requirements/references/`                                             | プロジェクト共通仕様参照                          |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# 対象ファイルが current worktree に存在するか確認
test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx && echo "present" || echo "deleted"

# SkillCreateWizard.llm-generation.test.tsx の describe.skip 件数確認
if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then
  grep -c "describe.skip\|it.skip\|test.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
else
  echo 0
fi

# describe.skip の全箇所を確認
if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then
  grep -n "describe.skip\|describe\.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
fi

# TODO(W2-seq-03a) コメントの確認
if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then
  grep -n "TODO(W2-seq-03a)\|TODO.*W2-seq-03a" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
fi

# SkillCreateWizard.tsx に generationMode / planSkill / executePlan が存在しないことを確認
grep -n "generationMode\|planSkill\|executePlan" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx

# 新フロー（createSkill）の存在確認
grep -n "createSkill" apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx | head -20

# 最近のコミット履歴確認（W2-seq-03a 関連変更の特定）
git log --oneline -15 -- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
git log --oneline -15 -- apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
```

### 1. 現在の問題点整理

`SkillCreateWizard.llm-generation.test.tsx` が `describe.skip` 状態のままになっている問題点:

| 問題             | 詳細                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| デッドコード蓄積 | 旧テスト案の 30 件のテストが存在しない UI 要素（`generationMode` ラジオボタン）を操作するため、永遠に動かないコードが残留する |
| CI 信頼性低下    | skip されたテストはカバレッジに算入されず、CI の「全テスト PASS」表示がミスリーディングになる                                 |
| 新規参入者の混乱 | なぜ skip されているのか、いつ有効化するのかが明示されておらず、コードベース理解を妨げる                                      |
| エッジケース欠落 | F-2/F-3/E-4/W-8b の重要なエッジケースが新フロー（`createSkill`）でカバーされていない可能性がある                              |

### 2. 選択肢の評価

#### 選択肢A: ファイル削除

`SkillCreateWizard.llm-generation.test.tsx` を丸ごと削除する。

| 評価軸       | 評価                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| 即時性       | 最速でデッドコードを除去できる                                                       |
| リスク       | F-2/F-3/E-4/W-8b のエッジケースが新フローでカバーされない可能性がある                |
| 工数         | 最小（ファイル削除のみ）                                                             |
| エッジケース | `SkillCreateWizard.test.tsx` の既存テスト群で既にカバー済みであれば問題なし          |
| 採用条件     | 移植価値のあるエッジケースが `SkillCreateWizard.test.tsx` で既にカバーされている場合 |

#### 選択肢B: 部分再利用（エッジケース移植）

移植価値のあるテスト（F-2, F-3, E-4, W-8b 相当）を新フロー用に書き直し、
`SkillCreateWizard.test.tsx` へ移植または本ファイルを新フロー用に再作成する。

| 評価軸     | 評価                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| カバレッジ | 新フローの重要エッジケースを明示的にカバーできる                              |
| 工数       | F-2/F-3/E-4/W-8b の 4 ケースを新フロー API に合わせて書き直す必要がある       |
| リスク     | テスト内容の再設計が必要なため、Phase 2 での調査が先行する                    |
| 採用条件   | `SkillCreateWizard.test.tsx` でカバーされていないエッジケースが確認された場合 |

### 3. 受け入れ基準の固定

| ID   | 受け入れ基準                                                              | 検証方法                                                           |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| AC-1 | `describe.skip` 状態のテストが 0 件になっている（削除または書き直し済み） | `grep -c "describe.skip"` の結果が 0                               |
| AC-2 | 選択肢B を採用した場合、新フロー用エッジケーステストが追加されている      | F-2/F-3/E-4/W-8b 相当のテストが `describe.skip` なしで存在すること |
| AC-3 | `pnpm --filter @repo/desktop test:run` が PASS する                       | CI 相当のテスト実行が全件 PASS                                     |
| AC-4 | `pnpm --filter @repo/desktop typecheck` が PASS する                      | TypeScript 型チェックが 0 error                                    |
| AC-5 | TODO コメント（`// TODO(W2-seq-03a)`）が削除されている                    | `grep -rn "TODO(W2-seq-03a)\|TODO.*W2-seq-03a"` の結果が 0 件      |

### 4. タスク分類の宣言

| 分類項目   | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスク種別 | CLEANUPタスク                                      |
| 変更範囲   | テストファイルのみ（プロダクションコード変更なし） |
| UIタスク   | 非UIタスク（UIの見た目変更なし）                   |
| 可視性     | NON_VISUAL（テストコードのみ変更）                 |
| テスト種別 | コンポーネントテスト（desktop renderer 層）        |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果    |
| ---------------------- | ---- | ------- |
| ユニットテストLine     | 80%+ | pending |
| ユニットテストBranch   | 60%+ | pending |
| ユニットテストFunction | 80%+ | pending |

## 多角的チェック観点

| 観点             | チェック内容                                                                        |
| ---------------- | ----------------------------------------------------------------------------------- |
| エッジケース欠落 | F-2/F-3/E-4/W-8b が `SkillCreateWizard.test.tsx` で既にカバーされているかを確認する |
| 削除安全性       | 選択肢A を採用する場合、削除するテストが復元不要なデッドコードであることを確認する  |
| CI 整合性        | `describe.skip` 除去後に CI が正常動作し、カバレッジが下がらないことを確認する      |
| 依存タスク整合   | W2-seq-03a 実装（`createSkill` ベースの新フロー）の完了状態を確認する               |

## サブタスク管理

1. P50チェック（describe.skip 件数・generationMode 削除確認・新フローカバレッジ確認）
2. 問題点の整理（デッドコード蓄積・CI信頼性低下・新規参入者混乱・エッジケース欠落）
3. 選択肢A（削除）vs 選択肢B（部分再利用）の評価
4. 受け入れ基準（AC-1〜AC-5）の固定
5. タスク分類の宣言（CLEANUP / テストのみ / NON_VISUAL）
6. 成果物の出力

## 成果物

| 成果物       | パス                                         | 説明                                     |
| ------------ | -------------------------------------------- | ---------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・選択肢評価・AC一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5 の検証可能な定義              |

## 完了条件

- [ ] P0チェック実施済み（対象ファイルが削除済み、または current worktree に存在する場合のみ `describe.skip` 件数確認を実施）
- [ ] P50チェック実施済み（存在時は `describe.skip` 件数、`generationMode` / `planSkill` / `executePlan` の削除済み確認を実施）
- [ ] 問題点（4点: デッドコード蓄積・CI信頼性低下・新規参入者混乱・エッジケース欠落）を整理済み
- [ ] 選択肢A/B の評価が完了し、Phase 2 への入力（方針候補）が確定している
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] タスク分類（CLEANUP / テストファイルのみ / NON_VISUAL）を宣言済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 2: 設計
