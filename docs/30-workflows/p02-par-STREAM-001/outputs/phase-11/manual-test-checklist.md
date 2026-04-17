# TASK-SW-STREAM-001 手動テストチェックリスト

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| Phase    | 11                 |
| Phase名  | 手動テスト         |
| タスクID | TASK-SW-STREAM-001 |
| 作成日   | 2026-04-17         |
| 状態     | 完了               |

---

## 手動テストシナリオ一覧

| シナリオID | シナリオ名                               | 確認内容                                                | 前提条件                               |
| ---------- | ---------------------------------------- | ------------------------------------------------------- | -------------------------------------- |
| MT-01      | create モードでスキル生成を実行する      | `planning` コールバックが最初に発火する                 | Electronアプリ起動 または 直接呼び出し |
| MT-02      | create モードでスキル生成を実行する      | 5つのフェーズが順番通り（10%→40%→70%→90%→100%）発火する | MT-01 通過後                           |
| MT-03      | create モードでスキル生成を実行する      | `createSkill()` が正常に完了してスキルパスを返す        | MT-02 通過後                           |
| MT-04      | onProgress なしで createSkill を実行する | エラーなし、通常通り完了する                            | Electronアプリ起動 または 直接呼び出し |

---

## テスト実行手順

### 事前準備

1. Electronアプリを開発モードで起動する

```bash
pnpm --filter @repo/desktop dev
```

または、`SkillCreatorService.createSkill` を Node.js REPL / テストランナーから直接呼び出す。

### MT-01 / MT-02 / MT-03 手順

1. 以下のデバッグコードを `skillCreatorHandlers.ts` の呼び出し箇所に一時的に挿入する（コミット前に必ず削除）

```typescript
// 一時的なデバッグ確認（手動テスト時のみ追加、コミット前に削除）
const onProgress = (progress: {
  phase: string;
  percentage: number;
  message: string;
}) => {
  console.log(
    `[DEBUG STREAM-001] onProgress: phase=${progress.phase}, percentage=${progress.percentage}, message=${progress.message}`,
  );
};

await skillCreatorService.createSkill(
  { mode: "create", name: "test-skill", description: "テスト用スキル" },
  onProgress,
);
```

2. スキル生成を実行し、コンソールログを確認する
3. 以下の出力が順番通りに出力されることを確認する

```
[DEBUG STREAM-001] onProgress: phase=planning, percentage=10, message=構造を計画しています
[DEBUG STREAM-001] onProgress: phase=generating-skill, percentage=40, message=...
[DEBUG STREAM-001] onProgress: phase=generating-agents, percentage=70, message=...
[DEBUG STREAM-001] onProgress: phase=validating, percentage=90, message=...
[DEBUG STREAM-001] onProgress: phase=done, percentage=100, message=完了しました
```

4. `createSkill()` の戻り値がスキルディレクトリパス（文字列）であることを確認する

### MT-04 手順

1. `onProgress` 引数を渡さずに `createSkill()` を呼び出す

```typescript
// onProgress なし（省略）
const skillPath = await skillCreatorService.createSkill({
  mode: "create",
  name: "test-skill-no-progress",
  description: "進捗なしテスト用スキル",
});
console.log("完了:", skillPath);
```

2. エラーが発生しないこと、戻り値が得られることを確認する

---

## チェックリスト（実行前確認）

- [ ] デバッグコードはテスト終了後に削除する
- [ ] テスト用スキル（`test-skill`, `test-skill-no-progress`）は後片付けする
- [ ] Electronアプリを起動できる環境が整っている

---

## 完了チェックリスト

- [x] 手動テストシナリオ（MT-01〜MT-04）が定義されている
- [x] テスト実行手順が記載されている
- [x] デバッグコードスニペットが記載されている
- [x] 成果物（TASK-SW-STREAM-001-manual-test-checklist.md）が生成されている
