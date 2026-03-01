# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 値                       |
| -------- | ------------------------ |
| Phase    | 5                        |
| 機能名   | TASK-9E-skill-fork       |
| タスク名 | スキルフォーク・派生機能 |
| 作成日   | 2026-02-28               |
| 前Phase  | Phase 4: テスト作成      |
| 次Phase  | Phase 6: テスト拡充      |

## 目的

Phase 4 で作成したテストを全て通すための最小限の実装を行い、Green状態（テスト成功）を達成する。

## 実行タスク

- 型定義実装: `packages/shared/src/types/skill-fork.ts` に SkillForkOptions / SkillForkResult / SkillForkMetadata インターフェースを定義する
- SkillForker サービス実装: `apps/desktop/src/main/services/skill/SkillForker.ts` に fork / modifySkillMd / copyDirectory / writeForkMetadata メソッドを実装する
- IPC ハンドラ実装: `apps/desktop/src/main/ipc/skillHandlers.ts` に skill:fork ハンドラを追加する
- Preload 層実装: `channels.ts` / `skill-api.ts` / `types.ts` にフォーク API を追加する

## 参照資料

| 資料名             | パス                                                                 | 説明                     |
| ------------------ | -------------------------------------------------------------------- | ------------------------ |
| Phase 4 テスト     | `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts` | テストファースト成果物   |
| Phase 4 IPC テスト | `apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts`     | IPC テスト成果物         |
| 既存 IPC ハンドラ  | `apps/desktop/src/main/ipc/skillHandlers.ts`                         | 既存実装パターン参照     |
| channels 定数      | `apps/desktop/src/preload/channels.ts`                               | IPC チャネル定義         |
| skill-api          | `apps/desktop/src/preload/skill-api.ts`                              | Preload API 実装パターン |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                 | Pitfall対策リスト        |

## 実行手順

### ステップ1: 型定義実装

#### 1-1. `packages/shared/src/types/skill-fork.ts` 作成

```typescript
export interface SkillForkOptions {
  sourceSkill: string;
  newName: string;
  description?: string;
  copyAgents: boolean;
  copyReferences: boolean;
  copyScripts: boolean;
  copyAssets: boolean;
  modifyAllowedTools?: string[];
}

export interface SkillForkResult {
  success: boolean;
  newSkillPath: string;
  copiedFiles: string[];
  warnings?: string[];
}

export interface SkillForkMetadata {
  forkedFrom: string;
  forkedAt: string; // ISO 8601
  originalDescription?: string;
}
```

#### 1-2. `packages/shared/src/types/index.ts` から re-export

```typescript
export type {
  SkillForkOptions,
  SkillForkResult,
  SkillForkMetadata,
} from "./skill-fork";
```

### ステップ2: SkillForker サービス実装

`apps/desktop/src/main/services/skill/SkillForker.ts` を作成する。

#### 2-1. fork() メソッド

処理フロー:

1. ソーススキルの存在確認（`SkillFileManager` 経由でスキルディレクトリのパスを解決）
2. 同名スキルの重複チェック（`newName` が既存スキル名と衝突しないか確認）
3. 新しいスキルディレクトリを作成
4. SKILL.md をコピーし、`modifySkillMd()` で名前・説明を更新
5. `copyAgents` / `copyReferences` / `copyScripts` / `copyAssets` フラグに応じてサブディレクトリをコピー
6. `writeForkMetadata()` でフォークメタデータを記録
7. `SkillForkResult` を返却

#### 2-2. modifySkillMd() メソッド

- SKILL.md のコンテンツ文字列を受け取り、name フィールドを `newName` に置換する
- `description` が指定されている場合、description フィールドを更新する
- `modifyAllowedTools` が指定されている場合、allowedTools セクションを更新する
- 更新後のコンテンツ文字列を返す

#### 2-3. copyDirectory() メソッド

- `src` ディレクトリから `dest` ディレクトリへ、指定された `subDir` を再帰的にコピーする
- コピーしたファイルの相対パス一覧を `string[]` で返す
- ソースにサブディレクトリが存在しない場合は空配列を返す（エラーにしない）

#### 2-4. writeForkMetadata() メソッド

- `destPath` 配下に `fork-metadata.json` を作成する
- `SkillForkMetadata` オブジェクトを JSON 形式で書き込む
- `forkedAt` は `new Date().toISOString()` で ISO 8601 形式のタイムスタンプを生成する

### ステップ3: IPC ハンドラ実装

`apps/desktop/src/main/ipc/skillHandlers.ts` に以下を追加する。

#### 3-1. skill:fork ハンドラ

- チャネル名: `IPC_CHANNELS.SKILL_FORK`（`"skill:fork"` を新規追加）
- P42 準拠3段バリデーション:
  1. `sourceSkill` の型チェック（`typeof !== "string"`）
  2. `sourceSkill` の空文字列チェック（`=== ""`）
  3. `sourceSkill` のトリム空文字列チェック（`.trim() === ""`）
  4. `newName` に対しても同様の3段バリデーション
- `validateIpcSender()` による送信元ウィンドウ検証
- `SkillForker.fork()` を呼び出し、結果を返却
- エラー時は `sanitizeErrorMessage()` でサニタイズしてからレスポンスする

#### 3-2. IPC引数形式

```typescript
// Preload側から送信される引数形式
interface SkillForkIpcArgs {
  sourceSkill: string;
  newName: string;
  description?: string;
  copyAgents: boolean;
  copyReferences: boolean;
  copyScripts: boolean;
  copyAssets: boolean;
  modifyAllowedTools?: string[];
}
```

**重要（P44/P45対策）**: Preload 側の `safeInvoke` で送信するオブジェクト形式と、Main Process ハンドラの引数形式を完全に一致させる。引数名のセマンティクスが実際の値と一致することを確認する。

### ステップ4: Preload 層実装

#### 4-1. `channels.ts`

`SKILL_FORK` を新規定義（`"skill:fork"`）し、`ALLOWED_INVOKE_CHANNELS` に追加する。

#### 4-2. `skill-api.ts` に forkSkill() メソッド追加

```typescript
// SkillAPI インターフェースに追加
forkSkill: (options: SkillForkOptions) => Promise<SkillForkResult>;

// 実装
forkSkill: (options: SkillForkOptions): Promise<SkillForkResult> =>
  safeInvokeUnwrap<SkillForkResult>(IPC_CHANNELS.SKILL_FORK, options),
```

#### 4-3. `types.ts` に型定義追加

`SkillForkOptions` と `SkillForkResult` は `@repo/shared` から import する。Preload 固有の型定義が必要な場合のみ `types.ts` に追加する。

## IPC シリアライズ方針

- `SkillForkMetadata.forkedAt` は ISO 8601 文字列（`string`）として送受信する
- `Date` オブジェクトは IPC シリアライズ時に失われるため、生成時点で文字列に変換する
- `SkillForkResult.copiedFiles` は `string[]` のため、シリアライズの問題はない

## 統合テスト連携【必須】

| 実装項目           | 内容                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| IPC接続            | skill:fork チャネル経由でフォークリクエストを送信・レスポンスを受信    |
| エラーハンドリング | FS エラー、バリデーションエラーをサニタイズしてレスポンス              |
| データフロー       | SkillForkOptions → SkillForker.fork() → SkillForkResult の一方向フロー |

## アーキテクチャ層別実装

| 層           | 実装観点                                                      | 実装ファイル配置                                      | 仕様参照先                             |
| ------------ | ------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------- |
| Main Process | SkillForker サービス                                          | `apps/desktop/src/main/services/skill/SkillForker.ts` | `architecture-*.md`                    |
| IPC通信      | skill:fork ハンドラ（バリデーション・セキュリティ付き）       | `apps/desktop/src/main/ipc/skillHandlers.ts`          | `api-*.md`, `security-electron-ipc.md` |
| Preload      | forkSkill() メソッド（safeInvoke使用）                        | `apps/desktop/src/preload/skill-api.ts`               | `security-api-electron.md`             |
| Shared       | SkillForkOptions / SkillForkResult / SkillForkMetadata 型定義 | `packages/shared/src/types/skill-fork.ts`             | -                                      |

## 設計変更記録（該当する場合）

実装中に Phase 2 の設計から乖離が発生した場合、以下を記録する:

- [ ] 乖離内容と理由を `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-5/implementation-summary.md` に記録
- [ ] Phase 2 設計書への影響を評価し、Phase 10 レビューで検証できるようにする

## 実装時の注意事項（既知のPitfall対策）

| Pitfall ID | 注意事項                                        | 対策                                                                                 |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| P42        | 文字列引数の .trim() バリデーション漏れ         | 全文字列引数に3段バリデーション（型→空文字列→トリム空文字列）を適用                  |
| P44        | IPC ハンドラと Preload のインターフェース不整合 | ハンドラ引数形式と Preload 側の `safeInvoke` 引数形式を完全一致させる                |
| P45        | IPC 引数命名の契約ドリフト                      | 引数名のセマンティクスが実際の値と一致することを確認                                 |
| P5         | リスナー二重登録                                | `ipcMain.handle()` は二重登録で例外を送出するため登録順序を確認                      |
| P32        | 型定義の二箇所同時更新必須                      | `packages/shared/src/types/` と `apps/desktop/src/preload/skill-api.ts` を同時に更新 |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                         |
| ------------------ | -------- | ---------------------------------------------------------------- |
| セキュリティ       | 適用     | validateIpcSender による送信元検証、パストラバーサル防止         |
| エラーハンドリング | 適用     | sanitizeErrorMessage でエラーメッセージをサニタイズ              |
| アーキテクチャ     | 適用     | Main Process 層にサービスを配置、Renderer から直接アクセスしない |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 確認内容                            |
| -------------------- | -------- | ----------------------------------- |
| バックエンド（Main） | 適用     | SkillForker サービスの実装、FS 操作 |
| IPC通信              | 適用     | skill:fork チャネルの実装           |
| Preload/セキュリティ | 適用     | safeInvoke による安全な API 公開    |

## 成果物

| 成果物               | パス                                                  | 説明                                                   |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| 型定義               | `packages/shared/src/types/skill-fork.ts`             | SkillForkOptions / SkillForkResult / SkillForkMetadata |
| 型定義 re-export     | `packages/shared/src/types/index.ts`                  | re-export 追加                                         |
| SkillForker サービス | `apps/desktop/src/main/services/skill/SkillForker.ts` | fork 機能の実装                                        |
| IPC ハンドラ更新     | `apps/desktop/src/main/ipc/skillHandlers.ts`          | skill:fork ハンドラ追加                                |
| Preload API 更新     | `apps/desktop/src/preload/skill-api.ts`               | forkSkill() メソッド追加                               |
| Preload 型定義更新   | `apps/desktop/src/preload/skill-api.ts`               | forkSkill 型定義追加                                   |

## TDD検証

```bash
# テスト実行コマンド（apps/desktop ディレクトリから実行 — P40対策）
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillForker.test.ts
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.fork.test.ts

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
# - [ ] Phase 4 で作成した全テストケースが PASS している
```

## 完了条件

- [ ] `packages/shared/src/types/skill-fork.ts` に SkillForkOptions / SkillForkResult / SkillForkMetadata が定義されている
- [ ] `packages/shared/src/types/index.ts` から re-export されている
- [ ] `apps/desktop/src/main/services/skill/SkillForker.ts` が実装されている
- [ ] `apps/desktop/src/main/ipc/skillHandlers.ts` に skill:fork ハンドラが追加されている
- [ ] `apps/desktop/src/preload/skill-api.ts` に forkSkill() メソッドが追加されている
- [ ] すべてのテストが成功状態（Green）
- [ ] P42準拠3段バリデーションが IPC ハンドラに実装されている
- [ ] validateIpcSender による送信元検証が実装されている
- [ ] Preload 側の引数形式と Main Process ハンドラの引数形式が完全に一致している（P44/P45対策）
- [ ] **設計書（Phase 2 成果物）から意図的に変更した箇所がある場合、変更理由を Phase 5 成果物に記録し、Phase 2 成果物も更新している**
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 4 テスト、既存 IPC ハンドラ構造）
2. 型定義実装（`skill-fork.ts` 作成、`index.ts` re-export）
3. SkillForker サービス実装（fork / modifySkillMd / copyDirectory / writeForkMetadata）
4. IPC ハンドラ実装（バリデーション・セキュリティ付き）
5. Preload 層実装（forkSkill() メソッド追加）
6. Green 状態の確認（全テスト PASS）
7. 成果物の配置と完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork --phase 5
```

## 次のPhase

Phase 6: テスト拡充
