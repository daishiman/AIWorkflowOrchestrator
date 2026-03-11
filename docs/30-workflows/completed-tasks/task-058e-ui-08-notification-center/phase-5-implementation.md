# Phase 5: 実装

## メタ情報

| 項目   | 値                                  |
| ------ | ----------------------------------- |
| Phase  | 5                                   |
| 機能名 | task-058e-ui-08-notification-center |
| 作成日 | 2026-03-11                          |
| 前提   | Phase 4                             |

## 目的

既存 `NotificationCenter` を 058e 正本へ収束させる実装順序を固定する。UI 分割、delete IPC 追加、相対時刻、a11y、motion を P50 差分解消の単位で実装する。

## 実行タスク

- UI分割実装: Popover / Header / List / Item / Badge / EmptyState を導入する。
- IPC差分実装: `notification:delete` を preload / main / renderer に追加する。
- 体験差分実装: title、relative time、swipe delete、close 操作、bell swing を反映する。
- 既存整理実装: clear all UI を外し、不要 props と重複処理を除去する。
- P50差分台帳更新: 既存実装との差分解消状況を記録する。

## 参照資料

| 参照資料             | パス                                                                          | 説明           |
| -------------------- | ----------------------------------------------------------------------------- | -------------- |
| Phase 4 仕様         | `outputs/phase-4/test-specification.md`                                       | 実装対象       |
| Phase 4 ケース       | `outputs/phase-4/test-cases.md`                                               | Red ケース     |
| Phase 2 設計         | `outputs/phase-2/state-ipc-design.md`                                         | state / IPC    |
| 現行 UI              | `apps/desktop/src/renderer/components/organisms/NotificationCenter/index.tsx` | P50 実体       |
| 統合テストマトリクス | `outputs/phase-4/integration-test-matrix.md`                                  | Phase 4 成果物 |

## 実行手順

### ステップ1: renderer 実装

| 実装単位   | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Bell shell | badge、trigger、`aria-expanded` を維持する                 |
| Popover    | Portal、focus trap、close 導線を追加する                   |
| Header     | title「お知らせ」、すべて既読、close のみに絞る            |
| Item       | unread dot、relative time、expand、swipe delete を実装する |
| EmptyState | 共通 EmptyState を使用する                                 |

### ステップ2: store / preload / main 実装

| 実装単位 | 内容                                                     |
| -------- | -------------------------------------------------------- |
| slice    | delete action と gesture 連携に必要な最小差分を入れる    |
| preload  | `notification.delete` を公開する                         |
| channels | allowlist と invoke 定数へ delete を追加する             |
| handlers | `notification:delete` の validation と削除処理を追加する |

### ステップ3: P50差分の締め

| 差分           | 実装方針                        |
| -------------- | ------------------------------- |
| clear all UI   | Header から除去する             |
| 固定日時       | relative time helper へ置換する |
| 単一 component | 分割 component に置換する       |
| 既読ボタン依存 | item click 既読を主導線にする   |

## 統合テスト連携

| 観点               | 内容                                                   |
| ------------------ | ------------------------------------------------------ |
| Renderer → Preload | mark read / mark all / delete の 3 mutation を使用する |
| Preload → Main     | allowlist と validation を通る                         |
| Main → Renderer    | push payload を ISO 正規化して受ける                   |
| Existing domain    | 056c の dedupe / 100件保持 / history sync を壊さない   |

## 成果物

| 成果物          | パス                                        | 説明         |
| --------------- | ------------------------------------------- | ------------ |
| 実装サマリー    | `outputs/phase-5/implementation-summary.md` | 実装結果     |
| P50差分収束計画 | `outputs/phase-5/p50-gap-closure-plan.md`   | 差分解消台帳 |
| IPC差分対応     | `outputs/phase-5/ipc-channel-migration.md`  | channel 差分 |

## 完了条件

- [ ] UI 分割の実装順序を定義している
- [ ] delete channel 追加の三層差分を定義している
- [ ] clear all UI 除去を実装対象に含めている
- [ ] relative time と swipe delete を実装対象に含めている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. renderer 実装単位の整理
2. store / preload / main 差分整理
3. P50 差分台帳整理
4. 成果物パス固定
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-5/` の成果物名を固定済み
- [ ] `artifacts.json` の Phase 5 と整合している

## 次のPhase

[Phase 6: テスト拡充](./phase-6-test-expansion.md)
