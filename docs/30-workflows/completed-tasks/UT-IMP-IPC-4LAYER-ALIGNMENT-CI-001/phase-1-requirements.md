# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 1                                  |
| Phase名    | 要件定義                           |
| 前提Phase  | -                                  |
| 後続Phase  | Phase 2                            |
| ステータス | 未実施                             |
| 作成日     | 2026-04-14                         |
| 機能名     | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| タスク分類 | 改善（NON_VISUAL）                 |

---

## 目的

IPC 4層（shared channels / preload whitelist / main handler / renderer sink）の整合性を自動検証する CI スクリプトの要件境界を固定する。手動チェックでは検出できない ALLOWED_INVOKE_CHANNELS 追記漏れを CI で自動検出し、FB-SC-13-1 の再発を防止する。

## 背景

UT-SKILL-WIZARD-W4-ANALYTICS-BACKEND-001 の実装で `analytics:trackEvent` チャネルを追加した際、以下 4 ファイルの手動同期が必要だった。現状は手動チェックのみで CI 自動検証がないため、FB-SC-13-1（`ALLOWED_INVOKE_CHANNELS` 追記漏れ）の再発リスクがある。

| Layer    | ファイル                                                  | 役割         |
| -------- | --------------------------------------------------------- | ------------ |
| shared   | `packages/shared/src/ipc/channels.ts`（正本）             | チャネル定義 |
| preload  | `apps/desktop/src/preload/channels.ts`（whitelist）       | 許可リスト   |
| main     | `apps/desktop/src/main/ipc/*Handlers.ts`                  | ハンドラ実装 |
| renderer | `apps/desktop/src/renderer/utils/sinks/ProductionSink.ts` | 消費者実装   |

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**
>
> - このセクションには plan のみを書く。
> - 実行結果、判定、取得値は `Phase実行記録` または `outputs/phase-1/` 配下の成果物へ記録する。

### タスク1: 既存資産棚卸し

**目的**: 既存のIPC検証スクリプトと4層ファイルの現状を正確に把握する

**実行手順**:

1. `apps/desktop/scripts/check-ipc-contracts.ts` の検証ルール（R-01〜R-04）と検出対象を確認する
2. `packages/shared/src/ipc/channels.ts` のチャネル定義構造（エクスポートパターン、命名規則 `domain:operation`）を分析する
3. `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` の構造を分析する
4. `apps/desktop/src/main/ipc/` 配下のハンドラ一覧と登録パターンを確認する
5. `apps/desktop/src/renderer/utils/sinks/ProductionSink.ts` のチャネル使用パターンを確認する
6. `git log --oneline -5` で前タスク成果物を棚卸しし、新規作業との差異を明確化する

**期待される成果物**:

- 既存検証スクリプトの機能マッピング（`outputs/phase-1/asset-inventory.md` に記録）

---

### タスク2: 要件抽出

**目的**: 機能要件と非機能要件を抽出し固定する

**実行手順**:

1. Issue #2117 の実装内容から機能要件を抽出する
2. aiworkflow-requirements の resource-map.md を起点に IPC 関連仕様を参照する
3. 既存 `check-ipc-contracts.ts` との機能重複・補完関係を整理する
4. CI実行環境（GitHub Actions）の制約を確認する

**期待される成果物**:

- 要件定義書（`outputs/phase-1/requirements-definition.md`）

**機能要件（FR）**:

- FR-1: shared channels.ts で定義されたチャネルが preload whitelist に登録されていることを検証する
- FR-2: preload whitelist のチャネルが main handler で実装されていることを検証する
- FR-3: renderer sink で使用されるチャネルが shared channels.ts に定義されていることを検証する
- FR-4: 未登録チャネル検出時に CI を失敗させる（exit code 1）
- FR-5: 検証結果を人間が読みやすい形式で出力する
- FR-6: 正規表現ベースの静的解析で検証する（AST解析は初期スコープ外）

**非機能要件（NFR）**:

- NFR-1: CI実行時間 30秒以内
- NFR-2: Node.js 単体で実行可能（外部依存なし）
- NFR-3: 既存の `check-ipc-contracts.ts` と共存可能
- NFR-4: 新規チャネル追加時に手動メンテナンス不要（自動検出）

---

### タスク3: 受け入れ基準定義

**目的**: 検証可能な受け入れ基準を定義する

**実行手順**:

1. 各機能要件に対応する受け入れ基準を定義する
2. 各基準が検証可能（テスト実行で合否判定可能）であることを確認する

**期待される成果物**:

- 受け入れ基準（`outputs/phase-1/acceptance-criteria.md`）

**受け入れ基準**:

- AC-1: `scripts/verify-ipc-4layer.js` が存在し、`node scripts/verify-ipc-4layer.js` で実行可能
- AC-2: shared channels に存在し preload whitelist に未登録のチャネルを検出してエラー出力する
- AC-3: preload whitelist に存在し main handler に未実装のチャネルを検出してエラー出力する
- AC-4: renderer sink で使用され shared channels に未定義のチャネルを検出してエラー出力する
- AC-5: 全チャネルが4層で整合している場合は exit code 0 で正常終了する
- AC-6: 不整合がある場合は exit code 1 でCI失敗する
- AC-7: GitHub Actions ワークフローに検証ステップが組み込まれている
- AC-8: `scripts/verify-ipc-4layer.js` のユニットテストが存在し全件パスする

---

### タスク4: 仕様マッピング・トレーサビリティ固定

**目的**: システム仕様との整合性を確保するため、関連仕様と current code anchor の対応を固定する

**実行手順**:

1. `resource-map.md` を起点に IPC / CI / security 関連カテゴリを確定する
2. 抽出した仕様を API/Interface/Security/Architecture/Workflow に分類する
3. 仕様とタスク要件の対応関係および current code anchor を 1:1 でマッピングする

**期待される成果物**:

- 仕様マッピング結果（`outputs/phase-1/spec-extraction-map.md`）
- トレーサビリティ行列（`outputs/phase-1/traceability-matrix.md`）

---

## 参照資料

| 参照資料           | パス                                                      | 内容                    |
| ------------------ | --------------------------------------------------------- | ----------------------- |
| Issue #2117        | GitHub Issue                                              | タスク定義元            |
| shared channels    | `packages/shared/src/ipc/channels.ts`                     | チャネル正本定義        |
| preload whitelist  | `apps/desktop/src/preload/channels.ts`                    | チャネル許可リスト      |
| main handlers      | `apps/desktop/src/main/ipc/`                              | IPCハンドラ実装         |
| renderer sink      | `apps/desktop/src/renderer/utils/sinks/ProductionSink.ts` | チャネル消費者          |
| 既存検証スクリプト | `apps/desktop/scripts/check-ipc-contracts.ts`             | 既存のIPC契約チェッカー |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                                                                      | 内容                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| IPC命名監査    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-naming.md`          | IPC命名規則と監査パターン  |
| IPC契約監査    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | データフロー型ギャップ検出 |
| リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                          | 仕様抽出起点               |

---

## 成果物

| 成果物               | パス                                         | 内容                                      |
| -------------------- | -------------------------------------------- | ----------------------------------------- |
| 既存資産棚卸し       | `outputs/phase-1/asset-inventory.md`         | 既存検証機能のマッピング                  |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件                      |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧                          |
| 仕様マッピング       | `outputs/phase-1/spec-extraction-map.md`     | aiworkflow仕様とcurrent code anchorの対応 |
| トレーサビリティ行列 | `outputs/phase-1/traceability-matrix.md`     | 要件と仕様の対応表                        |

---

## 統合テスト連携（Phase 1〜11は必須）

- 接続要件: `scripts/verify-ipc-4layer.js` → 4層ファイル（読み取り専用）の依存関係を要件に明記
- CI統合: GitHub Actions での実行環境（Node.js バージョン、作業ディレクトリ）を要件に含める
- 既存スクリプト共存: `check-ipc-contracts.ts` との実行順序・結果統合方針を定義する

## 多角的チェック観点（AIが判断）

- 批判的思考: 既存資産と新規仕様の重複や衝突がないか
- MECE: 要件、受け入れ基準、仕様マップ、トレーサビリティが漏れなく分離されているか
- 演繹思考: 要件→基準→マップ→成果物の順で矛盾がないか
- why思考: なぜ既存チェックでは不足するのかを明文化できているか

## サブタスク管理

- Task 1 と Task 2 は順次実行する
- Task 3 は Task 2 の内容を受けて定義する
- Task 4 は Task 2/3 の確定後に current code anchor を固定する
- 参照資料の棚卸しは独立して確認し、差分がある場合のみ Task 4 に戻す

---

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 4層（shared/preload/main/renderer）の責務境界が明確に定義されている
- [ ] 既存 `check-ipc-contracts.ts` との機能差分が明確化されている
- [ ] 受け入れ基準（AC-1〜AC-8）が全て検証可能である
- [ ] aiworkflow-requirements との整合性が確認されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（初回Phase）
- **後続**: Phase 2 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- タスク1 既存資産棚卸し: {{result}}
- タスク2 要件抽出: {{result}}
- タスク3 受け入れ基準定義: {{result}}
- タスク4 仕様マッピング・トレーサビリティ固定: {{result}}

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

`docs/30-workflows/UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001/phase-2-design.md`
