# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 2                                  |
| Phase名    | 設計                               |
| 前提Phase  | Phase 1                            |
| 後続Phase  | Phase 3                            |
| ステータス | 未実施                             |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

IPC 4層整合検証スクリプトのアーキテクチャ設計・モジュール構成・検証アルゴリズム・CI統合方式を固定する。既存の `check-ipc-contracts.ts` との共存設計を含む。

## 背景

Phase 1 で固定した要件（FR-1〜FR-6、NFR-1〜NFR-4）と受け入れ基準（AC-1〜AC-8）に基づき、実装可能な設計を策定する。正規表現ベースの静的解析で4層間のチャネル定義整合性を検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-2/` 配下の成果物へ記録する。

### タスク1: アーキテクチャ設計

**目的**: スクリプトのモジュール構成と責務分離を設計する

**実行手順**:

1. スクリプトの全体構成（エントリポイント → パーサー → バリデーター → レポーター）を設計する
2. 各モジュールの責務境界を定義する
3. 既存 `check-ipc-contracts.ts` との機能重複を分析し、共存方式を決定する
4. 既存コンポーネント再利用可否を確認する（FB-SDK-07-1対応）

**設計方針**:

```
scripts/verify-ipc-4layer.js
├── parsers/
│   ├── sharedChannelParser    # shared channels.ts からチャネル名と警告を抽出
│   ├── preloadWhitelistParser # preload channels.ts から ALLOWED_INVOKE_CHANNELS を抽出
│   ├── mainHandlerParser      # main/ipc/*.ts からハンドラ登録チャネルを抽出
│   └── rendererSinkParser     # ProductionSink.ts からチャネル使用を抽出
├── validators/
│   ├── sharedToPreloadValidator   # FR-1: shared → preload 整合
│   ├── preloadToMainValidator     # FR-2: preload → main 整合
│   └── rendererToSharedValidator  # FR-3: renderer → shared 整合
└── reporter                       # ParseResult / ValidationResult を集約し severity を分類
```

**期待される成果物**:

- アーキテクチャ設計書（`outputs/phase-2/architecture-design.md`）

---

### タスク2: 検証アルゴリズム設計

**目的**: 4層間の整合性チェックロジックを設計する

**実行手順**:

1. 各パーサーの正規表現パターンを設計する
2. チャネル名の抽出方式（定数参照 vs リテラル文字列 vs 動的生成）を定義する
3. 検証の方向性（正本→下流 vs 双方向）を確定する
4. エラー分類（CRITICAL / WARNING / INFO）を定義する
5. `WARNING` は静的解析の限界、stale 定義、名前変更の途中状態を表し、CI を即失敗させない

**検証フロー**:

```
Step 1: Parse
  shared channels.ts    → ParseResult { channels, warnings }  (正本)
  preload channels.ts   → ParseResult { channels, warnings }  (whitelist)
  main/ipc/*.ts         → ParseResult { channels, warnings }  (handler)
  renderer sinks        → ParseResult { channels, warnings }  (consumer)

Step 2: Validate
  Rule-1: shared ⊆ preload
    - missing = shared - preload   (ERROR)
    - warnings = preload - shared   (STALE / renamed)
  Rule-2: preload ⊆ handler
    - missing = preload - handler   (ERROR)
    - warnings = handler - preload   (STALE / renamed)
  Rule-3: consumer ⊆ shared
    - missing = consumer - shared   (ERROR)
    - warnings = parser 由来の動的・曖昧チャネル警告を集約

Step 3: Report
  missing あり → stderr + exit 1
  warnings のみ → stdout + `::warning` + exit 0
  整合       → stdout summary + exit 0
```

**期待される成果物**:

- 検証アルゴリズム設計書（`outputs/phase-2/validation-algorithm-design.md` に含む）

---

### タスク3: CI統合設計

**目的**: GitHub Actions への組み込み方式を設計する

**実行手順**:

1. 実行タイミング（PR時 / push時 / 定期実行）を決定する
2. ワークフロー定義ファイルの配置場所と構成を設計する
3. 失敗時の出力フォーマット（GitHub Actions annotations対応）を設計する
4. 既存CIワークフローとの統合方式を決定する

**期待される成果物**:

- CI統合設計書（`outputs/phase-2/ci-integration-design.md`）

---

### タスク4: テスト戦略策定

**目的**: 検証スクリプト自体のテスト方針を策定する

**実行手順**:

1. テスト対象（パーサー / バリデーター / レポーター / E2E）を分類する
2. テストデータ（正常系 / 異常系 / エッジケース）の準備方針を定義する
3. テストフレームワーク（Vitest）と実行方式を決定する
4. モック戦略（ファイルシステムモック vs フィクスチャファイル）を決定する

**期待される成果物**:

- テスト戦略書（`outputs/phase-2/test-strategy.md`）

---

### タスク5: 依存整合マトリクス作成

**目的**: Phase間の依存関係と更新対象を明確化する

**実行手順**:

1. 各Phaseの入力成果物と出力成果物の依存関係を整理する
2. 更新対象ファイルの一覧を作成する
3. aiworkflow-requirements 仕様との整合点を明示する

**期待される成果物**:

- 依存整合マトリクス（`outputs/phase-2/dependency-consistency-matrix.md`）

---

## 参照資料

| 参照資料                 | パス                                          | 内容                                      |
| ------------------------ | --------------------------------------------- | ----------------------------------------- |
| Phase 1 要件定義書       | `outputs/phase-1/requirements-definition.md`  | 機能要件・非機能要件                      |
| Phase 1 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`      | AC-1〜AC-8                                |
| Phase 1 仕様マッピング   | `outputs/phase-1/spec-extraction-map.md`      | aiworkflow仕様とcurrent code anchorの対応 |
| Phase 1 トレーサビリティ | `outputs/phase-1/traceability-matrix.md`      | 要件-仕様対応表                           |
| Phase 1 既存資産棚卸し   | `outputs/phase-1/asset-inventory.md`          | 既存検証機能マッピング                    |
| 既存検証スクリプト       | `apps/desktop/scripts/check-ipc-contracts.ts` | R-01〜R-04ルール                          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                                                                                      | 内容                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| IPC命名監査  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-naming.md`          | 命名規則と監査パターン    |
| IPC契約監査  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | データフロー型ギャップ    |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md`                          | IPCライフサイクルパターン |

---

## 成果物

| 成果物               | パス                                               | 内容                           |
| -------------------- | -------------------------------------------------- | ------------------------------ |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`           | モジュール構成・責務分離       |
| 検証アルゴリズム設計 | `outputs/phase-2/validation-algorithm-design.md`   | 正規表現パターン・検証ロジック |
| CI統合設計           | `outputs/phase-2/ci-integration-design.md`         | GitHub Actions統合方式         |
| テスト戦略           | `outputs/phase-2/test-strategy.md`                 | テスト分類・テストデータ方針   |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md` | Phase間依存関係表              |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合ポイント: `verify-ipc-4layer.js` → 4層ファイルの読み取りインターフェースを契約として定義
- CI統合: GitHub Actions ステップ定義でのパス指定・環境変数を設計に反映
- 既存スクリプト共存: `check-ipc-contracts.ts` と `verify-ipc-4layer.js` の実行順序・結果マージ方式を設計

## 多角的チェック観点（AIが判断）

- 批判的思考: 既存チェッカーとの役割衝突がないか
- システム思考: parser / validator / reporter の依存関係が閉じているか
- 因果関係分析: missing と warning の発生源と伝播経路が明確か
- 抽象化思考: 個別チャネルではなく 4 層間の契約として設計できているか

## サブタスク管理

- Task 1 でモジュール境界を固定し、その後に Task 2 のロジックを詳細化する
- Task 3 と Task 4 は Task 1 の責務境界が確定してから並行レビュー可能にする
- Task 5 は Task 1〜4 の結果を統合した後に直列でまとめる

---

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] モジュール構成が単一責務原則に従っている
- [ ] 検証アルゴリズムが FR-1〜FR-6 を全てカバーしている
- [ ] CI統合方式が NFR-1〜NFR-4 を満たす設計である
- [ ] 既存 `check-ipc-contracts.ts` との共存方式が明確である
- [ ] テスト戦略がAC-8を達成可能な設計である
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1 アーキテクチャ設計: {{result}}
- タスク2 検証アルゴリズム設計: {{result}}
- タスク3 CI統合設計: {{result}}
- タスク4 テスト戦略策定: {{result}}
- タスク5 依存整合マトリクス: {{result}}

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

`docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/phase-3-design-review.md`
