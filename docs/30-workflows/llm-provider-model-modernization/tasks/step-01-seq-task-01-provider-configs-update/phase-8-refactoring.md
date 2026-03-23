# Phase 8: リファクタリング（TDD: Refactor）— PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase番号  | 8                         |
| 機能名     | provider-configs-update   |
| タスクID   | TASK-LLM-MOD-01           |
| 作成日     | 2026-03-23                |
| 依存 Phase | Phase 7（カバレッジ確認） |

## 目的

Phase 5 の実装コードを、全テストを通した状態を維持しながら品質改善する（TDD: Refactor フェーズ）。コードの可読性・保守性を向上させる変更のみを行い、機能変更は行わない。

## 実行タスク

### Task 8-1: リファクタリング対象の確認

`apps/desktop/src/main/handlers/llm.ts` を読み込み、以下の観点でリファクタリング候補を確認する：

#### 確認観点

1. **型定義の位置**: `PROVIDER_CONFIGS` のインライン型定義を型エイリアスに抽出するか検討する
2. **description 文字列の長さ**: 各モデルの description が1行に収まっているか（可読性）
3. **コメントの一貫性**: 既存のコメント形式（JSDoc スタイル）と一致しているか
4. **未使用 import**: `inferProviderId` の変更なしで未使用になった import がないか

### Task 8-2: リファクタリング候補の評価

#### 候補 R-A: `ProviderModel` 型エイリアスの抽出

評価: **実施しない**

理由: `PROVIDER_CONFIGS` の型定義はファイル内ローカルで使用されており、外部公開しない。インライン型定義のままでスコープが明確。型エイリアスへの抽出は可読性の向上が限定的であり、変更コストに見合わない。

#### 候補 R-B: `description` フィールドの確認

評価: **Phase 5 の実装を確認するのみ**

確認事項:

- 各 `description` 文字列が空文字列でないこと（AC-08 の再確認）
- `description` 文字列が全角・半角の混在を含まないこと（統一性）

#### 候補 R-C: `PROVIDER_CONFIGS` コメントの更新

評価: **実施する**

既存の JSDoc コメント `/** プロバイダー設定（静的定義）*/` を `/** プロバイダー設定（静的定義）\n * 最終更新: 2026-03-23（TASK-LLM-MOD-01）*/` に更新し、変更履歴をコードに残す。

### Task 8-3: コメント更新の実施

`apps/desktop/src/main/handlers/llm.ts` の `PROVIDER_CONFIGS` 直前のコメント（L30〜L32）を以下に更新する：

```typescript
/**
 * プロバイダー設定（静的定義）
 * 最終更新: 2026-03-23（TASK-LLM-MOD-01）
 */
```

### Task 8-4: Prettier フォーマット確認

実装後に Prettier フォーマットが自動適用されていることを確認する（PostToolUse Hook が実行済みであること）。手動での確認が必要な場合：

```bash
cd apps/desktop && pnpm prettier --check src/main/handlers/llm.ts
```

フォーマットエラーがある場合：

```bash
cd apps/desktop && pnpm prettier --write src/main/handlers/llm.ts
```

### Task 8-5: リファクタリング後のテスト確認

リファクタリング後にテストが全て PASS していることを確認する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
```

期待する結果: 全テスト PASS（FAIL が 0 件）

## 参照資料

| 資料名           | パス                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Phase 5 実装     | `docs/30-workflows/llm-provider-model-modernization/tasks/step-01-seq-task-01-provider-configs-update/phase-5-implementation.md` |
| 実装対象ファイル | `apps/desktop/src/main/handlers/llm.ts`                                                                                          |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                                                               |

## 成果物

| 成果物                   | パス                                    | 形式       |
| ------------------------ | --------------------------------------- | ---------- |
| リファクタリング済み実装 | `apps/desktop/src/main/handlers/llm.ts` | TypeScript |

## 完了条件

- [ ] `apps/desktop/src/main/handlers/llm.ts` を Read で確認し、リファクタリング候補を評価した
- [ ] 候補 R-A（型エイリアス抽出）を実施しないと判断し、理由を記録した
- [ ] 候補 R-B（description 確認）で全 description が空でないことを確認した
- [ ] 候補 R-C（コメント更新）を実施した
- [ ] Prettier フォーマットを確認した
- [ ] リファクタリング後に全テストが PASS していることを確認した
- [ ] 機能変更（モデルID・contextWindow・isDefault の変更）が発生していないことを確認した

## 統合テスト連携

リファクタリング後に handlers ディレクトリ全体でテストが通ることを確認する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/
```

## 次の Phase

Phase 9: 品質保証（`phase-9-quality-assurance.md`）
