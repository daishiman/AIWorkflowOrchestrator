# task-post-merge-parity-check-integration-001: post-merge フックへの parity check 統合

## メタ情報

```yaml
issue_number: 2362
```

## メタ情報

| 項目         | 値                                                                            |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | task-post-merge-parity-check-integration-001                                  |
| Issue番号    | [#2331](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2331)      |
| 機能名       | post-merge-parity-check-integration                                           |
| カテゴリ     | 改善                                                                          |
| 優先度       | 中 (MID)                                                                      |
| 規模         | 小規模（推定 2-3 時間）                                                       |
| ステータス   | unassigned                                                                    |
| source_phase | TASK-AGENTS-SKILLS-FULL-SYNC-001 / Phase-12 `unassigned-task-detection.md`    |
| 作成日       | 2026-04-19                                                                    |
| 関連タスク   | TASK-AGENTS-SKILLS-FULL-SYNC-001（親）, TASK-P0-05（mirror 同期自動化・類型） |
| パターン     | seq                                                                           |

## なぜ必要か（Why）

### 背景

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の Phase-5 にて、`.claude`（canonical）と `.agents`（mirror）間の同期スクリプト (`sync-skills-mirror.sh`) と parity 検証スクリプト (`verify-skills-parity.sh`) を整備した。さらに `post-merge-index-regenerate.sh` を導入し、merge 直後に indexes（`keywords.json` / `topic-map.md` 等）を再生成する仕組みを確立している。

しかし現状の `post-merge-index-regenerate.sh` は **index 再生成のみ** を担当しており、再生成結果が mirror 側と同期しているか（parity が保たれているか）を検証していない。そのため、別の worktree で並行した wave が merge されると、次回の起動まで drift が検知されず、Claude Code が古い mirror を読み込んだまま runtime 動作してしまうリスクが残る。

### 問題点

1. **drift の検知遅延**: post-merge で index 再生成のみ実行し、parity を確認しない。次回 pre-push または session-init まで drift が発覚しない
2. **wave 重なり時の不整合**: 複数 worktree が短時間で merge される wave が発生したとき、片方の index 再生成が他方の mirror と乖離し、後続タスクが古いリソースを参照する
3. **post-merge と pre-push の責務分担の曖昧さ**: pre-push は push をブロックできるが、post-merge は merge 後に動くためブロック手段がなく、警告のみに留めるのか自動 sync まで進めるのかが未整理
4. **可観測性の不足**: parity 不一致が起きても即座に log に残らないため、ユーザーが異常に気づくタイミングが遅れる

### 放置した場合の影響

- canonical / mirror 間で silent drift が蓄積し、「なぜか mirror の index が古い」ケースが断続的に再発する
- Claude Code の skill 解決が古い `keywords.json` を参照し、誤った skill が trigger される可能性がある
- parent タスクで整備した sync/verify の資産が、merge 直後という最も drift が起きやすい瞬間で活用されないまま宙に浮く
- 再発頻度が 1 wave/週 を超えると、開発者の信頼低下および手動同期コストの累積に繋がる

## 何を達成するか（What）

### 目的

post-merge タイミングで「index 再生成 → parity check」を直列実行し、merge 直後の drift を即時検知できる状態を作る。必要に応じて自動 sync まで進めるか、警告のみに留めるかを設計で確定し、ポリシーを明文化する。

### 最終ゴール

1. `.claude/hooks/post-merge-index-regenerate.sh` が index 再生成後に `verify-skills-parity.sh` を呼び出す
2. parity 不一致が検出された場合の挙動（警告のみ / 自動 sync / abort）がポリシーとして決定され、スクリプトに反映されている
3. drift が 1 wave 以上の頻度で再発した場合に、post-merge ログから追跡できるようになっている
4. テストまたは手動検証で「merge 直後の drift が即時検知される」ことが確認できる

### スコープ（含む）

- `.claude/hooks/post-merge-index-regenerate.sh` の拡張（parity check 呼び出しの追加）
- parity 不一致時の挙動ポリシーの決定と実装（警告ログ or 自動 sync）
- ログ出力の整備（drift 発生時に stderr または専用ログファイルへ記録）
- post-merge 統合後の手動検証シナリオの作成

### スコープ（含まない）

- `verify-skills-parity.sh` / `sync-skills-mirror.sh` 本体のロジック変更（Phase-5 で確定済み）
- pre-push 側の挙動変更（本タスクは post-merge 限定）
- CI/CD 側での parity 検証追加（別タスクで扱う）
- canonical / mirror のディレクトリ構造変更

### 成果物

- 拡張済み `.claude/hooks/post-merge-index-regenerate.sh`
- drift 検出時の挙動仕様書（`outputs/phase-1/post-merge-parity-policy.md` など）
- 手動検証結果レポート（`outputs/phase-11/manual-test-result.md`）
- 未タスク検出レポート / ドキュメント更新履歴（Phase-12 準拠）

## どのように実行するか（How）

### 前提条件

- 親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の Phase-5 が完了し、`.claude/scripts/verify-skills-parity.sh` と `.claude/scripts/sync-skills-mirror.sh` が正常動作すること
- `.claude/hooks/post-merge-index-regenerate.sh` が merge 後に index 再生成を行う実装として動作していること
- deterministic な generate-index（ハッシュ固定・順序固定）であること

### 依存タスク

- `TASK-AGENTS-SKILLS-FULL-SYNC-001` Phase-5（sync / verify スクリプト整備）: **必須**
- `TASK-P0-05`（manifest mirror 同期自動化）: 類型として参照

### 必要な知識

- bash シェルスクリプト（`set -euo pipefail`、終了コード設計、trap）
- git の post-merge フックの実行コンテキスト（merge 完了後に動作、abort 不能）
- canonical=`.claude` / mirror=`.agents` の同期ポリシー
- deterministic generate-index の挙動（同一入力で同一出力）

### 推奨アプローチ

1. **ポリシー決定を先行させる**: 「警告のみ」「自動 sync」「abort 相当（ログ強調）」の 3 択を Phase 1 で確定する
2. **直列実行を基本とする**: index 再生成 → parity check の順で実行し、逆順（parity → 再生成）は drift 検知不能になるため禁止
3. **post-merge の特性を踏まえた fail-safe**: merge 自体は既に完了しているため、parity 失敗でもフックが強制 abort すると開発者を混乱させる。stderr 警告 + 専用ログへの記録を基本とする
4. **冪等性を担保**: 同一 merge コミットで複数回実行されても副作用が増えないこと

## 実行手順

### Phase 1: 要件定義

**目的**: スコープ・受入条件・ポリシーを確定する

**タスク**:

1. 親タスク Phase-12 `unassigned-task-detection.md` を読み、本タスクに引き継がれる要件を抽出する
2. post-merge における parity 不一致時のポリシーを 3 択から確定する:
   - (A) **警告のみ**: stderr に警告を出力し、専用ログに記録。sync は開発者が手動で実行
   - (B) **自動 sync**: parity 不一致検出時に `sync-skills-mirror.sh` を自動実行し、sync 後に再度 parity 確認
   - (C) **警告強調**: 警告 + エスカレーション（デスクトップ通知等）。merge は止めない
3. ログ形式を決定する（タイムスタンプ・merge 対象コミット・drift の要約）
4. 受入基準 AC-1〜AC-N を確定する

**成果物**:

- `outputs/phase-1/requirements-summary.md`
- `outputs/phase-1/post-merge-parity-policy.md`（ポリシー決定記録）

**完了条件**: ポリシーが一つに定まり、受入基準が明文化されていること

---

### Phase 2: 実装

**目的**: `.claude/hooks/post-merge-index-regenerate.sh` に parity check を統合する

**タスク**:

1. 現行 `.claude/hooks/post-merge-index-regenerate.sh` の構造を読解し、index 再生成処理の終了直後に挿入すべき箇所を特定する
2. 直列実行を実装する:
   - `generate-index` 相当処理が成功（exit 0）したことを確認
   - 続けて `.claude/scripts/verify-skills-parity.sh` を呼び出す
   - parity 結果を判定し、Phase 1 で確定したポリシーに沿って分岐する
3. ログ出力を実装する:
   - stdout: 通常進捗
   - stderr: drift 検出時の警告
   - 専用ログファイル（例: `.claude/logs/post-merge-parity.log`）に追記
4. 冪等性の担保:
   - 複数回実行されても `.claude/logs/post-merge-parity.log` が肥大しないようローテーション（あるいは単純 append + 手動ローテーション運用を明記）
5. ポリシーが (B) 自動 sync の場合は `sync-skills-mirror.sh` 呼び出しも含め、sync 後に再度 parity を確認してループ防止（最大 1 回まで）する

**成果物**:

- 拡張済み `.claude/hooks/post-merge-index-regenerate.sh`
- `outputs/phase-2/implementation-summary.md`

**完了条件**:

- スクリプトが merge 後に index 再生成 → parity check を直列実行する
- parity 不一致時にポリシー通りの挙動をする
- 正常系で exit 0、異常系でも post-merge 自体は中断しない

---

### Phase 3: 検証

**目的**: drift 検知が実際に機能することを確認する

**タスク**:

1. 正常系手動検証:
   - テスト用 branch を merge し、index 再生成 → parity check が順に実行されることを確認
   - `.claude/logs/post-merge-parity.log`（または同等）に記録が残ることを確認
2. 異常系手動検証（drift 模擬）:
   - `.agents` 配下の一部ファイルを手動で改変し、mirror が drift した状態を作る
   - merge を実行し、post-merge フックで parity 不一致が検出されることを確認
   - ポリシー (A) なら警告のみ、(B) なら自動 sync で修復、(C) なら警告強調、という挙動を確認
3. 冪等性確認:
   - 同一 merge を再実行し、ログが重複追記されるだけで副作用が増えないことを確認
4. wave 重なり模擬:
   - 複数 worktree を並行で merge したとき、各 post-merge フックで drift 検知が個別に働くことを確認

**成果物**:

- `outputs/phase-3/verification-report.md`

**完了条件**: 正常系 / drift 検知 / 冪等性 / wave 重なり の 4 シナリオが全て期待通りに動作すること

---

### Phase 4: 統合・ドキュメント更新

**目的**: ポリシー・ログ運用・復旧手順をドキュメント化し、他タスクから参照可能にする

**タスク**:

1. `CLAUDE.md` または `.claude/hooks/README.md` に post-merge 統合の挙動を追記する
2. drift 検出時の復旧手順（`sync-skills-mirror.sh` 手動実行 → `verify-skills-parity.sh` 手動実行）を明文化する
3. 未タスク検出レポート（Phase-12 準拠）を出力する
4. スキルフィードバックレポート（Phase-12 準拠）を出力する

**成果物**:

- ドキュメント更新差分
- `outputs/phase-4/documentation-changelog.md`
- `outputs/phase-4/unassigned-task-detection.md`
- `outputs/phase-4/skill-feedback-report.md`

**完了条件**: ドキュメントが更新され、復旧手順が第三者にも再現可能な形で残ること

---

## 完了条件チェックリスト

| ID   | 基準                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------- |
| AC-1 | `.claude/hooks/post-merge-index-regenerate.sh` が index 再生成後に `verify-skills-parity.sh` を呼び出す |
| AC-2 | 実行順は必ず「index 再生成 → parity check」であり、逆順では動作しない（順序依存を実装・テストで担保）   |
| AC-3 | parity 不一致時のポリシー（警告 / 自動 sync / 警告強調）が Phase 1 で確定し、スクリプトに反映されている |
| AC-4 | parity 不一致を検知した場合に、stderr 警告および専用ログファイルへの記録が行われる                      |
| AC-5 | post-merge フックが parity 失敗でも強制 abort せず、merge 自体の完了性を損なわない                      |
| AC-6 | 同一 merge コミットで複数回実行されても副作用が増えない（冪等性担保）                                   |
| AC-7 | 手動検証シナリオ（正常系 / drift 模擬 / 冪等性 / wave 重なり）が全て PASS している                      |
| AC-8 | drift 発生時の復旧手順が `CLAUDE.md` または hooks README に明文化されている                             |

## 検証方法

### 自動検証

- `bash .claude/hooks/post-merge-index-regenerate.sh` を手動実行して終了コード 0 を確認
- `shellcheck .claude/hooks/post-merge-index-regenerate.sh`（利用可能な場合）

### 手動検証

1. テスト branch を作成し、canonical 側の skill リソースを小さく編集
2. merge を実行
3. post-merge フックが自動で動き、ログに index 再生成と parity check の両方が記録されることを確認
4. `.agents` 側を手動で drift させ、再度 merge（または空 merge）を実行し、drift 検出ログが出ることを確認
5. ポリシー (B) 採用時は自動 sync 後に parity OK に戻ることを確認

### 回帰 guard

- `verify-skills-parity.sh` 単体実行結果と、post-merge 統合後の結果が一致することを確認
- 既存の session-init.sh / pre-push の挙動が変わっていないことを確認

## リスクと対策

| リスク                                                                        | 影響度 | 対策                                                                                              |
| ----------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| post-merge フックが parity 失敗で abort してしまい、開発者が merge 後に詰まる | 高     | ポリシーとして「警告のみ / 専用ログ記録」を基本とし、merge の完了性を損なわない設計にする（AC-5） |
| 自動 sync ポリシー採用時に無限ループ（sync → parity 失敗 → sync …）が発生     | 中     | sync 後の再 parity は最大 1 回に制限し、それでも不一致なら警告のみで停止                          |
| wave 重なりで複数 post-merge フックが同時に走り、ログが混線する               | 中     | ログにタイムスタンプ + merge コミット SHA を必ず含め、後から追跡可能にする                        |
| `verify-skills-parity.sh` の実行時間が長く、merge 後の体感速度が悪化する      | 低     | Phase-5 成果物はすでに軽量前提だが、計測して 1 秒以内に収まることを確認する                       |
| drift 検知後に開発者が復旧方法を知らず放置する                                | 中     | Phase 4 で `CLAUDE.md` / hooks README に復旧手順を明記（AC-8）                                    |

## 参照情報

| リソース                                                                 | 役割                                    |
| ------------------------------------------------------------------------ | --------------------------------------- |
| `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`  | 親タスク                                |
| `docs/30-workflows/unassigned-task/task-p0-05-mirror-sync-automation.md` | 類型タスク（mirror 同期自動化）         |
| `.claude/scripts/verify-skills-parity.sh`                                | parity 検証スクリプト（Phase-5 成果物） |
| `.claude/scripts/sync-skills-mirror.sh`                                  | mirror 同期スクリプト（Phase-5 成果物） |
| `.claude/hooks/post-merge-index-regenerate.sh`                           | 拡張対象フック（index 再生成）          |
| `CLAUDE.md`                                                              | プロジェクト Hook 設定・更新対象        |

---

## 苦戦箇所【必須・詳細】

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` 実装フェーズで明らかになった知見を、本タスクでも同じ落とし穴に落ちないよう明記する。

### 1. `post-merge-index-regenerate.sh` 内での parity check 連結における順序依存

**問題**: index 再生成と parity check の実行順序を誤ると drift 検知が原理的に不可能になる。

- **正しい順序**: `generate-index`（canonical 側）→ `sync-skills-mirror.sh`（Phase-5 で自動化済み or 本タスクで自動化）→ `verify-skills-parity.sh`
- **誤った順序**: `verify-skills-parity.sh` → `generate-index`
  - この順だと、「index 再生成前の古い状態」で parity を判定してしまい、常に OK 側に倒れる
  - あるいは「再生成で必ず差分が出るのでその差分を drift と誤検知」して警告だらけになる

**対策**:

- Phase 2 実装時に `set -euo pipefail` を先頭に置き、index 再生成の exit code が 0 の場合のみ parity check に進むガード節を入れる
- コメントで「順序依存」を明記し、将来のリファクタで安易に入れ替えられないようにする
- Phase 3 検証でわざと逆順にしてみて、drift 検知が機能しないことを確認（ネガティブテスト）

### 2. post-merge は pre-push と違い早期 return / abort 後の挙動に注意（既に merge 済み）

**問題**: pre-push は push 前に走るため、失敗すれば push をブロックして開発者にリトライさせられる。しかし post-merge は **merge が既に完了した後** に走るため、フック内で exit 1 しても merge を取り消せない。

**発現したパターン**（親タスク中）:

- pre-push 相当のガード節をそのまま post-merge に流用したところ、drift を検知した際に exit 1 してシェルスクリプトが異常終了した。開発者には「merge したのに何かエラーが出ている」という混乱を与えただけで、状態は修復されない
- 一方、何も出力せず exit 0 にすると drift 発生に気づけない

**対策**:

- **merge の完了性を損なわない** を原則とし、parity 失敗でもフックは exit 0 で終了する（AC-5）
- **ただし可観測性は確保する**: stderr 出力 + 専用ログファイルへの記録を必須とする
- ポリシー決定（Phase 1）で「警告のみ / 自動 sync / 警告強調」を明示的に選び、`exit 1 で止める` は選択肢から除外する
- `trap` を使って途中で失敗しても必ずログを flush する

### 3. drift が発生しやすいシナリオ（worktree 間の wave 重なり）

**問題**: 親タスクで観測された通り、複数 worktree が短時間で順次 merge される「wave」パターンが drift の主因になる。

- worktree A が canonical を更新 → merge → post-merge で index 再生成
- 直後に worktree B が同じ canonical の別箇所を更新 → merge → post-merge で index 再生成
- このとき worktree B 側の mirror が A の再生成結果を踏まえていないと drift が生じる

**発現しやすい条件**:

- 複数タスクが並行で `.claude/skills/*` を更新している
- worktree が複数同時稼働している（本プロジェクトは常時 4-6 worktree）
- merge 間隔が分単位で続く（1 wave = 2 件以上の merge が 10 分以内）

**対策**:

- post-merge ごとに必ず parity check を実行し、wave の各 merge で drift を即時検知する
- ログにタイムスタンプと merge コミット SHA を記録し、「どの wave のどの merge で drift が発生したか」を後追いできるようにする
- Phase 3 検証シナリオに「wave 重なり模擬」を含める

### 4. sync と verify の切り分け設計判断（post-merge で sync まで自動実行するか）

**問題**: drift 検出時の挙動として「警告のみ」と「自動 sync」のどちらを採るかは、プロジェクトの性格に依存する設計判断であり、安易に決めると運用事故を招く。

**トレードオフ**:

| 選択          | メリット                                       | デメリット                                                   |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------ |
| 警告のみ (A)  | 副作用なし・開発者が状況を把握してから対応可能 | 手動対応が必要・忘れると drift が残り続ける                  |
| 自動 sync (B) | drift が即時修復される・手動作業が不要         | 未コミットの mirror 変更を上書きする可能性・無限ループリスク |
| 警告強調 (C)  | 気付きやすい                                   | 通知疲れを招きやすい・修復は手動のまま                       |

**親タスクでの経験**:

- 初期は (B) 自動 sync を検討したが、「開発者が意図的に mirror を一時的に触っている途中」で post-merge が走ると、その作業を巻き戻してしまう恐れがあった
- また、sync 後の再 parity で再度不一致になるケース（generate-index が非決定的だった古い実装時）で無限ループに陥るリスクが見えた
- 結論として Phase 1 でポリシーを「一つに決めて明文化する」ことを必須とし、後から変える場合も別タスクで議論する

**対策**:

- Phase 1 の成果物 `post-merge-parity-policy.md` に「なぜそのポリシーを選んだか」の理由を必ず残す
- (B) を選ぶ場合は「sync 後の再 parity は最大 1 回まで」のループ防止をコードに明示
- 将来ポリシーを変える場合に備え、フック内でポリシー分岐を関数化して差し替え容易にしておく

### 5. deterministic generate-index への暗黙依存

**問題**: parity check が「canonical と mirror の内容一致」を前提にしている以上、`generate-index` が非決定的だと parity は常に失敗する。親タスク Phase-5 で deterministic 化（ハッシュ固定・順序固定）を担保したが、本タスクはその性質に暗黙依存している。

**対策**:

- Phase 1 要件定義で「前提条件: deterministic generate-index」を明記
- Phase 3 検証で同一入力に対し 2 回 generate-index を実行し、結果が完全一致することを確認
- 将来 `generate-index` を改修する際に非決定性を混入させないよう、hooks README に注意書きを残す

---

## 備考

- 本タスクは **起票タイミング: drift が 1 wave 以上の頻度で再発した時** を trigger とする。現時点では親タスク Phase-12 で検出された MID 未タスクとして保留中
- 親タスクの `TASK-AGENTS-SKILLS-FULL-SYNC-001.md` と合わせて読むと、post-merge 統合の前提となる sync/verify の実装詳細が把握できる
- 本仕様書は task-specification-creator skill に準拠したフォーマットだが、小規模タスクのため Phase を 4 段階に圧縮している（要件 / 実装 / 検証 / 統合）
