# 設計レビュー結果: インポートスキルの永続化消失バグ修正

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| レビュー日 | 2026-02-07                           |
| レビュアー | Claude Opus 4.5                      |
| 判定       | **MINOR**                            |
| 依存       | Phase 1 要件定義, Phase 2 設計       |

---

## 1. 判定結果

### 1.1 総合判定

| 判定カテゴリ | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| **MINOR**    | 軽微な問題あり。指摘対応後にPhase 4（テスト作成）へ進む |

### 1.2 判定理由

- 設計は全体的に妥当であり、5つの潜在的問題（P1-P5）に対する解決策が適切に設計されている
- コード調査により、SkillService.getImportedSkills()の実装が確認され、設計の前提が正しいことを検証した
- 軽微な問題（R1-R3）はPhase 4開始前またはPhase 12で対応可能

---

## 2. レビュー観点別評価

### 2.1 要件との整合性

| 受入基準                | 設計での対応                                  | 判定 |
| ----------------------- | --------------------------------------------- | ---- |
| AC1: 永続化の正常動作   | Zod型検証、persist()の確実な実行              | OK   |
| AC2: 堅牢性の確保       | Zodによるフォールバック、孤立ID検出とWARNログ | OK   |
| AC3: 並行性の保証       | async-mutexによる排他制御                     | OK   |
| AC4: ログとエラーの整備 | Logger導入、IPCResult形式統一                 | OK   |
| AC5: テストカバレッジ   | テスト戦略策定済み（ユニット/統合テスト計画） | OK   |

**評価**: 全受入基準に対応する設計が存在する。

### 2.2 アーキテクチャ整合性

| 観点                   | 確認結果                                       | 判定 |
| ---------------------- | ---------------------------------------------- | ---- |
| レイヤー依存方向       | Main Process内での修正のみ、Renderer影響なし   | OK   |
| IPC設計原則            | 既存のチャンネル定義を変更せず                 | OK   |
| エラーハンドリング規約 | IPCResult形式で統一、エラーコード付与          | OK   |
| ログ規約               | Logger導入による環境変数ベースのログレベル制御 | OK   |

**評価**: 既存アーキテクチャを維持しながら、必要な修正のみを行う設計。

### 2.3 セキュリティ

| 観点                     | 確認結果                                           | 判定 |
| ------------------------ | -------------------------------------------------- | ---- |
| 入力バリデーション       | Zodスキーマでストアデータを検証                    | OK   |
| エラー情報の漏洩防止     | 内部エラーはサニタイズしてからRendererに返却       | OK   |
| ファイルシステムアクセス | electron-storeのデフォルトパス使用（権限問題なし） | OK   |
| ログ出力のセキュリティ   | 本番環境ではDEBUGログを出力しない                  | OK   |

**評価**: セキュリティ原則に準拠した設計。

### 2.4 パフォーマンス

| 観点                           | 確認結果                                        | 判定 |
| ------------------------------ | ----------------------------------------------- | ---- |
| ミューテックスのオーバーヘッド | 通常のインポート/削除操作では無視できるレベル   | OK   |
| Zodパース                      | 配列サイズに比例（通常100件未満なので問題なし） | OK   |
| ログ出力                       | DEBUGログは本番で無効化されるため問題なし       | OK   |

**評価**: パフォーマンスへの影響は軽微。

### 2.5 テスト容易性

| 観点             | 確認結果                               | 判定 |
| ---------------- | -------------------------------------- | ---- |
| DI（依存性注入） | Logger, StoreはコンストラクタでDI可能  | OK   |
| モック可能性     | SkillStoreインターフェースでモック容易 | OK   |
| テスト分離       | 各コンポーネントが独立してテスト可能   | OK   |

**評価**: テスト可能な設計。

---

## 3. 検出された問題と対応

### 3.1 問題一覧

| No  | 問題                                       | 重大度 | 対応方針                         | 対応時期 |
| --- | ------------------------------------------ | ------ | -------------------------------- | -------- |
| R1  | SkillService.getImportedSkills()の実装確認 | MINOR  | コード調査で確認完了             | 完了     |
| R2  | electron-storeパスの設計書との乖離         | MINOR  | 設計書を実装に合わせて更新       | Phase 12 |
| R3  | async-mutexの依存追加                      | MINOR  | package.jsonへの追加とビルド確認 | Phase 5  |

### 3.2 R1: SkillService.getImportedSkills() の確認結果

**確認結果**:

`SkillService.ts` L94-119を確認：

```typescript
async getImportedSkills(): Promise<Skill[]> {
  console.log("[SkillService][DEBUG] getImportedSkills - START");
  const importedIds = this.importManager.getImportedSkillIds();
  console.log("[SkillService][DEBUG] importedIds:", importedIds);

  if (this.cache.size === 0) {
    // ... scanAvailableSkills()呼び出し
  }

  const result = importedIds
    .map((id) => this.cache.get(id))
    .filter((skill): skill is Skill => skill !== undefined);
  // ↑ 孤立IDがsilentにフィルタリングされている
  return result;
}
```

**結論**:

- Phase 2の設計で想定したとおり、孤立IDがsilentにフィルタリングされている
- 設計の修正は不要。Phase 5で予定通り実装を進める

### 3.3 R2: electron-storeパスの乖離

**問題の詳細**:

| 観点   | 設計書（technical-decisions.md）          | 実装（index.ts）                                              |
| ------ | ----------------------------------------- | ------------------------------------------------------------- |
| 保存先 | `~/.aiworkflow/config/skill-imports.json` | `electron-store`デフォルトパス（`{appDataPath}/skills.json`） |

**対応方針**:

- オプションA採用: 設計書を実装に合わせて更新
- 理由: electron-storeのデフォルトパスはOSのベストプラクティスに従う

**対応時期**: Phase 12（ドキュメント更新）

### 3.4 R3: async-mutexの依存追加

**確認事項**:

- `async-mutex` パッケージを `apps/desktop` に追加
- バージョン: ^0.4.0

**対応時期**: Phase 5（実装）開始時

---

## 4. 追加調査結果

### 4.1 DEBUGログの残存状況

| ファイル                | DEBUGログ箇所数 | 確認済み |
| ----------------------- | --------------- | -------- |
| `skillHandlers.ts`      | 6箇所           | Yes      |
| `SkillImportManager.ts` | 8箇所           | Yes      |
| `SkillService.ts`       | 10箇所          | Yes      |

**確認済みログ例（skillHandlers.ts L73-100）**:

```typescript
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

### 4.2 型キャストの問題箇所

`SkillImportManager.ts` L32:

```typescript
const stored = this.store.get(STORE_KEY, []) as string[];
```

**確認結果**: Phase 2の設計どおり、Zodによる型検証を追加する

### 4.3 エラーレスポンス形式の問題箇所

`skillHandlers.ts`:

- L122-125: `throw { code, message }` パターン
- L141-142: `throw { code, message }` パターン
- L59-64, L101-105: `return { success: false, ... }` パターン

**確認結果**: Phase 2の設計どおり、IPCResult形式に統一する

---

## 5. レビューチェックリスト

### 5.1 機能要件

- [x] すべての受入基準（AC1-AC5）に対する設計が存在する
- [x] 潜在的問題（P1-P5）すべてに解決策がある
- [x] SkillService.getImportedSkills()の実装確認完了

### 5.2 非機能要件

- [x] パフォーマンスへの影響が評価されている
- [x] セキュリティ観点での検証が完了している
- [x] エラーハンドリングが規約に従っている
- [x] ログレベル制御が設計されている

### 5.3 テスト

- [x] ユニットテストの対象が明確
- [x] 統合テストのシナリオが定義されている
- [x] テストファイルの配置が決まっている

### 5.4 依存関係

- [x] 追加パッケージが特定されている（async-mutex）
- [x] 既存コードへの影響が評価されている
- [ ] async-mutexの追加確認（Phase 5で実施）

---

## 6. 次のアクション

### Phase 4開始前の必須タスク

| No  | タスク                                     | 状態           |
| --- | ------------------------------------------ | -------------- |
| 1   | SkillService.getImportedSkills()の実装確認 | 完了           |
| 2   | technical-decisions.mdのストアパス記述更新 | Phase 12で対応 |
| 3   | async-mutexパッケージの追加                | Phase 5で対応  |

### Phase 4（テスト作成）で実施する内容

1. Logger のユニットテスト作成
2. SkillImportManager のユニットテスト拡充
   - 正常データの読み込み
   - 不正データのフォールバック
   - 並列アクセスの整合性
3. SkillService のユニットテスト拡充
   - 孤立ID検出
4. skillHandlers の統合テスト拡充
   - エラーレスポンス形式の検証

---

## 7. 参照

| 資料                   | パス                                         |
| ---------------------- | -------------------------------------------- |
| Phase 1 要件定義       | `outputs/phase-1/requirements-definition.md` |
| Phase 1 受入基準       | `outputs/phase-1/acceptance-criteria.md`     |
| Phase 2 アーキテクチャ | `outputs/phase-2/architecture-design.md`     |
| Phase 2 修正設計       | `outputs/phase-2/fix-design.md`              |
| 設計レビュー判定基準   | `.claude/rules/05-task-execution.md#Phase 3` |

---

## 8. 承認

| 項目      | 内容                                               |
| --------- | -------------------------------------------------- |
| 判定      | **MINOR**                                          |
| 次のPhase | Phase 4: テスト作成                                |
| 条件      | 上記アクションアイテムの対応（Phase 5/12で対応可） |
| 承認日    | 2026-02-07                                         |

---

## 9. 完了条件

- [x] すべてのレビュー観点での検証が完了している
- [x] 検出された問題に対する対応方針が決定している
- [x] 判定（PASS/MINOR/MAJOR）が下されている
- [x] MINORの場合: 指摘対応のアクションアイテムが設定されている
