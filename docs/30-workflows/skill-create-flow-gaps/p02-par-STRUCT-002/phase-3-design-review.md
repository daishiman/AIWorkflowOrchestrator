# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 3                                             |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | Phase 2                                       |
| 後続Phase  | Phase 4                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | completed                                     |

## 目的

Phase 2 の設計内容をレビューし、実装に進む前の品質ゲートを通過させる。
受け入れ基準充足・null フォールバック安全性・TASK-SW-STRUCT-001 依存整合を確認する。

## 実行タスク

- Phase 2 設計の整合性レビュー
- AC-1〜AC-5 との対応確認
- null フォールバック設計の安全性確認
- TASK-SW-STRUCT-001 依存関係の確認
- ゲート判定（PASS / MINOR / MAJOR）

## 参照資料

| 資料名            | パス                                                                                  | 用途                                |
| ----------------- | ------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 成果物    | `outputs/phase-1/requirements.md`                                                     | AC 参照                             |
| Phase 2 設計書    | `outputs/phase-2/design.md`                                                           | レビュー対象                        |
| phase-3-review.md | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-3-review.md` | TASK-SW-STRUCT-002 のタスク粒度確認 |

## 実行手順

### 1. AC 充足確認

| AC   | 設計書での対応箇所                                                           | 充足判定 |
| ---- | ---------------------------------------------------------------------------- | -------- |
| AC-1 | 「`void structurePlan` 削除設計」セクションで対応                            | 確認要   |
| AC-2 | 「`structurePlan` → `plan` オブジェクト接続の分岐設計」セクションで対応      | 確認要   |
| AC-3 | フォールバック設計（`structurePlan === null` の条件分岐）で対応              | 確認要   |
| AC-4 | null フォールバック設計セクションで対応                                      | 確認要   |
| AC-5 | `collaborative` モードが `structurePlan === null` でフォールバックを使う設計 | 確認要   |

### 2. null フォールバック安全性の確認

以下を確認する:

| 確認観点                      | 確認内容                                                                  |
| ----------------------------- | ------------------------------------------------------------------------- |
| `structurePlan !== null` の型 | TypeScript が `null` チェックを適切に型ガードとして認識するか             |
| `anchors ?? []` の安全性      | `StructurePlanJson.anchors` がオプショナル型であれば `??` が適切か        |
| `collaborative` モードの分離  | `collaborative` モードで `structurePlan` が `null` のままになることを確認 |

### 3. TASK-SW-STRUCT-001 依存確認

- TASK-SW-STRUCT-001 完了後の `structurePlan` の内容（`purpose` / `skillName` / `description`）が
  本タスクの `plan` オブジェクト生成に正しく利用される設計か確認する
- Phase 5（実装）開始前に TASK-SW-STRUCT-001 の完了を確認する Gate が設計に含まれているか確認する

### 4. simpler alternative の検討

```typescript
// 現設計: 三項演算子による分岐
const plan = structurePlan !== null ? { ...create モード用... } : { ...フォールバック... };

// 代替案: if/else による分岐
let plan;
if (structurePlan !== null) {
  plan = { ...create モード用... };
} else {
  plan = { ...フォールバック... };
}
```

**判断**: 三項演算子でも if/else でも可読性は同等。`const` を維持できる三項演算子を推奨とする。

### 5. ゲート判定

| 判定      | 基準                                                      | 条件                     |
| --------- | --------------------------------------------------------- | ------------------------ |
| **PASS**  | 全 AC が設計で対応済み・null 安全性確認済み・依存確認済み | Phase 4 へ進む           |
| **MINOR** | 軽微な設計漏れ（コメント・命名等）                        | Phase 4 で対応しつつ継続 |
| **MAJOR** | AC 未対応・null 不安全・依存確認漏れ                      | Phase 2 へ戻る           |

#### MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （発生時に記載） | -        | -             | -             | -    |

### 6. Phase 4 開始条件・Phase 13 blocked 条件

**Phase 4 開始条件**:

- [ ] Phase 3 ゲート判定が PASS または MINOR
- [ ] 全ての MAJOR 指摘が解消されている

**Phase 13 blocked 条件**:

- commit / push / PR 作成はユーザー承認後のみ実行
- Phase 13 は常に blocked 状態で開始する

## 統合テスト連携【必須】

統合テスト観点のレビューゲートを実施。

| 判定項目                    | 基準     | 結果    |
| --------------------------- | -------- | ------- |
| AC-1〜AC-5 の設計対応       | 全AC対応 | pending |
| null 安全性確認             | 確認済み | pending |
| TASK-SW-STRUCT-001 依存確認 | 確認済み | pending |

## 多角的チェック観点

| 観点                | チェック内容                                                                   |
| ------------------- | ------------------------------------------------------------------------------ |
| 後方互換性          | `collaborative` モードのフォールバック動作が設計で保証されているか             |
| 型安全性            | `structurePlan !== null` による型ガードが TypeScript で有効に機能するか        |
| simpler alternative | 三項演算子 vs if/else の選択が理由とともに記録されているか                     |
| STRUCT-001 前提     | STRUCT-001 完了後の `structurePlan` の内容が本タスクの設計前提と一致しているか |

## 成果物

| 成果物         | パス                        | 説明                        |
| -------------- | --------------------------- | --------------------------- |
| ゲート判定結果 | `outputs/phase-3/review.md` | PASS/MINOR/MAJOR 判定と理由 |

## 完了条件

- [ ] AC-1〜AC-5 の設計対応が確認済み
- [ ] null フォールバック安全性の確認が完了済み
- [ ] TASK-SW-STRUCT-001 依存確認が完了済み
- [ ] simpler alternative の検討が記録済み
- [ ] ゲート判定（PASS / MINOR / MAJOR）が記録されている
- [ ] Phase 4 開始条件が明確
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. AC 充足確認（AC-1〜AC-5 の設計対応確認）
2. null フォールバック安全性の確認
3. TASK-SW-STRUCT-001 依存確認
4. simpler alternative の検討
5. ゲート判定（PASS / MINOR / MAJOR）
6. MINOR 追跡テーブルの作成（発生時）
7. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 4: テスト作成
