# Red テスト結果（スナップショット未生成状態）

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 4                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 期待される Red 状態

`creatorHandlers.registrationSnapshot.test.ts` を初めて実行した場合、スナップショットファイルが存在しないため REG-SNAP-01 は初回に自動生成される（Vitest のデフォルト挙動）。

**初回実行時の期待動作**:

- `toMatchSnapshot()` は初回実行時にスナップショットを自動生成して PASS する
- 2 回目以降の実行でスナップショットと照合する

**Red 状態を確認する方法**:
スナップショット生成後にチャンネルを変更した場合:

```
FAIL apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts
  ● REG-SNAP-01: 登録チャンネル一覧がスナップショットと一致する

    Snapshot name: `... > REG-SNAP-01 1`

    - Snapshot  - 1
    + Received  + 1

      Array [
    -   "skill-creator:plan",
    +   "skill-creator:plan-v2",   ← 変更されたチャンネル名
        ...
      ]
```

**REG-DEDUP-01 の Red 状態**（重複チャンネルが存在する場合）:

```
FAIL
  ● REG-DEDUP-01: 重複チャンネルが存在しない

    expect(received).toBe(expected)
    Expected: 19
    Received: 18  ← Set のサイズが配列長より小さい
```

## 実行記録

Phase 4 ではテストコード骨格のみ設計し、実際のファイル作成は Phase 5 で行う。
Red 状態の記録はスナップショット初回生成前の状態を示す。
