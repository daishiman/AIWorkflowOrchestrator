# Phase 12 実装ガイド

## Part 1: 中学生向けの説明

30個の「合言葉（チャネル名）」を、アプリの3つの場所で同じようにそろえる計画です。

- 1つ目: どんな合言葉が使えるかを決める場所（channels）
- 2つ目: 画面側から呼ぶメニュー（skillAPI）
- 3つ目: 使うデータの型（types）

この3つがずれると、ボタンを押しても正しく動きません。だから、30個を表で管理して、1つずつ同時に更新できるようにします。

## Part 2: 技術者向け詳細

### 1. 実装順序

1. task-9D
2. task-9E
3. task-9F
4. task-9G
5. task-9H
6. task-9I
7. task-9J

### 2. 1チャネルあたりの更新点

- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/skill-api.ts`
- `apps/desktop/src/preload/types.ts`
- 必要時: `packages/shared/src/types/skill/*.ts`

### 3. 安全実装ルール

- `safeInvoke` / `safeOn` 以外のIPC呼び出しを禁止。
- `skill:debug:event` のみ onチャネルとして扱う。
- `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` を同時更新する。
- `skill:importFromSource` を外部ソースインポート正本とする。

### 4. 完了確認

- 30チャネル一致
- handle 29 / on 1
- P32同期漏れ0
- task-9 artifacts更新漏れ0

## 完了状態

- Phase 12 Task 12-1: Completed
