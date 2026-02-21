# 実装ガイド: skill:import IPCインターフェース不整合修正

## Part 1: 概念説明（中学生レベル）

### お手紙のあて先と中身の不一致

想像してみてください。友達に手紙を送るとき、封筒に「鈴木太郎くんへ」と書きますよね。でも、もし郵便局が「宛名は必ず『鈴木太郎様 住所: ○○市...』という特別な形式で書いてください」と要求したら、普通に名前だけ書いた手紙は届きません。

AIWorkflowOrchestratorでも同じことが起きていました:

- **手紙を送る側（画面側・Preload）**: 「スキルの名前」をそのまま送っていた → `"my-skill"`
- **受け取る側（処理側・Main Process）**: 「名前のリストが入った箱」で届くと思っていた → `{ skillIds: ["my-skill"] }`

送り方と受け取り方が合っていなかったので、「箱が届いてないよ！」というエラーが出ていたのです。

### 解決方法

受け取る側（Main Process）を「名前がそのまま届く」ように変更しました。送る側は正しかったので、受け取り方だけ直せばOKでした。

### なぜ大事なの？

このアプリでは、画面側と処理側が「IPC（プロセス間通信）」という仕組みで会話しています。会話のルール（何を送って何を受け取るか）が合っていないと、ユーザーがスキルをインポートしようとしてもエラーになって使えません。今回の修正で、スキルのインポート機能が正常に動くようになりました。

## Part 2: 技術的詳細（開発者向け）

### 1. 修正対象

| ファイル                                                    | 行番号  | 変更内容                                           |
| ----------------------------------------------------------- | ------- | -------------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | 120-140 | ハンドラ引数型・バリデーション・サービス呼出の修正 |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | 633-900 | テスト7件修正 + 6件追加 = 13件                     |

### 2. IPC契約（修正後）

```typescript
// チャンネル: skill:import (IPC_CHANNELS.SKILL_IMPORT)
// 方向: Renderer → Preload → Main
// 引数: skillName: string（単一スキル名）
// 戻り値: ImportResult

interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: Array<{ skillId: string; error: string }>;
}
```

### 3. バリデーションフロー（P42準拠）

```
引数: skillName
  │
  ├─ Step 1: validateIpcSender（送信元検証）
  │    └─ invalid → throw toIPCValidationError
  │
  ├─ Step 2: typeof skillName !== "string"（型チェック）
  │    └─ true → throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }
  │
  ├─ Step 3: skillName.trim() === ""（空白チェック）
  │    └─ true → throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }
  │
  └─ Step 4: skillService.importSkills([skillName])
       └─ 配列ラップで既存サービスAPI互換を維持
```

### 4. 修正前後のコード比較

```typescript
// ❌ 修正前（P44不整合）
async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
  // ...sender検証...
  if (!Array.isArray(args?.skillIds)) {
    throw { code: "VALIDATION_ERROR", message: "skillIds must be an array" };
  }
  return skillService.importSkills(args.skillIds);
};

// ✅ 修正後（P42/P44準拠）
async (event: IpcMainInvokeEvent, skillName: string) => {
  // ...sender検証...
  if (typeof skillName !== "string" || skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }
  return skillService.importSkills([skillName]);
};
```

### 5. テストケース一覧

| ID        | カテゴリ       | テスト内容                           | Phase |
| --------- | -------------- | ------------------------------------ | ----- |
| SH-IMP-01 | 正常系         | 文字列skillNameでimportSkills呼出    | 4     |
| SH-IMP-02 | バリデーション | 非文字列(数値)でVALIDATION_ERROR     | 4     |
| SH-IMP-03 | バリデーション | 空文字列でVALIDATION_ERROR           | 4     |
| SH-IMP-04 | バリデーション | スペースのみでVALIDATION_ERROR (P42) | 4     |
| SH-IMP-05 | セキュリティ   | validateIpcSender呼び出し検証 (P41)  | 4     |
| SH-IMP-06 | 正常系         | 配列ラップ確認                       | 4     |
| SH-IMP-07 | エラー伝播     | サービスエラー伝播                   | 4     |
| SH-IMP-08 | バリデーション | null引数でVALIDATION_ERROR           | 6     |
| SH-IMP-09 | バリデーション | undefined引数でVALIDATION_ERROR      | 6     |
| SH-IMP-10 | バリデーション | 旧形式オブジェクト拒否 (P44)         | 6     |
| SH-IMP-11 | 正常系         | 特殊文字スキル名の正常処理           | 6     |
| SH-IMP-12 | バリデーション | タブのみでVALIDATION_ERROR (P42)     | 6     |
| SH-IMP-13 | バリデーション | 改行のみでVALIDATION_ERROR (P42)     | 6     |

### 6. 関連パターン

| パターン | 内容                                | 本タスクでの対応                   |
| -------- | ----------------------------------- | ---------------------------------- |
| P23      | API二重定義の型管理複雑性           | Preload側変更不要の方針で回避      |
| P32      | 型定義の二箇所同時更新              | 型定義変更なし（ハンドラのみ修正） |
| P42      | .trim()バリデーション漏れ           | 3段バリデーション実装              |
| P44      | import/removeインターフェース不整合 | 本タスクで完全解決                 |
| P45      | 引数命名の契約ドリフト              | skillName統一で解決                |
