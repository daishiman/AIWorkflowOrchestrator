# UT-UI-ATOMS-PROP-NAMING-001 - タスク指示書

## メタ情報

```yaml
issue_number: 883
```

## メタ情報

| 項目         | 値                                                                       |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-UI-ATOMS-PROP-NAMING-001                                              |
| タスク名     | RelativeTime Props命名統一（仕様書updateInterval → 実装refreshInterval） |
| 分類         | 改善                                                                     |
| 対象機能     | RelativeTimeコンポーネント                                               |
| 優先度       | 低                                                                       |
| 見積もり規模 | 小規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | TASK-UI-00-ATOMS Phase 10 MINOR指摘 M-1                                  |
| 発見日       | 2026-02-22                                                               |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-00-ATOMS（Atomsコンポーネント一括実装タスク）の Phase 10 最終レビューにおいて、RelativeTime コンポーネントの仕様書上の Props 名 `updateInterval` と実装上の Props 名 `refreshInterval` の不一致が MINOR 指摘（M-1）として検出された。

仕様書（`00-2-atoms-components.md` Task 7）では自動更新間隔の Props 名を `updateInterval` と定義していたが、Phase 5 実装時に `refreshInterval` という名称で実装された。TypeScript コンパイルでは Props 名の仕様書との整合性は検証されないため、Phase 10 まで発見されなかった。

### 1.2 問題点・課題

- 仕様書と実装の Props 名が不一致（`updateInterval` vs `refreshInterval`）
- 新規開発者が仕様書を参照して `updateInterval` を使用した場合、TypeScript エラーとなり原因特定に時間がかかる
- 仕様書と実装の命名ドリフトは、仕様書全体の信頼性を低下させる

### 1.3 放置した場合の影響

- 仕様書を信頼して開発した場合に Props 名の不一致で実装エラーが発生する
- コードレビュー時に「仕様書と実装のどちらが正しいのか」の判断で無駄な議論が発生する
- 仕様書の信頼性が低下し、仕様書を参照する文化そのものが形骸化するリスクがある

## 2. 何を達成するか（What）

### 2.1 目的

RelativeTime コンポーネントの仕様書上の Props 名を実装に合わせて `refreshInterval` に統一し、仕様書と実装の命名不一致を解消する。

### 2.2 最終ゴール

- 仕様書の RelativeTime セクションで `updateInterval` が `refreshInterval` に修正されている
- 仕様書・実装・テストの3箇所で Props 名が完全に一致している

### 2.3 スコープ

**含むもの:**

- `00-2-atoms-components.md` の RelativeTime セクション（Task 7）における Props 名修正
- 修正後のテスト実行確認

**含まないもの:**

- RelativeTime コンポーネントの実装変更（実装側は既に `refreshInterval` で正しい）
- テストコードの変更（テストは既に `refreshInterval` を使用している）
- 他のコンポーネントの Props 名突合チェック（別タスクとして検討）

### 2.4 成果物

| #   | 成果物         | パス                                                                                        |
| --- | -------------- | ------------------------------------------------------------------------------------------- |
| 1   | 修正済み仕様書 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` |

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx` が `refreshInterval` を Props 名として使用していること（確認済み）
- `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx` が `refreshInterval` を使用していること（確認済み）

### 3.2 依存タスク

なし（独立して実行可能）

### 3.3 必要な知識

- RelativeTime コンポーネントの Props インターフェース定義
- 仕様書の記載箇所（Task 7 セクション）

### 3.4 推奨アプローチ

1. 仕様書 `00-2-atoms-components.md` を開き、RelativeTime セクション（Task 7）を検索
2. `updateInterval` の全出現箇所を `refreshInterval` に置換
3. インターフェース定義部分と説明文の両方を修正
4. テストを実行して既存動作に影響がないことを確認

## 3.5 実装課題と解決策（親タスクからの教訓）【重要】

### 課題1: Props命名の仕様-実装間ドリフト

| 項目     | 内容                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 課題     | 仕様書で `updateInterval` と定義した Props 名が、実装では `refreshInterval` に変更された。TypeScript コンパイルでは検出不可能 |
| 発見経緯 | Phase 10 最終レビューで発覚。Phase 4 テスト作成時に仕様書を直接参照して突合チェックすべきだった                               |
| 解決策   | Phase 3 設計レビュー時に仕様書の型定義と実装の interface 定義を並べて比較する運用を導入                                       |
| 教訓     | Props 命名は TypeScript の型システムだけでは守れない。仕様-実装間の「命名ドリフト」は目視確認による突合チェックが必要         |

### 課題2: P46（HTMLAttributes Props型衝突パターン）

| 項目     | 内容                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | Badge コンポーネントで `content?: string \| number` が HTML 標準属性 `content?: string` と衝突し TS2430 エラーが発生                        |
| 発見経緯 | Badge 実装時に TypeScript コンパイルエラーとして即座に検出                                                                                  |
| 解決策   | `Omit<React.HTMLAttributes<HTMLSpanElement>, "content">` で衝突属性を除外してからカスタム型を定義                                           |
| 教訓     | Props 定義時に HTML 標準属性との名前衝突を事前チェック。衝突しやすい属性: `content`, `color`, `translate`, `hidden`, `title`, `dir`, `slot` |

### 課題3: P47（CSS変数テストアサーション戦略）

| 項目     | 内容                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| 課題     | `bg-[var(--status-primary)]` のような CSS 変数参照をテストで直接比較すると可読性低下・メンテナンスコスト増大      |
| 発見経緯 | Badge / StatusIndicator のテスト作成時にアサーション文字列が長大化し問題を認識                                    |
| 解決策   | `variantStyles` を `Record<Variant, string>` 型でモジュールスコープ定数として export し、テストで import して参照 |
| 教訓     | デザイントークン変更時の修正範囲を1箇所に限定。テスト側は定数参照で期待値生成                                     |

## 4. 実行手順（Phase構成）

### Phase 1: 仕様書修正

1. `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` を開く
2. RelativeTime セクション（Task 7）を特定
3. `updateInterval` の全出現箇所を `refreshInterval` に置換
4. インターフェース定義部分の Props 名修正
5. 説明文中の Props 名修正

### Phase 2: 検証

1. `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/RelativeTime/` を実行
2. 全テストが PASS することを確認
3. 実装コード（`index.tsx`）の Props 名が `refreshInterval` であることを再確認

### Phase 3: ドキュメント整合性確認

1. `grep -rn "updateInterval" docs/` で他の仕様書に旧名称が残っていないか確認
2. 残存箇所があれば同時に修正

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 仕様書の RelativeTime セクション（Task 7）で `updateInterval` → `refreshInterval` に修正済み
- [ ] インターフェース定義部分の Props 名が `refreshInterval` に統一
- [ ] 説明文中の Props 名が `refreshInterval` に統一

### 品質要件

- [ ] 実装コードの Props 名 `refreshInterval` と仕様書が一致
- [ ] テストコードの Props 名 `refreshInterval` と仕様書が一致
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/RelativeTime/` が PASS

### ドキュメント要件

- [ ] 他の仕様書に `updateInterval`（RelativeTime 関連）の残存がないことを確認
- [ ] 修正内容が仕様書の文脈として自然であることを確認

## 6. 検証方法

### テストケース

| #   | テストケース                         | 期待結果                           |
| --- | ------------------------------------ | ---------------------------------- |
| 1   | 仕様書内で `updateInterval` を grep  | 0件（全て修正済み）                |
| 2   | 仕様書内で `refreshInterval` を grep | RelativeTime セクションに記載あり  |
| 3   | RelativeTime テスト実行              | 全テスト PASS                      |
| 4   | 実装の Props interface 確認          | `refreshInterval` が定義されている |

### 検証手順

1. `grep -n "updateInterval" docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` → 0件であること
2. `grep -n "refreshInterval" docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` → RelativeTime セクションにヒットすること
3. `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/RelativeTime/` → 全 PASS

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                             |
| ---------------------------------------------------- | ------ | -------- | ------------------------------------------------ |
| 仕様書修正時に他の Props 名も不一致が発見される      | 低     | 低       | 修正時に全 Props を一括突合チェック              |
| テストコードが仕様書旧名を参照している               | 低     | 低       | grep で全ファイルを検索し漏れなく更新            |
| P46パターン（HTML属性衝突）が将来の Props 変更で再発 | 中     | 中       | Phase 3 チェックリストに HTML 属性衝突確認を追加 |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md` — パターン 1.5: Props命名ドリフト防止
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` — デザインシステム仕様
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` — S12-S17 Atomsアーキテクチャパターン
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` — Section 13 コンポーネントテストパターン
- `.claude/rules/06-known-pitfalls.md` — P46, P47

### 参考資料

- `apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx` — 実装（refreshInterval使用）
- `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx` — テスト
- `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md` — 仕様書（Task 7）
- `docs/30-workflows/task-ui-00-atoms/outputs/phase-10/final-review-result.md` — Phase 10 MINOR M-1

## 9. 備考

### レビュー指摘の原文

Phase 10 MINOR M-1: 「RelativeTimeコンポーネントの仕様書Props名 `updateInterval` と実装Props名 `refreshInterval` の不一致。機能には影響なし。仕様書側を実装に合わせて修正推奨。」

### 補足事項

- Phase 4（テスト作成）時点で仕様書の Props 名とテストの Props 名の整合をチェックすべきだった
- TypeScript コンパイルだけでは検出不可能な命名ドリフトが起こる可能性がある
- この教訓は `ui-ux-atoms-patterns.md` のパターン 1.5 として体系化済み
