# TASK-9F validateImport 追加 - タスク指示書

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | UT-9F-VALIDATE-IMPORT-001                    |
| タスク名     | `validateImport(skillPath)` 公開メソッド実装 |
| 分類         | 改善                                         |
| 対象機能     | TASK-9F スキル共有・インポート機能           |
| 優先度       | 中                                           |
| 見積もり規模 | 中規模                                       |
| ステータス   | 未実施                                       |
| 発見元       | Phase 10 MINOR-03                            |
| 発見日       | 2026-02-27                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

設計上は `validateImport()` が公開メソッドとして定義されていた。

### 1.2 問題点・課題

現実装は `validateSource()` のみで、インポート済みローカルスキルを検証する専用経路がない。

### 1.3 放置した場合の影響

インポート後の品質確認が呼び出し側実装に分散し、検証基準が統一されない。

---

## 2. 何を達成するか（What）

### 2.1 目的

`validateImport(skillPath)` を実装し、インポート済みスキル検証の標準APIを提供する。

### 2.2 最終ゴール

- SKILL.mdの存在/構造/必須項目を統一検証
- `ShareResult` で一貫した戻り値を返却

### 2.3 スコープ

#### 含むもの

- `validateImport()` 実装
- `ImportValidation` 型定義
- 必要に応じた IPC 公開

#### 含まないもの

- AIによる内容評価
- 自動修正機能

### 2.4 成果物

- `SkillShareManager.ts` の機能追加
- 関連型とテスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 既存 `validateSource()` の挙動を把握済みであること

### 3.2 依存タスク

- 依存なし

### 3.3 必要な知識

- SKILL.md 構造
- P42 3段バリデーション

### 3.4 推奨アプローチ

`validateSource()` の再利用可能部分を共通化し、重複実装を避ける。

---

## 4. 実行手順

### Phase構成

- Phase A: API設計
- Phase B: 実装
- Phase C: テスト

### Phase A: API設計

#### 目的

戻り値仕様を確定する。

#### 手順

1. `ImportValidation` 型を定義する。
2. エラーコードと警告項目を設計する。

#### 成果物

型定義更新。

#### 完了条件

戻り値契約が固定される。

### Phase B: 実装

#### 目的

`validateImport(skillPath)` を実装する。

#### 手順

1. `skillPath` の P42 バリデーションを追加。
2. SKILL.md の存在/構造/必須項目を検証。
3. `ShareResult` で返却。

#### 成果物

`SkillShareManager.ts` 更新。

#### 完了条件

主要分岐が実装される。

### Phase C: テスト

#### 目的

回帰なしを保証する。

#### 手順

1. 正常/異常の単体テストを追加。
2. 既存テストを再実行する。

#### 成果物

追加テスト・実行結果。

#### 完了条件

全テスト PASS。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `validateImport()` が実装されている
- [ ] SKILL.md 不存在時に適切な失敗を返す
- [ ] 必須項目不足時に失敗を返す

### 品質要件

- [ ] 既存 API 契約を破壊しない
- [ ] P42 に準拠する

### ドキュメント要件

- [ ] 仕様書（interfaces/api/task-workflow）の必要箇所を更新

---

## 6. 検証方法

### テストケース

- 有効な skillPath
- 無効な skillPath（空文字/空白/不存在）
- 不正な SKILL.md 構造

### 検証手順

1. `pnpm --filter @repo/desktop test:run -- src/main/services/skill/__tests__/SkillShareManager.test.ts`
2. `pnpm --filter @repo/desktop typecheck`

---

## 7. リスクと対策

| リスク                    | 影響度 | 発生確率 | 対策                               |
| ------------------------- | ------ | -------- | ---------------------------------- |
| validateSource と責務重複 | 中     | 中       | 共通化ヘルパーを導入し責務を分離   |
| エラーコード重複          | 低     | 中       | 既存コード体系へマッピング表を追加 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-share/outputs/phase-2/api-specification.md`
- `docs/30-workflows/skill-share/outputs/phase-10/final-review-result.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md#P42`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

`MINOR-03: validateImport 公開メソッド未実装`

### 補足事項

IPC公開は運用要件（外部呼び出し必要性）を確認してから行う。
