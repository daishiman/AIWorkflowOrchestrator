# Phase 1 Requirements Definition

> P50パターン該当: 検証・補完モード。既存 light theme 実装を前提に guard 仕様を補完する。

## 要件サマリ

この task は「ライトテーマの再発検知」を単一責務として扱う。token 値修正や component 色移行は別 workflow に残し、本 workflow は drift を検出して formalize する境界だけを持つ。

## FR / NFR

| ID    | 種別           | 内容                                                                       |
| ----- | -------------- | -------------------------------------------------------------------------- |
| FR-1  | Functional     | representative 4 surface の screenshot matrix を定義する                   |
| FR-2  | Functional     | hardcoded color drift を `rg` ベースで検出する audit policy を定義する     |
| FR-3  | Functional     | current violations と baseline backlog の分離ルールを定義する              |
| FR-4  | Functional     | Phase 11 の screenshot coverage と Phase 12 の system spec sync を接続する |
| NFR-1 | Non-functional | route screenshot 依存を避け、selector-based capture を正本にする           |
| NFR-2 | Non-functional | worktree screenshot は current build static serve を第一候補とする         |
| NFR-3 | Non-functional | 0件報告でも baseline backlog を隠さない                                    |
| NFR-4 | Non-functional | `.claude` 正本と `.agents` mirror drift を Phase 12 で確認できる           |

## 単一責務境界

| 含む                   | 含まない                  |
| ---------------------- | ------------------------- |
| screenshot matrix      | token 値変更              |
| audit rule / exclusion | component 色置換          |
| evidence policy        | renderer 全画面の UI 改修 |
| Phase 11 / 12 handoff  | commit / PR / push        |

## 依存関係

| 依存 workflow                      | 本 task で使う前提                    |
| ---------------------------------- | ------------------------------------- |
| light-theme-token-foundation       | token 契約と light hierarchy の正本   |
| light-theme-shared-color-migration | hardcoded color hot spot の修正対象群 |

## エレガント性判定

- fix と guard を混ぜない
- route と component の責務を surface として結び直す
- screenshot path と bug path を分離する
- current と baseline を二層に分ける
