# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 3                                                            |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 2                                                      |
| 後続Phase  | Phase 4                                                      |
| 作成日     | 2026-04-11                                                   |
| ステータス | 未実施                                                       |

## 目的

Phase 2の設計成果物（アーキテクチャ設計・IPC契約・テスト戦略）をレビューし、
Phase 4（テスト作成）へ進行可能かを判定する。

## 実行タスク

### タスク1: CSP整合性確認

**目的**: IPC経由アプローチがElectronセキュリティポリシーと整合しているかを確認する

**実行手順**:

1. Phase 2で設計したIPCチャネルがCSP制限に非抵触であることを確認する
2. Preload APIを経由しており`ipcRenderer.on`直接使用がないことを確認する
3. `ALLOWED_INVOKE_CHANNELS`へのanalyticsチャネル追加が設計に含まれているか確認する
4. Electronのwebセキュリティ設定を緩めていないことを確認する

**期待される成果物**:

- `outputs/phase-3/contradiction-checklist.md`（CSP整合性セクション）

### タスク2: Breaking Change確認

**目的**: `trackEvent`公開APIへの影響がないことを確認する

**実行手順**:

1. Phase 2設計で`trackEvent<K>(eventName, payload): void`シグネチャが不変であることを確認する
2. `SkillCreateWizard.tsx`の計装ポイントへの変更が不要または最小であることを確認する
3. 既存計装テスト（`SkillCreateWizard.tracking.test.tsx`）への影響を評価する
4. W3-seq-04で確立した`SkillWizardEvents`型との整合性を確認する

**期待される成果物**:

- `outputs/phase-3/contradiction-checklist.md`（Breaking Change確認セクション）

### タスク3: フォールバック設計確認

**目的**: 初期化失敗時・オプトアウト時のフォールバック設計が適切であることを確認する

**実行手順**:

1. analytics provider初期化失敗時のno-opフォールバック設計を確認する（AC-9）
2. エラーが`trackEvent`呼び出し元にスローされないことを確認する
3. オプトアウト時のno-op動作設計を確認する（AC-4）
4. フォールバック後の状態が一貫していることを確認する

**期待される成果物**:

- `outputs/phase-3/contradiction-checklist.md`（フォールバック設計セクション）

### タスク4: レビュー結果判定

**目的**: PASS/MINOR/MAJOR/CRITICALの判定を行い次のアクションを決定する

**実行手順**:

1. 全レビュー観点（CSP整合性・Breaking Change・フォールバック・テスト戦略）を集計する
2. 判定基準テーブルに従い総合判定を行う
3. MINOR以上の指摘がある場合は対応方針を記録する
4. Phase 4進行可否を判定する

**期待される成果物**:

- `outputs/phase-3/design-review-result.md`
- `outputs/phase-3/gate-decision.md`

## レビュー観点

| 観点                 | チェック内容                                      | 判定基準      |
| -------------------- | ------------------------------------------------- | ------------- |
| CSP整合性            | IPC経由・Preload API経由・CSP制限非抵触           | PASS/MAJOR    |
| Breaking Change      | trackEvent公開API不変・既存計装テスト回帰なし     | PASS/CRITICAL |
| フォールバック設計   | no-opフォールバック・エラー非スロー・一貫した状態 | PASS/MAJOR    |
| オフラインキュー設計 | 上限件数・TTL・ストレージ方式確定                 | PASS/MINOR    |
| オプトアウト設計     | プライバシー設定API参照・デフォルト安全側         | PASS/MAJOR    |
| テスト戦略整合性     | TDD Red前提・モック設計適切・カバレッジ目標確定   | PASS/MINOR    |
| IPC命名規則整合性    | 既存`safeInvoke`/`safeOn`パターンと一致           | PASS/MINOR    |

## レビュー結果判定基準

| 判定     | 条件             | 次のアクション            |
| -------- | ---------------- | ------------------------- |
| PASS     | 全観点で問題なし | Phase 4へ進行             |
| MINOR    | 軽微な指摘あり   | 指摘対応後、Phase 4へ     |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻る      |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザー確認 |

## 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 1（要件定義） |
| 設計の問題 | Phase 2（設計）     |

## 参照資料

| 参照資料                   | パス                                     |
| -------------------------- | ---------------------------------------- |
| Phase 2 アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` |
| Phase 2 IPC契約設計        | `outputs/phase-2/ipc-contract-design.md` |
| Phase 2 テスト戦略         | `outputs/phase-2/test-strategy.md`       |
| Phase 1 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md` |

## 成果物

| 成果物             | パス                                         | 内容                      |
| ------------------ | -------------------------------------------- | ------------------------- |
| 矛盾チェックリスト | `outputs/phase-3/contradiction-checklist.md` | 全観点のチェック結果      |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    | 観点別評価と総合判定      |
| ゲート判定         | `outputs/phase-3/gate-decision.md`           | PASS/MINOR/MAJOR/CRITICAL |

## 完了条件

- [ ] CSP整合性確認完了
- [ ] Breaking Change確認完了
- [ ] フォールバック設計確認完了
- [ ] 総合判定（PASS or MINOR）でPhase 4進行可否が決定
- [ ] MINOR以上の指摘がある場合、対応方針が記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 4: テスト作成（TDD Red）
