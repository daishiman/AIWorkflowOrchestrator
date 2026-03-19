# Lessons Learned（教訓集） / UI lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: UI lessons

## TASK-UI-05-SKILL-CENTER-VIEW: SkillCenterView 実装（2026-03-01）

### 苦戦箇所: `CategoryId` と `SkillCategory` の境界が混在しやすい

| 項目             | 内容                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 課題             | カテゴリ選択・フィルタ・表示順の責務が同じ型として扱われ、比較条件が増えるほど読み解きコストが上がる                     |
| 再発条件         | UI都合の `all` などをドメインカテゴリと同じ層で扱う場合                                                                  |
| 原因             | 表示ID層とドメインカテゴリ層の責務分離が途中段階だった                                                                   |
| 対処             | `UT-UI-05-001` として型統一を未タスク化し、現時点は変換点（`all` と `categoryOrderMap`）を局所化して回帰テストで固定した |
| 今後の標準ルール | カテゴリは「表示ID層」「ドメイン層」「変換層」を明示的に分離する                                                         |

### 苦戦箇所: `SkillDetailPanel` への責務集中

| 項目             | 内容                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------- |
| 課題             | 詳細表示の拡張（Markdown描画、モバイル操作、Skeleton）を同時に進めると差分が肥大化し、レビュー観点が拡散する   |
| 再発条件         | 1コンポーネントに表示/操作/状態切替を集約したまま機能追加する場合                                              |
| 原因             | 実装速度を優先して Molecule 分離を後段にした                                                                   |
| 対処             | `UT-UI-05-002` / `UT-UI-05-003` / `UT-UI-05-004` / `UT-UI-05-005` として課題を分解し、Phase 12で追跡可能化した |
| 今後の標準ルール | 大型UIは「完了時に責務分離未タスクを先に切る」を必須化する                                                     |

### 苦戦箇所: Phase 12 証跡値の同期漏れ

| 項目             | 内容                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題             | 検証コマンドはPASSでも、`task-workflow.md` / `lessons-learned.md` / 未タスク参照の同期順がずれると再確認工数が増える                         |
| 再発条件         | 成果物生成と仕様書転記を別ターンで進める場合                                                                                                 |
| 原因             | 同一ターン同期ルールが作業手順に固定されていなかった                                                                                         |
| 対処             | `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` の結果を同一ターンで台帳・教訓へ転記した |
| 今後の標準ルール | Phase 12 は「検証値確定→台帳反映→教訓反映」を連続実行し、途中保存を完了扱いにしない                                                          |

### 同種課題の簡潔解決手順（5ステップ）

1. `verify-all-specs --workflow` と `validate-phase-output` を先に実行し、構造要件を確定する。
2. 実装要点・未タスク・検証証跡を `task-workflow.md` に先行記録する。
3. 未タスクは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` へ作成し、`--target-file` 監査で形式を確定する。
4. `verify-unassigned-links` と `audit --diff-from HEAD` でリンクと差分違反を確定する。
5. 同一ターンで `lessons-learned.md` に苦戦箇所と再発条件を転記し、標準ルールを固定する。

---

## TASK-UI-05B-SKILL-ADVANCED-VIEWS: 高度管理ビュー群再確認（2026-03-02）

### 苦戦箇所: `verify-all-specs` warning 値がドリフトする

| 項目             | 内容                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| 課題             | `verify-all-specs` は PASS でも warning が残り、再確認時に「反映漏れか既知差分か」の判定が揺れる |
| 再発条件         | `phase-12-documentation.md` の参照資料に依存Phase成果物を列挙しない場合                          |
| 原因             | Phase 12 文書を Task 1〜5 最小記述で閉じ、依存成果物参照を省略していた                           |
| 対処             | 参照資料へ Phase 2/5/6/7/8/9/10 の成果物を追加し、warning 原因を明示した                         |
| 今後の標準ルール | Phase 12 再確認では「依存成果物参照の補完 → verify実行」の順序を固定する                         |

### 苦戦箇所: 画面証跡が古いまま残りやすい

| 項目             | 内容                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| 課題             | 画面証跡ファイルが存在していても、再確認時点の実装状態を示していない可能性がある                       |
| 再発条件         | 既存スクリーンショットの存在確認だけで完了判定する場合                                                 |
| 原因             | 再撮影手順が完了条件に固定されていなかった                                                             |
| 対処             | `capture-skill-advanced-views-screenshots.mjs` を実行し、TC-04〜TC-07 を再取得して更新時刻で証跡化した |
| 今後の標準ルール | UIタスクの再確認は「再撮影 + 更新時刻確認」を必須化する                                                |

### 苦戦箇所: 未タスク監査の baseline を今回差分と誤読する

| 項目             | 内容                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| 課題             | `audit --diff-from HEAD` の結果で baseline 件数を見て誤って失敗扱いしやすい |
| 再発条件         | `currentViolations` と `baselineViolations` を分離せず記録する場合          |
| 原因             | 合否指標（current）と改善バックログ指標（baseline）の運用目的が混在         |
| 対処             | 合否は `currentViolations=0` 固定、baseline は別管理として記録した          |
| 今後の標準ルール | 未タスク監査は `current/baseline` を必ず併記し、判定軸を固定する            |

### 同種課題の簡潔解決手順（5ステップ）

1. 更新対象仕様書を 1仕様書=1SubAgent（ui-ux-components / ui-ux-feature-components / arch-ui-components / arch-state-management / task-workflow / lessons-learned）で分割する。
2. `verify-all-specs` / `validate-phase-output` を実行し、warning/error の根拠を抽出する。
3. `phase-12-documentation.md` に依存Phase成果物の参照を追加して再検証する。
4. UI画面はスクリーンショットを再撮影し、更新時刻を証跡化する。
5. 未タスク監査は `current` を合否、`baseline` を改善バックログとして分離記録し、`task-workflow.md` と同時同期する。

---

## TASK-9A-C: SkillEditor 仕様書再監査（Phase 12準拠）

### タスク概要

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| タスクID   | TASK-9A-C                                             |
| 目的       | SkillEditor の Phase 12成果物・参照・仕様反映の整合化 |
| 完了日     | 2026-02-19                                            |
| ステータス | **仕様書作成済み（spec_created）**                    |

### 苦戦箇所と解決策

#### 1. tasks/completed-task 参照混在

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| **課題**   | `tasks/` と `tasks/completed-task/` が混在し、タスク参照が一貫しない |
| **原因**   | 仕様書更新時に参照先変更が一部ファイルへしか反映されなかった         |
| **解決策** | `TASK-9A-C` 参照を `completed-task/` へ統一し、旧参照ファイルを削除  |
| **教訓**   | タスク状態変更時は `rg "TASK-ID"` で全参照を横断確認し、一括更新する |

#### 2. phase-09 と phase-9 の表記ゆれ

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| **課題**   | Phase 9成果物の参照が `phase-09` と `phase-9` で混在 |
| **原因**   | 過去テンプレート由来の命名が残存していた             |
| **解決策** | 実ディレクトリに合わせて `phase-9` に統一            |
| **教訓**   | 監査時に `rg "phase-09"` を定常チェックに入れる      |

#### 3. Step 1-B の状態判定の曖昧さ

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| **課題**   | 実装未着手タスクでも Step 1-B を `completed` と誤判定しやすい               |
| **原因**   | Step 1-B の説明が「未実装→完了」に偏っていた                                |
| **解決策** | 本件は `spec_created` を正として記録し、運用ガイドへ判定ルールを追記        |
| **教訓**   | 仕様書作成タスクは `completed` ではなく `spec_created` を許容する分岐が必要 |

#### 4. 未タスク参照の実体不足

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| **課題**   | `task-workflow.md` の未タスクリンクに実体ファイル欠落が1件あった                             |
| **原因**   | 参照登録時の物理ファイル作成が漏れた                                                         |
| **解決策** | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に指示書を配置し、`verify-unassigned-links.js` で再検証 |
| **教訓**   | 未タスク登録は「作成→配置→検証（ALL_LINKS_EXIST）」を同一ターンで完了する                    |

---

#### 5. 並列エージェント実行時のAPIレートリミット

| 項目       | 内容                                                                                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 1の4タスクを4つのSubAgentで並列実行したところ、3/4のエージェントがAPIレートリミット（"You've hit your limit"）に到達し、完了レポートが不完全になった |
| **原因**   | 4エージェント同時実行によりAPIリクエストが集中し、レートリミットに到達。ファイル書き込みは処理最終段階に集中していたため、途中結果が失われるリスクがあった |
| **解決策** | 並列エージェント数を2-3に制限し、重要度の高いタスクを優先実行。ファイル書き込みを処理途中でも行うインクリメンタル設計にする                                |
| **教訓**   | SubAgent並列実行は2-3が安全目安。4以上はレートリミットリスクが高い。重要度順にエージェントを割り当て、中間成果物のファイル書き込みを早期に行う設計が必要   |

**並列エージェント数の安全基準**:

| 並列数 | リスク | 推奨用途                                                           |
| ------ | ------ | ------------------------------------------------------------------ |
| 1-2    | 低     | 標準作業、長時間タスク                                             |
| 3      | 中     | 独立性の高い短時間タスク                                           |
| 4以上  | 高     | レートリミットに到達しやすい。回避策（優先実行・段階的起動）が必須 |

**カテゴリ**: エージェント実行・リソース管理

**相互参照**: [TASK-FIX-13-1 苦戦箇所5: 並列エージェント実行時の成果物品質保証](#5-並列エージェント実行時の成果物品質保証)

---

#### 6. スキルスクリプトのパス解決

| 項目       | 内容                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `node scripts/complete-phase.js` でMODULE_NOT_FOUNDエラーが発生                                                                                    |
| **原因**   | スクリプトはプロジェクトルートの `scripts/` ではなく `.claude/skills/task-specification-creator/scripts/` に配置されているが、相対パスで誤参照した |
| **解決策** | スキル内スクリプトは `.claude/skills/{skill-name}/scripts/` の絶対パスから参照する                                                                 |
| **教訓**   | スキル関連スクリプトの実行時は、プロジェクトルートの `scripts/` と混同しないよう、必ず `.claude/skills/{skill-name}/scripts/` パスを使用する       |

```bash
# ❌ プロジェクトルートのscripts/を参照（MODULE_NOT_FOUND）
node scripts/complete-phase.js

# ✅ スキルディレクトリ内のscripts/を参照
node .claude/skills/task-specification-creator/scripts/complete-phase.js
```

**カテゴリ**: ツーリング・環境

---

#### 7. 大規模仕様書のコンテキスト管理

| 項目       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題**   | Phase 4（テスト作成）が1005行/43KB、Phase 6（テスト拡充）が1065行/42KBの大規模仕様書になり、1回のエージェント実行で全内容を処理するのが困難だった                  |
| **原因**   | SkillEditorの機能範囲が広く（9コンポーネント、テストデータファクトリ、ユーティリティ関数テスト等）、仕様書が肥大化。エージェントのコンテキストウィンドウを圧迫した |
| **解決策** | 仕様書を複数のサブタスクに分割し、各サブタスク内でコンテキストを限定。Progressive Disclosure原則に従い、必要な部分のみ読み込む設計にした                           |
| **教訓**   | 仕様書は1ファイル800行以下を目安とし、超過する場合はファイル単位（テストデータファクトリ / ユーティリティ関数テスト / コンポーネントテスト）で分割記述する         |

**仕様書サイズの目安**:

| サイズ    | 処理可能性                   | 推奨対応             |
| --------- | ---------------------------- | -------------------- |
| 500行以下 | 1エージェントで問題なし      | 分割不要             |
| 500-800行 | 処理可能だがコンテキスト圧迫 | サブタスク分割推奨   |
| 800行以上 | コンテキスト超過リスク       | ファイル単位分割必須 |

**カテゴリ**: 仕様書設計・コンテキスト管理

---

#### 8. 仕様書へのPitfall事前組み込みの有効性

| 項目     | 内容                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **課題** | （成功事例）過去の苦戦箇所が実装時に再発するリスクがあった                                                                                                                                       |
| **成果** | `06-known-pitfalls.md` の P31（Zustand無限ループ）、P39（happy-dom userEvent非互換）、P40（テスト実行ディレクトリ依存）を Phase 仕様書に「⚠️ 既知の Pitfall 注意事項」テーブルとして事前記載した |
| **効果** | 実装者が仕様書を読んだ時点で既知の落とし穴を認知でき、テスト環境の設定忘れや非互換APIの使用を防止。SkillEditorの全内部状態を`useState`のみで管理する設計判断もP31対策から導出された              |
| **教訓** | 今後の仕様書作成時は、関連するPitfallを仕様書の冒頭に「注意事項テーブル」として必ず記載し、既知の落とし穴を実装前に可視化する                                                                    |

**Pitfall注意事項テーブルの記載例**:

| Pitfall ID | 概要                          | 本タスクでの影響                           | 対策                               |
| ---------- | ----------------------------- | ------------------------------------------ | ---------------------------------- |
| P31        | Zustand Store Hooks無限ループ | SkillEditorで合成Hook使用すると無限ループ  | 全内部状態を`useState`で管理       |
| P39        | happy-dom userEvent非互換     | テストで`userEvent`使用不可                | `fireEvent`を使用                  |
| P40        | テスト実行ディレクトリ依存    | `apps/desktop/`以外から実行するとDOM未定義 | 対象パッケージディレクトリから実行 |

**カテゴリ**: 仕様書品質・知識の再利用

**相互参照**: [06-known-pitfalls.md - P31, P39, P40](../../../rules/06-known-pitfalls.md)

---

## TASK-UI-07-DASHBOARD-ENHANCEMENT: ホーム画面リデザイン（2026-03-11）

### 苦戦箇所1: completed workflow でも workflow 本文と台帳が stale のまま残りやすい

| 項目 | 内容 |
| --- | --- |
| 課題 | `index.md` / `artifacts.json` は completed でも、`phase-1..12` 本文や legacy task doc に stale 状態が残った |
| 再発条件 | outputs だけで Phase 12 完了と判断し、workflow 本文と親台帳を後回しにする |
| 解決策 | `verify-all-specs` に加えて workflow 本文と親導線を手動で突合し、completed path 基準へそろえた |
| 標準ルール | Phase 12 は outputs、workflow 本文、親台帳の三層同期で閉じる |

### 苦戦箇所2: Phase 11 validator は manual test 文書の literal 見出しに依存する

| 項目 | 内容 |
| --- | --- |
| 課題 | `manual-test-result.md` があっても `phase-11-manual-test.md` の `テストケース` / `画面カバレッジマトリクス` が欠けると false fail になった |
| 再発条件 | screenshot 実体の存在確認だけで文書構造チェックを省略する |
| 解決策 | harness screenshot と同時に coverage validator の期待見出しを文書へ固定した |
| 標準ルール | UIタスクは screenshot 実体と manual test 文書構造をセットで検証する |

### 苦戦箇所3: 表示名 `ホーム` と内部 `dashboard` 契約を混ぜると nav/store に波及する

| 項目 | 内容 |
| --- | --- |
| 課題 | UI文言変更をそのまま内部 `ViewType` 変更として扱うと、既存 navigation/store 契約が崩れる |
| 再発条件 | copy と internal ID の責務を分離せずに rename する |
| 解決策 | UI copy は `ホーム` へ更新しつつ、内部 `dashboard` 契約は維持した |
| 標準ルール | 画面名称変更では UI copy と内部契約 ID を明示的に分離する |

### 苦戦箇所4: dual skill-root repository では user 指定rootだけ更新すると mirror 側が stale になる

| 項目 | 内容 |
| --- | --- |
| 課題 | `.claude` 正本だけ更新しても `.agents` mirror 側の参照や validator 対象が古いまま残った |
| 再発条件 | canonical root を決めずに Phase 12 を閉じる |
| 解決策 | `.claude` を canonical root、`.agents` を mirror として扱い、`rsync --checksum` と `diff -qr` で整合確認した |
| 標準ルール | dual root repository では canonical root 固定、mirror sync、root 間 diff 検証を完了条件に含める |

### 同種課題の簡潔解決手順（5ステップ）

1. UI copy と内部契約 ID を先に分離する。
2. completed workflow は outputs だけでなく workflow 本文と親台帳も同時に更新する。
3. Phase 11 は screenshot 実体と `phase-11-manual-test.md` の literal 見出しを同時に整える。
4. user 指定root を canonical root とし、mirror root は同期対象として明示する。
5. Phase 12 完了前に `verify-all-specs`、`validate-phase11-screenshot-coverage`、`diff -qr` をまとめて通す。

### 関連未タスク

| タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001 | Phase 12 dual skill-root mirror sync ガード（canonical root 固定 + mirror sync + root間diff検証） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md` |
| UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001 | aiworkflow-requirements の入口導線整流 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md` |

## TASK-UI-04A-WORKSPACE-LAYOUT 実装教訓（2026-03-10）

### 苦戦箇所: right preview panel の resize 方向が逆転する

| 項目 | 内容 |
| --- | --- |
| 課題 | 左 panel 用の drag 計算を右 panel に流用すると、ドラッグ方向と幅変化が逆に感じられる |
| 再発条件 | split view の左右 panel に同一 resize hook をそのまま使う |
| 対処 | `usePanelResize` に `direction: "reverse"` を追加し、preview panel だけ反転計算へ切り替えた |
| 標準ルール | 右 panel の resize は「カーソル移動方向と panel 幅変化が一致するか」を screenshot 前に確認する |

### 苦戦箇所: watch hook が callback identity 変更で再登録する

| 項目 | 内容 |
| --- | --- |
| 課題 | `onFileChanged` を effect dependency に置くと、Render ごとに watch start / stop が揺れる |
| 再発条件 | watch lifecycle と UI callback を同一 dependency で管理する |
| 対処 | callback を `ref` に退避し、effect dependency は `enabled` / `filePath` に限定した |
| 標準ルール | watch / subscription hook は callback ref と lifecycle dependency を分離する |

### 苦戦箇所: worktree preview が別 source を指す

| 項目 | 内容 |
| --- | --- |
| 課題 | Vite dev server が別 worktree source を見て、current branch の harness が表示されないことがある |
| 再発条件 | 複数 worktree で同一 repo の HMR / preview を使い回す |
| 対処 | `pnpm build` 後の `apps/desktop/out/renderer` を static server で配信し、asset hash を current build と一致させた |
| 標準ルール | worktree screenshot は「current build artifact を static 配信」を第一候補にする |

### 苦戦箇所: light theme の補助テキストが screenshot で沈む

| 項目 | 内容 |
| --- | --- |
| 課題 | 実装中は読めても、証跡画像では補助情報が背景に溶けやすい |
| 再発条件 | dark theme を基準に text-secondary を設計し、そのまま light へ流す |
| 対処 | Workspace 04A の chip / 補助テキスト / status bar を局所調整し、再撮影で確認した |
| 標準ルール | Apple UI/UX 目視レビューでは light theme の階層性とコントラストを別途判定する |

### 同種課題の簡潔解決手順（5ステップ）

1. split view では左右 panel の resize 方向を個別に検証する。
2. watch hook は callback ref 化して再登録の揺れを止める。
3. worktree screenshot は build artifact の hash を確認して current source を固定する。
4. light / dark の両テーマで補助テキストの視認性を screenshot で比較する。
5. 問題を修正したら、その場で再撮影して Phase 11 証跡を更新する。

### 関連未タスク

| 未タスクID | 目的 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001 | current build source pinning と Workspace UI 再監査 checklist をスクリプト/運用として共通化する | `docs/30-workflows/completed-tasks/task-058b-ui-04a-workspace-layout-filebrowser/unassigned-task/task-imp-workspace-phase11-current-build-capture-guard-001.md` |

## TASK-UI-04C-WORKSPACE-PREVIEW 実装教訓（2026-03-11）

### 苦戦箇所: fuzzy search の順位補正が非一致候補まで通す

| 項目 | 内容 |
| --- | --- |
| 課題 | subsequence score が 0 でも定数 boost を足すと、query 非一致のファイルが候補に残る |
| 再発条件 | fuzzy ranking で「一致判定」と「補正計算」を同一式に押し込む |
| 対処 | `score > 0` を先に判定し、補正は一致済み候補にだけ適用した |
| 標準ルール | fuzzy search は no-match を空配列で返すテストを必ず持つ |

### 苦戦箇所: preview 用 `file:read` が hang すると loading が固着する

| 項目 | 内容 |
| --- | --- |
| 課題 | Main 応答待ちだけに依存すると preview が永続 loading のまま戻らない |
| 再発条件 | renderer 側 timeout を持たず、IPC 契約変更で解決しようとする |
| 対処 | `Promise.race` で 5秒 timeout、1秒間隔で最大3回 retry を追加した |
| 標準ルール | preview / inspector 系の invoke は renderer timeout + retry を標準にする |

### 苦戦箇所: structured preview parse error を fatal と同列に扱う

| 項目 | 内容 |
| --- | --- |
| 課題 | JSON/YAML の整形失敗だけで preview 全体を error 画面に切り替えると復旧導線が消える |
| 再発条件 | parse failure と transport failure を同じ error surface へ集約する |
| 対処 | alert banner を出しつつ `SourceView` fallback を残した |
| 標準ルール | parse error は recoverable、transport error は fatal という層分離を維持する |

### 同種課題の簡潔解決手順（5ステップ）

1. fuzzy search に `no match -> []` と same-score stable sort テストを先に置く。
2. preview 読み込みは renderer timeout と retry の上限を明示する。
3. parse error と transport error を別 UI として扱う。
4. Phase 11 は current build static serve を使い、dialog / mobile / terminology を再確認する。
5. workflow / outputs / system spec / LOGS / SKILL を同一ターンで同期する。

### 関連未タスク

| 未タスクID | 目的 | タスク仕様書 |
| --- | --- | --- |
| UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 | Workspace Preview / QuickFileSearch の fuzzy no-match、renderer timeout+retry、parse/transport 分離を共通ガードへ昇格し、次回類似タスクの初動を短縮する | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md` |

