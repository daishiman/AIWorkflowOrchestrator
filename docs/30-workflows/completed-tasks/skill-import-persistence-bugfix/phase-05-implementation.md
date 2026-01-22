# Phase 5: 実装

## メタ情報

| 項目      | 内容                   |
| --------- | ---------------------- |
| Phase     | 5                      |
| Phase名   | 実装                   |
| 目的      | 修正実装（TDD: Green） |
| 前提Phase | Phase 4: テスト作成    |
| 次Phase   | Phase 6: テスト拡充    |

---

## 1. 目的

Phase 4で作成した失敗するテストがパスするように、最小限の修正を実装する（TDD: Green Phase）。

---

## 2. 実行タスク

### Task 1: SkillImportManagerの修正

#### 手順

1. `apps/desktop/src/main/services/skill/SkillImportManager.ts`を開く

2. Phase 1で追加したデバッグログを維持しつつ、以下の修正を実施する：

   **修正1: エラーハンドリングの追加**

   ```typescript
   constructor(store: ElectronStore) {
     this.store = store;
     try {
       console.log("[SkillImportManager] Store path:", (store as any).path);
       const stored = this.store.get(STORE_KEY, []) as string[];
       console.log("[SkillImportManager] Loaded from store:", stored);
       this.importedIds = new Set(stored);
     } catch (error) {
       console.error("[SkillImportManager] Failed to load from store:", error);
       this.importedIds = new Set();
     }
   }
   ```

   **修正2: persist()メソッドの確認**

   ```typescript
   private persist(): void {
     try {
       console.log("[SkillImportManager] Persisting:", Array.from(this.importedIds));
       this.store.set(STORE_KEY, Array.from(this.importedIds));
       console.log("[SkillImportManager] Persist complete");
     } catch (error) {
       console.error("[SkillImportManager] Failed to persist:", error);
     }
   }
   ```

3. `STORE_KEY`の値を確認し、必要に応じて修正する

#### 成果物

- 修正済み`SkillImportManager.ts`

#### 完了条件

- [ ] エラーハンドリングが追加されている
- [ ] デバッグログが適切に出力される

---

### Task 2: ストア初期化の修正（必要な場合）

#### 手順

1. `apps/desktop/src/main/ipc/index.ts`を開く

2. スキルストアの初期化コードを確認する

3. 必要に応じて、以下のようにデフォルト値を設定する：

   ```typescript
   const skillStore = new Store({
     name: "skills",
     defaults: {
       importedSkillIds: [],
     },
   });
   ```

4. `STORE_KEY`と`defaults`のキーが一致していることを確認する

#### 成果物

- 修正済み`index.ts`（変更が必要な場合）

#### 完了条件

- [ ] ストア初期化が正しく設定されている
- [ ] キー名が一致している

---

### Task 3: テスト実行・Green確認

#### 手順

1. テストを実行する：

   ```bash
   pnpm --filter @repo/desktop test SkillImportManager
   ```

2. Phase 4で作成したテストがすべてパスすることを確認する

3. 既存のテストもすべてパスすることを確認する

#### 成果物

- テスト実行結果（Green状態）

#### 完了条件

- [ ] 新規テストがすべてパス
- [ ] 既存テストがすべてパス
- [ ] TypeScriptエラーなし

---

### Task 4: 手動動作確認

#### 手順

1. アプリをビルド・起動する：

   ```bash
   pnpm --filter @repo/desktop dev
   ```

2. 以下の操作を行い、デバッグログを確認する：
   - スキルをインポート
   - `skill:list-imported`の結果を確認
   - アプリを再起動
   - 再度`skill:list-imported`の結果を確認

3. ストアファイルの内容を確認する：

   ```bash
   cat ~/Library/Application\ Support/com.aiworkflow.orchestrator/skills.json
   ```

#### 成果物

- 手動テスト結果

#### 完了条件

- [ ] インポートしたスキルがストアに保存されている
- [ ] アプリ再起動後もインポート状態が維持されている

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | スキル管理サービス設計 |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー処理パターン     |

### 前Phaseの成果物

| 成果物       | パス                                              |
| ------------ | ------------------------------------------------- |
| 設計書       | `outputs/phase-02/design-document.md`             |
| テストケース | `apps/desktop/src/main/services/skill/__tests__/` |

---

## 4. 成果物一覧

| 成果物                     | 配置先                                  | 形式       |
| -------------------------- | --------------------------------------- | ---------- |
| 修正済みSkillImportManager | `apps/desktop/src/main/services/skill/` | TypeScript |
| 修正済みindex.ts（必要時） | `apps/desktop/src/main/ipc/`            | TypeScript |

---

## 5. 完了条件チェックリスト

- [ ] Task 1: SkillImportManagerの修正が完了
- [ ] Task 2: ストア初期化の修正が完了（必要な場合）
- [ ] Task 3: 全テストがパス（Green状態）
- [ ] Task 4: 手動動作確認が完了

---

## 6. 次Phaseへの引き継ぎ事項

- 修正済みコード
- テスト実行結果
- 手動テスト結果

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-22 | 初版作成 |
