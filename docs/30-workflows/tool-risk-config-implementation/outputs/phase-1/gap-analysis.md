# Phase 1: 差分分析レポート（プロトタイプ vs Issue #1251）

## メタ情報

| 項目     | 内容       |
| -------- | ---------- |
| タスクID | UT-06-001  |
| Phase    | 1          |
| 作成日   | 2026-03-16 |

## 1. プロトタイプ（TASK-SKILL-LIFECYCLE-06 Phase 5）の概要

- **型名**: `ToolRiskLevel` = `"critical" | "high" | "medium" | "low"`（4段階）
- **インターフェース名**: `ToolRiskConfig`
- **フィールド**: `level`, `allowApproveOnce`, `allowPermanent`, `autoDenyDefault`, `headerColorToken`, `dialogWidth`
- **特徴**: `critical` レベルで自動拒否（`autoDenyDefault: true`）

## 2. Issue #1251 の要件

- **型名**: `RiskLevel` = `"low" | "medium" | "high"`（3段階）
- **インターフェース名**: `ToolRiskConfigEntry`
- **フィールド**: `dialogWidth`, `headerColorToken`, `allowPermanent`, `allowTime24h`, `allowTime7d`
- **特徴**: `critical` レベルなし、時間制限許可（24h/7d）フィールドを追加

## 3. 差分一覧

| 項目                          | プロトタイプ（4段階）             | Issue #1251（3段階）     | 差分                           |
| ----------------------------- | --------------------------------- | ------------------------ | ------------------------------ |
| リスクレベル数                | 4段階（critical/high/medium/low） | 3段階（low/medium/high） | critical を削除                |
| 型名                          | `ToolRiskLevel`                   | `RiskLevel`              | 名称変更                       |
| インターフェース名            | `ToolRiskConfig`                  | `ToolRiskConfigEntry`    | 名称変更                       |
| `level` フィールド            | あり（冗長）                      | なし                     | 削除（キーで判別可能）         |
| `allowApproveOnce` フィールド | あり                              | なし                     | 削除（常にtrue前提）           |
| `autoDenyDefault` フィールド  | あり                              | なし                     | 削除（critical削除に伴い不要） |
| `allowTime24h` フィールド     | なし                              | あり                     | 新規追加                       |
| `allowTime7d` フィールド      | なし                              | あり                     | 新規追加                       |
| `headerColorToken` 値         | `--status-*` 形式                 | `--risk-*` 形式          | 命名体系変更                   |
| `dialogWidth` 値（low）       | 400                               | 400                      | 同一                           |
| `dialogWidth` 値（medium）    | 400                               | 480                      | 変更（medium を差別化）        |
| `dialogWidth` 値（high）      | 480                               | 640                      | 変更（high を最大幅に）        |

## 4. デシジョンテーブルとの整合性確認

Phase 4 デシジョンテーブル セクション7「失効ポリシー × リスクレベル 組合せ制約マトリクス」を参照:

| リスクレベル | session | time_24h | time_7d | permanent |
| ------------ | ------- | -------- | ------- | --------- |
| high         | 可      | 可       | 不可    | 不可      |
| medium       | 可      | 可       | 可      | 可        |
| low          | 可      | 可       | 可      | 可        |

**`allowTime24h` / `allowTime7d` フィールドの妥当性**: デシジョンテーブルの制約マトリクスと整合する。high リスクでは `time_7d` と `permanent` が不可であるため、Issue #1251 の `allowTime24h: false` / `allowTime7d: false` は妥当である。ただし、デシジョンテーブルでは high の `time_24h` は「可」だが、Issue #1251 では `allowTime24h: false` としている。これは Issue の受入基準を優先する判断とする（high リスクではセッション内の一時許可のみ許容し、時間制限許可を全て禁止するフェイルセキュア方針）。

## 5. 統合方針

**方針: Issue #1251 の受入基準をベースとし、プロトタイプの設計意図を維持する**

| 決定事項                                                | 根拠                                                     |
| ------------------------------------------------------- | -------------------------------------------------------- |
| 3段階（low/medium/high）を採用                          | Issue #1251 の受入基準に従う                             |
| `critical` レベルは本タスクのスコープ外                 | 後続タスクで必要になった場合に別タスクで対応             |
| `allowTime24h` / `allowTime7d` を追加                   | 時間制限許可の制御を可能にする（デシジョンテーブル準拠） |
| `level` / `allowApproveOnce` / `autoDenyDefault` は削除 | Issue #1251 のインターフェース定義に従う                 |
| `headerColorToken` は `--risk-*` 形式                   | Issue #1251 の命名体系に従う                             |
| high の全 allow フラグを false                          | フェイルセキュア原則に準拠                               |
