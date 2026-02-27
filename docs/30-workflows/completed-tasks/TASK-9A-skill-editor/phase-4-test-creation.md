# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 4                                          |
| 機能名    | TASK-9A-skill-editor                       |
| 作成日    | 2026-02-26                                 |
| 前提Phase | Phase 3（設計レビュー）完了                |
| 目的      | TDDのRedフェーズとしてテストを先行作成する |

## 目的

Phase 2 で設計した SkillFileManager（TASK-9A-A）、IPCハンドラー（TASK-9A-B）、UIコンポーネント（TASK-9A-C）の3層に対し、TDD の Red フェーズとしてテストコードを先行作成する。テストは全て失敗状態（Red）で作成し、Phase 5 の実装で Green にする。

## 実行タスク

- Task 1: Main Process ユニットテスト作成（SkillFileManager）
- Task 2: IPC ハンドラーユニットテスト・セキュリティテスト作成
- Task 3: Renderer コンポーネントテスト作成（SkillEditor, SkillCodeEditor）
- Task 4: 統合テスト作成（IPC 経由のファイル操作フロー）

## 参照資料

| 資料名                   | パス                                                                                        | 説明                                   |
| ------------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1 要件成果物       | `outputs/phase-1/`                                                                          | 要件・受入基準・スコープ定義           |
| Phase 2 設計成果物       | `outputs/phase-2/`                                                                          | クラス設計・型定義・メソッド設計       |
| Phase 3 レビュー結果     | `outputs/phase-3/`                                                                          | 設計レビュー判定結果                   |
| セキュリティAPI仕様      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | validateIpcSender、IPC通信セキュリティ |
| エラーハンドリング仕様   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ(1000-5999)              |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構成、IPCハンドラー登録一覧    |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC契約ドリフト防止手順                |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI、Setter Injection                   |
| TASK-9A-A Phase 4 成果物 | `docs/30-workflows/completed-tasks/task-9a-a-skill-file-manager/phase-04-test-creation.md`  | SkillFileManager テスト仕様（参考）    |
| TASK-9A-B Phase 4 成果物 | `docs/30-workflows/completed-tasks/TASK-9A-B-ipc-file-handlers/phase-4-test-creation.md`    | IPC ハンドラーテスト仕様（参考）       |
| TASK-9A-C Phase 4 成果物 | `docs/30-workflows/completed-tasks/TASK-9A-C-skill-editor-ui/phase-4-test-creation.md`      | UI コンポーネントテスト仕様（参考）    |

## 実行手順

### Task 1: Main Process ユニットテスト作成（SkillFileManager）

**テストファイル配置先**: `apps/desktop/src/main/services/skill/__tests__/`

#### 1.1 テスト基盤セットアップ

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillFileManager.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { vol } from "memfs";
import { SkillFileManager } from "../SkillFileManager";

vi.mock("fs/promises");

describe("SkillFileManager", () => {
  let manager: SkillFileManager;

  beforeEach(() => {
    vol.reset();
    manager = new SkillFileManager({
      aiworkflowSkillsDir: "/mock/.aiworkflow/skills",
      claudeSkillsDir: "/mock/.claude/skills",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
```

#### 1.2 ファイル読み込みテスト

| No   | テスト項目                                        | 期待結果                                   |
| ---- | ------------------------------------------------- | ------------------------------------------ |
| M-01 | SKILL.md の読み込みが成功する                     | ファイル内容が文字列で返却される           |
| M-02 | agents/ 配下のファイルが読み込める                | サブディレクトリのファイル内容が返却される |
| M-03 | references/ 配下のファイルが読み込める            | サブディレクトリのファイル内容が返却される |
| M-04 | 存在しないファイルで FileNotFoundError が発生する | FileNotFoundError がスローされる           |
| M-05 | 存在しないスキルで SkillNotFoundError が発生する  | SkillNotFoundError がスローされる          |

#### 1.3 ファイル書き込みテスト

| No   | テスト項目                                          | 期待結果                                   |
| ---- | --------------------------------------------------- | ------------------------------------------ |
| M-06 | writeFile でファイル内容が更新される                | ファイルの内容が新しい値に変更される       |
| M-07 | writeFile 時にバックアップが自動作成される          | `.backup.{timestamp}` ファイルが生成される |
| M-08 | 読み取り専用スキルへの書き込みで ReadonlySkillError | ReadonlySkillError がスローされる          |

#### 1.4 ファイル作成・削除テスト

| No   | テスト項目                                    | 期待結果                                    |
| ---- | --------------------------------------------- | ------------------------------------------- |
| M-09 | createFile で新規ファイルが作成される         | 指定パスにファイルが作成される              |
| M-10 | 既存ファイルに createFile で FileExistsError  | FileExistsError がスローされる              |
| M-11 | deleteFile でファイルが削除バックアップされる | `.deleted.{timestamp}` ファイルが生成される |
| M-12 | 読み取り専用スキルの削除で ReadonlySkillError | ReadonlySkillError がスローされる           |

#### 1.5 バックアップ操作テスト

| No   | テスト項目                                 | 期待結果                             |
| ---- | ------------------------------------------ | ------------------------------------ |
| M-13 | listBackups でバックアップ一覧が取得できる | BackupInfo[] が返却される            |
| M-14 | restoreBackup でバックアップから復元できる | ファイル内容がバックアップ時点に戻る |
| M-15 | 存在しないバックアップの復元で Error       | FileNotFoundError がスローされる     |

#### 1.6 セキュリティテスト

| No   | テスト項目                                                  | 期待結果                          |
| ---- | ----------------------------------------------------------- | --------------------------------- |
| M-16 | パストラバーサル（`../`）で PathTraversalError              | PathTraversalError がスローされる |
| M-17 | 絶対パス指定で PathTraversalError                           | PathTraversalError がスローされる |
| M-18 | シンボリックリンク経由のパストラバーサルを検出する          | PathTraversalError がスローされる |
| M-19 | `~/.claude/skills/` のファイルが readonly=true で検出される | SkillDirInfo.readonly が true     |
| M-20 | `~/.aiworkflow/skills/` のファイルが readonly=false         | SkillDirInfo.readonly が false    |

### Task 2: IPC ハンドラーテスト作成

**テストファイル配置先**: `apps/desktop/src/main/ipc/__tests__/`

#### 2.1 ユニットテスト（正常系）

テストファイル: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`

| No   | チャンネル          | テスト項目                                    | 期待結果                                         |
| ---- | ------------------- | --------------------------------------------- | ------------------------------------------------ |
| I-01 | skill:readFile      | 有効な引数でファイル内容が返却される          | `{ success: true, data: "content" }`             |
| I-02 | skill:writeFile     | 有効な引数でファイルが書き込まれる            | `{ success: true }`                              |
| I-03 | skill:writeFile     | 書き込み後に scanAvailableSkills() が呼ばれる | `skillService.scanAvailableSkills` が1回呼ばれる |
| I-04 | skill:createFile    | 有効な引数で新規ファイルが作成される          | `{ success: true }`                              |
| I-05 | skill:deleteFile    | 有効な引数でファイルが削除される              | `{ success: true }`                              |
| I-06 | skill:listBackups   | 有効なスキル名でバックアップ一覧が返却される  | `{ success: true, data: BackupInfo[] }`          |
| I-07 | skill:restoreBackup | 有効な引数でバックアップから復元される        | `{ success: true }`                              |

#### 2.2 バリデーションエラーテスト

| No   | チャンネル          | テスト項目                                 | 期待結果                                               |
| ---- | ------------------- | ------------------------------------------ | ------------------------------------------------------ |
| I-08 | skill:readFile      | skillName が undefined で失敗              | `{ success: false, error: "skillName must be..." }`    |
| I-09 | skill:readFile      | skillName が空文字列で失敗                 | `{ success: false, error: "skillName must be..." }`    |
| I-10 | skill:readFile      | skillName がスペースのみで失敗（P42準拠）  | `{ success: false, error: "skillName must be..." }`    |
| I-11 | skill:readFile      | relativePath が undefined で失敗           | `{ success: false, error: "relativePath must be..." }` |
| I-12 | skill:writeFile     | content が undefined で失敗                | `{ success: false, error: "content must be..." }`      |
| I-13 | skill:restoreBackup | backupPath が空文字列で失敗                | `{ success: false, error: "backupPath must be..." }`   |
| I-14 | skill:restoreBackup | backupPath がスペースのみで失敗（P42準拠） | `{ success: false, error: "backupPath must be..." }`   |
| I-15 | 全チャンネル        | 数値型の skillName で失敗                  | `{ success: false, error: "skillName must be..." }`    |

#### 2.3 既知エラーハンドリングテスト

| No   | チャンネル       | テスト項目                                        | 期待結果                                               |
| ---- | ---------------- | ------------------------------------------------- | ------------------------------------------------------ |
| I-16 | skill:readFile   | SkillNotFoundError 時にエラーメッセージが返る     | `{ success: false, error: "Skill 'xxx' not found" }`   |
| I-17 | skill:writeFile  | ReadonlySkillError 時にエラーメッセージが返る     | `{ success: false, error: "Skill 'xxx' is readonly" }` |
| I-18 | skill:createFile | FileExistsError 時にエラーメッセージが返る        | `{ success: false, error: "File already exists..." }`  |
| I-19 | skill:deleteFile | FileNotFoundError 時にエラーメッセージが返る      | `{ success: false, error: "File not found..." }`       |
| I-20 | skill:readFile   | PathTraversalError 時にサニタイズされたメッセージ | `{ success: false, error: "Path traversal detected" }` |
| I-21 | skill:readFile   | 予期しないエラー時に "Internal error" が返る      | `{ success: false, error: "Internal error" }`          |

#### 2.4 ハンドラー登録・解除テスト

| No   | テスト項目                                            | 期待結果                            |
| ---- | ----------------------------------------------------- | ----------------------------------- |
| I-22 | registerSkillFileHandlers で6チャンネルが登録される   | ipcMain.handle が6回呼ばれる        |
| I-23 | unregisterSkillFileHandlers で6チャンネルが解除される | ipcMain.removeHandler が6回呼ばれる |

#### 2.5 セキュリティテスト

テストファイル: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.security.test.ts`

| No   | テスト項目                                          | 期待結果                                   |
| ---- | --------------------------------------------------- | ------------------------------------------ |
| S-01 | 全6チャンネルで validateIpcSender が呼ばれる        | validateIpcSender が各ハンドラーで呼ばれる |
| S-02 | 許可されたウィンドウからの呼び出しが成功する        | 正常レスポンスが返却される                 |
| S-03 | 未許可ウィンドウからの呼び出しで例外がスローされる  | Error がスローされる                       |
| S-04 | PathTraversalError の内部パス情報がサニタイズされる | レスポンスにファイルパスが含まれない       |
| S-05 | 予期しないエラーのスタックトレースが漏洩しない      | "Internal error" のみ返却される            |

#### 2.6 統合テスト

テストファイル: `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.integration.test.ts`

| No   | テスト項目                                             | 期待結果                                   |
| ---- | ------------------------------------------------------ | ------------------------------------------ |
| T-01 | readFile → writeFile → readFile のフロー               | 書き込んだ内容が読み込める                 |
| T-02 | writeFile → listBackups で自動バックアップが確認できる | バックアップ一覧に新しいエントリが含まれる |
| T-03 | writeFile → restoreBackup で元の内容に復元できる       | 復元後のファイル内容が元に戻る             |
| T-04 | createFile → deleteFile でファイルの作成・削除ができる | ファイルが作成後に削除バックアップされる   |

### Task 3: Renderer コンポーネントテスト作成

**テストファイル配置先**: `apps/desktop/src/renderer/components/skill/__tests__/`

#### 3.1 SkillEditor テスト

テストファイル: `apps/desktop/src/renderer/components/skill/__tests__/SkillEditor.test.tsx`

> **注意**: P39 準拠で `userEvent` ではなく `fireEvent` を使用する（happy-dom 環境）

| No   | テスト項目                                       | 期待結果                                       |
| ---- | ------------------------------------------------ | ---------------------------------------------- |
| C-01 | ファイルツリーにスキルのファイル一覧が表示される | SKILL.md、agents/、references/ が表示される    |
| C-02 | ファイル選択で内容がエディターに表示される       | 選択ファイルの内容がテキストエリアに表示される |
| C-03 | 未保存変更時にインジケーターが表示される         | 変更後に未保存インジケーターが表示される       |
| C-04 | 保存ボタンで writeFile が呼ばれる                | skillAPI.writeFile が正しい引数で呼ばれる      |
| C-05 | 読み取り専用スキルで編集が無効化される           | テキストエリアが disabled になる               |
| C-06 | エラー時にエラーメッセージが表示される           | エラートーストが表示される                     |

#### 3.2 SkillCodeEditor テスト

テストファイル: `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx`

| No   | テスト項目                                           | 期待結果                                 |
| ---- | ---------------------------------------------------- | ---------------------------------------- |
| C-07 | content プロパティの内容がテキストエリアに表示される | テキストエリアに渡された内容が反映される |
| C-08 | テキスト編集で onChange コールバックが呼ばれる       | onChange が編集後の内容で呼ばれる        |
| C-09 | readOnly=true でテキストエリアが編集不可になる       | テキストエリアが disabled になる         |
| C-10 | Ctrl+S / Cmd+S で onSave コールバックが呼ばれる      | onSave が呼ばれる                        |

### Task 4: Store テスト作成

**テストファイル配置先**: `apps/desktop/src/renderer/store/slices/__tests__/`

#### 4.1 skillSlice エディター状態テスト

テストファイル: `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.editor.test.ts`

> **注意**: P31 準拠で個別セレクタを使用する

| No   | テスト項目                                       | 期待結果                               |
| ---- | ------------------------------------------------ | -------------------------------------- |
| E-01 | エディター初期状態（openFile, isDirty, content） | null, false, "" が初期値               |
| E-02 | openFile アクションでファイル情報がセットされる  | openFile の引数が状態に反映される      |
| E-03 | setEditorContent でコンテンツが更新される        | content が更新され isDirty=true になる |
| E-04 | saveFile 成功で isDirty=false になる             | isDirty が false にリセットされる      |
| E-05 | closeFile でエディター状態がクリアされる         | 初期状態に戻る                         |

## テストファイル構成

```
apps/desktop/src/
├── main/
│   ├── services/skill/__tests__/
│   │   ├── SkillFileManager.test.ts          (M-01 ~ M-15)
│   │   └── SkillFileManager.security.test.ts (M-16 ~ M-20)
│   └── ipc/__tests__/
│       ├── skillFileHandlers.test.ts              (I-01 ~ I-23)
│       ├── skillFileHandlers.security.test.ts     (S-01 ~ S-05)
│       └── skillFileHandlers.integration.test.ts  (T-01 ~ T-04)
└── renderer/
    ├── components/skill/__tests__/
    │   ├── SkillEditor.test.tsx              (C-01 ~ C-06)
    │   └── SkillCodeEditor.test.tsx          (C-07 ~ C-10)
    └── store/slices/__tests__/
        └── skillSlice.editor.test.ts         (E-01 ~ E-05)
```

## 統合テスト連携【必須】

| 接続要件カテゴリ   | 記載内容                                                                      |
| ------------------ | ----------------------------------------------------------------------------- |
| IPC チャンネル契約 | 6チャンネル全てのリクエスト・レスポンス形式を T-01〜T-04 統合テストで検証     |
| セキュリティ境界   | validateIpcSender + P42準拠3段バリデーションを S-01〜S-05 で検証              |
| Renderer-Main 連携 | skillAPI → IPC → SkillFileManager のフルパス統合を T-01〜T-04 で検証          |
| Store 状態同期     | skillSlice のエディター状態がコンポーネントと同期することを E-01〜E-05 で検証 |

> **注記**: Preload 層（skill-api.ts）のテストは TASK-9A-B で完了済み。本 Phase では Renderer ↔ Main の統合に焦点を当てる。

## Pitfall 対策チェックリスト

| Pitfall ID | 対策                                                | 適用テスト  |
| ---------- | --------------------------------------------------- | ----------- |
| P31        | 個別セレクタ使用、合成Hook非依存                    | E-01 ~ E-05 |
| P39        | happy-dom環境では fireEvent 使用（userEvent 禁止）  | C-01 ~ C-10 |
| P40        | `cd apps/desktop && pnpm vitest run` で実行         | 全テスト    |
| P42        | 3段バリデーション（型→空文字列→trim空文字列）テスト | I-08 ~ I-15 |
| P41        | インライン関数のカバレッジをコールバック検証で確保  | S-01 ~ S-05 |
| P5         | リスナー二重登録テスト                              | I-22 ~ I-23 |

## 成果物

| 成果物                              | パス                                                                               | 説明                   |
| ----------------------------------- | ---------------------------------------------------------------------------------- | ---------------------- |
| SkillFileManager テスト             | `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.test.ts`          | 15テスト（M-01〜M-15） |
| SkillFileManager セキュリティテスト | `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.security.test.ts` | 5テスト（M-16〜M-20）  |
| IPC ハンドラーテスト                | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`                    | 23テスト（I-01〜I-23） |
| IPC セキュリティテスト              | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.security.test.ts`           | 5テスト（S-01〜S-05）  |
| IPC 統合テスト                      | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.integration.test.ts`        | 4テスト（T-01〜T-04）  |
| SkillEditor テスト                  | `apps/desktop/src/renderer/components/skill/__tests__/SkillEditor.test.tsx`        | 6テスト（C-01〜C-06）  |
| SkillCodeEditor テスト              | `apps/desktop/src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx`    | 4テスト（C-07〜C-10）  |
| skillSlice テスト                   | `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.editor.test.ts`       | 5テスト（E-01〜E-05）  |

**テスト総数**: 67テスト（M:20 + I:23 + S:5 + T:4 + C:10 + E:5）

## 完了条件

- [ ] 全67テストファイルが作成され、コンパイルが通る
- [ ] 全テストが Red 状態（実装前のため失敗）であることを確認
- [ ] P42準拠3段バリデーションテストが含まれている（I-08〜I-15）
- [ ] P39準拠で fireEvent を使用している（C-01〜C-10）
- [ ] P31準拠で個別セレクタを使用している（E-01〜E-05）
- [ ] モック構成が各テストファイルの beforeEach でリセットされている
- [ ] 統合テスト連携セクションの全項目がテストケースに対応している

## TDD 検証

```bash
# テスト実行（全テストが Red であることを確認）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillFileManager.test.ts
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillFileManager.security.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.security.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.integration.test.ts
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillEditor.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCodeEditor.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/skillSlice.editor.test.ts
```

## 次のPhase

Phase 5: 実装（TDD: Green）— テストを通すための最小限の実装を行う
