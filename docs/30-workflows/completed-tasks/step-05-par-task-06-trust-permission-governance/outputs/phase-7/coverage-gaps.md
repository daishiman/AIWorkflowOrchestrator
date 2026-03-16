# カバレッジギャップ（未タスク化対象一覧）

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                             |
| Phase      | 7 - カバレッジ確認                                  |
| 作成日     | 2026-03-16                                          |
| 参照成果物 | `outputs/phase-7/coverage-report.md`                |
|            | `outputs/phase-7/uncovered-combinations.md`         |
|            | `outputs/phase-4/decision-table-risk-permission.md` |

---

## 概要

Phase 7 カバレッジ確認の結果、MINOR 判定が 2 件発生した。
本ファイルはその 2 件を未タスク化対象として記録し、Phase 8 以降で着手判断を可能にするための一覧ドキュメントである。

---

## 未タスク化対象: 2 件

| #   | 組合せ          | 未タスクID候補         | 優先度 | 状態   |
| --- | --------------- | ---------------------- | ------ | ------ |
| 1   | high × time_24h | UT-TASK06-HIGH-TIME24H | Low    | 未着手 |
| 2   | high × time_7d  | UT-TASK06-HIGH-TIME7D  | Low    | 未着手 |

---

## 各未タスクの詳細

### UT-TASK06-HIGH-TIME24H: high × time_24h の組合せテスト追加

**背景**:

`decision-table-risk-permission.md` Section 7 によると `high × time_24h` は「可」と定義されている。
しかし現在の設計（Section 5）では high ツールの PermissionDialog に表示されるのは「今回のみ許可」（session ポリシー）のみであり、
24 時間許可（time_24h ポリシー）を選択する UI パスが存在しない。

そのため TC-ST-008 の9サブケースに `high × time_24h` の直接テストが含まれていない。

**追加すべきテスト内容**:

1. `high × time_24h` の UI 到達不可を明示的なテストとして記録する
   - PermissionDialog を `riskLevel="high"` で描画したとき「24時間許可」ボタンが DOM に存在しないことを検証
2. 将来 high ツールへの time_24h ポリシー拡張が行われた際の計算値検証
   - `expiresAt = allowedAt + 86400000` が `high` ツールにも正しく適用されることを検証

**現時点での代替確認**:

`ExpiryPolicyCalculator` のリスクレベル非依存性は TC-ST-008h（medium × time_24h）で確認済み。
計算ロジック自体に問題はないが、high ツールへの適用可否を明示したテストが存在しない。

**着手推奨タイミング**: `high × time_24h` の UI パスが設計に追加されたタイミング、またはリスクレベルごとのポリシー制限仕様が変更されたタイミング。

**影響範囲**:

- `apps/desktop/src/main/handlers/permission/expiry-policy-calculator.test.ts`（追加）
- `apps/desktop/src/renderer/components/permission-dialog/ins-00-permission-badge.test.tsx`（追加）

---

### UT-TASK06-HIGH-TIME7D: high × time_7d の組合せテスト追加

**背景**:

`decision-table-risk-permission.md` Section 7 によると `high × time_7d` は「不可」と定義されている。
根拠は `TOOL_RISK_CONFIG.high.allowPermanent === false` であり、7日間の有期承認は permanent 寄りの長期ポリシーとして禁止される。

現在この「不可」を UI レベルで強制するテスト（7日間許可ボタンが high ツールに対して表示されないことの検証）が存在しない。

**追加すべきテスト内容**:

1. `high × time_7d` の UI 到達不可を明示的なテストとして記録する
   - PermissionDialog を `riskLevel="high"` で描画したとき「7日間許可」ボタンが DOM に存在しないことを検証
2. `TOOL_RISK_CONFIG.high` が `allowPermanent === false` である場合に、`time_7d` ポリシーのエントリが electron-store に書き込まれないことを検証

**設計上の定義との整合性確認が必要な点**:

`decision-table-risk-permission.md` Section 7 では high × time_7d は「不可」と記載されているが、
その理由として「`allowPermanent === false` の帰結として time_7d も不可」と説明されている。
この設計判断が正しく実装に反映されているかを型レベルとランタイムの両方で確認するテストが必要。

**着手推奨タイミング**: `TOOL_RISK_CONFIG.high` の制約定義が変更されたタイミング、またはポリシー制限ロジックのリファクタリング時。

**影響範囲**:

- `apps/desktop/src/main/handlers/permission/expiry-policy-calculator.test.ts`（追加）
- `apps/desktop/src/renderer/components/permission-dialog/permission-dialog.test.tsx`（追加）

---

## 差し戻し判定結果

### 総合判定: PASS

セクション別の評価:

| 評価項目                          | 結果                                     | 詳細                                                         |
| --------------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| セキュリティ不変条件              | 6/6 全確認                               | MAJOR 条件に非該当（`security-invariant-checklist.md` 参照） |
| Lane-A カバレッジ                 | 7/7                                      | 全コンサーン確認済み                                         |
| Lane-B カバレッジ                 | 9/9                                      | 全コンサーン確認済み                                         |
| Lane-C カバレッジ                 | 8/8                                      | 全コンサーン確認済み                                         |
| 16組合せ（リスク × 権限状態）     | 13/13 到達可能セル全確認                 | 禁止遷移3セルは TC-ST-003 で記録済み                         |
| 16組合せ（リスク × 失効ポリシー） | 9/12 直接確認、3/12 代替確認、2/12 MINOR | 到達不可4セルを除く12セルの内、未検証2セルは MINOR 記録      |
| Task 接続ポイント                 | 6/6 全確認                               | 全接続ポイント確認済み                                       |

### MINOR 記録の処理

- MINOR 指摘 2 件はいずれもセキュリティ不変条件に非該当
- 計算ロジック自体は代替テストで確認済み
- 現設計では UI 到達不可であり、将来の設計変更時に着手する想定

### 結論

Phase 8（リファクタリング）へ進行可能。
未タスク 2 件（UT-TASK06-HIGH-TIME24H、UT-TASK06-HIGH-TIME7D）は Low 優先度として記録し、
設計変更が生じた際に着手する。

---

## 関連成果物パス

| 成果物種別                         | パス                                                |
| ---------------------------------- | --------------------------------------------------- |
| 総合カバレッジレポート             | `outputs/phase-7/coverage-report.md`                |
| 未検証組合せ一覧（詳細）           | `outputs/phase-7/uncovered-combinations.md`         |
| セキュリティ不変条件チェックリスト | `outputs/phase-7/security-invariant-checklist.md`   |
| デシジョンテーブル（設計根拠）     | `outputs/phase-4/decision-table-risk-permission.md` |
| 失効×リスク組合せテスト仕様        | `outputs/phase-6/tc-expiry-risk-matrix.md`          |
