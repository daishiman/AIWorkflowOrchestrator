# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 1                              |
| Phase名    | 要件定義                       |
| 前提Phase  | -                              |
| 後続Phase  | Phase 2                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-12                     |
| 機能名     | history-service-db-integration |

---

## 目的

CONV-05-02で実装されたshared HistoryServiceの実装を確認し、ElectronのHistoryServiceとの統合方法を決定する。両者のインターフェース互換性を分析し、統合に必要な要件を明確にする。

## 背景

ElectronのHistoryService（`apps/desktop/src/main/services/HistoryService.ts`）は現在スタブ実装であり、空のデータを返す。CONV-05-02でsharedパッケージに実装されたHistoryService（`packages/shared/src/services/history/history-service.ts`）と統合することで、実際のデータベースから履歴データを取得できるようにする必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: CONV-05-02成果物の確認

**目的**: sharedパッケージのHistoryService実装を理解する

**実行手順**:

1. `packages/shared/src/services/history/history-service.ts` を読み、以下を確認:
   - 公開メソッド一覧
   - 各メソッドのシグネチャ（引数・戻り値の型）
   - 依存するRepository/サービス
2. `packages/shared/src/services/history/types.ts` を読み、型定義を確認
3. `packages/shared/src/services/history/__tests__/history-service.test.ts` を読み、テストケースを確認

**期待される成果物**:

- shared HistoryService APIリスト

---

### タスク2: インターフェース互換性分析

**目的**: 両HistoryServiceのインターフェースを比較し、互換性を確認する

**実行手順**:

1. ElectronのHistoryService（スタブ）のインターフェースを確認:
   - `getFileHistory(fileId, options)` → `PaginatedResult<VersionHistoryItem>`
   - `getVersionDetail(conversionId)` → `VersionDetailData`
   - `getConversionLogs(conversionId, options)` → `PaginatedResult<ConversionLog>`
   - `restoreVersion(fileId, conversionId)` → `VersionHistoryItem`
2. sharedのHistoryServiceのインターフェースと比較
3. 型の差異を特定（命名の違い、フィールドの違い）
4. 互換性マッピング表を作成

**期待される成果物**:

- インターフェース互換性分析表

---

### タスク3: データベース依存関係の確認

**目的**: 統合に必要なリポジトリと依存関係を特定する

**実行手順**:

1. sharedのHistoryServiceが依存するリポジトリを確認:
   - `ConversionRepository`
   - `FileRepository`
   - `IConversionLogger`
2. 各リポジトリの実装状況を確認
3. Electron環境で利用可能かを確認
4. 必要な初期化手順を特定

**期待される成果物**:

- 依存関係リスト

---

### タスク4: 統合要件の文書化

**目的**: 統合に必要な要件を明確にする

**実行手順**:

1. 機能要件を整理:
   - 履歴一覧取得機能
   - バージョン詳細取得機能
   - 変換ログ取得機能
   - バージョン復元機能
2. 非機能要件を整理:
   - パフォーマンス要件（応答時間）
   - エラーハンドリング要件
   - ログ出力要件
3. 受け入れ基準を定義

**期待される成果物**:

- 要件定義書（`outputs/phase-1/requirements-definition.md`）
- 受け入れ基準（`outputs/phase-1/acceptance-criteria.md`）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                       | 内容                                    |
| -------------------- | -------------------------------------------------------------------------- | --------------------------------------- |
| 履歴UI仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | 履歴パネルUI設計・IPCチャンネル定義     |
| データベーススキーマ | `.claude/skills/aiworkflow-requirements/references/database-schema.md`     | conversions/conversion_logsテーブル定義 |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`      | Result型パターン                        |

### 関連コード

| 参照資料                | パス                                                      | 説明                 |
| ----------------------- | --------------------------------------------------------- | -------------------- |
| shared HistoryService   | `packages/shared/src/services/history/history-service.ts` | 統合対象の実装       |
| shared types            | `packages/shared/src/services/history/types.ts`           | 型定義               |
| Electron HistoryService | `apps/desktop/src/main/services/HistoryService.ts`        | 現在のスタブ実装     |
| Renderer types          | `apps/desktop/src/renderer/components/history/types.ts`   | フロントエンド型定義 |

---

## 成果物

| 成果物       | パス                                         | 内容                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各要件の受け入れ条件 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲の明確化     |

---

## 統合テスト連携（Phase 1〜11は必須）

DB接続要件、shared HistoryServiceとのインターフェース互換性を確認し、以下を要件として明記:

- IPCハンドラーからHistoryServiceへの接続要件
- shared HistoryServiceとRenderer型の互換性
- ConversionRepository/FileRepositoryの初期化要件
- Result型によるエラーハンドリング要件

---

## 完了条件

- [ ] CONV-05-02のAPIインターフェースが理解されている
- [ ] ElectronとsharedのHistoryService間の型差異が特定されている
- [ ] 依存リポジトリ（ConversionRepository等）の実装状況が確認されている
- [ ] 統合方法が決定されている（アダプターパターン/直接統合）
- [ ] 要件定義書が作成されている
- [ ] 受け入れ基準が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-service-db-integration/phase-2-design.md`
