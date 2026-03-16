# テストケース仕様: 失効ポリシー × リスクレベル組合せ

## メタ情報

| 項目                   | 値                                             |
| ---------------------- | ---------------------------------------------- |
| タスクID               | TASK-SKILL-LIFECYCLE-06                        |
| Phase                  | 6 - テスト拡充                                 |
| カテゴリ               | TC-ST-008（失効×リスク組合せ）                 |
| 作成日                 | 2026-03-16                                     |
| カバレッジギャップ根拠 | `coverage-gap-analysis.md` 観点4               |
| 対応 Phase 5 成果物    | `../phase-5/permission-dialog-spec.md`（予定） |

## 目的

`expiryPolicy`（失効ポリシー）と `riskLevel`（リスクレベル）の全組合せにおいて、PermissionDialog の許可ボタン表示・非表示および electron-store への書き込み動作が `TOOL_RISK_CONFIG` の設定値に従って正しく制御されることを検証する。

---

## TOOL_RISK_CONFIG 参照値

| riskLevel  | allowApproveOnce | allowPermanent | autoDenyDefault |
| ---------- | ---------------- | -------------- | --------------- |
| `critical` | `false`          | `false`        | `true`          |
| `high`     | `true`           | `false`        | `false`         |
| `medium`   | `true`           | `true`         | `false`         |
| `low`      | `true`           | `true`         | `false`         |

### 失効ポリシー一覧

| expiryPolicy    | 概要                       | electron-store 書き込み  |
| --------------- | -------------------------- | ------------------------ |
| `session`       | アプリ終了時に削除         | なし（メモリのみ）       |
| `approved_once` | 次回呼び出し時にリセット   | なし（メモリのみ）       |
| `time_24h`      | 承認から24時間後に期限切れ | あり（`expiresAt` 付き） |
| `time_7d`       | 承認から7日後に期限切れ    | あり（`expiresAt` 付き） |
| `permanent`     | 明示的に取り消すまで有効   | あり（`expiresAt` なし） |

---

## テスト組合せマトリクス

| テストID   | riskLevel  | expiryPolicy | 許可ボタン表示 | 期待結果概要                                        |
| ---------- | ---------- | ------------ | -------------- | --------------------------------------------------- |
| TC-ST-008a | `critical` | `session`    | 非表示         | 全承認ボタン非表示（自動拒否）                      |
| TC-ST-008b | `critical` | `time_24h`   | 非表示         | 恒久許可ボタンが存在しないため `time_24h` 選択不可  |
| TC-ST-008c | `critical` | `permanent`  | 非表示         | 恒久許可禁止（`allowPermanent=false`）              |
| TC-ST-008d | `high`     | `session`    | 表示           | 「今回のみ」選択可能。electron-store に書き込まない |
| TC-ST-008e | `high`     | `permanent`  | 非表示         | 恒久許可ボタン非表示（`allowPermanent=false`）      |
| TC-ST-008f | `medium`   | `permanent`  | 表示           | 恒久許可ボタン表示。electron-store に永続化         |
| TC-ST-008g | `low`      | `permanent`  | 表示           | 恒久許可ボタン表示。electron-store に永続化         |
| TC-ST-008h | `medium`   | `time_24h`   | 表示           | `expiresAt = allowedAt + 86400000` で保存           |
| TC-ST-008i | `low`      | `time_7d`    | 表示           | `expiresAt = allowedAt + 604800000` で保存          |

---

## 各テストケース詳細

### TC-ST-008a: critical × session（自動拒否）

#### 前提条件（Given）

```
- PermissionManager が初期化済み
- ツール "EvalExecutor" のリスクレベルは "critical"
- TOOL_RISK_CONFIG.critical.autoDenyDefault === true
- TOOL_RISK_CONFIG.critical.allowApproveOnce === false
- TOOL_RISK_CONFIG.critical.allowPermanent === false
```

#### 操作（When）

```
- "EvalExecutor" ツールの実行を要求する
- PermissionManager.checkPermission("EvalExecutor") を呼び出す
```

#### 期待結果（Then）

```
- PermissionDialog は表示されない（autoDenyDefault=true のため）
- 承認ボタン（「今回のみ」「24時間許可」「恒久許可」）が全て DOM に存在しない
- checkPermission の戻り値が { allowed: false, reason: "auto_denied_critical" }
- electron-store に "EvalExecutor" のエントリが書き込まれない
```

---

### TC-ST-008b: critical × time_24h（time_24h 選択不可）

#### 前提条件（Given）

```
- PermissionManager が初期化済み
- ツール "EvalExecutor" のリスクレベルは "critical"
- TOOL_RISK_CONFIG.critical.autoDenyDefault === true
```

#### 操作（When）

```
- "EvalExecutor" ツールの実行を要求する
- PermissionDialog のレンダリング結果を確認する
```

#### 期待結果（Then）

```
- PermissionDialog は表示されない（autoDenyDefault=true のため自動拒否）
- 「24時間許可」ボタンが DOM に存在しない
  （そもそもダイアログ自体が表示されないため選択不可）
- electron-store に "EvalExecutor" の time_24h エントリが存在しない
```

#### 補足

`critical` × `time_24h` の組合せは「ダイアログが表示されない」ことにより選択不可となる。ダイアログを強制表示した場合でも `allowApproveOnce=false` のため「今回のみ」が非表示となる。

---

### TC-ST-008c: critical × permanent（恒久許可禁止）

#### 前提条件（Given）

```
- PermissionManager が初期化済み
- ツール "EvalExecutor" のリスクレベルは "critical"
- TOOL_RISK_CONFIG.critical.allowPermanent === false
```

#### 操作（When）

```
- PermissionDialog コンポーネントを riskLevel="critical" で直接描画する
  （autoDenyDefault による自動拒否をバイパスしてUIテストのみ実施）
- 「恒久許可」ボタンの存在を確認する
```

#### 期待結果（Then）

```
- 「恒久許可」ボタンが DOM に存在しない（allowPermanent=false のため）
- ダイアログに表示される選択肢は「拒否」ボタンのみ
```

---

### TC-ST-008d: high × session（「今回のみ」選択可能）

#### 前提条件（Given）

```
- PermissionManager が初期化済み
- ツール "Bash" のリスクレベルは "high"
- TOOL_RISK_CONFIG.high.allowApproveOnce === true
- TOOL_RISK_CONFIG.high.allowPermanent === false
- TOOL_RISK_CONFIG.high.autoDenyDefault === false
- electron-store の "allowedTools" は空
```

#### 操作（When）

```
1. "Bash" ツールの実行を要求する
2. PermissionDialog が表示されることを確認する
3. PermissionDialog で「今回のみ」（expiryPolicy="session"）を選択する
4. electron-store.get("allowedTools") を確認する
```

#### 期待結果（Then）

```
- 手順2: PermissionDialog が表示される（autoDenyDefault=false のため）
- 手順3後:
  - isToolAllowed("Bash") === true（現セッション中）
  - 「今回のみ」ボタンが DOM に存在する（allowApproveOnce=true のため）
  - 「恒久許可」ボタンが DOM に存在しない（allowPermanent=false のため）
- 手順4の結果: electron-store に "Bash" の session エントリが存在しない
  （session ポリシーは electron-store に書き込まない）
```

---

### TC-ST-008e: high × permanent（恒久許可ボタン非表示）

#### 前提条件（Given）

```
- PermissionDialog コンポーネントを riskLevel="high" で描画する
- TOOL_RISK_CONFIG.high.allowPermanent === false
```

#### 操作（When）

```
- PermissionDialog の DOM を検査する
- 「恒久許可」ボタンの存在を確認する
```

#### 期待結果（Then）

```
- 「恒久許可」ボタンが DOM に存在しない（allowPermanent=false のため）
- 表示される選択肢: 「今回のみ」（allowApproveOnce=true のため表示）、「拒否」
- 「24時間許可」ボタンの表示有無: TOOL_RISK_CONFIG.high の time 系ポリシー設定に依存
```

---

### TC-ST-008f: medium × permanent（恒久許可ボタン表示・永続化）

#### 前提条件（Given）

```
- PermissionManager が初期化済み
- ツール "Write" のリスクレベルは "medium"
- TOOL_RISK_CONFIG.medium.allowPermanent === true
- electron-store の "allowedTools" は空
- currentTime = 1700000000000（固定値としてモック）
```

#### 操作（When）

```
1. "Write" ツールの実行を要求する
2. PermissionDialog が表示されることを確認する
3. 「恒久許可」ボタンの存在を確認する
4. 「恒久許可」（expiryPolicy="permanent"）を選択する
5. electron-store.get("allowedTools") を確認する
```

#### 期待結果（Then）

```
- 手順3: 「恒久許可」ボタンが DOM に存在する（allowPermanent=true のため）
- 手順4後:
  - isToolAllowed("Write") === true
- 手順5の結果:
  electron-store に以下のエントリが存在する:
  {
    toolName: "Write",
    expiryPolicy: "permanent",
    allowedAt: 1700000000000,
    expiresAt: undefined  // permanent は expiresAt なし
  }
```

---

### TC-ST-008g: low × permanent（恒久許可ボタン表示・永続化）

#### 前提条件（Given）

```
- PermissionManager が初期化済み
- ツール "Read" のリスクレベルは "low"
- TOOL_RISK_CONFIG.low.allowPermanent === true
- electron-store の "allowedTools" は空
- currentTime = 1700000000000（固定値としてモック）
```

#### 操作（When）

```
1. "Read" ツールの実行を要求する
2. PermissionDialog で「恒久許可」を選択する
3. electron-store.get("allowedTools") を確認する
```

#### 期待結果（Then）

```
- 手順2: 「恒久許可」ボタンが DOM に存在する
- 手順3の結果:
  electron-store に以下のエントリが存在する:
  {
    toolName: "Read",
    expiryPolicy: "permanent",
    allowedAt: 1700000000000,
    expiresAt: undefined
  }
- アプリ再起動後も isToolAllowed("Read") === true
```

#### TC-ST-008f との違い

`riskLevel = "low"` vs `riskLevel = "medium"` の動作が同一であることの確認テスト。

---

### TC-ST-008h: medium × time_24h（`expiresAt` 計算値の検証）

#### 前提条件（Given）

```
- PermissionManager が初期化済み
- ツール "Write" のリスクレベルは "medium"
- electron-store の "allowedTools" は空
- currentTime = 1700000000000（Date.now() をモックで固定）
- 24時間 = 86400000 ミリ秒
```

#### 操作（When）

```
1. "Write" ツールの実行を要求する
2. PermissionDialog で「24時間許可」（expiryPolicy="time_24h"）を選択する
3. electron-store.get("allowedTools") を確認する
4. isToolAllowed("Write") を呼び出す（期限内）
5. Date.now() を 1700000000000 + 86400001 に設定する（期限切れ直後）
6. isToolAllowed("Write") を再度呼び出す（期限切れ後）
```

#### 期待結果（Then）

```
- 手順3の結果:
  electron-store に以下のエントリが存在する:
  {
    toolName: "Write",
    expiryPolicy: "time_24h",
    allowedAt: 1700000000000,
    expiresAt: 1700086400000  // 1700000000000 + 86400000
  }
- 手順4の結果: isToolAllowed("Write") === true
- 手順6の結果: isToolAllowed("Write") === false
```

---

### TC-ST-008i: low × time_7d（`expiresAt` 計算値の検証）

#### 前提条件（Given）

```
- PermissionManager が初期化済み
- ツール "Read" のリスクレベルは "low"
- electron-store の "allowedTools" は空
- currentTime = 1700000000000（Date.now() をモックで固定）
- 7日間 = 604800000 ミリ秒
```

#### 操作（When）

```
1. "Read" ツールの実行を要求する
2. PermissionDialog で「7日間許可」（expiryPolicy="time_7d"）を選択する
3. electron-store.get("allowedTools") を確認する
4. isToolAllowed("Read") を呼び出す（期限内）
5. Date.now() を 1700000000000 + 604800001 に設定する（期限切れ直後）
6. isToolAllowed("Read") を再度呼び出す（期限切れ後）
```

#### 期待結果（Then）

```
- 手順3の結果:
  electron-store に以下のエントリが存在する:
  {
    toolName: "Read",
    expiryPolicy: "time_7d",
    allowedAt: 1700000000000,
    expiresAt: 1700604800000  // 1700000000000 + 604800000
  }
- 手順4の結果: isToolAllowed("Read") === true
- 手順6の結果: isToolAllowed("Read") === false
```

---

## テストケース一覧

| テストID   | riskLevel | expiryPolicy | 追加フォーカス                                    | 優先度 |
| ---------- | --------- | ------------ | ------------------------------------------------- | ------ |
| TC-ST-008a | critical  | session      | autoDenyDefault=true 時の全ボタン非表示           | 高     |
| TC-ST-008b | critical  | time_24h     | autoDenyDefault による time_24h 選択不可          | 高     |
| TC-ST-008c | critical  | permanent    | allowPermanent=false の UI 反映                   | 高     |
| TC-ST-008d | high      | session      | allowApproveOnce=true + electron-store 非書き込み | 高     |
| TC-ST-008e | high      | permanent    | allowPermanent=false の UI 反映（high 境界）      | 高     |
| TC-ST-008f | medium    | permanent    | allowPermanent=true + electron-store 永続化       | 高     |
| TC-ST-008g | low       | permanent    | allowPermanent=true + medium との動作一致確認     | 中     |
| TC-ST-008h | medium    | time_24h     | expiresAt = allowedAt + 86400000 の計算値検証     | 高     |
| TC-ST-008i | low       | time_7d      | expiresAt = allowedAt + 604800000 の計算値検証    | 高     |

## 参照

- カバレッジギャップ分析: `coverage-gap-analysis.md`
- セッションスコープ境界テスト: `tc-session-scope-boundary.md`
- Phase 4 テストケース（既存）: `../phase-4/`
- Phase 5 実装仕様（参照先）: `../phase-5/`
