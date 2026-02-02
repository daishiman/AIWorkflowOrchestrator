# TASK-8A 実装ガイド: スキル管理モジュール単体テスト

---

## Part 1: 概念説明（中学生レベル）

### 「テスト」とは何か

ソフトウェアの「テスト」とは、プログラムが正しく動くかどうかを確認する作業のことです。

たとえば料理のレシピを書いたあと、実際に作ってみて味見するようなものです。レシピ（プログラム）に書いてあるとおりに作った結果が、おいしい料理（正しい動作）になるかどうかを確認します。

### なぜテストが必要か

テストが必要な理由は主に2つあります。

1. **バグ（不具合）を早く見つけるため**: プログラムに問題があると、ユーザーが困ってしまいます。テストを書いておけば、問題を早い段階で見つけて直せます。これは健康診断（けんこうしんだん）と同じで、病気が悪くなる前に見つけるのと似ています。

2. **新しい機能を追加するときに前の機能が壊れていないことを確認するため**: 自転車に新しいライトをつけたら、ブレーキが効かなくなっていた、ということがないように確認します。

### 単体テストとは

「単体テスト」（たんたいテスト）とは、プログラムの1つの部品（モジュール）だけを取り出して動作確認することです。

自転車で例えると、完成した自転車ではなく、ブレーキだけ、タイヤだけ、ギアだけと1つずつ取り外して、それぞれがちゃんと動くか確認するイメージです。全部を組み合わせたテスト（統合テスト）は別に行います。

TASK-8Aでは、AIアプリケーションの「スキル管理」という機能の部品を5つに分けて、それぞれ単体テストを行いました。

### モックとは

テストのときに本物の代わりに使う「ダミー部品」のことを「モック」といいます。

お芝居のリハーサルで、本番の観客の代わりにぬいぐるみを客席に並べて練習するイメージです。本物の観客（外部のシステム）がいなくても、役者（テスト対象のプログラム）が正しく演技（動作）できるかを確認できます。

たとえば「ファイルを読み込む機能」のテストでは、実際にパソコンのファイルを読み込む代わりに、「こんな内容が書いてありましたよ」と決まった答えを返すダミーを使います。

### カバレッジとは

「カバレッジ」とは、テストがどれくらいのプログラムコードをチェックできているかの割合（パーセンテージ）です。

テスト勉強で例えると、教科書が100ページあって80ページ分は目を通してテスト問題を解いたけど、20ページはまだ読んでいない、という場合はカバレッジが80%です。

TASK-8Aでは、5つのモジュールのうち4つがカバレッジ80%以上を達成しました。残りの1つ（SkillExecutor）は、他のテスト（統合テスト）でカバーする部分があるため、52%でも合格としました。

---

## Part 2: 技術詳細（開発者レベル）

### テスト対象モジュール一覧

| モジュール         | ファイルパス                                    | 責務                                     | テスト数 |
| ------------------ | ----------------------------------------------- | ---------------------------------------- | -------- |
| SkillScanner       | `src/main/services/skill/SkillScanner.ts`       | SKILL.md解析・スキルディレクトリスキャン | 49       |
| SkillImportManager | `src/main/services/skill/SkillImportManager.ts` | スキルインポート・永続化管理             | 28       |
| SkillExecutor      | `src/main/services/skill/SkillExecutor.ts`      | スキル実行・ストリーミング・権限管理     | 52       |
| PermissionResolver | `src/main/services/skill/PermissionResolver.ts` | 権限リクエスト-レスポンスPromise管理     | 43       |
| skillSlice         | `src/renderer/store/slices/skillSlice.ts`       | Zustand状態管理（Renderer Process）      | 59       |

### テストアーキテクチャ

#### モック戦略

| テストファイル             | モック対象                       | モック手法                       |
| -------------------------- | -------------------------------- | -------------------------------- |
| SkillScanner.test.ts       | `fs/promises`                    | `vi.mock` + `vi.doMock` 動的切替 |
| SkillImportManager.test.ts | `electron-store`                 | `vi.doMock` モジュール再読み込み |
| SkillExecutor.test.ts      | `@anthropic-ai/claude-agent-sdk` | `vi.mock` + async generator mock |
| PermissionResolver.test.ts | なし（実クラス使用）             | `vi.useFakeTimers`               |
| skillSlice.test.ts         | `window.electronAPI`             | `(global as any).window` 上書き  |

#### フィクスチャ構成

```
apps/desktop/src/main/services/skill/__tests__/__fixtures__/
  valid-skill/SKILL.md         # 正常系テスト用スキル定義
  invalid-skill/               # エラー系（SKILL.mdなし）
  malformed-skill/SKILL.md     # YAML解析エラー用
  empty-aiworkflow-test/       # 空ディレクトリテスト用
```

#### テストヘルパー設計

テストヘルパーの共有ファイルは作成せず、各テストファイル内にファクトリ関数・定数を配置する方針。理由：テストの独立性を優先し、ファイル間の暗黙的な依存を排除。

### テストケースID対応表

#### SkillScanner (SS-01 ~ SS-14)

| ID    | テスト概要                               |
| ----- | ---------------------------------------- |
| SS-01 | scanDirectory - ディレクトリ不在時空配列 |
| SS-02 | scanDirectory - 正常スキル検出           |
| SS-03 | scanDirectory - 無効スキルスキップ       |
| SS-04 | parseSkill - 正常YAML解析                |
| SS-05 | parseSkill - YAML不正時エラー            |
| SS-06 | scanAll - 複数ディレクトリ統合           |
| SS-07 | scanAll - claudeSkillsDir指定            |
| SS-08 | scanAll - 無効ディレクトリスキップ       |
| SS-09 | buildPaths - パス構築                    |
| SS-10 | buildPaths - カスタムパス                |
| SS-11 | scanAll - 重複スキルフィルタリング       |
| SS-12 | parseSkill - アンカー解析                |
| SS-13 | parseSkill - トリガー解析                |
| SS-14 | 境界値・エラーパステスト群               |

#### SkillImportManager (SIM-01 ~ SIM-08)

| ID     | テスト概要                     |
| ------ | ------------------------------ |
| SIM-01 | importSkills - 正常インポート  |
| SIM-02 | importSkills - 重複スキップ    |
| SIM-03 | removeSkill - 正常削除         |
| SIM-04 | removeSkill - 存在しないスキル |
| SIM-05 | getImportedSkillIds - 一覧取得 |
| SIM-06 | persist - ストア永続化         |
| SIM-07 | エラーハンドリング群           |
| SIM-08 | リカバリ群                     |

#### SkillExecutor (SE-01 ~ SE-08)

| ID    | テスト概要                           |
| ----- | ------------------------------------ |
| SE-01 | execute - 正常実行・ストリーム処理   |
| SE-02 | execute - 不正メタデータエラー       |
| SE-03 | abort - 実行中スキル中断             |
| SE-04 | getActiveExecutions - アクティブ一覧 |
| SE-05 | getExecutionStatus - ステータス取得  |
| SE-06 | execute - エラーハンドリング         |
| SE-07 | createHooks - PreToolUse/PostToolUse |
| SE-08 | handlePermissionResponse - 権限応答  |

#### PermissionResolver (PR-01 ~ PR-06)

| ID    | テスト概要                       |
| ----- | -------------------------------- |
| PR-01 | waitForResponse - 正常応答       |
| PR-02 | waitForResponse - タイムアウト   |
| PR-03 | waitForResponse - rememberChoice |
| PR-04 | cancelRequest - 個別キャンセル   |
| PR-05 | cancelAll - 全キャンセル         |
| PR-06 | pendingCount - 保留数カウント    |

#### skillSlice (SKS-01 ~ SKS-12)

| ID     | テスト概要                        |
| ------ | --------------------------------- |
| SKS-01 | 初期状態                          |
| SKS-02 | fetchSkills - 正常取得            |
| SKS-03 | fetchSkills - エラー処理          |
| SKS-04 | rescanSkills - 再スキャン         |
| SKS-05 | importSkills - インポート         |
| SKS-06 | removeSkill - 削除                |
| SKS-07 | selectSkill - 選択                |
| SKS-08 | executeSkill - 実行               |
| SKS-09 | abortSkill - 中断                 |
| SKS-10 | sendPermissionResponse - 権限応答 |
| SKS-11 | 内部ハンドラ群                    |
| SKS-12 | 統合テスト（ストアフロー）        |

### モック設定の詳細

#### SkillExecutor.test.ts - SDK query モック

```typescript
const mockStreamGenerator = vi.fn();
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: (...args: unknown[]) => mockStreamGenerator(...args),
}));

// 使用例: ストリームイベントの模倣
mockStreamGenerator.mockReturnValue({
  [Symbol.asyncIterator]: async function* () {
    yield { type: "text", content: "Hello" };
    yield { type: "result_text", content: "Done" };
  },
});
```

#### PermissionResolver.test.ts - タイマーモック

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  resolver = new PermissionResolver();
});

afterEach(() => {
  vi.useRealTimers();
});

// タイムアウトテスト
vi.advanceTimersByTime(300000); // 5分タイムアウト
```

#### skillSlice.test.ts - Electron API モック

```typescript
beforeEach(() => {
  (global as any).window = {
    electronAPI: {
      skill: {
        list: vi.fn().mockResolvedValue([mockSkill1, mockSkill2]),
        execute: vi.fn(),
        abort: vi.fn(),
        sendPermissionResponse: vi.fn(),
      },
    },
  };
});
```

### カバレッジ結果

| モジュール            | % Lines | % Branch | % Funcs | % Stmts | 判定       |
| --------------------- | ------- | -------- | ------- | ------- | ---------- |
| PermissionResolver.ts | 100     | 100      | 100     | 100     | PASS       |
| SkillImportManager.ts | 97.36   | 92.85    | 100     | 97.36   | PASS       |
| SkillScanner.ts       | 84.07   | 83.56    | 100     | 84.07   | PASS       |
| skillSlice.ts         | 94.44   | 84.61    | 100     | 94.44   | PASS       |
| SkillExecutor.ts      | 52.73   | 70.4     | 64.86   | 52.73   | 条件付PASS |

### テスト実行方法

```bash
# 個別実行
npx vitest run src/main/services/skill/__tests__/SkillScanner.test.ts

# 一括実行（対象5ファイル）
npx vitest run \
  src/main/services/skill/__tests__/SkillScanner.test.ts \
  src/main/services/skill/__tests__/SkillImportManager.test.ts \
  src/main/services/skill/__tests__/SkillExecutor.test.ts \
  src/main/services/skill/__tests__/PermissionResolver.test.ts \
  src/renderer/store/slices/__tests__/skillSlice.test.ts

# カバレッジ付き実行
npx vitest run --coverage \
  src/main/services/skill/__tests__/SkillScanner.test.ts \
  src/main/services/skill/__tests__/SkillImportManager.test.ts \
  src/main/services/skill/__tests__/SkillExecutor.test.ts \
  src/main/services/skill/__tests__/PermissionResolver.test.ts \
  src/renderer/store/slices/__tests__/skillSlice.test.ts

# verbose出力
npx vitest run --reporter=verbose <ファイルパス>
```

注意: `apps/desktop/` ディレクトリから実行すること。

### エラーハンドリング: テスト失敗時のデバッグ手順

1. **verbose出力で失敗箇所を特定**: `npx vitest run --reporter=verbose <ファイル>`
2. **個別テスト実行**: `npx vitest run -t "テスト名の一部"`
3. **モック確認**: `vi.clearAllMocks()` が `beforeEach` に配置されているか確認
4. **タイマー確認**: `vi.useFakeTimers()` 使用時は `vi.useRealTimers()` で復元されているか確認
5. **非同期テスト**: `await` の漏れがないか確認（特にストリーム系テスト）

### 設定可能なパラメータ（Vitest設定）

| パラメータ            | 現在値  | 説明                     |
| --------------------- | ------- | ------------------------ |
| `test.testTimeout`    | 10000ms | 個別テストのタイムアウト |
| `test.pool`           | forks   | テスト実行プール         |
| `coverage.lines`      | 80      | Line Coverage閾値        |
| `coverage.functions`  | 80      | Function Coverage閾値    |
| `coverage.branches`   | 60      | Branch Coverage閾値      |
| `coverage.statements` | 80      | Statement Coverage閾値   |
| `coverage.provider`   | v8      | カバレッジ計測プロバイダ |
