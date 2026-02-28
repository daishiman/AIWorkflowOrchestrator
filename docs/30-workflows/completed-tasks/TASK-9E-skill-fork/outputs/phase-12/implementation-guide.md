# 実装ガイド: skill:fork（TASK-9E）

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスク   | TASK-9E skill:fork              |
| Phase    | 12 Task 1                       |
| 対象読者 | Part 1: 初学者 / Part 2: 開発者 |

## Part 1（中学生向け）

### これは何をする機能か

既存のスキルを「元データを壊さずにコピーして、自分用に作り替える」機能です。

### たとえ話

ノートの原本を直接書き換えると戻せなくなるので、まずコピーを作ってから追記します。
`skill:fork` はこの「コピーを作ってから編集する」を自動化したものです。

### 何がうれしいか

1. 元スキルを壊さない
2. 必要なフォルダだけ選んでコピーできる
3. どのスキルから分岐したか (`fork-metadata.json`) を残せる
4. 途中で失敗したら作りかけを削除して戻せる（ロールバック）

## Part 2（開発者向け）

### 変更点の全体像

- Main Service: `SkillForker` 新規
- IPC: `skill:fork` ハンドラ追加
- Preload: `forkSkill(options)` 追加
- Shared: `SkillForkOptions/Result/Metadata` 追加

### 型定義

```ts
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

### APIシグネチャ

```ts
// preload
forkSkill(options: SkillForkOptions): Promise<SkillForkResult>

// main service
fork(options: SkillForkOptions): Promise<SkillForkResult>
```

### IPC チャンネル `skill:fork` 使用例

```ts
// renderer -> preload -> main
await window.electronAPI.skill.forkSkill({
  sourceSkill: "aiworkflow-requirements",
  newName: "aiworkflow-requirements-custom",
  copyAgents: true,
  copyReferences: true,
  copyScripts: false,
  copyAssets: false,
});
```

```ts
// preload 実装の実体（概念）
ipcRenderer.invoke(IPC_CHANNELS.SKILL_FORK, options);
```

### 実行フロー

1. IPC sender 検証
2. IPC引数の型/値検証
3. `SkillForker.fork()` 実行
4. `SKILL.md` 更新 + サブディレクトリ選択コピー
5. `fork-metadata.json` 書き込み
6. 成功レスポンス返却
7. 失敗時はロールバック後にエラーレスポンス返却

### 主要バリデーション

- `sourceSkill`, `newName`: 非空文字列
- `description`: 指定時のみ非空文字列
- `copy*`: boolean 必須
- `modifyAllowedTools`: 指定時は非空文字列配列

### エラーハンドリングパターン

| エラー種別             | 代表条件                                            | 応答方針                             |
| ---------------------- | --------------------------------------------------- | ------------------------------------ |
| バリデーションエラー   | `sourceSkill` / `newName` 空文字、`copy*` 非boolean | 早期に失敗レスポンス（実行前に終了） |
| ファイルシステムエラー | copy/write 中の I/O 失敗、destination 既存          | ロールバック実行後に失敗レスポンス   |
| 不正送信元             | `validateIpcSender` 失敗                            | 即時拒否（サービス層は呼ばない）     |

### 代表的な呼び出し例

```ts
await window.electronAPI.skill.forkSkill({
  sourceSkill: "aiworkflow-requirements",
  newName: "aiworkflow-requirements-custom",
  description: "customized version",
  copyAgents: true,
  copyReferences: true,
  copyScripts: false,
  copyAssets: false,
  modifyAllowedTools: ["Read", "Grep", "Bash"],
});
```

### エッジケース

- source が存在しない
- destination が既に存在する
- `SKILL.md` が壊れている/存在しない（warning返却）
- コピー途中でFSエラー（ロールバック）
- マルチラインdescriptionの抽出

### テストカテゴリ（Phase 6以降の実測値）

| テストカテゴリ                                 | 件数 | 結果 | 根拠                  |
| ---------------------------------------------- | ---- | ---- | --------------------- |
| Service Unit (`SkillForker.test.ts`)           | 34   | PASS | Phase 10 最終レビュー |
| IPC Integration (`skillHandlers.fork.test.ts`) | 25   | PASS | Phase 10 最終レビュー |
| 合計                                           | 59   | PASS | Phase 12 時点の確定値 |

### 参照ファイル

- `apps/desktop/src/main/services/skill/SkillForker.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/skill-api.ts`
- `packages/shared/src/types/skill-fork.ts`
