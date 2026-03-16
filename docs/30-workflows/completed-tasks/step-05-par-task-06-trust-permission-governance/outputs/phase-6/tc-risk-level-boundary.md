# TC-T-007〜008: リスクレベル分類境界値テスト仕様

## メタ情報

| 項目               | 内容                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| テストカテゴリ     | リスクレベル分類・境界値                                               |
| 対象コンポーネント | `PermissionDialog`, `TOOL_RISK_CONFIG`, ツールリスクマッピングロジック |
| Phase              | Phase 6 テスト拡充                                                     |
| 関連タスク         | TASK-SKILL-LIFECYCLE-06                                                |
| 作成日             | 2026-03-16                                                             |

---

## TOOL_RISK_CONFIG 参照値

| riskLevel  | allowApproveOnce | allowPermanent | autoDenyDefault | headerColorToken       | dialogWidth |
| ---------- | ---------------- | -------------- | --------------- | ---------------------- | ----------- |
| `critical` | `false`          | `false`        | `true`          | `--status-destructive` | 640         |
| `high`     | `true`           | `false`        | `false`         | `--status-warning`     | 480         |
| `medium`   | `true`           | `true`         | `false`         | `--status-caution`     | 400         |
| `low`      | `true`           | `true`         | `false`         | `--status-info`        | 400         |

---

## TC-T-007: Medium/High 境界の `allowPermanent` 差分検証

### 目的

`PermissionDialog` のボタン表示制御ロジックにおいて、`TOOL_RISK_CONFIG[riskLevel].allowPermanent` フラグが Medium と High の境界で正しく差分を生じさせることを検証する。

---

### TC-T-007a: Medium ツールで「常に許可」ボタンが表示される

**Given**

- `TOOL_RISK_CONFIG["medium"].allowPermanent === true` であること
- PermissionDialog に `riskLevel: "medium"` のツール（例: `Write` ツール）のリクエストが渡されている

**When**

- PermissionDialog がレンダリングされる

**Then**

- 「常に許可」ボタン（`data-testid="btn-allow-permanent"` 相当）が DOM に存在すること
- ボタンが `disabled` 状態でないこと
- 「今回のみ許可」ボタンも同時に表示されること（`allowApproveOnce === true`）

---

### TC-T-007b: High ツールで「常に許可」ボタンが非表示になる

**Given**

- `TOOL_RISK_CONFIG["high"].allowPermanent === false` であること
- PermissionDialog に `riskLevel: "high"` のツール（例: `Bash` + `chmod 777` 相当のコマンド）のリクエストが渡されている

**When**

- PermissionDialog がレンダリングされる

**Then**

- 「常に許可」ボタン（`data-testid="btn-allow-permanent"` 相当）が DOM に存在しないこと（`null` を返すこと）
- 「今回のみ許可」ボタンは表示されること（`allowApproveOnce === true`）
- 「拒否」ボタンは表示されること

---

### TC-T-007c: Critical ツールで「今回のみ許可」も「常に許可」も非表示になる

**Given**

- `TOOL_RISK_CONFIG["critical"].allowApproveOnce === false` かつ `TOOL_RISK_CONFIG["critical"].allowPermanent === false` であること
- PermissionDialog に `riskLevel: "critical"` のツールのリクエストが渡されている

**When**

- PermissionDialog がレンダリングされる

**Then**

- 「今回のみ許可」ボタンが DOM に存在しないこと
- 「常に許可」ボタンが DOM に存在しないこと
- 「拒否」または「強制終了」ボタンのみが表示されること（`autoDenyDefault === true` に対応するデフォルト操作）

---

### TC-T-007d: dialogWidth が riskLevel によって正しく変化する

**Given**

- TOOL_RISK_CONFIG の dialogWidth が riskLevel ごとに定義されている（critical: 640, high: 480, medium/low: 400）

**When**

- 各 riskLevel の PermissionDialog がレンダリングされる

**Then**

- `riskLevel: "critical"` のとき、dialog のスタイル幅が `640px` であること
- `riskLevel: "high"` のとき、dialog のスタイル幅が `480px` であること
- `riskLevel: "medium"` のとき、dialog のスタイル幅が `400px` であること
- `riskLevel: "low"` のとき、dialog のスタイル幅が `400px` であること

---

### TC-T-007e: headerColorToken が riskLevel に応じて正しく適用される

**Given**

- TOOL_RISK_CONFIG の headerColorToken が各 riskLevel に定義されている

**When**

- 各 riskLevel の PermissionDialog のヘッダー部分がレンダリングされる

**Then**

- `riskLevel: "critical"` のとき、ヘッダーの背景色トークンが `var(--status-destructive)` を参照していること
- `riskLevel: "high"` のとき、ヘッダーの背景色トークンが `var(--status-warning)` を参照していること
- `riskLevel: "medium"` のとき、ヘッダーの背景色トークンが `var(--status-caution)` を参照していること
- `riskLevel: "low"` のとき、ヘッダーの背景色トークンが `var(--status-info)` を参照していること

---

## TC-T-008: ツール名からリスクレベルへのマッピング境界テスト

### 目的

ツール名またはコマンドパターンからリスクレベルへのマッピングロジックが、コマンド内容の「安全性に見えるバリエーション」に左右されず、パターン自体に基づいて正しいリスクレベルを返すことを検証する。

---

### TC-T-008a: `rm -rf /tmp/test`（限定的パス）→ `critical`

**Given**

- ツールコマンドが `rm -rf /tmp/test` である（削除対象が `/tmp` 以下の限定パス）
- `rm -rf` パターン自体が Critical 分類の判定条件として定義されている

**When**

- ツールリスクマッピング関数（`resolveToolRiskLevel` 相当）にこのコマンドが入力される

**Then**

- 返却されるリスクレベルが `"critical"` であること
- パス `/tmp/test` が「安全なディレクトリ」であっても `rm -rf` パターンがマッチする限り `critical` が返ること
- `TOOL_RISK_CONFIG["critical"].autoDenyDefault === true` に基づき、デフォルト動作が自動拒否であること

---

### TC-T-008b: `chmod 644 /tmp/test`（安全な権限値） → `high`

**Given**

- ツールコマンドが `chmod 644 /tmp/test` である（`644` は読み書き実行制限された一般的な権限）
- ファイル権限変更コマンド（`chmod` パターン）が High 分類の判定条件として定義されている

**When**

- ツールリスクマッピング関数にこのコマンドが入力される

**Then**

- 返却されるリスクレベルが `"high"` であること
- 権限値が `777` や `755` でなく `644` であっても `chmod` パターン自体が `high` を返すこと
- `TOOL_RISK_CONFIG["high"].allowPermanent === false` が適用されること

---

### TC-T-008c: `bash -c "echo hello"`（無害な内容） → `high`

**Given**

- ツールコマンドが `bash -c "echo hello"` である（コマンド内容は単なる文字列出力で無害）
- `bash -c` パターン自体が High 分類の判定条件として定義されている（任意コマンド実行の構造的危険性）

**When**

- ツールリスクマッピング関数にこのコマンドが入力される

**Then**

- 返却されるリスクレベルが `"high"` であること
- `"echo hello"` の内容が無害であってもシェルインジェクション構造（`bash -c`）に基づき `high` が返ること
- コマンド内容を静的解析して安全性を判定するロジックが存在しないこと（パターンマッチで完結する）

---

### TC-T-008d: `WebFetch https://api.example.com` → `low`

**Given**

- ツール名が `WebFetch` であり、URLが `https://api.example.com` である
- `WebFetch` ツールが Low 分類として定義されている

**When**

- ツールリスクマッピング関数にこのツール名とパラメータが入力される

**Then**

- 返却されるリスクレベルが `"low"` であること
- `TOOL_RISK_CONFIG["low"].allowPermanent === true` が適用されること
- ダイアログ幅が `400px` であること

---

### TC-T-008e: 未知のツール名 → フォールバック動作の検証

**Given**

- ツールリスクマッピング関数に定義済みツールリストに存在しないツール名が入力される

**When**

- ツールリスクマッピング関数がそのツール名を処理する

**Then**

- エラーをスローせずに処理が完了すること
- フォールバックとして `"high"` または設定済みのデフォルトリスクレベルが返ること（未知ツールは安全側に倒す設計）

---

## 検証観点サマリー

| テストID  | 検証観点                                                  | 境界の種類                   |
| --------- | --------------------------------------------------------- | ---------------------------- |
| TC-T-007a | Medium の `allowPermanent=true` でボタン表示              | riskLevel Medium/High 境界   |
| TC-T-007b | High の `allowPermanent=false` でボタン非表示             | riskLevel Medium/High 境界   |
| TC-T-007c | Critical の `allowApproveOnce=false` で承認ボタン全非表示 | riskLevel High/Critical 境界 |
| TC-T-007d | dialogWidth が riskLevel で変化                           | UI サイジング境界            |
| TC-T-007e | headerColorToken が riskLevel で変化                      | UI カラー境界                |
| TC-T-008a | `rm -rf` パターンはパス限定でも critical                  | コマンドパターン境界         |
| TC-T-008b | `chmod` パターンは権限値に関わらず high                   | コマンドパターン境界         |
| TC-T-008c | `bash -c` パターンは内容に関わらず high                   | コマンドパターン境界         |
| TC-T-008d | `WebFetch` ツールは low                                   | ツール名マッピング境界       |
| TC-T-008e | 未知ツールはフォールバック（安全側）                      | 未定義入力境界               |
