# Phase 6: テスト拡充 — カバレッジ不足箇所のテスト追加

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION          |
| Phase番号  | 6                                         |
| Phase名    | テスト拡充                                |
| 目的       | カバレッジ不足箇所のテスト追加            |
| 前提Phase  | Phase 5（実装 — TDD Green 状態）          |
| 後続Phase  | Phase 7（カバレッジ確認）                 |
| ステータス | 未実施                                    |
| ブランチ   | refactor/task-9b-i-sdk-formal-integration |
| 作成日     | 2026-02-12                                |

---

## 目的

Phase 5 の実装完了後、`callSDKQuery()` メソッド周辺のテストカバレッジを測定し、不足箇所を特定してテストを追加する。本タスクの変更は型レベルのみだが、型変更が既存のエラーハンドリングパスや分岐ロジックに影響を与えていないことを、カバレッジ観点から保証する。

---

## 依存関係

| 依存元  | 成果物                                         | 用途                   |
| ------- | ---------------------------------------------- | ---------------------- |
| Phase 4 | `outputs/phase-4/test-specification.md`        | テストケース設計の参照 |
| Phase 4 | `SkillExecutor.sdk-types.test.ts`              | 型安全テストの参照     |
| Phase 5 | 修正済み `SkillExecutor.ts`                    | カバレッジ測定対象     |
| Phase 5 | 更新済み `@anthropic-ai-claude-agent-sdk.d.ts` | 型定義の参照           |
| Phase 5 | 更新済みモックファイル                         | テスト実行に使用       |

---

## 実行タスク

### Task 1: カバレッジ測定 — 現状のカバレッジ取得

#### 実行コマンド

```bash
pnpm vitest run --coverage apps/desktop/src/main/services/skill/__tests__/
```

#### 測定対象ファイル

```
apps/desktop/src/main/services/skill/SkillExecutor.ts
```

#### 測定観点

`callSDKQuery()` メソッド（行 751-775）およびその周辺メソッドに焦点を当てて測定する:

| 測定対象メソッド | 行番号     | 重点確認事項                       |
| ---------------- | ---------- | ---------------------------------- |
| `callSDKQuery()` | 751-775    | 動的 import の型安全な呼び出し経路 |
| `getApiKey()`    | 777-       | API キー取得失敗時の分岐           |
| `executeSkill()` | （呼出元） | `callSDKQuery()` 呼び出しパス      |

#### 成果物

`outputs/phase-6/coverage-baseline.md` にカバレッジ測定結果を記録する:

| 指標              | Phase 5 完了時の値 | 目標（最低基準） | 目標（推奨基準） |
| ----------------- | ------------------ | ---------------- | ---------------- |
| Line Coverage     | （測定値）         | 80%              | 90%              |
| Branch Coverage   | （測定値）         | 60%              | 70%              |
| Function Coverage | （測定値）         | 80%              | 90%              |

---

### Task 2: ギャップ分析 — カバレッジ不足箇所の特定

#### 分析対象

`callSDKQuery()` 周辺の分岐ロジックを分析し、テストが網羅していない経路を特定する:

| 分岐箇所                        | 分岐条件                       | カバレッジ状態 |
| ------------------------------- | ------------------------------ | -------------- |
| API キー取得成功/失敗           | `getApiKey()` の戻り値         | 要確認         |
| SDK 動的 import 成功/失敗       | `import()` の resolve/reject   | 要確認         |
| `query()` 呼び出し成功/失敗     | SDK `query()` の正常系/異常系  | 要確認         |
| `stream()` の呼び出し           | `conversation.stream()` の返却 | 要確認         |
| `options.tools` の有無          | `undefined` / `string[]`       | 要確認         |
| `options.permissionMode` の有無 | `undefined` / 指定値           | 要確認         |
| `options.signal` の有無         | `undefined` / `AbortSignal`    | 要確認         |

#### 分析手順

1. カバレッジレポートの未網羅行（Uncovered Lines）を抽出する
2. 各未網羅行が属する分岐条件を特定する
3. テスト追加の優先度を Line/Branch/Function の基準充足状況から判定する

#### 成果物

`outputs/phase-6/coverage-gap-analysis.md` にギャップ分析結果を記録する。

---

### Task 3: 追加テスト作成 — カバレッジ不足箇所への補完テスト

#### 追加テストの候補

以下のエッジケースに対してテストを追加する:

| EC-ID  | エッジケース                           | テスト内容                                                | 優先度 |
| ------ | -------------------------------------- | --------------------------------------------------------- | ------ |
| EC-001 | SDK 動的 import 失敗                   | `import()` が reject した場合のエラーハンドリング確認     | 必須   |
| EC-002 | API キー取得失敗                       | `getApiKey()` が例外を throw した場合のエラー伝播確認     | 必須   |
| EC-003 | `query()` 呼び出し時の例外             | SDK `query()` が例外を throw した場合のエラーハンドリング | 必須   |
| EC-004 | `stream()` が空の AsyncIterable を返す | メッセージ 0 件の場合の振る舞い確認                       | 推奨   |
| EC-005 | AbortSignal による中断                 | `signal.abort()` 呼び出し後の振る舞い確認                 | 推奨   |
| EC-006 | tools 未指定での呼び出し               | `options.tools` が `undefined` の場合の引数渡し確認       | 推奨   |

#### テストファイル配置

テストの性質に応じて配置先を決定する:

| テスト種別           | 配置先ファイル                    | 理由                             |
| -------------------- | --------------------------------- | -------------------------------- |
| 型安全性エッジケース | `SkillExecutor.sdk-types.test.ts` | Phase 4 で作成した型テストに追加 |
| エラーハンドリング   | `SkillExecutor.test.ts` に追記    | 既存の基本テストファイルに統合   |
| SDK import 失敗      | `SkillExecutor.sdk-types.test.ts` | SDK 固有のエッジケース           |

#### テスト実装の注意事項

| 注意事項                     | 対策                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| テスト間の状態共有防止（P9） | `beforeEach` で全モックをリセットする                            |
| モック定義の型整合性         | Phase 5 で更新したモックファイルと同一の型を使用する             |
| 動的 import のモック         | `vi.mock()` で SDK モジュールをモックし、reject ケースを再現する |

---

## 参照資料

| 参照資料                       | パス                                                                             | 内容                        |
| ------------------------------ | -------------------------------------------------------------------------------- | --------------------------- |
| Phase 4 テストケース設計書     | `outputs/phase-4/test-specification.md`                                          | テストケース TC-001〜TC-006 |
| Phase 5 修正済み SkillExecutor | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                          | カバレッジ測定対象          |
| 型安全テスト                   | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` | 追加テストの配置先候補      |
| 既存テスト: 基本               | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`           | 追加テストの配置先候補      |
| SDK モックファイル             | `apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts`              | モック定義の参照            |
| コード品質ルール               | `.claude/rules/02-code-quality.md`                                               | カバレッジ基準の参照        |

---

## 実行手順

### Step 1: カバレッジ測定の実行

1. `pnpm vitest run --coverage apps/desktop/src/main/services/skill/__tests__/` を実行する
2. `SkillExecutor.ts` のカバレッジ結果を抽出する
3. Line / Branch / Function の各指標を `outputs/phase-6/coverage-baseline.md` に記録する

### Step 2: ギャップ分析

1. 未網羅行（Uncovered Lines）を一覧化する
2. `callSDKQuery()` 周辺の分岐を重点的に分析する
3. 各分岐のテスト状態を判定する
4. テスト追加の優先度を決定する
5. `outputs/phase-6/coverage-gap-analysis.md` に分析結果を記録する

### Step 3: 追加テストの作成

1. EC-001〜EC-003（必須）のテストコードを実装する
2. EC-004〜EC-006（推奨）のテストコードを実装する（カバレッジ基準に応じて）
3. 各テストが独立して実行できることを確認する（`beforeEach` でリセット）

### Step 4: テスト実行確認

1. `pnpm vitest run apps/desktop/src/main/services/skill/__tests__/` で全テストを実行する
2. 追加テストを含む全テストが PASS することを確認する
3. 既存テストに影響がないことを確認する

### Step 5: カバレッジ再測定

1. `pnpm vitest run --coverage apps/desktop/src/main/services/skill/__tests__/` を再実行する
2. 追加テスト後のカバレッジを測定する
3. Phase 7 でのカバレッジ確認に備えて結果を記録する

---

## 成果物

| 成果物                 | 説明                               | 配置先                                     |
| ---------------------- | ---------------------------------- | ------------------------------------------ |
| カバレッジベースライン | Phase 5 完了時のカバレッジ測定結果 | `outputs/phase-6/coverage-baseline.md`     |
| ギャップ分析レポート   | 未網羅箇所の特定と優先度付け       | `outputs/phase-6/coverage-gap-analysis.md` |
| 追加テストコード       | EC-001〜EC-006 のテスト実装        | 該当テストファイル内                       |

---

## 統合テスト連携

本タスクは型定義のみの変更に対するテスト拡充であり、API・DB 等の統合テストは対象外。エッジケーステストは SkillExecutor の単体テストとして追加する。

---

## 完了条件

- [ ] `SkillExecutor.ts` のカバレッジベースラインが測定・記録されている
- [ ] `callSDKQuery()` 周辺の分岐カバレッジが分析されている
- [ ] 未網羅箇所が特定され、ギャップ分析レポートに記録されている
- [ ] EC-001（SDK 動的 import 失敗）のテストが追加されている
- [ ] EC-002（API キー取得失敗）のテストが追加されている
- [ ] EC-003（`query()` 呼び出し時の例外）のテストが追加されている
- [ ] 追加テストを含む全テストが PASS している
- [ ] 既存 6 テストファイルに影響がない（全件 PASS）
- [ ] テスト間で状態が共有されていない（`beforeEach` でリセット）
- [ ] カバレッジ再測定結果が記録されている
- [ ] 成果物が `outputs/phase-6/` に配置されている
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 次Phase

**Phase 7: カバレッジ確認** — カバレッジ基準の充足判定
