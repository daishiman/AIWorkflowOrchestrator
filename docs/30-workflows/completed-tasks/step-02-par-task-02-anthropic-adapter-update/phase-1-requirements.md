# Phase 1: 要件定義 — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 1                        |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

`AnthropicAdapter.ts` L207 のヘルスチェック用モデルID（`claude-3-haiku-20240307`）が退役モデルであるため、後継モデル（`claude-haiku-4-5`）に更新する要件を定義する。

## 実行タスク

### Task 1-0: P50チェック — 既実装状態の調査（必須）

Phase 1 開始前に対象ファイルの実装状態を確認し、既実装コードの重複作成を防止する。

```bash
git log --oneline -10 apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts
grep -n "claude-3-haiku-20240307\|claude-haiku-4-5" apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts
```

- 現在のモデルIDが `claude-3-haiku-20240307` であることを確認する
- `claude-haiku-4-5` への変更が未実施であることを確認する

### Task 1-1: 変更スコープの確定

以下の変更スコープを確認・確定する。

| 項目                        | 変更要否 | 備考                                           |
| --------------------------- | -------- | ---------------------------------------------- |
| ヘルスチェックmodel ID      | **必須** | `claude-3-haiku-20240307` → `claude-haiku-4-5` |
| `anthropic-version`         | 不要     | `2023-06-01` のまま維持                        |
| `baseUrl`                   | 不要     | `https://api.anthropic.com/v1` のまま維持      |
| `sendChat` リクエスト形式   | 不要     | 変更なし                                       |
| `streamChat` リクエスト形式 | 不要     | 変更なし                                       |

### Task 1-2: 受入基準（Acceptance Criteria）定義

| AC ID  | 基準                                                                | 検証方法                                                            |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| AC-001 | `AnthropicAdapter.ts` L207 の model ID が `claude-haiku-4-5` である | コードレビュー / grep                                               |
| AC-002 | `claude-3-haiku-20240307` という文字列がファイル内に残存しない      | `grep -n "claude-3-haiku-20240307" AnthropicAdapter.ts` の出力が0件 |
| AC-003 | `checkHealth` テストが `claude-haiku-4-5` を期待値として検証する    | Vitest テスト実行                                                   |
| AC-004 | TypeScript コンパイルエラーが0件である                              | `pnpm typecheck`                                                    |
| AC-005 | 変更前後で `sendChat` / `streamChat` の動作に変化がない             | 既存テスト全PASS                                                    |

### Task 1-3: 非機能要件確認

- 本変更は単一ファイル・単一行の変更であり、影響範囲は `AnthropicAdapter.ts` の `checkHealth` メソッドのみに限定される
- `sendChat` / `streamChat` への影響: なし（モデルIDはリクエスト送信元（Renderer/Main）から注入される）
- ヘルスチェックは Adapter 単体で送信する最小リクエストであり、モデルID変更による副作用なし

### Task 1-4: 依存関係確認

| 依存先 | 内容                                                          | ステータス確認要否                     |
| ------ | ------------------------------------------------------------- | -------------------------------------- |
| Task01 | `PROVIDER_CONFIGS` に `claude-haiku-4-5` が定義済みであること | **必須**（Task01完了後に本タスク実施） |

## 参照資料

| ドキュメント                                                  | 用途                               |
| ------------------------------------------------------------- | ---------------------------------- |
| `research/anthropic-models.md`                                | モデルIDの正式名称・退役情報の確認 |
| `tasks/step-02-par-task-02-anthropic-adapter-update/index.md` | タスク概要・変更内容の確認         |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`      | 変更対象ファイル（L207）           |

## 統合テスト連携

本タスクの変更（ヘルスチェックモデルID）はヘルスチェック専用であり、エンドツーエンドの統合テストへの影響は軽微。Task04（テスト期待値更新）との連携で整合性を保証する。

## 成果物

| 成果物             | パス                                                                                     | 備考       |
| ------------------ | ---------------------------------------------------------------------------------------- | ---------- |
| Phase 1 要件定義書 | `docs/30-workflows/step-02-par-task-02-anthropic-adapter-update/phase-1-requirements.md` | 本ファイル |

## 完了条件

- [ ] P50チェック: `AnthropicAdapter.ts` が未修正状態であることを確認した
- [ ] 変更スコープが1ファイル1行（L207）であることを確認した
- [ ] AC-001〜AC-005 が定義され、各検証方法が明確である
- [ ] Task01（PROVIDER_CONFIGS更新）が完了していることを前提条件として記録した
- [ ] 非機能要件（影響範囲の限定）が文書化された
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計（`phase-2-design.md`）
