# Phase 1: 要件定義

## メタ情報

| 項目      | 内容                         |
| --------- | ---------------------------- |
| Phase     | 1                            |
| Phase名   | 要件定義                     |
| 目的      | 問題の詳細定義・スコープ確定 |
| 前提Phase | なし                         |
| 次Phase   | Phase 2: 設計                |

---

## 1. 目的

`skill:list-imported` APIが常に空配列を返す問題の根本原因を調査し、修正要件を明確化する。

---

## 2. 実行タスク

### Task 1: ストアファイルの存在確認

#### 手順

1. 以下のコマンドでストアファイルの存在と内容を確認する：

   ```bash
   cat ~/Library/Application\ Support/com.aiworkflow.orchestrator/skills.json
   ```

2. ファイルが存在しない場合は、その旨を記録する

3. ファイルが存在する場合は、内容を記録する

#### 成果物

- ストアファイル確認結果（存在有無・内容）

#### 完了条件

- [ ] ストアファイルのパスと存在状況が確認できている
- [ ] ファイル内容（存在する場合）が記録されている

---

### Task 2: デバッグログ追加（SkillImportManager）

#### 手順

1. `apps/desktop/src/main/services/skill/SkillImportManager.ts`を開く

2. コンストラクタに以下のデバッグログを追加する：

   ```typescript
   constructor(store: ElectronStore) {
     this.store = store;
     console.log("[SkillImportManager] Store path:", (store as any).path);
     const stored = this.store.get(STORE_KEY, []) as string[];
     console.log("[SkillImportManager] Loaded from store:", stored);
     this.importedIds = new Set(stored);
   }
   ```

3. `persist()`メソッドにもログを追加する：

   ```typescript
   private persist(): void {
     console.log("[SkillImportManager] Persisting:", Array.from(this.importedIds));
     this.store.set(STORE_KEY, Array.from(this.importedIds));
     console.log("[SkillImportManager] Persist complete");
   }
   ```

#### 成果物

- デバッグログ追加済み`SkillImportManager.ts`

#### 完了条件

- [ ] コンストラクタにストアパス・読み込み内容のログが追加されている
- [ ] `persist()`メソッドに永続化内容・完了のログが追加されている

---

### Task 3: 原因特定のためのアプリ起動・ログ確認

#### 手順

1. デバッグログを追加した状態でアプリをビルド・起動する

   ```bash
   pnpm --filter @repo/desktop dev
   ```

2. コンソールログを確認し、以下の情報を記録する：
   - ストアパス
   - 初期化時に読み込まれた値
   - 永続化時に書き込まれた値（インポート操作を行った場合）

3. 原因を以下のカテゴリに分類する：
   - A: ストアファイルが作成されていない
   - B: ストアファイルは存在するが読み込みに失敗している
   - C: 永続化処理が呼ばれていない
   - D: 永続化は成功しているが別のストアに書き込まれている
   - E: その他

#### 成果物

- 原因特定レポート

#### 完了条件

- [ ] 原因カテゴリが特定できている
- [ ] 根本原因が明確になっている

---

### Task 4: 調査レポート作成

#### 手順

1. `outputs/phase-01/investigation-report.md`を作成する

2. 以下の内容を記載する：
   - 調査日時
   - 確認したストアファイルの状態
   - デバッグログの出力内容
   - 特定した原因カテゴリ
   - 根本原因の詳細説明
   - 推奨される修正方針

#### 成果物

- `outputs/phase-01/investigation-report.md`

#### 完了条件

- [ ] 調査レポートが作成されている
- [ ] 根本原因が明確に記載されている
- [ ] 修正方針が記載されている

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| スキル管理IPC仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | IPCチャネル・API仕様   |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | スキル管理サービス設計 |

### 関連ソースコード

| ファイル                                                     | 役割                 |
| ------------------------------------------------------------ | -------------------- |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts` | インポート状態管理   |
| `apps/desktop/src/main/services/skill/SkillService.ts`       | スキルサービスFacade |
| `apps/desktop/src/main/ipc/index.ts`                         | ストア初期化         |

---

## 4. 成果物一覧

| 成果物                 | 配置先                                     | 形式       |
| ---------------------- | ------------------------------------------ | ---------- |
| 調査レポート           | `outputs/phase-01/investigation-report.md` | Markdown   |
| デバッグログ追加コード | `apps/desktop/src/main/services/skill/`    | TypeScript |

---

## 5. 完了条件チェックリスト

- [ ] Task 1: ストアファイルの存在確認が完了
- [ ] Task 2: デバッグログが追加されている
- [ ] Task 3: 原因が特定されている
- [ ] Task 4: 調査レポートが作成されている

---

## 6. 次Phaseへの引き継ぎ事項

- 特定された根本原因
- 推奨される修正方針
- デバッグログ追加済みのコード

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-22 | 初版作成 |
