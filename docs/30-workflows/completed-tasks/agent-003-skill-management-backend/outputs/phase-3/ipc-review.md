# IPC設計レビュー

## メタ情報

| 項目   | 内容                     |
| ------ | ------------------------ |
| Phase  | 3                        |
| タスク | タスク3: IPC設計レビュー |
| 作成日 | 2026-01-11               |

---

## 1. 参照した設計

- `outputs/phase-2/ipc-design.md`
- `apps/desktop/src/preload/channels.ts`（既存）

---

## 2. IPC設計レビュー

### 2.1 チャネル名の一意性

| チェック項目           | 設計状況 | 判定  |
| ---------------------- | -------- | ----- |
| 既存チャネルと衝突なし | △        | MINOR |
| プレフィックスの一貫性 | △        | MINOR |

**発見事項**:

既存の`channels.ts`に`skill:`プレフィックスのチャネルが既に定義されている：

```typescript
// 既存定義（channels.ts）
SKILL_LIST_AVAILABLE: "skill:list-available",
SKILL_LIST_IMPORTED: "skill:list-imported",
SKILL_IMPORT: "skill:import",
SKILL_REMOVE: "skill:remove",
SKILL_GET_DETAIL: "skill:get-detail",
```

Phase 2設計の`agent:`プレフィックスチャネルとの対応：

| Phase 2設計                   | 既存チャネル           | 衝突 | 対応               |
| ----------------------------- | ---------------------- | ---- | ------------------ |
| `agent:scan-available-skills` | `skill:list-available` | なし | 既存チャネルを使用 |
| `agent:get-imported-skills`   | `skill:list-imported`  | なし | 既存チャネルを使用 |
| `agent:import-skills`         | `skill:import`         | なし | 既存チャネルを使用 |
| `agent:remove-skill`          | `skill:remove`         | なし | 既存チャネルを使用 |
| `agent:get-skill-detail`      | `skill:get-detail`     | なし | 既存チャネルを使用 |

**判定**: MINOR - 既存チャネルを使用することで解決可能

### 2.2 引数の型安全性

| チェック項目             | 設計状況 | 判定 |
| ------------------------ | -------- | ---- |
| TypeScript型チェック対応 | ○        | PASS |
| 引数インターフェース定義 | ○        | PASS |
| オプショナル引数の適切性 | ○        | PASS |

**設計確認**:

```typescript
// 引数型定義（設計）
interface ScanAvailableSkillsArgs {
  basePath?: string;
  forceRefresh?: boolean;
}

interface ImportSkillsArgs {
  skillIds: string[];
}

interface RemoveSkillArgs {
  skillId: string;
}

interface GetSkillDetailArgs {
  skillId: string;
}
```

**判定**: PASS - 型安全性は十分

### 2.3 戻り値の一貫性

| チェック項目         | 設計状況 | 判定 |
| -------------------- | -------- | ---- |
| 成功/失敗形式の統一  | ○        | PASS |
| 戻り値型の明確な定義 | ○        | PASS |
| null許容の適切な使用 | ○        | PASS |

**戻り値一覧**:

| チャネル               | 戻り値型          | null許容 |
| ---------------------- | ----------------- | -------- |
| `skill:list-available` | `SkillScanResult` | No       |
| `skill:list-imported`  | `Skill[]`         | No       |
| `skill:import`         | `ImportResult`    | No       |
| `skill:remove`         | `RemoveResult`    | No       |
| `skill:get-detail`     | `Skill \| null`   | Yes      |

**判定**: PASS - 戻り値の一貫性は適切

### 2.4 エラーコード

| チェック項目             | 設計状況 | 判定 |
| ------------------------ | -------- | ---- |
| 一意なエラーコード定義   | ○        | PASS |
| エラーコードの網羅性     | ○        | PASS |
| エラーメッセージの適切性 | ○        | PASS |

**エラーコード一覧**:

| コード             | 用途                     |
| ------------------ | ------------------------ |
| `VALIDATION_ERROR` | 入力バリデーションエラー |
| `NOT_FOUND`        | スキルが見つからない     |
| `AUTH_ERROR`       | IPC sender検証失敗       |
| `INTERNAL_ERROR`   | 内部エラー               |
| `PATH_TRAVERSAL`   | パストラバーサル検出     |

**判定**: PASS - エラーコードは適切

### 2.5 preload APIの設計

| チェック項目                   | 設計状況 | 判定  |
| ------------------------------ | -------- | ----- |
| contextBridge経由の公開        | ○        | PASS  |
| 型定義の公開                   | ○        | PASS  |
| チャネルホワイトリストへの追加 | △        | MINOR |

**発見事項**:

既存の`ALLOWED_INVOKE_CHANNELS`に`skill:`チャネルが既に含まれている：

```typescript
// Skill management channels
IPC_CHANNELS.SKILL_LIST_AVAILABLE,
IPC_CHANNELS.SKILL_LIST_IMPORTED,
IPC_CHANNELS.SKILL_IMPORT,
IPC_CHANNELS.SKILL_REMOVE,
IPC_CHANNELS.SKILL_GET_DETAIL,
```

**判定**: MINOR - 既存定義を活用可能

---

## 3. IPC契約の完全性確認

### 3.1 チャネル対応表（修正後）

| チャネル               | 引数                     | 戻り値            |
| ---------------------- | ------------------------ | ----------------- |
| `skill:list-available` | `{ basePath?: string }`  | `SkillScanResult` |
| `skill:list-imported`  | なし                     | `Skill[]`         |
| `skill:import`         | `{ skillIds: string[] }` | `ImportResult`    |
| `skill:remove`         | `{ skillId: string }`    | `RemoveResult`    |
| `skill:get-detail`     | `{ skillId: string }`    | `Skill \| null`   |

### 3.2 型定義の完全性

すべての引数・戻り値に対して型定義が存在することを確認：

- [x] `Skill`
- [x] `Anchor`
- [x] `SkillScanResult`
- [x] `SkillScanError`
- [x] `ImportResult`
- [x] `RemoveResult`
- [x] `IPCError`

---

## 4. 指摘事項

### 4.1 MINOR: チャネル名の統一

**問題**: Phase 2設計では`agent:`プレフィックスを使用しているが、既存の`skill:`プレフィックスチャネルを使用すべき。

**対応**: 実装時に既存チャネルを使用する。設計ドキュメントの更新は任意。

### 4.2 MINOR: ハンドラー登録先の確認

**問題**: 既存チャネルに対するハンドラーが未実装かを確認する必要がある。

**確認結果**: `skill:`チャネルのハンドラーは未実装（チャネル定義のみ存在）。本タスクで実装する。

---

## 5. 判定

### 総合判定: MINOR

軽微な指摘があるが、修正後Phase 4へ進行可能。

### 確認済み項目

1. 型安全性: PASS
2. 戻り値一貫性: PASS
3. エラーコード: PASS
4. preload API: PASS

### 要修正項目

1. 既存`skill:`チャネルを使用する（実装時対応）
