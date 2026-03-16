# アカウンタビリティ UI 挿入点仕様（確定版）

<!-- Task-06 Phase 5 成果物: INS-01〜INS-03 の発火条件確定仕様 -->

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| 作成フェーズ | Phase 5（実装仕様）                                           |
| 依存成果物   | Phase 2 設計書（ワイヤーフレーム）, Phase 4 テスト設計書      |
| 参照テストID | TC-UI-001（INS-01）, TC-UI-002（INS-02）, TC-UI-003（INS-03） |
| 検証方法     | scripts/validate-trust-governance-design.ts の項目 6          |

---

## 挿入点一覧

| 挿入点ID | 挿入先コンポーネント     | 挿入位置                 |
| -------- | ------------------------ | ------------------------ |
| INS-01   | Task-05 CTA 画面         | ヘッダー下・スキル詳細上 |
| INS-02   | Task-03 スキル実行中画面 | 実行ログエリア上部       |
| INS-03   | Task-05 実行結果画面     | 実行完了メッセージ下     |

---

## INS-01: リスク警告バナー（CTA 画面）

### 発火条件（具体的判定ロジック）

```typescript
// INS-01 表示判定
const shouldShowRiskBanner = skill.requiredTools.some(
  (tool) => TOOL_RISK_CONFIG[tool.riskLevel].dialogWidth >= 480,
);
// dialogWidth >= 480 は "high" または "critical" リスクレベルに対応する
// medium(400px) と low(400px) は非表示対象
```

| 条件                                                            | 結果     |
| --------------------------------------------------------------- | -------- |
| `skill.requiredTools` に High または Critical のツールが1件以上 | 表示する |
| 全ツールが Medium または Low リスク                             | 非表示   |
| `skill.requiredTools` が空配列                                  | 非表示   |

### 表示コンテンツ仕様

```
[警告アイコン] このスキルは高リスクツール（{ツール名リスト}）を使用します。
実行前に権限ダイアログで確認が必要です。
```

- **アイコン**: `--status-warning` カラートークンの警告アイコン（⚠️ 相当）
- **ツール名リスト**: `riskLevel === "high" || riskLevel === "critical"` のツール名を `,` 区切りで列挙する
- **最大表示件数**: 3件まで。4件以上の場合は「{3件のツール名} 他 {N} 件」と表示する
- **コンポーネント**: `<RiskWarningBanner>` (`organisms` 層)
- **ワイヤーフレーム参照**: `outputs/phase-2/wireframes/ins-01-risk-banner.png`

---

## INS-02: 権限待機インジケーター（実行中画面）

### 発火条件（具体的判定ロジック）

```typescript
// INS-02 表示判定
// permissionResolver.pendingCount は IPC チャンネル "permission:pending:count" から取得する
const shouldShowPendingIndicator = permissionResolver.pendingCount > 0;
```

| 条件                                    | 結果     |
| --------------------------------------- | -------- |
| `permissionResolver.pendingCount > 0`   | 表示する |
| `permissionResolver.pendingCount === 0` | 非表示   |

### 表示コンテンツ仕様

```
[スピナー] 権限の確認を待機中...（{pendingCount} 件）
```

- **スピナー**: `--status-info` カラートークンの回転アニメーション（200ms、linear）
- **pendingCount**: リアルタイム更新（IPC イベント `permission:pending:updated` を購読）
- **アニメーション**: pendingCount が 0 になった際に 300ms フェードアウトで非表示にする
- **コンポーネント**: `<PermissionPendingIndicator>` (`molecules` 層)
- **ワイヤーフレーム参照**: `outputs/phase-2/wireframes/ins-02-pending-indicator.png`

---

## INS-03: セッション権限履歴パネル（実行結果画面）

### 発火条件（具体的判定ロジック）

```typescript
// INS-03 表示判定
// sessionPermissionHistory はセッション中に承認・拒否された全エントリのリスト
const shouldShowHistory = sessionPermissionHistory.length > 0;
```

| 条件                                  | 結果     |
| ------------------------------------- | -------- |
| `sessionPermissionHistory.length > 0` | 表示する |
| セッション中の権限承認・拒否が0件     | 非表示   |

### 表示コンテンツ仕様

#### ヘッダー

```
[鍵アイコン] このセッションの権限履歴（{件数} 件）
```

#### エントリ行（1件ごと）

```
[ツール名] [{riskLevel バッジ}] [{decision バッジ}] {allowedAt の相対時刻}
```

- **ツール名**: 左揃え、`font-weight: 500`
- **riskLevel バッジ**: `TOOL_RISK_CONFIG[riskLevel].headerColorToken` の背景色を使用
- **decision バッジ**:
  - `approved_once`: 緑色（`--status-success`）「今回のみ」
  - `approved_permanent`: 青色（`--status-info`）「常に許可」
  - `denied`: 赤色（`--status-destructive`）「拒否」
- **相対時刻**: `{N}秒前` / `{N}分前` 形式（例: 「2分前」）

#### 恒久許可の取り消しボタン

- `decision === "approved_permanent"` のエントリのみ「取り消す」ボタンを表示する
- ボタン押下時: `permission:revoke` IPC チャンネルを呼び出し、権限状態マシンのパス 4 を実行する
- ボタン押下後: 該当エントリの decision バッジを「取り消し済み」に更新する（リストからは削除しない）

#### ページング

- 表示件数: 最大 10 件（スクロールなし）
- 11件以上: 「さらに {N} 件を表示」ボタンを表示する
- 最大表示上限: `PERMISSION_HISTORY_MAX_ENTRIES`（1000件）まで

- **コンポーネント**: `<SessionPermissionHistoryPanel>` (`organisms` 層)
- **ワイヤーフレーム参照**: `outputs/phase-2/wireframes/ins-03-history-panel.png`

---

## 挿入点間の依存関係

```
INS-01（CTA 画面）
  └── スキル実行開始
        └── INS-02（実行中画面）← permissionResolver.pendingCount が変化
              └── 実行完了
                    └── INS-03（結果画面）← sessionPermissionHistory に履歴が蓄積
```

- INS-01 は INS-02 / INS-03 の結果に依存しない（独立して表示判定する）
- INS-02 と INS-03 は同一セッション内のデータを共有する

---

## アクセシビリティ要件

| 挿入点 | ARIA 属性                                | キーボード操作                 |
| ------ | ---------------------------------------- | ------------------------------ |
| INS-01 | `role="alert"`, `aria-live="polite"`     | フォーカス移動のみ（操作なし） |
| INS-02 | `role="status"`, `aria-live="polite"`    | フォーカス移動のみ（操作なし） |
| INS-03 | `role="region"`, `aria-label="権限履歴"` | Tab でボタン操作可能           |

コントラスト比: 全テキストが WCAG 2.1 AA（4.5:1 以上）を満たすこと。
