# アーキテクチャ設計書: インポートスキルの永続化消失バグ修正

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 作成日     | 2026-02-07                           |
| バージョン | 1.0                                  |
| 依存       | Phase 1 要件定義                     |

---

## 1. 現在のアーキテクチャ

### 1.1 コンポーネント構成

```
┌─────────────────────────────────────────────────────────────────┐
│                        Main Process                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌─────────────────────────────────┐    │
│  │  IPC Handlers    │───▶│       SkillService              │    │
│  │ (skillHandlers)  │    │       (Facade)                  │    │
│  └──────────────────┘    └─────────────────────────────────┘    │
│                                    │                             │
│                    ┌───────────────┼───────────────┐            │
│                    │               │               │            │
│                    ▼               ▼               ▼            │
│           ┌──────────────┐ ┌────────────┐ ┌─────────────────┐   │
│           │ SkillScanner │ │SkillParser │ │SkillImportMgr   │   │
│           └──────────────┘ └────────────┘ └─────────────────┘   │
│                    │                               │            │
│                    ▼                               ▼            │
│           ┌──────────────┐                ┌──────────────┐     │
│           │ File System  │                │electron-store│     │
│           └──────────────┘                └──────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 データフロー

```
[Renderer] skill:getImported
     │
     ▼
[skillHandlers.ts]
     │ validateIpcSender()
     ▼
[SkillService.getImportedSkills()]
     │
     ├──▶ [SkillImportManager.getImportedSkillIds()]
     │         └── return Array.from(this.importedIds)
     │
     ├──▶ [scanAvailableSkills()] ← if cache is empty
     │         └── SkillScanner → SkillParser → this.cache
     │
     └──▶ importedIds.map(id => cache.get(id)).filter(...)
              └── ★ 孤立IDがsilentに消失する箇所
```

### 1.3 現在の問題点

| レイヤー         | 問題                         | 影響                         |
| ---------------- | ---------------------------- | ---------------------------- |
| SkillService     | 孤立IDのsilentフィルタリング | スキルが消失したように見える |
| SkillImportMgr   | 型キャストによる検証不足     | 破損データでクラッシュ       |
| SkillImportMgr   | 並列アクセスの排他制御なし   | データ競合                   |
| 全コンポーネント | DEBUGログの制御不足          | 本番ログ肥大化               |
| skillHandlers    | エラーレスポンス形式の不統一 | FE側のハンドリング複雑化     |

---

## 2. 修正後のアーキテクチャ

### 2.1 コンポーネント構成（変更箇所をハイライト）

```
┌─────────────────────────────────────────────────────────────────┐
│                        Main Process                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐                                           │
│  │  ★ Logger        │ ← 新規追加: ログレベル制御                │
│  │ (infrastructure) │                                           │
│  └──────────────────┘                                           │
│          │                                                       │
│  ┌───────┴──────────┐    ┌─────────────────────────────────┐    │
│  │  IPC Handlers    │───▶│       SkillService              │    │
│  │ (skillHandlers)  │    │       (Facade)                  │    │
│  │ ★ Logger使用     │    │ ★ 孤立ID検出ログ追加           │    │
│  │ ★ エラー形式統一 │    └─────────────────────────────────┘    │
│  └──────────────────┘                    │                       │
│                    ┌───────────────┼───────────────┐            │
│                    │               │               │            │
│                    ▼               ▼               ▼            │
│           ┌──────────────┐ ┌────────────┐ ┌─────────────────┐   │
│           │ SkillScanner │ │SkillParser │ │SkillImportMgr   │   │
│           └──────────────┘ └────────────┘ │ ★ Zod型検証     │   │
│                    │                      │ ★ async-mutex   │   │
│                    ▼                      │ ★ Logger使用    │   │
│           ┌──────────────┐               └─────────────────┘   │
│           │ File System  │                        │            │
│           └──────────────┘                        ▼            │
│                                           ┌──────────────┐     │
│                                           │electron-store│     │
│                                           └──────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 新規コンポーネント: Logger

```typescript
// apps/desktop/src/main/infrastructure/logger.ts

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export function createLogger(prefix: string): Logger {
  const isDebug =
    process.env.NODE_ENV === "development" || process.env.DEBUG === "true";

  return {
    debug: (msg, ...args) => {
      if (isDebug) console.log(`[${prefix}][DEBUG]`, msg, ...args);
    },
    info: (msg, ...args) => console.log(`[${prefix}][INFO]`, msg, ...args),
    warn: (msg, ...args) => console.warn(`[${prefix}][WARN]`, msg, ...args),
    error: (msg, ...args) => console.error(`[${prefix}][ERROR]`, msg, ...args),
  };
}
```

### 2.3 修正後のデータフロー

```
[Renderer] skill:getImported
     │
     ▼
[skillHandlers.ts]
     │ validateIpcSender()
     │ ★ Logger.debug() で入出力をトレース
     ▼
[SkillService.getImportedSkills()]
     │
     ├──▶ [SkillImportManager.getImportedSkillIds()]
     │         └── ★ Zodで型検証済みのデータを返却
     │
     ├──▶ [scanAvailableSkills()] ← if cache is empty
     │         └── SkillScanner → SkillParser → this.cache
     │
     └──▶ ★ 改善された孤立ID処理
              │
              ├── 正常: cache.get(id) でスキル取得
              │
              └── 孤立ID: Logger.warn() でログ出力
                         （自動削除はしない）
```

---

## 3. 依存関係

### 3.1 パッケージ依存

| パッケージ  | バージョン | 用途             | 追加先         | 状態     |
| ----------- | ---------- | ---------------- | -------------- | -------- |
| async-mutex | ^0.4.0     | 並列アクセス制御 | `apps/desktop` | 新規追加 |
| zod         | (既存)     | ランタイム型検証 | `apps/desktop` | 確認済み |

### 3.2 モジュール依存（修正後）

```
skillHandlers.ts
    ├── SkillService
    ├── Logger ← 新規依存
    └── IPC_CHANNELS

SkillService.ts
    ├── SkillScanner
    ├── SkillParser
    ├── SkillImportManager
    └── Logger ← 新規依存

SkillImportManager.ts
    ├── electron-store (SkillStore interface)
    ├── async-mutex (Mutex) ← 新規依存
    ├── zod (z.array(z.string())) ← 新規依存
    └── Logger ← 新規依存
```

---

## 4. インターフェース設計

### 4.1 IPCResult型（統一エラーレスポンス）

```typescript
// packages/shared/src/types/ipc.ts (確認/追加)

export interface IPCResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

### 4.2 SkillStoreインターフェース（既存）

```typescript
interface SkillStore {
  get(key: string, defaultValue: string[]): string[];
  set(key: string, value: string[]): void;
  path?: string;
}
```

### 4.3 Logger インターフェース（新規）

```typescript
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
```

---

## 5. エラーコード定義

### 5.1 スキル関連エラーコード

| コード                 | 範囲      | 説明                     |
| ---------------------- | --------- | ------------------------ |
| SKILL_VALIDATION_ERROR | 1000-1999 | 入力バリデーションエラー |
| SKILL_NOT_FOUND        | 2000-2999 | スキルが見つからない     |
| SKILL_IMPORT_ERROR     | 3000-3999 | インポート処理のエラー   |
| SKILL_STORE_ERROR      | 4000-4999 | ストア操作のエラー       |
| SKILL_INTERNAL_ERROR   | 5000-5999 | 内部エラー               |

### 5.2 具体的なエラーコード

| コード                  | 値   | 説明                           |
| ----------------------- | ---- | ------------------------------ |
| SKILL_IDS_REQUIRED      | 1001 | skillIdsが指定されていない     |
| SKILL_ID_REQUIRED       | 1002 | skillIdが指定されていない      |
| SKILL_NAME_REQUIRED     | 1003 | skillNameが指定されていない    |
| SKILL_NOT_FOUND         | 2001 | 指定されたスキルが見つからない |
| SKILL_NOT_IMPORTED      | 2002 | スキルがインポートされていない |
| SKILL_IMPORT_FAILED     | 3001 | インポート処理に失敗           |
| SKILL_REMOVE_FAILED     | 3002 | 削除処理に失敗                 |
| SKILL_STORE_READ_ERROR  | 4001 | ストア読み込みエラー           |
| SKILL_STORE_WRITE_ERROR | 4002 | ストア書き込みエラー           |
| SKILL_STORE_CORRUPT     | 4003 | ストアデータ破損               |
| SKILL_INTERNAL_ERROR    | 5001 | 予期しない内部エラー           |

---

## 6. セキュリティ考慮事項

### 6.1 ログ出力

- 本番環境ではDEBUGログを出力しない（`NODE_ENV !== "development"`）
- ユーザーデータ（スキルID等）はINFO/WARNレベルでのみ出力
- エラー詳細はサニタイズしてからRendererに返却

### 6.2 入力バリデーション

- Zodスキーマでストアデータを検証
- IPCハンドラーで引数の型を検証
- 不正なデータは空配列にフォールバック

### 6.3 排他制御

- async-mutexでpersist操作を排他制御
- デッドロック防止のためタイムアウトは設定しない（単純なミューテックス）

---

## 7. パフォーマンス考慮事項

### 7.1 ミューテックスのオーバーヘッド

- persist操作は通常100ms未満
- 同時アクセスは稀なため、待機時間の影響は軽微

### 7.2 Zodパース

- 配列サイズに比例（通常100件未満）
- 初期化時のみ実行されるため影響軽微

### 7.3 ログ出力

- 本番環境ではDEBUGログをスキップ
- INFO/WARNログは最小限に抑制

---

## 8. テスト戦略

### 8.1 ユニットテスト

| 対象               | テストケース                    |
| ------------------ | ------------------------------- |
| Logger             | DEBUG環境でのみdebugログ出力    |
| Logger             | 全環境でinfo/warn/errorログ出力 |
| SkillImportManager | 正常データの読み込み            |
| SkillImportManager | 不正データのフォールバック      |
| SkillImportManager | 並列アクセスの整合性            |
| SkillService       | 孤立ID検出                      |

### 8.2 統合テスト

| 対象          | テストケース                           |
| ------------- | -------------------------------------- |
| skillHandlers | 正常系のIPC呼び出し                    |
| skillHandlers | エラー時のレスポンス形式               |
| 永続化全体    | インポート→再起動シミュレーション→取得 |

---

## 9. 参照

- Phase 1 要件定義: `outputs/phase-1/requirements-definition.md`
- Phase 1 受入基準: `outputs/phase-1/acceptance-criteria.md`
- エラーハンドリング規約: `.claude/rules/02-code-quality.md`
