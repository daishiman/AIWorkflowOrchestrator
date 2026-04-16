# Phase 7: カバレッジチェック

## メタ情報

| 項目      | 内容                                              |
| --------- | ------------------------------------------------- |
| タスクID  | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001          |
| タスク名  | resolveExternalIntegration 複数ツール並列統合対応 |
| フェーズ  | Phase 7: カバレッジチェック                       |
| 前提Phase | Phase 6                                           |
| 後続Phase | Phase 8                                           |
| 作成日    | 2026-04-15                                        |
| 分類      | NON_VISUAL（Renderer内部ロジック変更のみ）        |

---

## 目的

`resolveExternalIntegration` のテストカバレッジが AC-6 の要件（90% 以上）を満たしていることを確認する。
Line / Branch / Function の各指標を計測し、目標値に達していない場合は Phase 6 に戻って追加テストを実施する。

---

## カバレッジ計測コマンド

### 対象ファイル限定でのカバレッジ計測

```bash
pnpm --filter @repo/desktop test --coverage \
  -- --coverage.include="src/renderer/components/skill/SkillCreateWizard.tsx"
```

### 関連テスト全体でのカバレッジ計測

```bash
pnpm --filter @repo/desktop test --coverage
```

### カバレッジレポートの確認

```bash
# HTML レポートを生成してブラウザで確認
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=html \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# レポートの出力先（デフォルト）
open apps/desktop/coverage/index.html
```

---

## 目標値と実績値

計測後に以下のテーブルを埋めること。

| 指標      | 目標値   | 実績値         | 達成判定 |
| --------- | -------- | -------------- | -------- |
| Line      | 90% 以上 | （計測後記入） | -        |
| Branch    | 90% 以上 | （計測後記入） | -        |
| Function  | 90% 以上 | （計測後記入） | -        |
| Statement | 90% 以上 | （計測後記入） | -        |

---

## カバレッジ対象スコープ

以下の関数・ロジックがカバレッジ計測の主な対象となる。

| 対象関数・ロジック                       | 対応テストケース                      | 優先度 |
| ---------------------------------------- | ------------------------------------- | ------ |
| `resolveExternalIntegration`             | TC-E1〜TC-E6 + Phase 4 テスト         | 必須   |
| `mergeIntegrations`                      | TC-E3（混在ツール）、複数ツール正常系 | 必須   |
| `isSupportedTool`                        | TC-E2（未対応ツール）、TC-E3（混在）  | 必須   |
| 空配列分岐 `if (toolNames.length === 0)` | TC-E1                                 | 必須   |
| 未対応ツールフィルタ分岐                 | TC-E2、TC-E3                          | 必須   |
| Promise 並列処理エラーハンドリング       | TC-E4                                 | 推奨   |
| 単一ツール後方互換パス                   | TC-E5                                 | 推奨   |
| 重複ツール名除去ロジック                 | TC-E6                                 | 推奨   |

---

## カバレッジ不足時の対処

90% 未達の場合は以下の手順で対処する。

### Step 1: 未カバー箇所の特定

```bash
# カバレッジレポートで未カバー行を確認
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=text-summary \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts
```

HTML レポートを開き、赤色（未カバー）の行を特定する。

### Step 2: 追加テストケースの検討

未カバー箇所に対応するテストケースを追加する。主な追加候補:

| 未カバー箇所の例                   | 追加テストケースの方針                                       |
| ---------------------------------- | ------------------------------------------------------------ |
| エラーハンドリング分岐             | `fetchToolIntegrationInfo` の reject シナリオを追加          |
| `mergeIntegrations` の各フィールド | マージ結果の各フィールドを個別にアサートするテストを追加     |
| `isSupportedTool` の境界値         | 大文字小文字・空白文字等の境界値テストを追加                 |
| 結果が1件のみの場合のマージ        | 1件のサポート済みツール + 複数の未対応ツールのシナリオを追加 |

### Step 3: Phase 6 に戻って追加テストを実施

```
Phase 6 → Phase 7（再計測）のサイクルを 90% 達成まで繰り返す
```

---

## 参照資料

| 資料名                            | パス                                                                                      | 用途                   |
| --------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| Phase 6 テスト拡充仕様書          | `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/phase-6-test-expansion.md`    | 追加テストケースの確認 |
| Phase 5 実装仕様書                | `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/phase-5-implementation.md`    | 実装スコープの確認     |
| resolveExternalIntegration テスト | `apps/desktop/src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts` | テスト実装の確認       |
| Vitest カバレッジ設定             | `apps/desktop/vitest.config.ts`                                                           | カバレッジ設定の確認   |

---

## 実行手順

1. カバレッジ計測コマンドを実行する
2. Line / Branch / Function / Statement の各指標を確認する
3. 上記「目標値と実績値」テーブルに実績値を記入する
4. 全指標が 90% 以上の場合は完了条件チェックリストを記入して Phase 8 に進む
5. 90% 未達の指標がある場合は「カバレッジ不足時の対処」を実施して再計測する

---

## 成果物

| 成果物名                | パス                                 | 説明                                |
| ----------------------- | ------------------------------------ | ----------------------------------- |
| カバレッジレポート      | `outputs/phase-7/coverage-report.md` | カバレッジ結果の canonical レポート |
| HTML カバレッジ計測結果 | `apps/desktop/coverage/index.html`   | 生成された補助レポート              |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop test --coverage` が正常に実行できた
- [ ] Line カバレッジが 90% 以上である（AC-6）
- [ ] Branch カバレッジが 90% 以上である（AC-6）
- [ ] Function カバレッジが 90% 以上である（AC-6）
- [ ] Statement カバレッジが 90% 以上である（AC-6）
- [ ] 「目標値と実績値」テーブルに実績値が記入されている
- [ ] 全テストが PASS している
- [ ] Phase 8（リファクタリング）へのブロッカーがない

---

## サブタスク管理

| #   | サブタスク                         | 状態    |
| --- | ---------------------------------- | ------- |
| 1   | カバレッジ計測コマンド実行         | pending |
| 2   | 実績値テーブルへの記入             | pending |
| 3   | 90% 未達の場合: 未カバー箇所の特定 | pending |
| 4   | 90% 未達の場合: 追加テスト実施     | pending |
| 5   | 全指標 90% 以上の達成確認          | pending |

---

## タスク100%実行確認【必須】

カバレッジチェック完了後、以下を全て確認してから Phase 8 に進む。

```bash
# 1. カバレッジ計測（対象ファイル限定）
pnpm --filter @repo/desktop test --coverage \
  -- --coverage.include="src/renderer/components/skill/SkillCreateWizard.tsx"

# 2. 全テスト PASS 確認
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# 3. 型チェック
pnpm --filter @repo/desktop typecheck
```

全指標が 90% 以上であることを確認してから次の Phase に進むこと。

---

## 次のPhase

Phase 8: リファクタリング（duplicate・navigation drift の除去）
