# テストシナリオ合格確認レポート

## メタ情報

| 項目           | 内容                                                            |
| -------------- | --------------------------------------------------------------- |
| 作成フェーズ   | Phase 9（品質検証）                                             |
| 検証対象       | Phase 4〜6 テストシナリオ（AC-1〜AC-4 の17件）                  |
| 検証実施日     | 2026-03-16                                                      |
| 検証方法       | 各シナリオの根拠を Phase 5 の型定義ファイルから引用して合格判定 |
| 総シナリオ件数 | 17件                                                            |

---

## AC-1: 権限境界（5件）

### TC-AC1-01: Critical ツール（`rm -rf` 相当）への恒久許可経路が存在しないこと

| 項目         | 内容                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `ToolRiskLevel === "critical"` のツールに対して「常に許可」ボタンが表示されず、恒久許可が付与できないこと |
| 根拠の所在   | `outputs/phase-5/security.ts` TOOL_RISK_CONFIG.critical 定義（L50-57）                                    |
| 引用箇所     | `allowPermanent: false, // 不変条件: Critical ツールへの恒久許可を禁止`（L53）                            |
| 合格判定     | PASS（根拠あり。不変条件コメントで明記）                                                                  |

### TC-AC1-02: Critical ツールへの一時許可（approved_once）経路が存在しないこと（autoDenyDefault=true 時）

| 項目         | 内容                                                                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `autoDenyDefault === true`（デフォルト）の Critical ツールに対して PermissionDialog が表示されず、即時 `decision: "denied"` が返されること                                    |
| 根拠の所在   | `outputs/phase-5/security.ts` TOOL_RISK_CONFIG.critical 定義（L50-57）、`outputs/phase-5/permission-state-machine.md` 禁止パス2                                               |
| 引用箇所     | `allowApproveOnce: false`（L52）、`autoDenyDefault: true`（L54）、permission-state-machine.md: 「禁止パス 2: denied → approved_once（Critical ツール かつ autoDenyDefault）」 |
| 合格判定     | PASS（根拠あり。両ファイルで一致して定義）                                                                                                                                    |

### TC-AC1-03: High ツールへの恒久許可経路が存在しないこと

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| シナリオ内容 | `ToolRiskLevel === "high"` のツールに対して「常に許可」ボタンが非表示であること |
| 根拠の所在   | `outputs/phase-5/security.ts` TOOL_RISK_CONFIG.high 定義（L58-65）              |
| 引用箇所     | `allowPermanent: false, // 恒久許可は禁止（High リスクは毎回確認）`（L61）      |
| 合格判定     | PASS（根拠あり）                                                                |

### TC-AC1-04: Medium ツールへの恒久許可が可能であること

| 項目         | 内容                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `ToolRiskLevel === "medium"` のツールに対して「常に許可」ボタンが表示され、`expiryPolicy: "permanent"` で保存されること |
| 根拠の所在   | `outputs/phase-5/security.ts` TOOL_RISK_CONFIG.medium 定義（L66-73）                                                    |
| 引用箇所     | `allowPermanent: true, // 恒久許可ボタンを表示（Medium 以下は許可）`（L69）                                             |
| 合格判定     | PASS（根拠あり）                                                                                                        |

### TC-AC1-05: Low ツールへの恒久許可が可能であること

| 項目         | 内容                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `ToolRiskLevel === "low"` のツールに対して「常に許可」ボタンが表示され、`expiryPolicy: "permanent"` で保存されること |
| 根拠の所在   | `outputs/phase-5/security.ts` TOOL_RISK_CONFIG.low 定義（L74-81）                                                    |
| 引用箇所     | `allowPermanent: true, // 恒久許可ボタンを表示（Low リスクは許可）`（L76）                                           |
| 合格判定     | PASS（根拠あり）                                                                                                     |

---

## AC-2: 承認履歴・取り消し（5件）

### TC-AC2-01: approved エントリを取り消すと isToolAllowed が false を返すこと

| 項目         | 内容                                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `PermissionStore.revokeTool(toolName)` 呼び出し後に `isToolAllowed(toolName)` が `false` を返すこと              |
| 根拠の所在   | `outputs/phase-5/permission-store-interface.ts` PermissionStoreInterface 定義（L51-91）                          |
| 引用箇所     | L70-72: `revokeTool(toolName: string): void;` + JSDoc: `「履歴テーブルには decision: "revoked" として記録する」` |
| 合格判定     | PASS（根拠あり。revokeTool 後は electron-store から削除されるため isToolAllowed は false 返却）                  |

### TC-AC2-02: revokeAll() 後に全ツールが isToolAllowed false を返すこと

| 項目         | 内容                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `PermissionStore.revokeAll()` 呼び出し後に任意のツール名で `isToolAllowed` が `false` を返すこと         |
| 根拠の所在   | `outputs/phase-5/permission-store-interface.ts` L76-78                                                   |
| 引用箇所     | `revokeAll(): void;` + JSDoc: `「全ての許可エントリを削除する。設定リセット・スキル削除時に呼び出す。」` |
| 合格判定     | PASS（根拠あり）                                                                                         |

### TC-AC2-03: session ポリシーのエントリがセッション終了後に非永続化されること

| 項目         | 内容                                                                                                                                                                          |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `expiryPolicy: "session"` で登録したエントリが `revokeSessionEntries` 後に存在しないこと、かつ electron-store に書き込まれないこと                                            |
| 根拠の所在   | `outputs/phase-5/permission-store-interface.ts` calcExpiresAt 関数（L109-127）、revokeSessionEntries 定義（L83-85）                                                           |
| 引用箇所     | L114-116: `case "session": // セッション管理はメモリ上のみ。electron-store には書き込まない / return undefined;` および L83: `revokeSessionEntries(sessionId: string): void;` |
| 合格判定     | PASS（根拠あり。session の calcExpiresAt が undefined を返し、electron-store 非書き込みが明記）                                                                               |

### TC-AC2-04: time_24h ポリシーが 86400000ms 後に失効すること

| 項目         | 内容                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| シナリオ内容 | `expiryPolicy: "time_24h"` で登録したエントリが `allowedAt + 86_400_000ms` 経過後に `isToolAllowed` で `false` を返すこと                                                                  |
| 根拠の所在   | `outputs/phase-5/permission-store-interface.ts` calcExpiresAt 関数（L117-119）および isToolAllowed 6分岐フロー（L39-46）                                                                   |
| 引用箇所     | L118-119: `// 86_400_000 ms = 60 * 60 * 24 * 1000 = 24時間 / return allowedAt + 86_400_000;` および L41-43: `3. expiresAt < Date.now() → electron-store から削除して false を返す（失効）` |
| 合格判定     | PASS（根拠あり。計算式と判定ロジック両方が定義済み）                                                                                                                                       |

### TC-AC2-05: 承認履歴テーブルが最大1000件でFIFO削除されること

| 項目         | 内容                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | 承認履歴エントリが `PERMISSION_HISTORY_MAX_ENTRIES`（1000件）を超過した場合、最古エントリが自動削除されること             |
| 根拠の所在   | `outputs/phase-5/permission-store-interface.ts` 定数定義（L129-134）                                                      |
| 引用箇所     | L130-134: `export const PERMISSION_HISTORY_MAX_ENTRIES = 1000;` + JSDoc: `「超過時は最古エントリを削除する（FIFO方式）」` |
| 合格判定     | PASS（根拠あり。定数と動作説明が明記）                                                                                    |

---

## AC-3: 説明責任（4件）

### TC-AC3-01: INS-01 が High/Critical ツールを含むスキルで表示されること

| 項目         | 内容                                                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `skill.requiredTools` に `riskLevel === "high"` または `riskLevel === "critical"` のツールが1件以上含まれる場合に `<RiskWarningBanner>` が表示されること                                                       |
| 根拠の所在   | `outputs/phase-5/accountability-ui-spec.md` INS-01 発火条件（L32-36）                                                                                                                                          |
| 引用箇所     | `const shouldShowRiskBanner = skill.requiredTools.some((tool) => TOOL_RISK_CONFIG[tool.riskLevel].dialogWidth >= 480);` + コメント: `// dialogWidth >= 480 は "high" または "critical" リスクレベルに対応する` |
| 合格判定     | PASS（根拠あり。dialogWidth >= 480 が high(480) と critical(640) の両方を正確に識別する）                                                                                                                      |

### TC-AC3-02: INS-01 が Medium/Low のみのスキルで非表示であること

| 項目         | 内容                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `skill.requiredTools` の全ツールが `riskLevel === "medium"` または `riskLevel === "low"` の場合、INS-01 が非表示であること |
| 根拠の所在   | `outputs/phase-5/accountability-ui-spec.md` INS-01 発火条件テーブル（L39-43）                                              |
| 引用箇所     | テーブル行: `全ツールが Medium または Low リスク → 非表示` および `skill.requiredTools が空配列 → 非表示`                  |
| 合格判定     | PASS（根拠あり。medium(400px) と low(400px) は dialogWidth < 480 のため条件式で除外される）                                |

### TC-AC3-03: INS-02 が permissionResolver.pendingCount > 0 の時に表示されること

| 項目         | 内容                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `permissionResolver.pendingCount` が1以上の場合に `<PermissionPendingIndicator>` が表示され、0になると 300ms フェードアウトで非表示になること                        |
| 根拠の所在   | `outputs/phase-5/accountability-ui-spec.md` INS-02 発火条件（L63-68）および表示コンテンツ仕様（L75-84）                                                              |
| 引用箇所     | `const shouldShowPendingIndicator = permissionResolver.pendingCount > 0;` および `アニメーション: pendingCount が 0 になった際に 300ms フェードアウトで非表示にする` |
| 合格判定     | PASS（根拠あり）                                                                                                                                                     |

### TC-AC3-04: INS-03 がセッション中権限履歴が1件以上の時に表示されること

| 項目         | 内容                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | `sessionPermissionHistory.length > 0` の場合に `<SessionPermissionHistoryPanel>` が表示され、0件の場合は非表示であること  |
| 根拠の所在   | `outputs/phase-5/accountability-ui-spec.md` INS-03 発火条件（L93-100）                                                    |
| 引用箇所     | `const shouldShowHistory = sessionPermissionHistory.length > 0;` + テーブル: `セッション中の権限承認・拒否が0件 → 非表示` |
| 合格判定     | PASS（根拠あり）                                                                                                          |

---

## AC-4: 安全性ゲート（3件）

### TC-AC4-01: CRITICAL_TOOL_REQUIRED チェックで overallGrade が UNSAFE になること

| 項目         | 内容                                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | スキルが Critical ツールを1件以上要求する場合に `SafetyGateResult.overallGrade === "UNSAFE"` となること                                                                               |
| 根拠の所在   | `outputs/phase-5/safety-gate.ts` SafetyCheckId 定義デシジョンテーブル（L24-36）                                                                                                       |
| 引用箇所     | `\| "CRITICAL_TOOL_REQUIRED"` + コメント: `\| UNSAFE \| Critical ツールを1件以上要求する` + グレード優先度ルール: `details 内に status:"blocked" が1件以上 → overallGrade = "UNSAFE"` |
| 合格判定     | PASS（根拠あり。CRITICAL_TOOL_REQUIRED は blocked ステータスに対応するため UNSAFE）                                                                                                   |

### TC-AC4-02: HIGH_TOOL_REQUIRED チェックで overallGrade が SAFE_WITH_WARNINGS になること

| 項目         | 内容                                                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | スキルが High ツールを要求するが Critical は含まない場合に `overallGrade === "SAFE_WITH_WARNINGS"` となること                                                                                                                   |
| 根拠の所在   | `outputs/phase-5/safety-gate.ts` SafetyCheckId 定義デシジョンテーブル（L24-36）                                                                                                                                                 |
| 引用箇所     | `\| "HIGH_TOOL_REQUIRED"` + コメント: `\| SAFE_WITH_WARNINGS \| High ツールを要求するが Critical ではない` + グレード優先度ルール: `status:"blocked" なし かつ status:"warned" が1件以上 → overallGrade = "SAFE_WITH_WARNINGS"` |
| 合格判定     | PASS（根拠あり）                                                                                                                                                                                                                |

### TC-AC4-03: 全ツール Low リスクの場合に overallGrade が SAFE になること

| 項目         | 内容                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| シナリオ内容 | スキルの全要求ツールが Low リスクの場合に `overallGrade === "SAFE"` となること                                                                     |
| 根拠の所在   | `outputs/phase-5/safety-gate.ts` SafetyCheckId 定義デシジョンテーブル（L24-36）                                                                    |
| 引用箇所     | `\| "ALL_LOW_TOOLS"` + コメント: `\| SAFE \| 全ツールが Low リスク` + グレード優先度ルール: `全チェックが status:"passed" → overallGrade = "SAFE"` |
| 合格判定     | PASS（根拠あり）                                                                                                                                   |

---

## 総合判定

| カテゴリ                   | シナリオ件数 | PASS   | FAIL  |
| -------------------------- | ------------ | ------ | ----- |
| AC-1（権限境界）           | 5            | 5      | 0     |
| AC-2（承認履歴・取り消し） | 5            | 5      | 0     |
| AC-3（説明責任）           | 4            | 4      | 0     |
| AC-4（安全性ゲート）       | 3            | 3      | 0     |
| **合計**                   | **17**       | **17** | **0** |

**テストシナリオ合格確認 総合判定: PASS（17/17 PASS）**
