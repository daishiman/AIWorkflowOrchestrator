# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 値                                        |
| ---------- | ----------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| Phase      | 4 / 13                                    |
| 前Phase    | Phase 3（設計レビュー）                   |
| 次Phase    | Phase 5（実装）                           |
| 作成日     | 2026-02-27                                |
| ステータス | 未着手                                    |

## 目的

契約ドリフト検出テストを先行作成し、TDD Red 状態を確認する。

契約統一の正しさを機械的に検証するため、実装変更前にテストを作成する。これにより、統一後の挙動が期待通りであることを保証する。

## 依存関係

| 依存先                   | パス                                                                              | 用途               |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------ |
| Phase 2 契約プロファイル | `outputs/phase-2/contract-profiles.md`                                            | テスト期待値の根拠 |
| Phase 2 設計書           | `outputs/phase-2/design-document.md`                                              | テスト設計の入力   |
| テストパターン           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト設計パターン |
| カバレッジ基準           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ目標     |

## 参照資料

| 参照資料                         | パス                                                                                        | 内容                     |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 要件成果物               | `outputs/phase-1/requirements.md`                                                           | 受け入れ基準・境界条件   |
| Phase 2 設計成果物               | `outputs/phase-2/design-document.md`                                                        | 契約プロファイル定義     |
| Phase 3 レビュー成果物           | `outputs/phase-3/gate-decision.md`                                                          | レビュー判定と注意事項   |
| テストパターン                   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テスト設計パターン       |
| 品質・カバレッジ基準             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 閾値と品質ゲート         |
| IPC 契約チェックリスト           | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約ドリフト検証手順     |
| P42/P44/P45 の既知の落とし穴対策 | `.claude/rules/06-known-pitfalls.md`                                                        | 再発防止ポイント         |

## 実行タスク

### タスク1: 契約ドリフト検出テスト設計

**目的**: 全 skill: チャネルの戻り値形状を検証するテストケースを設計する。

**手順**:

1. Phase 2 の契約プロファイル表を参照し、各プロファイルの期待戻り値形状を定義する
2. テストケースマトリクスを作成する（正常系・異常系・境界値）
3. `outputs/phase-4/test-case-matrix.md` に出力する

**テストケースマトリクスの構成**:

| カテゴリ | テスト対象         | 期待される戻り値形状   | 検証方法                 |
| -------- | ------------------ | ---------------------- | ------------------------ |
| 正常系   | 各チャネル正常応答 | 契約プロファイルに準拠 | 型レベル＋値レベル検証   |
| 異常系   | バリデーション失敗 | 統一エラー形式         | P42準拠3段バリデーション |
| 境界値   | エッジケース       | 契約プロファイルに準拠 | 特殊入力パターン         |

### タスク2: Main IPC ハンドラテスト作成

**目的**: `skillHandlers.ts` の各ハンドラが契約プロファイルに従った戻り値を返すことを検証する。

**手順**:

1. `apps/desktop/src/main/ipc/__tests__/skillHandlers.contract.test.ts` を作成する
2. 各チャネルの戻り値形状テスト（型レベル＋値レベル）を実装する
3. バリデーション失敗時の一貫したエラー形式テストを実装する（P42準拠3段バリデーション）

**テスト設計方針**:

- 各 skill: チャネルに対して、正常系の戻り値が契約プロファイルの形状と一致することを検証する
- バリデーション失敗時のエラー形式が全チャネルで統一されていることを検証する
- P42準拠: 型チェック → 空文字列 → トリム空文字列 の3段バリデーションを検証する

**注意点（P39準拠）**: happy-dom 環境では `userEvent` ではなく `fireEvent` を使用する

### タスク3: Preload API テスト作成

**目的**: `skill-api.ts` の各メソッドが Renderer に統一された戻り値を返すことを検証する。

**手順**:

1. `apps/desktop/src/preload/__tests__/skill-api.contract.test.ts` を作成する
2. `safeInvoke` / `safeInvokeUnwrap` の選択が契約プロファイルと一致することを検証する

**テスト設計方針**:

- 各 Preload API メソッドが正しい IPC ラッパー関数（`safeInvoke` or `safeInvokeUnwrap`）を使用していることを検証する
- Renderer に公開される API のシグネチャが統一されていることを検証する

### タスク4: Renderer 利用側テスト作成

**目的**: Renderer が統一された API 契約に基づいて動作することを検証する。

**手順**:

1. 利用箇所（agentSlice, useSkillExecution 等）のモックテストを作成する
2. 戻り値解釈の一貫性を検証する

**テスト設計方針**:

- Renderer 側のコードが統一された API 契約に基づいて戻り値を解釈していることを検証する
- 型アサーション（`as unknown as`）が不要であることを検証する

### タスク5: TDD Red 状態確認

**目的**: 新テストが現状実装に対して失敗することを確認する。

**手順**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.contract.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.contract.test.ts
```

- 「統一後の期待値」に対するテストが Red であることを確認する
- 失敗するテスト数と失敗理由を記録する

## TDD検証（Phase 4）

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.contract.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.contract.test.ts
```

- [ ] テストが失敗することを確認する（Red状態）
- [ ] 失敗するテスト数を記録する
- [ ] 失敗理由が「契約不一致」であることを確認する

## SubAgent 分担

| SubAgent   | 担当 |
| ---------- | ---- |
| SubAgent-A | タスク1（テストケース設計）+ タスク2（Main 契約テスト作成） |
| SubAgent-B | タスク3（Preload 契約テスト作成）+ タスク4（Renderer 利用側テスト作成） |
| SubAgent-C | タスク5（TDD Red確認）+ 実行結果集約（`outputs/phase-4/test-case-matrix.md` 更新） |

## 成果物

| 成果物                 | パス                                                                 | 内容               |
| ---------------------- | -------------------------------------------------------------------- | ------------------ |
| テストケースマトリクス | `outputs/phase-4/test-case-matrix.md`                                | テストケース一覧   |
| 契約テスト（Main）     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.contract.test.ts` | ハンドラ契約テスト |
| 契約テスト（Preload）  | `apps/desktop/src/preload/__tests__/skill-api.contract.test.ts`      | Preload契約テスト  |

## 統合テスト連携

統合テストシナリオを全カテゴリで作成する。Main → Preload → Renderer の各レイヤーを横断する統合テストを設計し、契約の一貫性を端から端まで検証する。

## 完了条件

- [ ] テストケースマトリクスが作成されている
- [ ] Main IPC ハンドラの契約テストが作成されている
- [ ] Preload API の契約テストが作成されている
- [ ] Renderer 利用側のモックテストが作成されている
- [ ] TDD Red 状態が確認されている（テストが失敗する）
- [ ] 失敗するテスト数と失敗理由が記録されている

---

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成すること:

- [ ] タスク1: 契約ドリフト検出テスト設計
- [ ] タスク2: Main IPC ハンドラテスト作成
- [ ] タスク3: Preload API テスト作成
- [ ] タスク4: Renderer 利用側テスト作成
- [ ] タスク5: TDD Red 状態確認

## タスク100%実行確認【必須】チェックリスト

Phase 完了前に以下を全て確認すること:

- [ ] 全タスク（タスク1〜5）が完了している
- [ ] 成果物が全て所定のパスに出力されている
- [ ] TDD Red 状態が確認されている
- [ ] テスト実行結果が記録されている
- [ ] 完了条件が全て満たされている

## Phase実行記録

| 項目         | 記録 |
| ------------ | ---- |
| 実行開始日時 |      |
| 実行完了日時 |      |
| 実行者       |      |
| テスト数     |      |
| Red テスト数 |      |
| 備考         |      |

## Phase末端アクション【必須】

1. `artifacts.json` の Phase 4 ステータスを更新する
2. 本仕様書の完了条件チェックリストを全て埋める
3. Phase実行記録を記入する
4. 次 Phase（Phase 5: 実装）に進む

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
