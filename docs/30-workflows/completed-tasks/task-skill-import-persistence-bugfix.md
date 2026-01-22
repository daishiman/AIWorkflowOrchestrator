# スキルインポート永続化不具合修正 - タスク指示書

## メタ情報

```yaml
issue_number: 422
```

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | SKILL-IMPORT-PERSIST-001         |
| タスク名     | スキルインポート永続化不具合修正 |
| 分類         | バグ修正                         |
| 対象機能     | スキル管理（SkillImportManager） |
| 優先度       | 高                               |
| 見積もり規模 | 小規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 11（手動テスト検証）       |
| 発見日       | 2026-01-21                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキル管理機能のテスト中に、`skill:list-imported` APIが常に空配列を返す問題が発見された。

ログから以下のパターンが確認された：

```
[SkillService][DEBUG] importedIds: []
[SkillService][DEBUG] getImportedSkills - DONE, returning 0 skills
```

### 1.2 問題点・課題

| 問題                  | 詳細                                                   |
| --------------------- | ------------------------------------------------------ |
| `importedIds`が常に空 | `SkillImportManager.getImportedSkillIds()`が`[]`を返す |
| デバッグ情報の不足    | ストアの初期化・永続化状態を確認するログがない         |
| ストア設定が最小限    | 他のストア（knowledge-studio）と比較して設定が不足     |

### 1.3 放置した場合の影響

- ユーザーがスキルをインポートしても、アプリ再起動後にインポート状態が失われる
- スキル管理UIが正常に動作しない
- ユーザー体験の著しい低下

---

## 2. 何を達成するか（What）

### 2.1 目的

1. `importedIds`が空になる根本原因を特定する
2. ストアの永続化が正常に動作することを確認・修正する
3. デバッグログを追加して問題の再発を防止する

### 2.2 最終ゴール

- スキルをインポートした後、アプリを再起動しても`skill:list-imported`がインポート済みスキルを返す
- ストアファイル（`skills.json`）にインポート済みスキルIDが永続化されている

### 2.3 スコープ

#### 含むもの

- `SkillImportManager`のデバッグログ追加
- ストア初期化時の設定見直し
- ストアファイルの存在・内容確認
- ユニットテストの追加・修正

#### 含まないもの

- スキル実行機能の変更
- UIコンポーネントの変更
- 他のストア（knowledge-studio等）の変更

### 2.4 成果物

| 成果物               | 説明                                |
| -------------------- | ----------------------------------- |
| 修正済みソースコード | `SkillImportManager.ts`、`index.ts` |
| デバッグログ追加     | ストア初期化・永続化状態の可視化    |
| 追加テストケース     | 永続化フローの検証テスト            |
| 調査レポート         | 根本原因と修正内容の記録            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Electronアプリのビルド・実行環境が整っていること
- `electron-store`の動作原理を理解していること

### 3.2 依存タスク

- なし（独立したバグ修正）

### 3.3 必要な知識

| 知識領域       | 詳細                                         |
| -------------- | -------------------------------------------- |
| electron-store | Electronアプリ用の永続化ストレージライブラリ |
| Electron IPC   | Main-Renderer間通信                          |
| TypeScript     | 型安全なコーディング                         |

### 3.4 推奨アプローチ

1. **原因特定フェーズ**: ストアファイルの存在確認、デバッグログ追加
2. **修正フェーズ**: 必要に応じてストア設定を改善
3. **検証フェーズ**: 手動テスト＋自動テストで永続化を確認

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 目的                       |
| ----- | ------------ | -------------------------- |
| 1     | 原因特定     | ストア状態の確認、ログ追加 |
| 2     | 修正実装     | 必要な修正を実施           |
| 3     | テスト       | 動作確認、テストケース追加 |
| 4     | ドキュメント | 調査結果・修正内容の記録   |

### Phase 1: 原因特定

#### 目的

`importedIds`が空になる根本原因を特定する

#### 手順

1. ストアファイルの存在確認

   ```bash
   cat ~/Library/Application\ Support/com.aiworkflow.orchestrator/skills.json
   ```

2. `SkillImportManager`コンストラクタにデバッグログを追加

   ```typescript
   constructor(store: ElectronStore) {
     this.store = store;
     console.log("[SkillImportManager] Store path:", (store as any).path);
     const stored = this.store.get(STORE_KEY, []) as string[];
     console.log("[SkillImportManager] Loaded from store:", stored);
     this.importedIds = new Set(stored);
   }
   ```

3. `persist()`メソッドにもログを追加

   ```typescript
   private persist(): void {
     console.log("[SkillImportManager] Persisting:", Array.from(this.importedIds));
     this.store.set(STORE_KEY, Array.from(this.importedIds));
     console.log("[SkillImportManager] Persist complete");
   }
   ```

4. アプリを起動してログを確認

#### 成果物

- デバッグログ付きの`SkillImportManager.ts`
- 原因特定レポート

#### 完了条件

- [ ] ストアファイルのパスと内容が確認できる
- [ ] `importedIds`が空になる原因が特定できる

### Phase 2: 修正実装

#### 目的

特定した原因に対する修正を実施

#### 手順

1. **ストア設定の改善**（必要な場合）

   ```typescript
   // apps/desktop/src/main/ipc/index.ts
   const skillStore = new Store({
     name: "skills",
     defaults: {
       importedSkillIds: [],
     },
   });
   ```

2. **エラーハンドリングの追加**（必要な場合）

   ```typescript
   constructor(store: ElectronStore) {
     this.store = store;
     try {
       const stored = this.store.get(STORE_KEY, []) as string[];
       this.importedIds = new Set(stored);
     } catch (error) {
       console.error("[SkillImportManager] Failed to load from store:", error);
       this.importedIds = new Set();
     }
   }
   ```

3. 修正後のコードをビルド・テスト

#### 成果物

- 修正済み`SkillImportManager.ts`
- 修正済み`index.ts`

#### 完了条件

- [ ] スキルをインポートした後、ストアファイルにデータが保存される
- [ ] アプリ再起動後、インポート済みスキルが復元される

### Phase 3: テスト

#### 目的

修正が正常に動作することを確認

#### 手順

1. 既存のユニットテストを実行

   ```bash
   pnpm --filter @repo/desktop test SkillImportManager
   ```

2. 永続化テストケースを追加

   ```typescript
   it("should persist and restore imported skills", async () => {
     // インポート
     await manager.importSkills(["skill-1", "skill-2"]);

     // ストアから直接読み込み
     const stored = mockStore.get("importedSkillIds", []);
     expect(stored).toEqual(["skill-1", "skill-2"]);

     // 新しいインスタンスを作成して復元確認
     mockStore.get.mockReturnValue(["skill-1", "skill-2"]);
     const newManager = new SkillImportManager(mockStore);
     expect(newManager.getImportedSkillIds()).toEqual(["skill-1", "skill-2"]);
   });
   ```

3. 手動テスト
   - スキルをインポート
   - アプリを再起動
   - `skill:list-imported`でスキルが返ることを確認

#### 成果物

- 追加テストケース
- 手動テスト結果レポート

#### 完了条件

- [ ] 全テストがパス
- [ ] 手動テストで永続化が確認できる

### Phase 4: ドキュメント

#### 目的

調査結果と修正内容を記録

#### 手順

1. 根本原因の記録
2. 修正内容の記録
3. システム仕様への反映（必要な場合）

#### 成果物

- 調査・修正レポート

#### 完了条件

- [ ] 原因と修正内容が記録されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill:import`でインポートしたスキルがストアに保存される
- [ ] アプリ再起動後、`skill:list-imported`がインポート済みスキルを返す
- [ ] `skill:remove`でスキルを削除するとストアから削除される

### 品質要件

- [ ] 全既存テストがパス
- [ ] 追加テストがパス
- [ ] TypeScriptエラーなし
- [ ] Lintエラーなし

### ドキュメント要件

- [ ] 調査・修正レポートが作成されている

---

## 6. 検証方法

### テストケース

| TC-ID  | テストケース                               | 期待結果                       |
| ------ | ------------------------------------------ | ------------------------------ |
| TC-001 | スキルをインポートする                     | `persist()`が呼ばれる          |
| TC-002 | アプリ再起動後にインポート済みスキルを取得 | インポート済みスキルが返る     |
| TC-003 | ストアファイルの内容確認                   | `importedSkillIds`が保存される |

### 検証手順

1. アプリを起動
2. スキル一覧から任意のスキルをインポート
3. アプリを完全に終了
4. ストアファイル（`skills.json`）を確認
5. アプリを再起動
6. `skill:list-imported`の結果を確認

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                             |
| ---------------------------------- | ------ | -------- | -------------------------------- |
| ストアファイルが壊れる             | 中     | 低       | バックアップ・リカバリー機能検討 |
| 他のストア設定に影響               | 中     | 低       | スキル専用ストアのため影響なし   |
| テスト環境と本番環境でパスが異なる | 低     | 中       | 環境変数・設定で対応             |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| スキル管理IPC仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |

### 関連ソースコード

| ファイル                                                     | 役割                  |
| ------------------------------------------------------------ | --------------------- |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts` | インポート状態管理    |
| `apps/desktop/src/main/services/skill/SkillService.ts`       | スキルサービスFacade  |
| `apps/desktop/src/main/ipc/index.ts`                         | IPC登録・ストア初期化 |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                 | スキルIPCハンドラー   |

### 参考資料

- [electron-store ドキュメント](https://github.com/sindresorhus/electron-store)

---

## 9. 備考

### 調査ログの原文

```
[SkillService][DEBUG] getImportedSkills - DONE, returning 0 skills
[skillHandlers][DEBUG] getImportedSkills result: 0 skills
[skillHandlers][DEBUG] skill:list-imported - START
[skillHandlers][DEBUG] skill:list-imported - validation PASSED
[skillHandlers][DEBUG] Calling skillService.getImportedSkills()...
[SkillService][DEBUG] getImportedSkills - START
[SkillService][DEBUG] importedIds: []
[SkillService][DEBUG] getImportedSkills - DONE, returning 0 skills
```

### 補足事項

- 問題の最も可能性が高い原因は「スキルがまだインポートされていない」可能性
- ストアの永続化自体は正常に動作している可能性もある
- Phase 1の調査で原因が「未インポート」と判明した場合、修正は不要となる可能性がある
