# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 7                                          |
| Phase名    | カバレッジ確認                             |
| 前提Phase  | Phase 6                                    |
| 後続Phase  | Phase 8（該当する場合）                    |
| ステータス | 未実施                                     |
| 作成日     | 2026-03-29                                 |
| 機能名     | step-ut-sdk-07-shared-ipc-channel-contract |

---

## 目的

テストカバレッジを計測し、プロジェクト基準を達成していることを検証する。カバレッジが不足している場合は、追加テストの必要性を判断する。

## 背景

Phase 4〜6 で作成・拡充したテストのカバレッジを定量的に確認する。本タスクで変更した `packages/shared/src/ipc/channels.ts` および関連テストファイルが対象。カバレッジ基準を満たすことで、品質ゲートを通過する。

---

## 実行タスク

### タスク1: shared パッケージのカバレッジ計測

**目的**: `packages/shared/src/ipc/channels.ts` のテストカバレッジを計測する

**実行コマンド**:

```bash
pnpm --filter @repo/shared test -- --coverage --run
```

**確認対象ファイル**: `packages/shared/src/ipc/channels.ts`

**カバレッジ基準**:

| メトリクス | 基準値 | 説明                                       |
| ---------- | ------ | ------------------------------------------ |
| Line       | 80%+   | 実行された行の割合                         |
| Branch     | 60%+   | 条件分岐のカバレッジ（定数のため高い想定） |
| Function   | 80%+   | 呼び出された関数の割合                     |

**備考**: `channels.ts` は定数定義ファイルのため、Branch カバレッジは N/A（分岐なし）となる可能性がある。その場合は Line / Function のみで判定する。

---

### タスク2: channels.ts の Line/Branch/Function カバレッジ確認

**目的**: カバレッジレポートから `channels.ts` の個別メトリクスを抽出・確認する

**確認内容**:

- `channels.ts` の Line カバレッジが 80% 以上であること
- `channels.ts` の Branch カバレッジが 60% 以上であること（分岐がある場合）
- `channels.ts` の Function カバレッジが 80% 以上であること
- 新規追加した `APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` の行がカバーされていること

**カバレッジ不足時の対応**:

- カバレッジ未達の行を特定し、追加テストの要否を判断する
- 追加テストが必要な場合は、本 Phase 内で対応する

---

### タスク3: governance-bundle.test.ts の観点5 カバレッジ確認

**目的**: cross-layer parity テスト（観点5）のカバレッジを確認する

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --coverage --run src/main/services/runtime/__tests__/governance-bundle.test.ts
```

**確認内容**:

- 観点5 の parity テストが実行されていること
- shared ↔ desktop 間の全チャネル比較がカバーされていること

---

### タスク4: カバレッジレポート作成

**目的**: カバレッジ結果を記録し、品質ゲート判定の証跡とする

**レポート内容**:

```markdown
## カバレッジレポート

### packages/shared/src/ipc/channels.ts

| メトリクス | 結果    | 基準値 | 判定  |
| ---------- | ------- | ------ | ----- |
| Line       | \_\_\_% | 80%+   | ✅/❌ |
| Branch     | \_\_\_% | 60%+   | ✅/❌ |
| Function   | \_\_\_% | 80%+   | ✅/❌ |

### governance-bundle.test.ts 観点5

| メトリクス   | 結果   | 判定  |
| ------------ | ------ | ----- |
| 実行テスト数 | \_\_\_ | ✅/❌ |
| PASS         | \_\_\_ | ✅/❌ |

### 総合判定: PASS / FAIL
```

---

## 参照資料

| 参照資料           | パス                                  | 内容                   |
| ------------------ | ------------------------------------- | ---------------------- |
| Phase 4 テスト     | `phase-4-test-creation.md`            | 基本テスト仕様         |
| Phase 5 実装       | `phase-5-implementation.md`           | 実装内容               |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`           | 拡充テスト仕様         |
| shared channels    | `packages/shared/src/ipc/channels.ts` | カバレッジ対象ファイル |

---

## 統合テスト連携（Phase 7）

- 統合テストの再実行: shared ↔ desktop 間の parity テストを含む全テストを再実行し、リグレッションがないことを確認
- ゲート判定: カバレッジ基準を満たし、かつ全テストが PASS であることを統合テスト通過の条件とする
- カバレッジレポートは CI/CD パイプラインのアーティファクトとしても利用可能

---

## 成果物

| 成果物             | パス                                 | 内容               |
| ------------------ | ------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ計測結果 |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`     | PASS/FAIL 判定     |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared test -- --coverage` が実行されている
- [ ] `channels.ts` の Line カバレッジが 80% 以上である
- [ ] `channels.ts` の Branch カバレッジが 60% 以上である（分岐がある場合）
- [ ] `channels.ts` の Function カバレッジが 80% 以上である
- [ ] `governance-bundle.test.ts` 観点5 のカバレッジが確認されている
- [ ] カバレッジレポートが作成されている
- [ ] 総合判定が PASS である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

Phase 8（該当する場合）: リファクタリング / ドキュメント → 該当仕様書を参照
