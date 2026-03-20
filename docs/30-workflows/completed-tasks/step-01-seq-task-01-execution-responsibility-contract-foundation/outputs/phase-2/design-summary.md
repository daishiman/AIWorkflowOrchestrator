# Phase 2: 設計サマリー

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 2                                                         |
| 作成日   | 2026-03-20                                                |

## Concern 分解

### Concern Table

| concern   | ownership ファイル         | 入力                                             | 出力                                                                    | 禁止事項                                               |
| --------- | -------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| Concern A | `RuntimePolicyResolver.ts` | API key 有無 / subscription 有無 / terminal 設定 | capability 値（integratedRuntime / terminalSurface / both / none）      | 他ファイルでの capability 再計算                       |
| Concern B | Renderer selector / hook   | capability 値（Concern A 出力）                  | uiState（ready / blocked / unavailable）+ blockedReason / blockedAction | Main Process での uiState 計算                         |
| Concern C | CTA コンポーネント         | capability + uiState（Concern A + B 出力）       | CTA 表示 / 非表示（primary + secondary）                                | コンポーネント内での capability / uiState 追加条件判定 |

### Concern A: capability 契約

- **定義**: capability 4 状態の状態遷移と責務境界
- **ownership**: `RuntimePolicyResolver.ts` が capability を決定する唯一の authority
- **境界**: capability の判定ロジックを RuntimePolicyResolver 外に分散させることを禁止する
- **状態遷移条件**:

| 入力条件                                                                     | capability                                          |
| ---------------------------------------------------------------------------- | --------------------------------------------------- |
| API key 有効 かつ subscription 無効                                          | integratedRuntime                                   |
| API key 無効 かつ subscription 有効                                          | terminalSurface                                     |
| API key 有効 かつ subscription 有効                                          | both                                                |
| API key 無効 かつ subscription 無効                                          | none                                                |
| API key 有効 かつ integrated runtime timeout/degraded かつ subscription 有効 | terminalSurface（degraded fallback は明示通知付き） |

### Concern B: state 語彙統一

- **定義**: UI が使う状態語彙の判定ロジックと表示契約
- **ownership**: capability -> state の変換は Renderer 層の専用 selector / hook が担う。Main Process は既存 transport DTO（AuthModeStatus）を返すが、UI 語彙の最終 ownership は Renderer 側 selector に固定する
- **判定ルール**:

| capability        | 補助条件                     | uiState     | 表示契約                                        |
| ----------------- | ---------------------------- | ----------- | ----------------------------------------------- |
| integratedRuntime | 即時実行可能                 | ready       | primary CTA 有効                                |
| terminalSurface   | handoff CTA 利用可能         | ready       | primary CTA 有効（handoff 形式）                |
| both              | 両 lane 利用可能             | ready       | primary + secondary CTA 両方有効                |
| integratedRuntime | API key 有効だが接続不可     | blocked     | 理由テキスト + 解決 action 必須                 |
| terminalSurface   | terminal 起動不可            | blocked     | 理由テキスト + 解決 action 必須                 |
| none              | 解決 action あり（設定遷移） | blocked     | 理由テキスト + 解決 action（設定画面遷移）      |
| none              | 解決 action なし             | unavailable | 理由テキストのみ。primary CTA は DOM に含めない |

### Concern C: CTA 契約

- **定義**: primary CTA 1 個 + secondary CTA 1 個の表示条件・ラベル・action wiring
- **ownership**: CTA の表示・非表示は capability x state の組み合わせだけで決定する
- **構成**: primary CTA が存在しない state（unavailable）では primary CTA を非表示（DOM に含まない）にする

## Phase 1 Concern の解決

### Concern 1 解決: capability `both` の判定条件

- **判定**: subscription と api-key の両方が有効な場合は `both` とする
- **primary CTA の優先順**: integratedRuntime が primary（in-app 実行を優先）。terminalSurface が secondary（代替 lane として提示）
- **根拠**: ユーザーが両方のオプションを持つ場合、より便利な in-app 実行を推奨しつつ、手動実行の選択肢も残す

### Concern 2 解決: `blocked` と `none` の境界

- **判定**: capability = none であっても、解決 action が存在する場合（API key 設定で integratedRuntime になる等）は `blocked` とする。解決 action が一切ない場合のみ `unavailable` とする
- **根拠**: ユーザーに「次に何をすべきか」を示すことが最重要。解決 action がある限り `blocked`（+ action）として導線を提供する

### Concern 3 解決: デフォルトプロンプト注入の判定

- **判定**: `buildForAgentExecution` / `buildForSkillExecution` のデフォルトプロンプトは hidden injection に**該当しない**。理由: handoff card の UI 上に「提案コマンド」として表示される前提であり、不可視のバックグラウンド追加ではない
- **ただし**: デフォルトプロンプトが UI 上に表示されることを保証する仕組み（表示一致検証）は Task05 で実装する

## Simpler Alternative 検討

### Alternative A: capability を 2 状態（integrated / manual）に簡素化する

- **内容**: `integratedRuntime` と `terminalSurface` のみに絞り、`both` と `none` を削除する
- **trade-off**:
  - メリット: concern 数が減り、contract-matrix のセル数が半減する
  - デメリット: 「両方使えるユーザー」と「どちらも使えないユーザー」の UI 分岐が表現できない。`none` を削除すると silent fallback と区別がつかなくなる
- **採用しない理由**: `none` の明示的表現は FR-4（禁止事項）の boundary 定義に不可欠。`both` の削除は Task05（terminal handoff surface）の設計を先取りして制約することになりスコープ違反

### Alternative B: CTA を state に埋め込む（Concern C を Concern B に統合する）

- **内容**: `uiState` に `primaryCTA` と `secondaryCTA` を直接含める（concern 分離しない）
- **trade-off**:
  - メリット: concern が 2 つに減り、DTO がシンプルになる
  - デメリット: CTA ラベルを変更するたびに IPC contract の変更が必要になる。ラベルは UI 層の責務であり、Main Process に持ち込むと責務が混在する
- **採用しない理由**: CTA ラベルは i18n / A/B test 対象であり、UI 層で管理すべき。IPC contract に含めると Concern A の ownership が破壊される

## Phase 3 Handoff

### Drift しやすい箇所（Phase 3 で重点レビューする観点）

1. **語彙 drift**: コード上で `authMode` / `mode` / `runtime` 等の旧語彙が capability の代わりに使われていないか
2. **state drift**: capability が `both` のとき UI state が `ready` でなく `blocked` になるケースがないか（contract-matrix と実装の乖離）
3. **simpler alternative の再検討**: Alternative A / B が Phase 3 時点で再び浮上した場合は MAJOR 判定とする

### Blocked 条件

- contract-matrix の全セルが埋まっていない場合は Phase 3 を開始しない
- Concern A / B / C の ownership が 1 ファイルに定まっていない場合は Phase 3 を開始しない
