# Phase 1: 要件定義 - インポートスキルの永続化消失バグ修正

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| Phase    | 1 - 要件定義                         |
| 機能名   | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 作成日   | 2026-02-07                           |
| 分類     | バグ修正                             |
| 優先度   | 高                                   |
| 見積もり | 中規模                               |
| 対象機能 | electron-store スキルデータ永続化    |

---

## 1. 目的

インポートしたスキルがアプリ再起動後に消失するバグを修正し、ユーザーが一度インポートしたスキルが永続的に保持される状態を回復する。

---

## 2. 背景・現状分析

### 2.1 報告された問題

- **現象**: インポートしたスキルがアプリ再起動後に消失する
- **影響**: ユーザーは毎回スキルを再インポートする必要があり、UXが著しく低下
- **発生頻度**: アプリ再起動のたびに100%再現

### 2.2 設計と実装の乖離

| 観点     | 設計書（technical-decisions.md）          | 実装（index.ts）                                              |
| -------- | ----------------------------------------- | ------------------------------------------------------------- |
| 保存先   | `~/.aiworkflow/config/skill-imports.json` | `electron-store`デフォルトパス（`{appDataPath}/skills.json`） |
| ストア名 | -                                         | `skills`                                                      |
| キー名   | -                                         | `importedSkillIds`                                            |

### 2.3 既存コードの調査結果

#### skillHandlers.ts (L70-107)

```typescript
// skill:getImported ハンドラーにDEBUGログが6箇所残存
console.log("[skillHandlers][DEBUG] skill:getImported - START");
console.log("[skillHandlers][DEBUG] skill:getImported - validation PASSED");
console.log(
  "[skillHandlers][DEBUG] Calling skillService.getImportedSkills()...",
);
console.log(
  "[skillHandlers][DEBUG] getImportedSkills result:",
  skills?.length,
  "skills",
);
console.error("[skillHandlers][DEBUG] skill:getImported ERROR:", error);
```

- 過去に調査が行われたがバグは未解決のまま
- 本番環境でもDEBUGログが出力される状態

#### SkillImportManager.ts

```typescript
constructor(store: SkillStore) {
  try {
    const stored = this.store.get(STORE_KEY, []) as string[];  // 型キャストの脆弱性
    this.importedIds = new Set(stored);
  } catch (error) {
    console.error("[SkillImportManager] Failed to load from store:", error);
    this.importedIds = new Set();  // エラー時は空セットで継続（データロス）
  }
}
```

#### index.ts (L118-126)

```typescript
const skillStore = new Store<SkillStoreSchema>({
  name: "skills",
  defaults: {
    importedSkillIds: [],
  },
});
const skillImportManager = new SkillImportManager(skillStore);
```

---

## 3. 発見された潜在的問題（5点）

### P1: スキャンキャッシュとインポートIDの不整合

- **問題**: `importedIds`に登録されているがスキャンディレクトリに存在しないスキルIDがある場合、`getImportedSkills()`で該当スキルの情報を取得できずに消失扱いになる可能性
- **原因推定**: スキルファイルが削除/移動された後にインポートリストだけが残る
- **影響**: ユーザーから見るとインポート済みのはずのスキルが表示されない

### P2: 並列アクセスでのキャッシュ競合

- **問題**: 複数のIPC呼び出しが同時に`importSkills()`や`removeSkill()`を呼び出した場合、`persist()`の競合が発生する可能性
- **影響**: 最後の書き込みが勝ち、一部のインポート操作が失われる

### P3: store初期化での予期しない型返却

- **問題**: `store.get(STORE_KEY, []) as string[]`の型キャストは実行時検証を行わない
- **影響**: ストアが破損している場合やマイグレーション失敗時に予期しない動作
- **コード箇所**: `SkillImportManager.ts` L32

### P4: DEBUGログ形式の問題

- **問題**: `process.env.NODE_ENV !== "test"`でのみガードされているDEBUGログが一部あるが、本番環境でも出力されるログが多数残存
- **影響**: 本番環境でのログ肥大化、パフォーマンス低下の可能性

### P5: エラーレスポンスの一貫性問題

- **問題**: 一部のエラーは`throw`、一部は`{ success: false, error }`形式で返却されており一貫性がない
- **影響**: フロントエンドでのエラーハンドリングが複雑化

---

## 4. 実行タスク（Phase 1）

| No  | タスク               | 成果物               |
| --- | -------------------- | -------------------- |
| 1   | 現象の再現手順を確立 | 再現手順書           |
| 2   | 関連コードの詳細調査 | コード調査レポート   |
| 3   | 根本原因の特定       | 原因分析ドキュメント |
| 4   | 受入基準の定義       | 本ドキュメント       |
| 5   | 影響範囲の洗い出し   | 影響範囲リスト       |

---

## 5. 参照資料

| 資料                       | パス                                                                    |
| -------------------------- | ----------------------------------------------------------------------- |
| 永続化設計仕様             | `docs/30-workflows/skill-import-agent-system/technical-decisions.md` §3 |
| スキルハンドラー実装       | `apps/desktop/src/main/ipc/skillHandlers.ts`                            |
| インポートマネージャー実装 | `apps/desktop/src/main/services/skill/SkillImportManager.ts`            |
| IPC初期化処理              | `apps/desktop/src/main/ipc/index.ts` L118-132                           |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                    |

---

## 6. 受入基準（Acceptance Criteria）

### AC1: 永続化の正常動作

- [ ] インポートしたスキルがアプリ再起動後も保持される
- [ ] インポートリストが設計書どおりの場所（`~/.aiworkflow/config/skill-imports.json`または適切なelectron-storeパス）に保存される
- [ ] 保存されたデータの形式が正しい（`string[]`）

### AC2: 堅牢性の確保

- [ ] ストアが空または破損している場合でもアプリがクラッシュしない
- [ ] 不正なデータ型が返却された場合に適切にフォールバックする
- [ ] スキャンディレクトリに存在しないスキルIDがインポートリストにある場合、適切にハンドリングされる

### AC3: 並行性の保証

- [ ] 複数のインポート/削除操作が同時に発生しても整合性が保たれる
- [ ] persist操作が完了するまで次の操作が待機する（または楽観的ロックを実装する）

### AC4: ログとエラーの整備

- [ ] DEBUGログが本番環境で出力されない
- [ ] エラーレスポンス形式が統一される
- [ ] 問題発生時にトラブルシューティング可能なログレベルが適切に設定される

### AC5: テストカバレッジ

- [ ] 正常系のインポート/削除/取得のテストが存在する
- [ ] 異常系（ストア破損、型不正、並列アクセス）のテストが存在する
- [ ] 再起動シミュレーションテストが存在する

---

## 7. 成果物

| 成果物     | パス                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 要件定義書 | `docs/30-workflows/skill-import-agent-system/tasks/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/phase-01-requirements.md` |

---

## 8. 完了条件

- [ ] 5つの潜在的問題すべてが文書化されている
- [ ] 受入基準（AC1〜AC5）が明確に定義されている
- [ ] 関連ファイルのパスがすべて確認されている
- [ ] Phase 2（設計）で必要な情報がすべて揃っている

---

## 9. 次のPhase

**Phase 2: 設計** に進む

- 根本原因に基づく解決策の設計
- コード修正箇所の特定
- テスト戦略の策定
