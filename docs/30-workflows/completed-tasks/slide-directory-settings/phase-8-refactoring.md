# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 8                        |
| Phase名    | リファクタリング         |
| 前提Phase  | Phase 7                  |
| 後続Phase  | Phase 9                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | slide-directory-settings |

---

## 目的

TDDのRefactor段階として、テストを維持しながらコード品質を改善する。重複排除、命名改善、構造最適化を行い、保守性を向上させる。

## 背景

Phase 7でカバレッジゲートを通過した。このPhaseでは、機能を変更せずにコードの内部品質を改善する。全てのテストがGreen状態を維持することが必須条件。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード重複の排除

**目的**: DRY原則に基づき、重複コードを排除する

**実行手順**:

1. 重複パターンを特定:
   - IPC通信のエラーハンドリング
   - パスバリデーションロジック
   - 設定デフォルト値の参照

2. 共通化可能な部分を抽出:

   ```typescript
   // 例: IPC Result生成のヘルパー
   function createSuccess<T>(data: T): Result<T> {
     return { success: true, data };
   }

   function createError(error: string): Result<never> {
     return { success: false, error };
   }
   ```

3. リファクタリング後にテストを実行し、全てパスすることを確認

**期待される成果物**:

- リファクタリングされたコード
- テスト結果（全てパス）

---

### タスク2: 命名の改善

**目的**: 可読性を向上させるため、命名を改善する

**実行手順**:

1. 命名規則の確認:
   - 関数: 動詞で始まる（get, set, validate, create）
   - 変数: 明確で簡潔な名前
   - 型: PascalCase、意味を表す名前
   - 定数: SCREAMING_SNAKE_CASE

2. 改善が必要な命名をリストアップ:
   - 曖昧な名前（data, result, temp）
   - 長すぎる名前
   - 略語の乱用

3. 命名を改善し、テストが通ることを確認

**期待される成果物**:

- 命名改善後のコード
- テスト結果（全てパス）

---

### タスク3: 構造の最適化

**目的**: モジュール構造を最適化し、責務を明確にする

**実行手順**:

1. 単一責務の原則を確認:
   - SlideSettingsStore: 永続化のみ
   - IPCハンドラー: 通信のみ
   - UIコンポーネント: 表示のみ
   - カスタムフック: 状態管理のみ

2. 責務が混在している部分を分離:

   ```typescript
   // 例: バリデーションロジックを分離
   // Before: SlideSettingsStore内にバリデーション
   // After: DirectoryValidator クラスに分離
   class DirectoryValidator {
     validate(path: string): DirectoryValidationResult { ... }
     validatePathTraversal(path: string): boolean { ... }
   }
   ```

3. 依存関係を整理し、循環参照を排除

4. テストが通ることを確認

**期待される成果物**:

- 構造最適化後のコード
- テスト結果（全てパス）

---

### タスク4: エラーハンドリングの統一

**目的**: エラーハンドリングパターンを統一する

**実行手順**:

1. 現在のエラーハンドリングパターンを確認:
   - try-catch の使用箇所
   - Result型の使用箇所
   - エラーメッセージの形式

2. 統一パターンを適用:

   ```typescript
   // 統一パターン: Result型
   type Result<T> =
     | { success: true; data: T }
     | { success: false; error: string; code?: string };

   // エラーコード定義
   const SlideSettingsErrorCode = {
     INVALID_PATH: "INVALID_PATH",
     PATH_TRAVERSAL: "PATH_TRAVERSAL",
     NOT_WRITABLE: "NOT_WRITABLE",
     STORE_ERROR: "STORE_ERROR",
   } as const;
   ```

3. エラーメッセージの日本語化・統一

4. テストが通ることを確認

**期待される成果物**:

- エラーハンドリング統一後のコード
- テスト結果（全てパス）

---

### タスク5: リファクタリング完了確認

**目的**: リファクタリング後の品質を確認する

**実行手順**:

1. 全テストを実行:

   ```bash
   pnpm --filter @repo/desktop test:run
   ```

2. カバレッジが維持されていることを確認:

   ```bash
   pnpm --filter @repo/desktop test:coverage
   ```

3. 型チェック:

   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

4. Lintチェック:

   ```bash
   pnpm --filter @repo/desktop lint
   ```

5. 結果を `outputs/phase-8/refactoring-report.md` に出力

**期待される成果物**:

- `outputs/phase-8/refactoring-report.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                        | 内容                       |
| ------------------ | --------------------------------------------------------------------------- | -------------------------- |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | コード品質基準             |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラーハンドリングパターン |

### 関連ドキュメント

| 参照資料          | パス                   | 内容             |
| ----------------- | ---------------------- | ---------------- |
| Phase 5実装       | `apps/desktop/src/**/` | 現在の実装コード |
| Phase 7カバレッジ | `outputs/phase-7/`     | カバレッジ基準   |

---

## 成果物

| 成果物                     | パス                                    | 内容                 |
| -------------------------- | --------------------------------------- | -------------------- |
| リファクタリングレポート   | `outputs/phase-8/refactoring-report.md` | リファクタリング結果 |
| リファクタリング済みコード | `apps/desktop/src/**/`                  | 改善後のコード       |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 8での統合テスト連携アクション**:

- リファクタ後の統合テスト継続成功を確認
- カバレッジが維持されていることを確認

---

## 完了条件

- [ ] コード重複が排除されている
- [ ] 命名が改善されている
- [ ] 構造が最適化されている
- [ ] エラーハンドリングが統一されている
- [ ] 全てのテストがパスしている
- [ ] カバレッジが維持されている
- [ ] 型チェックがパスしている
- [ ] Lintチェックがパスしている
- [ ] 統合テスト連携アクションが完了している
- [ ] リファクタリングレポートが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/slide-directory-settings/phase-9-quality.md`
