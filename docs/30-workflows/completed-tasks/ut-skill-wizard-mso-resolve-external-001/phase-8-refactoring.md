# Phase 8: リファクタリング

## メタ情報

| 項目      | 値                                                |
| --------- | ------------------------------------------------- |
| タスクID  | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001          |
| タスク名  | resolveExternalIntegration 複数ツール並列統合対応 |
| Phase     | 8                                                 |
| 前提Phase | Phase 7                                           |
| 後続Phase | Phase 9                                           |
| 作成日    | 2026-04-15                                        |
| 分類      | NON_VISUAL（Renderer内部ロジック変更のみ）        |

---

## 目的

duplicate と navigation drift を削る。

Phase 5〜6 で追加した `resolveExternalIntegration` 関連コードについて、
重複ロジックや命名の揺れ・バッジ削除後のコード残骸を取り除き、
将来の変更（ツール追加・統合情報仕様変更）に対してコストが低い状態を維持する。
本タスクは機能追加ではなく **品質維持** のためのリファクタリングであり、
過剰な抽象化は避け、必要最小限の変更にとどめる。

---

## 変更内容記録

リファクタリングを実施した場合は以下のテーブルに記録する。実施不要と判断した場合はその理由を「理由」列に記載する。

| #   | 対象             | Before           | After            | 理由             |
| --- | ---------------- | ---------------- | ---------------- | ---------------- |
| 1   | （実装後に記録） | （実装後に記録） | （実装後に記録） | （実装後に記録） |
| 2   | （実装後に記録） | （実装後に記録） | （実装後に記録） | （実装後に記録） |
| 3   | （実装後に記録） | （実装後に記録） | （実装後に記録） | （実装後に記録） |

> このテーブルは Phase 6 の実装完了後、実際のコードを参照して埋めること。

---

## 検討観点

### 1. duplicate の除去

以下の観点で重複コードを確認する。

#### resolveExternalIntegration 内の重複ロジック

- `isSupportedTool` の判定ロジックが複数箇所に分散していないか
- `fetchToolIntegrationInfo` の呼び出しパターンが重複していないか
- エラーハンドリング（try-catch / `.catch()`）が各 Promise ごとに重複していないか

**重複除去を検討する場合**

- 同一のツール名バリデーションロジックが2箇所以上に存在する
- フォールバック処理（`defaultMergedExternalIntegration()`）の呼び出し位置が不統一

**重複除去を見送る場合（推奨）**

- 各分岐の処理が意味的に異なり、共通化によって可読性が低下する
- 重複箇所が2行以内で、関数抽出のオーバーヘッドが大きい

#### ConversationRoundStep.tsx のバッジ削除後の残骸

- バッジ削除後に未使用のインポートが残っていないか
- バッジ関連の定数（`mainToolBadgeId` 等）が残っていないか
- バッジ削除によって空になったブロック・条件分岐が残っていないか

```bash
# 未使用インポートの確認
pnpm --filter @repo/desktop lint \
  -- --rule "no-unused-vars: error" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
```

### 2. navigation drift の除去

Phase 5 でのバッジ削除・関数シグネチャ変更により、コードの論理的なまとまりが崩れていないかを確認する。

#### SkillCreateWizard.tsx の関数配置

- `resolveExternalIntegration` と `mergeIntegrations`、`isSupportedTool` の定義順序が論理的か
- ヘルパー関数が呼び出し元の近くに配置されているか（navigation drift がないか）

**確認ポイント:**

- [ ] `isSupportedTool` は `resolveExternalIntegration` の直前または同ブロック内に定義されている
- [ ] `mergeIntegrations` は `resolveExternalIntegration` の直前または直後に定義されている
- [ ] 型定義（`MergedExternalIntegration` / `ExternalToolIntegration` 等）はファイル上部または専用セクションにまとまっている

### 3. バッジ削除後のコード整理

Phase 5 で実施したバッジ削除の結果として、以下の観点でコードが整理されているかを確認する。

| 確認対象                                        | 期待状態                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------- |
| `ConversationRoundStep.tsx` の `renderQuestion` | バッジ関連コードが完全に除去され、Q5 分岐がシンプルになっている             |
| 未使用変数・定数                                | `isMainTool`、`mainToolBadgeId`、`MAIN_TOOL_BADGE_ENABLED` 等が残っていない |
| 未使用インポート                                | バッジ削除によって不要になったインポートが除去されている                    |
| コメント残骸                                    | `// Q5 専用の主ツール判定` 等のコメントが削除されている                     |

```bash
# バッジ関連コードの残骸確認
grep -n "mainTool\|MAIN_TOOL\|主ツール\|isMainTool\|mainToolBadge" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
# → 0件であること
```

### 4. 型定義の改善

Phase 5 で追加した型定義が適切かを確認する。

#### `MergedExternalIntegration` 型の見直し

- フィールド名が既存の `ExternalToolIntegration` との一貫性を保っているか
- オプショナル（`?`）と必須フィールドの区分が適切か
- `tools: ExternalToolIntegration[]` フィールドが適切に定義されているか

**命名の一貫性チェックリスト:**

- [ ] 新規追加した変数・定数が camelCase である
- [ ] 型名が PascalCase である
- [ ] 既存コードの命名スタイルと揃っている
- [ ] `tools` が単数形 (`toolName`) と衝突していない

#### 型エクスポートの整理

- `MergedExternalIntegration` が必要な箇所のみにエクスポートされているか
- 型定義ファイルの肥大化を防ぐため、ローカルスコープで十分な場合はエクスポートしない

---

## 注意事項

**小規模タスクのため過剰な抽象化を避ける。**

以下は本タスクでは実施しない。

- `resolveExternalIntegration` の独立ファイル化（`resolveExternalIntegration.ts` 等の新規ファイル作成）
- ツール統合情報取得ロジックのカスタムフック化
- 汎用的なツール統合フレームワークの設計
- `mergeIntegrations` の独立コンポーネント化

これらの抽象化が必要になった場合は、別タスクとして起票・計画する。

---

## 参照資料

| 資料名                            | パス                                                                                            | 用途                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 5 実装仕様書                | `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/phase-5-implementation.md`          | バッジ削除手順・実装スコープの確認     |
| Phase 6 テスト拡充仕様書          | `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/phase-6-test-expansion.md`          | テスト対象の確認                       |
| Phase 7 カバレッジチェック仕様書  | `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/phase-7-coverage-check.md`          | カバレッジ達成状況の確認               |
| 主ツールUI Phase 8 仕様書（参考） | `docs/30-workflows/completed-tasks/ut-skill-wizard-mso-main-tool-ui-001/phase-8-refactoring.md` | リファクタリング観点の参考フォーマット |
| SkillCreateWizard.tsx             | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                              | リファクタリング対象ファイル           |
| ConversationRoundStep.tsx         | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                   | バッジ削除後のコード整理対象           |

---

## 実行手順

1. `SkillCreateWizard.tsx` を読み込み、重複ロジック・navigation drift を確認する
2. `ConversationRoundStep.tsx` を読み込み、バッジ削除後の残骸を確認する
3. 修正が必要な箇所を特定し、上記「変更内容記録」テーブルに記録する
4. 最小限のリファクタリングを実施する
5. テスト・型チェック・Lint を実行して品質を確認する
6. 「変更内容記録」テーブルに実施内容を記入する

---

## 実行コマンド

### リファクタリング後の品質確認

```bash
# テスト
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

### バッジ削除後の残骸確認

```bash
# バッジ関連コードの残骸確認（0件であること）
grep -n "mainTool\|MAIN_TOOL\|主ツール\|isMainTool\|mainToolBadge" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# TODO コメントの残留確認（0件であること）
grep -rn "TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)" \
  apps/desktop/src/renderer/components/skill/
```

---

## 成果物

| 成果物名                          | パス                                                                                | 説明                                               |
| --------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- |
| SkillCreateWizard.tsx（修正）     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                  | duplicate・navigation drift 除去後のファイル       |
| ConversationRoundStep.tsx（修正） | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`       | バッジ削除後のコード整理・残骸除去後のファイル     |
| 変更内容記録テーブル（本文書）    | `docs/30-workflows/ut-skill-wizard-mso-resolve-external-001/phase-8-refactoring.md` | 本仕様書の「変更内容記録」テーブルに実施内容を記入 |

---

## 完了条件

- [ ] 「変更内容記録」テーブルが実施内容（または実施不要の理由）で埋まっている
- [ ] `SkillCreateWizard.tsx` に重複ロジックがない
- [ ] `ConversationRoundStep.tsx` にバッジ削除後の残骸コードがない（未使用変数・定数・インポート）
- [ ] `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントが0件である
- [ ] バッジ関連コード（`isMainTool`・`mainToolBadgeId`・`MAIN_TOOL_BADGE_ENABLED` 等）が0件である
- [ ] 型定義の命名が一貫している（camelCase / PascalCase）
- [ ] ヘルパー関数の配置が論理的で navigation drift がない
- [ ] 全テストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] Phase 9 へのブロッカーがない

---

## サブタスク管理

| #   | サブタスク                                 | 状態    |
| --- | ------------------------------------------ | ------- |
| 1   | SkillCreateWizard.tsx の重複ロジック確認   | pending |
| 2   | ConversationRoundStep.tsx の残骸コード確認 | pending |
| 3   | navigation drift の確認・修正              | pending |
| 4   | 型定義の命名一貫性確認                     | pending |
| 5   | 変更内容記録テーブルへの記入               | pending |
| 6   | テスト・型チェック・Lint の実行・確認      | pending |

---

## タスク100%実行確認【必須】

リファクタリング完了後、以下を全て確認してから Phase 9 に進む。

```bash
# 1. テスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/resolveExternalIntegration.test.ts

# 2. 型チェック
pnpm --filter @repo/desktop typecheck

# 3. Lint
pnpm --filter @repo/desktop lint

# 4. バッジ残骸確認（0件であること）
grep -n "mainTool\|MAIN_TOOL\|isMainTool\|mainToolBadge" \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# 5. TODO コメント残留確認（0件であること）
grep -rn "TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)" \
  apps/desktop/src/renderer/components/skill/
```

---

## 次のPhase

Phase 9: 品質保証
