# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 4                                   |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| 前提   | Phase 1, Phase 2, Phase 3           |

## 目的

P50 差分を先にテストで固定し、既存 `NotificationCenter` 実装を補完するときの破壊範囲を狭める。store、UI、preload、main IPC の差分を Red で明文化する。

## 実行タスク

- store test設計: `notificationSlice` の delete、mark all、dedupe、100件保持を固定する。
- component test設計: Bell、Popover、Header、Item、Badge、EmptyState の期待挙動を固定する。
- IPC test設計: `notification:delete` の request / response 契約を固定する。
- a11y test設計: Escape、focus trap、`aria-expanded`、dialog 属性を固定する。
- regression seed作成: 現行 clear all UI と固定日時表示が残った場合に落ちる検査を作る。

## 参照資料

| 参照資料           | パス                                                                                            | 説明           |
| ------------------ | ----------------------------------------------------------------------------------------------- | -------------- |
| Phase 1 要件       | `outputs/phase-1/requirements-definition.md`                                                    | 検証対象       |
| Phase 2 設計       | `outputs/phase-2/component-design.md`                                                           | UI 設計        |
| Phase 3 ゲート     | `outputs/phase-3/review-gate.md`                                                                | 着手条件       |
| 現行 UI test       | `apps/desktop/src/renderer/components/organisms/NotificationCenter/NotificationCenter.test.tsx` | 既存テスト     |
| 現行 slice test    | `apps/desktop/src/renderer/store/slices/notificationSlice.test.ts`                              | 既存テスト     |
| 現行 handler test  | `apps/desktop/src/main/ipc/__tests__/notificationHandlers.test.ts`                              | 既存 IPC test  |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                                                        | Phase 2 成果物 |
| 状態とIPC設計      | `outputs/phase-2/state-ipc-design.md`                                                           | Phase 2 成果物 |
| 正本仕様抽出       | `outputs/phase-2/aiworkflow-requirements-extract.md`                                            | Phase 2 成果物 |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`                                                       | Phase 3 成果物 |
| 差分解消一覧       | `outputs/phase-3/gap-resolution-list.md`                                                        | Phase 3 成果物 |

## 実行手順

### ステップ1: store / IPC テストケース定義

| 対象                   | テストケース                                                                |
| ---------------------- | --------------------------------------------------------------------------- |
| `notificationSlice`    | item delete 後に `expandedNotificationId` が null へ戻る                    |
| `notificationSlice`    | `setNotificationHistory` と `ingestNotification` が同一 ID を重複保持しない |
| `notificationHandlers` | `notification:delete` が `notificationId` の 3段バリデーションを持つ        |
| preload API            | `notification.delete` が allowlist channel を使う                           |

### ステップ2: UI / a11y テストケース定義

| 対象         | テストケース                                               |
| ------------ | ---------------------------------------------------------- |
| Bell trigger | badge 表示、`aria-expanded` 更新、close 復帰               |
| Popover      | Portal 描画、Escape close、outside click close、focus trap |
| Header       | 「お知らせ」、すべて既読、close の 3 要素だけを表示する    |
| Item         | unread dot、relative time、expand、swipe delete affordance |
| EmptyState   | `mood="celebrating"` と文言を表示する                      |

### ステップ3: テスト環境ルール固定

| ルール | 内容                                                |
| ------ | --------------------------------------------------- |
| P39    | `fireEvent` を使用する                              |
| P40    | `cd apps/desktop && pnpm vitest run` を使う         |
| P9     | store は `beforeEach` で reset する                 |
| P5     | subscription は mount / unmount の 1 往復で検証する |

## 統合テスト連携

| 観点            | 内容                                             |
| --------------- | ------------------------------------------------ |
| UI → Store      | Bell / item 操作で store が更新される            |
| Store → IPC     | mark read / mark all / delete の mutation を呼ぶ |
| Main → Renderer | `notification:new` push を受けて先頭挿入する     |
| Security        | allowlist 外 channel を使わない                  |

## 成果物

| 成果物               | パス                                         | 説明           |
| -------------------- | -------------------------------------------- | -------------- |
| テスト仕様書         | `outputs/phase-4/test-specification.md`      | テスト対象一覧 |
| テストケース         | `outputs/phase-4/test-cases.md`              | Red ケース     |
| 統合テストマトリクス | `outputs/phase-4/integration-test-matrix.md` | 接続観点       |

## 完了条件

- [ ] store / UI / IPC / a11y のテストケースを定義している
- [ ] P39 / P40 / P9 / P5 のルールを定義している
- [ ] delete channel のテスト観点を含めている
- [ ] clear all UI 残置を検出する回帰ケースを含めている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. store / IPC テストケース定義
2. UI / a11y テストケース定義
3. 回帰ケース定義
4. 成果物パス固定
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-4/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 4 と整合している

## 次のPhase

[Phase 5: 実装](./phase-5-implementation.md)
