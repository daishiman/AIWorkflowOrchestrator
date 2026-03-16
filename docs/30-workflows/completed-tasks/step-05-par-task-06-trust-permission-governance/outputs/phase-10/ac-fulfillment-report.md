# AC充足確認レポート

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| 作成フェーズ | Phase 10（最終レビュー）                    |
| 検証実施日   | 2026-03-16                                  |
| 検証担当     | Phase 10 最終レビューエージェント           |
| 根拠ファイル | Phase 5 正本ファイル + Phase 1/2 設計成果物 |

---

## AC-1: 危険操作の権限境界が明確（6項目）

### 項目 1: Critical/High/Medium/Low の4段階が条件式で定義されている

充足判定: **OK**

根拠: `outputs/phase-5/security.ts` L14 に `export type ToolRiskLevel = "critical" | "high" | "medium" | "low"` として4段階が明示的なユニオン型で定義されている。同ファイル L49 の `TOOL_RISK_CONFIG: Record<ToolRiskLevel, ToolRiskConfig>` により全4段階のエントリが网羅されている。`outputs/phase-1/risk-level-classification.md` セクション1にも同4段階の説明が記載されている。

### 項目 2: BASH_COMMANDS 24件にリスクレベルが付与されている

充足判定: **OK**

根拠: `outputs/phase-1/risk-level-classification.md` セクション2「BASH_COMMANDS 危険パターン一覧（24件）」に、`rm -rf` から `truncate` まで全24件のパターンにリスクレベルが付与されている。critical 14件（#1, 2, 3, 4, 6, 7, 8, 10, 11, 15, 16, 17, 23 を含む）、high 10件（#5, 9, 12, 13, 14, 18, 19, 20, 21, 22, 24 を含む）として分類されている。

### 項目 3: PROTECTED_PATHS 25件にリスクレベルが付与されている

充足判定: **OK**

根拠: `outputs/phase-1/risk-level-classification.md` セクション3「PROTECTED_PATHS 一覧（25件）」に `/etc/passwd` から `/tmp/` まで全25件のパスにリスクレベル（critical/high/medium/low）が付与されている。判定根拠の説明も全件に記載されている。

### 項目 4: ToolRiskConfig の4レベルにダイアログ表現が設計されている

充足判定: **OK**

根拠: `outputs/phase-5/security.ts` L20-82 の `ToolRiskConfig` インターフェースおよび `TOOL_RISK_CONFIG` マップにより、4レベルそれぞれに `headerColorToken`（ダイアログヘッダー色）、`dialogWidth`（ダイアログ幅）、`allowApproveOnce`/`allowPermanent`（ボタン表示制御）が定義されている。`outputs/phase-2/risk-level-design.md` セクション4にワイヤーフレームも設計されている。

### 項目 5: Critical に恒久許可経路が存在しない（allowPermanent === false）

充足判定: **OK**

根拠: `outputs/phase-5/security.ts` L53 に `allowPermanent: false, // 不変条件: Critical ツールへの恒久許可を禁止` と変更禁止コメント付きで明記されている。同ファイル L44 のコメントにも「不変条件（TC-T-001 で検証）: critical.allowPermanent === false」と記載されている。

### 項目 6: High に恒久許可経路が存在しない（allowPermanent === false）

充足判定: **OK**

根拠: `outputs/phase-5/security.ts` L61 に `allowPermanent: false, // 恒久許可は禁止（High リスクは毎回確認）` と明記されている。`outputs/phase-2/risk-level-design.md` セクション3.1の設計判断根拠表にも「任意コード実行・機密パスアクセスを伴うが、ユーザーが操作内容を確認した上で1回限りの許可を選択できるようにする」と根拠が記載されている。

**AC-1 小計: 6/6 OK**

---

## AC-2: 承認履歴と取り消し方針（6項目）

### 項目 1: 履歴エントリ必須フィールド7件が全て定義されている

充足判定: **OK**

根拠: `outputs/phase-1/approval-history-policy.md` セクション1「履歴エントリ型定義（8フィールド）」に `id`、`toolName`、`skillName`、`decision`、`riskLevel`、`timestamp`、`expiryPolicy` の7必須フィールドと、任意フィールド `revokedAt` が定義されている（計8フィールド、必須7件の要件は充足）。各フィールドのバリデーション条件も仕様詳細表で明記されている。

### 項目 2: 取り消し条件3点が明記されている

充足判定: **OK**

根拠: `outputs/phase-1/approval-history-policy.md` セクション2「取り消し条件定義」に以下3つの取り消しトリガーが明記されている: (1) ユーザー手動取り消し（設定画面からの操作）、(2) スキル更新時の自動失効（contentHash不一致）、(3) 期限切れ自動削除（expiryPolicy条件超過）。

### 項目 3: FIFO上限ポリシー（1001件目で先頭削除）が明記されている

充足判定: **OK**

根拠: `outputs/phase-1/approval-history-policy.md` セクション3「FIFO 1000件制限」に「削除単位: 1件ずつ（バッチ削除は行わない）」「1001件目追加時に最古1件のみ削除」と明記されている。`outputs/phase-5/permission-store-interface.ts` L134 に `export const PERMISSION_HISTORY_MAX_ENTRIES = 1000` として定数も定義されている。

### 項目 4: AllowedToolEntryV2 の expiresAt が optional

充足判定: **OK**

根拠: `outputs/phase-5/permission-store-interface.ts` L27 に `expiresAt?: number;`（`?` 付きの optional フィールド）として定義されている。コメントに「失効タイムスタンプ（Unix ms）。undefined = 無期限」と説明が付いている。後方互換性ルールにより「expiresAt が undefined の既存エントリは『無期限有効』として扱う」とも明記されている。

### 項目 5: 失効ポリシー4種がタイムアウト値付きで定義されている

充足判定: **OK**

根拠: `outputs/phase-5/permission-store-interface.ts` L32 に `expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent"` として4種が定義されている。同ファイル L98-127 の `calcExpiresAt` 関数のコメントテーブルに各ポリシーの計算式（session=undefined、time_24h=+86_400_000ms、time_7d=+604_800_000ms、permanent=undefined）が明記されている。`outputs/phase-1/approval-history-policy.md` セクション5にも同4種の詳細説明がある。

### 項目 6: 取り消しUIフロー（revokedAt追加・バッジ変更）が設計されている

充足判定: **OK**

根拠: `outputs/phase-5/accountability-ui-spec.md` セクション「INS-03」の「恒久許可の取り消しボタン」に「ボタン押下後: 該当エントリの decision バッジを『取り消し済み』に更新する（リストからは削除しない）」と明記されている。`outputs/phase-5/permission-state-machine.md` パス4「approved → revoked」に「承認履歴テーブルに decision: "revoked" が記録される（元の approved エントリを上書きせず追記）」と手順が定義されている。

**AC-2 小計: 6/6 OK**

---

## AC-3: 実行導線に説明責任（5項目）

### 項目 1: INS-01 の挿入先・タイミング・表示条件が定義されている

充足判定: **OK**

根拠: `outputs/phase-5/accountability-ui-spec.md` セクション「INS-01: リスク警告バナー（CTA 画面）」に以下が定義されている。挿入先: Task-05 CTA 画面（ヘッダー下・スキル詳細上）。タイミング: CTA 画面の表示時。表示条件: `skill.requiredTools.some(tool => TOOL_RISK_CONFIG[tool.riskLevel].dialogWidth >= 480)`（High または Critical ツール1件以上）。

### 項目 2: INS-02 の挿入先・タイミング・表示条件が定義されている

充足判定: **OK**

根拠: `outputs/phase-5/accountability-ui-spec.md` セクション「INS-02: 権限待機インジケーター（実行中画面）」に以下が定義されている。挿入先: Task-03 スキル実行中画面（実行ログエリア上部）。タイミング: 権限ダイアログ表示待機中。表示条件: `permissionResolver.pendingCount > 0`。

### 項目 3: INS-03 の挿入先・タイミング・表示条件が定義されている

充足判定: **OK**

根拠: `outputs/phase-5/accountability-ui-spec.md` セクション「INS-03: セッション権限履歴パネル（実行結果画面）」に以下が定義されている。挿入先: Task-05 実行結果画面（実行完了メッセージ下）。タイミング: 実行完了後。表示条件: `sessionPermissionHistory.length > 0`。

### 項目 4: ScoringGate === NEEDS_IMPROVEMENT 時のテキスト挿入ルールが条件式で定義されている

充足判定: **OK**

根拠: `outputs/phase-2/safety-gate-contract.md` セクション9「CTA 連動（SafetyGrade x CTA 状態マトリクス）」のセクション9-2に条件式が定義されている。`safetyResult.overallGrade === "UNSAFE" || safetyResult.overallGrade === "SAFE_WITH_WARNINGS"` で INS-01 バナー表示が決まる。`UNSAFE` 時には「このスキルは安全性チェックに不合格のため実行できません」テキストが挿入される設計（セクション9-3）。

### 項目 5: 3挿入点が新規画面遷移を追加しない（既存画面への表示追加）と明記されている

充足判定: **OK**

根拠: `outputs/phase-5/accountability-ui-spec.md` 挿入点一覧テーブルに「INS-01: Task-05 CTA 画面（ヘッダー下・スキル詳細上）」「INS-02: Task-03 スキル実行中画面（実行ログエリア上部）」「INS-03: Task-05 実行結果画面（実行完了メッセージ下）」と、全て既存画面への挿入位置として定義されている。新規画面への遷移は設計されていない。

**AC-3 小計: 5/5 OK**

---

## AC-4: 安全性ゲートと接続（6項目）

### 項目 1: SafetyGatePort が async evaluate() で定義されている

充足判定: **OK**

根拠: `outputs/phase-5/safety-gate.ts` L108-114 に `export interface SafetyGatePort { evaluate(skillName: string): Promise<SafetyGateResult>; }` として定義されている。`Promise<SafetyGateResult>` 返しであるため async 対応であることが保証されている。`outputs/phase-2/safety-gate-contract.md` セクション2にも同一の定義がある。

### 項目 2: SafetyGrade の3段階が定義されている

充足判定: **OK**

根拠: `outputs/phase-5/safety-gate.ts` L18 に `export type SafetyGrade = "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE"` として3段階が定義されている。同ファイル L12-16 のコメントに「UNSAFE > SAFE_WITH_WARNINGS > SAFE」の優先度ルールも記載されている。

### 項目 3: 安全性チェックルール5件がGrade影響まで定義されている

充足判定: **OK**

根拠: `outputs/phase-2/safety-gate-contract.md` セクション3-1のチェック定義表に5件（CRITICAL_TOOL_REQUIRED/HIGH_TOOL_REQUIRED/NO_PERMANENT_APPROVAL/ALL_LOW_TOOLS/PROTECTED_PATH_ACCESS）それぞれの判定条件式・Grade影響・status値・メッセージテンプレートが定義されている。同テーブルは `outputs/phase-5/safety-gate.ts` L24-42 の `SafetyCheckId` 定義とも整合している。

### 項目 4: SkillSafetyContract の全フィールド型と説明が定義されている

充足判定: **OK**

根拠: `outputs/phase-2/safety-gate-contract.md` セクション2の TypeScript 型定義に `SkillSafetyContract` の全フィールド（skillId: string、skillVersion: string、maxRiskLevel: ToolRiskLevel、hasOnlyOncePerm: boolean、deniedRatio: number、requiresExplicitConsent: boolean）の型と説明が定義されている。セクション5-1のフィールド仕様表で算出ロジックも明記されている。

### 項目 5: 公開不可条件（Critical/Highリスク含有）に設計根拠がある

充足判定: **OK**

根拠: `outputs/phase-2/safety-gate-contract.md` セクション8「公開不可条件の設計根拠」に以下の根拠が記載されている。CRITICAL_TOOL_REQUIRED（セクション8-1）: 「第三者の環境で Critical 操作が実行された場合、データ消失・システム破壊が不可逆的に発生し、復旧手段が存在しない」。HIGH_TOOL_REQUIRED（セクション8-2）: 「第三者利用時に機密情報（SSH鍵、AWSクレデンシャル、環境変数）が外部に送信されるリスクがある」。

### 項目 6: 公開警告条件（denied率50%以上）に設計根拠がある

充足判定: **OK**

根拠: `outputs/phase-2/safety-gate-contract.md` セクション8-4「denied 率50%以上（WARN-1: 警告表示）」に閾値50%の根拠が明記されている（「30%未満では個別の操作ミスと区別が困難。70%以上にすると、3件中2件を拒否しても警告が出ないため保護が不十分。50%は『半数以上が拒否』という直感的に理解可能な閾値」）。

**AC-4 小計: 6/6 OK**

---

## 総合結果

| AC       | 項目数 | OK     | NG    | 判定           |
| -------- | ------ | ------ | ----- | -------------- |
| AC-1     | 6      | 6      | 0     | OK             |
| AC-2     | 6      | 6      | 0     | OK             |
| AC-3     | 5      | 5      | 0     | OK             |
| AC-4     | 6      | 6      | 0     | OK             |
| **合計** | **23** | **23** | **0** | **全項目充足** |
