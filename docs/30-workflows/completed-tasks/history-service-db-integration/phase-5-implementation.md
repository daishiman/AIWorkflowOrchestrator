# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 5                              |
| Phase名    | 実装                           |
| 前提Phase  | Phase 4                        |
| 後続Phase  | Phase 6                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-12                     |
| 機能名     | history-service-db-integration |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストを通過する最小限の実装を行う。ElectronのHistoryServiceをsharedパッケージのHistoryServiceと統合する。

## 背景

現在のスタブ実装を、CONV-05-02で実装されたshared HistoryServiceと統合し、実際のデータベースから履歴データを取得できるようにする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 依存関係のセットアップ

**目的**: 必要なリポジトリとサービスの初期化コードを実装する

**実行手順**:

1. ElectronのHistoryServiceファイルを更新準備
2. sharedパッケージからの依存関係をインポート:
   ```typescript
   import { HistoryService as SharedHistoryService } from "@repo/shared/services/history";
   import type {
     ConversionRepository,
     FileRepository,
   } from "@repo/shared/services/history/types";
   ```
3. リポジトリ初期化コードを追加（Drizzle ORM経由）
4. サービスファクトリを実装

**期待される成果物**:

- 依存関係セットアップコード

---

### タスク2: HistoryService統合実装

**目的**: sharedのHistoryServiceを利用してメソッドを実装する

**実行手順**:

1. `getFileHistory` の実装:
   - sharedのgetFileHistoryを呼び出し
   - 戻り値の型をRenderer型に変換
   - TODOコメントを削除

2. `getVersionDetail` の実装:
   - sharedのgetVersionDetailを呼び出し
   - VersionDetailDataへ変換
   - TODOコメントを削除

3. `getConversionLogs` の実装:
   - LogRepository経由でログを取得
   - ConversionLog型に変換
   - TODOコメントを削除

4. `restoreVersion` の実装:
   - sharedのrestoreToVersionを呼び出し
   - 結果をRenderer型に変換
   - TODOコメントを削除

**期待される成果物**:

- 更新されたHistoryService.ts

---

### タスク3: 型変換アダプターの実装

**目的**: shared型とRenderer型の変換を行うアダプターを実装する

**実行手順**:

1. VersionHistoryItem変換:

   ```typescript
   function toRendererVersionHistoryItem(
     shared: SharedVersionHistoryItem,
   ): RendererVersionHistoryItem {
     return {
       conversionId: shared.conversionId,
       fileId: shared.fileId,
       version: shared.version,
       createdAt: shared.createdAt,
       size: shared.sizeBytes,
       mimeType: shared.mimeType,
       hash: shared.contentHash,
       isLatest: shared.isCurrentVersion,
       metadata: shared.metadata,
     };
   }
   ```

2. PaginatedResult変換
3. ConversionLog変換

**期待される成果物**:

- 型変換アダプターコード

---

### タスク4: テスト実行・Green確認

**目的**: 全てのテストが成功することを確認する

**実行手順**:

1. テストを実行:
   ```bash
   pnpm --filter @repo/desktop test
   ```
2. 全テストがパス（Green）であることを確認
3. 既存の52件のテストも含めて全てパスしていることを確認

**期待される成果物**:

- テスト実行結果（全件Green）
- 実装サマリー（`outputs/phase-5/implementation-summary.md`）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                           | 内容                |
| ------------------ | ------------------------------------------------------------------------------ | ------------------- |
| データベース実装   | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM使用方法 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | Result型パターン    |

### Phase 1-4成果物

| 参照資料     | パス                                     | 説明       |
| ------------ | ---------------------------------------- | ---------- |
| 設計書       | `outputs/phase-2/architecture-design.md` | 統合設計   |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  | テスト対象 |

---

## 成果物

| 成果物         | パス                                               | 内容                         |
| -------------- | -------------------------------------------------- | ---------------------------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`        | 実装内容の要約               |
| HistoryService | `apps/desktop/src/main/services/HistoryService.ts` | 統合済み実装（コード成果物） |

---

## 統合テスト連携（Phase 1〜11は必須）

shared HistoryService統合、ConversionRepository接続実装:

- shared HistoryServiceのDI実装
- ConversionRepository/FileRepositoryの初期化
- Drizzle ORM経由でのDB接続
- 型変換アダプターの実装

---

## 完了条件

- [ ] sharedのHistoryServiceとの統合が完了している
- [ ] 全4メソッドが実DB接続で動作する
- [ ] TODOコメントが全て削除されている
- [ ] 全テストがパス（Green）している
- [ ] 既存の52件のテストも含めて全てパス
- [ ] 実装サマリーが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-service-db-integration/phase-6-test-expansion.md`
