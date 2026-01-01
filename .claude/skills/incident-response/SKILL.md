---
name: incident-response
description: |
  システム障害・インシデントの検知から解決、事後分析までを体系的に支援するスキル。ITIL・Google SRE原則に基づき、トリアージ、調査、解決、ポストモーテムを通じて迅速な復旧と再発防止を実現します。

  Anchors:
  • The Site Reliability Workbook / 適用: ポストモーテム文化とインシデント対応 / 目的: 非難なき事後分析と学習サイクル確立
  • ITIL 4 / 適用: インシデント・問題管理プロセス / 目的: 構造化されたエスカレーション手順と優先度判定
  • The Phoenix Project / 適用: 変更管理とリリース戦略 / 目的: 変更起因インシデントの予防と迅速な切り戻し

  Trigger:
  Use when システム障害発生時、アラート発火時、インシデント報告作成時、ポストモーテム実施時、SLO違反時、本番環境問題の根本原因分析時。
  Keywords: incident, outage, downtime, postmortem, RCA, 5 whys, rollback, escalation, severity, SLO violation
allowed-tools:
  - bash
  - read
  - write
  - grep
---

# Incident Response

## 概要

システム障害やインシデントに対し、ITIL 4とGoogle SREのベストプラクティスに基づいた体系的な対応を提供します。検知・トリアージから調査・解決、事後分析・改善まで、4つのフェーズで構成され、迅速な復旧と継続的な改善を実現します。

## ワークフロー

### Phase 1: 検知とトリアージ

**目的**: インシデントを検知し、影響範囲と重大度を判定してエスカレーション判断を行う

**アクション**:

1. アラートまたは報告からインシデント発生を確認
2. `agents/triage.md` のタスクを起動し、重大度（Severity）判定
3. `references/severity-matrix.md` で影響範囲とビジネスインパクト評価
4. エスカレーション必要性を判断（Critical/Major の場合は即座にエスカレーション）
5. インシデントチケット作成（`assets/incident-ticket-template.md` 使用）

### Phase 2: 調査と診断

**目的**: 根本原因を特定し、解決戦略を立案する

**アクション**:

1. `agents/investigate.md` のタスクを起動
2. `scripts/collect-diagnostics.sh` で診断情報収集（ログ、メトリクス、トレース）
3. `references/troubleshooting-playbook.md` で既知パターンを確認
4. 5 Whys分析で根本原因を特定（`references/5-whys-guide.md`）
5. 解決候補と切り戻し戦略を準備

### Phase 3: 解決と復旧

**目的**: サービスを安全に復旧させる

**アクション**:

1. `agents/resolve.md` のタスクを起動
2. 解決アクション実行（修正適用 or 切り戻し）
3. `references/rollback-procedures.md` で切り戻し手順確認
4. サービス復旧確認（メトリクス正常化、SLO達成確認）
5. インシデントクローズとステークホルダー通知

### Phase 4: 事後分析と改善

**目的**: ポストモーテムを実施し、再発防止策を策定する

**アクション**:

1. `agents/postmortem.md` のタスクを起動
2. `assets/postmortem-template.md` でポストモーテムレポート作成
3. タイムラインと5 Whys分析を文書化
4. アクションアイテムを抽出し、責任者と期限を設定
5. `scripts/log_usage.mjs` で成功/失敗を記録

## Task仕様ナビ

インシデント対応プロセスにおける各フェーズの入出力と参照リソース：

| フェーズ | Task（実行単位） | 入力                   | 出力                     | 参照リソース                                                                |
| -------- | ---------------- | ---------------------- | ------------------------ | --------------------------------------------------------------------------- |
| Phase 1  | トリアージ       | アラート情報、障害報告 | 重大度判定、影響範囲評価 | `references/severity-matrix.md` / `assets/incident-ticket-template.md`      |
| Phase 2  | 調査・診断       | インシデントチケット   | 根本原因分析、解決戦略   | `references/troubleshooting-playbook.md` / `references/5-whys-guide.md`     |
| Phase 3  | 解決・復旧       | 解決戦略、診断情報     | 復旧確認、クローズ報告   | `references/rollback-procedures.md` / `scripts/collect-diagnostics.sh`      |
| Phase 4  | 事後分析         | インシデント全履歴     | ポストモーテムレポート   | `assets/postmortem-template.md` / `references/postmortem-best-practices.md` |

## ベストプラクティス

### すべきこと

- **迅速な初動対応**: 検知から5分以内にトリアージを開始（Critical/Major の場合）
- **非難なき文化**: ポストモーテムで個人を責めず、システムとプロセスの改善に焦点
- **5 Whys適用**: 根本原因は「なぜ？」を5回繰り返して深掘り
- **タイムライン記録**: すべてのアクションを時刻とともに記録（後続分析に必須）
- **切り戻し準備**: 修正適用前に必ず切り戻し手順を確認
- **コミュニケーション**: ステークホルダーへの定期的な状況報告（30分毎推奨）
- **アクション追跡**: ポストモーテムで抽出したアクションアイテムを追跡可能に

### 避けるべきこと

- **根拠なき推測**: ログやメトリクスなしに原因を断定しない
- **パッチの重ね掛け**: 切り戻しできない修正を重ねると復旧が困難に
- **ポストモーテム省略**: 小規模インシデントでも学びを文書化する
- **個人への非難**: インシデントは個人の問題ではなくシステムの問題
- **不十分な検証**: 修正後は必ずメトリクスとSLOで復旧を確認
- **アクション放置**: ポストモーテムで決めた対策を実行せずに終わらせない

## リソース参照

### レベル別ガイド

詳細な知識は段階別に構成されています。必要なレベルに応じて参照してください：

- **基礎**: [references/Level1_basics.md](references/Level1_basics.md) - インシデント管理基本概念、重大度分類
- **実務**: [references/Level2_intermediate.md](references/Level2_intermediate.md) - トリアージ手順、調査テクニック
- **応用**: [references/Level3_advanced.md](references/Level3_advanced.md) - 複雑障害の分析、分散システムトラブルシューティング
- **専門**: [references/Level4_expert.md](references/Level4_expert.md) - 大規模インシデント指揮、カオスエンジニアリング

### ドメイン別リソース

各領域の詳細設計資料：

- **重大度判定**: [references/severity-matrix.md](references/severity-matrix.md) - Severity定義、影響範囲評価、エスカレーション基準
- **トラブルシューティング**: [references/troubleshooting-playbook.md](references/troubleshooting-playbook.md) - 症状別診断手順、既知問題パターン
- **5 Whys分析**: [references/5-whys-guide.md](references/5-whys-guide.md) - 根本原因分析手法、深掘り質問例
- **切り戻し手順**: [references/rollback-procedures.md](references/rollback-procedures.md) - 安全な切り戻し戦略、データ整合性確認
- **ポストモーテム**: [references/postmortem-best-practices.md](references/postmortem-best-practices.md) - 非難なき分析、アクションアイテム抽出

## スクリプト参照

決定論的な処理を自動化するスクリプト：

- **`scripts/collect-diagnostics.sh`**: 診断情報収集（ログ、メトリクス、システム状態）
  実行例: `bash scripts/collect-diagnostics.sh --service api --start "2025-12-31 10:00" --end "2025-12-31 11:00"`

- **`scripts/log_usage.mjs`**: 使用記録・評価スクリプト（フィードバックループ）
  実行例: `node scripts/log_usage.mjs --result success --phase Phase3 --notes "API復旧完了"`

- **`scripts/validate-skill.mjs`**: スキル構造検証
  実行例: `node scripts/validate-skill.mjs`

## テンプレート参照

出力素材として使用するテンプレート（assets/に配置）：

| テンプレート                         | 用途                                               | 形式     |
| ------------------------------------ | -------------------------------------------------- | -------- |
| `assets/incident-ticket-template.md` | インシデントチケット（ID、重大度、影響範囲、担当） | Markdown |
| `assets/postmortem-template.md`      | ポストモーテムレポート（タイムライン、RCA、対策）  | Markdown |
| `assets/5-whys-template.md`          | 5 Whys分析シート                                   | Markdown |
| `assets/communication-template.md`   | ステークホルダー通知テンプレート                   | Markdown |

## 変更履歴

| Version | Date       | Changes                                                                                                             |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 初版作成: 18-skills.md仕様準拠、4フェーズワークフロー設計、ITIL/SREベストプラクティス統合、Task仕様ナビテーブル追加 |
