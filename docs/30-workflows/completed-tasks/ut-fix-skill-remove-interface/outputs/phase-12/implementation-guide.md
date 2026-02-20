# skill:remove インターフェース不整合修正 実装ガイド

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| タスクID | UT-FIX-SKILL-REMOVE-INTERFACE-001 |
| Phase    | 12（ドキュメント更新）            |
| 作成日   | 2026-02-20                        |
| 修正対象 | skill:remove IPC ハンドラ         |

---

## Part 1: 概念的説明（中学生レベル）

### なぜ修正が必要だったか？

お店で注文する場面を想像してください。

**お客さん（画面側 = Preload）**: 「ハンバーガーを1つください」（品名を直接言う）
**受付（IPCハンドラ = Main Process）**: 「注文票に書いてある品名で受け取ります」（注文票の形式を期待）

お客さんは品名を直接言っているのに、受付が「注文票に書いてないと受け取れません」と断っていました。これがバグの原因です。

受付側を修正して「品名を直接言ってもらえればOK」にしたのが今回の修正です。

### 修正前と修正後

- **修正前**: 受付が「注文票（`{ skillId: "スキル名" }`）」形式でしか受け付けない
- **修正後**: 受付が「品名の直接指定（`"スキル名"`）」で受け付ける

つまり、お客さんが「リンゴ」と言ったら、受付は「リンゴ」をそのまま受け取るようになりました。わざわざ「リンゴと書いた紙を箱に入れて渡す」必要はなくなったのです。

### バリデーション（チェック）— 3段チェック

修正後の受付は3段階でチェックします。

1. **品名が「文字列」であること**: 数字（123）やオブジェクト（箱に入れた紙）は拒否する
2. **品名が空でないこと**: 何も言わない（`""`）のは拒否する
3. **品名がスペースだけでないこと**: 空白だけ（`"   "`）のは拒否する

この3段チェックは「P42」というルールに基づいています。「見えない空白だけの注文」を通さないためのルールです。

### この修正が必要だった背景

同じアプリの中で「skill:import」（スキルを追加する機能）にも同じ問題があります（P44として記録済み）。skill:import は未修正で別タスク（UT-FIX-SKILL-IMPORT-INTERFACE-001）として管理されており、今回の skill:remove は先行して同パターンを修正したものです。

---

## Part 2: 技術者向け実装詳細

### 修正概要

| 項目               | 値                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 修正ファイル数     | 4（ハンドラ 1 + テスト 1 + サービス命名整合 2）                                                                          |
| ハンドラーファイル | `apps/desktop/src/main/ipc/skillHandlers.ts`（行140-159）                                                                |
| テストファイル     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（行746-980）                                                 |
| サービス層         | `apps/desktop/src/main/services/skill/SkillService.ts`, `SkillImportManager.ts`（`skillId` 変数名を `skillName` に統一） |
| Preload 変更       | なし（元から `skillName: string` を送信）                                                                                |
| 関連 Pitfall       | P42, P44, P23, P32, P41                                                                                                  |

### 修正前後のコード比較

#### 修正前（`{ skillId: string }` オブジェクト形式を期待）

```typescript
// skill:remove - スキルを削除
ipcMain.handle(
  IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.skillId !== "string") {
      return { success: false, error: "skillId must be a string" };
    }
    return skillService.removeSkill(args.skillId);
  },
);
```

#### 修正後（`skillName: string` 直接形式を受け取り）

```typescript
// skill:remove - スキルを削除
ipcMain.handle(
  IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, skillName: string) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
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
    return skillService.removeSkill(skillName);
  },
);
```

### 変更点の詳細

| 変更箇所           | 変更前                                   | 変更後                                                       | 理由                             |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------ | -------------------------------- |
| 引数シグネチャ     | `args: { skillId: string }`              | `skillName: string`                                          | Preload 側の文字列引数に合わせる |
| バリデーション条件 | `typeof args?.skillId !== "string"`      | `typeof skillName !== "string" \|\| skillName.trim() === ""` | P42: 3段バリデーション           |
| エラー処理         | `return { success: false, error }`       | `throw { code: "VALIDATION_ERROR", message }`                | skill:import と同一パターン      |
| エラーメッセージ   | `"skillId must be a string"`             | `"skillName must be a non-empty string"`                     | 変数名・条件に整合               |
| サービス呼び出し   | `skillService.removeSkill(args.skillId)` | `skillService.removeSkill(skillName)`                        | 引数アクセス方法の変更           |

### P42 準拠 3段バリデーション

```typescript
if (typeof skillName !== "string" || skillName.trim() === "") {
```

1. `typeof skillName !== "string"` -- 型チェック（数値、undefined、null、オブジェクトを拒否）
2. `skillName === ""` -- 空文字列チェック（`trim() === ""` に含まれる）
3. `skillName.trim() === ""` -- スペース・タブ・改行のみの文字列を拒否

### Preload 側インターフェース（変更なし）

```typescript
// apps/desktop/src/preload/skill-api.ts 行264-265
remove: (skillName: string): Promise<void> =>
  safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName),
```

Preload 側は元から `skillName: string` を直接送信しており、変更不要であった。

### skill:import との一貫性

skill:import ハンドラ（P44 で課題記録済み、UT-FIX-SKILL-IMPORT-INTERFACE-001 として修正予定）も同一パターンでインターフェース不整合が存在していた。本タスクの修正パターンは skill:import と同じアプローチA（ハンドラ側修正）を採用しており、3段構成（`validateIpcSender` -> 引数バリデーション -> サービス呼び出し）が一貫している。

### テストケース一覧（全 11 件）

| ID       | 種別          | テスト内容                                                                                  | Phase | 結果 |
| -------- | ------------- | ------------------------------------------------------------------------------------------- | ----- | ---- |
| SH-RM-01 | 正常系        | 有効なスキル名での削除（`removeSkill` 呼び出し確認）                                        | 4     | PASS |
| SH-RM-02 | 異常系（型）  | 数値引数（`123`）の拒否                                                                     | 4     | PASS |
| SH-RM-03 | 異常系（空）  | 空文字列（`""`）の拒否                                                                      | 4     | PASS |
| SH-RM-04 | 正常系        | 存在しないスキルの graceful 処理                                                            | 4     | PASS |
| SH-RM-05 | 境界値（P42） | スペースのみ（`"   "`）の拒否                                                               | 4     | PASS |
| SH-RM-06 | 異常系        | `undefined` の拒否                                                                          | 4     | PASS |
| SH-RM-07 | セキュリティ  | `validateIpcSender` 正常呼び出し検証（P41: `getAllowedWindows` コールバック戻り値検証含む） | 6     | PASS |
| SH-RM-08 | セキュリティ  | 不正 sender 時の `toIPCValidationError` エラースロー検証                                    | 6     | PASS |
| SH-RM-09 | エッジケース  | パストラバーサル文字列のサービス層委譲                                                      | 6     | PASS |
| SH-RM-10 | 境界値        | タブ・改行のみ（`"\t\n"`）の拒否                                                            | 6     | PASS |
| SH-RM-11 | エラー伝播    | `skillService.removeSkill` エラーの上位伝播                                                 | 6     | PASS |

### カバレッジ結果（Phase 7）

| 指標       | 実測値（ファイル全体） | skill:remove 範囲       | 判定                                   |
| ---------- | ---------------------- | ----------------------- | -------------------------------------- |
| Lines      | 45.14%                 | 全行カバー              | PASS（ファイル全体は 15 ハンドラ含む） |
| Branches   | 75.75%                 | 全 5 分岐カバー         | PASS（推奨基準 70% 超過）              |
| Functions  | 37.5%                  | 全関数カバー（P41対応） | PASS（P41 によるインライン関数計上）   |
| Statements | 45.14%                 | 全文カバー              | PASS                                   |

### 関連 Pitfall 準拠状況

| Pitfall | 内容                                | 対策状況                                                 |
| ------- | ----------------------------------- | -------------------------------------------------------- |
| P42     | `.trim()` バリデーション漏れ        | 3段バリデーション実装済み                                |
| P44     | skill:import インターフェース不整合 | 本タスクは P44 と同一パターン。skill:remove を同様に修正 |
| P23     | API 二重定義の型管理                | Preload 側変更不要のため影響なし                         |
| P32     | 型定義の二箇所同時更新              | Preload 側変更不要のため影響なし                         |
| P41     | v8 カバレッジのインライン関数       | SH-RM-07 で `getAllowedWindows` コールバック明示検証     |
