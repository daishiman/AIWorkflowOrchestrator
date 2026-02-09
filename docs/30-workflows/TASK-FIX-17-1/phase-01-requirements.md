# Phase 1: 要件定義

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 1                                |
| タスクID | TASK-FIX-17-1-SKILL-SCAN-HANDLER |
| 機能名   | skill:scan IPCハンドラー追加     |
| 作成日   | 2026-02-08                       |
| 分類     | バグ修正（ハンドラー欠落）       |
| 状態     | 未着手                           |

## 目的

`skill:scan` IPCチャンネルに対応するハンドラーを skillHandlers.ts に追加し、
preload/channels.ts で定義済みのチャンネルが正常に機能するようにする。

## 実行タスク

- 現状調査: チャンネル定義とハンドラーの不整合を確認
- 要件抽出: SKILL_SCAN ハンドラーの機能要件を定義
- 受け入れ基準作成: 検証可能な受け入れ基準を定義

---

## 背景・現状

### 問題の概要

`skill:scan` IPCチャンネルは以下の状態にある:

| 項目           | 状態       | ファイル                  | 行番号 |
| -------------- | ---------- | ------------------------- | ------ |
| チャンネル定義 | 定義済み   | preload/channels.ts       | L185   |
| ホワイトリスト | 登録済み   | preload/channels.ts       | L398   |
| IPCハンドラー  | **未実装** | main/ipc/skillHandlers.ts | -      |

### 参考: 既存SKILL_LISTハンドラー

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_LIST,
  async (event, args?: { basePath?: string; forceRefresh?: boolean }) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_LIST, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    try {
      const result = await skillService.scanAvailableSkills(args?.forceRefresh);
      return { success: true, data: result.skills };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "スキャンに失敗しました",
      };
    }
  },
);
```

---

## 機能要件（FR）

| FR-ID | 要件                                                                  | 優先度 |
| ----- | --------------------------------------------------------------------- | ------ |
| FR-01 | SKILL_SCAN チャンネルに対応するハンドラーを登録する                   | 高     |
| FR-02 | skillService.scanAvailableSkills(true) を呼び出す（強制リフレッシュ） | 高     |
| FR-03 | 成功時に { success: true, data: Skill[] } を返す                      | 高     |
| FR-04 | エラー時に { success: false, error: string } を返す                   | 高     |
| FR-05 | validateIpcSender による送信元検証を行う                              | 高     |

### SKILL_LIST との差異

| 項目             | SKILL_LIST                         | SKILL_SCAN     |
| ---------------- | ---------------------------------- | -------------- |
| forceRefresh引数 | オプショナル（args経由）           | 常にtrue固定   |
| basePath引数     | オプショナル（args経由）           | なし           |
| 用途             | キャッシュ活用可能なスキル一覧取得 | 強制再スキャン |

---

## 非機能要件（NFR）

| NFR-ID | 要件                                     | 優先度 |
| ------ | ---------------------------------------- | ------ |
| NFR-01 | 既存テストが全て通過する                 | 高     |
| NFR-02 | 型チェックが通る（TypeScript strict）    | 高     |
| NFR-03 | 既存SKILL_LISTハンドラーとの一貫性を維持 | 高     |

---

## 受け入れ基準

### AC-01: ハンドラー登録

**Given**: skillHandlers.ts が読み込まれている
**When**: registerSkillHandlers() が呼び出される
**Then**: IPC_CHANNELS.SKILL_SCAN に対するハンドラーが登録される

### AC-02: 強制リフレッシュ実行

**Given**: SKILL_SCAN ハンドラーが呼び出される
**When**: skillService.scanAvailableSkills() が実行される
**Then**: 第1引数として true（forceRefresh）が渡される

### AC-03: 成功レスポンス

**Given**: スキルスキャンが成功する
**When**: ハンドラーが結果を返す
**Then**: { success: true, data: Skill[] } 形式で返す

### AC-04: エラーレスポンス

**Given**: スキルスキャン中にエラーが発生する
**When**: ハンドラーがエラーを処理する
**Then**: { success: false, error: string } 形式で返す

### AC-05: セキュリティ検証

**Given**: IPC呼び出しが発生する
**When**: ハンドラーが呼び出される
**Then**: validateIpcSender による送信元検証が最初に実行される

### AC-06: ハンドラー解除

**Given**: unregisterSkillHandlers() が呼び出される
**When**: アプリ終了時
**Then**: SKILL_SCAN ハンドラーも解除される

---

## スコープ定義

### 含むもの

- skillHandlers.ts への SKILL_SCAN ハンドラー追加
- unregisterSkillHandlers() への removeHandler 追加
- ユニットテストの追加

### 含まないもの

- preload/channels.ts の変更（既に定義済み）
- SkillService の変更（既存メソッドを使用）
- Renderer側の変更

---

## 参照資料

| 資料名                 | パス                                                                    | 説明                           |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| チャンネル定義         | apps/desktop/src/preload/channels.ts                                    | IPC チャンネル定義             |
| スキルハンドラー       | apps/desktop/src/main/ipc/skillHandlers.ts                              | 実装対象ファイル               |
| IPCセキュリティルール  | .claude/rules/04-electron-security.md                                   | IPC セキュリティ原則           |
| スキルIPCセキュリティ  | .claude/skills/aiworkflow-requirements/references/security-skill-ipc.md | Skill IPC 固有のセキュリティ   |
| 実装パターン集         | .claude/skills/task-specification-creator/references/patterns.md        | IPC統合・エラー伝達パターン    |
| エラーハンドリング仕様 | .claude/skills/aiworkflow-requirements/references/error-handling.md     | エラーコード体系・リトライ戦略 |

---

## アーキテクチャ層別要件

| 層           | 要件                                     |
| ------------ | ---------------------------------------- |
| Main Process | SKILL_SCAN ハンドラーを追加              |
| Preload      | 変更不要（既にチャンネル定義済み）       |
| Renderer     | 変更不要（必要に応じて呼び出し側で対応） |

---

## 統合テスト連携【必須】

| 接続要件カテゴリ | 記載内容                               |
| ---------------- | -------------------------------------- |
| IPCチャンネル    | skill:scan（IPC_CHANNELS.SKILL_SCAN）  |
| 依存サービス     | SkillService.scanAvailableSkills(true) |
| セキュリティ     | validateIpcSender による送信元検証     |

---

## 成果物

| 成果物     | パス                                                                                             | 説明           |
| ---------- | ------------------------------------------------------------------------------------------------ | -------------- |
| 要件定義書 | docs/30-workflows/skill-import-agent-system/phase-outputs/TASK-FIX-17-1/phase-01-requirements.md | 本ドキュメント |

---

## 完了条件

- [ ] 全要件が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] スコープが定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
