# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 7                                                                        |
| Phase名    | カバレッジ確認                                                           |
| 前提Phase  | Phase 6                                                                  |
| 後続Phase  | Phase 8                                                                  |
| ステータス | pending                                                                  |
| 作成日     | 2026-04-06                                                               |
| 機能名     | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                |
| タスクID   | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                                |
| Issue      | [#1682](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1682) |

---

## 目的

concern と dependency edge の coverage を可視化する。

Phase 4〜6 で作成・拡充したテストが、本タスクで変更したファイル・ブロックを適切にカバーしているかを定量的に確認し、品質ゲートを通過させる。

## 背景

Phase 5 の実装・Phase 6 のテスト拡充を経て、機能は動作している。本 Phase では変更ブロックのカバレッジを計測・可視化し、カバレッジゲートへの適合を確認する。

### カバレッジ対象範囲（明示）

> Feedback BEFORE-QUIT-002 対応: 変更したファイル・ブロックのみを対象とし、それ以外は対象外として明示する。

| 対象       | ファイル                                                           | 対象ブロック                                               |
| ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| 計測対象   | `packages/shared/src/ipc/channels.ts`                              | `SKILL_CREATOR_RUNTIME_CHANNELS` 追加ブロック（新規 4 行） |
| 計測対象   | `apps/desktop/src/preload/channels.ts`                             | import 変更ブロック・スプレッド変更ブロック                |
| **対象外** | `packages/shared/src/ipc/channels.ts` の既存ブロック               | 変更なし・既存テストでカバー済み                           |
| **対象外** | `apps/desktop/src/preload/channels.ts` の ALLOWED_ON_CHANNELS 以外 | 変更なし                                                   |
| **対象外** | IPC handler・renderer 側コード                                     | 本タスクのスコープ外                                       |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測

**目的**: 変更ブロックのカバレッジを定量的に計測する

**対象ファイル**:

- `packages/shared/src/ipc/channels.ts`（`SKILL_CREATOR_RUNTIME_CHANNELS` 追加ブロック）
- `apps/desktop/src/preload/channels.ts`（import 変更ブロック）

**実行コマンド**:

```bash
# shared パッケージのカバレッジ計測
pnpm --filter @repo/shared test:coverage
```

**カバレッジレポートの確認箇所**:

- `packages/shared/src/ipc/channels.ts` の行カバレッジ
- `SKILL_CREATOR_RUNTIME_CHANNELS` 定義行が "covered" になっていること
- `IPC_CHANNELS` スプレッド行が "covered" になっていること

---

### タスク2: カバレッジゲート確認

**目的**: 変更ブロックのカバレッジが定めた基準を満たしていることを確認する

**カバレッジゲート基準**:

| メトリクス        | 最低基準 | 変更ブロック目標 | 説明                                     |
| ----------------- | -------- | ---------------- | ---------------------------------------- |
| Line Coverage     | 80%以上  | 100%             | 追加した定数定義行は全行テストされること |
| Branch Coverage   | 60%以上  | N/A（分岐なし）  | 定数定義ファイルのため分岐は発生しない   |
| Function Coverage | 80%以上  | 100%             | export された定数が参照されていること    |

**備考**:

- `channels.ts` は定数定義ファイルのため Branch Coverage は N/A となる可能性がある。その場合は Line / Function のみで判定する。
- 変更ブロック（`SKILL_CREATOR_RUNTIME_CHANNELS` 追加行）は 100% カバーを目標とする。

**カバレッジ未達時の対応**:

1. カバレッジ未達の行を特定する
2. 追加テストの要否を判断する（Phase 6 のテスト拡充タスクを参照）
3. 必要な場合は本 Phase 内でテストを追加し、再計測する

---

### タスク3: governance-bundle parity テストのカバレッジ確認

**目的**: cross-layer parity テストが変更ブロックをカバーしていることを確認する

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test:coverage -- \
  src/main/services/runtime/__tests__/governance-bundle.test.ts
```

**確認内容**:

- `SKILL_CREATOR_RUNTIME_CHANNELS` の 3 チャンネルに対する parity テストが実行されていること
- shared ↔ preload 間の文字列比較がカバーされていること

---

### タスク4: カバレッジレポート作成

**目的**: カバレッジ結果を記録し、品質ゲート判定の証跡とする

**レポートテンプレート**（`outputs/phase-7/coverage-report.md` に記録）:

```markdown
## カバレッジレポート - UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

### 計測対象（変更ブロックのみ）

#### packages/shared/src/ipc/channels.ts（SKILL_CREATOR_RUNTIME_CHANNELS 追加ブロック）

| メトリクス        | 結果    | 基準値 | 判定      |
| ----------------- | ------- | ------ | --------- |
| Line Coverage     | \_\_\_% | 80%+   | PASS/FAIL |
| Branch Coverage   | N/A     | 60%+   | N/A       |
| Function Coverage | \_\_\_% | 80%+   | PASS/FAIL |

#### apps/desktop/src/preload/channels.ts（import 変更ブロック）

| メトリクス        | 結果    | 基準値 | 判定      |
| ----------------- | ------- | ------ | --------- |
| Line Coverage     | \_\_\_% | 80%+   | PASS/FAIL |
| Branch Coverage   | N/A     | 60%+   | N/A       |
| Function Coverage | \_\_\_% | 80%+   | PASS/FAIL |

### governance-bundle parity テスト

| メトリクス   | 結果   | 判定      |
| ------------ | ------ | --------- |
| 実行テスト数 | \_\_\_ | PASS/FAIL |
| PASS 数      | \_\_\_ | PASS/FAIL |

### 総合判定: PASS / FAIL
```

---

## 参照資料

| 参照資料           | パス                                                                                   | 内容                           |
| ------------------ | -------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 4 テスト     | `phase-4-test-creation.md`                                                             | 基本テスト仕様（Red フェーズ） |
| Phase 5 実装       | `phase-5-implementation.md`                                                            | 実装内容（Green フェーズ）     |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                                                            | 拡充テスト仕様                 |
| shared channels    | `packages/shared/src/ipc/channels.ts`                                                  | カバレッジ対象ファイル         |
| 前タスク Phase 7   | `completed-tasks/step-ut-sdk-07-shared-ipc-channel-contract/phase-7-coverage-check.md` | カバレッジ確認パターン参照     |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テストの再実行: shared ↔ preload 間の parity テストを含む全テストを再実行し、リグレッションがないことを確認する
- ゲート判定: カバレッジ基準を満たし、かつ全テストが PASS であることを統合テスト通過の条件とする
- カバレッジレポートは Phase 9（品質保証）のエビデンスとして引用する

---

## 成果物

| 成果物             | パス                                 | 内容                               |
| ------------------ | ------------------------------------ | ---------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ計測結果（変更ブロック） |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`     | PASS/FAIL 判定・総合評価           |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared test:coverage` が実行されている
- [ ] `pnpm --filter @repo/desktop test:coverage -- src/main/services/runtime/__tests__/governance-bundle.test.ts` が実行されている
- [ ] 変更ブロック（`SKILL_CREATOR_RUNTIME_CHANNELS` 追加行）の Line Coverage が 80% 以上である
- [ ] 変更ブロックの Function Coverage が 80% 以上である
- [ ] 変更ブロックの line/branch カバレッジが目標（Line 100%・Branch N/A）を達成している
- [ ] governance-bundle parity テストのカバレッジが確認されている
- [ ] `outputs/phase-7/coverage-report.md` にカバレッジ結果が記録されている
- [ ] `outputs/phase-7/gate-result.md` に総合判定（PASS）が記録されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `outputs/phase-7/coverage-report.md` に実際の計測結果を記録済み
- [ ] `outputs/phase-7/gate-result.md` に総合判定を記録済み

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001 --phase 7

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001 \
  --phase 7 --artifacts "coverage-report.md,gate-result.md"
```

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/phase-8-refactoring.md`
