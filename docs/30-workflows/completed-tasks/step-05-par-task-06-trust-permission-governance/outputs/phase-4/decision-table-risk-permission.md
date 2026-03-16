# リスクレベル × 権限状態デシジョンテーブル

## メタ情報

| 項目       | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                            |
| Phase      | 4: テスト作成                                      |
| 作成日     | 2026-03-16                                         |
| 依存成果物 | `outputs/phase-2/risk-level-design.md`             |
|            | `outputs/phase-2/permission-persistence-design.md` |

---

## 1. デシジョンテーブル（リスクレベル4段階 × 権限状態4モード = 16組合せ）

| リスクレベル | 権限状態        | PermissionDialog表示     | 表示ボタン                               | 期待動作                           |
| ------------ | --------------- | ------------------------ | ---------------------------------------- | ---------------------------------- |
| `critical`   | `denied`        | 非表示（autoDeny）       | なし                                     | 自動拒否 → abort実行               |
| `critical`   | `approved_once` | **状態不可能**           | -                                        | -                                  |
| `critical`   | `approved`      | **状態不可能**           | -                                        | -                                  |
| `critical`   | `revoked`       | 非表示（autoDeny）       | なし                                     | denied扱い → 自動拒否 → abort実行  |
| `high`       | `denied`        | 表示（通常モーダル）     | 「今回のみ許可」「拒否する」             | ユーザー選択待ち                   |
| `high`       | `approved_once` | 非表示                   | -                                        | ツール実行許可（セッション内有効） |
| `high`       | `approved`      | **状態不可能**           | -                                        | -                                  |
| `high`       | `revoked`       | 表示（通常モーダル）     | 「今回のみ許可」「拒否する」             | denied扱い → ユーザー選択待ち      |
| `medium`     | `denied`        | 表示（通常モーダル）     | 「今回のみ許可」「常に許可」「拒否する」 | ユーザー選択待ち                   |
| `medium`     | `approved_once` | 非表示                   | -                                        | ツール実行許可（セッション内有効） |
| `medium`     | `approved`      | 非表示                   | -                                        | ツール実行許可（恒久承認）         |
| `medium`     | `revoked`       | 表示（通常モーダル）     | 「今回のみ許可」「常に許可」「拒否する」 | denied扱い → ユーザー選択待ち      |
| `low`        | `denied`        | 表示（インラインカード） | 「今回のみ許可」「常に許可」「拒否する」 | ユーザー選択待ち                   |
| `low`        | `approved_once` | 非表示                   | -                                        | ツール実行許可（セッション内有効） |
| `low`        | `approved`      | 非表示                   | -                                        | ツール実行許可（恒久承認）         |
| `low`        | `revoked`       | 表示（インラインカード） | 「今回のみ許可」「常に許可」「拒否する」 | denied扱い → ユーザー選択待ち      |

---

## 2. 「状態不可能」セルの詳細説明

### critical × approved_once（状態不可能）

- **制限フラグ**: `TOOL_RISK_CONFIG.critical.allowApproveOnce === false`
- **理由**: `allowApproveOnce` が `false` に設定されているため、criticalレベルのツールに対して「今回のみ許可」の操作が実行不可能
- **実装上の保証**: PermissionDialogでcriticalツールが表示される際に「今回のみ許可」ボタンが生成されないため、`approved_once` エントリが作成されえない
- **型レベルの防御**: `TOOL_RISK_CONFIG.critical.allowApproveOnce === false` をコンパイル時に検証することで、この組み合わせが設計上存在しないことを保証する

### critical × approved（状態不可能）

- **制限フラグ**: `TOOL_RISK_CONFIG.critical.allowPermanent === false`
- **理由**: `allowPermanent` が `false` に設定されているため、criticalレベルのツールに対して「常に許可」の操作が実行不可能
- **実装上の保証**: PermissionDialogでcriticalツールが表示される際に「常に許可」ボタンが生成されないため、`approved` エントリが作成されえない
- **型レベルの防御**: `TOOL_RISK_CONFIG.critical.allowPermanent === false` をコンパイル時に検証することで、この組み合わせが設計上存在しないことを保証する

### high × approved（状態不可能）

- **制限フラグ**: `TOOL_RISK_CONFIG.high.allowPermanent === false`
- **理由**: `allowPermanent` が `false` に設定されているため、highレベルのツールに対して「常に許可」の操作が実行不可能
- **実装上の保証**: PermissionDialogでhighツールが表示される際に「常に許可」ボタンおよび恒久承認スコープのラジオボタンが生成されないため、`expiryPolicy: "permanent"` または `expiryPolicy: "time_7d"` のエントリが作成されえない
- **型レベルの防御**: `TOOL_RISK_CONFIG.high.allowPermanent === false` をコンパイル時に検証することで、この組み合わせが設計上存在しないことを保証する

---

## 3. revokedセルの動作説明

revokedは「過去に承認されていたが取り消された」状態を示す。PermissionStore実装上、revokedエントリが存在する場合は `isToolAllowed()` が `false` を返し、内部的にはdenied相当として扱われる。

ただし、revokedはUI上でdeniedと異なるバッジ表示（灰色バッジ `--bg-tertiary`、テキスト `--text-secondary`）を持つため、履歴パネルでの視覚的な区別が可能である。

| 状態                     | isToolAllowed() | PermissionDialog   | バッジ色（履歴パネル）               |
| ------------------------ | --------------- | ------------------ | ------------------------------------ |
| `denied`（エントリなし） | `false`         | 表示               | -（履歴なし）                        |
| `revoked`                | `false`         | 表示（denied扱い） | `--bg-tertiary` + `--text-secondary` |

---

## 4. PermissionDialogモード対照表

| リスクレベル | 表示モード                           | ダイアログ幅 | ヘッダー背景色トークン |
| ------------ | ------------------------------------ | ------------ | ---------------------- |
| `critical`   | -（autoDenyのため非表示）            | -            | -                      |
| `high`       | 通常モーダル（オーバーレイあり）     | 480px        | `--status-warning`     |
| `medium`     | 通常モーダル（オーバーレイあり）     | 400px        | `--status-caution`     |
| `low`        | インラインカード（オーバーレイなし） | 400px        | `--status-info`        |

---

## 5. 承認ボタン表示条件まとめ

| ボタン           | 表示条件                    | 対象レベル                                           |
| ---------------- | --------------------------- | ---------------------------------------------------- |
| 「今回のみ許可」 | `allowApproveOnce === true` | high/medium/low                                      |
| 「常に許可」     | `allowPermanent === true`   | medium/low のみ                                      |
| 「拒否する」     | 常に表示                    | 全レベル（criticalはautoDenyのため実質的に自動実行） |

- criticalレベル: `allowApproveOnce === false` かつ `allowPermanent === false` → 「拒否する」のみ（autoDenyでは自動実行）
- highレベル: `allowApproveOnce === true` かつ `allowPermanent === false` → 「今回のみ許可」と「拒否する」
- medium/lowレベル: `allowApproveOnce === true` かつ `allowPermanent === true` → 3ボタン全表示

---

## 6. 状態遷移パス一覧

### 有効遷移

```
denied ──────────────→ approved_once  （high/medium/low: 今回のみ許可）
denied ──────────────→ approved        （medium/low: 常に許可）
approved_once ────────→ denied          （セッション終了時、自動）
approved ─────────────→ revoked         （手動取消）
revoked ──────────────→ denied          （再度ダイアログ表示でユーザー操作）
```

### 禁止遷移

| 禁止遷移                       | 制限フラグ                     |
| ------------------------------ | ------------------------------ |
| `critical` → `approved_once`   | `allowApproveOnce === false`   |
| `critical` → `approved`        | `allowPermanent === false`     |
| `high` → `approved`            | `allowPermanent === false`     |
| `revoked` → `approved`（直接） | 一旦deniedを経由する必要がある |

---

## 7. 失効ポリシー × リスクレベル 組合せ制約マトリクス

| リスクレベル \ 失効ポリシー | session | time_24h | time_7d | permanent |
| --------------------------- | ------- | -------- | ------- | --------- |
| `critical`                  | 不可    | 不可     | 不可    | 不可      |
| `high`                      | 可      | 可       | 不可    | 不可      |
| `medium`                    | 可      | 可       | 可      | 可        |
| `low`                       | 可      | 可       | 可      | 可        |

- criticalが全ポリシー不可の根拠: `allowApproveOnce === false`（デフォルト）かつ `allowPermanent === false`
- highがtime_7d/permanent不可の根拠: `allowPermanent === false`（有期許可はsession/time_24hまで）
