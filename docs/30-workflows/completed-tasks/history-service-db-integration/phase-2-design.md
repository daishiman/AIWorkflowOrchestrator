# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 2                              |
| Phase名    | 設計                           |
| 前提Phase  | Phase 1                        |
| 後続Phase  | Phase 3                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-12                     |
| 機能名     | history-service-db-integration |

---

## 目的

ElectronのHistoryServiceとsharedパッケージのHistoryServiceの統合設計を行う。依存性注入パターン、データ変換ロジック、エラーハンドリング方針を設計する。

## 背景

Phase 1で特定された両インターフェースの差異を踏まえ、スムーズな統合のための設計を行う必要がある。特に、Renderer側の型（`VersionHistoryItem`等）とshared側の型のマッピング、およびリポジトリの依存性注入方法を明確にする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: 統合アーキテクチャを設計する

**実行手順**:

1. 以下の統合パターンを比較検討:
   - **パターンA**: 直接統合（sharedのHistoryServiceをそのまま使用）
   - **パターンB**: アダプター統合（型変換アダプターを介して統合）
   - **パターンC**: ファサード統合（新しいファサードクラスで統合）
2. Electron環境での制約を考慮
3. 推奨パターンを決定
4. アーキテクチャ図を作成

**期待される成果物**:

- アーキテクチャ設計書

---

### タスク2: 依存性注入設計

**目的**: リポジトリの依存性注入方法を設計する

**実行手順**:

1. sharedのHistoryServiceが必要とする依存関係を整理:
   ```typescript
   constructor(
     conversionRepository: ConversionRepository,
     fileRepository: FileRepository,
     logger: IConversionLogger,
   )
   ```
2. Electron環境でのリポジトリ初期化方法を設計:
   - SQLiteデータベース接続
   - Drizzle ORMセットアップ
3. サービスファクトリパターンを設計
4. シングルトン管理方法を決定

**期待される成果物**:

- DI設計書

---

### タスク3: 型変換ロジック設計

**目的**: shared型とRenderer型の変換ロジックを設計する

**実行手順**:

1. 型マッピング表を作成:

   | shared型             | Renderer型           | 変換ロジック         |
   | -------------------- | -------------------- | -------------------- |
   | `VersionHistoryItem` | `VersionHistoryItem` | フィールドマッピング |
   | `PaginatedResult<T>` | `PaginatedResult<T>` | 同一構造             |
   | `Result<T, Error>`   | `Result<T>`          | エラー変換           |

2. 各メソッドの変換処理を設計:
   - `getFileHistory`: pagination, filter変換
   - `getVersionDetail`: データ整形
   - `getConversionLogs`: LogLevel変換
   - `restoreVersion`: 結果変換

**期待される成果物**:

- 型変換設計書

---

### タスク4: エラーハンドリング設計

**目的**: 統一的なエラーハンドリング方針を設計する

**実行手順**:

1. shared HistoryServiceのエラー種別を確認
2. IPC通信でのエラー伝搬方法を設計
3. フロントエンドでのエラー表示との連携を確認
4. ログ出力方針を決定

**期待される成果物**:

- エラーハンドリング設計書

---

### タスク5: 設計文書の統合

**目的**: 全設計内容を統合文書にまとめる

**実行手順**:

1. アーキテクチャ設計書を統合
2. 実装方針を明確化
3. 実装順序を決定

**期待される成果物**:

- 統合設計書（`outputs/phase-2/architecture-design.md`）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                           | 内容                      |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | DI/ファサード等のパターン |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | Result型パターン          |
| データベース実装       | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | Drizzle ORM使用方法       |

### Phase 1成果物

| 参照資料     | パス                                         | 説明                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各要件の受け入れ条件 |

---

## 成果物

| 成果物               | パス                                     | 内容                   |
| -------------------- | ---------------------------------------- | ---------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` | 統合アーキテクチャ設計 |
| DI設計書             | `outputs/phase-2/di-design.md`           | 依存性注入設計         |
| 型変換設計書         | `outputs/phase-2/type-mapping.md`        | shared-Renderer型変換  |

---

## 統合テスト連携（Phase 1〜11は必須）

DI設計、型変換ロジック、エラーハンドリング設計を反映:

- ConversionRepository/FileRepository/Loggerの注入設計
- shared型 ↔ Renderer型の変換テスト設計
- Result型によるエラーハンドリングのテスト設計
- IPC境界でのデータ整合性テスト設計

---

## 完了条件

- [ ] 統合パターン（直接/アダプター/ファサード）が決定されている
- [ ] 依存性注入方法が設計されている
- [ ] 型変換ロジックが設計されている
- [ ] エラーハンドリング方針が決定されている
- [ ] 統合設計書が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonを更新

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-service-db-integration/phase-3-design-review.md`
