# Phase 2: 設計

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 2                                |
| タスクID | TASK-FIX-17-1-SKILL-SCAN-HANDLER |
| 機能名   | skill:scan IPCハンドラー追加     |
| 作成日   | 2026-02-08                       |
| 状態     | 未着手                           |

## 目的

要件を実現可能な構造に落とし込む。

## 実行タスク

- インターフェース設計: IPC通信の入出力を定義
- 実装パターン選定: 既存ハンドラーとの一貫性を確保
- セキュリティ設計: 送信元検証の実装方針を決定

---

## インターフェース設計

### IPCチャンネル

| 項目           | 値                                |
| -------------- | --------------------------------- |
| チャンネル名   | skill:scan                        |
| 定数           | IPC_CHANNELS.SKILL_SCAN           |
| 引数           | なし                              |
| 戻り値（成功） | { success: true, data: Skill[] }  |
| 戻り値（失敗） | { success: false, error: string } |

### 型定義

```typescript
// 引数: なし（void）

// 戻り値
interface SkillScanResponse {
  success: boolean;
  data?: Skill[]; // 成功時のみ
  error?: string; // 失敗時のみ
}
```

---

## 実装設計

### ハンドラー実装

```typescript
// skill:scan - 利用可能なスキルを強制スキャン
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

### unregisterSkillHandlers への追加

```typescript
export function unregisterSkillHandlers(): void {
  // ... 既存の removeHandler 呼び出し ...
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_SCAN);
  // ...
}
```

---

## 実装パターン

### 既存 SKILL_LIST ハンドラーとの比較

| 要素                    | SKILL_LIST                         | SKILL_SCAN（新規）                 |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| validateIpcSender       | あり                               | あり（同一パターン）               |
| 引数                    | { basePath?, forceRefresh? }       | なし                               |
| scanAvailableSkills引数 | args?.forceRefresh（オプショナル） | true（固定）                       |
| 成功レスポンス          | { success: true, data: skills }    | { success: true, data: skills }    |
| エラーレスポンス        | { success: false, error: message } | { success: false, error: message } |

### 設計判断

| 判断項目         | 決定             | 理由                             |
| ---------------- | ---------------- | -------------------------------- |
| 引数の有無       | 引数なし         | 強制リフレッシュ専用のため不要   |
| forceRefresh値   | true固定         | SKILL_SCANの目的は強制再スキャン |
| エラーメッセージ | SKILL_LISTと同一 | 一貫性維持                       |
| 戻り値形式       | SKILL_LISTと同一 | 一貫性維持                       |

---

## 依存関係

### 使用するサービス・関数

| 依存先                           | 用途               |
| -------------------------------- | ------------------ |
| SkillService.scanAvailableSkills | スキルスキャン実行 |
| validateIpcSender                | IPC送信元検証      |
| toIPCValidationError             | 検証エラーの変換   |
| IPC_CHANNELS.SKILL_SCAN          | チャンネル名定数   |

### インポート

```typescript
// 既存のインポートで対応（追加不要）
import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { SkillService } from "../services/skill/SkillService";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator";
```

---

## セキュリティ設計

### 送信元検証

- validateIpcSender によるウィンドウ検証を実施
- 許可されたウィンドウ（mainWindow）からの呼び出しのみ受付
- 検証失敗時は toIPCValidationError でエラーをスロー

### 引数バリデーション

- 引数なしのため、特別なバリデーションは不要
- 予期しない引数が渡されても無視（無害）

### エラーサニタイズ（security-skill-ipc.md 準拠）

> ⚠️ **重要**: エラーメッセージはサニタイズしてから Renderer に送る（内部情報を漏洩しない）

| 対象                 | 対応方針                                             |
| -------------------- | ---------------------------------------------------- |
| ファイルパス         | 絶対パスを含むエラーは汎用メッセージに置換           |
| スタックトレース     | 本番環境では送信しない                               |
| 内部サービス名       | 汎用メッセージに置換                                 |
| 既存 SKILL_LIST 準拠 | 同一パターン（`error instanceof Error`）で一貫性維持 |

**実装での注意点**:

```typescript
// 既存パターン（SKILL_LIST と同一）
error: error instanceof Error ? error.message : "スキャンに失敗しました";
// ↑ error.message にファイルパス等が含まれる可能性あり

// 改善検討（将来タスク）
// - エラーメッセージのパス情報を除去するサニタイズ関数の導入
// - エラーコード体系（4000番台: Infrastructure Error）の適用
```

---

## 参照資料

| 資料名                 | パス                                                                                             | 説明                           |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ |
| 要件定義書             | docs/30-workflows/skill-import-agent-system/phase-outputs/TASK-FIX-17-1/phase-01-requirements.md | Phase 1成果物                  |
| 既存ハンドラー         | apps/desktop/src/main/ipc/skillHandlers.ts                                                       | 実装対象                       |
| スキルIPCセキュリティ  | .claude/skills/aiworkflow-requirements/references/security-skill-ipc.md                          | エラーサニタイズ・パス検証仕様 |
| 実装パターン集         | .claude/skills/task-specification-creator/references/patterns.md                                 | IPC統合パターン・成功/失敗事例 |
| アーキテクチャパターン | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md        | 実装パターン・DI設計           |

---

## 統合テスト連携【必須】

| 統合ポイント     | 契約定義                                             |
| ---------------- | ---------------------------------------------------- |
| IPCチャンネル    | IPC_CHANNELS.SKILL_SCAN（skill:scan）                |
| サービス呼び出し | skillService.scanAvailableSkills(true)               |
| セキュリティ     | validateIpcSender（mainWindow検証）                  |
| レスポンス形式   | { success: boolean, data?: Skill[], error?: string } |

---

## 成果物

| 成果物           | パス                                                                                       | 説明           |
| ---------------- | ------------------------------------------------------------------------------------------ | -------------- |
| 設計ドキュメント | docs/30-workflows/skill-import-agent-system/phase-outputs/TASK-FIX-17-1/phase-02-design.md | 本ドキュメント |

---

## 完了条件

- [ ] インターフェースが定義されている
- [ ] 実装パターンが決定されている
- [ ] 依存関係が明確である
- [ ] セキュリティ設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
