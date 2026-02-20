# Phase 2 アーキテクチャ設計書 — UT-FIX-SKILL-REMOVE-INTERFACE-001

## 検証日時

2026-02-20

## 修正方針: アプローチA（ハンドラ修正）

### 選択理由

1. UT-FIX-SKILL-IMPORT-INTERFACE-001 でもアプローチAが採用 → skill:\*ハンドラ間の方針統一
2. Preload側は既に正しい実装のため変更不要
3. 変更ファイルが2つのみで影響範囲が最小

## IPC契約（修正後）

- チャンネル: skill:remove (IPC_CHANNELS.SKILL_REMOVE)
- 方向: Renderer → Main（invoke/handle）
- 引数: skillName: string（非空、トリム後非空）
- 戻り値: RemoveResult（{ success: boolean, removed: boolean }）

## 修正前後のコード比較

### 修正前

```typescript
async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
  // ...
  if (typeof args?.skillId !== "string") {
    throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
  }
  return skillService.removeSkill(args.skillId);
};
```

### 修正後

```typescript
async (event: IpcMainInvokeEvent, skillName: string) => {
  // ...
  if (typeof skillName !== "string" || skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }
  return skillService.removeSkill(skillName);
};
```

## バリデーションフロー

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
Step 4: skillService.removeSkill(skillName)
```

## エラーレスポンス設計

| 入力値                 | バリデーション結果 | エラー内容                                             |
| ---------------------- | ------------------ | ------------------------------------------------------ |
| undefined              | 失敗（Step 2）     | VALIDATION_ERROR: skillName must be a non-empty string |
| null                   | 失敗（Step 2）     | 同上                                                   |
| 123（数値）            | 失敗（Step 2）     | 同上                                                   |
| ""（空文字列）         | 失敗（Step 3）     | 同上                                                   |
| " "（スペースのみ）    | 失敗（Step 3）     | 同上                                                   |
| "\t\n"（タブ改行のみ） | 失敗（Step 3）     | 同上                                                   |
| "valid-skill"          | 成功               | —                                                      |
| " valid-skill "        | 成功               | trim後に非空（サービスにはtrimしない値を渡す）         |

## 変更差分マトリクス

| ファイル               | 変更種別 | 変更内容                                                                                             |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| skillHandlers.ts 行143 | 修正     | 引数: args: { skillId: string } → skillName: string                                                  |
| skillHandlers.ts 行150 | 修正     | 条件: typeof args?.skillId !== "string" → typeof skillName !== "string" \|\| skillName.trim() === "" |
| skillHandlers.ts 行151 | 修正     | メッセージ: "skillId must be a string" → "skillName must be a non-empty string"                      |
| skillHandlers.ts 行153 | 修正     | 呼出: skillService.removeSkill(args.skillId) → skillService.removeSkill(skillName)                   |
| skillHandlers.test.ts  | 修正     | SH-RM-01~04 引数形式修正                                                                             |
| skillHandlers.test.ts  | 追加     | SH-RM-05 (スペースのみ P42), SH-RM-06 (undefined)                                                    |

## テスト修正方針

### Phase 4（TDD Red）: 6テスト

| テストID | 変更種別 | 概要                        |
| -------- | -------- | --------------------------- |
| SH-RM-01 | 修正     | 正常系: 文字列引数          |
| SH-RM-02 | 修正     | 異常系: 非文字列引数        |
| SH-RM-03 | 修正     | 異常系: 空文字列            |
| SH-RM-04 | 修正     | 正常系: 存在しないスキル    |
| SH-RM-05 | 新規     | 異常系: スペースのみ（P42） |
| SH-RM-06 | 新規     | 異常系: undefined           |

### Phase 6（テスト拡充）: 5テスト

| テストID | 種別         | 概要                           |
| -------- | ------------ | ------------------------------ |
| SH-RM-07 | セキュリティ | validateIpcSender 呼び出し検証 |
| SH-RM-08 | セキュリティ | sender検証失敗時のエラースロー |
| SH-RM-09 | エッジケース | パストラバーサル文字列         |
| SH-RM-10 | エッジケース | タブ・改行のみの文字列         |
| SH-RM-11 | エラー伝播   | サービスエラーの伝播確認       |

## 完了条件チェック

- [x] アプローチA選択の根拠が3点記載
- [x] 修正後のIPC契約が定義
- [x] 修正前後のコード比較が記載
- [x] バリデーションフローが図示
- [x] エラーレスポンス設計（8パターン）が定義
- [x] 変更差分マトリクスに全変更行が記載
- [x] 変更不要ファイル3件の確認結果が記載
- [x] テスト修正方針が11テストケースで定義
