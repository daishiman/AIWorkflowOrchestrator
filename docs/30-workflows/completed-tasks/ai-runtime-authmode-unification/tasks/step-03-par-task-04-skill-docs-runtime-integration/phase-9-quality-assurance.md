# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| Phase      | 9                                                                   |
| Phase名    | 品質検証                                                            |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001                                  |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 8（リファクタリング） |
| 後続Phase  | Phase 10（最終レビュー）                                            |
| ステータス | completed                                                           |
| 作成日     | 2026-03-13                                                          |
| 更新日     | 2026-03-16                                                          |
| 機能名     | skill-docs-runtime-integration                                      |

## 目的

Skill Docs 生成の AI runtime 統合の品質を TypeScript 型安全、セキュリティ、UI/UX、非機能要件の 4 観点で横断検証し、release blocker を 0 件にする。

## 実行タスク

### T-9-1: TypeScript 型安全確認

実装コード全体の型安全を検証する。

- `any` 型が使用されていないことを確認する
  ```bash
  grep -rn ': any\b\|as any\b' apps/desktop/src/main/services/skill/SkillDoc*.ts apps/desktop/src/main/ipc/handlers/skillDocs*.ts
  ```
- non-null assertion (`!`) が使用されていないことを確認する（P48 準拠）
  ```bash
  grep -n '\w!' apps/desktop/src/main/services/skill/SkillDoc*.ts | grep -v '//'
  ```
- 型アサーション (`as`) の使用が最小化されていることを確認する
  - 使用箇所がある場合は理由コメントが付与されていること
- DocOperationResult<T> のジェネリクスが正しく伝播していることを確認する
  - `generate` → `DocOperationResult<GeneratedDoc>`
  - `preview` → `DocOperationResult<string>`
  - `export` → `DocOperationResult<{ path: string }>`
  - `templates` → `DocOperationResult<DocTemplate[]>`
- LLMDocQueryAdapter の実装が interface の contract を満たしていることを確認する

### T-9-2: セキュリティ品質確認

4 層セキュリティ検証が全チャンネルで適用されていることを確認する。

- **Layer 1: sender 検証**
  - 4 チャンネル全てで `validateIpcSender(event, mainWindow)` が呼ばれていること
  - mainWindow 以外のウィンドウからの呼び出しが拒否されること
- **Layer 2: P42 3段バリデーション**
  - 全文字列引数に対して型チェック → 空文字列 → `.trim()` 空文字列の 3 段バリデーションが適用されていること
  ```typescript
  // 確認パターン
  if (typeof args?.skillName !== "string" || args.skillName.trim() === "") { ... }
  ```
- **Layer 3: 入力制約検証**
  - `skill:docs:export` のパス引数にパストラバーサル防御が適用されていること
    - `..` / 絶対パスの拒否
    - 許可ディレクトリ外への書き出し拒否
  - `skill:docs:generate` の format 引数が許可値リストで検証されていること
- **Layer 4: エラー境界**
  - エラーレスポンスに内部パス、API key 値、スタックトレースが含まれないこと
  - ErrorMapper のサニタイゼーションが全エラー経路で適用されていること
- **機密情報のログ出力確認**
  - `console.log` / `console.warn` / `console.error` に API key / token が出力されないこと
  - `electron-log` 使用箇所で機密情報がマスクされていること

### T-9-3: UI/UX 品質確認

7 状態の遷移とマイクロコピーを検証する。

- **状態遷移のデッドロック確認**
  - 7 状態間の遷移パスを列挙し、到達不能状態がないことを確認する

    | 遷移元           | 遷移先                                                       | トリガー         |
    | ---------------- | ------------------------------------------------------------ | ---------------- |
    | ready            | generating                                                   | generate click   |
    | generating       | result / timeout-guidance / rate-limit-wait / error-guidance | LLM 応答         |
    | timeout-guidance | generating / ready                                           | retry / reset    |
    | rate-limit-wait  | generating / ready                                           | wait完了 / reset |
    | error-guidance   | generating / ready                                           | retry / reset    |
    | result           | ready                                                        | reset            |
    | guidance-only    | ready（API key 設定後）                                      | capability 変更  |

  - 全状態から `ready` への復帰パスが存在することを確認する
  - `generating` 状態でのキャンセル操作が `ready` に遷移することを確認する

- **guidance block のマイクロコピー確認**
  - Task01 UI/UX 正本（ui-ux-realization.md）の microcopy 契約に準拠していること
  - timeout では失敗理由と「再試行か handoff か」を同じブロックに表示していること
  - guidance block で「なぜ使えないか」が一文で説明されていること

- **silent fallback の不在確認**
  - エラー発生時に UI 表示なしで処理が継続する箇所がないこと
  - `catch` ブロックでエラーを握りつぶしている箇所がないこと
  - capability が `guidance-only` の場合に空の生成結果を返していないこと

### T-9-4: 非機能品質確認

timeout、retry、IPC レスポンスサイズの妥当性を確認する。

- **timeout 30 秒の実測確認方針**
  - Promise.race の timeout 値が 30000ms であることをコードレベルで確認する
  - テストで `vi.advanceTimersByTime(30000)` による timeout 発火を検証する（P13 準拠: `runAllTimers` ではなく `advanceTimersByTime` を使用）
  - timeout 後に ErrorMapper.mapTimeoutError() が呼ばれることを確認する

- **retry の exponential backoff 動作確認方針**
  - retryable エラー（3000-3999, 4000-4999）でのみ retry が発動することを確認する
  - backoff 間隔が 1秒 → 2秒であることを確認する
  - 最大 2 回再試行後に最終エラーが返却されることを確認する
  - 429 応答時に Retry-After ヘッダ値が優先されることを確認する

- **IPC レスポンスサイズの妥当性確認**
  - GeneratedDoc のサイズが contextBridge の structured clone 制約内であることを確認する
  - 大規模スキル（多数のファイル）での生成結果がメモリ制約を超えないことを確認する

### T-9-5: Lint / 型チェック / 全テスト実行

静的解析と全テストを実行する。

- **Lint 実行**

  ```bash
  pnpm lint
  ```

  - ESLint エラー 0 件、Warning は内容を確認して許容判断する

- **型チェック実行**

  ```bash
  pnpm typecheck
  ```

  - TypeScript エラー 0 件

- **全テスト実行**

  ```bash
  cd apps/desktop && pnpm vitest run src/main/services/skill/SkillDoc
  cd apps/desktop && pnpm vitest run src/main/ipc/handlers/skillDocs
  ```

  - 対象テスト全 PASS
  - P40 準拠: 対象パッケージのディレクトリから実行する

- **カバレッジ確認**
  - Phase 7 で達成したカバレッジ基準が維持されていることを確認する
  - Line Coverage >= 80%、Branch Coverage >= 60%、Function Coverage >= 80%

## 参照資料

| 参照資料                    | パス                                                                                                              | 内容                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Phase 2（設計）             | `phase-2-design.md`                                                                                               | エラー分類表と UI 状態遷移の設計を確認する     |
| Phase 5（実装）             | `phase-5-implementation.md`                                                                                       | 実装成果物の配置を確認する                     |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                                                          | 責務分離後の構造を確認する                     |
| SkillDocGenerator           | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体を確認する                        |
| PromptBuilder               | `apps/desktop/src/main/services/skill/PromptBuilder.ts`                                                           | Phase 8 で分離した prompt 構築を確認する       |
| ErrorMapper                 | `apps/desktop/src/main/services/skill/ErrorMapper.ts`                                                             | Phase 8 で分離したエラー変換を確認する         |
| IPC handlers                | `apps/desktop/src/main/ipc/handlers/skillDocsHandlers.ts`                                                         | 4 チャンネルのハンドラを確認する               |
| ipc index                   | `apps/desktop/src/main/ipc/index.ts`                                                                              | registerSkillDocsHandlers の DI 経路を確認する |
| task UT-9I-001              | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクとの責務境界を確認する     |
| pack UI/UX 正本             | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                          | guidance block の microcopy 契約を確認する     |

### システム仕様（aiworkflow-requirements）

> 品質検証時に以下の正本仕様と照合し、契約逸脱がないことを保証する。

| 参照資料                   | パス                                                                                                              | 内容                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本（4 チャンネル契約）          |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の Pattern 3 構成      |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | DocGenerationRequest / GeneratedDoc 型定義正本   |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | 4 層検証（sender / P42 / 入力制約 / エラー境界） |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I 完了履歴と UT-9I-001/002 未タスク正本    |

## 実行手順

### ステップ1: T-9-1 から T-9-4 を順に実施する

各タスクのチェック項目を逐次確認し、検出した問題を severity（blocker / warning / info）で分類する。blocker は即時修正、warning は Phase 10 の MINOR 候補として記録する。

### ステップ2: T-9-5 の静的解析・テスト実行を行う

Lint → 型チェック → テスト実行 → カバレッジ確認の順で実行する。いずれかが失敗した場合は Phase 8 に戻って修正する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、以下の整合を確認する:

- IPC 4 チャンネルの契約が正本と一致していること
- エラーコード体系が 02-code-quality.md の 5 カテゴリに準拠していること
- 4 層セキュリティ検証が security-electron-ipc-advanced.md の要件を満たしていること

### ステップ4: 品質チェックリストを完成させる

全項目の確認結果を qa-checklist.md に記録する。blocker 0 件であることを確認して Phase 10 への handoff を準備する。

## 統合テスト連携

品質検証の観点から以下の統合ポイントを横断確認する:

- queryFn: LLMDocQueryAdapter.query() の型安全と error propagation
- provider adapter: isAvailable() の判定が capability resolver と正しく連携していること
- timeout: 30 秒 Promise.race のエラー経路が ErrorMapper → DocOperationResult → UI 状態遷移まで貫通していること
- retry: exponential backoff が retryable エラーのみで発動し、non-retryable エラーでは即時失敗すること
- guidance: capability 判定 → guidance block → handoff card の表示連鎖に silent fallback がないこと

## 成果物

| 成果物               | パス                                       | 内容                                                       |
| -------------------- | ------------------------------------------ | ---------------------------------------------------------- |
| 品質チェックリスト   | `outputs/phase-9/qa-checklist.md`          | T-9-1 から T-9-5 の全項目の確認結果を記録する              |
| セキュリティ検証報告 | `outputs/phase-9/security-verification.md` | 4 層検証の適用状況と機密情報マスクの確認結果を記録する     |
| 非機能検証報告       | `outputs/phase-9/nonfunctional-report.md`  | timeout / retry / IPC レスポンスサイズの検証結果を記録する |

## 完了条件

- [ ] `any` 型、non-null assertion (`!`)、不要な型アサーション (`as`) が 0 件である
- [ ] 4 層セキュリティ検証が 4 チャンネル全てで適用されている
- [ ] API key / token のログ出力が 0 件である
- [ ] 7 状態の遷移にデッドロック（到達不能状態）がない
- [ ] guidance block のマイクロコピーが Task01 UI/UX 正本に準拠している
- [ ] silent fallback が 0 件である
- [ ] timeout 30 秒と retry exponential backoff の動作がテストで検証されている
- [ ] `pnpm lint` が PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] 対象テストが全 PASS し、カバレッジ基準を維持している
- [ ] 品質 blocker が 0 件である

## 既知の落とし穴（関連 Pitfall）

| Pitfall | 内容                                       | 本 Phase での対策                                                        |
| ------- | ------------------------------------------ | ------------------------------------------------------------------------ |
| P13     | タイマーテストの無限ループ                 | timeout テストでは `advanceTimersByTime` を使用する                      |
| P39     | happy-dom 環境での userEvent 非互換        | UI テストでは `fireEvent` を使用する                                     |
| P40     | テスト実行ディレクトリ依存                 | `cd apps/desktop` してからテストを実行する                               |
| P41     | v8 カバレッジのインライン関数カウント      | withDocHandler 内のコールバックのカバレッジを明示的に検証する            |
| P42     | .trim() バリデーション漏れ                 | 全文字列引数の 3 段バリデーションを確認する                              |
| P48     | non-null assertion による安全性偽装        | `!` の使用箇所を grep で全数確認する                                     |
| P49     | type predicate 内での as キャスト          | `in` 演算子による実行時検証に置換されていることを確認する                |
| P55     | エラーメッセージ中のパスの正規表現メタ文字 | ErrorMapper のパスマスクで `escapeRegExp` が使用されていることを確認する |

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
