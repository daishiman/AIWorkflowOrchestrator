# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| タスクID   | TASK-9I                           |
| 前提Phase  | Phase 7（カバレッジ確認）         |
| 後続Phase  | Phase 9（品質保証）               |
| ステータス | pending                           |
| 作成日     | 2026-02-28                        |
| 機能名     | TASK-9I-skill-docs                |

---

## 目的

TDD の Refactor フェーズとして、テストを維持しながらスキルドキュメント生成機能全体（SkillDocGenerator / IPCハンドラー / Preload API）のコード品質を向上させる。
重複コードの抽出、SOLID原則の適用、命名の統一を実施し、保守性を改善する。

## 背景

Phase 5〜7 で実装した SkillDocGenerator（ドキュメント生成サービス）と4つのIPCハンドラー（generate / preview / export / templates）は、各レイヤーで類似のバリデーション・エラーハンドリングパターンを繰り返している。
特に generate と preview の共通ロジック（スキル構造解析・セクション生成）と、4つのIPCハンドラーの3段バリデーションパターンに重複が見込まれる。
統合的なリファクタリングにより、レイヤー横断での品質向上と今後のUI実装時の保守性を確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SkillDocGenerator の重複コード分析・抽出

**目的**: SkillDocGenerator 内の generate / preview の共通ロジックを分析し、重複がある場合は抽出する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` を読み込む
2. generate と preview で同一のスキル構造解析・セクション生成ロジックが繰り返されていないか確認する
3. analyzeSkillStructure / generateSection / convertToHtml / convertToPdf の各メソッドが30行を超えていないか確認する
4. SRP（単一責務原則）の観点で、ドキュメント生成とフォーマット変換の分離を検討する
5. DIP（依存性逆転原則）の観点で、LLM呼び出し（queryFn）がコンストラクタインジェクションで渡されているか確認する
6. OCP（開閉原則）の観点で、DocTemplate追加時に既存コードを変更せずに対応できる設計であるか確認する
7. 抽出・分離する場合は実装し、全テストがパスすることを確認する
8. 分離しない場合はその理由を記録する

**分析観点**:

| 観点                         | 確認内容                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| generate/preview共通ロジック | generateとpreviewでスキル構造解析やセクション生成のコードブロックが重複していないか                     |
| セクション生成パターン統一   | 7セクション（overview/installation/usage/api/configuration/examples/changelog）の生成が統一されているか |
| フォーマット変換の分離       | Markdown/HTML/PDF変換ロジックがドキュメント生成ロジックから分離されているか                             |
| エラーハンドリングパターン   | 各メソッドのcatchブロックで同一パターンが繰り返されていないか                                           |
| LLM呼び出しの抽象化          | queryFnがDIP準拠でインジェクションされ、テスタブルであるか                                              |

**判断基準**:

| 判断     | 条件                                                             |
| -------- | ---------------------------------------------------------------- |
| 抽出する | 3行以上の完全に同一のコードブロックが3箇所以上ある場合           |
| 分離する | フォーマット変換メソッドが3つ以上あり独立した責務を形成する場合  |
| 見送る   | 抽出・分離すると可読性が低下し、テストの保守コストが増加する場合 |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillDocGenerator.test.ts --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/skilldocgenerator-refactoring-analysis.md`

---

### タスク2: IPCハンドラーの共通バリデーション関数化

**目的**: 4つのドキュメント関連IPCハンドラーに共通する3段バリデーション（型チェック → 空文字列 → トリム空文字列）を共通関数に抽出する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` のdocs関連4ハンドラーを読み込む
2. 各ハンドラーの `validateIpcSender` → バリデーション → try/catch パターンを分析する
3. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が各ハンドラーで重複していないか確認する
4. 既存の他のskillHandlers（TASK-9Aで追加されたものを含む）との共通化可能性を確認する
5. 共通バリデーション関数の抽出可否を判断する
6. 抽出する場合は実装し、全テスト（docs関連ハンドラーテスト全件）がパスすることを確認する

**抽出候補**:

```typescript
// Before: 各ハンドラーで繰り返されるパターン
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}

// After: 共通バリデーション関数（検討）
function validateStringArg(value: unknown, argName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} must be a non-empty string`,
    };
  }
  return value.trim();
}
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/skillHandlers.docs.test.ts --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/ipc-docs-validation-commonization.md`

---

### タスク3: register/unregister対称性確認

**目的**: registerSkillDocsHandlers / unregisterSkillDocsHandlers の対称性を確認し、P5（リスナー二重登録防止）準拠であることを検証する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` のregister/unregister関数を読み込む
2. 4チャネル（skill:docs:generate / skill:docs:preview / skill:docs:export / skill:docs:templates）全てがregisterとunregisterで対になっているか確認する
3. ipcMain.handle()の二重登録防止が実装されているか確認する（P5対策）
4. unregisterSkillDocsHandlers実行後に再登録が正常に動作するか確認する
5. register/unregisterの非対称がある場合は修正する

**対称性チェックリスト**:

| チャネル               | register | unregister | 対称 |
| ---------------------- | -------- | ---------- | ---- |
| `skill:docs:generate`  | -        | -          | -    |
| `skill:docs:preview`   | -        | -          | -    |
| `skill:docs:export`    | -        | -          | -    |
| `skill:docs:templates` | -        | -          | -    |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/skillHandlers.docs.test.ts --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/register-unregister-symmetry.md`

---

### タスク4: 命名規則・型定義統一確認

**目的**: スキルドキュメント生成機能の全ファイルで命名規則と型定義が統一されていることを確認する

**実行手順**:

1. 全対象ファイルの命名パターンを確認する
2. P45対策として、IPCハンドラーの引数名が実際の値のセマンティクスと一致しているか確認する
3. boolean変数に `is`/`has`/`can`/`should` プレフィックスが使われているか確認する
4. `packages/shared/src/types/skill-docs.ts` の型名とプロパティ名がプロジェクト全体の命名規則に準拠しているか確認する
5. 全テストがパスすることを確認する

**命名規則チェックリスト**:

| チェック項目         | 基準                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| 型名                 | PascalCase（例: `DocGenerationRequest`, `GeneratedDoc`, `DocTemplate`, `DocSection`, `DocExportOptions`） |
| 関数名               | camelCase（例: `generateDocs`, `previewDocs`, `exportDocs`, `getDocTemplates`）                           |
| 定数名               | UPPER_SNAKE_CASE（例: `SKILL_DOCS_GENERATE`, `SKILL_DOCS_PREVIEW`）                                       |
| boolean変数          | `is`/`has`/`can`/`should` プレフィックス（例: `includeExamples`, `includeApiReference`）                  |
| 引数名セマンティクス | 実際の値と一致（P45対策: skillName = スキル名、outputPath = 出力先パス）                                  |

**対象ファイル**:

| ファイル                                                    | 確認内容           |
| ----------------------------------------------------------- | ------------------ |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | サービス層命名     |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | IPCハンドラー命名  |
| `packages/shared/src/types/skill-docs.ts`                   | 型定義命名         |
| `apps/desktop/src/preload/skill-api.ts`                     | Preload API命名    |
| `apps/desktop/src/preload/types.ts`                         | 型定義命名         |
| `apps/desktop/src/preload/channels.ts`                      | チャンネル定数命名 |

**確認コマンド**:

```bash
# P45対策: 引数名の一致確認
grep -rn "skillName\|outputPath" apps/desktop/src/main/services/skill/SkillDocGenerator.ts apps/desktop/src/main/ipc/skillHandlers.ts
```

**期待される成果物**:

- `outputs/phase-8/naming-type-unification.md`

---

## 参照資料

| 参照資料                 | パス                                                             | 内容                   |
| ------------------------ | ---------------------------------------------------------------- | ---------------------- |
| SkillDocGenerator        | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`      | ドキュメント生成実装   |
| IPCハンドラー            | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | Main Processハンドラー |
| ドキュメント型定義       | `packages/shared/src/types/skill-docs.ts`                        | 共有型定義             |
| Preload API              | `apps/desktop/src/preload/skill-api.ts`                          | Preload API実装        |
| Preload型定義            | `apps/desktop/src/preload/types.ts`                              | 型定義                 |
| チャンネル定数           | `apps/desktop/src/preload/channels.ts`                           | チャンネル定義         |
| テストファイル           | `apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts` | ユニットテスト         |
| IPCテストファイル        | `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`           | IPCハンドラーテスト    |
| Phase 1 要件成果物       | `outputs/phase-1/`                                               | 要件・受入基準         |
| Phase 2 設計成果物       | `outputs/phase-2/`                                               | 設計仕様               |
| Phase 5 実装成果物       | `outputs/phase-5/`                                               | 実装サマリー           |
| Phase 6 テスト拡充成果物 | `outputs/phase-6/`                                               | 追加テスト結果         |
| Phase 7 カバレッジ成果物 | `outputs/phase-7/`                                               | カバレッジ判定結果     |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 内容                                       |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API IPC仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャネル命名、引数契約、戻り値契約      |
| Skillインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer-Preload-Main間のSkill API契約     |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge、ホワイトリスト、公開API制約 |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | ipcMain.handle/on運用差分、Sender検証      |
| Skill IPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | safeInvoke/safeOn運用、Skill API防御       |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44/P45検証                    |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC拡張とPreload API設計                   |
| Electronサービス設計     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main Process責務分離                       |
| エラーハンドリング       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | IPC失敗時のエラー契約                      |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                        | P5/P32/P44/P45再発防止                     |

---

## 成果物

| 成果物                          | パス                                                        | 内容                          |
| ------------------------------- | ----------------------------------------------------------- | ----------------------------- |
| SkillDocGeneratorリファクタ分析 | `outputs/phase-8/skilldocgenerator-refactoring-analysis.md` | 重複分析・SOLID適用・抽出結果 |
| IPCバリデーション共通化         | `outputs/phase-8/ipc-docs-validation-commonization.md`      | 3段バリデーション共通化結果   |
| register/unregister対称性       | `outputs/phase-8/register-unregister-symmetry.md`           | 4チャネルの対称性検証結果     |
| 命名・型定義統一                | `outputs/phase-8/naming-type-unification.md`                | 命名規則・型統一確認結果      |

---

## 統合テスト連携

> リファクタ後の統合テスト継続成功を確認する

| 確認項目                     | 基準                                            |
| ---------------------------- | ----------------------------------------------- |
| 全ユニットテスト             | 100% パス                                       |
| SkillDocGeneratorテスト      | generate/preview/export/templatesテスト全件PASS |
| IPCハンドラーテスト（4件）   | 全テストケースPASS                              |
| セキュリティテスト           | sender検証・バリデーションPASS                  |
| カバレッジ維持               | リファクタ前と同等以上                          |
| 外部インターフェース変更ゼロ | Preload API・IPC契約に変更がない                |

---

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                            | 仕様参照先                                          |
| ------------------ | ---- | ----------------------------------------------------------------------- | --------------------------------------------------- |
| アーキテクチャ     | 必須 | SOLID原則（SRP: 各メソッド単一責務、DIP: queryFn DI）準拠               | `aiworkflow-requirements: architecture-overview.md` |
| セキュリティ       | 必須 | P42準拠3段バリデーションがリファクタ後も維持されている                  | `aiworkflow-requirements: security-electron-ipc.md` |
| IPC通信            | 必須 | register/unregister対称性（P5対策）、IPC契約ドリフトなし（P44/P45対策） | `aiworkflow-requirements: api-ipc-agent.md`         |
| エラーハンドリング | 必須 | sanitizeErrorMessage適用維持、エラーカテゴリ分類が崩れていない          | `aiworkflow-requirements: error-handling.md`        |
| パフォーマンス     | 任意 | リファクタ後にドキュメント生成時間が劣化していない（生成3秒以内を維持） | -                                                   |

**Electron層別チェック**:

| 層                   | チェック内容                                                         |
| -------------------- | -------------------------------------------------------------------- |
| バックエンド（Main） | SkillDocGenerator の内部メソッド構造がSRP準拠                        |
| IPC通信              | registerSkillDocsHandlers / unregisterSkillDocsHandlers の対称性維持 |
| Preload              | safeInvokeUnwrap パターンが崩れていない                              |

---

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング中は継続的にテスト実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillDocGenerator.test.ts --watch
cd apps/desktop && pnpm vitest run src/main/ipc/skillHandlers.docs.test.ts --watch
```

**確認項目**:

- [ ] リファクタリング後もSkillDocGeneratorテストが全て成功する
- [ ] リファクタリング後もIPCハンドラーテスト（docs関連4件）が全て成功する

---

## 完了条件

- [ ] SkillDocGeneratorの重複コード分析と抽出判断（実施または見送り理由記録）が完了している
- [ ] generate/preview共通ロジックの共通化判断が完了している
- [ ] SOLID原則適用結果が記録されている（SRP/DIP/OCP各原則の検証結果）
- [ ] IPCハンドラーの3段バリデーション共通化判断が完了している
- [ ] registerSkillDocsHandlers/unregisterSkillDocsHandlersの対称性が4チャネル全てで確認されている
- [ ] 命名規則・型定義が全ファイルで統一されている（P45対策: skillName統一を含む）
- [ ] リファクタリング前後でユニットテスト全件PASSしている
- [ ] リファクタリング前後でIPCハンドラーテスト全件PASSしている
- [ ] リファクタリングによる外部インターフェース変更がゼロである
- [ ] 全てのテストがパスしている
- [ ] カバレッジがリファクタ前と同等以上である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] テストが継続してGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-9I-skill-docs/phase-9-quality-assurance.md`
