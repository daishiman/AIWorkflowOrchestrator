# Phase 1: 要件定義 — skill:getFileTree IPC実装

## メタ情報

| 項目               | 内容                                                                |
| ------------------ | ------------------------------------------------------------------- |
| タスクID           | UT-UI-05A-GETFILETREE-001                                           |
| Phase              | 1                                                                   |
| タスク名           | skill:getFileTree IPC実装                                           |
| 機能名             | getfiletree-ipc                                                     |
| 作成日             | 2026-03-03                                                          |
| 前提Phase          | なし                                                                |
| Issue              | #948                                                                |
| 優先度             | 高                                                                  |
| 規模               | 小規模                                                              |
| 依存               | TASK-9A-A（SkillFileManager、完了済）、TASK-9A-B（IPC統合、完了済） |
| ブロック           | SkillEditorView の useFileTree フック（型安全な呼び出し）           |
| 目的               | ユーザー要求から要件抽出・受入基準定義                              |
| 成果物ディレクトリ | `outputs/phase-1/`                                                  |

## 目的

SkillEditorView は `useFileTree` フックで `skill:getFileTree` IPC 呼び出しを前提に設計されているが、Main/Preload の契約実装が不足している。本 Phase では `skill:getFileTree` IPC チャンネルの機能要件・非機能要件・受入基準を定義し、Phase 2（設計）以降の基盤を確立する。

## 実行タスク

- Task 1-1: 機能要件の定義 — skill:getFileTree チャンネルの入出力仕様を確定する
- Task 1-2: 非機能要件の定義 — セキュリティ・型安全性・パフォーマンスの要件を確定する
- Task 1-3: 受入基準の策定 — 各 FR/NFR に対するテスト可能な検証条件を確定する
- Task 1-4: スコープの確認 — 実施対象と非対象を明文化する

---

### Task 1-1: 機能要件（FR）

#### FR-1: ファイルツリー取得 IPC（skill:getFileTree）

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| チャンネル | `skill:getFileTree`                                       |
| 方向       | Renderer → Main（invoke/handle）                          |
| 引数       | `{ skillName: string }`                                   |
| 成功時戻値 | `{ success: true, data: SkillFileTreeNode[] }`            |
| 失敗時戻値 | `{ success: false, error: string }`                       |
| 委譲先     | `SkillFileManager.getFileTree(skillName)`（新規メソッド） |
| エラー条件 | SkillNotFoundError（スキルが見つからない場合）            |

#### FR-1-1: SkillFileManager.getFileTree メソッド

| 項目       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| メソッド名 | `getFileTree(skillName: string): Promise<SkillFileTreeNode[]>`                  |
| 配置先     | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                      |
| 入力       | `skillName` — スキル名                                                          |
| 出力       | ディレクトリ構造を再帰的に表現した `SkillFileTreeNode[]`                        |
| 動作仕様   | 1. `findSkillDir(skillName)` でスキルディレクトリを解決する                     |
|            | 2. ディレクトリを再帰走査し、ツリー構造の `SkillFileTreeNode[]` を構築する      |
|            | 3. バックアップファイル（`.backup.*`, `.deleted.*`）をフィルタリングで除外する  |
|            | 4. 各ノードの `path` はスキルディレクトリからの相対パスとする                   |
|            | 5. ディレクトリノードは `children` フィールドに子ノードを含む                   |
|            | 6. ファイル名でアルファベット順ソートし、ディレクトリをファイルより先に配置する |

#### FR-1-2: SkillFileTreeNode 型定義の共有化

| 項目     | 内容                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 現在位置 | `apps/desktop/src/renderer/views/SkillEditorView/types.ts`                                                                 |
| 移動先   | `packages/shared/src/types/skill-file.ts`（または既存の skill 型ファイル）                                                 |
| 理由     | Main Process（SkillFileManager）と Renderer（useFileTree）の両方で同一型を参照するため、共有パッケージに配置する必要がある |
| 型定義   | 下記参照                                                                                                                   |

```typescript
export interface SkillFileTreeNode {
  name: string; // ファイル名またはディレクトリ名
  path: string; // スキルディレクトリからの相対パス（POSIX形式: / 区切り）
  type: "file" | "directory";
  children?: SkillFileTreeNode[]; // type === "directory" の場合のみ存在
}
```

#### FR-1-3: Preload API メソッド追加

| 項目             | 内容                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| インターフェース | `SkillAPI` に `getFileTree` メソッドを追加                                               |
| シグネチャ       | `getFileTree(skillName: string): Promise<SkillFileTreeNode[]>`                           |
| 実装             | `safeInvokeUnwrap<SkillFileTreeNode[]>(IPC_CHANNELS.SKILL_GET_FILE_TREE, { skillName })` |

#### FR-1-4: IPC チャンネル定義

| 項目                  | 内容                                                     |
| --------------------- | -------------------------------------------------------- |
| 定数名                | `SKILL_GET_FILE_TREE`                                    |
| 値                    | `"skill:getFileTree"`                                    |
| 配置先                | `apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` |
| ホワイトリスト        | `ALLOWED_INVOKE_CHANNELS` に追加                         |
| `ALLOWED_ON_CHANNELS` | 追加不要（invoke/handle パターンのため）                 |

---

### Task 1-2: 非機能要件（NFR）

#### NFR-1: セキュリティ

| ID        | 要件                                                                                         |
| --------- | -------------------------------------------------------------------------------------------- |
| NFR-SEC-1 | `validateIpcSender()` で送信元ウィンドウを検証する                                           |
| NFR-SEC-2 | `skillName` に P42 準拠3段バリデーションを適用する（型チェック → 空文字列 → トリム空文字列） |
| NFR-SEC-3 | SkillFileManager 内部の `findSkillDir()` でパストラバーサルを防止する                        |
| NFR-SEC-4 | 未知エラーは "Internal error" に置換し、内部情報を漏洩しない                                 |
| NFR-SEC-5 | チャンネル名は `IPC_CHANNELS` 定数で参照し、文字列リテラルを使用しない                       |

#### NFR-2: 型安全性

| ID        | 要件                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| NFR-TYP-1 | `any` 型を使用しない                                                             |
| NFR-TYP-2 | `SkillFileTreeNode` 型を `@repo/shared` に配置し、Main/Renderer から共有する     |
| NFR-TYP-3 | IPC レスポンスは `{ success: boolean, data?: T, error?: string }` 形式を踏襲する |
| NFR-TYP-4 | Preload API は `safeInvokeUnwrap<T>()` で IPC レスポンスラッパーを展開する       |

#### NFR-3: パフォーマンス

| ID         | 要件                                                               |
| ---------- | ------------------------------------------------------------------ |
| NFR-PERF-1 | ファイル数 100 以下のスキルディレクトリでは 500ms 以内に応答する   |
| NFR-PERF-2 | バックアップファイルをフィルタリングし、不要なデータ転送を抑制する |

#### NFR-4: 既存パターンとの一貫性

| ID        | 要件                                                                       |
| --------- | -------------------------------------------------------------------------- |
| NFR-CON-1 | `skillFileHandlers.ts` の既存ハンドラーと同一の多層防御パターンを踏襲する  |
| NFR-CON-2 | `isKnownSkillFileError()` による既知エラー判定を再利用する                 |
| NFR-CON-3 | `registerSkillFileHandlers()` / `unregisterSkillFileHandlers()` に統合する |

---

### Task 1-3: 受入基準（AC）

#### AC-1: 正常系

| ID    | 検証条件                                                                                   |
| ----- | ------------------------------------------------------------------------------------------ |
| AC-01 | `skill:getFileTree` に有効な `skillName` を渡すと `{ success: true, data: [...] }` が返る  |
| AC-02 | 返却されたツリーにファイルノード（`type: "file"`）が含まれる                               |
| AC-03 | 返却されたツリーにディレクトリノード（`type: "directory"`、`children` 配列付き）が含まれる |
| AC-04 | 各ノードの `path` がスキルディレクトリからの POSIX 形式相対パスである                      |
| AC-05 | バックアップファイル（`.backup.*`, `.deleted.*`）がツリーに含まれない                      |
| AC-06 | ディレクトリ内のノードがアルファベット順（ディレクトリ優先）でソートされている             |

#### AC-2: 異常系

| ID    | 検証条件                                                                 |
| ----- | ------------------------------------------------------------------------ |
| AC-07 | 存在しないスキル名を渡すと `{ success: false, error: "..." }` が返る     |
| AC-08 | `skillName` が空文字列の場合、バリデーションエラーが返る                 |
| AC-09 | `skillName` がスペースのみの場合、バリデーションエラーが返る（P42 準拠） |
| AC-10 | `skillName` が `string` 型以外の場合、バリデーションエラーが返る         |

#### AC-3: セキュリティ

| ID    | 検証条件                                         |
| ----- | ------------------------------------------------ |
| AC-11 | 不正な送信元ウィンドウからの呼び出しが拒否される |
| AC-12 | エラーメッセージに内部パス情報が含まれない       |

#### AC-4: 型安全性

| ID    | 検証条件                                                             |
| ----- | -------------------------------------------------------------------- |
| AC-13 | `SkillFileTreeNode` が `@repo/shared` からインポート可能である       |
| AC-14 | Preload API の `getFileTree` メソッドが `SkillFileTreeNode[]` を返す |

---

### Task 1-4: スコープ確認

#### 含む

| 対象                      | 詳細                                                                 |
| ------------------------- | -------------------------------------------------------------------- |
| IPC チャンネル定義        | `channels.ts` に `SKILL_GET_FILE_TREE` を追加                        |
| Main Process ハンドラー   | `skillFileHandlers.ts` に `skill:getFileTree` ハンドラーを追加       |
| SkillFileManager メソッド | `getFileTree(skillName)` メソッドを新規追加                          |
| Preload API               | `skill-api.ts` の `SkillAPI` インターフェースに `getFileTree` を追加 |
| 共有型定義                | `SkillFileTreeNode` を `@repo/shared` に移動                         |
| ユニットテスト            | ハンドラー・サービスメソッド・Preload API のテスト                   |
| useFileTree フック更新    | 型安全な呼び出しへの移行                                             |

#### 含まない

| 対象                       | 理由                                                               |
| -------------------------- | ------------------------------------------------------------------ |
| キーボードナビゲーション   | UI タスクのスコープ（別タスク）                                    |
| モバイルドロワー UI        | UI タスクのスコープ（別タスク）                                    |
| UI アニメーション          | UI タスクのスコープ（別タスク）                                    |
| ファイル監視（watch）      | 別チャンネル（`file:watch-start` 等）で実装済み                    |
| ファイルツリーのキャッシュ | 初回実装ではキャッシュなしとし、要件化された場合は後続タスクで対応 |

---

## 参照資料

| 資料名                   | パス                                                                                             | 参照目的                             |
| ------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------ |
| IPC セキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                     | IPC セキュリティ要件                 |
| IPC API仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                             | `skill:getFileTree` チャネル契約確認 |
| Agent SDK 型仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                | Preload/共有型の契約確認             |
| Preload セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                     | contextBridge 公開制約の確認         |
| Electron サービス層      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                    | Main Process 側責務境界の確認        |
| IPC 契約チェックリスト   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                    | IPC 契約整合性確認                   |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                     | 3プロセスモデル確認                  |
| 抽出マトリクス           | `docs/30-workflows/completed-tasks/getfiletree-ipc/aiworkflow-requirements-extraction-matrix.md` | 必須仕様セットの追跡                 |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                             | P42, P44, P45 準拠確認               |
| 既存 IPC ハンドラー      | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                                                 | 実装パターン参照                     |
| 既存 Preload API         | `apps/desktop/src/preload/skill-api.ts`                                                          | API パターン参照                     |
| SkillFileManager 実装    | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                                       | 委譲先メソッド仕様                   |
| useFileTree フック       | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts`                           | 呼び出し元の現状確認                 |

## aiworkflow仕様抽出トレーサビリティ

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:getFileTree" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "interfaces-agent-sdk-skill" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-api-electron" -C 2
```

## 実行手順

1. FR-1（機能要件）の入出力仕様を確認する
2. NFR-1〜4（非機能要件）のセキュリティ・型安全性・パフォーマンス・一貫性要件を確認する
3. AC-1〜4（受入基準）の検証条件を確認する
4. スコープ（含む / 含まない）を確認する
5. 本仕様書を `outputs/phase-1/requirements.md` に出力する

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 1 の定義/成果物と api-ipc-agent.md を照合する          |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物     | パス                              |
| ---------- | --------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` |

## 完了条件

- [ ] FR-1（skill:getFileTree チャンネルの入出力仕様）が確定している
- [ ] FR-1-1（SkillFileManager.getFileTree メソッド仕様）が確定している
- [ ] FR-1-2（SkillFileTreeNode 型の共有化方針）が確定している
- [ ] FR-1-3（Preload API メソッド仕様）が確定している
- [ ] FR-1-4（IPC チャンネル定義）が確定している
- [ ] NFR-1〜4（非機能要件）が全て定義されている
- [ ] AC-1〜4（受入基準）が全て定義されている
- [ ] スコープ（含む / 含まない）が明文化されている
- [ ] 曖昧表現（「仕様に沿って」「要件化された場合は」）が使用されていない

## 次Phase

Phase 2（設計）へ進む。
