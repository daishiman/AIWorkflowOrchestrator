# 実装ガイド: navContract.ts に executionConsole エントリ追加

## Part 1: 概念説明（中学生レベル）

このアプリには、テレビのリモコンのチャンネルボタンのような「ナビゲーションバー」があります。navContract.ts は、そのリモコンの「どのボタンを何番に割り当てるか」を決める設計図です。

今回の変更は、リモコンに「実行コンソール」という新しいチャンネルボタンを追加する作業です。そのためには3つのことが必要でした。(1) ボタンに表示するアイコン（再生マーク）を用意する、(2) リモコンの「補助チャンネル」グループにボタンを追加する、(3) 9番のショートカットキーを割り当てる、の3つです。

ところで、アプリには「全画面の種類リスト」（ViewType）と「リモコンに載せる画面だけのリスト」（DockViewType）の2つがあります。学校に例えると、ViewType は「全校生徒の名簿」、DockViewType は「生徒会メンバーの名簿」です。全校生徒のうち、生徒会に選ばれた人だけがリモコンのボタンとして表示されます。「実行コンソール」は既に全校生徒名簿には載っていたので、今回は生徒会名簿に追加する作業でした。

## Part 2: 技術者向け実装詳細

### 変更概要

| ファイル              | 変更内容                                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Icon/index.tsx`      | `PlayCircle` import、`IconName` union に `"play-circle"`、`iconMap` Record に追加                                                         |
| `navContract.ts`      | `DockViewType` Extract union に `"executionConsole"`、`NAV_SECTIONS` sub セクションにエントリ、`NAV_SHORTCUT_TO_VIEW` に `"9"` マッピング |
| `navContract.test.ts` | 期待値更新（items count, id 配列, shortcut, MOBILE_SECONDARY, length）+ 新規テスト（TC-E1, TC-E2）                                        |
| `types.test.ts`       | `existingViewTypes` 15→16、`allViewTypes` 17→18                                                                                           |
| `Icon.test.tsx`       | `play-circle` を it.each 配列に追加                                                                                                       |

### 型の関係

```
ViewType (store/types.ts)
    | Extract<ViewType, ...>
DockViewType (navContract.ts) <- 本タスクで "executionConsole" 追加
    | NavItemContract.id
NAV_SECTIONS[1].items[2].id <- 本タスクで追加
    | NAV_SHORTCUT_TO_VIEW
"9" -> "executionConsole" <- 本タスクで追加
```

### 自動反映の仕組み

`GlobalNavStrip/constants.ts` が `NAV_SECTIONS` を直接参照（`GLOBAL_NAV_SECTIONS = NAV_SECTIONS satisfies ...`）しているため、navContract.ts の変更は GlobalNavStrip の表示に自動的に反映される。

### ショートカット割当

Cmd+9 を executionConsole に割当。既存の Cmd+1〜8（main 6項目 + sub 2項目）と Cmd+,（settings）に続く次の空きスロット。
