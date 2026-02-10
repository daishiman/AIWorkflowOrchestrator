# skill:scan IPCハンドラー 実装ガイド

## TASK-FIX-17-1-SKILL-SCAN-HANDLER

---

## Part 1: 概念的説明（中学生レベル）

### IPCハンドラーとは？

IPCハンドラーは、**銀行の窓口係**のようなものです。

想像してみてください。銀行に行って「残高を確認したい」と言うと、窓口係の人がバックオフィスに確認して、結果を教えてくれますよね。

アプリの世界でも同じことが起きています：

```
お客さん（画面）→ 窓口係（IPCハンドラー）→ バックオフィス（サービス）
                    ↓
              結果を返す
```

- **お客さん（Renderer）**: あなたが操作する画面
- **窓口係（IPCハンドラー）**: 画面とシステムの橋渡し役
- **バックオフィス（Main Process）**: 実際の処理を行う場所

### なぜ SKILL_SCAN が必要なの？

アプリには「スキル」という機能があります。これは図書館の本のようなもので、たくさんの種類があります。

- **SKILL_LIST**: 図書館の本棚を見て、すでに知っている本のリストを返す（速い）
- **SKILL_SCAN**: 図書館全体を歩いて、新しい本がないか探す（確実）

SKILL_SCAN は「絶対に最新の情報が欲しい！」というときに使います。

### 日常の例え

| 操作       | 日常の例え                     |
| ---------- | ------------------------------ |
| SKILL_LIST | カタログを見て商品を確認する   |
| SKILL_SCAN | 倉庫に行って実際に在庫を数える |

---

## Part 2: 技術者向け実装詳細

### 実装概要

| 項目         | 値                                           |
| ------------ | -------------------------------------------- |
| チャンネル名 | `skill:scan`                                 |
| 定数         | `IPC_CHANNELS.SKILL_SCAN`                    |
| ファイル     | `apps/desktop/src/main/ipc/skillHandlers.ts` |
| 行番号       | L70-88                                       |

### インターフェース設計

```typescript
// 入力: なし（void）

// 出力
type SkillScanResponse =
  | {
      success: true;
      data: Skill[];
    }
  | {
      success: false;
      error: string;
    };
```

### 実装コード

```typescript
// skill:scan - スキルの強制再スキャン (TASK-FIX-17-1-SKILL-SCAN-HANDLER)
ipcMain.handle(IPC_CHANNELS.SKILL_SCAN, async (event: IpcMainInvokeEvent) => {
  // 1. 送信元検証
  const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_SCAN, {
    getAllowedWindows: () => [mainWindow],
  });
  if (!validation.valid) {
    throw toIPCValidationError(validation);
  }

  // 2. スキルスキャン実行（forceRefresh: true 固定）
  try {
    const result = await skillService.scanAvailableSkills(true);
    return { success: true, data: result.skills };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "スキャンに失敗しました",
    };
  }
});
```

### SKILL_LIST との比較

| 項目         | SKILL_LIST                     | SKILL_SCAN     |
| ------------ | ------------------------------ | -------------- |
| 引数         | `{ forceRefresh?: boolean }`   | なし           |
| forceRefresh | オプション（デフォルト false） | 固定 true      |
| 用途         | 通常のスキル一覧取得           | 強制再スキャン |
| キャッシュ   | 活用可能                       | 常にクリア     |

### セキュリティ

| 検証項目         | 実装                         |
| ---------------- | ---------------------------- |
| 送信元検証       | `validateIpcSender`          |
| 許可ウィンドウ   | mainWindow のみ              |
| エラーサニタイズ | 内部情報を含まないメッセージ |

### 依存関係

```typescript
import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillService } from "../services/skill/SkillService";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
```

### テストケース一覧

| テストID | 説明                      | 結果 |
| -------- | ------------------------- | ---- |
| SH-SC-01 | ハンドラー登録確認        | PASS |
| SH-SC-02 | forceRefresh=true 確認    | PASS |
| SH-SC-03 | 成功レスポンス確認        | PASS |
| SH-SC-04 | エラーレスポンス確認      | PASS |
| SH-SC-05 | IPC sender バリデーション | PASS |
| SH-SC-06 | 空配列返却                | PASS |
| SH-SC-07 | 複数回呼び出し            | PASS |
| SH-SC-08 | DevTools 拒否             | PASS |
| SH-SC-09 | 非 Error 例外処理         | PASS |
| SH-SC-10 | unregister 確認           | PASS |
| SH-SC-11 | 未知のウィンドウ拒否      | PASS |
| SH-SC-12 | 破棄されたウィンドウ拒否  | PASS |

---

## 関連ドキュメント

| ドキュメント       | パス                                    |
| ------------------ | --------------------------------------- |
| チャンネル定義     | `apps/desktop/src/preload/channels.ts`  |
| セキュリティルール | `.claude/rules/04-electron-security.md` |
| タスク仕様書       | `docs/30-workflows/TASK-FIX-17-1/`      |
