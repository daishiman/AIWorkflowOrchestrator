# Phase 5: 実装

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 5                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 4                              |
| 後続Phase  | Phase 6                              |
| 作成日     | 2026-04-15                           |
| ステータス | 未実施                               |

## 目的

Phase 2 の設計に基づき、`ConversationRoundStep.tsx` のTODOコメントを整理する。採用パターン（A: 削除 / B: 更新）に従い、最小限の変更でコードの意図を明確にする。

## 実行タスク

- 既存テスト回帰確認（実装前 baseline 確認）
- 採用パターンに応じた実装の実施
- 検証ケースの実行（VC-A-01〜05 または VC-B-01〜05）
- 型チェック・lint 確認
- 実装サマリーの作成

## 参照資料

| 資料名                    | パス                                                                          | 用途             |
| ------------------------- | ----------------------------------------------------------------------------- | ---------------- |
| Phase 2 設計書            | `outputs/phase-2/design.md`                                                   | 変更内容参照     |
| Phase 4 テスト仕様書      | `outputs/phase-4/test-spec.md`                                                | 検証ケース参照   |
| ConversationRoundStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 変更対象ファイル |

## 実行手順

### 0. 既存テスト回帰確認（baseline 確認）【必須】

```bash
# 変更前の既存テストを実行して baseline 確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
# 期待: 全テスト PASS（変更前の状態で）
```

### 1. パターンA: TODOコメント削除の実装

**対象ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

**変更手順**:

1. `:456` の TODOコメント行（`// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): ...`）を削除する
2. `MAIN_TOOL_BADGE_ENABLED = true` フラグの整理（Phase 2 設計書の方針に従う）

**変更前**:

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
const isMainTool = shouldShowMainToolBadge({
  questionKey: key,
  optionValue: opt,
  selectedOptions,
});
```

**変更後**:

```typescript
const isMainTool = shouldShowMainToolBadge({
  questionKey: key,
  optionValue: opt,
  selectedOptions,
});
```

### 2. パターンB: TODOコメント更新の実装

**対象ファイル**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

**変更手順**:

1. `:456` の TODOコメント行を Phase 2 設計書の更新内容に置き換える

**変更前**:

```typescript
// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001): 主ツールバッジ - resolveExternalIntegration の主ツール参照ロジック変更後に削除
```

**変更後**:

```typescript
// NOTE: 主ツールバッジは q5 で複数ツール選択時に先頭オプションに表示される。
// resolveExternalIntegration（SkillCreateWizard.tsx）が selectedOptions[0] を主ツールとして参照する
// 現行ロジックと一致しているため、バッジは現在正常に機能している。
// UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 が完了し resolveExternalIntegration の参照ロジックが変更された際に
// shouldShowMainToolBadge と MAIN_TOOL_BADGE_ENABLED フラグの削除を検討すること。
```

### 3. 検証ケースの実行

**パターンA の場合**:

```bash
# VC-A-01: TODOコメント削除の確認
grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
# 期待: 0件

# VC-A-03: 型チェック
pnpm --filter @repo/desktop typecheck
# 期待: PASS

# VC-A-04: lint
pnpm --filter @repo/desktop lint
# 期待: 0 error

# VC-A-05: 既存テスト
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
# 期待: 全テスト PASS
```

**パターンB の場合**:

```bash
# VC-B-01: 旧 TODOコメント削除の確認
grep -n "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
# 期待: 0件（旧 TODO が更新されているため）

# VC-B-03: 型チェック
pnpm --filter @repo/desktop typecheck
# 期待: PASS

# VC-B-04: lint
pnpm --filter @repo/desktop lint
# 期待: 0 error

# VC-B-05: 既存テスト
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
# 期待: 全テスト PASS
```

### 4. 実装サマリーの作成

`outputs/phase-5/implementation-summary.md` に以下を記録する：

- 採用パターン（A または B）
- 変更ファイルと変更行
- 実行した検証ケースと結果
- 変更前後の差分要約

## 統合テスト連携【必須】

| 判定項目          | 基準    | 結果 |
| ----------------- | ------- | ---- |
| baseline 確認     | PASS    | -    |
| 型チェック        | PASS    | -    |
| lint              | 0 error | -    |
| 既存テスト全 PASS | PASS    | -    |

## 多角的チェック観点

| 観点     | 確認内容                                                          |
| -------- | ----------------------------------------------------------------- |
| 矛盾     | 採用パターンと実際の変更内容が一致しているか                      |
| 漏れ     | TODOコメントの古い内容が残っていないか                            |
| 整合性   | `shouldShowMainToolBadge` 関数自体は変更されていないか            |
| 依存関係 | 他の問題タスク（TASK-SW-STREAM-001 等）との独立性が保たれているか |

## 成果物

| 成果物           | パス                                                                          | 説明                     |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------ |
| 実装対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | TODOコメント整理済み     |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`                                   | 変更内容・検証結果の要約 |

## 完了条件

- [ ] baseline 確認（既存テスト全 PASS）実施済み
- [ ] 採用パターン（A または B）に従った変更が実施済み
- [ ] VC-A-01〜05 または VC-B-01〜05 の検証が完了
- [ ] 型チェック（`pnpm typecheck`）が PASS
- [ ] lint がエラーなし
- [ ] 既存テストが全 PASS
- [ ] 実装サマリーが作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. baseline 確認（既存テスト全 PASS 確認）
2. 採用パターンの確認（Phase 2 成果物参照）
3. TODOコメントの変更実施
4. 型チェック確認
5. lint 確認
6. 既存テスト回帰確認
7. 実装サマリー作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 6: テスト拡充
