# Phase 3: 設計レビュー — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 3                       |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | Phase 2（設計）         |

## 目的

Phase 2 の設計内容を要件との整合性・実装リスク・セキュリティ・テスタビリティの観点から検証し、Phase 4 進行の可否を判定する。

## 実行タスク

### Task 3-1: 要件充足性チェック

Phase 1 の受入基準（AC-01〜AC-11）と Phase 2 の設計を対照する。

| AC ID | 受入基準                                                | 設計での対応                                         | 判定 |
| ----- | ------------------------------------------------------- | ---------------------------------------------------- | ---- |
| AC-01 | OpenAI: `gpt-5.4` が `isDefault: true`                  | Task 2-2 で `gpt-5.4` に `isDefault: true` を設定    | OK   |
| AC-02 | Anthropic: `claude-sonnet-4-6` が `isDefault: true`     | Task 2-2 で設定済み                                  | OK   |
| AC-03 | Google: `gemini-3-flash-preview` が `isDefault: true`   | Task 2-2 で設定済み                                  | OK   |
| AC-04 | xAI: `grok-4-1-fast-non-reasoning` が `isDefault: true` | Task 2-2 で設定済み                                  | OK   |
| AC-05 | 旧モデルIDが `PROVIDER_CONFIGS` に存在しない            | 全旧モデルを削除し、新モデルに差し替え               | OK   |
| AC-06 | `inferProviderId("o3")` → `"openai"`                    | 現行コードの `o3` プレフィックスパターンで対応済み   | OK   |
| AC-07 | `inferProviderId("o4-mini")` → `"openai"`               | 現行コードの `o4` プレフィックスパターンで対応済み   | OK   |
| AC-08 | `inferProviderId("gpt-5.4")` → `"openai"`               | `gpt-` プレフィックスパターンで対応済み              | OK   |
| AC-09 | 各モデルに `description` フィールドが存在               | Task 2-2 で全モデルに `description` を設定           | OK   |
| AC-10 | TypeScript コンパイルエラーが 0 件                      | 型変更は `?:` オプショナルのため既存コードに影響なし | OK   |
| AC-11 | 既存の `inferProviderId` の返り値が変更されない         | `inferProviderId` を変更しないため影響なし           | OK   |

### Task 3-2: 設計品質チェック

#### 2-A: 単一責務原則（SRP）

`PROVIDER_CONFIGS` はデータ定義のみを担い、ロジックを含まない。`inferProviderId` の変更が不要であるという判断も設計の単純性を保っている。問題なし。

#### 2-B: 型安全性

`description?: string` をオプショナルにすることで、OpenRouter の既存モデル定義（`description` なし）との後方互換性が保たれる。`LLMProvider` 共有型を変更しないため、Preload の structured clone で `description` フィールドの有無によるランタイムエラーは発生しない。問題なし。

#### 2-C: isDefault フィールドの一意性

各プロバイダーで `isDefault: true` が1つのみであることを確認する：

| プロバイダー | isDefault: true のモデル             | モデル数 |
| ------------ | ------------------------------------ | -------- |
| OpenAI       | `gpt-5.4`（1個）                     | 6        |
| Anthropic    | `claude-sonnet-4-6`（1個）           | 3        |
| Google       | `gemini-3-flash-preview`（1個）      | 3        |
| xAI          | `grok-4-1-fast-non-reasoning`（1個） | 3        |
| OpenRouter   | 変更なし（既存1個）                  | 4        |

各プロバイダーで `isDefault: true` は1つ。問題なし。

#### 2-D: contextWindow 値の妥当性

| モデル           | contextWindow | 単位   | 備考                      |
| ---------------- | ------------- | ------ | ------------------------- |
| gpt-5.4 系       | 1,050,000     | tokens | 1.05M tokens              |
| o3, o4-mini      | 200,000       | tokens | 200K tokens               |
| claude-\* 系     | 200,000       | tokens | 200K tokens（現行と同値） |
| gemini-3 系      | 1,048,576     | tokens | 1M tokens                 |
| grok-3-mini      | 131,072       | tokens | 131K tokens               |
| grok-4-1-fast 系 | 2,097,152     | tokens | 2M tokens                 |

研究資料との照合が必要。Phase 4 のテストで実値を検証する。

#### 2-E: IPC セキュリティ原則（04-electron-security.md 準拠）

`PROVIDER_CONFIGS` は静的データ定数であり、外部入力を含まない。IPC チャンネル名・引数バリデーションへの影響はない。問題なし。

### Task 3-3: リスク評価

| リスク                                             | 可能性 | 影響 | 対策                                                                                        |
| -------------------------------------------------- | ------ | ---- | ------------------------------------------------------------------------------------------- |
| 旧モデルIDを保存済みユーザー設定との不整合         | 中     | 中   | Renderer 側の設定読み込み時に不正モデルIDを検出する処理が必要（スコープ外タスクとして記録） |
| `description` フィールドが空文字列で設定される     | 低     | 低   | AC-08 で空文字列不可の受入基準を設定済み                                                    |
| `isDefault: true` が各プロバイダーで複数設定される | 低     | 高   | 設計レビューで一意性を確認済み（Task 3-2-C）                                                |
| テスト期待値の不整合（旧モデルIDを参照するテスト） | 高     | 中   | Phase 1 で影響テスト一覧を作成済み。Task04 で対応予定                                       |

### Task 3-4: 未解決事項の記録

| ID   | 事項                                                          | 種別       | 対応方針             |
| ---- | ------------------------------------------------------------- | ---------- | -------------------- |
| U-01 | 保存済みユーザー設定（旧モデルID）の移行戦略                  | スコープ外 | 別タスクとして分離   |
| U-02 | `LLMProvider` 共有型への `description` フィールド追加         | スコープ外 | 別タスクとして分離   |
| U-03 | contextWindow 値が公式 API ドキュメントと一致するかの最終確認 | 確認事項   | Phase 4 テストで検証 |

### Task 3-5: レビュー判定

**判定: PASS**

以下の根拠で Phase 4 への進行を承認する：

1. 受入基準 AC-01〜AC-11 が設計で全て満たされている
2. 変更ファイルが `apps/desktop/src/main/handlers/llm.ts` 1ファイルのみで影響範囲が最小
3. 型変更がオプショナルフィールド追加であり、後方互換性が保たれている
4. `inferProviderId` の変更不要という判断に根拠がある
5. 識別されたリスクは全て既存の管理策または後続タスクで対処可能

MINOR 指摘事項（Phase 11 前に対応する）:

- U-03: contextWindow 値の公式 API ドキュメントとの照合を Phase 4 テストで実施すること

## 参照資料

| 資料名               | パス                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| Phase 1 要件定義     | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-1-requirements.md` |
| Phase 2 設計         | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-2-design.md`       |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                                      |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                                                 |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                                      |

## 成果物

| 成果物                       | パス                                                                                             | 形式     |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| 設計レビュー書（本ファイル） | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-3/design-review.md` | Markdown |

## 完了条件

- [ ] AC-01〜AC-11 の全受入基準と設計の対応を確認した
- [ ] `isDefault: true` が各プロバイダーで1つのみであることを確認した
- [ ] 型変更（`description?: string`）の後方互換性を確認した
- [ ] `inferProviderId` 変更不要の根拠を記載した
- [ ] リスク評価テーブルを完成させた
- [ ] 未解決事項（U-01〜U-03）を記録した
- [ ] レビュー判定（PASS/MINOR/MAJOR）を明記した

## 統合テスト連携

Phase 3 では統合テストは実施しない。レビュー指摘の MINOR 事項（U-03）は Phase 4 のテスト設計に反映する。

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                       | 仕様参照先                                   |
| -------------- | ------------------------------ | -------------------------------------------- |
| アーキテクチャ | Main Process のデータ定義変更  | `aiworkflow-requirements: architecture-*.md` |
| API設計        | IPC レスポンス形式への影響確認 | `aiworkflow-requirements: api-*.md`          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次の Phase

Phase 4: テスト作成（`phase-4-test-creation.md`）
