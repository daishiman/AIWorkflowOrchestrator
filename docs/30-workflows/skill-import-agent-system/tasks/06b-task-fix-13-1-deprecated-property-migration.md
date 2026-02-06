# deprecatedプロパティ移行 - タスク指示書

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION |
| タスク名     | deprecated型プロパティの正式移行            |
| 分類         | リファクタリング                            |
| 対象機能     | 共有型定義（skill.ts）                      |
| 優先度       | 低                                          |
| 見積もり規模 | 小規模                                      |
| ステータス   | 未実施                                      |
| 実行順序     | 06b（並列可能 — 05b完了後）                 |
| 発見元       | skill-system-conflict-report #13            |
| 発見日       | 2026-02-05                                  |
| 関連Phase    | Phase 4（品質向上）                         |
| 関連Issue    | -                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`packages/shared/src/types/skill.ts` に `@deprecated` マーク付きのプロパティが残存しており、推奨代替プロパティとの二重定義状態。

### 1.2 問題点・課題

| 行       | プロパティ          | 推奨代替       | 状態                        |
| -------- | ------------------- | -------------- | --------------------------- |
| L14-15   | `Anchor.name`       | `source`       | deprecated だが参照箇所あり |
| L100-101 | `Skill.lastUpdated` | `lastModified` | deprecated だが参照箇所あり |

### 1.3 放置した場合の影響

- 新規コードが deprecated プロパティを使用するリスク
- 型定義の肥大化
- IDE の警告ノイズ

---

## 2. 何を達成するか（What）

### 2.1 目的

deprecated プロパティの全参照箇所を推奨代替に移行し、deprecated 定義を削除する。

### 2.2 最終ゴール

1. `Anchor.name` の全参照が `Anchor.source` に移行
2. `Skill.lastUpdated` の全参照が `Skill.lastModified` に移行
3. deprecated 定義が削除されている

### 2.3 スコープ

#### 含むもの

- 型定義の deprecated プロパティ削除
- 全参照箇所の移行
- テスト修正

#### 含まないもの

- 新しいプロパティの追加
- 型のリネーム

### 2.4 成果物

| 成果物              | 説明                      |
| ------------------- | ------------------------- |
| 修正された skill.ts | deprecated プロパティ削除 |
| 修正された参照箇所  | 推奨代替プロパティを使用  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- なし（独立して着手可能）

### 3.2 依存タスク

- なし

### 3.3 推奨アプローチ

1. `grep -rn "\.name" --include="*.ts"` で `Anchor.name` の参照箇所を特定
2. `grep -rn "lastUpdated" --include="*.ts"` で `Skill.lastUpdated` の参照箇所を特定
3. 各箇所を推奨代替に置き換え
4. deprecated 定義を削除

---

## 4. 実行手順

### Step 1: 参照箇所の特定

#### 手順

1. `Anchor.name` の全参照を `grep` で特定（`source` との区別に注意）
2. `Skill.lastUpdated` の全参照を `grep` で特定

### Step 2: 移行

#### 手順

1. `Anchor.name` → `Anchor.source` に置き換え
2. `Skill.lastUpdated` → `Skill.lastModified` に置き換え
3. テスト内の参照も修正

### Step 3: deprecated 定義の削除

#### 手順

1. `skill.ts` から deprecated プロパティを削除
2. TypeScript コンパイル成功確認
3. テスト PASS 確認

---

## 5. 完了条件チェックリスト

- [ ] `Anchor.name` の deprecated 定義が削除
- [ ] `Skill.lastUpdated` の deprecated 定義が削除
- [ ] 全参照箇所が推奨代替を使用
- [ ] 全テストが PASS

---

## 6. 検証方法

1. `grep -rn "Anchor\.name\b" --include="*.ts"` で型定義以外の参照なし
2. `grep -rn "lastUpdated" --include="*.ts"` で該当なし
3. テストスイート PASS

---

## 7. リスクと対策

| リスク                    | 影響度 | 発生確率 | 対策                    |
| ------------------------- | ------ | -------- | ----------------------- |
| `name` プロパティの誤検出 | 低     | 中       | Anchor 型スコープで検索 |
| 外部連携での後方互換性    | 低     | 低       | 内部使用のみ確認        |

---

## 8. 参照情報

### 関連ドキュメント

- `packages/shared/src/types/skill.ts` L14-15, L100-101

---

## 9. 備考

後方互換性が不要な内部型のため、deprecated → 削除を直接実施可能。外部 API で公開されている場合は段階的な廃止が必要だが、本プロジェクトでは内部型のみ。
