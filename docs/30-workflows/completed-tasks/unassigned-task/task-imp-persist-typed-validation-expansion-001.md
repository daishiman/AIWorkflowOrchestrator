# UT-IMP-PERSIST-TYPED-VALIDATION-EXPANSION-001 - タスク指示書

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | UT-IMP-PERSIST-TYPED-VALIDATION-EXPANSION-001 |
| タスク名     | persist 対象フィールドの型検証拡張            |
| 分類         | 改善                                          |
| 対象機能     | Renderer Store persist 復元                   |
| 優先度       | 中                                            |
| 見積もり規模 | 中規模                                        |
| ステータス   | 未実施                                        |
| 発見元       | Phase 12                                      |
| 発見日       | 2026-03-08                                    |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-07 では `viewHistory` と `expandedFolders` のみ型防御を導入した。

### 1.2 問題点・課題

他の persist 対象（`selectedFile`, `userProfile`, `autoSyncEnabled` 等）の型破損耐性が未統一。

### 1.3 放置した場合の影響

別フィールド由来の復元失敗が再発し、同種障害の再検証コストが増える。

## 2. 何を達成するか（What）

### 2.1 目的

persist 復元時の型ガードを全主要フィールドへ横展開する。

### 2.2 最終ゴール

partialize 対象フィールドで非期待型入力が来てもクラッシュせず既定値復旧する。

### 2.3 スコープ

#### 含むもの

- `store/index.ts` の persist 復元ガード
- 破損フィールド fixture テスト

#### 含まないもの

- UI仕様の変更
- IPC契約の変更

### 2.4 成果物

- 型ガード拡張実装
- 異常系テスト
- 仕様書更新

## 3. どのように実行するか（How）

### 3.1 前提条件

既存 guard 実装の挙動を壊さないこと。

### 3.2 依存タスク

- UT-IMP-PERSIST-MIGRATION-VERSIONING-001（推奨）

### 3.3 必要な知識

TypeScript predicate、runtime validation、Zustand persist。

### 3.4 推奨アプローチ

フィールドごとに validator 関数を分離し、fallback ルールを明示する。

## 4. 実行手順

### Phase構成

Phase 1: 対象棚卸し → Phase 2: validator 実装 → Phase 3: テスト → Phase 4: 仕様同期

### Phase 1: 対象棚卸し

#### 目的

guard 対象フィールドと期待型を明確化する。

#### 手順

1. partialize 対象を一覧化する。
2. フィールドごとの期待型を定義する。
3. fallback 値を決める。

#### 成果物

型マトリクス。

#### 完了条件

対象フィールドの型契約が文書化済み。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 主要 persist フィールドに guard が追加されている
- [ ] 非期待型でクラッシュしない

### 品質要件

- [ ] 破損入力テストが PASS
- [ ] lint/typecheck が PASS

### ドキュメント要件

- [ ] `arch-state-management.md` と `lessons-learned.md` を同期

## 6. 検証方法

### テストケース

- null/undefined/number/object/string を各対象フィールドに注入

### 検証手順

1. unit test 実行
2. manual screenshot 再確認（必要時）

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                         |
| -------------------------- | ------ | -------- | ---------------------------- |
| 過防御で正常データを捨てる | 中     | 低       | 期待型を文書化しテストで固定 |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
expandedFolders/viewHistory 以外の persist 対象にも型ガードを横展開すべき。
```

### 補足事項

scope 拡大時は段階導入し、影響の大きいフィールドから優先する。
