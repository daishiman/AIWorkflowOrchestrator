# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase番号  | 9                              |
| Phase名    | 品質保証                       |
| 目的       | 静的解析・セキュリティ・性能   |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビューゲート） |
| ステータス | 未実施                         |

---

## 目的

静的解析、セキュリティ検査、パフォーマンス検証を行い、品質を保証する。

---

## 使用スキル

| スキル名                      | パス                                                    | 選定理由                                          |
| ----------------------------- | ------------------------------------------------------- | ------------------------------------------------- |
| linting-formatting-automation | `.claude/skills/linting-formatting-automation/SKILL.md` | Lint・フォーマット自動化（Trigger: Lint）         |
| dependency-auditing           | `.claude/skills/dependency-auditing/SKILL.md`           | 依存関係監査（Trigger: 依存関係、セキュリティ）   |
| security-configuration-review | `.claude/skills/security-configuration-review/SKILL.md` | セキュリティ設定レビュー（Trigger: セキュリティ） |
| electron-security-hardening   | `.claude/skills/electron-security-hardening/SKILL.md`   | Electronセキュリティ（Trigger: Electron）         |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

---

## 成果物

| 成果物                 | 説明                     | 配置先                                  |
| ---------------------- | ------------------------ | --------------------------------------- |
| 静的解析レポート       | Lint・型チェック結果     | `outputs/phase-9/static-analysis.md`    |
| セキュリティレポート   | 脆弱性・設定レビュー結果 | `outputs/phase-9/security-report.md`    |
| パフォーマンスレポート | 性能測定結果             | `outputs/phase-9/performance-report.md` |

---

## 実行手順

### Step 1: 静的解析

linting-formatting-automationスキルを参照し、静的解析を実行する。

```bash
# ESLint実行
pnpm lint

# TypeScript型チェック
pnpm typecheck

# Prettier フォーマットチェック
pnpm format:check
```

**静的解析結果**:

| チェック項目 | 結果 | 問題数 | 対応 |
| ------------ | ---- | ------ | ---- |
| ESLint       | TBD  | TBD    | TBD  |
| TypeScript   | TBD  | TBD    | TBD  |
| Prettier     | TBD  | TBD    | TBD  |

### Step 2: 依存関係監査

dependency-auditingスキルを参照し、依存関係の脆弱性を確認する。

```bash
# 依存関係監査
pnpm audit

# 依存関係の更新確認
pnpm outdated
```

**監査結果**:

| 脆弱性レベル | 件数 | 対応状況 |
| ------------ | ---- | -------- |
| Critical     | TBD  | TBD      |
| High         | TBD  | TBD      |
| Medium       | TBD  | TBD      |
| Low          | TBD  | TBD      |

### Step 3: セキュリティ検査

security-configuration-reviewとelectron-security-hardeningスキルを参照し、セキュリティ検査を行う。

**セキュリティチェックリスト**:

| 項目             | 確認内容                           | 結果 |
| ---------------- | ---------------------------------- | ---- |
| API Key管理      | 環境変数またはelectron-storeで管理 | TBD  |
| contextIsolation | trueに設定                         | TBD  |
| nodeIntegration  | falseに設定                        | TBD  |
| webSecurity      | trueに設定                         | TBD  |
| IPC通信          | バリデーション実装                 | TBD  |
| OWASP Top 10     | 該当脆弱性なし                     | TBD  |

### Step 4: パフォーマンス検証

**パフォーマンス基準**:

| 項目                            | 目標     | 実績 | 判定 |
| ------------------------------- | -------- | ---- | ---- |
| SDK初期化時間                   | < 1000ms | TBD  | TBD  |
| Query応答時間（初回）           | < 5000ms | TBD  | TBD  |
| Query応答時間（セッション継続） | < 3000ms | TBD  | TBD  |
| IPC通信オーバーヘッド           | < 50ms   | TBD  | TBD  |

---

## 完了条件

- [ ] ESLintエラーが0件
- [ ] TypeScriptエラーが0件
- [ ] Critical/High脆弱性が0件
- [ ] セキュリティチェックリスト全項目パス
- [ ] パフォーマンス基準を満たす
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 統合テスト連携

品質保証で統合テスト結果を確認:

- [ ] 統合テストが全てパス
- [ ] パフォーマンス劣化がない
- [ ] セキュリティ脆弱性がない

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                           | 内容                 |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------- |
| security-implementation | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | セキュリティ実装仕様 |

---

## スキルフィードバック記録

| スキル                        | 結果    | 備考              |
| ----------------------------- | ------- | ----------------- |
| linting-formatting-automation | pending | Phase完了後に記録 |
| dependency-auditing           | pending | Phase完了後に記録 |
| security-configuration-review | pending | Phase完了後に記録 |
| electron-security-hardening   | pending | Phase完了後に記録 |

---

## 品質ゲート

以下の品質ゲートをすべてクリアすること:

| ゲート項目     | 確認内容               | 結果 |
| -------------- | ---------------------- | ---- |
| 機能検証       | 自動テストの完全成功   | TBD  |
| コード品質     | Lint/型チェッククリア  | TBD  |
| テスト網羅性   | カバレッジ基準達成     | TBD  |
| セキュリティ   | 重大な脆弱性の不在     | TBD  |
| パフォーマンス | パフォーマンス基準達成 | TBD  |

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. linting-formatting-automationスキルの実行
3. dependency-auditingスキルの実行
4. security-configuration-reviewスキルの実行
5. electron-security-hardeningスキルの実行
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 品質ゲート判定の実施
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 9
```

---

## 次のPhase

Phase 10: 最終レビューゲート

---

## 備考

- Critical/High脆弱性は必ず対応する
- セキュリティ問題は最優先で修正する
