# Settings Onboarding rerun 導線の発見性改善 - タスク指示書

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-IMP-SETTINGS-ONBOARDING-RERUN-DISCOVERABILITY-001        |
| タスク名     | Settings Onboarding rerun 導線の発見性改善                  |
| 分類         | 改善                                                        |
| 対象機能     | SettingsView / Onboarding rerun card / Getting Started 導線 |
| 優先度       | 中                                                          |
| 見積もり規模 | 小規模                                                      |
| ステータス   | 未実施                                                      |
| Issue        | #1190                                                       |
| 発見元       | Phase 11, Phase 12                                          |
| 発見日       | 2026-03-13                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-09-ONBOARDING-WIZARD の手動確認では Settings から rerun できること自体は確認できたが、full settings page では rerun card が fold 下に落ちやすく、初見ユーザーが導線を見つけにくいことが分かった。system spec にはこの課題を「動作完了とは別の IA 問題」として反映済みであり、独立タスクとして扱う。

### 1.2 問題点・課題

- `はじめようを再表示` は動作するが、Settings 全体の中で目立ちにくい。
- representative screenshot だけを見ると十分に明快に見えるため、full page での発見性問題を見落としやすい。
- 導線の説明文が弱いと、何が再表示されるのかが直感的に伝わりにくい。
- 実装本体と IA 改善を同じタスクに抱えると、完了判定がぶれやすい。

### 1.3 放置した場合の影響

- onboarding を再確認したいユーザーが rerun 入口を見つけにくい。
- support / QA / 手動検証で rerun 導線の説明コストが増える。
- 「機能はあるが使われない」状態が続き、導線価値が薄れる。

---

## 2. 何を達成するか（What）

### 2.1 目的

Settings 上の onboarding rerun 導線を、ユーザーが自然に見つけられる配置と文言に改善する。

### 2.2 最終ゴール

- rerun card の配置または見せ方が改善され、full settings page でも視認しやすい。
- CTA の意味が非技術者にも分かる。
- rerun の内部契約（`onboarding.hasCompleted` は維持し、Settings は force-open local state だけを発火する）は変えずに改善できる。
- representative screenshot と manual note で改善結果を説明できる。

### 2.3 スコープ

#### 含むもの

- rerun card の配置見直し
- タイトル、説明文、CTA 文言、視覚的強調の改善
- full settings page 観点での screenshot / manual verification
- 必要に応じた system spec 更新

#### 含まないもの

- Onboarding Wizard の step 内容変更
- onboarding state 契約の変更
- Settings 全体の大規模 IA 再設計

### 2.4 成果物

- 改善後の Settings rerun UI
- representative screenshot または manual verification note
- 必要に応じた system spec 更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Onboarding Wizard の rerun 機能自体が正常動作していること
- Settings 側が force-open callback 起点、App / Onboarding 側が表示判定という責務分離を守っていること
- current system spec に rerun card と discoverability 課題が記録されていること

### 3.2 依存タスク

- TASK-UI-09-ONBOARDING-WIZARD

### 3.3 必要な知識

- SettingsView の情報設計
- CTA 文言と説明文の UI/UX 設計
- representative screenshot と full-page screenshot の使い分け
- `/.claude/skills/aiworkflow-requirements/` の settings / navigation / lessons 正本

### 3.4 推奨アプローチ

まず「なぜ見つけにくいか」を layout、grouping、文言、視覚的強調の4観点で切り分ける。そのうえで、状態契約は変えずに card の位置と説明を改善し、full settings page の representative screenshot で評価する。

### 3.5 実装課題と解決策

| 実装課題                                         | 内容                                                          | 解決策                                                 |
| ------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------ |
| isolated では良く見えるが full page では埋もれる | コンポーネント単体の見栄えとページ全体の発見性は別問題        | full settings page を基準に再評価する                  |
| UI 改善と状態契約を混ぜやすい                    | card の改善中に onboarding state の責務まで触りやすい         | Settings は入口、onboarding は表示判定という境界を守る |
| CTA の意味が伝わりにくい                         | 「再表示」だけでは何が起きるか想像しづらい                    | タイトルと説明文で再体験の目的を補う                   |
| Phase 12 の完了判定を揺らしやすい                | 動作完了済みの UI に IA 課題を混ぜると完了/未完の判断がぶれる | discoverability を独立 task として扱う                 |

---

## 4. 実行手順

### Phase構成

3フェーズで進める。`問題の見える化`、`UI 改善`、`画面検証と文書同期` の順に進める。

### Phase 1: 発見性問題の可視化

#### 目的

どの要因で rerun 入口が見つけにくいかを明確にする。

#### 手順

1. current Settings 画面で rerun card の位置と周辺情報量を確認する。
2. layout、grouping、copy、visual emphasis の4観点で原因を整理する。
3. 改善候補を 2〜3 案に絞る。

#### 成果物

- discoverability 問題メモ
- 改善候補一覧

#### 完了条件

- 何が見つけにくさの主因か説明できる。

### Phase 2: UI 改善

#### 目的

rerun 入口の見つけやすさを上げる。

#### 手順

1. card の配置または grouping を見直す。
2. タイトル、説明文、CTA 文言を調整する。
3. 必要に応じて視覚的強調を加える。

#### 成果物

- 更新済み UI 差分

#### 完了条件

- full page で rerun 入口を説明なしでも見つけやすい構成になっている。

### Phase 3: 画面検証と文書同期

#### 目的

改善内容を再利用できる形で固定する。

#### 手順

1. representative screenshot または manual verification を取得する。
2. 必要に応じて `ui-ux-settings.md`、`ui-ux-navigation.md`、`lessons-learned.md` を更新する。
3. タスク完了時は未タスク参照先と status を同期する。

#### 成果物

- 検証証跡
- 必要に応じた system spec 更新

#### 完了条件

- 改善前後の差分と意図を説明できる。
- 文書上で rerun 導線の責務と UI 改善点が残っている。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] rerun card の配置または grouping が改善されている
- [ ] CTA の意味が説明文込みで分かる
- [ ] rerun の内部契約は変更していない

### 品質要件

- [ ] full settings page 観点で発見性が改善されている
- [ ] representative screenshot または manual verification を残している
- [ ] UI 改善が onboarding state 契約を侵食していない

### ドキュメント要件

- [ ] 必要に応じて `ui-ux-settings.md` を更新している
- [ ] 必要に応じて `ui-ux-navigation.md` / `lessons-learned.md` も同期している
- [ ] 改善理由を文書で説明できる

---

## 6. 検証方法

### テストケース

| テストケース   | 目的                                                       |
| -------------- | ---------------------------------------------------------- |
| rerun 入口視認 | Settings を開いたときに rerun 導線を見つけやすいか確認する |
| CTA 理解       | ボタン文言だけで役割が分かるか確認する                     |
| 動作維持       | rerun を押したときの既存契約が壊れていないか確認する       |
| full page 評価 | isolated ではなく full settings page で発見性を確認する    |

### 検証手順

1. Settings 画面を representative state で表示する。
2. rerun 入口の位置、見出し、説明文、CTA を確認する。
3. rerun 実行後に `onboarding.hasCompleted` を保持したまま overlay が再表示されることを確認する。
4. 文書更新を伴う場合は system spec の関連箇所も同期する。

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                     |
| -------------------------------------------------- | ------ | -------- | ---------------------------------------- |
| 見つけやすさ改善のために設定画面全体の構成が崩れる | 中     | 低       | onboarding 周辺の局所改善に限定する      |
| 文言改善で rerun 動作を誤解させる                  | 中     | 中       | 説明文で「再体験できる」ことを明記する   |
| UI 改善のついでに state 契約へ手を入れてしまう     | 高     | 中       | reset 起点と表示判定の責務分離を維持する |

---

## 8. 参照情報

### 関連ドキュメント

- `/.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `/.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`
- `/.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `/.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- TASK-UI-09-ONBOARDING-WIZARD の Phase 11 手動検証結果
- Onboarding rerun representative screenshot

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

rerun card は isolated screenshot では明快だが、full settings page 内では fold 下に落ちやすく、discoverability に改善余地がある。

### 補足事項

このタスクは「機能不全」ではなく「情報設計改善」である。動作完了と discoverability 改善を分離して扱うことが前提になる。
