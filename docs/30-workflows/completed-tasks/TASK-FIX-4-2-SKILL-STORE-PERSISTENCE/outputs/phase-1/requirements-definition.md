# 要件定義書: インポートスキルの永続化消失バグ修正

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 作成日     | 2026-02-07                           |
| バージョン | 1.0                                  |
| 分類       | バグ修正                             |
| 優先度     | 高                                   |

---

## 1. 背景

### 1.1 報告された問題

ユーザーがインポートしたスキルがアプリケーション再起動後に消失する問題が発生している。

- **再現率**: 100%（アプリ再起動のたびに発生）
- **影響**: ユーザーは毎回スキルを再インポートする必要があり、UXが著しく低下
- **初報時期**: 調査用DEBUGログの残存から、過去に調査が行われたが未解決のままであったことが判明

### 1.2 発生箇所

| コンポーネント         | ファイルパス                                                 | 役割                         |
| ---------------------- | ------------------------------------------------------------ | ---------------------------- |
| スキルハンドラー       | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | IPCリクエストの受付          |
| スキルサービス         | `apps/desktop/src/main/services/skill/SkillService.ts`       | スキル操作のFacade           |
| インポートマネージャー | `apps/desktop/src/main/services/skill/SkillImportManager.ts` | インポート状態の管理と永続化 |
| IPC初期化              | `apps/desktop/src/main/ipc/index.ts`                         | electron-storeの初期化       |

---

## 2. 要件

### 2.1 機能要件

| ID   | 要件                                                               | 優先度 |
| ---- | ------------------------------------------------------------------ | ------ |
| FR-1 | インポートしたスキルIDがelectron-storeに正しく永続化されること     | 必須   |
| FR-2 | アプリ再起動後もインポート済みスキルが表示されること               | 必須   |
| FR-3 | スキャン結果に存在しないスキルID（孤立ID）が適切に処理されること   | 必須   |
| FR-4 | 複数のインポート/削除操作が同時に発生しても整合性が保たれること    | 必須   |
| FR-5 | ストアのデータ形式が破損している場合でもクラッシュせず復旧すること | 必須   |

### 2.2 非機能要件

| ID    | 要件                                                   | 基準               |
| ----- | ------------------------------------------------------ | ------------------ |
| NFR-1 | DEBUGログが本番環境で出力されないこと                  | ログレベル制御     |
| NFR-2 | エラーレスポンスが統一された形式で返却されること       | `IPCResult<T>`形式 |
| NFR-3 | トラブルシューティング可能なログレベル設定ができること | 環境変数による制御 |
| NFR-4 | persist操作のパフォーマンスが100ms以内であること       | 通常操作時         |

---

## 3. 発見された潜在的問題

### P1: スキャンキャッシュとインポートIDの不整合

**問題の詳細**:
`SkillService.getImportedSkills()` メソッド（L110-112）で、以下の処理が行われている:

```typescript
const result = importedIds
  .map((id) => this.cache.get(id))
  .filter((skill): skill is Skill => skill !== undefined);
```

この実装では、`importedIds`にあるがスキャン結果（`this.cache`）に存在しないスキルIDが**silentにフィルタリング**される。

**影響**:

- ユーザーから見ると「インポート済み」のはずのスキルが表示されない
- 孤立IDに関する警告やログが出力されない
- 問題の原因特定が困難

### P2: 並列アクセスでのキャッシュ競合

**問題の詳細**:
`SkillImportManager`の`importSkills()`と`removeSkill()`メソッドは、内部の`persist()`を排他制御なしで呼び出している。

**影響**:

- 複数のIPC呼び出しが同時に実行された場合、最後の書き込みが勝つ
- 一部のインポート/削除操作が失われる可能性

### P3: store初期化での予期しない型返却

**問題の詳細**:
`SkillImportManager.ts` L32で以下の型キャストが行われている:

```typescript
const stored = this.store.get(STORE_KEY, []) as string[];
```

**影響**:

- 実行時の型検証が行われない
- ストアデータが破損している場合（例: `null`、オブジェクト型など）に予期しない動作
- マイグレーション失敗時のフォールバックが不適切

### P4: DEBUGログ形式の問題

**問題の詳細**:
以下のファイルに本番環境でも出力されるDEBUGログが残存:

| ファイル                | ログ箇所数 |
| ----------------------- | ---------- |
| `skillHandlers.ts`      | 6箇所      |
| `SkillImportManager.ts` | 8箇所      |
| `SkillService.ts`       | 10箇所     |

**影響**:

- 本番環境でのログ肥大化
- パフォーマンス低下の可能性
- 機密情報がログに出力されるリスク

### P5: エラーレスポンスの一貫性問題

**問題の詳細**:
`skillHandlers.ts`で、エラー処理が統一されていない:

| 処理パターン                     | 使用箇所                |
| -------------------------------- | ----------------------- |
| `throw { code, message }`        | L122-125, L141-142      |
| `return { success: false, ... }` | L59-64, L101-105 他多数 |

**影響**:

- フロントエンドでのエラーハンドリングが複雑化
- エラーコードの一貫性がない

---

## 4. 現状のデータフロー

```
[アプリ起動]
    |
    v
[registerAllIpcHandlers(mainWindow)]
    |
    +-- new Store<SkillStoreSchema>({ name: "skills" })
    |       └── electron-store がストアファイルを読み込み
    |
    +-- new SkillImportManager(skillStore)
    |       └── store.get("importedSkillIds", []) as string[]
    |           └── importedIds = new Set(stored)
    |
    +-- new SkillService(skillScanner, skillParser, skillImportManager)
            |
            v
[skill:getImported IPC呼び出し]
    |
    v
[skillService.getImportedSkills()]
    |
    +-- importManager.getImportedSkillIds()  // インポート済みID取得
    |
    +-- (キャッシュが空なら) scanAvailableSkills()  // スキャン実行
    |
    +-- importedIds.map(id => cache.get(id)).filter(...)  // ★孤立IDが消失
    |
    v
[Rendererに返却]
```

---

## 5. 設計との乖離

| 観点     | 設計書（technical-decisions.md）          | 実装（index.ts）                                              |
| -------- | ----------------------------------------- | ------------------------------------------------------------- |
| 保存先   | `~/.aiworkflow/config/skill-imports.json` | `electron-store`デフォルトパス（`{appDataPath}/skills.json`） |
| ストア名 | -                                         | `skills`                                                      |
| キー名   | -                                         | `importedSkillIds`                                            |

---

## 6. 参照資料

| 資料                       | パス                                                                 |
| -------------------------- | -------------------------------------------------------------------- |
| 永続化設計仕様             | `docs/30-workflows/skill-import-agent-system/technical-decisions.md` |
| スキルハンドラー実装       | `apps/desktop/src/main/ipc/skillHandlers.ts`                         |
| インポートマネージャー実装 | `apps/desktop/src/main/services/skill/SkillImportManager.ts`         |
| スキルサービス実装         | `apps/desktop/src/main/services/skill/SkillService.ts`               |
| エラーハンドリング規約     | `.claude/rules/02-code-quality.md`                                   |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                 |

---

## 7. 次のステップ

Phase 2（設計）にて、上記5つの潜在的問題に対する解決策を設計する。
