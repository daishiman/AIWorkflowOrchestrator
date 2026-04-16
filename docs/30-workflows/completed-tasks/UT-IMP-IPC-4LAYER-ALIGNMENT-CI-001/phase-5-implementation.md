# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 5                                  |
| Phase名    | 実装                               |
| 前提Phase  | Phase 4                            |
| 後続Phase  | Phase 6                            |
| ステータス | 未実施                             |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

Phase 4 で作成した Red テストを Green に移行するため、`scripts/verify-ipc-4layer.js` の実装と GitHub Actions ワークフロー定義を作成する。parsers → validators → reporter の順で最小実装を行い、TDD Green を達成する。

## 背景

Phase 4 で全テストケースが Red（FAIL）であることを確認済みである。本 Phase では Phase 2 の設計に基づき、正規表現ベースの静的解析スクリプトを実装する。実装完了後、Phase 4 のテストが全件 Green（PASS）に遷移することで要件充足を確認する。

新規作成ファイルと修正ファイルの一覧を明確に管理し、変更差分の追跡可能性を保証する（Feedback RT-03 対応）。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-5/` 配下の成果物へ記録する。

### タスク1: パーサー実装

**目的**: 4層ファイルからチャネル名を抽出するパーサーモジュールを実装する

**実行手順**:

1. Phase 2 のアーキテクチャ設計書（`outputs/phase-2/architecture-design.md`）のモジュール構成に従い実装する
2. Phase 2 の検証アルゴリズム設計書（`outputs/phase-2/validation-algorithm-design.md`）の正規表現パターンを実装する
3. 以下の順序で各パーサーを実装する:

**sharedChannelParser**:

- `packages/shared/src/ipc/channels.ts` を読み取り、`ParseResult`（`{ channels: Set<string>; warnings: string[] }`）として返す
- `export const` ブロック内の文字列リテラル（`'domain:operation'` 形式）を正規表現で抽出する
- コメント行を除外する
- 動的生成や曖昧な定義を検出した場合は `warnings: string[]` に記録する

**preloadWhitelistParser**:

- `apps/desktop/src/preload/channels.ts` を読み取り、`ParseResult`（`{ channels: Set<string>; warnings: string[] }`）として返す
- 定数参照パターンと文字列リテラルパターンの両方に対応する

**mainHandlerParser**:

- `apps/desktop/src/main/ipc/*Handlers.ts` をグロブで列挙し、`ParseResult`（`{ channels: Set<string>; warnings: string[] }`）として返す
- 複数ファイルからの結果を集約する

**rendererSinkParser**:

- `apps/desktop/src/renderer/utils/sinks/ProductionSink.ts` を読み取り、`ParseResult`（`{ channels: Set<string>; warnings: string[] }`）として返す
- テンプレートリテラルや変数経由のチャネル指定を検出した場合は `warnings: string[]` に記録する

4. 各パーサー実装後、Phase 4 の対応テストを実行し Green に遷移することを確認する

**期待される成果物**:

- 実装サマリーの「パーサー実装」セクション（`outputs/phase-5/implementation-summary.md`）

---

### タスク2: バリデーター実装

**目的**: 3つの検証ルール（Rule-1〜Rule-3）を実装する

**実行手順**:

1. Phase 2 の検証アルゴリズム設計書の Rule-1〜Rule-3 に従い実装する
2. 以下の順序で各バリデーターを実装する:

**sharedToPreloadValidator（Rule-1: shared ⊆ preload）**:

- shared のチャネル集合と preload のチャネル集合を受け取る
- shared に存在し preload に未登録のチャネルを不整合として返す
- preload にしか存在しない stale チャネルは warning として返す
- 戻り値: `{ rule: 'Rule-1', missing: string[], warnings: string[], valid: boolean }`

**preloadToMainValidator（Rule-2: preload ⊆ handler）**:

- preload のチャネル集合と main handler のチャネル集合を受け取る
- preload に存在し main handler に未実装のチャネルを不整合として返す
- handler にしか存在しない stale チャネルは warning として返す
- 戻り値: `{ rule: 'Rule-2', missing: string[], warnings: string[], valid: boolean }`

**rendererToSharedValidator（Rule-3: consumer ⊆ shared）**:

- renderer のチャネル集合と shared のチャネル集合を受け取る
- renderer で使用され shared に未定義のチャネルを不整合として返す
- parser が返した dynamic / ambiguous warning をそのまま伝播する
- 戻り値: `{ rule: 'Rule-3', missing: string[], warnings: string[], valid: boolean }`

3. 各バリデーター実装後、Phase 4 の対応テストを実行し Green に遷移することを確認する

**期待される成果物**:

- 実装サマリーの「バリデーター実装」セクション（`outputs/phase-5/implementation-summary.md`）

---

### タスク3: レポーター・エントリポイント実装

**目的**: 検証結果の出力フォーマッターとスクリプトのエントリポイントを実装する

**実行手順**:

1. Phase 2 の設計に基づき、レポーターモジュールを実装する:

**reporter**:

- 全バリデーション結果を受け取り、人間可読な形式で出力する（FR-5 対応）
- 正常時: stdout にサマリー（各層のチャネル数、全ルール PASS）を出力
- 異常時: stderr にエラー詳細（ルール名、不整合チャネル名、対象ファイルパス）を出力
- warning 時: stdout に警告詳細と `::warning file=...` を出力し、exit code 0 を維持する
- GitHub Actions annotations 形式（`::error file=...` / `::warning file=...`）での出力をサポート

2. エントリポイント（`scripts/verify-ipc-4layer.js`）を実装する:

**エントリポイント**:

- パーサー → バリデーター → レポーターの実行パイプラインを構築する
- 全ルール PASS の場合は exit code 0 で終了する（AC-5 対応）
- いずれかのルールが FAIL の場合は exit code 1 で終了する（AC-6 対応）
- warning のみの場合は exit code 0 を維持し、警告を出力する
- Node.js 単体で実行可能（外部依存なし）とする（NFR-2 対応）

3. 全テスト（パーサー / バリデーター / レポーター / E2E）を実行し、全件 Green を確認する

**実行コマンド**:

```bash
pnpm vitest run scripts/__tests__/verify-ipc-4layer/ --reporter=verbose 2>&1
```

**期待される成果物**:

- 実装サマリーの「レポーター・エントリポイント実装」セクション（`outputs/phase-5/implementation-summary.md`）

---

### タスク4: GitHub Actions ワークフロー定義

**目的**: CI パイプラインに IPC 4層整合検証ステップを組み込む

**実行手順**:

1. Phase 2 の CI 統合設計書（`outputs/phase-2/ci-integration-design.md`）に基づき、ワークフロー定義を作成する
2. 以下の要件を満たすワークフロー定義を実装する:

**実行タイミング**:

- Pull Request 作成時 / 更新時
- `packages/shared/src/ipc/` 配下の変更時
- `apps/desktop/src/preload/` 配下の変更時
- `apps/desktop/src/main/ipc/` 配下の変更時
- `apps/desktop/src/renderer/utils/sinks/` 配下の変更時

**ステップ構成**:

- Node.js セットアップ
- pnpm install
- `node scripts/verify-ipc-4layer.js` 実行
- 実行時間が 30 秒以内であることを保証（NFR-1）

3. 既存 CI ワークフローとの統合方式（新規ワークフロー or 既存ワークフローへのステップ追加）を Phase 2 設計に基づき決定する

**期待される成果物**:

- CI 統合実装の記録（`outputs/phase-5/implementation-summary.md` の「CI統合」セクション）

---

### タスク5: 変更ファイル一覧・契約差分記録（Feedback RT-03 対応）

**目的**: 本 Phase で新規作成・修正した全ファイルの一覧と契約変更差分を記録する

**実行手順**:

1. 新規作成ファイル一覧を作成する
2. 修正ファイル一覧を作成する
3. 各ファイルの変更目的と影響範囲を記録する
4. IPC 契約（チャネル定義・型・セキュリティ境界）への影響差分を記録する

**新規作成ファイル（予定）**:

| ファイル            | パス                                                                        | 目的                              |
| ------------------- | --------------------------------------------------------------------------- | --------------------------------- |
| 検証スクリプト本体  | `scripts/verify-ipc-4layer.js`                                              | IPC 4層整合検証のエントリポイント |
| GitHub Actions 定義 | `.github/workflows/verify-ipc-4layer.yml`（または既存ワークフローへの追加） | CI 自動検証                       |

**修正ファイル（予定）**:

| ファイル     | パス           | 変更内容                                         |
| ------------ | -------------- | ------------------------------------------------ |
| package.json | `package.json` | npm scripts への検証コマンド追加（該当する場合） |

**期待される成果物**:

- 変更ファイル一覧（`outputs/phase-5/changed-files.md`）
- 契約差分記録（`outputs/phase-5/contract-diff.md`）

---

### タスク6: TDD Green 確認

**目的**: Phase 4 で作成した全テストが Green（PASS）に遷移したことを確認する

**実行手順**:

1. Phase 4 で作成した全テストスイートを実行する
2. 全テストケースが PASS であることを確認する
3. E2E テストで exit code の正常性を確認する
4. 実行時間が NFR-1（30 秒以内）を満たすことを確認する

**実行コマンド**:

```bash
pnpm vitest run scripts/__tests__/verify-ipc-4layer/ --reporter=verbose 2>&1
```

**判定基準**:

- 全テストケースが PASS であること
- FAIL 件数が 0 であること
- E2E テストの exit code テストが正常であること

**期待される成果物**:

- Green テスト結果（`outputs/phase-5/implementation-summary.md` の「TDD Green 確認」セクション）

---

## 参照資料

| 参照資料                   | パス                                             | 内容                           |
| -------------------------- | ------------------------------------------------ | ------------------------------ |
| Phase 1 要件定義書         | `outputs/phase-1/requirements-definition.md`     | 機能要件・非機能要件           |
| Phase 1 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`         | AC-1〜AC-8                     |
| Phase 2 アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`         | モジュール構成・責務分離       |
| Phase 2 検証アルゴリズム   | `outputs/phase-2/validation-algorithm-design.md` | 正規表現パターン・検証ロジック |
| Phase 2 CI統合設計         | `outputs/phase-2/ci-integration-design.md`       | GitHub Actions 統合方式        |
| Phase 2 テスト戦略         | `outputs/phase-2/test-strategy.md`               | テスト分類・テストデータ方針   |
| Phase 3 ゲート判定         | `outputs/phase-3/gate-decision.md`               | Go/No-Go判定                   |
| Phase 4 テスト仕様書       | `outputs/phase-4/test-specification.md`          | 全テストケースの設計・仕様     |
| Phase 4 Red テスト結果     | `outputs/phase-4/red-test-result.md`             | TDD Red 確認結果               |
| Phase 4 統合テスト計画     | `outputs/phase-4/integration-test-plan.md`       | 層間連携テストシナリオ         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                                                                                      | 内容                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| IPC命名監査  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-naming.md`          | 命名規則と監査パターン    |
| IPC契約監査  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | データフロー型ギャップ    |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md`                          | IPCライフサイクルパターン |

### 実装対象ファイル（4層正本）

| Layer    | パス                                                      | 役割         |
| -------- | --------------------------------------------------------- | ------------ |
| shared   | `packages/shared/src/ipc/channels.ts`                     | チャネル正本 |
| preload  | `apps/desktop/src/preload/channels.ts`                    | 許可リスト   |
| main     | `apps/desktop/src/main/ipc/*Handlers.ts`                  | ハンドラ実装 |
| renderer | `apps/desktop/src/renderer/utils/sinks/ProductionSink.ts` | 消費者実装   |

---

## 成果物

| 成果物           | パス                                        | 内容                                    |
| ---------------- | ------------------------------------------- | --------------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容・TDD Green 確認・CI統合結果    |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 新規作成・修正ファイル一覧（RT-03対応） |
| 契約差分記録     | `outputs/phase-5/contract-diff.md`          | IPC契約への影響差分                     |

---

## 統合テスト連携（Phase 1〜11は必須）

- パーサー → バリデーター連携: パーサーが返す `Set<string>` をバリデーターが正しく受け取り検証できることを実装で保証する
- バリデーター → レポーター連携: バリデーション結果オブジェクトをレポーターが正しくフォーマットできることを実装で保証する
- CI連携: GitHub Actions ワークフローで `node scripts/verify-ipc-4layer.js` が正常に実行され、exit code が正しく伝搬することを確認する
- 既存スクリプト共存: `check-ipc-contracts.ts` と `verify-ipc-4layer.js` が干渉せず並行実行できることを確認する

---

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `scripts/verify-ipc-4layer.js` が `node scripts/verify-ipc-4layer.js` で実行可能（AC-1）
- [ ] 4つのパーサーが実装され、テストが Green
- [ ] 3つのバリデーターが実装され、テストが Green
- [ ] レポーターが実装され、テストが Green
- [ ] E2E テストが全件 Green
- [ ] Phase 4 の全テストケースが PASS（TDD Green 達成）
- [ ] GitHub Actions ワークフロー定義が作成されている（AC-7）
- [ ] 新規作成ファイル一覧・修正ファイル一覧が記録されている（RT-03 対応）
- [ ] 契約差分が記録されている
- [ ] 実行時間が 30 秒以内（NFR-1）
- [ ] 外部依存なしで実行可能（NFR-2）
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] TDD Green（Phase 4 の全テスト PASS）が確認されていること

---

## 依存関係

- **前提**: Phase 4 が完了していること（全テストが Red 確認済み）
- **後続**: Phase 6 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- タスク1 パーサー実装: {{result}}
- タスク2 バリデーター実装: {{result}}
- タスク3 レポーター・エントリポイント実装: {{result}}
- タスク4 GitHub Actions ワークフロー定義: {{result}}
- タスク5 変更ファイル一覧・契約差分記録: {{result}}
- タスク6 TDD Green 確認: {{result}}

### TDD Green 確認結果

- テストケース総数: {{count}}
- PASS件数: {{count}} (期待: 全件)
- FAIL件数: {{count}} (期待: 0件)
- 実行時間: {{seconds}}秒

### 新規作成ファイル

- {{filepath}}: {{purpose}}

### 修正ファイル

- {{filepath}}: {{change}}

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

`docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/phase-6-test-expansion.md`
