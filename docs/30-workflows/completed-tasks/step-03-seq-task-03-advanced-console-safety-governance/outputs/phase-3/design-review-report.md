# Phase 3 設計レビュー報告

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| タスクID  | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase     | 3                                               |
| 作成日    | 2026-03-24                                      |
| 依存Phase | Phase 1, Phase 2                                |

## レビュー観点

### 1. Approval 漏れレビュー

| チェック項目                                    | 判定 | 根拠                            |
| ----------------------------------------------- | ---- | ------------------------------- |
| 外部 API 呼び出し前に approval trigger がある   | PASS | APR-T1 で定義済み               |
| ファイル書き込み前に approval trigger がある    | PASS | APR-T2 で定義済み               |
| 外部プロセス起動前に approval trigger がある    | PASS | APR-T3 で定義済み               |
| システム設定変更前に approval trigger がある    | PASS | APR-T4 で定義済み               |
| Approval enforcement が Main Process に存在する | PASS | ApprovalGate interface 定義済み |
| Approval token に有効期限がある                 | PASS | 単一操作ごとの失効を明記        |
| Approval 不要操作が明示列挙されている           | PASS | 1.5 で5操作を列挙               |
| handoff 前の approval が定義されている          | PASS | Approval Flow で明記            |

**Approval 漏れ判定: PASS**

### 2. Disclosure 不足レビュー

| チェック項目                                   | 判定 | 根拠                                |
| ---------------------------------------------- | ---- | ----------------------------------- |
| Session open 時に AI 利用を開示する            | PASS | DSC-R1 で必須定義                   |
| 外部送信可能性を開示する                       | PASS | Disclosure 2.1 で定義               |
| 開示バナーの dismiss/再表示が定義されている    | PASS | DSC-R2, DSC-R3 で定義               |
| Approval Sheet 内の disclosure が dismiss 不可 | PASS | DSC-R4 で定義                       |
| guidance-only state での開示が定義されている   | PASS | DSC-R5 で定義                       |
| 開示内容に AI モデル名が含まれる               | PASS | FR-2b、Disclosure 2.2 で定義        |
| 開示内容に送信先種別が含まれる                 | PASS | FR-3b、Disclosure 2.2 で定義        |
| secret（API key, token）が開示に含まれない     | PASS | Disclosure 2.4 Data Flow で分離定義 |

**Disclosure 不足判定: PASS**

### 3. Auto-Send 侵入レビュー

| チェック項目                                | 判定 | 根拠                        |
| ------------------------------------------- | ---- | --------------------------- |
| transcript 自動送信の IPC が存在しない      | PASS | NAS-1: IPC endpoint 非提供  |
| session 結果の自動報告 IPC が存在しない     | PASS | NAS-2: IPC endpoint 非提供  |
| エラーログ自動送信 IPC が存在しない         | PASS | NAS-3: IPC endpoint 非提供  |
| ユーザー操作なしの LLM 呼び出しが阻止される | PASS | NAS-4: Approval gate で阻止 |
| Manual Share Rail が3操作を維持している     | PASS | AS-1: Task02 契約を維持     |
| hidden parsing が禁止されている             | PASS | DENY-3 で明示禁止           |
| hidden prompt injection が禁止されている    | PASS | DENY-4 で明示禁止           |

**Auto-Send 侵入判定: PASS**

### 4. Front 露出過多レビュー

| チェック項目                                     | 判定 | 根拠                                 |
| ------------------------------------------------ | ---- | ------------------------------------ |
| advanced console が default 非表示である         | PASS | GATE-1: opt-in 明示選択必須          |
| 「高度な表示」が secondary/tertiary に配置       | PASS | CTA-R2: Primary と並列しない         |
| primary CTA に「terminal」が含まれない           | PASS | CTA-R4: ラベル固定規則               |
| collapsed / unavailable / guidance-only で非表示 | PASS | 非表示条件で明記                     |
| advanced console 内の操作が front に波及しない   | PASS | 4.3 禁止操作で定義                   |
| Layer 構造（Primary → Safety → Detail）が明確    | PASS | advanced-console-boundary 1.1 で定義 |

**Front 露出過多判定: PASS**

### 5. Compliance 検証

| チェック項目                                            | 判定 | 根拠                                |
| ------------------------------------------------------- | ---- | ----------------------------------- |
| DENY-1〜DENY-10 が設計で防止されている                  | PASS | compliance-baseline 禁止事項に対応  |
| MUST-1〜MUST-10 が設計で満たされている                  | PASS | 設計サマリー + 契約書で網羅         |
| Enforcement Point が Main/Renderer 両層で定義されている | PASS | 設計サマリー アーキテクチャ図で定義 |
| 既存 safety 基盤との整合が取れている                    | PASS | RuntimePolicyResolver 活用を明記    |
| consumer auth 非流用が明示されている                    | PASS | CAG-1〜CAG-3 で禁止                 |

**Compliance 検証判定: PASS**

## 指摘事項

### MINOR 指摘

| ID   | 指摘                                                                  | 影響度 | 対応方針                   |
| ---- | --------------------------------------------------------------------- | ------ | -------------------------- |
| R-M1 | Approval token の有効期限が「単一操作ごと」だが、具体的な秒数が未定義 | 低     | Phase 5 で実装時に決定     |
| R-M2 | Disclosure banner の再表示アイコンの具体的な配置位置が未確定          | 低     | Phase 5 で UI 実装時に決定 |
| R-M3 | Advanced Console の read-only モードの具体的な制約が未詳細化          | 低     | Phase 5 で実装時に詳細化   |

### MAJOR 指摘

なし

### CRITICAL 指摘

なし

## AC 検証結果

| AC   | 判定 | 根拠                                                           |
| ---- | ---- | -------------------------------------------------------------- |
| AC-1 | PASS | FR-1a〜FR-1e + ApprovalGate interface + Approval Flow 定義済み |
| AC-2 | PASS | DSC-R1 + Disclosure 2.1/2.2 + SessionDisclosureBanner 定義済み |
| AC-3 | PASS | NAS-1〜NAS-4 + DENY-1/DENY-3/DENY-4 + CAG-1〜CAG-3 定義済み    |
| AC-4 | PASS | GATE-1〜GATE-3 + CTA-R1〜CTA-R5 + Layer 構造定義済み           |
