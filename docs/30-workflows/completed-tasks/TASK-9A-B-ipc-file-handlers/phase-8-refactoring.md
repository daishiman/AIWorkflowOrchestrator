# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| タスクID   | TASK-9A-B                         |
| 前提Phase  | Phase 7（カバレッジ確認）         |
| 後続Phase  | Phase 9（品質保証）               |
| ステータス | 完了                              |
| 作成日     | 2026-02-19                        |
| 機能名     | TASK-9A-B-ipc-file-handlers       |

---

## 目的

TDD の Refactor フェーズとして、テストを維持しながら6つのファイル編集IPCハンドラーのコード品質を向上させる。
共通パターンの抽出、重複コードの除去、命名の統一を実施する。

## 背景

Phase 5〜7 で実装した6つのIPCハンドラー（readFile, writeFile, createFile, deleteFile, listBackups, restoreBackup）は、同一のバリデーション→処理→エラーハンドリングパターンを繰り返している。
共通パターンを抽出することで、今後のハンドラー追加時の保守性を向上させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード品質分析

**目的**: 6つのファイル編集IPCハンドラーのコード品質を分析し、改善ポイントを特定する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を読み込む
2. 新規追加した6ハンドラー（skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup）のコードを分析する
3. 以下の観点で改善ポイントを特定する

**分析観点**:

| 観点                         | 確認内容                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| バリデーションパターンの重複 | 6ハンドラー全てで `validateIpcSender` + `validatePath` が繰り返されていないか                  |
| try/catchパターンの重複      | 6ハンドラー全てで同一の `sanitizeErrorMessage` パターンが繰り返されていないか                  |
| レスポンス形式の一貫性       | `{ success: true, data }` / `{ success: false, error }` の形式が全ハンドラーで統一されているか |
| Preload APIの重複            | `skill-api.ts` の6メソッドで `safeInvoke` 呼び出しパターンが繰り返されていないか               |
| チャンネル定数のグルーピング | `channels.ts` でファイル操作チャンネルが論理的にグループ化されているか                         |
| 型定義の整理                 | `preload/types.ts` の型定義が過不足なく定義されているか                                        |

**期待される成果物**:

- `outputs/phase-8/code-quality-analysis.md`

---

### タスク2: ハンドラー共通パターンの抽出

**目的**: 6ハンドラーに共通するバリデーション＋エラーハンドリングパターンを共通関数に抽出する

**実行手順**:

1. 6ハンドラーの共通パターン（validateIpcSender → validatePath → try/catch → sanitizeErrorMessage）を特定する
2. 共通ヘルパー関数の抽出可否を判断する
3. 抽出する場合は実装し、全テストがパスすることを確認する
4. 抽出しない場合はその理由を記録する

**抽出候補パターン**:

```typescript
// Before: 各ハンドラーで繰り返されるパターン
ipcMain.handle(IPC_CHANNELS.SKILL_READ_FILE, async (event, args) => {
  const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_READ_FILE, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) {
    throw toIPCValidationError(validation);
  }
  // パスバリデーション
  // try/catch + sanitizeErrorMessage
});

// After: 共通パターン抽出（検討）
// ※ 抽出が過剰な抽象化にならないかも評価すること
```

**判断基準**:

| 判断       | 条件                                                           |
| ---------- | -------------------------------------------------------------- |
| 抽出する   | 3行以上の完全に同一のコードブロックが4箇所以上ある場合         |
| 抽出しない | 各ハンドラーの処理が微妙に異なり、抽出すると可読性が下がる場合 |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/common-pattern-extraction.md`

---

### タスク3: Preload API の重複除去

**目的**: `skill-api.ts` の6メソッドの共通パターンを整理する

**実行手順**:

1. `apps/desktop/src/preload/skill-api.ts` の新規6メソッドを確認する
2. `safeInvoke(IPC_CHANNELS.SKILL_XXX, args)` の呼び出しパターンが統一されているか確認する
3. 型定義との整合性を確認する
4. 全テストがパスすることを確認する

**確認観点**:

| 観点               | 確認内容                                          |
| ------------------ | ------------------------------------------------- |
| 引数の型一貫性     | 全メソッドで引数型が明示されているか              |
| 戻り値の型一貫性   | 全メソッドで `IpcResult<T>` 形式か                |
| エラーハンドリング | Preload側で追加のエラーハンドリングが不要であるか |

**期待される成果物**:

- `outputs/phase-8/preload-api-cleanup.md`

---

### タスク4: チャンネル定数のグルーピング改善

**目的**: `channels.ts` と `packages/shared/src/ipc/channels.ts` でファイル操作チャンネルが論理的にグループ化されていることを確認・改善する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` で `SKILL_FILE_CHANNELS` セクションが整理されているか確認する
2. `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に6チャンネルが追加されているか確認する
3. コメントやセクション分けが他のチャンネルグループ（`SKILL_CHANNELS`等）と一貫しているか確認する
4. 不整合があれば修正する

**期待される成果物**:

- `outputs/phase-8/channel-grouping-review.md`

---

### タスク5: 命名規則・型定義の統一確認

**目的**: 全ファイルで命名規則と型定義が統一されていることを確認する

**実行手順**:

1. IPCハンドラーの引数名・変数名が命名規則に準拠しているか確認する
2. `preload/types.ts` の型名が既存の命名パターンと一致しているか確認する
3. boolean変数に `is`/`has`/`can`/`should` プレフィックスが使われているか確認する
4. テストが全てパスすることを確認する

**命名規則チェックリスト**:

| チェック項目     | 基準                                      |
| ---------------- | ----------------------------------------- |
| 型名             | PascalCase（例: `SkillReadFileArgs`）     |
| 関数名           | camelCase（例: `readFile`）               |
| 定数名           | UPPER_SNAKE_CASE（例: `SKILL_READ_FILE`） |
| boolean変数      | `is`/`has`/`can`/`should` プレフィックス  |
| エラーメッセージ | 日本語で統一（ユーザー向けメッセージ）    |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/naming-type-review.md`

---

## 参照資料

| 参照資料                  | パス                                                         | 内容                   |
| ------------------------- | ------------------------------------------------------------ | ---------------------- |
| IPCハンドラー実装         | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | Main Processハンドラー |
| Preload API               | `apps/desktop/src/preload/skill-api.ts`                      | Preload API実装        |
| チャンネル定数（Preload） | `apps/desktop/src/preload/channels.ts`                       | チャンネル定義         |
| チャンネル定数（共有）    | `packages/shared/src/ipc/channels.ts`                        | 共有チャンネル定義     |
| 型定義                    | `apps/desktop/src/preload/types.ts`                          | Preload型定義          |
| テストファイル            | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts` | テストコード           |
| 既存ハンドラーパターン    | `apps/desktop/src/main/ipc/skillHandlers.ts`（skill:list等） | 参考パターン           |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                         | 内容             |
| ---------------- | ---------------------------------------------------------------------------- | ---------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC セキュリティ |
| コード品質基準   | `.claude/rules/02-code-quality.md`                                           | 品質ルール       |

---

## 成果物

| 成果物                 | パス                                           | 内容                     |
| ---------------------- | ---------------------------------------------- | ------------------------ |
| コード品質分析         | `outputs/phase-8/code-quality-analysis.md`     | 分析結果                 |
| 共通パターン抽出       | `outputs/phase-8/common-pattern-extraction.md` | ヘルパー関数抽出結果     |
| Preload API整理        | `outputs/phase-8/preload-api-cleanup.md`       | Preload API改善内容      |
| チャンネルグルーピング | `outputs/phase-8/channel-grouping-review.md`   | チャンネル定数整理結果   |
| 命名・型定義確認       | `outputs/phase-8/naming-type-review.md`        | 命名規則・型統一確認結果 |

---

## 統合テスト連携

> リファクタ後の統合テスト継続成功を確認する

| 確認項目            | 基準                             |
| ------------------- | -------------------------------- |
| 全ユニットテスト    | 100% パス                        |
| 6ハンドラーのテスト | 全テストケースPASS               |
| セキュリティテスト  | パストラバーサル・sender検証PASS |
| カバレッジ維持      | リファクタ前と同等以上           |

---

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング中は継続的にテスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --watch
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] コード品質分析が完了している
- [ ] ハンドラー共通パターンの抽出判断と実施（または見送り理由記録）が完了している
- [ ] Preload APIの重複確認・整理が完了している
- [ ] チャンネル定数のグルーピングが論理的に整理されている
- [ ] 命名規則・型定義が全ファイルで統一されている
- [ ] 全てのテストがパスしている
- [ ] カバレッジがリファクタ前と同等以上である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] テストが継続してGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9A-B-ipc-file-handlers/phase-9-quality-assurance.md`
