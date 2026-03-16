# セキュリティ不変条件チェックリスト

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                             |
| Phase      | 7 - カバレッジ確認                                  |
| 作成日     | 2026-03-16                                          |
| 参照成果物 | `outputs/phase-4/decision-table-risk-permission.md` |
|            | `outputs/phase-6/expanded-test-scenario-index.md`   |
|            | `outputs/phase-7/coverage-report.md`                |

---

## 概要

本チェックリストは TASK-SKILL-LIFECYCLE-06 のセキュリティ設計において守られるべき不変条件（invariant）6 件について、
対応するテストケースが存在するかを確認する。不変条件が破られた場合に権限ガバナンスが崩壊するため、
これらは MAJOR 差し戻し条件として扱う。

---

## セキュリティ不変条件 6 件の確認状況

| #   | 不変条件                                               | 対応テスト            | 検証内容                                                                | 状態     |
| --- | ------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------- | -------- |
| 1   | `TOOL_RISK_CONFIG.critical.allowPermanent === false`   | TC-T-001              | critical ツールへの恒久許可が型レベルで不可能であることを検証           | 確認済み |
| 2   | `TOOL_RISK_CONFIG.critical.allowApproveOnce === false` | TC-T-001              | critical ツールへの「今回のみ許可」が型レベルで不可能であることを検証   | 確認済み |
| 3   | `DEFAULT_TIMEOUT_MS === 300000`                        | TC-F-004, TC-F-006b   | タイムアウト値が 5 分（300000ms）固定であることを検証                   | 確認済み |
| 4   | `PERMISSION_HISTORY_MAX_ENTRIES === 1000`              | TC-ST-005e, TC-ST-009 | 承認履歴の上限件数が 1000 件固定であることを検証                        | 確認済み |
| 5   | critical → approved 遷移禁止                           | TC-ST-003（禁止遷移） | critical ツールへの approved 状態遷移が禁止されていることを明示的に記録 | 確認済み |
| 6   | abort 後の session エントリ削除                        | TC-F-001（Step2）     | abort フロー実行後に session エントリが削除されることを検証             | 確認済み |

**判定: 6/6 全て確認済み。MAJOR 差し戻し条件に該当しない。**

---

## 各不変条件の詳細

### 不変条件1: critical.allowPermanent === false

**重要性**: critical ツールに対する恒久許可が可能になると、一度の承認操作で永続的に危険なツールを実行可能な状態になる。セキュリティ上最も重大な不変条件のひとつ。

**対応テスト: TC-T-001（ToolRiskConfig 全4レベルの型定義検証）**

検証内容:

- `TOOL_RISK_CONFIG.critical.allowPermanent` の値が `false` であることをコンパイル時・実行時の両方で検証
- `allowPermanent === false` の場合、PermissionDialog で「常に許可」ボタンが生成されないことを TC-ST-008c で補完検証

**関連設計根拠**: `decision-table-risk-permission.md` Section 2「critical × approved（状態不可能）」

---

### 不変条件2: critical.allowApproveOnce === false

**重要性**: critical ツールへの一時許可が可能になると、autoDenyDefault による自動拒否の保護を回避できる。

**対応テスト: TC-T-001（ToolRiskConfig 全4レベルの型定義検証）**

検証内容:

- `TOOL_RISK_CONFIG.critical.allowApproveOnce` の値が `false` であることを検証
- `autoDenyDefault === true` との組合せで、PermissionDialog が表示されないことを TC-ST-008a で補完検証
- 「今回のみ許可」ボタンが critical ツールに対して生成されないことを TC-T-002 のボタン表示制御テストで検証

**関連設計根拠**: `decision-table-risk-permission.md` Section 2「critical × approved_once（状態不可能）」

---

### 不変条件3: DEFAULT_TIMEOUT_MS === 300000

**重要性**: タイムアウト値が変更可能になると、ユーザーが操作しないまま無制限に許可待ちが継続し、UX とセキュリティの両方に問題が生じる。5 分（300000ms）は設計上のハードコード値として不変でなければならない。

**対応テスト: TC-F-004（PermissionResolver タイムアウト 300000ms 検証）**

検証内容:

- `PermissionResolver` の `DEFAULT_TIMEOUT_MS` 定数が `300000` であることを検証
- 300000ms 経過後に自動的に abort フローが実行されることを検証

**補完テスト: TC-F-006b（タイムアウト境界値: 300000ms ちょうどの挙動）**

検証内容:

- 299999ms 時点では abort が実行されないことを確認
- 300000ms 時点で abort が実行されることを確認

---

### 不変条件4: PERMISSION_HISTORY_MAX_ENTRIES === 1000

**重要性**: 上限なしに承認履歴が蓄積されると、electron-store のストレージを圧迫し、アプリケーションのパフォーマンス劣化や起動失敗を引き起こす可能性がある。FIFO で古いエントリを削除する上限 1000 件は不変でなければならない。

**対応テスト: TC-ST-005e（承認履歴 FIFO 上限: 1001 件目の追加時に最古が削除される）**

検証内容:

- 1000 件の承認履歴が存在する状態で 1001 件目を追加したとき、最古のエントリが削除されることを検証
- `PERMISSION_HISTORY_MAX_ENTRIES` 定数が `1000` であることを検証

**補完テスト: TC-ST-009（承認履歴上限3点境界値: 0件、1000件、1001件）**

検証内容:

- 0 件 → 1 件追加: 1 件になること
- 999 件 → 1 件追加: 1000 件になること（上限到達）
- 1000 件 → 1 件追加: 1000 件のまま最古が削除されること

---

### 不変条件5: critical → approved 遷移禁止

**重要性**: critical ツールが `approved` 状態になると、以後は PermissionDialog を経ずにツールが実行可能になる。これは最重大のセキュリティ不変条件であり、設計・実装・テストの全レイヤーで保証が必要。

**対応テスト: TC-ST-003（権限状態遷移4モード検証：有効遷移・禁止遷移）**

検証内容:

- `critical` ツールに対して `approved` 状態への遷移を試みたとき、例外がスローされるか操作が拒否されることを検証
- 禁止遷移テーブル（`decision-table-risk-permission.md` Section 6）の全禁止パスを明示的に記録
  - `critical` → `approved_once`（allowApproveOnce=false）
  - `critical` → `approved`（allowPermanent=false）
  - `high` → `approved`（allowPermanent=false）
  - `revoked` → `approved`（直接遷移禁止、一旦 denied を経由）

---

### 不変条件6: abort 後の session エントリ削除

**重要性**: abort フロー実行後に session エントリが残存すると、次回の同ツール呼び出し時に誤って許可状態として扱われる可能性がある。abort は「拒否」の確定であり、session スコープの一時許可エントリは即時削除されなければならない。

**対応テスト: TC-F-001（abort フロー①の4ステップ検証）**

検証内容（Step2 に該当）:

- abort フローの Step1（PermissionDialog 表示）実行後
- Step2: ユーザーが「拒否する」を選択した後に、session エントリが `SessionPermissionStore` から削除されることを検証
- Step3: IPC 経由で `{ allowed: false, reason: "user_denied" }` が送信されることを検証
- Step4: PermissionDialog が DOM から除去されることを検証

---

## MAJOR 差し戻し条件の評価

以下の条件のいずれかが満たされる場合、Phase 6 へ差し戻しとなる:

| 条件                                                                     | 評価                                   | 判定   |
| ------------------------------------------------------------------------ | -------------------------------------- | ------ |
| 不変条件1〜6 のいずれかに対応テストが存在しない                          | 6/6 全て対応テストあり                 | 非該当 |
| 対応テストが存在するが検証内容が不十分（不変条件を直接テストしていない） | 全て直接または補完テストで検証済み     | 非該当 |
| critical × approved の遷移が実装上可能な状態                             | TC-ST-003 で禁止遷移を明示的に記録済み | 非該当 |

**総合判定: PASS（MAJOR 差し戻し条件に非該当）**

---

## 関連成果物パス

| 成果物種別                     | パス                                                |
| ------------------------------ | --------------------------------------------------- |
| 総合カバレッジレポート         | `outputs/phase-7/coverage-report.md`                |
| デシジョンテーブル（設計根拠） | `outputs/phase-4/decision-table-risk-permission.md` |
| テストケース統合インデックス   | `outputs/phase-6/expanded-test-scenario-index.md`   |
| 未検証組合せ一覧               | `outputs/phase-7/uncovered-combinations.md`         |
| カバレッジギャップ             | `outputs/phase-7/coverage-gaps.md`                  |
