---
task_id: UT-9B-I-001
task_name: カスタム型宣言ファイルと SDK 実型の共存整理
category: リファクタリング（型定義整理）
target_feature: SDK 型宣言ファイル
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-02-12
dependencies:
  - TASK-9B-I-SDK-FORMAL-INTEGRATION
issue_number: null
---

# カスタム型宣言ファイルと SDK 実型の共存整理 - タスク指示書

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-9B-I-001                                               |
| タスク名     | カスタム型宣言ファイルと SDK 実型の共存整理               |
| 分類         | リファクタリング（型定義整理）                            |
| 対象機能     | SDK 型宣言ファイル                                        |
| 優先度       | 低                                                        |
| 見積もり規模 | 小規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | TASK-9B-I-SDK-FORMAL-INTEGRATION Phase 12（未タスク検出） |
| 発見日       | 2026-02-12                                                |
| 関連Phase    | Phase 5（リファクタリング）                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9B-I-SDK-FORMAL-INTEGRATION にて `as any` を除去し、Claude Agent SDK（@anthropic-ai/claude-agent-sdk@0.2.30）の実型を直接参照する型安全統合を完了した。この過程で、`packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` に存在するカスタム `declare module` ファイルが SDK インストール済み環境では TypeScript コンパイラに無視されていることが判明した。

### 1.2 問題点・課題

| 問題                                                 | 影響                         |
| ---------------------------------------------------- | ---------------------------- |
| `declare module` ファイルが SDK 実型に無視されている | 開発者の混乱の原因になり得る |
| ファイルの存在意義が不明確                           | コードベースの保守性低下     |
| `agent-client.ts` の `ClaudeSDK` default export 参照 | 削除前に影響調査が必要       |

### 1.3 放置した場合の影響

- 実害はないが、開発者がカスタム型宣言ファイルの目的を誤解する可能性がある
- コードベースに不要なファイルが残り続ける
- 新規参加メンバーの学習コストが微増する

---

## 2. 何を達成するか（What）

### 2.1 目的

`@anthropic-ai-claude-agent-sdk.d.ts` の役割を調査し、不要であれば削除する。必要であれば目的をコメントで明記する。

### 2.2 最終ゴール

1. カスタム型宣言ファイルの役割が明確になっている
2. 不要な場合は安全に削除されている
3. 必要な場合は目的コメントが追加されている

### 2.3 スコープ

#### 含むもの

- `@anthropic-ai-claude-agent-sdk.d.ts` の影響調査
- `agent-client.ts` の `ClaudeSDK` default export 使用箇所の確認
- ファイルの削除または目的コメント追加

#### 含まないもの

- SDK 型定義の変更
- `agent-client.ts` のリファクタリング（影響がある場合は別タスクとする）

### 2.4 成果物

| 成果物                         | 説明                               |
| ------------------------------ | ---------------------------------- |
| 調査結果                       | カスタム型宣言ファイルの必要性判定 |
| ファイル削除またはコメント追加 | 調査結果に基づく対応               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9B-I-SDK-FORMAL-INTEGRATION 完了（SDK 実型統合済み）

### 3.2 依存タスク

- TASK-9B-I-SDK-FORMAL-INTEGRATION（前提・完了済み）

### 3.3 必要な知識

- TypeScript の `declare module` の動作原理
- pnpm モノレポにおけるモジュール解決
- Claude Agent SDK の型エクスポート構造

### 3.4 推奨アプローチ

1. `@anthropic-ai-claude-agent-sdk.d.ts` の内容を確認
2. `ClaudeSDK` を使用している箇所を `grep` で全検索
3. SDK 未インストール状態での動作を確認（CI等で必要か判定）
4. 不要と判定した場合はファイルを削除し、全テスト PASS を確認

### 3.5 実装課題と解決策（TASK-9B-I-SDK-FORMAL-INTEGRATION からの教訓）

TASK-9B-I で `as any` を除去し SDK 実型統合を実現する過程で遭遇した課題と解決策を記録する。
本タスク（UT-9B-I-001）の実装時に同様の問題が発生する可能性が高いため、事前に把握しておくこと。

#### 課題一覧

| #   | 課題                                 | 発見経緯                                                                                                                                                           | 解決策                                                                                                                                              | 教訓                                                                   |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | TypeScript モジュール解決の優先順位  | `callSDKQuery` で `as any` を除去した際、カスタム `declare module` の型（auto/ask/deny）と SDK 実型（default/acceptEdits/bypassPermissions）が異なることに気付いた | TypeScript は `node_modules` 配下の実型を優先し、カスタム `.d.ts` を無視する。SDK インストール後はカスタム型宣言を削除する                          | 型定義ファイルの優先順位を理解しておく（S11パターン）                  |
| 2   | SDK パラメータ `env` の発見困難性    | API キーの渡し方が公式ドキュメントに記載されておらず、`query()` のオプション構築に時間がかかった                                                                   | `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts` を直接読み、`env: Record<string, string>` で `ANTHROPIC_API_KEY` を渡すパターンを発見 | 公式ドキュメントより型定義ファイルが信頼できる情報源（S12パターン）    |
| 3   | `abortController` vs `signal` の選択 | SDK が `AbortSignal` ではなく `AbortController` 全体を受け取ることが型定義ファイルから判明                                                                         | `abortController: new AbortController()` として渡し、`controller.abort()` で中断制御                                                                | 型定義ファイルを最初に読み、パラメータの正確な型を把握する             |
| 4   | AsyncIterable vs stream() メソッド   | SDK の `Query` 型が `AsyncGenerator<SDKMessage>` を extends しており、`.stream()` メソッドは存在しないことが判明                                                   | `for await (const msg of conversation)` で直接イテレーション。`{ stream: () => conversation }` のラッパーは不要                                     | SDK の戻り値の消費方法は型定義から確認する                             |
| 5   | PermissionMode 値の仕様書間不一致    | カスタム `.d.ts` に `auto/ask/deny` と定義していたが、SDK 実型は `default/acceptEdits/bypassPermissions/plan/delegate/dontAsk` だった                              | 全仕様書を SDK 実型に統一更新。SKILL.md、permission-control.md、interfaces-agent-sdk.md を一括修正                                                  | カスタム型と実型の不一致は仕様書全体に波及する。早期に検出・修正すべき |

#### 参照すべきシステム仕様書

| 仕様書                                    | セクション                                         | 関連する課題                   |
| ----------------------------------------- | -------------------------------------------------- | ------------------------------ |
| `architecture-implementation-patterns.md` | S11: TypeScript モジュール解決の優先順位           | 課題1, 5                       |
| `architecture-implementation-patterns.md` | S12: SDK API パラメータの正確な把握                | 課題2, 3, 4                    |
| `interfaces-agent-sdk-executor.md`        | TASK-9B-I 完了タスクセクション                     | 全課題（型マッピングテーブル） |
| `interfaces-agent-sdk.md`                 | SDK型安全統合（TASK-9B-I）                         | 課題1, 5（PermissionMode）     |
| `06-known-pitfalls.md`                    | P36: カスタム declare module と SDK 実型の共存問題 | 課題1, 5                       |
| `06-known-pitfalls.md`                    | P37: ドキュメント数値の早期固定                    | テスト数乖離                   |

---

## 4. 実行手順

### Step 1: 影響調査

#### 手順

1. `@anthropic-ai-claude-agent-sdk.d.ts` の内容を確認
2. `grep -rn "ClaudeSDK" packages/shared/` で使用箇所を特定
3. `grep -rn "@anthropic-ai-claude-agent-sdk" packages/shared/` で参照箇所を特定
4. TypeScript コンパイラが実際にこのファイルを使用しているか確認

### Step 2: 判定と対応

#### 不要な場合

1. ファイルを削除
2. `pnpm typecheck` で型エラーが発生しないことを確認
3. `pnpm --filter @repo/shared test` でテスト PASS を確認

#### 必要な場合

1. ファイル先頭に目的コメントを追加
2. どの状況で使用されるかを明記

---

## 5. 完了条件チェックリスト

- [ ] カスタム型宣言ファイルの役割が調査済み
- [ ] 不要な場合: ファイルが安全に削除されている
- [ ] 必要な場合: 目的コメントが追加されている
- [ ] `pnpm typecheck` が PASS
- [ ] 関連テストが全て PASS

---

## 6. 検証方法

### テストケース

1. `pnpm typecheck` で型エラーなし
2. `pnpm --filter @repo/shared test` で全テスト PASS
3. `pnpm --filter @repo/desktop test` で全テスト PASS

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                                                                                                                  |
| -------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| カスタム `.d.ts` 削除による CI 環境での型エラー          | 中     | 中       | SDK 未インストール環境での `pnpm install` 後にテスト実行で検証。CI パイプラインで `pnpm typecheck` が PASS することを確認                             |
| `agent-client.ts` の `ClaudeSDK` default export への影響 | 高     | 低       | 削除前に `grep -rn "ClaudeSDK\|@anthropic-ai-claude-agent-sdk" packages/` で全使用箇所を特定。影響がある場合は import パスを SDK 直接参照に書き換える |
| 他パッケージ（apps/web 等）でのカスタム型参照            | 中     | 低       | モノレポ全体で `grep -rn "@anthropic-ai-claude-agent-sdk" apps/` を実行し、import 箇所を網羅的に調査                                                  |

---

## 8. 参照情報

### 関連ファイル

- `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`（調査対象: カスタム declare module）
- `packages/shared/src/agent/agent-client.ts`（ClaudeSDK default export 使用箇所）
- `node_modules/@anthropic-ai/claude-agent-sdk/dist/index.d.ts`（SDK 実型定義: 正確なパラメータ型の情報源）

### 関連ドキュメント

- `interfaces-agent-sdk-executor.md`（SDK 型安全統合仕様）
- `interfaces-agent-sdk.md`（SDK インターフェース仕様）

### システム仕様書参照（aiworkflow-requirements）

| 仕様書                                              | 該当セクション                                     | 参照目的                                                                       |
| --------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| `architecture-implementation-patterns.md`           | S11: TypeScript モジュール解決の優先順位           | カスタム `.d.ts` と `node_modules` 実型の優先順位ルール                        |
| `architecture-implementation-patterns.md`           | S12: SDK API パラメータの正確な把握                | SDK 型定義ファイル直接参照パターン                                             |
| `interfaces-agent-sdk-executor.md`                  | TASK-9B-I 完了タスクセクション                     | callSDKQuery 型マッピングテーブル、実装上の課題と教訓                          |
| `interfaces-agent-sdk.md`                           | SDK型安全統合（TASK-9B-I）                         | SDKQueryOptions 変更内容、PermissionMode SDK 実型定義                          |
| `06-known-pitfalls.md`                              | P36: カスタム declare module と SDK 実型の共存問題 | 本タスクの直接的な根拠。削除判断の論拠                                         |
| `06-known-pitfalls.md`                              | P37: ドキュメント数値の早期固定                    | Phase 12 でのテスト数乖離パターン（同じ親タスクの教訓）                        |
| `06-known-pitfalls.md`                              | P38: 未タスク配置ディレクトリ間違い                | P3 再発パターン。未タスク指示書配置の注意事項                                  |
| `claude-agent-sdk/references/query-api.md`          | TypeScript モジュール解決パターン                  | SDK query() API の正確な型情報                                                 |
| `claude-agent-sdk/references/permission-control.md` | PermissionMode SDK@0.2.30 実型                     | `default/acceptEdits/bypassPermissions/plan/delegate/dontAsk` の正確な値セット |

### 関連タスク

| タスクID                         | 関係                     | 説明                                              |
| -------------------------------- | ------------------------ | ------------------------------------------------- |
| TASK-9B-I-SDK-FORMAL-INTEGRATION | 発見元（前提・完了済み） | `as any` 除去作業中にカスタム型宣言の無効化を発見 |

---

## 9. 備考

### 発見経緯

TASK-9B-I-SDK-FORMAL-INTEGRATION の `as any` 除去作業中に、カスタム `declare module` が SDK 実型に無視されることを発見した。SDK がインストールされている場合、TypeScript コンパイラは `node_modules` 内の実際の型定義を優先するため、カスタム `declare module` は使用されない。
