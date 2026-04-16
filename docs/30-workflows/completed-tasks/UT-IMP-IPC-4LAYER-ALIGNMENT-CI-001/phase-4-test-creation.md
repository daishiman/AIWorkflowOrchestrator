# Phase 4: テスト作成（TDD Red） - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 4                                  |
| Phase名    | テスト作成（TDD Red）              |
| 前提Phase  | Phase 3                            |
| 後続Phase  | Phase 5                            |
| ステータス | 未実施                             |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

`verify-ipc-4layer.js` の各モジュール（パーサー / バリデーター / レポーター）のテストを TDD Red-Green-Refactor の Red フェーズとして先行作成する。テストが全件失敗（Red）することを確認し、Phase 5 の実装で Green に移行する基盤を確立する。

## 背景

Phase 2 で設計した parsers / validators / reporter のモジュール構成に対して、Phase 5 の実装に先行してテストを作成する。TDD アプローチにより、実装前に期待挙動を固定し、要件（FR-1〜FR-6）と受け入れ基準（AC-1〜AC-8）の検証可能性を担保する。

Phase 2 テスト戦略書で定義したテスト分類（パーサー単体 / バリデーター単体 / レポーター単体 / E2E）に基づいてテストケースを設計する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-4/` 配下の成果物へ記録する。

### タスク0: 依存関係整合確認（FB-MSO-002対応）

**目的**: テスト作成前にモノレポ依存関係が正常であることを確認する

**実行手順**:

1. `pnpm install` を実行し、全パッケージの依存関係を解決する
2. `pnpm --filter @repo/shared build` を実行し、shared パッケージのビルドが成功することを確認する
3. エラーが発生した場合は原因を特定し、解消してから次のタスクへ進む

**判定基準**:

- `pnpm install` が exit code 0 で完了
- `pnpm --filter @repo/shared build` が exit code 0 で完了

---

### タスク1: パーサーテスト設計・作成

**目的**: 4つのパーサーモジュールの正規表現精度を検証するテストを作成する

**実行手順**:

1. Phase 2 のアーキテクチャ設計書（`outputs/phase-2/architecture-design.md`）を確認し、4つのパーサーの入出力仕様を把握する
2. 実際の4層ファイルのコードパターンを確認し、テストフィクスチャを設計する
3. 以下のパーサーテストを作成する:

**sharedChannelParser テスト**:

- `export const XXX_CHANNELS = { ... }` パターンからチャネル名を正しく抽出できること
- `domain:operation` 命名規則に従うチャネルを抽出できること
- コメント行やブロックコメント内のチャネル定義を除外できること
- 複数の export ブロックから全チャネルを抽出できること

**preloadWhitelistParser テスト**:

- `ALLOWED_INVOKE_CHANNELS` 配列からチャネル名を正しく抽出できること
- `ALLOWED_ON_CHANNELS` 配列からチャネル名を正しく抽出できること
- 定数参照（`XXX_CHANNELS.yyy`）を解決してチャネル名に変換できること

**mainHandlerParser テスト**:

- `ipcMain.handle('channel', ...)` パターンからチャネル名を抽出できること
- `ipcMain.on('channel', ...)` パターンからチャネル名を抽出できること
- 複数の `*Handlers.ts` ファイルから全ハンドラ登録チャネルを集約できること

**rendererSinkParser テスト**:

- `ProductionSink.ts` 内の `safeInvoke('channel', ...)` パターンからチャネル名を抽出できること
- `safeOn('channel', ...)` パターンからチャネル名を抽出できること
- `window.electronAPI.invoke('channel', ...)` パターンを検出できること

**共通確認**:

- すべてのパーサーが `ParseResult`（`channels` と `warnings`）を返すこと
- 正常系 fixture では `warnings` が空配列であること

**テストファイル配置先**: `scripts/__tests__/verify-ipc-4layer/parsers.test.ts`

**期待される成果物**:

- パーサーテスト仕様（`outputs/phase-4/test-specification.md` の「パーサーテスト」セクション）

---

### タスク2: バリデーターテスト設計・作成

**目的**: 3つのバリデーションルールのロジック正確性を検証するテストを作成する

**実行手順**:

1. Phase 2 の検証アルゴリズム設計書（`outputs/phase-2/validation-algorithm-design.md`）を確認し、Rule-1〜Rule-3 の検証ロジックを把握する
2. 以下のバリデーターテストを作成する:

**sharedToPreloadValidator テスト（Rule-1: shared ⊆ preload）**:

- 正常系: shared の全チャネルが preload に存在する場合、不整合 0 件を返すこと
- 異常系: shared に存在し preload に未登録のチャネルがある場合、そのチャネル名を不整合として返すこと
- 境界: shared が空の場合、不整合 0 件を返すこと

**preloadToMainValidator テスト（Rule-2: preload ⊆ handler）**:

- 正常系: preload の全チャネルが main handler に実装されている場合、不整合 0 件を返すこと
- 異常系: preload に存在し main handler に未実装のチャネルがある場合、そのチャネル名を不整合として返すこと
- 境界: preload が空の場合、不整合 0 件を返すこと

**rendererToSharedValidator テスト（Rule-3: consumer ⊆ shared）**:

- 正常系: renderer の全チャネルが shared に定義されている場合、不整合 0 件を返すこと
- 異常系: renderer で使用され shared に未定義のチャネルがある場合、そのチャネル名を不整合として返すこと
- 境界: renderer が空の場合、不整合 0 件を返すこと

**テストファイル配置先**: `scripts/__tests__/verify-ipc-4layer/validators.test.ts`

**期待される成果物**:

- バリデーターテスト仕様（`outputs/phase-4/test-specification.md` の「バリデーターテスト」セクション）

---

### タスク3: レポーター・E2E テスト設計・作成

**目的**: レポーターの出力フォーマットとスクリプト全体の E2E 動作を検証するテストを作成する

**実行手順**:

1. Phase 2 の設計で定義したエラー分類（CRITICAL / WARNING / INFO）と出力フォーマットを確認する
2. 以下のテストを作成する:

**reporter テスト**:

- 不整合なしの場合、成功サマリーを stdout に出力すること
- 不整合ありの場合、エラー詳細を stderr に出力すること
- 各層の検証結果（チャネル数、不整合数）を表形式で出力すること
- GitHub Actions annotations 形式（`::error file=...` / `::warning file=...`）で出力可能なこと
- WARNING のみの場合は CI を失敗させず、警告として表示すること

**E2E テスト（スクリプト全体）**:

- 全チャネルが4層で整合している場合、exit code 0 で終了すること（AC-5 対応）
- 不整合がある場合、exit code 1 で終了すること（AC-6 対応）
- `node scripts/verify-ipc-4layer.js` コマンドで実行可能なこと（AC-1 対応）
- 実行時間が 30 秒以内であること（NFR-1 対応）

**テストファイル配置先**:

- `scripts/__tests__/verify-ipc-4layer/reporter.test.ts`
- `scripts/__tests__/verify-ipc-4layer/e2e.test.ts`

**期待される成果物**:

- レポーター・E2E テスト仕様（`outputs/phase-4/test-specification.md` の該当セクション）

---

### タスク4: 統合テスト計画作成

**目的**: パーサー → バリデーター → レポーターの連携を検証する統合テスト計画を策定する

**実行手順**:

1. 各モジュール間のデータフロー（Set<channelName> の受け渡し）を確認する
2. 以下の統合テストシナリオを計画する:

**統合テストシナリオ**:

| シナリオ               | 入力                              | 期待結果                  | 対応要件         |
| ---------------------- | --------------------------------- | ------------------------- | ---------------- |
| 全層整合               | 4層全てにチャネルが正しく登録     | exit 0, 成功サマリー出力  | AC-5, FR-5       |
| shared→preload 不整合  | shared に存在し preload に未登録  | exit 1, Rule-1 エラー出力 | AC-2, FR-1, FR-4 |
| preload→main 不整合    | preload に存在し main に未実装    | exit 1, Rule-2 エラー出力 | AC-3, FR-2, FR-4 |
| renderer→shared 不整合 | renderer で使用し shared に未定義 | exit 1, Rule-3 エラー出力 | AC-4, FR-3, FR-4 |
| 複合不整合             | 複数ルールで同時に不整合          | exit 1, 全エラー出力      | FR-4, FR-5       |

3. フィクスチャファイルの設計方針を定義する（テスト用の模擬4層ファイル構成）

**期待される成果物**:

- 統合テスト計画（`outputs/phase-4/integration-test-plan.md`）

---

### タスク5: TDD Red 確認

**目的**: 作成した全テストが失敗（Red）することを確認し、実装着手前の基盤を確立する

**実行手順**:

1. 作成したテストファイルを Vitest で実行する
2. 全テストが「実装未存在」により失敗することを確認する
3. 失敗理由が「モジュール未定義」または「関数未定義」であることを確認する（ロジックエラーではないことを保証）
4. Red テスト結果を記録する

**実行コマンド**:

```bash
pnpm vitest run scripts/__tests__/verify-ipc-4layer/ --reporter=verbose 2>&1
```

**判定基準**:

- 全テストケースが FAIL であること
- 失敗理由が実装未存在（import error / module not found / function not defined）であること
- テストコード自体にシンタックスエラーがないこと

**期待される成果物**:

- Red テスト結果（`outputs/phase-4/red-test-result.md`）

---

## TDD 検証セクション

### Red テスト確認基準

| 確認項目                                 | 期待                                          | 判定       |
| ---------------------------------------- | --------------------------------------------- | ---------- |
| テストファイルが Vitest で認識される     | 全ファイルがテストスイートとして認識          | {{result}} |
| 全テストケースが FAIL                    | PASS 件数 = 0                                 | {{result}} |
| 失敗理由がモジュール/関数未定義          | import/require エラーまたは TypeError         | {{result}} |
| テストコード自体のシンタックスエラーなし | パースは成功する                              | {{result}} |
| テストケース数が要件をカバー             | FR-1〜FR-6, AC-1〜AC-8 に対応するテストが存在 | {{result}} |

### テストケース - 要件トレーサビリティ

| テストケース                                         | 対応要件 | 対応AC |
| ---------------------------------------------------- | -------- | ------ |
| sharedChannelParser: チャネル名抽出                  | FR-6     | -      |
| preloadWhitelistParser: ALLOWED_INVOKE_CHANNELS 抽出 | FR-6     | -      |
| mainHandlerParser: ipcMain.handle 抽出               | FR-6     | -      |
| rendererSinkParser: safeInvoke 抽出                  | FR-6     | -      |
| sharedToPreloadValidator: 不整合検出                 | FR-1     | AC-2   |
| preloadToMainValidator: 不整合検出                   | FR-2     | AC-3   |
| rendererToSharedValidator: 不整合検出                | FR-3     | AC-4   |
| reporter: 成功サマリー出力                           | FR-5     | -      |
| reporter: warning 出力                               | FR-5     | -      |
| reporter: エラー詳細出力                             | FR-5     | -      |
| E2E: 整合時 exit 0                                   | FR-4     | AC-5   |
| E2E: 不整合時 exit 1                                 | FR-4     | AC-6   |
| E2E: コマンド実行可能                                | -        | AC-1   |
| E2E: 実行時間 30 秒以内                              | NFR-1    | -      |

---

## 参照資料

| 参照資料                   | パス                                             | 内容                           |
| -------------------------- | ------------------------------------------------ | ------------------------------ |
| Phase 1 要件定義書         | `outputs/phase-1/requirements-definition.md`     | 機能要件・非機能要件           |
| Phase 1 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`         | AC-1〜AC-8                     |
| Phase 2 アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`         | モジュール構成・責務分離       |
| Phase 2 検証アルゴリズム   | `outputs/phase-2/validation-algorithm-design.md` | 正規表現パターン・検証ロジック |
| Phase 2 テスト戦略         | `outputs/phase-2/test-strategy.md`               | テスト分類・テストデータ方針   |
| Phase 2 CI統合設計         | `outputs/phase-2/ci-integration-design.md`       | GitHub Actions 統合方式        |
| Phase 3 設計レビュー結果   | `outputs/phase-3/design-review-result.md`        | レビュー記録                   |
| Phase 3 ゲート判定         | `outputs/phase-3/gate-decision.md`               | Go/No-Go判定                   |
| Phase 3 矛盾チェック表     | `outputs/phase-3/contradiction-checklist.md`     | 矛盾・漏れ検査結果             |

### システム仕様（aiworkflow-requirements）

> テスト作成前に必ず以下のシステム仕様を確認し、テストケースがシステム仕様と整合することを保証してください。

| 参照資料     | パス                                                                                                                      | 内容                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| IPC命名監査  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-naming.md`          | 命名規則と監査パターン    |
| IPC契約監査  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | データフロー型ギャップ    |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md`                          | IPCライフサイクルパターン |

### 実装対象ファイル（テストフィクスチャ設計の参考）

| ファイル | パス                                                      | 役割         |
| -------- | --------------------------------------------------------- | ------------ |
| shared   | `packages/shared/src/ipc/channels.ts`                     | チャネル正本 |
| preload  | `apps/desktop/src/preload/channels.ts`                    | 許可リスト   |
| main     | `apps/desktop/src/main/ipc/*Handlers.ts`                  | ハンドラ実装 |
| renderer | `apps/desktop/src/renderer/utils/sinks/ProductionSink.ts` | 消費者実装   |

---

## 成果物

| 成果物         | パス                                       | 内容                          |
| -------------- | ------------------------------------------ | ----------------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | 全テストケースの設計・仕様    |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`       | TDD Red 確認結果（全件 FAIL） |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 層間連携テストシナリオと計画  |

---

## 統合テスト連携（Phase 1〜11は必須）

- パーサー連携: 各パーサーが返す `Set<channelName>` のデータ形式が統一されていることをテストで保証する
- バリデーター連携: パーサー出力をバリデーターに渡した際の入出力整合をテストで検証する
- CI連携: E2E テストで `node scripts/verify-ipc-4layer.js` の exit code と stdout/stderr 出力を検証する
- フィクスチャ連携: テスト用フィクスチャが実際の4層ファイルのコードパターンを正確に模倣していることを保証する

---

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `pnpm install` + `pnpm --filter @repo/shared build` が成功（FB-MSO-002対応）
- [ ] パーサーテスト（4モジュール分）が作成されている
- [ ] バリデーターテスト（3ルール分）が作成されている
- [ ] レポーターテストが作成されている
- [ ] E2E テストが作成されている
- [ ] 全テストが Red（FAIL）であることが確認されている
- [ ] テストケースが FR-1〜FR-6, AC-1〜AC-8 を網羅している
- [ ] テストコード自体にシンタックスエラーがない
- [ ] 統合テスト計画が策定されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] TDD Red 確認基準の全項目が記録されていること

---

## 依存関係

- **前提**: Phase 3 が PASS または MINOR（是正完了）で完了していること
- **後続**: Phase 5 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- タスク0 依存関係整合確認: {{result}}
- タスク1 パーサーテスト設計・作成: {{result}}
- タスク2 バリデーターテスト設計・作成: {{result}}
- タスク3 レポーター・E2Eテスト設計・作成: {{result}}
- タスク4 統合テスト計画作成: {{result}}
- タスク5 TDD Red確認: {{result}}

### TDD Red 確認結果

- テストファイル数: {{count}}
- テストケース総数: {{count}}
- FAIL件数: {{count}} (期待: 全件)
- PASS件数: {{count}} (期待: 0件)
- 失敗理由: {{module not found / function not defined / etc.}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/phase-5-implementation.md`
