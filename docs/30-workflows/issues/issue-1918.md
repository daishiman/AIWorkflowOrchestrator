# [#1918] "[UT-FIXTURE-ROOT-PARITY-001] skill-fixture-runner に Phase 12 root parity 検証 fixture を追加"

## メタ情報

```yaml
task_id: UT-FIXTURE-ROOT-PARITY-001
task_name: skill-fixture-runner に Phase 12 root parity 検証 fixture を追加
category: 改善
target_feature: skill-fixture-runner / validate-phase-output
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-P0-01 Phase 12 skill-feedback-report
created_date: 2026-04-04
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-FIXTURE-ROOT-PARITY-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-01（verify 実行エンジン）の Phase 12 skill-feedback-report において、`artifacts.json`（workflow root 直下）と `outputs/artifacts.json` の同期（root parity）が崩れるケースが頻発した。最終的に warning を消して PASS にすることはできたが、その過程は手動での同期合わせに依存していた。

現在、`validate-phase-output.js` と `verify-all-specs.js` はワークフロー出力の構造検証を行うが、root artifacts.json と outputs/artifacts.json の parity（一致性）を自動検証する fixture は存在しない。

### 1.2 問題点

- root `artifacts.json` と `outputs/artifacts.json` の不一致を自動検出する仕組みがない
- `validate-phase-output` と `verify-all-specs` を同じ workflow root で再現する fixture がない
- parity が崩れた状態で検証を通過してしまう可能性がある
- 手動で不一致を発見・修正するため、verify フローのたびに時間を浪費する

### 1.3 放置時の影響

- 今後の verify 実行エンジンタスクでも同様の root parity 問題が繰り返し発生する
- 手動確認に依存し続けることで、検証の信頼性が低下する
- 他の開発者が同じ苦戦箇所に遭遇し、無駄な工数が発生する
- skill-fixture-runner の検証カバレッジに盲点が残り続ける

---

## 2. 何を達成するか（What）

### 2.1 目的

skill-fixture-runner に root parity 検証用の fixture を追加し、`artifacts.json` と `outputs/artifacts.json` の不一致を自動検出できるようにする。

### 2.2 最終ゴール

- root parity が崩れた fixture（不一致ケース）と正常な fixture（一致ケース）の両方が存在する
- `validate-phase-output` と `verify-all-specs` の両スクリプトが同一 workflow root で動作する fixture がある
- 不一致を検出した場合に明確なエラーメッセージが出力される
- CI / ローカルで fixture ベースの回帰テストとして実行できる

### 2.3 スコープ

**スコープ内:**

- root parity 検証用 fixture ディレクトリの作成（正常ケース・異常ケース）
- `validate-phase-output.js` への root parity チェックロジック追加
- `verify-all-specs.js` での root parity 警告/エラー出力対応
- `run-all-validations.js` から root parity 検証を呼び出せるようにする統合

**スコープ外:**

- `validate-phase-output.js` / `verify-all-specs.js` の既存検証ロジックの変更
- skill-fixture-runner の他の検証スクリプト（validate-agents, validate-schemas 等）の変更
- CI パイプラインへの組み込み（別タスクで対応）

### 2.4 成果物

| #   | 成果物                                    | 形式                |
| --- | ----------------------------------------- | ------------------- |
| 1   | root parity 正常 fixture ディレクトリ     | ディレクトリ + JSON |
| 2   | root parity 異常 fixture ディレクトリ     | ディレクトリ + JSON |
| 3   | root parity 検証ロジック                  | JavaScript          |
| 4   | `validate-phase-output.js` への統合パッチ | JavaScript          |
| 5   | `verify-all-specs.js` への統合パッチ      | JavaScript          |
| 6   | fixture 実行確認ログ                      | テスト出力          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 環境が利用可能であること
- pnpm によるモノレポ構成が正常に動作していること
- `.claude/skills/skill-fixture-runner/` の既存スクリプトが動作確認済みであること

### 3.2 依存タスク

| タスクID   | 状態 | 依存内容                                     |
| ---------- | ---- | -------------------------------------------- |
| TASK-P0-01 | 完了 | Phase 12 で発見された root parity 問題の知見 |

### 3.3 必要な知識

- `validate-phase-output.js` の Phase 出力検証ロジック
- `verify-all-specs.js` のワークフロー整合性検証ロジック
- `run-all-validations.js` の統合実行パターン
- `artifacts.json` のスキーマ構造と配置規則（root 直下 vs `outputs/` 配下）

### 3.4 推奨アプローチ

1. **Fixture First**: まず正常ケース・異常ケースの fixture データを作成し、期待される検証結果を定義する
2. **差分検出ロジック**: root `artifacts.json` と `outputs/artifacts.json` の JSON deep equal 比較を実装する
3. **既存スクリプト統合**: `validate-phase-output.js` に parity チェックを追加し、warning または error として報告する
4. **verify-all-specs 統合**: `verify-all-specs.js` の検証項目に root parity チェックを追加する
5. **回帰テスト**: fixture を使って `run-all-validations.js` 経由で一括実行できることを確認する

---

## 4. 実行手順

### Phase 1: 現状調査と fixture 設計

**目的:** 既存の artifacts.json 構造と parity 崩れパターンを把握し、fixture の仕様を決定する

**実行タスク:**

1. TASK-P0-01 Phase 12 の実行ログから、root parity が崩れた具体的なケースを特定する
2. `artifacts.json` のスキーマ構造（必須フィールド、配置ルール）を整理する
3. 正常ケース fixture の仕様を定義する（root と outputs が完全一致）
4. 異常ケース fixture の仕様を定義する（以下のパターンを含む）
   - root にのみ存在し outputs に存在しない
   - outputs にのみ存在し root に存在しない
   - 両方存在するがフィールド値が異なる
5. fixture ディレクトリ構成を決定する

**完了条件:** fixture 仕様書が作成され、正常/異常の各パターンが定義されていること

### Phase 2: fixture データ作成

**目的:** 設計に基づいて fixture ディレクトリとテストデータを作成する

**実行タスク:**

1. `skill-fixture-runner/fixtures/root-parity/` ディレクトリを作成する
2. `valid/` サブディレクトリに正常ケース fixture を配置する
3. `invalid-missing-root/` サブディレクトリに root 欠損ケース fixture を配置する
4. `invalid-missing-outputs/` サブディレクトリに outputs 欠損ケース fixture を配置する
5. `invalid-mismatch/` サブディレクトリにフィールド不一致ケース fixture を配置する

**完了条件:** 全 fixture ディレクトリが作成され、各ケースに `artifacts.json` が適切に配置されていること

### Phase 3: root parity 検証ロジック実装

**目的:** artifacts.json の parity を検証する関数を実装する

**実行タスク:**

1. `scripts/validate-root-parity.js` を新規作成する
2. root `artifacts.json` と `outputs/artifacts.json` の存在チェックを実装する
3. JSON deep equal 比較ロジックを実装する
4. 不一致検出時のエラーメッセージ生成を実装する（どのフィールドが異なるかを明示）
5. JSON 形式の結果出力（`{ valid, errors, details }` 形式）を実装する

**完了条件:** `validate-root-parity.js` が単体で動作し、fixture に対して期待どおりの PASS/FAIL を返すこと

### Phase 4: 既存スクリプトへの統合

**目的:** `validate-phase-output.js` と `verify-all-specs.js` に root parity チェックを統合する

**実行タスク:**

1. `validate-phase-output.js` に root parity チェックの呼び出しを追加する
2. `verify-all-specs.js` に root parity チェックの呼び出しを追加する
3. `run-all-validations.js` の検証スクリプトリストに `validate-root-parity.js` を追加する
4. 既存の検証結果フォーマットとの整合性を確認する

**完了条件:** 3つのスクリプトすべてから root parity 検証が実行され、結果が統合レポートに含まれること

### Phase 5: 動作確認と回帰テスト

**目的:** fixture を使った一括検証が正常に動作することを確認する

**実行タスク:**

1. 正常 fixture に対して `run-all-validations.js` を実行し、PASS を確認する
2. 各異常 fixture に対して `run-all-validations.js` を実行し、適切な FAIL とエラーメッセージを確認する
3. 既存の検証スクリプトが root parity fixture の影響を受けず正常動作することを確認する
4. `validate-phase-output` と `verify-all-specs` が同一 workflow root で動作することを確認する
5. 実行結果ログを保存する

**完了条件:** 全 fixture に対して期待どおりの結果が得られ、既存検証に影響がないこと

---

## 5. 完了条件チェックリスト

- [ ] root parity 正常 fixture が作成され、検証で PASS となる
- [ ] root parity 異常 fixture（3パターン以上）が作成され、検証で FAIL となる
- [ ] `validate-root-parity.js` が単体動作し、JSON 形式で結果を出力する
- [ ] `validate-phase-output.js` に root parity チェックが統合されている
- [ ] `verify-all-specs.js` に root parity チェックが統合されている
- [ ] `run-all-validations.js` から root parity 検証が呼び出される
- [ ] 不一致検出時に具体的な差分情報がエラーメッセージに含まれる
- [ ] 既存の検証スクリプトに副作用がない（既存テストが全 PASS）
- [ ] `validate-phase-output` と `verify-all-specs` が同一 workflow root で再現できる

---

## 6. 検証方法

### 6.1 fixture ベース検証

```bash
# 正常ケース → PASS 期待
node .claude/skills/skill-fixture-runner/scripts/validate-root-parity.js \
  --target fixtures/root-parity/valid/

# 異常ケース → FAIL 期待（エラー詳細あり）
node .claude/skills/skill-fixture-runner/scripts/validate-root-parity.js \
  --target fixtures/root-parity/invalid-mismatch/
```

### 6.2 統合検証

```bash
# run-all-validations 経由での一括実行
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
  --target fixtures/root-parity/valid/ --verbose
```

### 6.3 既存スクリプト回帰確認

```bash
# validate-phase-output の既存動作に影響がないこと
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/<既存ワークフロー>

# verify-all-specs の既存動作に影響がないこと
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/<既存ワークフロー>
```

---

## 7. リスクと対策

| #   | リスク                                                       | 影響度 | 対策                                                                       |
| --- | ------------------------------------------------------------ | ------ | -------------------------------------------------------------------------- |
| 1   | artifacts.json のスキーマが将来変更され fixture が陳腐化する | 中     | fixture 内の artifacts.json を最小限のフィールドで構成し、変更耐性を高める |
| 2   | deep equal 比較でフィールド順序の違いが誤検出される          | 低     | JSON.parse 後のオブジェクト比較を使用し、キー順序に依存しない実装にする    |
| 3   | 既存スクリプトへの統合で副作用が発生する                     | 中     | 統合前に既存テストを全実行し、統合後も回帰確認を行う                       |
| 4   | outputs/ ディレクトリが存在しないワークフローで誤動作する    | 低     | outputs/ 非存在時は parity チェックをスキップし warning を出力する         |

---

## 8. 参照情報

| #   | 参照先                                                                       | 用途                                      |
| --- | ---------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | `.claude/skills/skill-fixture-runner/SKILL.md`                               | skill-fixture-runner の仕様・ワークフロー |
| 2   | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`         | 統合検証スクリプトの実装パターン          |
| 3   | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js` | Phase 出力検証スクリプト                  |
| 4   | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`      | 全仕様整合性検証スクリプト                |
| 5   | TASK-P0-01 Phase 12 skill-feedback-report                                    | root parity 問題の発見元                  |

---

## 9. 備考

### 苦戦箇所（TASK-P0-01 からの引き継ぎ）

- root `artifacts.json` と `outputs/artifacts.json` の parity が崩れるケースが頻発し、手動で合わせ直す必要があった。特に、Phase 実行中に一方だけが更新され、もう一方が旧状態のまま残るパターンが多かった
- `validate-phase-output` と `verify-all-specs` の両方を同じ workflow root で実行する際、それぞれが異なるパスを基準に artifacts.json を参照するため、不一致が見逃されやすかった
- fixture があればこの不一致を自動検出でき、verify フロー全体の信頼性が向上する
- 最終的に warning を消して PASS にできたが、この確認プロセス自体を fixture で再現可能にすることが本タスクの意義である
