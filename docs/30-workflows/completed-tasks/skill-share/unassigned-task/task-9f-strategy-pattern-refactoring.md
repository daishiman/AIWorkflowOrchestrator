# TASK-9F Strategy 分離 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-9F-STRATEGY-REFACTOR-001                |
| タスク名     | SkillShareManager の Strategy パターン分離 |
| 分類         | リファクタリング                           |
| 対象機能     | TASK-9F スキル共有・インポート機能         |
| 優先度       | 低                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 10 MINOR-02                          |
| 発見日       | 2026-02-27                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

設計では Strategy 分離だったが、実装は private メソッド統合で完了した。

### 1.2 問題点・課題

ソース種別増加時に `SkillShareManager` 本体の修正が増え、OCP違反になりやすい。

### 1.3 放置した場合の影響

機能拡張時の変更範囲が拡大し、回帰リスクが高まる。

---

## 2. 何を達成するか（What）

### 2.1 目的

import/export ロジックを Strategy に分離し、拡張時の変更局所性を確保する。

### 2.2 最終ゴール

- `SkillShareManager` の switch/分岐を薄くする
- 新ソース追加時に Strategy 追加のみで対応可能にする

### 2.3 スコープ

#### 含むもの

- `ImportStrategy` / `ExportStrategy` インターフェース
- 既存 4 import / 2 export ロジックの具象クラス化

#### 含まないもの

- 新ソースタイプ自体の追加

### 2.4 成果物

- `strategies/` 配下の新規クラス群
- Strategy 単体テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 現行92テストが基準として PASS していること

### 3.2 依存タスク

- 依存なし

### 3.3 必要な知識

- Strategy Pattern
- TypeScript DI

### 3.4 推奨アプローチ

まず既存ロジックを移植し、動作一致を担保してからクリーンアップする。

---

## 4. 実行手順

### Phase構成

- Phase A: Strategy 抽出
- Phase B: 呼び出し置換
- Phase C: テスト補強

### Phase A: Strategy 抽出

#### 目的

既存ロジックをインターフェースへ移す。

#### 手順

1. `ImportStrategy` / `ExportStrategy` を定義する。
2. 6つの具象クラスを作成する。
3. 既存 private メソッドを移植する。

#### 成果物

`strategies/` 実装群。

#### 完了条件

既存ロジックの振る舞い差分がない。

### Phase B: 呼び出し置換

#### 目的

`SkillShareManager` から Strategy を利用する。

#### 手順

1. Strategy Map を初期化する。
2. `importFromSource` / `exportSkill` の分岐を置換する。
3. エラーハンドリングの整合を確認する。

#### 成果物

`SkillShareManager.ts` の分岐置換。

#### 完了条件

switch 文依存が除去されている。

### Phase C: テスト補強

#### 目的

回帰とStrategy単位の品質を保証する。

#### 手順

1. Strategy 単体テストを追加する。
2. 既存92テストを回帰実行する。

#### 成果物

テスト追加・結果ログ。

#### 完了条件

既存/新規テストがすべて PASS。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Strategy インターフェースが追加されている
- [ ] 6具象 Strategy が実装されている
- [ ] SkillShareManager 本体分岐が Strategy 経由になっている

### 品質要件

- [ ] 新規ソース拡張時の変更点が Strategy 追加のみ
- [ ] 既存回帰テストが PASS

### ドキュメント要件

- [ ] 設計差分を Phase 8/10 系ドキュメントに追記

---

## 6. 検証方法

### テストケース

- 各Strategyの正常系/異常系
- SkillShareManager 経由の統合フロー

### 検証手順

1. `pnpm --filter @repo/desktop test:run -- src/main/services/skill/__tests__/SkillShareManager.test.ts`
2. `pnpm --filter @repo/desktop test:run -- src/main/services/skill/__tests__/SkillShareManager.integration.test.ts`

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                                           |
| -------------------- | ------ | -------- | ---------------------------------------------- |
| 抽出時の挙動差分混入 | 中     | 中       | テストを先に固定して移植する                   |
| 過剰抽象化           | 低     | 中       | ソース種別増加条件を満たさない場合は適用見送り |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-share/outputs/phase-2/architecture-design.md`
- `docs/30-workflows/skill-share/outputs/phase-8/refactoring-report.md`

### 参考資料

- OCP（Open-Closed Principle）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

`MINOR-02: Strategy 分離未適用（OCP観点）`

### 補足事項

Phase 8 判定（現状維持）との整合を取るため、適用条件を明文化してから着手する。
