# Drift Definition

> P50パターン該当: 検証・補完モード。既存 drift を分類して future execution の routing を固定する。

## Drift Taxonomy

| 種別                  | 定義                                  | 代表例                                                     | 送付先                                                 |
| --------------------- | ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| Hardcoded Color Drift | theme token を通さない色指定          | `text-white`, `bg-slate-*`, `bg-zinc-*`, `border-white/10` | shared-color-migration または本 guard の current issue |
| Token Drift           | token 値が light hierarchy と合わない | Dashboard で background と text の階層が弱い               | token-foundation                                       |
| Screenshot Drift      | capture 元や selector が不安定        | shell 全景のみ、別 worktree build、selector 不在           | Phase 11 / 12 の運用是正                               |
| Evidence Drift        | current と baseline が混線            | 0件報告だけで legacy backlog が隠れる                      | Phase 12 / task-workflow                               |

## 判定ルール

1. 原因が token 契約なら token-foundation 側へ送る
2. 原因が component 直書き色なら shared-color-migration 側へ送る
3. 原因が証跡運用なら本 guard task 内で解決する
4. 複合原因の場合は primary cause を 1 つ決め、二次影響を Phase 12 で cross-reference する
