# Phase 11: 手動テスト — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 11                       |
| 機能名     | provider-configs-update  |
| タスクID   | TASK-LLM-MOD-01          |
| 作成日     | 2026-03-23               |
| 依存 Phase | Phase 10（最終レビュー） |

## 目的

Electron アプリを実際に起動し、`PROVIDER_CONFIGS` の変更が Settings 画面（AI Provider 選択）に正しく反映されていることを手動で確認する。CLI 環境での自動確認代替手段も記載する。

## 実行タスク

### Task 11-1: 手動確認シナリオ（Electron アプリ起動時）

Electron アプリを起動できる環境がある場合、以下のシナリオを実施する：

#### シナリオ MT-01: OpenAI モデル一覧の確認

1. アプリを起動する
2. Settings > AI Provider を開く
3. Provider として "OpenAI" を選択する
4. モデル一覧に以下が表示されることを確認する:
   - `GPT-5.4`（デフォルト選択されている）
   - `GPT-5.4 mini`
   - `GPT-5.4 nano`
   - `GPT-5.4 Pro`
   - `o3`
   - `o4-mini`
5. 旧モデル（`GPT-4o`, `GPT-4o mini`, `GPT-4 Turbo`）が表示されないことを確認する

#### シナリオ MT-02: Anthropic モデル一覧の確認

1. Provider として "Anthropic" を選択する
2. モデル一覧に以下が表示されることを確認する:
   - `Claude Sonnet 4.6`（デフォルト選択されている）
   - `Claude Opus 4.6`
   - `Claude Haiku 4.5`
3. 旧モデル（`Claude 3.5 Sonnet`, `Claude 3 Opus`, `Claude 3 Haiku`）が表示されないことを確認する

#### シナリオ MT-03: Google モデル一覧の確認

1. Provider として "Google" を選択する
2. モデル一覧に以下が表示されることを確認する:
   - `Gemini 3 Flash`（デフォルト選択されている）
   - `Gemini 3.1 Pro`
   - `Gemini 3.1 Flash-Lite`
3. 旧モデル（`Gemini 1.5 Pro`, `Gemini 1.5 Flash`）が表示されないことを確認する

#### シナリオ MT-04: xAI モデル一覧の確認

1. Provider として "xAI" を選択する
2. モデル一覧に以下が表示されることを確認する:
   - `Grok 4.1 Fast`（デフォルト選択されている）
   - `Grok 3 Mini`
   - `Grok 4.1 Fast Reasoning`
3. 旧モデル（`Grok Beta`）が表示されないことを確認する

#### シナリオ MT-05: description 表示確認（該当 UI がある場合）

モデル選択 UI に description/tooltip が表示される場合、各モデルの description が空でないことを確認する。

#### シナリオ MT-06: OpenRouter 変更なし確認

1. Provider として "OpenRouter" を選択する
2. 旧モデル一覧（`openai/gpt-4o`, `anthropic/claude-3.5-sonnet`, `google/gemini-pro-1.5`, `meta-llama/llama-3.1-405b-instruct`）が表示されることを確認する

### Task 11-2: CLI 環境での自動代替確認

Electron アプリが起動できない CLI 環境では、以下の自動テストで手動確認を代替する。

#### 代替確認 MT-A: handleGetProviders の結果確認

```bash
cd apps/desktop && cat > /tmp/test-providers.mjs << 'EOF'
// llm.ts の PROVIDER_CONFIGS をインポートし、モデル名を出力する簡易確認
// テスト実行経由で PROVIDER_CONFIGS の内容を確認する
EOF

pnpm vitest run src/main/handlers/__tests__/llm.test.ts --reporter=verbose 2>&1 | grep -E "(PASS|FAIL|✓|✗|gpt-5\.4|claude-sonnet|gemini-3|grok-4)"
```

#### 代替確認 MT-B: PROVIDER_CONFIGS の内容検証スクリプト

```bash
# 新モデルIDの存在確認
grep -c "gpt-5.4\|claude-sonnet-4-6\|gemini-3-flash-preview\|grok-4-1-fast-non-reasoning" apps/desktop/src/main/handlers/llm.ts
# 期待値: 4以上

# 旧モデルIDの非存在確認
grep -c "gpt-4o\|claude-3-5-sonnet\|gemini-1\.5\|grok-beta" apps/desktop/src/main/handlers/llm.ts
# 期待値: 0
```

### Task 11-3: 手動テスト結果の記録

| シナリオ | 実施方法       | 結果                            | 備考 |
| -------- | -------------- | ------------------------------- | ---- |
| MT-01    | 実機/代替 MT-A | PASS/FAIL                       |      |
| MT-02    | 実機/代替 MT-A | PASS/FAIL                       |      |
| MT-03    | 実機/代替 MT-A | PASS/FAIL                       |      |
| MT-04    | 実機/代替 MT-A | PASS/FAIL                       |      |
| MT-05    | 実機のみ       | PASS/FAIL/N/A（UI非対応の場合） |      |
| MT-06    | 実機/代替 MT-A | PASS/FAIL                       |      |

## 参照資料

| 資料名                | パス                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------- |
| Phase 10 最終レビュー | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-10-final-review.md` |
| 実装ファイル          | `apps/desktop/src/main/handlers/llm.ts`                                                  |
| 既知の落とし穴 P53    | `.claude/rules/06-known-pitfalls.md`（CLI 環境でのスクリーンショット取得制約）           |

## 成果物

| 成果物             | パス                                                                                                    | 形式     |
| ------------------ | ------------------------------------------------------------------------------------------------------- | -------- |
| 手動テスト結果記録 | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-11/manual-test-results.md` | Markdown |

## 完了条件

- [ ] MT-01〜MT-04 の確認（実機または自動代替）が全て PASS した
- [ ] MT-05 の実施可否を判断し、N/A の場合は理由を記録した
- [ ] MT-06 で OpenRouter モデルが変更されていないことを確認した
- [ ] 手動テスト結果を outputs/phase-11/manual-test-results.md に記録した

## 統合テスト連携

手動テストと並行して、自動テスト全数の最終確認を実施する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/
```

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

Phase 12: ドキュメント更新（`phase-12-documentation.md`）
