# TC-ST: 状態遷移テスト仕様書

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                            |
| Phase      | 4: テスト作成                                      |
| カテゴリ   | TC-ST（状態遷移テスト）                            |
| テスト数   | 5件（TC-ST-001〜TC-ST-005）                        |
| 依存成果物 | `outputs/phase-2/permission-persistence-design.md` |
|            | `outputs/phase-2/abort-fallback-design.md`         |
| 作成日     | 2026-03-16                                         |

---

## TC-ST-001: 失効チェックフロー6分岐の網羅テスト

### 目的

`isToolAllowed(toolName, skillName?)` の6分岐を全網羅し、各分岐で正しい戻り値を返すことを検証する。

### 前提条件

- PermissionStore が初期化済みである
- テスト間で electron-store の状態をリセットする

### テストケース

#### TC-ST-001-a: entryが存在しない場合

- **入力**: `isToolAllowed("NonExistentTool")`
- **事前状態**: electron-store に `"NonExistentTool"` のエントリが存在しない
- **条件式**: `isToolAllowed("NonExistentTool") === false`

#### TC-ST-001-b: expiresAtがundefinedの場合（無期限）

- **入力**: `isToolAllowed("Bash")`
- **事前状態**: `{ toolName: "Bash", allowedAt: 1710000000000, expiresAt: undefined }`
- **条件式**: `isToolAllowed("Bash") === true`

#### TC-ST-001-c: expiresAt < Date.now()の場合（失効済み）

- **入力**: `isToolAllowed("Bash")`
- **事前状態**: `{ toolName: "Bash", allowedAt: 1710000000000, expiresAt: Date.now() - 1 }`
- **条件式**: `isToolAllowed("Bash") === false`
- **副作用検証**:
  - electron-store から該当エントリが削除されている: `store.get("Bash") === undefined`
  - permissionHistorySlice に `{ decision: "denied", triggerContext: "auto" }` が記録されている

#### TC-ST-001-d: skillNameが不一致の場合

- **入力**: `isToolAllowed("Read", "skill-b")`
- **事前状態**: `{ toolName: "Read", allowedAt: 1710000000000, expiresAt: undefined, skillName: "skill-a" }`
- **条件式**: `isToolAllowed("Read", "skill-b") === false`

#### TC-ST-001-e: skillNameが一致の場合

- **入力**: `isToolAllowed("Read", "skill-a")`
- **事前状態**: `{ toolName: "Read", allowedAt: 1710000000000, expiresAt: undefined, skillName: "skill-a" }`
- **条件式**: `isToolAllowed("Read", "skill-a") === true`

#### TC-ST-001-f: entry.skillNameがundefinedの場合（全スキルに適用）

- **入力**: `isToolAllowed("Read", "any-skill")`
- **事前状態**: `{ toolName: "Read", allowedAt: 1710000000000, expiresAt: undefined, skillName: undefined }`
- **条件式**: `isToolAllowed("Read", "any-skill") === true`

### 合格基準

全6サブケース（a〜f）が条件式を満たす。

---

## TC-ST-002: 失効ポリシー4種のexpiresAt計算検証

### 目的

`computeExpiresAt(policy, allowedAt)` が4種の失効ポリシーに対して正しい `expiresAt` を返すことを検証する。

### テストケース

#### TC-ST-002-a: sessionポリシー

- **入力**: `computeExpiresAt("session", 1710000000000)`
- **条件式**: `computeExpiresAt("session", 1710000000000) === undefined`
- **根拠**: sessionエントリはelectron-storeに書き込まないため `expiresAt` は不要

#### TC-ST-002-b: time_24hポリシー

- **入力**: `computeExpiresAt("time_24h", 1710000000000)`
- **条件式**: `computeExpiresAt("time_24h", 1710000000000) === 1710000000000 + 86_400_000`
- **期待値**: `1710086400000`（86400000ms = 24時間）

#### TC-ST-002-c: time_7dポリシー

- **入力**: `computeExpiresAt("time_7d", 1710000000000)`
- **条件式**: `computeExpiresAt("time_7d", 1710000000000) === 1710000000000 + 604_800_000`
- **期待値**: `1710604800000`（604800000ms = 7日間）

#### TC-ST-002-d: permanentポリシー

- **入力**: `computeExpiresAt("permanent", 1710000000000)`
- **条件式**: `computeExpiresAt("permanent", 1710000000000) === undefined`

#### TC-ST-002-e: undefinedポリシー（V1後方互換）

- **入力**: `computeExpiresAt(undefined, 1710000000000)`
- **条件式**: `computeExpiresAt(undefined, 1710000000000) === undefined`
- **根拠**: V1エントリには `expiryPolicy` が存在しないため `permanent` 相当として扱う

#### TC-ST-002-f: 境界値 - allowedAt === 0（エポック起点）

- **入力**: `computeExpiresAt("time_24h", 0)`
- **条件式**: `computeExpiresAt("time_24h", 0) === 86_400_000`

### 合格基準

全6サブケース（a〜f）が条件式を満たす。

---

## TC-ST-003: 権限状態の有効遷移パスの網羅

### 目的

権限状態の有効な遷移パスと禁止遷移パスを検証する。

### 有効遷移テストケース

#### TC-ST-003-a: denied → approved_once

- **事前状態**: ツール `"Bash"` が denied 状態（エントリが存在しない、または取り消し済み）
- **操作**: PermissionDialog で「今回のみ許可」を選択する
- **事後条件**: `sessionPermissions.get(sessionId)?.has("Bash") === true`
- **条件式**: `isToolAllowed("Bash", undefined, sessionId) === true`

#### TC-ST-003-b: approved → revoked

- **事前状態**: `{ toolName: "Read", allowedAt: ..., expiryPolicy: "permanent" }` がelectron-storeに存在する
- **操作**: `PermissionStore.revokeTool("Read")` を実行する
- **事後条件**: `isToolAllowed("Read") === false`
- **副作用検証**: permissionHistorySlice に `{ decision: "denied", triggerContext: "manual" }` が記録されている

#### TC-ST-003-c: approved_once → denied（セッション終了）

- **事前状態**: `sessionPermissions.get(sessionId)?.has("Bash") === true`
- **操作**: `destroySession(sessionId)` を実行する
- **事後条件**: `sessionPermissions.has(sessionId) === false`
- **条件式**: `isToolAllowed("Bash", undefined, sessionId) === false`

#### TC-ST-003-d: denied → approved（恒久許可付与）

- **事前状態**: ツール `"Write"` が denied 状態
- **操作**: PermissionDialog で「常に許可」を選択する（Medium/Lowレベルのみ）
- **事後条件**: electron-store に `{ toolName: "Write", expiryPolicy: "permanent" }` が追加されている
- **条件式**: `isToolAllowed("Write") === true`

### 禁止遷移テストケース

#### TC-ST-003-e: Criticalツールの恒久許可禁止

- **事前状態**: ツール `"Bash"` のリスクレベルが `"critical"`
- **操作**: `allowPermanent === false` により「常に許可」ボタンが表示されない
- **条件式**: `TOOL_RISK_CONFIG.critical.allowPermanent === false`
- **検証**: Criticalツールに対して `expiryPolicy: "permanent"` のエントリが作成されないこと

#### TC-ST-003-f: Highツールのtime_7d/permanent禁止

- **事前状態**: ツールのリスクレベルが `"high"`
- **条件式**: ポリシーとリスクレベルの組み合わせ制約テーブルに基づき、以下が禁止される
  - `riskLevel === "high"` かつ `expiryPolicy === "time_7d"`: 不可
  - `riskLevel === "high"` かつ `expiryPolicy === "permanent"`: 不可

### 合格基準

有効遷移テストケース（a〜d）が全て成功し、禁止遷移テストケース（e〜f）で禁止遷移が実行されないことが確認できる。

---

## TC-ST-004: revoked状態のバッジ表示色検証

### 目的

`revoked` 状態のエントリがPermission History Panelで正しいバッジ色で表示されることを検証する。

### テストケース

#### TC-ST-004-a: revokedバッジの背景色

- **入力**: `decision === "revoked"` のエントリ
- **条件式**: バッジ要素の背景色トークンが `--bg-tertiary` である

#### TC-ST-004-b: revokedバッジのテキスト色

- **入力**: `decision === "revoked"` のエントリ
- **条件式**: バッジ要素のテキスト色トークンが `--text-secondary` である

#### TC-ST-004-c: revokedバッジの表示テキスト

- **入力**: `decision === "revoked"` のエントリ
- **条件式**: バッジのテキストが `"revoked"` である

#### TC-ST-004-d: 全4状態のバッジ色対照表

| decision        | 背景色トークン         | テキスト色トークン | 表示テキスト |
| --------------- | ---------------------- | ------------------ | ------------ |
| `approved`      | `--status-success`     | `--text-inverse`   | `approved`   |
| `denied`        | `--status-destructive` | `--text-inverse`   | `denied`     |
| `approved_once` | `--status-caution`     | `--text-primary`   | `once`       |
| `revoked`       | `--bg-tertiary`        | `--text-secondary` | `revoked`    |

- **条件式**: 各 `decision` 値に対して、対応する背景色トークン・テキスト色トークン・表示テキストが正しいことを検証する

### 合格基準

全4サブケース（a〜d）が条件式を満たす。

---

## TC-ST-005: permissionHistorySlice CRUD操作テスト

### 目的

permissionHistorySlice の5つの操作（追加/取消/フィルタ/上限1000件FIFO/全件クリア）が正しく動作することを検証する。

### 前提条件

- permissionHistorySlice が初期化済みである
- テスト間で状態をリセットする

### テストケース

#### TC-ST-005-a: addPermissionHistory（エントリ追加）

- **入力**: `addPermissionHistory({ toolName: "Bash", decision: "approved", riskLevel: "high", triggerContext: "manual", timestamp: Date.now() })`
- **事後条件**: `getPermissionHistory().length === 1`
- **条件式**: `getPermissionHistory()[0].toolName === "Bash"`

#### TC-ST-005-b: revokePermission（取消記録 - revokedAt設定）

- **入力**: `addPermissionHistory({ toolName: "Bash", decision: "denied", triggerContext: "manual", timestamp: Date.now() })`
- **事後条件**: 最新エントリの `decision === "denied"`
- **条件式**: `getPermissionHistory().find(e => e.toolName === "Bash" && e.decision === "denied") !== undefined`

#### TC-ST-005-c: toolNameフィルタ

- **事前状態**: 3件のエントリ（toolName: "Bash"×2, "Read"×1）
- **入力**: `getPermissionHistory().filter(e => e.toolName === "Bash")`
- **条件式**: フィルタ結果の長さが `2` であること

#### TC-ST-005-d: decisionフィルタ

- **事前状態**: 3件のエントリ（`approved`×1, `denied`×1, `approved_once`×1）
- **入力**: `getPermissionHistory().filter(e => e.decision === "denied")`
- **条件式**: フィルタ結果の長さが `1` であること

#### TC-ST-005-e: 1001件目で最古削除（FIFO）

- **操作**: 1001件のエントリを順次追加する
- **事後条件**: `getPermissionHistory().length === 1000`
- **条件式**: 最古のエントリ（1件目に追加したもの）が存在しないこと
  - `getPermissionHistory().find(e => e.timestamp === firstEntryTimestamp) === undefined`
- **条件式**: 最新のエントリ（1001件目に追加したもの）が存在すること
  - `getPermissionHistory().find(e => e.timestamp === lastEntryTimestamp) !== undefined`

#### TC-ST-005-f: clearAllPermissions（全件クリア）

- **事前状態**: 10件のエントリが存在する
- **操作**: `clearAllPermissionHistory()` を実行する
- **事後条件**: `getPermissionHistory().length === 0`
- **条件式**: 削除後に新規エントリを追加可能であること
  - `addPermissionHistory(...)` 後に `getPermissionHistory().length === 1`

### 合格基準

全6サブケース（a〜f）が条件式を満たす。
