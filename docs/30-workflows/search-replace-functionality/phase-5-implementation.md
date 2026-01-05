# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容           |
| ---------- | -------------- |
| Phase      | 5              |
| Phase名    | 実装           |
| 前提Phase  | Phase 4        |
| 後続Phase  | Phase 6        |
| ステータス | 未実施         |
| 作成日     | 2026-01-04     |
| 機能名     | 検索・置換機能 |

---

## 目的

TDDのGreen段階として、Phase 4で作成したテストをパスする最小限の実装を行う。

**重要**: Phase 5完了時点でテストカバレッジ80%以上を達成すること。

## 背景

テスト駆動開発（TDD）のRed-Green-Refactorサイクルに従い、失敗するテストをパスさせる実装を行う。

---

## サブタスク

| ID     | サブタスク名           | 責務                         | 依存   |
| ------ | ---------------------- | ---------------------------- | ------ |
| T-05-1 | ファイル内検索実装     | ファイル内検索機能の実装     | T-04   |
| T-05-2 | ファイル内置換実装     | ファイル内置換機能の実装     | T-05-1 |
| T-05-3 | ワークスペース検索実装 | ワークスペース検索機能の実装 | T-05-2 |
| T-05-4 | ワークスペース置換実装 | ワークスペース置換機能の実装 | T-05-3 |

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: tdd-red-green-refactor

**パス**: `.claude/skills/tdd-red-green-refactor/SKILL.md`

**Trigger条件**:
テスト駆動開発とRed-Green-Refactorサイクルが必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- テストをパスする実装コード

---

### スキル2: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**Trigger条件**:
命名改善、関数分割、重複排除が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- クリーンなコード実装

---

### スキル3: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**:
TypeScript高度な型、ブランド型、型ガード関数が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 型安全な実装

---

### スキル4: error-handling-patterns

**パス**: `.claude/skills/error-handling-patterns/SKILL.md`

**Trigger条件**:
エラーハンドリング設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- 堅牢なエラーハンドリング実装

---

## 参照資料

| 参照資料      | パス               | 内容         |
| ------------- | ------------------ | ------------ |
| Phase 2成果物 | `outputs/phase-2/` | 設計書       |
| Phase 4成果物 | `outputs/phase-4/` | テストコード |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                    | 内容             |
| ---------------- | ----------------------------------------------------------------------- | ---------------- |
| コーディング規約 | `.claude/skills/aiworkflow-requirements/references/coding-standards.md` | コーディング規約 |

---

## 成果物

| 成果物                   | パス                                                                    | 内容                 |
| ------------------------ | ----------------------------------------------------------------------- | -------------------- |
| 検索サービス             | `packages/shared/src/search/search-service.ts`                          | 検索ロジック         |
| 置換サービス             | `packages/shared/src/search/replace-service.ts`                         | 置換ロジック         |
| 検索パネル               | `apps/desktop/src/components/search/SearchPanel.tsx`                    | 検索UIコンポーネント |
| ワークスペース検索パネル | `apps/desktop/src/components/workspace-search/WorkspaceSearchPanel.tsx` | ワークスペース検索UI |
| カスタムフック           | `apps/desktop/src/hooks/useSearch.ts`                                   | 検索状態管理フック   |

---

## 実装要件

### T-05-1: ファイル内検索実装

```typescript
// packages/shared/src/search/search-service.ts

export interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
}

export interface SearchMatch {
  line: number;
  column: number;
  length: number;
  text: string;
  context: {
    before: string;
    after: string;
  };
}

export class SearchService {
  /**
   * ファイル内容から検索パターンにマッチする箇所を検索
   */
  searchInFile(
    content: string,
    pattern: string,
    options: SearchOptions,
  ): SearchMatch[] {
    // 実装
  }
}
```

**実装ポイント**:

- 正規表現のReDoS対策（タイムアウト設定）
- Unicode対応
- 大きなファイルでのパフォーマンス最適化

### T-05-2: ファイル内置換実装

```typescript
// packages/shared/src/search/replace-service.ts

export class ReplaceService {
  /**
   * ファイル内容の検索パターンを置換
   */
  replaceInFile(
    content: string,
    pattern: string,
    replacement: string,
    options: SearchOptions,
  ): { content: string; count: number } {
    // 実装
  }
}
```

**実装ポイント**:

- 正規表現キャプチャグループ対応（$1, $2等）
- 置換プレビュー機能
- アンドゥ用のdiff生成

### T-05-3: ワークスペース検索実装

```typescript
// packages/shared/src/search/workspace-search-service.ts

export interface WorkspaceSearchOptions extends SearchOptions {
  include?: string[];
  exclude?: string[];
}

export interface FileSearchResult {
  filePath: string;
  matches: SearchMatch[];
}

export class WorkspaceSearchService {
  /**
   * ワークスペース全体から検索
   */
  async *searchInWorkspace(
    rootPath: string,
    pattern: string,
    options: WorkspaceSearchOptions,
  ): AsyncGenerator<FileSearchResult> {
    // 実装
  }
}
```

**実装ポイント**:

- 非同期ストリーミング（AsyncGenerator）
- .gitignore連携
- デフォルト除外パターン（node_modules, .git, dist等）
- ファイルタイプフィルタ

### T-05-4: ワークスペース置換実装

```typescript
export class WorkspaceReplaceService {
  /**
   * ワークスペース全体で置換
   */
  async *replaceInWorkspace(
    rootPath: string,
    pattern: string,
    replacement: string,
    options: WorkspaceSearchOptions & { preview?: boolean },
  ): AsyncGenerator<{ file: string; changes: number }> {
    // 実装
  }
}
```

**実装ポイント**:

- プレビューモード
- 確認ダイアログ連携
- アトミック操作（失敗時のロールバック）

---

## カバレッジ要件

> **重要**: Phase 5完了時点でテストカバレッジ80%以上を達成すること

```bash
# カバレッジ確認コマンド
pnpm --filter @repo/shared test:coverage
pnpm --filter @repo/desktop test:coverage

# カバレッジレポート生成
pnpm test:coverage -- --reporter=html
```

| 対象             | 目標    | 確認 |
| ---------------- | ------- | ---- |
| 検索エンジン     | 90%以上 | [ ]  |
| 置換エンジン     | 90%以上 | [ ]  |
| UIコンポーネント | 80%以上 | [ ]  |
| カスタムフック   | 85%以上 | [ ]  |
| **全体**         | **80%** | [ ]  |

---

## TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）
- [ ] テストカバレッジ80%以上を達成

---

## 完了条件

- [ ] ファイル内検索機能が実装されている
- [ ] ファイル内置換機能が実装されている
- [ ] ワークスペース検索機能が実装されている
- [ ] ワークスペース置換機能が実装されている
- [ ] 検索パネルUIが実装されている
- [ ] ワークスペース検索パネルUIが実装されている
- [ ] キーボードショートカットが動作する
- [ ] 全てのテストがパスしている（Green状態）
- [ ] **テストカバレッジ80%以上を達成している**
- [ ] Lintエラーがない
- [ ] 型エラーがない

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（リファクタリング）へ進む

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- tdd-red-green-refactor: {{result}}
- clean-code-practices: {{result}}
- type-safety-patterns: {{result}}
- error-handling-patterns: {{result}}

### 実装結果

- 全テストPASS: {{OK/NG}}
- テストカバレッジ: {{N}}%
- Lintエラー: {{N}}件
- 型エラー: {{N}}件

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/search-replace-functionality/phase-6-refactoring.md`
