---
name: runbook-documentation
description: |
  Operational runbook creation and maintenance for production systems.
  Standardizes incident response, troubleshooting procedures, recovery workflows,
  and operational knowledge sharing to ensure reliable system operations.

  Anchors:
  • Site Reliability Engineering (Google) / 適用: runbook patterns / 目的: operational excellence and reliability
  • The Practice of System and Network Administration (Limoncelli) / 適用: procedure documentation / 目的: standardized operations
  • Incident Management for Operations (Rich Mogull) / 適用: incident response / 目的: effective crisis handling

  Trigger:
  Use when creating runbooks, documenting incident procedures, standardizing operational workflows,
  building troubleshooting guides, establishing recovery procedures, improving on-call readiness.
  runbook, incident response, troubleshooting, recovery procedures, operational documentation, on-call playbook
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# runbook-documentation

## 概要

運用ランブックの作成・保守スキル。本番システムの障害対応、トラブルシューティング手順、
リカバリーワークフロー、運用知識の共有を標準化し、信頼性の高いシステム運用を実現する。

---

## ワークフロー

### Phase 1: スコープ定義

**目的**: ランブックの対象範囲と優先度を明確にする

**アクション**:

1. システムコンポーネントと依存関係を特定
2. クリティカルパスと障害発生可能性を評価
3. 既存の運用ドキュメントをレビュー
4. ランブック作成の優先順位を決定

**Task**: `agents/scope-definition.md` を参照

**出力**: スコープ定義書、優先度付けされたランブックリスト

### Phase 2: 情報収集

**目的**: ランブック作成に必要な運用知識を収集・整理する

**アクション**:

1. インシデント履歴とポストモーテムを分析
2. SMEへのインタビューで暗黙知を抽出
3. `references/Level1_basics.md` でランブック基礎を確認
4. 既存の手順書とスクリプトを棚卸し
5. アラート定義とメトリクスを整理

**Task**: `agents/information-gathering.md` を参照

**出力**: 情報収集レポート、インタビュー記録、手順書リスト

### Phase 3: ランブック作成

**目的**: 標準化されたフォーマットでランブックを作成する

**アクション**:

1. `references/Level2_intermediate.md` で構造パターンを学習
2. `assets/runbook-template.md` をベースに作成
3. `references/runbook-patterns.md` に従って構造化
4. 診断フローチャートとデシジョンツリーを設計
5. リカバリー手順とロールバック手順を記述
6. エスカレーションパスを明記

**Task**: `agents/runbook-creation.md` を参照

**出力**: ランブックドキュメント、フローチャート、チェックリスト

### Phase 4: 検証とテスト

**目的**: ランブックの実効性を確保する

**アクション**:

1. `references/Level3_advanced.md` で検証手法を確認
2. ドライラン（机上演習）を実施
3. 関係者レビューとフィードバック収集
4. `scripts/validate-runbook.mjs` で構造検証
5. リンクと参照の整合性確認

**Task**: `agents/validation.md` を参照

**出力**: 検証レポート、改善提案リスト

### Phase 5: 保守と改善

**目的**: ランブックを最新状態に保ち継続的に改善する

**アクション**:

1. `references/Level4_expert.md` で保守パターンを学習
2. インシデント後レビューでランブックを更新
3. 使用状況メトリクスを収集
4. `scripts/log_usage.mjs` で利用記録を保存
5. 定期的なレビューサイクルを確立

**Task**: `agents/maintenance.md` を参照

**出力**: 更新されたランブック、改善ログ

---

## Task仕様ナビ

| Task                  | 起動タイミング   | 入力                      | 出力                   |
| --------------------- | ---------------- | ------------------------- | ---------------------- |
| scope-definition      | Phase 1開始時    | システム仕様、要件        | スコープ定義書         |
| information-gathering | Phase 2開始時    | インシデント履歴、SME知識 | 情報収集レポート       |
| runbook-creation      | Phase 3開始時    | 収集された情報            | ランブックドキュメント |
| validation            | Phase 4開始時    | ランブックドラフト        | 検証レポート           |
| maintenance           | インシデント後等 | 既存ランブック、フィード  | 更新されたランブック   |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

---

## ベストプラクティス

### すべきこと

| 推奨事項                         | 理由                                 |
| -------------------------------- | ------------------------------------ |
| 明確な目的と適用条件を記載       | いつ使うべきかを即座に判断可能       |
| 前提条件とアクセス権限を明記     | 実行前に準備すべきことが明確         |
| 各ステップに期待される結果を記述 | 進行状況と成功判定が可能             |
| ロールバック手順を含める         | 失敗時の安全な復旧パスを確保         |
| エスカレーション基準を明示       | 判断に迷わない                       |
| 最終更新日と担当者を記録         | 鮮度と問い合わせ先が明確             |
| コマンド例を実際に動作するもので | コピペで実行可能                     |
| 想定所要時間を記載               | 作業計画とエスカレーション判断に有用 |
| アラートとメトリクスへのリンク   | 状況把握が迅速                       |

### 避けるべきこと

| 禁止事項                    | 問題点                               |
| --------------------------- | ------------------------------------ |
| 曖昧な判断基準              | 「適切に」「必要に応じて」は判断不能 |
| 暗黙の前提知識              | 初見の人が実行できない               |
| 複数の目的を1つのランブック | 使い分けが困難                       |
| 古い情報の放置              | 信頼性低下と誤操作リスク             |
| 手順の欠落やスキップ        | 実行できない、途中で詰まる           |
| エラーケースの未記載        | 予期しない状況で停止                 |
| 専門用語の羅列              | 理解の障壁                           |
| 「詳しくは○○さんに聞いて」  | 属人化の温床                         |

---

## リソース参照

### references/（詳細知識）

| リソース               | パス                                                                                 | 読込条件                 |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------ |
| 基礎概念               | [references/Level1_basics.md](references/Level1_basics.md)                           | 初回利用時               |
| 構造パターン           | [references/Level2_intermediate.md](references/Level2_intermediate.md)               | Phase 3開始時            |
| 検証手法               | [references/Level3_advanced.md](references/Level3_advanced.md)                       | Phase 4開始時            |
| エキスパートパターン   | [references/Level4_expert.md](references/Level4_expert.md)                           | Phase 5または複雑要件時  |
| ランブックパターン集   | [references/runbook-patterns.md](references/runbook-patterns.md)                     | Phase 3実行時            |
| インシデント対応フロー | [references/incident-response-flows.md](references/incident-response-flows.md)       | 緊急時対応ランブック作成 |
| トラブルシューティング | [references/troubleshooting-techniques.md](references/troubleshooting-techniques.md) | 診断手順作成時           |
| リカバリー戦略         | [references/recovery-strategies.md](references/recovery-strategies.md)               | 復旧手順作成時           |

### scripts/（決定論的処理）

| スクリプト                       | 機能                       |
| -------------------------------- | -------------------------- |
| `scripts/validate-runbook.mjs`   | ランブック構造の検証       |
| `scripts/check-completeness.mjs` | 必須セクションの完全性確認 |
| `scripts/log_usage.mjs`          | フィードバック記録         |

### assets/（テンプレート）

| アセット                                | 用途                         |
| --------------------------------------- | ---------------------------- |
| `assets/runbook-template.md`            | 基本ランブックテンプレート   |
| `assets/incident-response-template.md`  | インシデント対応ランブック   |
| `assets/troubleshooting-template.md`    | トラブルシューティングガイド |
| `assets/recovery-procedure-template.md` | リカバリー手順書             |
| `assets/checklist-template.md`          | オペレーションチェックリスト |

---

## スクリプト使用例

### ランブック検証

```bash
node .claude/skills/runbook-documentation/scripts/validate-runbook.mjs \
  --file ./runbooks/database-failover.md
```

### 完全性チェック

```bash
node .claude/skills/runbook-documentation/scripts/check-completeness.mjs \
  --directory ./runbooks
```

### 使用ログ記録

```bash
node .claude/skills/runbook-documentation/scripts/log_usage.mjs \
  --result success \
  --phase "runbook-creation" \
  --notes "Database failover runbook completed"
```

---

## 品質基準

### 必須要素チェックリスト

| 要素                   | 確認内容                         |
| ---------------------- | -------------------------------- |
| タイトル               | 何のランブックか一目で分かる     |
| 目的                   | このランブックを使う理由が明確   |
| 適用条件               | いつ使うべきかの判断基準         |
| 前提条件               | 必要なアクセス権限、ツール、知識 |
| 手順                   | 番号付き、各ステップが明確       |
| 期待される結果         | 各ステップの成功判定基準         |
| トラブルシューティング | よくある問題と対処法             |
| ロールバック手順       | 失敗時の復旧方法                 |
| エスカレーション       | いつ誰にエスカレートするか       |
| メタデータ             | 最終更新日、担当者、レビュー日   |

### レビュー観点

| 観点       | 確認内容                                 |
| ---------- | ---------------------------------------- |
| 実行可能性 | 記載された手順で実際に実行できるか       |
| 完全性     | 手順に漏れがないか                       |
| 明確性     | 曖昧な表現がないか                       |
| 安全性     | 危険な操作に警告があるか                 |
| 再現性     | 誰が実行しても同じ結果になるか           |
| 最新性     | 情報が最新か、古い情報が混在していないか |
| アクセス性 | 必要な時にすぐに見つけられるか           |

---

## メトリクスと改善

スキルの使用状況は `LOGS.md` に記録されます。
メトリクスの詳細は `EVALS.json` を参照してください。

### 追跡メトリクス

- ランブック作成数
- ランブック使用頻度
- インシデント解決時間（ランブック使用時 vs 未使用時）
- ランブック更新頻度
- エスカレーション率

---

## 変更履歴

| Version | Date       | Changes                              |
| ------- | ---------- | ------------------------------------ |
| 1.0.0   | 2025-12-31 | 18-skills.md完全準拠版。初回リリース |
