---
name: .claude/skills/cost-optimization-gha/SKILL.md
description: |
    GitHub Actions ワークフローのコスト最適化戦略。
    専門分野:
    - 実行時間削減: ジョブ並列化、キャッシング、条件実行
    - ランナーコスト: ランナー選択、self-hosted vs hosted、スペック最適化
    - ストレージコスト: アーティファクト管理、保持期間、キャッシュ戦略
    - 無駄の削減: 不要な実行回避、スケジュール最適化、同時実行制御
    使用タイミング:
    - GitHub Actions の実行コストを削減したい時
    - 月次請求額を最適化したい時
    - ランナーの使用時間を短縮したい時
    - ストレージコストを管理する時
    - 無料枠を効率的に使用したい時

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/cost-optimization-gha/resources/execution-time.md`: 並列化、キャッシング、条件実行による実行時間短縮戦略
  - `.claude/skills/cost-optimization-gha/resources/runner-costs.md`: ランナータイプ選択、self-hosted活用によるコスト削減手法
  - `.claude/skills/cost-optimization-gha/templates/optimized-workflow.yaml`: コスト最適化を実装したワークフローの実践例
  - `.claude/skills/cost-optimization-gha/scripts/estimate-costs.mjs`: ワークフロー実行コストを見積もる計算スクリプト

  Use proactively when implementing .claude/skills/cost-optimization-gha/SKILL.md patterns or solving related problems.
version: 1.0.0
---

# GitHub Actions Cost Optimization

## 概要

このスキルは、GitHub Actions の実行コストを削減するための包括的な最適化戦略を提供します。
実行時間の短縮、適切なランナー選択、ストレージ管理を通じてコスト効率を最大化します。

**主要な価値**:

- 実行コストの 30-70%削減
- 無料枠の効率的な活用
- ランナー使用時間の最適化
- ストレージコストの管理

**制約**:

- 無料枠: パブリックリポジトリは無制限、プライベートは月 2000 分
- ストレージ: 500MB まで無料、超過分は$0.008/GB/day
- ランナーコスト: Linux ($0.008/分), Windows ($0.016/分), macOS ($0.08/分)

## リソース構造

```
cost-optimization-gha/
├── SKILL.md                                    # 本ファイル（概要とクイックリファレンス）
├── resources/
│   ├── execution-time.md                       # 実行時間短縮戦略
│   └── runner-costs.md                         # ランナーコスト最適化
├── templates/
│   └── optimized-workflow.yaml                 # コスト最適化ワークフロー例
└── scripts/
    └── estimate-costs.mjs                      # コスト見積もりツール
```

## コマンドリファレンス

### リソース読み取り

```bash
# 実行時間短縮戦略
cat .claude/skills/cost-optimization-gha/resources/execution-time.md

# ランナーコスト最適化
cat .claude/skills/cost-optimization-gha/resources/runner-costs.md
```

### テンプレート参照

```bash
# コスト最適化ワークフロー例
cat .claude/skills/cost-optimization-gha/templates/optimized-workflow.yaml
```

### スクリプト実行

```bash
# ワークフローコスト見積もり
node .claude/skills/cost-optimization-gha/scripts/estimate-costs.mjs <workflow.yaml>
```

## クイックリファレンス

### コスト削減戦略マトリックス

| 戦略                       | 削減効果 | 実装難易度 | 優先度 |
| -------------------------- | -------- | ---------- | ------ |
| **並列ジョブ実行**         | 30-50%   | 低         | 🔴 高  |
| **キャッシング**           | 40-70%   | 低         | 🔴 高  |
| **条件実行**               | 20-80%   | 中         | 🟡 中  |
| **self-hosted ランナー**   | 60-100%  | 高         | 🟢 低  |
| **適切なランナー選択**     | 10-50%   | 低         | 🔴 高  |
| **アーティファクト最適化** | 5-20%    | 低         | 🟡 中  |
| **同時実行制御**           | 10-30%   | 低         | 🟡 中  |

### ランナーコスト比較

| ランナータイプ               | 分単価 | 1000 分あたり | 使用ケース         |
| ---------------------------- | ------ | ------------- | ------------------ |
| **Linux (ubuntu-latest)**    | $0.008 | $8            | 一般的な CI/CD     |
| **Windows (windows-latest)** | $0.016 | $16           | .NET、Windows 専用 |
| **macOS (macos-latest)**     | $0.08  | $80           | iOS/macOS ビルド   |
| **macOS (macos-14, M1)**     | $0.16  | $160          | 高速 macOS ビルド  |
| **self-hosted**              | $0     | $0            | 高頻度実行         |

### 実行時間短縮パターン

#### 1. 並列ジョブ実行

```yaml
jobs:
  test:
    strategy:
      matrix:
        node: [18, 20, 22]
    runs-on: ubuntu-latest
    # 3つのジョブが並列実行 → 1/3の時間
```

#### 2. キャッシング活用

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.pnpm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    # 依存関係インストール時間を80%削減
```

#### 3. 条件実行

```yaml
on:
  push:
    paths:
      - "src/**"
      - "tests/**"
  # ドキュメント変更時は実行しない → 無駄な実行を削減
```

### 無料枠最適化

**プライベートリポジトリの無料枠 (月 2000 分)**:

| プラン         | 無料枠    | Linux 換算 | macOS 換算 |
| -------------- | --------- | ---------- | ---------- |
| **Free**       | 2,000 分  | 2,000 分   | 250 分     |
| **Pro**        | 3,000 分  | 3,000 分   | 375 分     |
| **Team**       | 3,000 分  | 3,000 分   | 375 分     |
| **Enterprise** | 50,000 分 | 50,000 分  | 6,250 分   |

**最適化テクニック**:

- Linux ランナーを優先使用（最もコスト効率が良い）
- macOS は必要な場合のみ使用
- self-hosted ランナーで無料枠を節約

## 関連スキル

このスキルは以下のスキルと連携して使用します:

| スキル                        | パス                                                | 関連性                           |
| ----------------------------- | --------------------------------------------------- | -------------------------------- |
| **.claude/skills/caching-strategies-gha/SKILL.md**    | `.claude/skills/caching-strategies-gha/SKILL.md`    | キャッシング戦略で実行時間を短縮 |
| **.claude/skills/parallel-jobs-gha/SKILL.md**         | `.claude/skills/parallel-jobs-gha/SKILL.md`         | 並列実行で実行時間を削減         |
| **.claude/skills/conditional-execution-gha/SKILL.md** | `.claude/skills/conditional-execution-gha/SKILL.md` | 不要な実行を回避                 |
| **.claude/skills/concurrency-control/SKILL.md**       | `.claude/skills/concurrency-control/SKILL.md`       | 同時実行制御で無駄を削減         |
| **.claude/skills/artifact-management-gha/SKILL.md**   | `.claude/skills/artifact-management-gha/SKILL.md`   | ストレージコストを最適化         |
| **.claude/skills/self-hosted-runners/SKILL.md**       | `.claude/skills/self-hosted-runners/SKILL.md`       | ランナーコストを削減             |
| **.claude/skills/matrix-builds/SKILL.md**             | `.claude/skills/matrix-builds/SKILL.md`             | マトリックスビルドで並列化       |

## コスト見積もりガイド

### 月次コスト計算例

**シナリオ**: 1 日 20 回実行、各実行 10 分のワークフロー

```
基本コスト (Linux):
  20回/日 × 30日 × 10分 × $0.008/分 = $48/月

最適化後 (キャッシング + 並列化):
  20回/日 × 30日 × 3分 × $0.008/分 = $14.4/月

削減額: $33.6/月 (70%削減)
```

### ストレージコスト計算

```
アーティファクト: 1GB × 30日 × $0.008/GB/day = $0.24/月
保持期間を7日に短縮: 1GB × 7日 × $0.008/GB/day = $0.056/月

削減額: $0.184/月 (77%削減)
```

## ベストプラクティス

1. **ランナー選択の最適化**
   - デフォルトは Linux (ubuntu-latest)
   - macOS は必要な場合のみ
   - Windows は.NET/Windows 専用タスクのみ

2. **実行時間の最小化**
   - キャッシングを最大限活用
   - 並列ジョブで時間短縮
   - 不要なステップを削除

3. **不要な実行の回避**
   - path フィルターで対象ファイル限定
   - 条件式で不要なジョブをスキップ
   - 同時実行制御で重複実行を防止

4. **ストレージ管理**
   - アーティファクト保持期間を最小化
   - 不要なアーティファクトは生成しない
   - キャッシュサイズを最適化

詳細な戦略と実装例は、各リソースファイルを参照してください。
