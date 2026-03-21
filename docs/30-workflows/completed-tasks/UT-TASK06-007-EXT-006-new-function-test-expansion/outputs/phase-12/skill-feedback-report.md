# スキルフィードバックレポート - UT-TASK06-007-EXT-006

## 概要

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-TASK06-007-EXT-006                                |
| 作成日     | 2026-03-21                                           |
| 対象スキル | task-specification-creator / aiworkflow-requirements |

## フィードバック 1: `mkdtempSync` 一時ディレクトリ戦略は再利用価値が高い

### 観点

テスト設計パターン

### 内容

`mergeChannelMaps` のテストでは、fs モックより `mkdtempSync(join(tmpdir(), ...))` を使う方が短く、既存 `vi.mock` 配置とも競合しなかった。小規模なファイルI/O helper を検証する用途では再利用価値が高い。

**推奨**:

- `phase-4` / `phase-6` 系の testing pattern に「小規模ファイルI/Oは一時ディレクトリ実測を優先」と追記する
- `tmp file` のような曖昧な表現ではなく、`mkdtempSync` / `writeFileSync` / `rmSync` を具体名で残す

## フィードバック 2: script helper は export 追加で十分な場合がある

### 観点

テンプレート改善

### 内容

今回の対象5点は責務が小さく、script file の public API 設計を壊さず direct test だけを増やしたいケースだった。そのため module split より `export` 追加の方が適切だった。

**判断基準**:

- 関数が純粋、または小規模 helper である
- call graph の再設計より direct boundary test の価値が高い
- 本体の CLI 契約を変えない

**補足**:

大きな責務分離が必要な場合は EXT-004（module split）へ進むべきで、今回の判断はそれと競合しない。

## フィードバック 3: 小規模タスクほど same-wave doc sync が重要

### 観点

ワークフロー改善

### 内容

実装は小さくても、workflow / outputs / canonical spec / mirror の4層がずれると監査工数が跳ね上がる。実際、今回の差分はコードより証跡の不一致が主因だった。

**改善提案**:

- Phase 12 で `outputs/phase-1` のコピー先も含めてトレーサビリティを再確認する
- quick-reference / completed ledger / pattern detail を同一ターンで更新する
- Phase 11 の non-visual task には placeholder screenshot plan を標準テンプレート化する

## 結論

改善点は「実装方法」より「証跡同期手順」に集中していた。今後の再利用価値が高いのは、`mkdtempSync` 戦略、small helper への export 判断、same-wave doc sync の3点である。
