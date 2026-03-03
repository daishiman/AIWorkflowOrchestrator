# Phase 2: 設計 — skill:getFileTree IPC実装

## メタ情報

| 項目               | 内容                                 |
| ------------------ | ------------------------------------ |
| タスクID           | UT-UI-05A-GETFILETREE-001            |
| Phase              | 2                                    |
| タスク名           | skill:getFileTree IPC実装            |
| 機能名             | getfiletree-ipc                      |
| 作成日             | 2026-03-03                           |
| 前提Phase          | Phase 1（`phase-1-requirements.md`） |
| Issue              | #948                                 |
| 目的               | アーキテクチャ・インターフェース設計 |
| 成果物ディレクトリ | `outputs/phase-2/`                   |

## 目的

Phase 1 で定義した機能要件（FR-1〜FR-1-4）と非機能要件（NFR-1〜NFR-4）に対するアーキテクチャ設計を行う。既存の IPC パターン（skillFileHandlers.ts, skill-api.ts, channels.ts）との一貫性を保ちながら、IPC チャンネル定義・Main Process ハンドラー・SkillFileManager メソッド・Preload API・型配置を設計する。

## 実行タスク

- Task 2-1: IPC チャンネル設計 — channels.ts への1チャンネル追加とホワイトリスト更新を定義する
- Task 2-2: Main Process ハンドラー設計 — skillFileHandlers.ts への1ハンドラー追加を定義する
- Task 2-3: SkillFileManager.getFileTree メソッド設計 — ツリー構築アルゴリズムを定義する
- Task 2-4: Preload API 設計 — skill-api.ts への1メソッド追加を定義する
- Task 2-5: 型配置設計 — SkillFileTreeNode の共有化と re-export を定義する
- Task 2-6: useFileTree フック更新設計 — 型安全な呼び出しへの移行を定義する

---

### Task 2-1: IPC チャンネル設計

#### channels.ts への追加

`apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` オブジェクトに以下の1定数を追加する。配置位置は既存の `// Skill file operations (TASK-9A-B)` セクションの直後とする。

```typescript
// Skill file tree operation (UT-UI-05A-GETFILETREE-001)
SKILL_GET_FILE_TREE: "skill:getFileTree",
```

#### チャンネル定義テーブル

| 定数名                | チャンネル文字列    | 方向            | パターン      |
| --------------------- | ------------------- | --------------- | ------------- |
| `SKILL_GET_FILE_TREE` | `skill:getFileTree` | Renderer → Main | invoke/handle |

#### ALLOWED_INVOKE_CHANNELS への追加

```typescript
// Skill file tree channel (UT-UI-05A-GETFILETREE-001)
IPC_CHANNELS.SKILL_GET_FILE_TREE,
```

配置位置: `ALLOWED_INVOKE_CHANNELS` 配列の `// Skill file operations (TASK-9A-B)` セクション（`IPC_CHANNELS.SKILL_RESTORE_BACKUP` の直後）。

**注意**: invoke/handle パターンであるため、`ALLOWED_ON_CHANNELS` への追加は不要。

---

### Task 2-2: Main Process ハンドラー設計

#### ファイル配置

ハンドラーは既存の `apps/desktop/src/main/ipc/skillFileHandlers.ts` に追加する。`registerSkillFileHandlers()` 関数内に `skill:getFileTree` ハンドラーを追加し、`unregisterSkillFileHandlers()` にも解除処理を追加する。

#### ハンドラー設計

```typescript
// skill:getFileTree
ipcMain.handle(
  IPC_CHANNELS.SKILL_GET_FILE_TREE,
  async (event: IpcMainInvokeEvent, args: { skillName: string }) => {
    // 1. 送信元検証
    const validation = validateIpcSender(
      event,
      IPC_CHANNELS.SKILL_GET_FILE_TREE,
      { getAllowedWindows: () => [mainWindow] },
    );
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // 2. P42準拠3段バリデーション
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      return {
        success: false,
        error: "skillName must be a non-empty string",
      };
    }

    // 3. SkillFileManager に委譲
    try {
      const tree = await skillFileManager.getFileTree(args.skillName);
      return { success: true, data: tree };
    } catch (error) {
      if (isKnownSkillFileError(error)) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Internal error" };
    }
  },
);
```

#### ハンドラー設計テーブル

| 項目                | 内容                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------- |
| チャンネル          | `IPC_CHANNELS.SKILL_GET_FILE_TREE`                                                    |
| 引数型              | `{ skillName: string }`                                                               |
| レスポンス型        | `{ success: true, data: SkillFileTreeNode[] }` or `{ success: false, error: string }` |
| セキュリティ Layer1 | `validateIpcSender()` — 送信元ウィンドウ検証                                          |
| セキュリティ Layer2 | P42 準拠 3段バリデーション — `typeof` → `=== ""` → `.trim() === ""`                   |
| セキュリティ Layer3 | `SkillFileManager.findSkillDir()` — パストラバーサル防止                              |
| エラーサニタイズ    | `isKnownSkillFileError()` → message 返却、未知 → "Internal error"                     |

#### unregisterSkillFileHandlers() への追加

```typescript
ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_FILE_TREE);
```

---

### Task 2-3: SkillFileManager.getFileTree メソッド設計

#### メソッドシグネチャ

```typescript
/**
 * スキルのファイルツリーを取得する
 * @param skillName - スキル名
 * @returns ツリー構造のファイルノード配列
 * @throws {SkillNotFoundError} スキルが見つからない場合
 */
async getFileTree(skillName: string): Promise<SkillFileTreeNode[]> {
  const skillDir = await this.findSkillDir(skillName);
  return this.buildTree(skillDir.path, skillDir.path);
}
```

#### buildTree プライベートメソッド設計

```typescript
/**
 * ディレクトリを再帰走査してツリー構造を構築する
 * @param dir - 走査対象ディレクトリの絶対パス
 * @param basePath - スキルディレクトリのルート絶対パス（相対パス算出用）
 * @returns SkillFileTreeNode の配列
 */
private async buildTree(
  dir: string,
  basePath: string,
): Promise<SkillFileTreeNode[]> {
  const nodes: SkillFileTreeNode[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      // バックアップファイルを除外
      if (BACKUP_PATTERN.test(entry.name)) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(basePath, fullPath)
        .split(path.sep)
        .join("/");  // POSIX形式に変換

      if (entry.isDirectory()) {
        const children = await this.buildTree(fullPath, basePath);
        nodes.push({
          name: entry.name,
          path: relativePath,
          type: "directory",
          children,
        });
      } else if (entry.isFile()) {
        nodes.push({
          name: entry.name,
          path: relativePath,
          type: "file",
        });
      }
    }
  } catch {
    // ディレクトリが存在しない場合は空配列
  }

  // ソート: ディレクトリを先、次にファイル。同じ種類内ではアルファベット順
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}
```

#### アルゴリズムフロー

```
getFileTree(skillName)
  ├─ findSkillDir(skillName)       // 既存メソッド再利用
  │   ├─ ~/.aiworkflow/skills/{skillName} を検索
  │   └─ ~/.claude/skills/{skillName} を検索
  └─ buildTree(skillDir, skillDir)  // 新規プライベートメソッド
      ├─ fs.readdir(dir, { withFileTypes: true })
      ├─ BACKUP_PATTERN でバックアップファイルを除外
      ├─ entry.isDirectory() → 再帰呼出し → children 付きノード作成
      ├─ entry.isFile() → ファイルノード作成
      └─ ソート（directory優先 → name昇順）
```

#### 既存メソッドとの差異

| 比較項目         | listSkillFiles（既存）                 | getFileTree（新規）                 |
| ---------------- | -------------------------------------- | ----------------------------------- |
| 戻り値           | `string[]`（フラットな相対パス配列）   | `SkillFileTreeNode[]`（ツリー構造） |
| ディレクトリ     | ファイルのみ（ディレクトリは含まない） | ディレクトリノードも含む            |
| 再帰走査         | `walkDir()` → フラット化               | `buildTree()` → ツリー構築          |
| バックアップ除外 | `BACKUP_PATTERN` でフィルタ            | `BACKUP_PATTERN` でフィルタ（同一） |
| ソート           | `localeCompare` のアルファベット順     | ディレクトリ優先 + `localeCompare`  |
| パス形式         | POSIX（`/` 区切り）                    | POSIX（`/` 区切り）（同一）         |

---

### Task 2-4: Preload API 設計

#### SkillAPI インターフェースへの追加

`apps/desktop/src/preload/skill-api.ts` の `SkillAPI` インターフェースに以下を追加する。配置位置は `// === Skill File Operations (TASK-9A-B) ===` セクション内、`restoreBackup` の直後。

```typescript
/** スキルのファイルツリーを取得する (UT-UI-05A-GETFILETREE-001) */
getFileTree: (skillName: string) => Promise<SkillFileTreeNode[]>;
```

#### 実装への追加

`skillAPI` オブジェクトに以下を追加する。

```typescript
getFileTree: (skillName: string): Promise<SkillFileTreeNode[]> =>
  safeInvokeUnwrap<SkillFileTreeNode[]>(
    IPC_CHANNELS.SKILL_GET_FILE_TREE,
    { skillName },
  ),
```

#### IPC 呼び出しフロー

```
Renderer (useFileTree)
  → window.electronAPI.skill.getFileTree(skillName)
    → safeInvokeUnwrap<SkillFileTreeNode[]>(SKILL_GET_FILE_TREE, { skillName })
      → ipcRenderer.invoke("skill:getFileTree", { skillName })
        → Main Process handler
          → validateIpcSender()
          → P42 3段バリデーション
          → skillFileManager.getFileTree(skillName)
            → findSkillDir() → buildTree()
          → { success: true, data: SkillFileTreeNode[] }
        ← safeInvokeUnwrap が data を展開
      ← SkillFileTreeNode[]
    ← SkillFileTreeNode[]
  ← setFileTree(tree)
```

---

### Task 2-5: 型配置設計

#### SkillFileTreeNode 型の移動

**現在の配置:**

```
apps/desktop/src/renderer/views/SkillEditorView/types.ts
```

**移動先:**

```
packages/shared/src/types/skill-file.ts
```

#### 移動手順

1. `packages/shared/src/types/skill-file.ts` に `SkillFileTreeNode` インターフェースを定義する
2. `packages/shared/src/index.ts`（または `types/index.ts`）から re-export する
3. `apps/desktop/src/renderer/views/SkillEditorView/types.ts` を更新し、`@repo/shared` から re-export する（後方互換性のため）
4. `apps/desktop/src/main/services/skill/SkillFileManager.ts` から `@repo/shared` の型をインポートする
5. `apps/desktop/src/preload/skill-api.ts` から `@repo/shared` の型をインポートする

#### 型定義

```typescript
// packages/shared/src/types/skill-file.ts

/**
 * ファイルツリーのノード型
 *
 * スキルディレクトリのファイル構造をツリー形式で表現する。
 * ディレクトリノードは children フィールドに子ノードを持つ。
 */
export interface SkillFileTreeNode {
  /** ファイル名またはディレクトリ名 */
  name: string;
  /** スキルディレクトリからの相対パス（POSIX形式: / 区切り） */
  path: string;
  /** ノードの種別 */
  type: "file" | "directory";
  /** 子ノード（type === "directory" の場合のみ存在） */
  children?: SkillFileTreeNode[];
}
```

#### 後方互換性

`apps/desktop/src/renderer/views/SkillEditorView/types.ts` を以下のように更新する:

```typescript
// 後方互換性のため @repo/shared から re-export
export type { SkillFileTreeNode } from "@repo/shared";
```

これにより、既存の `import { SkillFileTreeNode } from "../types"` を使用している箇所が壊れない。

#### P32 準拠確認

本タスクでは P32（型定義の二箇所同時更新必須）のリスクは低い。理由: `SkillFileTreeNode` は1箇所（`@repo/shared`）で定義し、他は re-export で参照するため。ただし、以下の2ファイルが re-export していることを確認する:

1. `packages/shared/src/types/skill-file.ts` — 正本
2. `apps/desktop/src/renderer/views/SkillEditorView/types.ts` — re-export

---

### Task 2-6: useFileTree フック更新設計

#### 現状の問題

`apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` では、`skill:getFileTree` が未実装のため `as` キャストで型を回避している（29-47行目）。

#### 更新後の設計

```typescript
const refreshTree = useCallback(async () => {
  if (!skillName) return;
  setIsLoading(true);
  setError(null);
  try {
    const tree = await window.electronAPI.skill.getFileTree(skillName);
    setFileTree(tree);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "ファイルツリーの読み込みに失敗しました",
    );
    setFileTree([]);
  } finally {
    setIsLoading(false);
  }
}, [skillName]);
```

#### 変更点

| 変更前                                                               | 変更後                                                            |
| -------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `as` キャストで `getFileTree` 関数を取得                             | `window.electronAPI.skill.getFileTree` を型安全に呼び出し         |
| `typeof getFileTree !== "function"` の実行時チェック                 | 削除（型定義で保証されるため不要）                                |
| `{ tree: [...] }` 形式と直接配列形式の両方に対応                     | `SkillFileTreeNode[]` を直接受け取る（`safeInvokeUnwrap` が展開） |
| フォールバックエラー: "ファイルツリーの取得はまだ実装されていません" | 削除（実装済みのため不要）                                        |

---

## SubAgent 分担テーブル

| SubAgent     | 担当領域                                 | 対象ファイル       |
| ------------ | ---------------------------------------- | ------------------ |
| IPC設計      | channels.ts + skillFileHandlers.ts       | Task 2-1, Task 2-2 |
| サービス設計 | SkillFileManager.getFileTree + buildTree | Task 2-3           |
| 型定義設計   | SkillFileTreeNode 共有化 + re-export     | Task 2-5           |
| Preload設計  | skill-api.ts + SkillAPI インターフェース | Task 2-4           |
| フック設計   | useFileTree 更新                         | Task 2-6           |

## 参照資料

| 資料名                   | パス                                                                                             | 参照目的                           |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Phase 1 要件定義         | `docs/30-workflows/completed-tasks/getfiletree-ipc/phase-1-requirements.md`                      | FR/NFR/AC 確認                     |
| 既存 IPC ハンドラー      | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                                                 | 実装パターン参照                   |
| 既存 Preload API         | `apps/desktop/src/preload/skill-api.ts`                                                          | API パターン参照                   |
| チャンネル定義           | `apps/desktop/src/preload/channels.ts`                                                           | チャンネル追加位置確認             |
| SkillFileManager 実装    | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                                       | walkDir パターン参照               |
| useFileTree フック       | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts`                           | 現状コード確認                     |
| IPC API仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                             | `skill:getFileTree` 契約の正本確認 |
| Agent SDK 型仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                | 共有型・Preload API 契約確認       |
| Preload セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                     | contextBridge 制約確認             |
| Electron サービス層      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                    | Main 側責務境界確認                |
| IPC 契約チェックリスト   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                    | 契約整合性確認                     |
| 抽出マトリクス           | `docs/30-workflows/completed-tasks/getfiletree-ipc/aiworkflow-requirements-extraction-matrix.md` | 抽出根拠の固定化                   |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                             | P42, P44, P45 準拠                 |

## aiworkflow仕様抽出トレーサビリティ

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:getFileTree" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "api-ipc-agent" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "arch-electron-services" -C 2
```

## 実行手順

1. Task 2-1: channels.ts へのチャンネル追加位置と定数名を確定する
2. Task 2-2: skillFileHandlers.ts へのハンドラー追加を設計する
3. Task 2-3: SkillFileManager.getFileTree + buildTree のアルゴリズムを設計する
4. Task 2-4: skill-api.ts への Preload API メソッドを設計する
5. Task 2-5: SkillFileTreeNode 型の共有化と re-export 戦略を設計する
6. Task 2-6: useFileTree フックの更新箇所を設計する
7. 設計内容を `outputs/phase-2/design.md` に出力する

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 2 の定義/成果物と api-ipc-agent.md を照合する          |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物               | パス                                  |
| -------------------- | ------------------------------------- |
| 設計書               | `outputs/phase-2/design.md`           |
| インターフェース設計 | `outputs/phase-2/interface-design.md` |

## 完了条件

- [ ] Task 2-1: IPC チャンネル定数名・値・配置位置が確定している
- [ ] Task 2-1: ALLOWED_INVOKE_CHANNELS への追加位置が確定している
- [ ] Task 2-2: ハンドラーの多層防御設計（validateIpcSender → P42バリデーション → SkillFileManager委譲）が確定している
- [ ] Task 2-2: unregisterSkillFileHandlers() への解除処理が確定している
- [ ] Task 2-3: getFileTree メソッドのシグネチャが確定している
- [ ] Task 2-3: buildTree メソッドの再帰アルゴリズム（バックアップ除外・ソート・POSIX形式パス）が確定している
- [ ] Task 2-4: SkillAPI インターフェースへのメソッド追加が確定している
- [ ] Task 2-4: safeInvokeUnwrap の型パラメータと引数形式が確定している
- [ ] Task 2-5: SkillFileTreeNode の配置先（`@repo/shared`）が確定している
- [ ] Task 2-5: 後方互換性のための re-export 戦略が確定している
- [ ] Task 2-6: useFileTree の `as` キャスト除去と型安全呼び出しへの移行が設計されている
- [ ] 全設計が Phase 1 の FR/NFR/AC を満たしている
- [ ] 曖昧表現（「仕様に沿って」「要件化された場合は」）が使用されていない

## 次Phase

Phase 3（設計レビュー）へ進む。
