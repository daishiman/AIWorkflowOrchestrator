# Phase 2 アーキテクチャ設計書 — UT-FIX-SKILL-IMPORT-INTERFACE-001

## メタ情報

| 項目        | 値                                                             |
| ----------- | -------------------------------------------------------------- |
| タスクID    | UT-FIX-SKILL-IMPORT-INTERFACE-001                              |
| Phase       | 2（設計）                                                      |
| 検証日時    | 2026-02-21                                                     |
| 前Phase依存 | Phase 1 要件定義書（`outputs/phase-1/`）                       |
| 対象問題    | P44: skill:import IPCハンドラとPreloadのインターフェース不整合 |

## 1. 修正方針: アプローチA（ハンドラ修正）

### 1.1 アプローチ比較

| 項目               | アプローチA（ハンドラ修正）       | アプローチB（Preload修正）           |
| ------------------ | --------------------------------- | ------------------------------------ |
| 変更ファイル       | `skillHandlers.ts` + テスト       | `skill-api.ts` + テスト              |
| Preload変更        | 不要                              | 必要                                 |
| skill:remove統一性 | 統一（skill:removeもアプローチA） | 統一（条件付き）                     |
| P42対応            | `.trim()` 追加可能                | ハンドラ側も変更必要                 |
| リスク             | 低（変更箇所が少ない）            | 中（Preload層の変更はP23リスク増加） |

### 1.2 選択結果: アプローチA（ハンドラ修正）

### 1.3 選択理由（3点）

1. **skill:\*ハンドラ間の方針統一**: UT-FIX-SKILL-REMOVE-INTERFACE-001 でもアプローチAが採用されており、skill:import と skill:remove で修正方針を統一する必要がある。異なるアプローチを採用すると、保守時の混乱と不整合のリスクが増加する
2. **Preload側は変更不要**: `skill-api.ts` の実装（`safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)`）は既に正しい文字列引数を送信しており、Preload側のコードに問題はない。問題はMain Process側のハンドラが `{ skillIds: string[] }` というオブジェクト形式を期待している点にある
3. **影響範囲の最小化**: 変更ファイルが2つ（`skillHandlers.ts` + `skillHandlers.test.ts`）のみで、Preload層（`skill-api.ts`、`preload/types.ts`、`skill-api.test.ts`）への変更が不要。P23（API二重定義の型管理複雑性）リスクを回避できる

## 2. IPC契約（修正後）

```
チャンネル: skill:import (IPC_CHANNELS.SKILL_IMPORT)
方向:      Renderer → Main（invoke/handle）
引数:      skillName: string（非空、トリム後非空）
戻り値:    ImportResult（{ success: boolean, importedCount: number, errors: string[] }）
```

### 契約変更サマリ

| 項目             | 修正前                          | 修正後                                   |
| ---------------- | ------------------------------- | ---------------------------------------- |
| 引数型           | `args: { skillIds: string[] }`  | `skillName: string`                      |
| 引数形式         | オブジェクト（配列プロパティ）  | 単一文字列                               |
| バリデーション   | `Array.isArray(args?.skillIds)` | `typeof + .trim()` 3段バリデーション     |
| エラーメッセージ | `"skillIds must be an array"`   | `"skillName must be a non-empty string"` |
| サービス呼出     | `importSkills(args.skillIds)`   | `importSkills([skillName])`              |

## 3. 修正前後のコード比較

### 3.1 修正前（現行コード — skillHandlers.ts 行120-138）

```typescript
// skill:import - スキルをインポート
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (!Array.isArray(args?.skillIds)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillIds must be an array",
      };
    }
    return skillService.importSkills(args.skillIds);
  },
);
```

### 3.2 修正後（設計）

```typescript
// skill:import - スキルをインポート
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
    return skillService.importSkills([skillName]);
  },
);
```

### 3.3 変更箇所の詳細

| 行      | 修正前                                     | 修正後                                                       | 理由                       |
| ------- | ------------------------------------------ | ------------------------------------------------------------ | -------------------------- |
| 123     | `args: { skillIds: string[] }`             | `skillName: string`                                          | Preload引数形式に統一      |
| 130     | `!Array.isArray(args?.skillIds)`           | `typeof skillName !== "string" \|\| skillName.trim() === ""` | P42準拠3段バリデーション   |
| 131-134 | `"skillIds must be an array"`              | `"skillName must be a non-empty string"`                     | P45準拠の命名統一          |
| 136     | `skillService.importSkills(args.skillIds)` | `skillService.importSkills([skillName])`                     | 配列ラッピングで互換性維持 |

## 4. バリデーションフロー（4ステップ）

```
引数受取: skillName
  |
  v
Step 1: validateIpcSender（送信元ウィンドウ検証）
  |--- invalid --> throw toIPCValidationError
  |--- valid
  v
Step 2: typeof skillName !== "string"（型チェック）
  |--- true --> throw { code: "VALIDATION_ERROR",
  |              message: "skillName must be a non-empty string" }
  |--- false
  v
Step 3: skillName.trim() === ""（空白のみチェック — P42準拠）
  |--- true --> throw { code: "VALIDATION_ERROR",
  |              message: "skillName must be a non-empty string" }
  |--- false
  v
Step 4: skillService.importSkills([skillName])
  |--- 成功 --> ImportResult を返却
  |--- エラー --> エラーがそのまま上位に伝播
```

### 設計判断

- **Step 2 と Step 3 の統合**: `typeof skillName !== "string" || skillName.trim() === ""` の1文で、型チェック・空文字列チェック・スペースのみチェックの3段を全てカバーする。`trim() === ""` は `=== ""` を包含するため、空文字列の独立チェックは不要
- **trim した値をサービスに渡すか**: `skillService.importSkills([skillName])` にはtrimしない元の値を渡す。バリデーションは「空白のみの入力を拒否する」目的であり、前後の空白除去はサービス層の責務とする。skill:remove の設計判断と同一

## 5. 配列ラッピング（[skillName]）の設計判断

### 判断内容

`skillService.importSkills` メソッドは `string[]`（文字列配列）を受け取る設計である。IPCハンドラで受け取った単一の `skillName` を `[skillName]` で配列にラップしてサービスに渡す。

### 判断根拠

1. **サービスAPI互換性の維持**: `importSkills(skillIds: string[])` のシグネチャを変更すると、同メソッドを呼び出す他の箇所にも影響が波及する。本タスクのスコープはIPCハンドラのインターフェース修正であり、サービス層のAPI変更はスコープ外
2. **skill:remove との差異**: `skillService.removeSkill(skillName)` は単一の `string` を受け取るため配列ラッピング不要。`importSkills` が配列を受け取る設計は、将来的な一括インポート対応を想定した既存設計を尊重する
3. **Preload層との整合**: Preload側の `import: (skillName: string) => Promise<ImportedSkill>` は単一スキル名を受け取る設計であり、IPCハンドラも単一文字列を受け取るのが自然。サービス層へのブリッジとして配列ラッピングを行う

## 6. エラーレスポンス設計（入力値8パターン）

| #   | 入力値                   | バリデーション結果 | 該当Step | エラー内容                                                                      |
| --- | ------------------------ | ------------------ | -------- | ------------------------------------------------------------------------------- |
| 1   | `undefined`              | 失敗               | Step 2   | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` |
| 2   | `null`                   | 失敗               | Step 2   | 同上                                                                            |
| 3   | `123`（数値）            | 失敗               | Step 2   | 同上                                                                            |
| 4   | `""`（空文字列）         | 失敗               | Step 3   | 同上                                                                            |
| 5   | `"   "`（スペースのみ）  | 失敗               | Step 3   | 同上                                                                            |
| 6   | `"\t\n"`（タブ改行のみ） | 失敗               | Step 3   | 同上                                                                            |
| 7   | `"valid-skill"`          | 成功               | -        | -（ImportResult を返却）                                                        |
| 8   | `" valid-skill "`        | 成功               | -        | -（trim後に非空文字列。サービスにはtrimしない元の値を渡す）                     |

### エラーコード体系

エラーコードは `VALIDATION_ERROR`（1000-1999 範囲）を使用。エラーハンドリングガイドライン準拠でリトライ不可のバリデーションエラーとして分類する。

## 7. 変更差分マトリクス

### 7.1 ハンドラ変更（4行）

| #   | ファイル           | 変更行  | 変更種別 | 変更内容                                                                                              |
| --- | ------------------ | ------- | -------- | ----------------------------------------------------------------------------------------------------- |
| 1   | `skillHandlers.ts` | 123     | 修正     | 引数: `args: { skillIds: string[] }` → `skillName: string`                                            |
| 2   | `skillHandlers.ts` | 130     | 修正     | 条件: `!Array.isArray(args?.skillIds)` → `typeof skillName !== "string" \|\| skillName.trim() === ""` |
| 3   | `skillHandlers.ts` | 131-134 | 修正     | メッセージ: `"skillIds must be an array"` → `"skillName must be a non-empty string"`                  |
| 4   | `skillHandlers.ts` | 136     | 修正     | 呼出: `skillService.importSkills(args.skillIds)` → `skillService.importSkills([skillName])`           |

### 7.2 テスト変更（12変更: 修正6件 + 追加1件 + 拡充5件）

| #   | テストID  | 変更種別 | Phase   | 概要                                                                            |
| --- | --------- | -------- | ------- | ------------------------------------------------------------------------------- |
| 1   | SH-IMP-01 | 修正     | Phase 4 | 正常系: 引数 `{ skillIds: ["skill-1", "skill-2"] }` → `"skill-1"`（文字列引数） |
| 2   | SH-IMP-02 | 修正     | Phase 4 | 異常系: 引数 `{ skillIds: "not-an-array" }` → `123`（非文字列バリデーション）   |
| 3   | SH-IMP-03 | 修正     | Phase 4 | 異常系: 引数 `{ skillIds: null }` → `""`（空文字列バリデーション）              |
| 4   | SH-IMP-04 | 修正     | Phase 4 | 正常系: 配列要素バリデーション → 存在しないスキル名テスト                       |
| 5   | SH-IMP-05 | 修正     | Phase 4 | 異常系: 不正文字バリデーション → スペースのみ文字列テスト（P42準拠）            |
| 6   | SH-IMP-06 | 修正     | Phase 4 | 異常系: 長さバリデーション → `undefined` バリデーションテスト                   |
| 7   | SH-IMP-07 | 追加     | Phase 6 | セキュリティ: validateIpcSender 呼び出し検証                                    |
| 8   | SH-IMP-08 | 追加     | Phase 6 | セキュリティ: sender検証失敗時のエラースロー                                    |
| 9   | SH-IMP-09 | 追加     | Phase 6 | エッジケース: パストラバーサル文字列（`../../../etc/passwd`）                   |
| 10  | SH-IMP-10 | 追加     | Phase 6 | エッジケース: タブ・改行のみの文字列（`"\t\n"`）                                |
| 11  | SH-IMP-11 | 追加     | Phase 6 | エラー伝播: サービスエラーの伝播確認                                            |

## 8. 変更不要ファイルの確認（3件）

| #   | ファイル               | 現行の実装                                                  | 確認結果                                       |
| --- | ---------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| 1   | `skill-api.ts:261-262` | `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` — 文字列 | 変更不要: 既に正しい文字列引数を送信している   |
| 2   | `skill-api.test.ts`    | 文字列引数を期待するテスト                                  | 変更不要: Preload側テストは現行のままで正しい  |
| 3   | `preload/types.ts`     | `import: (skillName: string) => Promise<ImportedSkill>`     | 変更不要: 型定義は既に文字列引数として定義済み |

### 確認根拠

Preload側の3ファイルは全て「文字列（`skillName: string`）」を前提とした実装・テスト・型定義であり、今回の修正はMain Process側のハンドラをPreload側のインターフェースに合わせる方向のため、Preload側の変更は不要。これはP23（API二重定義の型管理複雑性）リスクを回避する設計判断でもある。

## 9. Phase 4/6 テスト修正方針（合計11テストケース）

### 9.1 Phase 4: TDD Red テスト（6件）

既存テスト6件の引数形式を修正する。修正後はハンドラが未修正のためテストが FAIL する（TDD Red状態）。

| テストID  | 変更種別 | テスト概要                         | 引数変更                                             | 期待結果                           |
| --------- | -------- | ---------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| SH-IMP-01 | 修正     | 正常系: 文字列引数でインポート成功 | `{ skillIds: ["skill-1", "skill-2"] }` → `"skill-1"` | `importSkills(["skill-1"])` 呼出   |
| SH-IMP-02 | 修正     | 異常系: 非文字列引数の拒否         | `{ skillIds: "not-an-array" }` → `123`               | VALIDATION_ERROR スロー            |
| SH-IMP-03 | 修正     | 異常系: 空文字列の拒否             | `{ skillIds: null }` → `""`                          | VALIDATION_ERROR スロー            |
| SH-IMP-04 | 修正     | 正常系: 存在しないスキル名         | 配列要素バリデーション → `"nonexistent"`             | サービス層のエラーレスポンスを返却 |
| SH-IMP-05 | 修正     | 異常系: スペースのみ文字列（P42）  | 不正文字バリデーション → `"   "`                     | VALIDATION_ERROR スロー            |
| SH-IMP-06 | 修正     | 異常系: undefined の拒否           | 長さバリデーション → `undefined`                     | VALIDATION_ERROR スロー            |

### 9.2 Phase 6: テスト拡充（5件）

セキュリティ検証・エッジケース・エラー伝播の5件を新規追加する。

| テストID  | 種別         | テスト概要                     | 検証内容                                                                    |
| --------- | ------------ | ------------------------------ | --------------------------------------------------------------------------- |
| SH-IMP-07 | セキュリティ | validateIpcSender 呼び出し検証 | `validateIpcSender` が正しい引数で呼ばれていることをモック検証              |
| SH-IMP-08 | セキュリティ | sender検証失敗時のエラースロー | `validation.valid === false` の場合に `toIPCValidationError` がスローされる |
| SH-IMP-09 | エッジケース | パストラバーサル文字列         | `"../../../etc/passwd"` がバリデーションを通過し、サービス層に委譲される    |
| SH-IMP-10 | エッジケース | タブ・改行のみの文字列         | `"\t\n"` が `trim()` で空文字列になり VALIDATION_ERROR がスローされる       |
| SH-IMP-11 | エラー伝播   | サービスエラーの伝播確認       | `importSkills` が例外をスローした場合、そのまま上位に伝播する               |

### 9.3 テストカバレッジ目標

| 指標              | 目標 | 根拠                                    |
| ----------------- | ---- | --------------------------------------- |
| Line Coverage     | 90%+ | ハンドラの全行を11テストで網羅          |
| Branch Coverage   | 70%+ | バリデーション分岐を正常/異常で完全網羅 |
| Function Coverage | 90%+ | P41対策: インラインコールバックも検証   |

## 10. 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                        |
| -------------------- | -------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合済み          |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認済み               |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致済み |

## 11. 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                  | 確認結果                              |
| ------------------ | ----------------------------------------- | ------------------------------------- |
| API設計            | `api-endpoints.md`                        | skill:import チャンネル定義と整合     |
| インターフェース   | `interfaces-agent-sdk-skill.md`           | Skill管理API契約と整合                |
| アーキテクチャ     | `arch-electron-services.md`               | Main/Preload間の責務境界を遵守        |
| セキュリティ       | `security-skill-ipc.md`                   | validateIpcSender + 入力検証を実装    |
| Electron IPC       | `security-electron-ipc.md`                | safeInvoke + ホワイトリスト制約を遵守 |
| 実装パターン       | `architecture-implementation-patterns.md` | P23/P42/P44に基づく実装               |
| エラーハンドリング | `error-handling.md`                       | VALIDATION_ERROR の扱い統一           |

## 12. 完了条件チェックリスト

- [x] アプローチA選択の根拠が3点以上記載されている（セクション1.3: 方針統一/Preload変更不要/影響最小化）
- [x] 修正後のIPC契約（チャンネル名・引数型・戻り値型）が定義されている（セクション2）
- [x] 修正前後のコード比較が記載されている（セクション3）
- [x] バリデーションフロー（4ステップ）が図示されている（セクション4）
- [x] 配列ラッピング（`[skillName]`）の設計判断が記載されている（セクション5）
- [x] エラーレスポンス設計（入力値8パターンの期待結果）が定義されている（セクション6）
- [x] 変更差分マトリクスに全変更行が記載されている（ハンドラ4行 + テスト12変更）（セクション7）
- [x] 変更不要ファイル3件の確認結果が記載されている（セクション8）
- [x] Phase 4/6 のテスト修正方針が合計11テストケースで定義されている（セクション9）

## 次Phase

Phase 3（設計レビュー）へ進む。本設計書の妥当性を多角的に検証する。
