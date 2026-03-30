# task-specification-creator Phase 4 環境Red テンプレート追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1719
```

## メタ情報

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | task-imp-taskspec-phase4-env-red-template-001                                    |
| タスク名     | task-specification-creator Phase 4 「環境Red（テスト実行不可）」テンプレート追加 |
| 分類         | ドキュメント改善                                                                 |
| 対象機能     | .claude/skills/task-specification-creator/                                       |
| 優先度       | 低                                                                               |
| 見積もり規模 | 小規模                                                                           |
| ステータス   | 未実施                                                                           |
| 発見元       | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 Phase-12 skill-feedback-report                |
| 発見日       | 2026-03-29                                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-RT-06-ESBUILD-ARCH-MISMATCH-001 の実装において、esbuild のアーキテクチャ不整合（Rosetta 経由 x64 Node と ARM64 Node の混在）により、vitest の実行自体が不可能な状態（環境Red）が発生した。

現行の task-specification-creator における Phase 4 テンプレートは「テストコードの Red（失敗）」を想定した記録フォーマットのみ提供しており、「テスト実行不可（環境Red）」という特殊ケースに対応した記録場所・記載ガイダンスが存在しない。

### 1.2 問題点・課題

1. **テンプレートの欠落**: Phase 4 の「Red状態記録」セクションに「テスト実行不可」ケースを記録する適切な場所がない
2. **判定基準の不在**: 「コードのバグによるRed」と「環境不整合によるRed」の区別を記録・判定する基準がない
3. **進行方法が不明確**: 通常の Red→Green サイクルが成立しない状況での Phase 4 完了条件が定義されていない
4. **再現性の低下**: 同様の環境Redが発生した次のタスクで、過去の対処パターンを参照できない

### 1.3 放置した場合の影響

- 環境起因の実行不可を「テスト失敗」と同列扱いして記録することで、Phase 4 レポートが実態を反映しなくなる
- 次に環境Red が発生した実装者が対処パターンを見つけられず、同様の調査に時間を費やす
- Phase 4 完了の判定が曖昧になり、Phase 5 への移行タイミングが不明確になる

---

## 2. 何を達成するか（What）

### 2.1 目的

task-specification-creator の Phase 4 テンプレートに「環境Red（テスト実行不可）」ケースの記録フォーマットとガイダンスを追加し、環境起因の実行不可に遭遇した実装者が正確な状態記録と次アクション判断を即座に行えるようにする。

### 2.2 最終ゴール

- Phase 4 テンプレートに「環境Red」専用のサブセクションが追加されている
- 「コードRed（テスト失敗）」と「環境Red（テスト実行不可）」を区別した記録テーブルが存在する
- 環境Redの典型ケース（esbuild arch 不整合、native module ビルド失敗等）と解決パターンが参照できる
- 環境Red 発生時の Phase 4 完了条件（環境修正後の再実行で確認）が明文化されている

### 2.3 スコープ

#### 含むもの

- `.claude/skills/task-specification-creator/references/phase-templates.md` の Phase 4 セクションへの環境Redガイダンス追加
- 環境Redの記録フォーマット（記載例を含む）
- 環境Red時のPhase 4 完了条件の定義
- 典型的な環境Redケースの一覧（esbuild arch 不整合、pnpm rebuild 必要ケース等）

#### 含まないもの

- Phase 4 以外のフェーズテンプレートの変更
- 環境セットアップ手順の詳細ドキュメント化（別タスクの範囲）
- .nvmrc / .node-version による環境統一（task-ut-env-001-ci-nvmrc.md が担当）
- CI パイプラインの arch 明示設定（UT-RT-06-ESBUILD-ARCH-MISMATCH-001 が担当）

### 2.4 成果物

- 更新済み `.claude/skills/task-specification-creator/references/phase-templates.md`
- Phase 4 環境Red 記録フォーマットの追加（記載例付き）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude/skills/task-specification-creator/references/phase-templates.md` が参照可能
- UT-RT-06-ESBUILD-ARCH-MISMATCH-001 の実装体験（環境Red の具体的な発生状況）を把握している

### 3.2 依存タスク

- なし（独立して実施可能）

### 3.3 必要な知識

- task-specification-creator の Phase 4 テンプレートの現行仕様
- esbuild arch 不整合の発生メカニズム（Rosetta / ARM64 混在環境）
- Red→Green サイクルが成立しないケースの判定方法

### 3.4 推奨アプローチ

1. 現行の `phase-templates.md` の Phase 4 セクションを読んで構造を把握する
2. 「コードRed」と「環境Red」の区別を軸に追加内容を設計する
3. UT-RT-06 の体験をベースに典型ケースと記載例を具体化する
4. 記載例は「100人中100人が同じ判断でPhase 4を完了できる」粒度にする

---

## 4. 実行手順

### Phase構成

- Phase A: 現行テンプレートの確認と差分設計
- Phase B: テンプレート更新
- Phase C: 動作確認

### Phase A: 現行テンプレートの確認と差分設計

#### 目的

Phase 4 の現行フォーマットを把握し、追加すべき内容を設計する。

#### 手順

1. `phase-templates.md` の Phase 4 セクションを読む
   ```bash
   cat .claude/skills/task-specification-creator/references/phase-templates.md
   ```
2. 「Red 状態記録」に関連するセクションを特定する
3. 追加内容の構成案を作成する（「環境Red」サブセクション、記録テーブル、完了条件）

#### 成果物

- 追加内容の構成案

#### 完了条件

- Phase 4 の現行フォーマットが把握されている
- 追加位置（セクション）が特定されている

---

### Phase B: テンプレート更新

#### 目的

Phase 4 テンプレートに環境Red ガイダンスを追加する。

#### 手順

1. Phase 4 セクションに以下の内容を追加する:

   **環境Red 判定ガイダンス**

   ```markdown
   ### Phase 4 Red 状態の分類

   Red 状態には「コードRed」と「環境Red」の2種類がある。
   両者を区別して記録することで、適切な次アクションを判断できる。

   | Red 種別  | 定義                         | 発生例                                                            | 次アクション                       |
   | --------- | ---------------------------- | ----------------------------------------------------------------- | ---------------------------------- |
   | コードRed | テストが実行できるが失敗する | アサーション失敗、型エラー、未実装                                | 通常の Red→Green サイクル          |
   | 環境Red   | テスト実行自体が不可能       | esbuild arch 不整合、native module ビルド失敗、依存パッケージ欠損 | 環境修正 → 再実行 → Red/Green 確定 |
   ```

   **環境Red の記録フォーマット**

   ```markdown
   ## Phase 4: Red 状態記録

   ### Red 種別

   - [x] 環境Red（テスト実行不可）
   - [ ] コードRed（テスト失敗）

   ### 環境Red 詳細

   | 項目             | 内容                                                      |
   | ---------------- | --------------------------------------------------------- |
   | エラーメッセージ | `Could not load @esbuild/darwin-arm64` 等                 |
   | 原因の分類       | arch 不整合 / native module / 依存パッケージ欠損 / その他 |
   | 影響範囲         | 対象テストファイル名                                      |
   | 暫定対処         | `rm -rf node_modules && pnpm install` 等                  |
   | 環境修正後の状態 | コードRed（テスト失敗）/ Green（テスト通過）              |

   ### Phase 4 完了条件（環境Red の場合）

   - [ ] 環境修正が完了している
   - [ ] 環境修正後にテストが実行できる（コードRed または Green の状態が確定している）
   - [ ] 環境Red の原因と対処を 3.5 苦戦箇所に記録した
   ```

   **典型的な環境Red ケース一覧**

   ```markdown
   ### 典型的な環境Red ケース

   | ケース                 | エラーパターン                         | 解決策                                             |
   | ---------------------- | -------------------------------------- | -------------------------------------------------- |
   | esbuild arch 不整合    | `Could not load @esbuild/darwin-arm64` | arm64 環境で `rm -rf node_modules && pnpm install` |
   | Rosetta 経由 Node      | `process.arch` が `x64` と返る         | `arch -arm64 zsh` でシェルを切替後に pnpm install  |
   | native module 未ビルド | `Cannot find module '*.node'`          | `pnpm rebuild` または `pnpm --filter <pkg> build`  |
   | lock ファイル不整合    | `ERR_PNPM_OUTDATED_LOCKFILE`           | `pnpm install --frozen-lockfile=false`             |
   ```

2. `phase-templates.md` の Phase 4 セクション末尾に上記を追記する

#### 成果物

- 更新済み `phase-templates.md`

#### 完了条件

- 環境Red ガイダンスが Phase 4 セクションに追加されている
- 記録フォーマット（チェックボックス付き）が含まれている
- 典型ケース一覧が含まれている

---

### Phase C: 動作確認

#### 目的

追加した内容が正しく機能することを確認する。

#### 手順

1. `phase-templates.md` を読み返し、Phase 4 の流れが一貫しているか確認する
2. UT-RT-06 の体験に照らし合わせ、追加したテンプレートで状況を正確に記録できるか検証する
3. 既存の Phase 4 テンプレートとの整合性を確認する

#### 成果物

- 確認済みの `phase-templates.md`

#### 完了条件

- 環境Red ガイダンスが既存フォーマットと矛盾していない
- UT-RT-06 の体験をテンプレートに当てはめて記録できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `.claude/skills/task-specification-creator/references/phase-templates.md` の Phase 4 に「環境Red」サブセクションが追加されている
- [ ] 「コードRed（テスト失敗）」と「環境Red（テスト実行不可）」の区別を記録するフォーマットが存在する
- [ ] 環境Red 発生時の Phase 4 完了条件が明文化されている

### 品質要件

- [ ] 典型的な環境Redケース（esbuild arch 不整合、native module等）が記載されている
- [ ] 各ケースの解決策が具体的なコマンドで示されている
- [ ] 「100人中100人が同じ判断でPhase 4を完了できる」粒度の記述になっている

### ドキュメント要件

- [ ] 既存の Phase 4 テンプレートとの整合性が保たれている
- [ ] 追加内容が既存セクションを破壊していない

---

## 6. 検証方法

### テストケース

- Case 1: UT-RT-06 の体験（esbuild arch 不整合）を追加テンプレートに当てはめて記録できる
- Case 2: 通常のコードRed を追加テンプレートに当てはめても混乱が生じない

### 検証手順

1. 更新後の `phase-templates.md` の Phase 4 セクションを読み返す
2. UT-RT-06 の発生状況（`@esbuild/darwin-arm64` エラー）を「環境Red 記録フォーマット」に記入してみる
3. 記入した内容が実態を正確に反映しているか確認する

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                                       |
| -------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| 既存 Phase 4 セクションとの重複・矛盾        | 中     | 中       | Phase B 実施前に現行テンプレートを熟読し、追加位置を慎重に選定する         |
| 環境Redのケースが限定的で汎用性が低い        | 低     | 低       | 典型ケースとして記載し「その他」欄を設けて拡張性を確保する                 |
| テンプレートが長くなりすぎて可読性が低下する | 低     | 中       | 記録フォーマットは最小限のテーブル形式にとどめ、詳細は参照リンクで補完する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/phase-templates.md`
- `docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md`
- `docs/30-workflows/unassigned-task/task-imp-phase-templates-test-only-guidance-001.md`
- `docs/30-workflows/unassigned-task/task-ut-env-001-ci-nvmrc.md`

### 参考資料

- UT-RT-06-ESBUILD-ARCH-MISMATCH-001 Phase-12 skill-feedback-report（発見元）

---

## 9. 備考

### 発見の経緯

UT-RT-06-ESBUILD-ARCH-MISMATCH-001 の実装において、`@esbuild/darwin-arm64` が見つからないエラーで vitest が即停止した。コードのバグではなく環境の不整合であるため、通常の Red→Green サイクルが成立しない状況に陥った。Phase 4 の「Red状態記録」に「テスト実行不可」という状態を記録する適切な場所が存在しなかったため、本タスクとして起票した。

### 補足事項

本タスクは task-imp-phase-templates-test-only-guidance-001（テスト専用タスクの Phase 12 判定ガイダンス追加）と類似した改善系タスクであり、同時期に実施すると効率が良い。両タスクは同一ファイル（`phase-templates.md`）の異なるセクション（Phase 12 と Phase 4）を対象とするため、競合のリスクがある。いずれかを先に完了させてからもう一方を実施することを推奨する。
