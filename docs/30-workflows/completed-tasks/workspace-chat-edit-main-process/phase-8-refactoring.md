# Phase 8: リファクタリング

## メタ情報

| 項目         | 内容                       |
| ------------ | -------------------------- |
| Phase        | 8                          |
| 名称         | リファクタリング           |
| 目的         | TDD: Refactor（品質改善）  |
| 前提Phase    | Phase 7（カバレッジ確認）  |
| 成果物       | リファクタリング済みコード |
| 成果物配置先 | 既存ファイルの更新         |

---

## 1. 目的

TDD Refactor phaseとして、テストを維持しながらコード品質を改善する。

---

## 2. 実行タスク

### Task 1: コード品質レビュー

#### 2.1.1 レビュー観点

| 観点         | 確認項目                            | 結果 |
| ------------ | ----------------------------------- | ---- |
| 可読性       | 変数名・関数名が明確か              | -    |
| 保守性       | 単一責任原則に従っているか          | -    |
| DRY原則      | 重複コードがないか                  | -    |
| 型安全性     | any型の使用を最小化しているか       | -    |
| エラー処理   | エラーハンドリングが一貫しているか  | -    |
| ドキュメント | JSDoc/TSDocが適切に記述されているか | -    |

---

### Task 2: FileServiceリファクタリング

#### 2.2.1 改善項目

| #   | 改善項目                 | 現状             | 改善後             |
| --- | ------------------------ | ---------------- | ------------------ |
| 1   | 定数の外部化             | クラス内に定義   | 定数ファイルに分離 |
| 2   | エラーハンドリング統一   | 各所でtry/catch  | 共通エラーハンドラ |
| 3   | バリデーション関数の抽出 | readFile内で検証 | 独立した関数へ     |

#### 2.2.2 リファクタリング例

```typescript
// Before
async readFile(filePath: string): Promise<FileReadResult> {
  try {
    const stats = await fs.stat(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      return { success: false, error: { code: 'TOO_LARGE', message: '...' } };
    }
    // ...
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { success: false, error: { code: 'FILE_NOT_FOUND', message: '...' } };
    }
    // ...
  }
}

// After
async readFile(filePath: string): Promise<FileReadResult> {
  const validationResult = await this.validateReadable(filePath);
  if (!validationResult.valid) {
    return { success: false, error: validationResult.error };
  }

  return this.executeRead(filePath);
}

private async validateReadable(filePath: string): Promise<ValidationResult> {
  // 検証ロジックを分離
}

private async executeRead(filePath: string): Promise<FileReadResult> {
  // 読み取りロジック
}
```

---

### Task 3: ChatEditServiceリファクタリング

#### 2.3.1 改善項目

| #   | 改善項目                     | 現状             | 改善後                |
| --- | ---------------------------- | ---------------- | --------------------- |
| 1   | プロンプトテンプレート外部化 | クラス内に定義   | 別ファイルに分離      |
| 2   | 差分計算ロジックの改善       | 簡易版（全置換） | LCS使用（既存再利用） |
| 3   | レスポンスパース強化         | 正規表現のみ     | 複数パターン対応      |

#### 2.3.2 リファクタリング例

```typescript
// prompts.ts に分離
export const EDIT_PROMPTS = {
  continue: {
    template: '...',
    description: 'コードの続きを生成',
  },
  refactor: {
    template: '...',
    description: 'リファクタリング',
  },
  // ...
};

// ChatEditService.ts
import { EDIT_PROMPTS } from './prompts';

private buildPrompt(command: EditCommand, context: string): string {
  const promptConfig = EDIT_PROMPTS[command.type];
  if (!promptConfig) {
    throw new Error(`Unknown command type: ${command.type}`);
  }
  return promptConfig.template.replace('{context}', context);
}
```

---

### Task 4: 共通ユーティリティ抽出

#### 2.4.1 抽出候補

| ユーティリティ | 用途                   | 配置先                    |
| -------------- | ---------------------- | ------------------------- |
| PathValidator  | ファイルパス検証       | services/chat-edit/utils/ |
| ErrorMapper    | エラーコードマッピング | services/chat-edit/utils/ |
| ResponseParser | LLMレスポンスパース    | services/chat-edit/utils/ |

#### 2.4.2 PathValidator例

```typescript
// utils/PathValidator.ts
export class PathValidator {
  /**
   * パストラバーサル検出
   */
  static detectTraversal(filePath: string): boolean {
    const normalized = path.normalize(filePath);
    return normalized.includes("..");
  }

  /**
   * 許可されたパスかチェック
   */
  static isAllowedPath(filePath: string, allowedDirs: string[]): boolean {
    const resolved = path.resolve(filePath);
    return allowedDirs.some((dir) => resolved.startsWith(dir));
  }
}
```

---

### Task 5: テスト維持確認

#### 2.5.1 リファクタリング後のテスト実行

```bash
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/chat-edit/
```

#### 2.5.2 テスト結果確認

| テストファイル           | テスト数 | パス数 | 失敗数 | 判定 |
| ------------------------ | -------- | ------ | ------ | ---- |
| FileService.test.ts      | -        | -      | -      | -    |
| ContextBuilder.test.ts   | -        | -      | -      | -    |
| ChatEditService.test.ts  | -        | -      | -      | -    |
| chatEditHandlers.test.ts | -        | -      | -      | -    |
| integration.test.ts      | -        | -      | -      | -    |

---

## 3. リファクタリング原則

### 3.1 必須原則

- [ ] 機能を変更しない（テストがパスし続ける）
- [ ] 小さな変更を段階的に適用
- [ ] 各変更後にテストを実行
- [ ] 変更理由をコメントまたはコミットメッセージに記録

### 3.2 避けるべきこと

- [ ] 過度な抽象化
- [ ] 不要なデザインパターンの適用
- [ ] テストをスキップしたリファクタリング
- [ ] 複数の大きな変更を一度に適用

---

## 4. 参照資料

### 4.1 システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |

---

## 5. 成果物

| 成果物                     | 配置先              | 説明                   |
| -------------------------- | ------------------- | ---------------------- |
| リファクタリング済みコード | 既存ファイルの更新  | 品質改善されたコード   |
| prompts.ts（新規）         | services/chat-edit/ | プロンプトテンプレート |
| utils/（新規）             | services/chat-edit/ | 共通ユーティリティ     |

---

## 6. 統合テスト連携【必須】

リファクタリング後も統合が維持されていることを確認:

| 統合ポイント        | リファクタリング後の確認 | 結果 |
| ------------------- | ------------------------ | ---- |
| Renderer → Main IPC | 統合テストパス           | -    |
| Main → FileSystem   | ファイルI/Oテストパス    | -    |
| Main → LLMAdapter   | LLM連携テストパス        | -    |
| 認証/検証           | セキュリティテストパス   | -    |

---

## 7. 完了条件

- [ ] コード品質レビューが完了している
- [ ] 特定された改善項目が適用されている
- [ ] 全テストがパスしている
- [ ] カバレッジが維持されている（Phase 7の水準以上）
- [ ] 不要なany型が除去されている
- [ ] JSDoc/TSDocが追加されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 8. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. コード品質レビュー（Task 1）
3. FileServiceリファクタリング（Task 2）
4. ChatEditServiceリファクタリング（Task 3）
5. 共通ユーティリティ抽出（Task 4）
6. テスト維持確認（Task 5）
7. 統合テスト連携の確認
8. 完了条件の検証

---

## 9. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/workspace-chat-edit-main-process --phase 8
```

---

## 10. 次のPhase

Phase 9: 品質保証
