# Phase 2: 設計

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | execute-skill-file-writer-integration |
| 作成日 | 2026-03-29                            |

## 目的

LLM 応答パーサー、`SkillGeneratedContent` 型変換、`persist()` 呼び出しフロー、エラーハンドリングを設計する。

## 設計概要

### アーキテクチャ層

| 層           | 関連コンポーネント          | 変更内容                                      |
| ------------ | --------------------------- | --------------------------------------------- |
| Main Process | `RuntimeSkillCreatorFacade` | `execute()` に persist 連携を追加             |
| Main Process | LLM応答パーサー（新規）     | コードブロック抽出ユーティリティ              |
| Shared Types | `skillCreator.ts`           | `ExecuteResult` に persist 結果フィールド追加 |

### 状態所有権

| 状態                 | 所有者                          | 説明                                                |
| -------------------- | ------------------------------- | --------------------------------------------------- |
| LLM応答テキスト      | `SkillExecutor` → `execute()`   | SDKイベントとして返却                               |
| パース結果           | `execute()` ローカル            | パーサー呼び出し後の一時変数                        |
| ファイル書き出し結果 | `SkillFileWriter` → `execute()` | `{ skillPath: string; files: string[] }` として返却 |
| 最終結果             | `execute()` → IPC → Renderer    | `RuntimeSkillCreatorExecuteResult`                  |

## 実行タスク

### Task 2-1: LLM 応答パーサーの設計

#### パーサー関数シグネチャ

```typescript
function parseLlmResponseToContent(
  sdkEvents: SkillCreatorSdkEvent[],
): SkillGeneratedContent | null;
```

#### アルゴリズム

1. `sdkEvents` から `eventType === 'assistant'` または `eventType === 'result'` のイベントを収集
2. 各イベントの `text` フィールドを結合して全文テキストを構築
3. 正規表現でコードブロックを抽出: ` ```(?:(\w+)\n)?([\s\S]*?)``` `
4. 最初のコードブロックを `skillMd` として扱う
5. 残りのブロックをファイル名注釈（`// filename: agents/xxx.md` 等）で分類:
   - `agents/` プレフィックス → `agents[]`
   - `scripts/` プレフィックス → `scripts[]`
   - `references/` プレフィックス → `references[]`
6. コードブロックが0件の場合は `null` を返す（パース失敗ではなく、LLMが生成しなかった正常ケース）

#### メタデータ注釈の解析

LLM がコードブロック前にファイルパスを示す場合のパターン:

````
### SKILL.md
```markdown
...content...
````

### agents/decompose-task.md

```markdown
...content...
```

````

パーサーはコードブロック直前の見出し行（`### filepath`）からファイル名を抽出する。

#### 配置先

`apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts`（新規ファイル）

理由: `RuntimeSkillCreatorFacade.ts` の肥大化を防ぎ、単体テストを容易にするため独立ユーティリティとして切り出す。

### Task 2-2: SkillGeneratedContent 型フィールド構造の設計

**変更不要**: Phase 1 の調査で `SkillGeneratedContent` 型は既に十分な構造を持つことを確認済み。

```typescript
// 既存（変更不要）
interface SkillGeneratedContent {
  skillMd: string;
  agents: Array<{ name: string; content: string }>;
  scripts: Array<{ name: string; content: string }>;
  references: Array<{ name: string; content: string }>;
}
````

### Task 2-3: execute() 内フロー設計

#### 変更後のフロー（差分のみ）

現行の `execute()` フロー Step 3（SDKイベント正規化）と Step 5（結果返却）の間に以下を挿入:

```
Step 3.5: LLM応答からコンテンツ抽出
  ├─ parseLlmResponseToContent(normalizedEvents) → content | null
  │
  ├─ content === null → persistResult: null, persistError: null（正常終了）
  │
  └─ content !== null → Step 3.6 へ

Step 3.6: ファイル書き出し
  ├─ skillFileWriter が DI されていない → persistResult: null（graceful degradation）
  │
  └─ skillFileWriter.persist(skillName, content, { overwrite: true })
      ├─ 成功 → persistResult: { skillPath: string; files: string[] }
      └─ 失敗 → persistError: error.message
```

#### 擬似コード

```typescript
// execute() 内、normalizeSkillCreatorSdkEvents() の後に追加
let persistResult: { skillPath: string; files: string[] } | null = null;
let persistError: string | null = null;

if (response.success) {
  const content = parseLlmResponseToContent(normalizedEvents);

  if (content && this.deps.skillFileWriter) {
    try {
      persistResult = await this.deps.skillFileWriter.persist(
        request.skillName,
        content,
        { overwrite: true },
      );
    } catch (err) {
      persistError = err instanceof Error ? err.message : String(err);
    }
  }
}

// ExecuteResult に追加
return {
  ...existingResult,
  persistResult,
  persistError,
};
```

**設計判断**:

- `overwrite: true` をデフォルトにする: execute は繰り返し呼ばれる可能性があり、既存スキルの上書きが自然
- `response.success` の場合のみ persist を試行: 実行失敗時はコンテンツが不完全な可能性が高い
- persist 失敗は execute 全体を fail にしない: SDK実行自体は成功しているため

### Task 2-4: エラーハンドリングフロー設計

```
execute() 呼び出し
│
├─ SkillExecutor.execute() 失敗
│  └─ 既存のエラーハンドリング（変更なし）
│     persistResult: null, persistError: null
│
├─ SkillExecutor.execute() 成功
│  ├─ parseLlmResponseToContent() → null
│  │  └─ コンテンツなし（正常）
│  │     persistResult: null, persistError: null
│  │
│  ├─ parseLlmResponseToContent() → content
│  │  ├─ skillFileWriter 未DI
│  │  │  └─ persist スキップ（graceful degradation）
│  │  │     persistResult: null, persistError: null
│  │  │
│  │  ├─ persist() 成功
│  │  │  └─ persistResult: { skillPath, files[] }
│  │  │
│  │  └─ persist() 失敗
│  │     └─ persistError: エラーメッセージ
│  │        success は true のまま（SDK実行は成功）
│  │
│  └─ parseLlmResponseToContent() throws
│     └─ persistError: エラーメッセージ
│        success は true のまま
```

### Task 2-5: ExecuteResult 拡張フィールド設計

```typescript
// skillCreator.ts に追加
interface RuntimeSkillCreatorExecuteResult {
  // ... 既存フィールド ...

  /** SkillFileWriter.persist() の結果。persist未実行またはスキップ時はnull */
  persistResult?: { skillPath: string; files: string[] } | null;

  /** persist失敗時のエラーメッセージ。成功またはスキップ時はnull */
  persistError?: string | null;
}
```

**IPC影響**: `RuntimeSkillCreatorExecuteResponse` は `RuntimeSkillCreatorExecuteResult` のユニオンなので、フィールド追加は後方互換。Renderer側は新フィールドを無視しても動作する。

## 参照資料

| 資料名          | パス                                                                  | 説明                 |
| --------------- | --------------------------------------------------------------------- | -------------------- |
| Phase 1 要件    | `phase-1-requirements.md`                                             | 要件定義             |
| Facade          | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | execute() の現行実装 |
| SkillFileWriter | `apps/desktop/src/main/services/skill/SkillFileWriter.ts`             | persist() の仕様     |
| 型定義          | `packages/shared/src/types/skillCreator.ts`                           | 現行型定義           |

## 統合テスト連携

| テスト種別                 | 対象                        | 方針                                                                        |
| -------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| ユニットテスト（パーサー） | `parseLlmResponseToContent` | 各種LLM応答フォーマットで正しく抽出できることを検証                         |
| ユニットテスト（Facade）   | `execute()` persist 連携    | `SkillFileWriter` をモックし、正しい引数で `persist()` が呼ばれることを検証 |
| ユニットテスト（型）       | `ExecuteResult` 拡張        | `persistResult`, `persistError` が正しく設定されることを検証                |

## 多角的チェック観点

| 観点               | 判断    | 内容                                                                                                   |
| ------------------ | ------- | ------------------------------------------------------------------------------------------------------ |
| セキュリティ       | ✅ 適用 | LLM応答由来のファイル名は `SkillFileWriter` のパス横断防止に委ねる。パーサー側での追加サニタイズは不要 |
| エラーハンドリング | ✅ 適用 | persist 失敗は execute 全体を fail にしない設計（SDK実行成功の保全）                                   |
| アーキテクチャ     | ✅ 適用 | パーサーを独立ユーティリティに分離し、Facade の責務肥大化を防止                                        |

## 成果物

| 成果物 | パス                              | 説明     |
| ------ | --------------------------------- | -------- |
| 設計書 | `phase-2-design.md`（本ファイル） | 詳細設計 |

## 完了条件

- [x] パーサー設計が完了している（`parseLlmResponseToContent` のシグネチャ・アルゴリズム・配置先）
- [x] 型変換フローが設計されている（`SkillGeneratedContent` は変更不要と判断）
- [x] execute() 内フローが設計されている（Step 3.5-3.6 挿入、擬似コード付き）
- [x] エラーハンドリングフローが設計されている（7ケースの分岐図）
- [x] ExecuteResult 拡張フィールドが設計されている（`persistResult`, `persistError`）
- [x] IPC後方互換性の影響確認が完了している
- [x] **本Phase内の全タスクを100%実行完了**
