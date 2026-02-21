# 実装ガイド: skill:import IPCハンドラ戻り値型不整合修正

## タスク情報

| 項目             | 内容                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| タスクID         | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名         | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 分類             | バグ修正                                                                     |
| 関連パターン     | P23, P32, P42, P44, P45                                                      |
| 修正対象ファイル | `apps/desktop/src/main/ipc/skillHandlers.ts` L120-158                        |

---

## Part 1: 概念的説明（中学生レベル）

### お店の注文と商品受け取りの例え

想像してみてください。あなたはお店で「このスキルをください」と注文します。

#### 修正前の問題

店員さん（Main Process）は注文を処理した後、**注文確認メモ**だけを渡していました。

```
注文確認メモ（ImportResult）:
- 処理件数: 1件
- エラー: なし
- 成功: はい
```

でもお客さん（Renderer / UI画面）が欲しいのは**商品の実物情報**です。メモだけもらっても、商品棚（スキル一覧画面）に何も並べられません。

#### 修正後の解決

店員さんは2つのステップで対応するようになりました:

1. **ステップ1**: 注文を処理する（`importSkills()` を呼ぶ）
2. **ステップ2**: 棚から商品の実物情報を取り出す（`getSkillByName()` を呼ぶ）

```
商品の実物情報（ImportedSkill）:
- 商品名: "my-awesome-skill"
- 説明: "便利なスキルです"
- 棚の場所: "/path/to/skill/SKILL.md"
- 入荷日: 2026-02-21
- 最終更新日: 2026-02-21
- 状態: "active"（販売中）
- エージェント一覧: [{...}]
- 参考資料: [{...}]
- スクリプト: [{...}]
```

これでお客さんは商品棚に正しく並べることができます。

### なぜ2ステップが必要なのか

お店に例えると:

- **注文処理**（ステップ1）は、倉庫にある商品を棚に移す作業です。結果は「処理できたか」「エラーはあったか」だけを教えてくれます。
- **商品情報の取得**（ステップ2）は、棚に移された商品の詳しい情報を見に行く作業です。

1回の注文で2つの作業が必要なのは、注文処理と情報取得がそれぞれ別の仕事だからです。これは**単一責務の原則（SRP）**と呼ばれる考え方で、「1つの仕組みには1つの役割だけを持たせる」という設計の基本ルールです。

### セキュリティの確認（門番の例え）

お店に入る前に、門番さんが「あなたは本当にうちのお客さんですか？」と身分確認をします（`validateIpcSender`）。その後、注文内容が正しいかどうか3つのチェックをします:

1. **文字で書かれているか？** -- 数字や空っぽだったら受け付けません
2. **空欄じゃないか？** -- 何も書いてない注文は受け付けません
3. **スペースだけじゃないか？** -- 見た目は書いてあるようでも中身がない注文は受け付けません

この3段階のチェックを**P42準拠3段バリデーション**と呼びます。

---

## Part 2: 開発者向け実装詳細

### 変換ロジック: 2ステップ処理フロー

```
Renderer (agentSlice.ts)
    |
    | window.electronAPI.skill.import(skillName)
    v
Preload (skill-api.ts)
    |
    | safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)
    v
Main Process (skillHandlers.ts L120-158)
    |
    +-- Step 0: validateIpcSender(event) ... セキュリティ検証
    |     +-- !validation.valid --> throw toIPCValidationError(validation)
    |
    +-- Step 0.5: P42準拠3段バリデーション
    |     +-- typeof skillName !== "string" --> VALIDATION_ERROR
    |     +-- skillName.trim() === ""       --> VALIDATION_ERROR
    |
    +-- Step 1: skillService.importSkills([skillName])
    |     +-- result.success && result.importedCount > 0 --> Step 2へ
    |     +-- それ以外 --> IMPORT_ERROR (errors.join or default message)
    |
    +-- Step 2: skillService.getSkillByName(skillName)
          +-- importedSkill !== null --> return importedSkill (成功)
          +-- importedSkill === null --> IMPORT_ERROR
```

### 型定義の差異

修正前に返していた `ImportResult` 型と、修正後に返す `ImportedSkill` 型のプロパティ対比表:

| プロパティ    | ImportResult（修正前） | ImportedSkill（修正後） | 備考                                       |
| ------------- | ---------------------- | ----------------------- | ------------------------------------------ |
| success       | boolean                | なし                    | インポート成否フラグ                       |
| importedCount | number                 | なし                    | インポート件数                             |
| errors        | string[]               | なし                    | エラーメッセージ配列                       |
| name          | なし                   | string                  | スキル名                                   |
| description   | なし                   | string                  | スキル説明文                               |
| path          | なし                   | string                  | SKILL.mdのファイルパス                     |
| updatedAt     | なし                   | Date                    | 最終更新日時                               |
| importedAt    | なし                   | Date                    | インポート日時                             |
| status        | なし                   | string                  | スキル状態（"active" 等）                  |
| agents        | なし                   | SkillSubResource[]      | エージェント一覧                           |
| references    | なし                   | SkillSubResource[]      | 参考資料一覧                               |
| scripts       | なし                   | SkillSubResource[]      | スクリプト一覧                             |
| assets        | なし                   | SkillSubResource[]      | アセット一覧                               |
| schemas       | なし                   | SkillSubResource[]      | スキーマ一覧                               |
| indexes       | なし                   | SkillSubResource[]      | インデックス一覧                           |
| otherFiles    | なし                   | SkillOtherFile[]        | その他ファイル一覧（name, path, mimeType） |

### コード変更箇所

#### Before（修正前）

```typescript
// skillHandlers.ts - 修正前: ImportResult をそのまま返していた
ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (event, args) => {
  validateIpcSender(event);

  if (!Array.isArray(args?.skillIds)) {
    throw createIpcError(
      "VALIDATION_ERROR",
      "skillIds must be an array of skill names",
    );
  }

  const { skillIds } = args;
  const result = await skillService.importSkills(skillIds);

  return {
    importedCount: result.length,
    errors: [],
  };
});
```

#### After（修正後）

```typescript
// skillHandlers.ts L120-158 - 修正後: ImportedSkill を返す
// skill:import - スキルをインポート（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001: ImportedSkill型を返す）
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, skillName: string) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    if (typeof skillName !== "string" || skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }

    // Step 1: インポート実行
    const result = await skillService.importSkills([skillName]);

    // Step 2: インポート成功時、ImportedSkill を取得して返す
    if (result.success && result.importedCount > 0) {
      const importedSkill = await skillService.getSkillByName(skillName);
      if (importedSkill) {
        return importedSkill;
      }
    }

    // Step 3: インポート失敗またはスキル取得失敗時はエラー
    throw {
      code: "IMPORT_ERROR",
      message:
        result.errors.length > 0
          ? result.errors.join(", ")
          : `Failed to import skill: ${skillName}`,
    };
  },
);
```

### 修正ポイント概要

| #   | 変更内容                                                              | 理由                                                        | 準拠パターン |
| --- | --------------------------------------------------------------------- | ----------------------------------------------------------- | ------------ |
| 1   | 引数を `args: { skillIds: string[] }` から `skillName: string` に変更 | Preload側が `safeInvoke(channel, skillName)` で文字列を渡す | P44          |
| 2   | P42準拠3段バリデーション追加                                          | スペースのみ入力を早期拒否                                  | P42          |
| 3   | `importSkills([skillName])` で配列ラップ                              | 既存サービスAPIを変更せずに対応                             | -            |
| 4   | `getSkillByName(skillName)` で ImportedSkill 取得                     | ImportResult から ImportedSkill への変換                    | FR-2         |
| 5   | 引数名を `skillIds` から `skillName` に変更                           | セマンティクスと実際の値の一致                              | P45          |
| 6   | `validateIpcSender` を3引数形式（event, channel, options）に更新      | セキュリティ検証の標準形式                                  | -            |
| 7   | 失敗時に `IMPORT_ERROR` コードで例外 throw                            | 明確なエラーコードを返す                                    | FR-3         |

### IPC契約の修正前後

#### 修正前（不整合状態）

| 軸     | ハンドラ側（Main Process） | Preload側                | 状態   |
| ------ | -------------------------- | ------------------------ | ------ |
| 引数   | `{ skillIds: string[] }`   | `skillName: string`      | 不整合 |
| 戻り値 | `ImportResult`             | `Promise<ImportedSkill>` | 不整合 |
| エラー | 未定義                     | 型未定義                 | 不整合 |

#### 修正後（整合状態）

| 軸     | ハンドラ側（Main Process） | Preload側                | 状態 |
| ------ | -------------------------- | ------------------------ | ---- |
| 引数   | `skillName: string`        | `skillName: string`      | 整合 |
| 戻り値 | `ImportedSkill`            | `Promise<ImportedSkill>` | 整合 |
| エラー | `{ code, message }`        | reject(Error)            | 整合 |

### IPC通信でのDate型シリアライゼーション

`ImportedSkill` には `importedAt`（Date型）と `updatedAt`（Date型）の2つの日付フィールドが含まれる。

Electron IPCは `structuredClone` アルゴリズムを使用してデータをシリアライズするため、Dateオブジェクトはそのまま転送される。ただし、JSON.stringifyを経由する場合はISO 8601文字列（例: `"2026-02-21T09:00:00.000Z"`）に変換されるため注意が必要。

| シリアライゼーション方式   | Date型の扱い               | 備考                             |
| -------------------------- | -------------------------- | -------------------------------- |
| structuredClone（IPC標準） | Dateオブジェクトとして保持 | 追加処理不要                     |
| JSON.stringify             | ISO 8601文字列に変換       | Renderer側で `new Date()` が必要 |

テストでは `expect(result.importedAt).toBeInstanceOf(Date)` で Date 型であることを明示的に検証している（RT-05）。

### エラーハンドリング

本タスクで扱うエラーパターンの全一覧:

| ステップ             | エラー条件                                 | エラーコード       | エラーメッセージ                            | テストID                                      |
| -------------------- | ------------------------------------------ | ------------------ | ------------------------------------------- | --------------------------------------------- |
| Step 0: セキュリティ | 送信元ウィンドウ検証失敗                   | IPC_UNAUTHORIZED等 | toIPCValidationError が生成                 | RT-16, RT-17, RT-18                           |
| Step 0.5: 型チェック | `typeof skillName !== "string"`            | VALIDATION_ERROR   | "skillName must be a non-empty string"      | SH-IMP-02, SH-IMP-05, SH-IMP-06, RT-13, RT-14 |
| Step 0.5: 空文字列   | `skillName === ""`                         | VALIDATION_ERROR   | "skillName must be a non-empty string"      | SH-IMP-03, RT-11                              |
| Step 0.5: トリム空   | `skillName.trim() === ""`                  | VALIDATION_ERROR   | "skillName must be a non-empty string"      | SH-IMP-04, RT-12, RT-15                       |
| Step 1: インポート   | `importSkills` が例外を throw              | （例外伝播）       | サービス層からの元のエラー                  | RT-07                                         |
| Step 1: インポート   | `!result.success` または `importedCount=0` | IMPORT_ERROR       | `result.errors.join(", ")` またはデフォルト | RT-03, RT-09, RT-10                           |
| Step 2: スキル取得   | `getSkillByName` が例外を throw            | （例外伝播）       | サービス層からの元のエラー                  | RT-08                                         |
| Step 2: スキル取得   | `getSkillByName` が null を返す            | IMPORT_ERROR       | `Failed to import skill: ${skillName}`      | RT-04                                         |

エラーメッセージのサニタイズ方針: `skillName` の具体的な値はデフォルトメッセージに含まれるが、SkillService から伝播する内部エラーの詳細はそのまま表示しない設計。

### テストカバレッジ

skill:import ハンドラ（L120-158）の全10分岐がテストで網羅されている:

| #   | 分岐条件                                             | カバーするテスト               |
| --- | ---------------------------------------------------- | ------------------------------ |
| 1   | `!validation.valid`（セキュリティ拒否）              | RT-16, RT-17, RT-18            |
| 2   | `typeof skillName !== "string"`（型不正）            | RT-13, RT-14                   |
| 3   | `skillName.trim() === ""`（空/スペースのみ）         | RT-11, RT-12, RT-15            |
| 4   | `result.success && result.importedCount > 0`（成功） | SH-IMP-01, RT-01, RT-05, RT-06 |
| 5   | `!result.success`（インポート失敗）                  | RT-03, RT-10                   |
| 6   | `result.importedCount === 0`（カウント0）            | RT-09                          |
| 7   | `importedSkill !== null`（スキル取得成功）           | SH-IMP-01, RT-01               |
| 8   | `importedSkill === null`（スキル取得失敗）           | RT-04                          |
| 9   | `result.errors.length > 0`（エラーメッセージあり）   | RT-03, RT-10                   |
| 10  | `result.errors.length === 0`（エラーメッセージなし） | RT-09                          |

テスト実行統計: 全103テスト PASS、FAIL 0件、SKIP 0件。

### 関連パターン

| パターンID | タイトル                                      | 本タスクとの関連                                                          |
| ---------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| P23        | API二重定義の型管理複雑性                     | skill-api.ts の型宣言と skillHandlers.ts の実装が一致している必要がある   |
| P32        | 型定義の二箇所同時更新必須                    | shared/types.ts と preload/types.ts の整合性を維持                        |
| P42        | 文字列引数の .trim() バリデーション漏れ       | 3段バリデーション（型チェック → 空文字列 → トリム空文字列）を標準実装     |
| P44        | skill:import/remove IPCインターフェース不整合 | 引数形式を `{ skillIds: string[] }` から `string` に統一                  |
| P45        | IPC引数命名の契約ドリフト                     | 引数名を `skillIds` から `skillName` に変更し、セマンティクスと一致させた |

### 変更不要ファイル（整合性確認済み）

以下のファイルは本タスクで変更不要であることを確認済み:

| ファイル                                         | 理由                                                  |
| ------------------------------------------------ | ----------------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts`          | Preload型宣言は既に `Promise<ImportedSkill>` で正しい |
| `apps/desktop/src/renderer/store/agentSlice.ts`  | Rendererロジックは変更不要                            |
| `packages/shared/src/types/skill.ts`             | ImportedSkill型定義は変更不要                         |
| `apps/desktop/src/main/services/SkillService.ts` | `getSkillByName()` は既に実装済み                     |

---

## 用語集

| 用語                      | 読み方                                       | 意味                                                                                                          |
| ------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ImportResult              | インポートリザルト                           | スキルインポート操作の結果オブジェクト。success（成否）、importedCount（件数）、errors（エラー一覧）を持つ    |
| ImportedSkill             | インポーテッドスキル                         | インポート済みスキルの詳細情報オブジェクト。name、description、path、importedAt、status等の19フィールドを持つ |
| SkillSubResource          | スキルサブリソース                           | スキルに紐づく下位リソース（エージェント、参考資料等）。name、path、descriptionを持つ                         |
| SkillOtherFile            | スキルアザーファイル                         | スキルに含まれるその他ファイル。name、path、mimeTypeを持つ                                                    |
| IPC                       | アイピーシー                                 | Inter-Process Communication。プロセス間通信。ElectronのMain-Renderer間の通信方式                              |
| validateIpcSender         | バリデート・アイピーシー・センダー           | IPC通信の送信元ウィンドウを検証するセキュリティ関数。3引数形式（event, channel, options）で呼び出す           |
| toIPCValidationError      | トゥー・アイピーシー・バリデーションエラー   | validateIpcSenderの検証結果をIPCエラーオブジェクトに変換するヘルパー関数                                      |
| P42準拠3段バリデーション  | ピー42じゅんきょ3だんバリデーション          | 型チェック → 空文字列チェック → トリム空文字列チェックの3段階入力検証パターン                                 |
| safeInvoke                | セーフ・インボーク                           | contextBridge経由の安全なIPC呼び出しラッパー関数                                                              |
| structuredClone           | ストラクチャード・クローン                   | JavaScriptオブジェクトの深いコピーを行うアルゴリズム。Electron IPCのシリアライゼーションに使用される          |
| SRP                       | エスアールピー                               | Single Responsibility Principle。単一責務の原則。1つの仕組みに1つの役割だけを持たせる設計原則                 |
| IPC_CHANNELS.SKILL_IMPORT | アイピーシー・チャネルズ・スキル・インポート | skill:import チャンネルの定数名。ハードコード文字列を避けるために使用（P27防止）                              |
