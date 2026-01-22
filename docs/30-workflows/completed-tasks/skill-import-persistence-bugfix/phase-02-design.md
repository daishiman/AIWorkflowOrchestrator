# Phase 2: 設計

## メタ情報

| 項目      | 内容                         |
| --------- | ---------------------------- |
| Phase     | 2                            |
| Phase名   | 設計                         |
| 目的      | 修正方針・アーキテクチャ確認 |
| 前提Phase | Phase 1: 要件定義            |
| 次Phase   | Phase 3: 設計レビューゲート  |

---

## 1. 目的

Phase 1で特定した根本原因に基づき、修正設計を策定する。

---

## 2. 実行タスク

### Task 1: 既存アーキテクチャの確認

#### 手順

1. `apps/desktop/src/main/ipc/index.ts`のストア初期化部分を確認する

2. 現在のストア設定を記録する：
   - ストア名（name）
   - デフォルト値（defaults）
   - その他の設定オプション

3. 他のストア（knowledge-studioなど）の設定と比較する

#### 成果物

- 既存ストア設定の分析結果

#### 完了条件

- [ ] 現在のストア設定が記録されている
- [ ] 他のストアとの設定比較が完了している
- [ ] 設定の差異が明確になっている

---

### Task 2: 修正方針の策定

#### 手順

1. Phase 1で特定した原因に対する修正方針を検討する

2. 以下の修正パターンを検討する：

   **パターンA: ストア設定の改善**

   ```typescript
   const skillStore = new Store({
     name: "skills",
     defaults: {
       importedSkillIds: [],
     },
   });
   ```

   **パターンB: エラーハンドリングの追加**

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

   **パターンC: ストアキーの統一**
   - `STORE_KEY`の値が`index.ts`と`SkillImportManager.ts`で一致していることを確認

3. 最適な修正方針を選択し、理由を記録する

#### 成果物

- 修正方針決定書

#### 完了条件

- [ ] 複数の修正パターンが検討されている
- [ ] 最適な修正方針が選択されている
- [ ] 選択理由が明確に記録されている

---

### Task 3: インターフェース設計の確認

#### 手順

1. `SkillImportManager`のインターフェースを確認する

2. 修正によってインターフェースに変更が必要かを検討する

3. 変更が必要な場合は、後方互換性を考慮した設計を行う

#### 成果物

- インターフェース影響分析

#### 完了条件

- [ ] 既存インターフェースへの影響が分析されている
- [ ] 変更が必要な場合は設計が完了している

---

### Task 4: 設計書作成

#### 手順

1. `outputs/phase-02/design-document.md`を作成する

2. 以下の内容を記載する：
   - 修正方針の概要
   - 変更対象ファイル一覧
   - 変更内容の詳細
   - インターフェースへの影響
   - 後方互換性の考慮事項

#### 成果物

- `outputs/phase-02/design-document.md`

#### 完了条件

- [ ] 設計書が作成されている
- [ ] 変更内容が具体的に記載されている

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | スキル管理サービス設計 |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー処理パターン     |

### 前Phaseの成果物

| 成果物       | パス                                       |
| ------------ | ------------------------------------------ |
| 調査レポート | `outputs/phase-01/investigation-report.md` |

---

## 4. 成果物一覧

| 成果物 | 配置先                                | 形式     |
| ------ | ------------------------------------- | -------- |
| 設計書 | `outputs/phase-02/design-document.md` | Markdown |

---

## 5. 完了条件チェックリスト

- [ ] Task 1: 既存アーキテクチャの確認が完了
- [ ] Task 2: 修正方針が策定されている
- [ ] Task 3: インターフェース設計の確認が完了
- [ ] Task 4: 設計書が作成されている

---

## 6. 次Phaseへの引き継ぎ事項

- 確定した修正方針
- 変更対象ファイル一覧
- 設計書

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-22 | 初版作成 |
