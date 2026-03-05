# Phase 4 監査テストケース

## 1. テストケース一覧（SubAgent-TEST-CASE）

| TC-ID      | 粒度         | 監査対象         | 観点                 | 期待結果                     |
| ---------- | ------------ | ---------------- | -------------------- | ---------------------------- |
| TC-AUD-001 | 章単位       | task-050 Task1   | token/theme定義      | 00系仕様へ反映経路が存在     |
| TC-AUD-002 | 章単位       | task-050 Task2   | Atomic Design境界    | 00-2/00-3/00-4へ責務分解済み |
| TC-AUD-003 | 章単位       | task-050 Task3   | icon統一             | 画面仕様にicon方針が反映     |
| TC-AUD-004 | 章単位       | task-050 Task4   | responsive           | breakpoint要件が反映         |
| TC-AUD-005 | 章単位       | task-050 Task5   | WCAG/ARIA/keyboard   | a11y要件が反映               |
| TC-AUD-006 | 章単位       | task-050 Task5C  | micro interaction    | token/animation要件が反映    |
| TC-AUD-007 | 章単位       | task-050 Task5D  | UX言語               | 画面仕様に語彙変換表あり     |
| TC-AUD-008 | 章単位       | task-050 Task5B  | error/offline        | エラー表示方針が反映         |
| TC-AUD-009 | 章単位       | task-050 Task6   | test strategy        | テスト戦略が反映             |
| TC-AUD-101 | ファイル単位 | 00-1             | 正本参照導線         | 自己参照でない正本導線がある |
| TC-AUD-102 | ファイル単位 | 00-2             | Atoms仕様            | Task2/4/5/6の反映証跡あり    |
| TC-AUD-103 | ファイル単位 | 00-3             | Molecules仕様        | Task2/3/4/5/6の反映証跡あり  |
| TC-AUD-104 | ファイル単位 | 00-4             | Organisms仕様        | Task2/4/5/6の反映証跡あり    |
| TC-AUD-201 | ファイル単位 | task-057         | nav + a11y           | ARIA/responsive記述あり      |
| TC-AUD-202 | ファイル単位 | task-058b        | error/offline + WCAG | エラー表示とa11y記述あり     |
| TC-AUD-203 | ファイル単位 | task-058d        | UX言語 + theme       | 5D語彙 + theme要件あり       |
| TC-AUD-301 | リンク単位   | Phase 1〜3成果物 | 参照リンク整合       | 参照パスが実在する           |
| TC-AUD-302 | リンク単位   | 監査証跡         | `path:line`形式      | 全行が形式準拠               |
| TC-AUD-303 | リンク単位   | 判定語彙         | enum制約             | 3状態のみ使用                |

## 2. 同義語辞書（RV-002対策）

| 反映元語彙     | 反映先許容語彙 |
| -------------- | -------------- |
| ダッシュボード | ホーム         |
| スキル         | ツール         |
| エージェント   | AIアシスタント |
| ワークスペース | 作業スペース   |
| コンテキスト   | 背景情報       |

## 3. 実行優先度

- 優先A: `TC-AUD-001`〜`TC-AUD-009`, `TC-AUD-101`, `TC-AUD-301`
- 優先B: `TC-AUD-102`〜`TC-AUD-203`
- 優先C: `TC-AUD-302`, `TC-AUD-303`

## 4. Task 100% 実行確認

- [x] 章単位ケースを作成
- [x] ファイル単位ケースを作成
- [x] リンク単位ケースを作成
- [x] RV-001/RV-002対策をケース化
