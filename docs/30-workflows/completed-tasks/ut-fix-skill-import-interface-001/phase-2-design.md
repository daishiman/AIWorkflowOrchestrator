# Phase 2: 設計 — skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目        | 値                                       |
| ----------- | ---------------------------------------- |
| タスクID    | UT-FIX-SKILL-IMPORT-INTERFACE-001        |
| Phase       | 2（設計）                                |
| 前Phase依存 | Phase 1 要件定義書（`outputs/phase-1/`） |
| 担当        | Claude Code                              |
| 作成日      | 2026-02-21                               |

## 目的

アプローチA（ハンドラ修正 — Main Process側をPreload側の文字列引数に合わせる）に基づき、修正後のインターフェース設計と変更差分を定義する。

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

1. 修正方針の確定（アプローチAを選択した根拠の記録）
2. 修正後のインターフェース設計
3. 変更差分マトリクスの作成
4. テスト修正方針の設計

## 参照資料

> 依存Phase成果物参照: Phase 1

| 資料                                                                                                       | 用途                                        |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 1 要件定義書                                                                                         | 受入基準（FR-1〜3, QR-1〜5）                |
| `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-import-interface-001.md` | アプローチA/Bの比較                         |
| `docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/phase-2-design.md`                        | 同一パターン（P44）の先行修正設計           |
| `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                              | P23/P32/P42/P44 の統合チェックリスト        |
| `.claude/rules/06-known-pitfalls.md#P42`                                                                   | 3段バリデーションパターン                   |
| `.claude/rules/06-known-pitfalls.md#P44`                                                                   | skill:import 同一パターン（修正方針の統一） |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                                               | 現行ハンドラ実装                            |
| `apps/desktop/src/preload/skill-api.ts`                                                                    | Preload側の現行実装                         |

## 実行手順

### Step 1: 修正方針の確定

#### アプローチ比較

| 項目               | アプローチA（ハンドラ修正）       | アプローチB（Preload修正）           |
| ------------------ | --------------------------------- | ------------------------------------ |
| 変更ファイル       | `skillHandlers.ts` + テスト       | `skill-api.ts` + テスト              |
| Preload変更        | 不要                              | 必要                                 |
| skill:remove統一性 | 統一（skill:removeもアプローチA） | 統一（条件付き）                     |
| P42対応            | `.trim()` 追加可能                | ハンドラ側も変更必要                 |
| リスク             | 低（変更箇所が少ない）            | 中（Preload層の変更はP23リスク増加） |

#### 選択結果: **アプローチA（ハンドラ修正）**

**選択理由:**

1. UT-FIX-SKILL-REMOVE-INTERFACE-001 でもアプローチAが採用されており、skill:\*ハンドラ間の方針統一が必要
2. Preload側（`skill-api.ts`）は既に正しい実装（文字列引数）のため変更不要
3. 変更ファイルが2つ（ハンドラ + テスト）のみで影響範囲が最小

### Step 2: 修正後のインターフェース設計

#### 2.1 IPC契約（修正後）

```
チャンネル: skill:import (IPC_CHANNELS.SKILL_IMPORT)
方向:      Renderer → Main（invoke/handle）
引数:      skillName: string（非空、トリム後非空）
戻り値:    ImportResult（{ success: boolean, importedCount: number, errors: string[] }）
```

#### 2.2 修正前後のコード比較

**修正前（現行コード — skillHandlers.ts 行120-138）:**

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

**修正後（設計）:**

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

#### 2.3 バリデーションフロー

```
引数受取: skillName
  ↓
Step 1: validateIpcSender（送信元ウィンドウ検証）
  ├─ invalid → throw toIPCValidationError
  └─ valid ↓
Step 2: typeof skillName !== "string"
  ├─ true → throw VALIDATION_ERROR
  └─ false ↓
Step 3: skillName.trim() === ""
  ├─ true → throw VALIDATION_ERROR（P42: スペースのみ対策）
  └─ false ↓
Step 4: skillService.importSkills([skillName])
  ├─ 成功 → ImportResult を返却
  └─ エラー → エラーがそのまま上位に伝播
```

**設計判断（Step 2 と Step 3 の統合）:** `typeof skillName !== "string" || skillName.trim() === ""` の1文で、型チェック・空文字列チェック・スペースのみチェックの3段を全てカバーする。`trim() === ""` は `=== ""` を包含するため、空文字列の独立チェックは不要。

**設計判断（trimした値をサービスに渡すか）:** `skillService.importSkills([skillName])` にはtrimしない元の値を渡す。バリデーションは「空白のみの入力を拒否する」目的であり、前後の空白除去はサービス層の責務とする。

**設計判断（配列ラッピング）:** `skillService.importSkills` は `string[]` を受け取る設計のため、単一スキル名を `[skillName]` で配列にラップして渡す。skill:remove の `skillService.removeSkill(skillName)` とは異なり、importSkills のシグネチャ変更は本タスクのスコープ外とする。

#### 2.4 エラーレスポンス設計

| 入力値                   | バリデーション結果 | エラー内容                                                                      |
| ------------------------ | ------------------ | ------------------------------------------------------------------------------- |
| `undefined`              | 失敗（Step 2）     | `{ code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }` |
| `null`                   | 失敗（Step 2）     | 同上                                                                            |
| `123`（数値）            | 失敗（Step 2）     | 同上                                                                            |
| `""`（空文字列）         | 失敗（Step 3）     | 同上                                                                            |
| `"   "`（スペースのみ）  | 失敗（Step 3）     | 同上                                                                            |
| `"\t\n"`（タブ改行のみ） | 失敗（Step 3）     | 同上                                                                            |
| `"valid-skill"`          | 成功               | —                                                                               |
| `" valid-skill "`        | 成功               | trim後に非空文字列（サービスにはtrimしない値を渡す）                            |

### Step 3: 変更差分マトリクス

#### 3.1 ファイル変更一覧

| ファイル                | 変更種別 | 変更行  | 変更内容                                                                                              |
| ----------------------- | -------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `skillHandlers.ts`      | 修正     | 123     | 引数: `args: { skillIds: string[] }` → `skillName: string`                                            |
| `skillHandlers.ts`      | 修正     | 130     | 条件: `!Array.isArray(args?.skillIds)` → `typeof skillName !== "string" \|\| skillName.trim() === ""` |
| `skillHandlers.ts`      | 修正     | 131-134 | メッセージ: `"skillIds must be an array"` → `"skillName must be a non-empty string"`                  |
| `skillHandlers.ts`      | 修正     | 136     | 呼出: `skillService.importSkills(args.skillIds)` → `skillService.importSkills([skillName])`           |
| `skillHandlers.test.ts` | 修正     | 634     | SH-IMP-01: テスト名・引数・検証値を文字列形式に変更                                                   |
| `skillHandlers.test.ts` | 修正     | 648     | SH-IMP-01: 引数 `{ skillIds: ["skill-1", "skill-2"] }` → `"skill-1"`                                  |
| `skillHandlers.test.ts` | 修正     | 658     | SH-IMP-02: 引数 `{ skillIds: "not-an-array" }` → `123`（非文字列バリデーション）                      |
| `skillHandlers.test.ts` | 修正     | 675     | SH-IMP-03: 引数 `{ skillIds: null }` → `""`（空文字列バリデーション）                                 |
| `skillHandlers.test.ts` | 修正     | 692     | SH-IMP-04: 配列要素バリデーション → 存在しないスキル名テスト                                          |
| `skillHandlers.test.ts` | 修正     | 708     | SH-IMP-05: 不正文字バリデーション → スペースのみ文字列テスト（P42）                                   |
| `skillHandlers.test.ts` | 修正     | 724     | SH-IMP-06: 長さバリデーション → `undefined` バリデーションテスト                                      |
| `skillHandlers.test.ts` | 追加     | 740+    | SH-IMP-07〜11: セキュリティ・エッジケース・エラー伝播テスト                                           |

#### 3.2 変更不要ファイルの確認

| ファイル               | 現行の実装                                                  | 確認結果 |
| ---------------------- | ----------------------------------------------------------- | -------- |
| `skill-api.ts:261-262` | `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` — 文字列 | 変更不要 |
| `skill-api.test.ts`    | 文字列引数を期待するテスト                                  | 変更不要 |
| `preload/types.ts`     | `import: (skillName: string) => Promise<ImportedSkill>`     | 変更不要 |

### Step 4: テスト修正方針

#### 4.1 Phase 4 で修正するテスト（TDD Red）

既存テスト6件の引数形式を修正。修正後はテストが FAIL する（ハンドラ未修正のため）。

| テストID  | 変更種別 | 概要                        |
| --------- | -------- | --------------------------- |
| SH-IMP-01 | 修正     | 正常系: 文字列引数          |
| SH-IMP-02 | 修正     | 異常系: 非文字列引数        |
| SH-IMP-03 | 修正     | 異常系: 空文字列            |
| SH-IMP-04 | 修正     | 正常系: 存在しないスキル    |
| SH-IMP-05 | 修正     | 異常系: スペースのみ（P42） |
| SH-IMP-06 | 修正     | 異常系: undefined           |

#### 4.2 Phase 6 で追加するテスト（拡充）

セキュリティ検証・エッジケース・エラー伝播の5件。

| テストID  | 種別         | 概要                           |
| --------- | ------------ | ------------------------------ |
| SH-IMP-07 | セキュリティ | validateIpcSender 呼び出し検証 |
| SH-IMP-08 | セキュリティ | sender検証失敗時のエラースロー |
| SH-IMP-09 | エッジケース | パストラバーサル文字列         |
| SH-IMP-10 | エッジケース | タブ・改行のみの文字列         |
| SH-IMP-11 | エラー伝播   | サービスエラーの伝播確認       |

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物               | パス                                     |
| -------------------- | ---------------------------------------- |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md` |

## 完了条件

- [ ] アプローチA選択の根拠が3点以上記載されている
- [ ] 修正後のIPC契約（チャンネル名・引数型・戻り値型）が定義されている
- [ ] 修正前後のコード比較が記載されている
- [ ] バリデーションフロー（4ステップ）が図示されている
- [ ] 配列ラッピング（`[skillName]`）の設計判断が記載されている
- [ ] エラーレスポンス設計（入力値8パターンの期待結果）が定義されている
- [ ] 変更差分マトリクスに全変更行が記載されている（ハンドラ4行 + テスト12変更）
- [ ] 変更不要ファイル3件の確認結果が記載されている
- [ ] Phase 4/6 のテスト修正方針が合計11テストケースで定義されている

## 次Phase

Phase 3（設計レビュー）へ進む。設計の妥当性を検証する。
