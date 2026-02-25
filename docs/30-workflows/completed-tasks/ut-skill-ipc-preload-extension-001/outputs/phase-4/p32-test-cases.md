# Phase 4 P32検証ケース

## 三点同期検証（Task 4-3）

| ケースID | 対象               | 検証内容                    | 期待結果            |
| -------- | ------------------ | --------------------------- | ------------------- |
| P32-01   | `channels.ts`      | 30チャネル定数の有無        | 全チャネル定義済み  |
| P32-02   | `skill-api.ts`     | 30チャネルに対応するAPI有無 | invoke 29 / on 1    |
| P32-03   | `preload/types.ts` | API引数・戻り値型の整合     | 欠落0件             |
| P32-04   | `packages/shared`  | ドメイン共有型の配置        | 7分割 + indexの構成 |
| P32-05   | 参照同期           | channels↔api↔typesの差分    | 差分0件             |

## shared型配置漏れ検出

- 条件: 9D〜9Jのいずれかで新規型がPreload側にのみ存在する。
- 判定: 検出時はFail、`packages/shared/src/types/skill/*` へ移管する。

## 完了状態

- Phase 4 Task 4-3: Completed
