# UT-EXEC-02 RuntimePolicyResolver.ts の 4状態化 - タスク指示書

## メタ情報

```yaml
issue_number: 1417
```

## メタ情報

| 項目         | 内容                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-EXEC-02                                                                                                 |
| タスク名     | RuntimePolicyResolver.ts の 4状態化                                                                        |
| 分類         | 機能拡張                                                                                                   |
| 対象機能     | RuntimePolicyResolver / execution-capability 統合                                                          |
| 優先度       | 高                                                                                                         |
| 見積もり規模 | 中規模                                                                                                     |
| ステータス   | 未実施                                                                                                     |
| 発見元       | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 Phase 2 design-summary.md / Phase 5 実装スコープ |
| 発見日       | 2026-03-20                                                                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Task01（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001）で `packages/shared/src/types/execution-capability.ts` に以下の pure function と型定義を確立した:

- `AccessCapability`: `"integratedRuntime" | "terminalSurface" | "both" | "none"` の4状態
- `resolveCapability()`: 入力条件から `AccessCapability` を導出する関数（Concern A）
- `resolveUiState()`: `AccessCapability` から UI 表示状態を導出する関数（Concern B）
- `resolveCtaContract()`: CTA 契約を導出する関数（Concern C）
- `assertNoSilentFallback()`: P62 対策の enforcement ガード

しかし、現状の `RuntimePolicyResolver.ts` は旧来の2状態（api-key / subscription の二択）のまま残存しており、Task01 で確立した4状態モデルと統合されていない。

### 1.2 問題点・課題

1. **2状態と4状態の不整合**: `RuntimePolicyResolver.ts` は `api-key` / `subscription` の二択で判定しているが、実際の実行能力は `integratedRuntime` / `terminalSurface` / `both` / `none` の4状態で表現される必要がある
2. **語彙ドリフト**: `RuntimePolicyResolver.ts` 内で旧 `authMode` 語彙（変数名・型名）が残存しており、新 `execution responsibility` / `capability` 語彙と混在している
3. **P62 enforcement の未適用**: `assertNoSilentFallback()` が `RuntimePolicyResolver.ts` に組み込まれていないため、Provider/Model 未選択時に DEFAULT_CONFIG へ暗黙 fallback するリスクが残存している
4. **中央 authority の不在**: `resolveCapability()` が `packages/shared` に存在するにもかかわらず、`RuntimePolicyResolver.ts` が独自の判定ロジックを持っているため、判定ロジックが分散している

### 1.3 放置した場合の影響

- `RuntimePolicyResolver.ts` と `execution-capability.ts` で判定結果が矛盾し、UI 表示と実際の実行可能状態が不一致になる
- P62（DEFAULT_CONFIG への暗黙 fallback）が enforcement されないまま残存し、ユーザーが意図しない AI モデルでリクエスト送信される
- 旧語彙（`authMode`）と新語彙（`capability`）の混在により、後続タスクの実装者が誤った前提でコードを書くリスクがある
- 4状態モデルに基づく CTA 契約（ボタンラベル・アクション）が正しく導出されず、UI/UX の品質が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

`RuntimePolicyResolver.ts` を4状態モデルの中央 authority として再設計し、`resolveCapability()` / `assertNoSilentFallback()` を組み込むことで、実行能力の判定ロジックを単一箇所に集約する。

### 2.2 最終ゴール

1. `RuntimePolicyResolver.ts` が `resolveCapability()` を呼び出し、`AccessCapability`（4状態）を返すようになっている
2. `assertNoSilentFallback()` が `RuntimePolicyResolver.ts` の判定パイプラインに組み込まれ、capability が `"none"` のとき integratedRuntime への暗黙遷移が例外で阻止される
3. 旧語彙（`authMode` 系の変数名・型名）が `capability` 系に統一されている
4. `RuntimePolicyResolver.ts` の呼び出し元が4状態に対応したハンドリングを行っている

### 2.3 スコープ

#### 含むもの

- `RuntimePolicyResolver.ts` の4状態化リファクタリング
- `resolveCapability()` の組み込み（`execution-capability.ts` からの import）
- `assertNoSilentFallback()` の enforcement 組み込み
- 旧語彙（`authMode`）から新語彙（`capability`）への変数名・型名統一
- `RuntimePolicyResolver.ts` の呼び出し元の修正（4状態対応）
- 対応するユニットテストの作成・更新
- Phase 12 ドキュメント更新

#### 含まないもの

- `execution-capability.ts` 自体の型定義・関数の変更（Task01 で確立済み）
- Renderer 側の UI コンポーネント実装（CTA ボタンの実装は別タスク）
- `resolveUiState()` / `resolveCtaContract()` の Renderer 側統合（別タスク）
- Electron IPC ハンドラの新規追加

### 2.4 成果物

| 成果物                                        | パス / 説明                                            |
| --------------------------------------------- | ------------------------------------------------------ |
| リファクタリング済み RuntimePolicyResolver.ts | 既存ファイルの更新                                     |
| 呼び出し元の修正                              | `RuntimePolicyResolver` を参照している全ファイルの更新 |
| ユニットテスト                                | `RuntimePolicyResolver` の4状態判定を網羅するテスト    |
| Phase 12 ドキュメント                         | `docs/30-workflows/` 配下の Phase 成果物               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

1. Task01（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001）が完了し、`packages/shared/src/types/execution-capability.ts` が main ブランチにマージされていること
2. `execution-capability.ts` のテスト（`execution-capability-contract.test.ts` 等）が全て PASS していること
3. 現在の `RuntimePolicyResolver.ts` の位置と内容を `grep -rn "RuntimePolicyResolver" apps/desktop/src/` で特定済みであること

### 3.2 依存タスク

| タスクID                                                  | 状態 | 依存内容                                           |
| --------------------------------------------------------- | ---- | -------------------------------------------------- |
| TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 | 完了 | `execution-capability.ts` の型定義と pure function |

### 3.3 推奨アプローチ

以下の3ステップで段階的にリファクタリングする:

**Step 1: 現状調査と影響範囲特定**

```bash
# RuntimePolicyResolver の位置と使用箇所を特定
grep -rn "RuntimePolicyResolver" apps/desktop/src/
# authMode 語彙の残存箇所を特定
grep -rn "authMode" apps/desktop/src/main/ --include="*.ts"
# 現在の判定ロジックを確認
cat apps/desktop/src/main/**/RuntimePolicyResolver*.ts
```

**Step 2: resolveCapability() 組み込み + 語彙統一**

1. `RuntimePolicyResolver.ts` の import に `resolveCapability`, `assertNoSilentFallback`, `AccessCapability` を追加
2. 既存の2状態判定ロジックを `resolveCapability()` 呼び出しに置換
3. `authMode` 変数名を `capability` に、型名を `AccessCapability` に統一
4. `assertNoSilentFallback()` を判定パイプラインの最終段に組み込み

**Step 3: 呼び出し元の4状態対応**

1. `grep -rn "RuntimePolicyResolver" apps/desktop/src/` で全呼び出し元を特定
2. 各呼び出し元で戻り値を `AccessCapability`（4状態）として処理するように修正
3. `switch` 文で4状態を網羅的にハンドリング（`Record<AccessCapability, ...>` パターン推奨）

---

## 4. 実行手順

### Phase 1: 要件定義

1. `RuntimePolicyResolver.ts` の現在の位置・内容・呼び出し元を全て特定する
2. 旧2状態（api-key / subscription）から新4状態（integratedRuntime / terminalSurface / both / none）への対応表を作成する
3. `assertNoSilentFallback()` の組み込み箇所（判定パイプラインのどの段階で呼ぶか）を決定する
4. 受入基準を定義する

### Phase 2: 設計

1. `RuntimePolicyResolver.ts` のリファクタリング後のインターフェース設計
   - 入力: `ExecutionCapabilityInput`（apiKeyValid, subscriptionValid, apiKeyDegraded）
   - 出力: `AccessCapability`（4状態）
   - enforcement: `assertNoSilentFallback()` 呼び出し
2. 呼び出し元の修正設計（各呼び出し元で4状態をどう処理するか）
3. 語彙統一マッピング表の作成（旧名 -> 新名）

### Phase 3: 設計レビュー

1. 語彙ドリフトの3方向チェック:
   - `execution-capability.ts` の型名・関数名
   - `RuntimePolicyResolver.ts` のリファクタリング後の変数名・型名
   - 呼び出し元のコード内での参照名
2. 4状態の網羅性確認（`Record<AccessCapability, ...>` パターンで漏れがないか）
3. `assertNoSilentFallback()` の組み込み位置の妥当性確認

### Phase 4: テスト作成

1. `RuntimePolicyResolver` の4状態判定テスト（各入力パターンに対する期待出力）
   - `{ apiKeyValid: true, subscriptionValid: false }` -> `"integratedRuntime"`
   - `{ apiKeyValid: false, subscriptionValid: true }` -> `"terminalSurface"`
   - `{ apiKeyValid: true, subscriptionValid: true }` -> `"both"`
   - `{ apiKeyValid: false, subscriptionValid: false }` -> `"none"`
   - `{ apiKeyValid: true, subscriptionValid: false, apiKeyDegraded: true }` -> `"none"`
   - `{ apiKeyValid: true, subscriptionValid: true, apiKeyDegraded: true }` -> `"terminalSurface"`
2. `assertNoSilentFallback()` enforcement テスト
   - capability が `"none"` のとき例外が throw されること
   - capability が `"integratedRuntime"` / `"terminalSurface"` / `"both"` のとき例外が throw されないこと
3. 呼び出し元の4状態ハンドリングテスト
4. 旧語彙（`authMode`）がコード内に残存していないことの grep 検証テスト

### Phase 5: 実装

1. `RuntimePolicyResolver.ts` のリファクタリング
2. 呼び出し元の修正
3. 語彙統一

### Phase 6: テスト拡充

1. 境界値テスト（`apiKeyDegraded` が `undefined` / `false` / `true` の各パターン）
2. 呼び出し元の統合テスト

### Phase 7: カバレッジ確認

- Line Coverage: 80% 以上
- Branch Coverage: 60% 以上
- Function Coverage: 80% 以上
- 未達の場合は Phase 6 に戻る

### Phase 8: リファクタリング

1. 語彙ドリフトの最終チェック（`grep -rn "authMode" apps/desktop/src/main/`）
2. 不要な import / 未使用変数の削除

### Phase 9: 品質検証

```bash
pnpm lint
pnpm typecheck
pnpm --filter @repo/desktop test
pnpm --filter @repo/shared test
```

### Phase 10: 最終レビュー

1. 4状態の網羅性（switch 文 / Record パターンで全状態がハンドルされているか）
2. `assertNoSilentFallback()` の enforcement が正しく機能しているか
3. 旧語彙の完全排除確認
4. テストカバレッジ基準の充足確認

### Phase 11: 手動テスト

1. API キーのみ設定 -> integratedRuntime として動作すること
2. サブスクリプションのみ設定 -> terminalSurface として動作すること
3. 両方設定 -> both として動作すること
4. 両方未設定 -> none として動作し、`assertNoSilentFallback()` が発動すること
5. API キーが degraded 状態 -> terminalSurface に降格すること

### Phase 12: ドキュメント

1. Task 1: 実装ガイド作成（`implementation-guide.md`）
2. Task 2: システム仕様書更新
   - `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方を更新（P1/P25 対策）
   - `SKILL.md` 変更履歴更新（2ファイル）
   - `topic-map.md` 再生成（P2/P27 対策）
   - `.claude/skills/` と `.agents/skills/` の Mirror Sync（rsync + diff 確認）
3. Task 3: `documentation-changelog.md` 作成
4. Task 4: 未タスク検出・`unassigned-task-report.md` 作成（0件でも必須）

### Phase 13: 完了

1. 成果物最終確認
2. PR 準備

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `RuntimePolicyResolver.ts` が `resolveCapability()` を呼び出し、`AccessCapability`（4状態）を返す
- [ ] `assertNoSilentFallback()` が判定パイプラインに組み込まれ、capability が `"none"` のとき例外が throw される
- [ ] 全呼び出し元が4状態（integratedRuntime / terminalSurface / both / none）を網羅的にハンドリングしている
- [ ] `apiKeyDegraded` フラグによる降格ロジックが正しく動作する

### 品質要件

- [ ] 旧語彙（`authMode`）が `RuntimePolicyResolver.ts` 及びその呼び出し元から完全に排除されている
- [ ] `grep -rn "authMode" apps/desktop/src/main/` の結果に `RuntimePolicyResolver` 関連の一致がゼロ件
- [ ] Line Coverage 80% 以上、Branch Coverage 60% 以上、Function Coverage 80% 以上
- [ ] `pnpm lint` / `pnpm typecheck` が PASS する
- [ ] `pnpm --filter @repo/desktop test` / `pnpm --filter @repo/shared test` が全て PASS する

### ドキュメント要件

- [ ] `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方が更新されている
- [ ] `SKILL.md` 変更履歴が更新されている（2ファイル）
- [ ] `topic-map.md` が再生成されている
- [ ] `.claude/skills/` と `.agents/skills/` が同期されている（diff 0件）
- [ ] `documentation-changelog.md` が作成されている
- [ ] `unassigned-task-report.md` が作成されている（0件でも必須）

---

## 6. 検証方法

### 自動検証

```bash
# 1. 型チェック
pnpm typecheck

# 2. Lint
pnpm lint

# 3. ユニットテスト（shared パッケージ）
pnpm --filter @repo/shared test

# 4. ユニットテスト（desktop パッケージ）
pnpm --filter @repo/desktop test

# 5. 旧語彙残存チェック
grep -rn "authMode" apps/desktop/src/main/ --include="*.ts" | grep -i "RuntimePolicyResolver"
# 期待結果: 0件

# 6. カバレッジ確認
cd apps/desktop && pnpm vitest run --coverage src/main/**/RuntimePolicyResolver*
```

### 手動検証

1. API キーのみ設定した状態でアプリを起動し、RuntimePolicyResolver が `"integratedRuntime"` を返すことをログで確認
2. サブスクリプションのみ設定した状態で `"terminalSurface"` が返ることを確認
3. 両方設定した状態で `"both"` が返ることを確認
4. 両方未設定の状態で `assertNoSilentFallback()` によるエラーが発生することを確認

---

## 7. リスクと対策

| リスク                                          | 影響度 | 発生確率 | 対策                                                                                                               |
| ----------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| 語彙ドリフトの見落とし                          | 中     | 高       | Phase 3 で3方向チェック（execution-capability.ts / RuntimePolicyResolver.ts / 呼び出し元）を実施                   |
| 呼び出し元の修正漏れ                            | 高     | 中       | `grep -rn "RuntimePolicyResolver" apps/desktop/src/` で全箇所を事前特定し、チェックリストで管理                    |
| `assertNoSilentFallback()` の組み込み位置の誤り | 高     | 低       | Phase 3 設計レビューで enforcement 発動タイミングを検証                                                            |
| 既存テストの大規模修正（P35 再発）              | 中     | 高       | `grep -rn "RuntimePolicyResolver" **/*.test.ts` で影響テストファイルを事前特定し、モック修正計画を立てる           |
| Mirror Sync 不整合                              | 低     | 中       | Phase 12 で `rsync -avz --checksum ./.claude/skills/ ./.agents/skills/` + `diff -qr` で 0 差分確認                 |
| `resolveUiState` overload の誤用                | 中     | 中       | RuntimePolicyResolver からは CapabilityContext 版（overload 1）を使用し、UiStateResult として blockedReason も取得 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                            | パス                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| execution-capability.ts（型定義・関数） | `packages/shared/src/types/execution-capability.ts`                                   |
| execution-capability-contract.test.ts   | `packages/shared/src/types/__tests__/execution-capability-contract.test.ts`           |
| cta-contract.test.ts                    | `packages/shared/src/types/__tests__/cta-contract.test.ts`                            |
| ui-state-vocabulary-contract.test.ts    | `packages/shared/src/types/__tests__/ui-state-vocabulary-contract.test.ts`            |
| execution-capability-regression.test.ts | `packages/shared/src/types/__tests__/execution-capability-regression.test.ts`         |
| Task01 ワークフロー                     | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/`                  |
| Task01 Phase 成果物                     | `docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/` |

### 関連タスク

| タスクID                                                  | 関係 | 内容                           |
| --------------------------------------------------------- | ---- | ------------------------------ |
| TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 | 前提 | execution-capability.ts の確立 |
| TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                | 関連 | AI Runtime 設定の整流          |

### 過去の教訓（Pitfall 参照）

| Pitfall ID | 内容                              | 本タスクでの適用                                                               |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------ |
| P1/P25     | LOGS.md 2ファイル更新漏れ         | Phase 12 で aiworkflow-requirements と task-specification-creator の両方を更新 |
| P2/P27     | topic-map.md 再生成忘れ           | Phase 12 で `node scripts/generate-index.js` を必ず実行                        |
| P35        | DI 追加時のテストモック大規模修正 | 事前に影響テストファイルを grep で特定し、修正計画を立てる                     |
| P62        | DEFAULT_CONFIG への暗黙 fallback  | `assertNoSilentFallback()` で enforcement                                      |

---

## 9. 備考 - 実装時の苦戦箇所と教訓

### 教訓 1: 語彙ドリフト（auth mode -> execution responsibility）

旧パック `ai-runtime-authmode-unification` での `auth mode` 語彙が残存し、新 `execution responsibility` 語彙と混在するリスクがある。`RuntimePolicyResolver.ts` を更新する際に `authMode` という変数名や型名を `capability` 系に統一する必要がある。

**具体的な対処法**: Phase 3（設計レビュー）で以下の3方向チェックを実施する:

1. `packages/shared/src/types/execution-capability.ts` の型名・関数名を基準リストとして抽出
2. `RuntimePolicyResolver.ts` のリファクタリング後のコードで基準リストと一致する語彙が使われているか確認
3. 呼び出し元のコードで旧語彙（`authMode`, `auth-mode`, `AuthMode`）が残存していないか `grep` で検証

```bash
# 旧語彙の残存検索
grep -rn "authMode\|auth-mode\|AuthMode" apps/desktop/src/main/ --include="*.ts"
```

### 教訓 2: resolveUiState の overload パターン

`resolveUiState` は2つの overload を持つ:

- **overload 1（CapabilityContext 版）**: `resolveUiState(context: CapabilityContext): UiStateResult` - `blockedReason` と `blockedAction` も含む詳細な結果を返す
- **overload 2（simple 版）**: `resolveUiState(capability: AccessCapability, conditions: { hasCredentialPath: boolean }): UiState` - `UiState` 文字列のみ返す

RuntimePolicyResolver からは **overload 1（CapabilityContext 版）を使うことを推奨**する。理由: `UiStateResult` として `blockedReason` / `blockedAction` も取得できるため、後続の CTA 契約導出や UI 表示に必要な情報が欠落しない。simple 版を使うと `blockedReason` が失われ、UI 側で別途取得する必要が生じる。

### 教訓 3: P62（DEFAULT_CONFIG への暗黙 fallback）

Provider/Model が未選択の場合に `DEFAULT_CONFIG` へ暗黙 fallback すると、ユーザーが意図しない AI モデルでリクエストが送信される。開発環境と本番環境で異なるデフォルトが設定されている場合、本番で予期しない動作になる。意図しない課金が発生する場合もある。

**具体的な組み込み方法**: `RuntimePolicyResolver` の判定パイプラインの最終段（`resolveCapability()` の結果取得後、呼び出し元に返す前）で `assertNoSilentFallback(capability)` を呼ぶ。capability が `"none"` のとき、例外が throw されて暗黙遷移が阻止される。

```typescript
// RuntimePolicyResolver 内のイメージ
const capability = resolveCapability(input);
assertNoSilentFallback(capability); // "none" のとき例外
return capability;
```

### 教訓 4: Mirror Sync 不整合

`.claude/skills/` と `.agents/skills/` で差分が残存する問題が過去に発生している。Phase 12 で rsync + diff 確認で同期を完了する必要がある。

**同期コマンド**:

```bash
rsync -avz --checksum ./.claude/skills/ ./.agents/skills/
diff -qr ./.claude/skills/ ./.agents/skills/
# 期待結果: 差分 0 件
```

### 教訓 5: LOGS.md 2ファイル更新漏れ（P1/P25）

`aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の両方を同期する必要がある。片方だけ更新して完了とするミスが過去に複数回発生している。Phase 12 Task 2 Step 1-A で明示的にチェックする。

**確認コマンド**:

```bash
# 両方の LOGS.md が更新されているか確認
git diff --stat -- .claude/skills/aiworkflow-requirements/LOGS.md
git diff --stat -- .claude/skills/task-specification-creator/LOGS.md
# 両方に差分があること
```
