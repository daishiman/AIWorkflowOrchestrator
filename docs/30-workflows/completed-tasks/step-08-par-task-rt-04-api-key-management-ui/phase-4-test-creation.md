# Phase 4: テスト作成

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 4                     |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

UI、状態遷移、preload 契約の各観点で先行テストを定義し、実装の逸脱を防ぐ。

## 実行タスク

- UI test cases を作成する
- `authKey` 契約の mock 方針を定義する
- expected result を AC 単位で固定する

## 参照資料

| 資料名         | パス                                                    | 説明               |
| -------------- | ------------------------------------------------------- | ------------------ |
| Phase 2        | `phase-2-design.md`                                     | 設計               |
| Skill tests    | `apps/desktop/src/renderer/components/skill/__tests__/` | 既存 test パターン |
| authKey bridge | `apps/desktop/src/preload/index.ts`                     | mock 対象          |

## 実行手順

### ステップ1: テスト軸を分ける

1. UI描画
2. 状態遷移
3. 保存・検証・削除
4. Settings CTA

### ステップ2: command suite を決める

1. 対象 test file を定義する。
2. mock 方針を決める。
3. expected result を AC へ紐付ける。

### ステップ3: screenshot 前提を仕込む

1. data-testid 等の capture anchor 要否を決める。
2. Phase 11 TC-ID と整合するテストケース名を決める。

## 統合テスト連携

- Phase 5 実装は本 Phase の test cases を Red から Green へ進める。
- Phase 11 の TC-ID と同じシナリオ名を保持する。

## 成果物

| 成果物          | パス                                    | 説明                    |
| --------------- | --------------------------------------- | ----------------------- |
| テスト設計      | `outputs/phase-4/test-design.md`        | 全体 test matrix        |
| UI テストケース | `outputs/phase-4/ui-test-cases.md`      | UI case                 |
| IPC 契約ケース  | `outputs/phase-4/ipc-contract-cases.md` | preload / response case |

## 完了条件

- [ ] AC 全件に対応するテストケースがある
- [ ] mock 方針が定義されている
- [ ] screenshot と整合する TC-ID が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
