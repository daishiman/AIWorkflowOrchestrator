# Phase 1 要件定義書

## 目的

`SkillManagementPanel` の list view を imported / available の 2 セクション UI へ拡張し、検索、追加確認、success / error 通知、focus return、nullish metadata 防御を同じ契約で扱う。

## 関心分離

| SubAgent | 担当       | 成果                                                     |
| -------- | ---------- | -------------------------------------------------------- |
| B1       | 情報設計   | 2セクション順序、件数表示、単一検索入力                  |
| B2       | 状態設計   | loading / empty / no-result / success / error の優先順位 |
| B3       | A11y       | dialog role、live region、focus return、44px target      |
| B4       | テスト連携 | 単体 / 統合 / manual の観点統合                          |

## Functional Requirements

| ID    | 要件                                                         | 実装反映                                                |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------- |
| FR-01 | imported を先頭、available を後段に表示する                  | `SkillManagementPanel.tsx` で 2 セクションを常時描画    |
| FR-02 | 1つの検索入力で両セクションを同時絞り込みする                | `searchQuery` を imported / available 両方へ適用        |
| FR-03 | available row の CTA は dialog open のみとする               | row CTA から `SkillImportDialog` を起動                 |
| FR-04 | confirm 時だけ `importSkill(skill.name)` を実行する          | dialog confirm に import 実行を集約                     |
| FR-05 | success 後は imported 側へ移動し、通知と focus return を行う | `role="status"` と imported card focus を実装           |
| FR-06 | error 時は dialog / panel で再試行文言を表示する             | `role="alert"` と `もう一度試してみてください。` を表示 |
| FR-07 | imported 済みスキルは available 側に再表示しない             | available list で imported 名称を除外                   |
| FR-08 | duplicate import は冪等成功として扱う                        | store 契約に合わせて available 側だけ同期               |

## Non-Functional Requirements

| ID     | 要件                                                                       | 判定方法             |
| ------ | -------------------------------------------------------------------------- | -------------------- |
| NFR-01 | 新規 IPC / Preload API / Main service を追加しない                         | 差分レビュー         |
| NFR-02 | `currentView` の editor / analysis / create 分岐を壊さない                 | integration test     |
| NFR-03 | nullish metadata でもクラッシュしない                                      | unit / manual        |
| NFR-04 | row disabled は import 対象だけに限定する                                  | unit test            |
| NFR-05 | stale error を success 後に残さない                                        | integration / manual |
| NFR-06 | キーボードのみで open / cancel / confirm / close / focus return が成立する | integration / manual |

## 差分要約

| 観点     | 現行                   | 目標                                                      |
| -------- | ---------------------- | --------------------------------------------------------- |
| 一覧構成 | imported のみ          | imported + available                                      |
| 追加導線 | 別導線前提             | list view 内で dialog 経由追加                            |
| 状態表示 | loading / empty 中心   | global empty / inline empty / no-result / success / error |
| 成功判定 | 単純な action 成功前提 | imported 一覧反映 + error 未残置 + row 非表示             |

## 非スコープ

- Store state の新規追加
- `skill:*` 契約拡張
- `editor/analysis/create` の UI 仕様変更
- Main / Preload 層の挙動変更
