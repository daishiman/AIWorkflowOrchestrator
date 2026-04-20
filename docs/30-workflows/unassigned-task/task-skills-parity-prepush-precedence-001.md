# task-skills-parity-prepush-precedence-001: Skills Parity Gate の pre-push 配置順序最適化

## メタ情報

| 項目          | 値                                                                                      |
| ------------- | --------------------------------------------------------------------------------------- |
| task_id       | `task-skills-parity-prepush-precedence-001`                                             |
| issue_number  | [#2334](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2334)                |
| name          | Skills Parity Gate の pre-push 配置順序最適化                                           |
| category      | 改善（DX / CI ガードレール）                                                            |
| priority      | 中 (MID)                                                                                |
| scale         | 小規模（推定 1-2 時間）                                                                 |
| status        | unassigned                                                                              |
| source_phase  | `TASK-AGENTS-SKILLS-FULL-SYNC-001` Phase 11（統合検証） / `discovered-issues.md` Note-1 |
| created_date  | 2026-04-19                                                                              |
| related_tasks | `TASK-AGENTS-SKILLS-FULL-SYNC-001`（親タスク、AC-4 pre-push gate の実装元）             |
| target_files  | `.husky/pre-push`, `.claude/scripts/verify-skills-parity.sh`（read-only 参照）          |

---

## 1. なぜ必要か（Why）

### 1.1 背景

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` で、`.claude/skills`（canonical）と `.agents/skills`（mirror）の parity（完全一致）を
pre-push フックでブロックする仕組み（AC-4）を導入した。parity gate は `.claude/scripts/verify-skills-parity.sh` を
`.husky/pre-push` の **末尾** で実行する構成になっている。

Phase 11 の統合検証（シナリオ 3: full pre-push hook 経由）で、意図的に mirror 側を drift させた状態で `git push` を
実行したところ、pre-push は exit=1 で停止した。しかし停止理由を詳細に確認すると、`.husky/pre-push` 冒頭の
**Phase 1（shared build）** が `esbuild version mismatch` エラーで先に失敗しており、末尾の parity gate には
到達していなかった。

一方、parity gate 単独（`bash .claude/scripts/verify-skills-parity.sh`）を isolated に実行した場合は、
drift を 0.3 秒以下で検出し正しく exit=1 を返すことが確認されている。したがって **AC-4 のロジック要件は充足**
している。

### 1.2 問題点

1. **到達不能ケースの存在**: Phase 1 〜 3（shared build / lint / typecheck / tests）のどれかが失敗すると、
   pre-push 末尾の parity gate に到達せず、parity 違反のまま push が成功する経路は無いものの、
   「parity gate がブロック源である」という UX メッセージがユーザーに届かない。
2. **設計判断の未決**: parity gate を先頭に配置すると「lint が通っていないのに parity で弾かれる」あるいは
   「shared build が壊れていても parity は通る」といった UX の違和感が生まれる。逆に末尾配置は
   「Phase 1 の遅延ビルドを待たされてから parity 違反に気付く」問題が残る。
3. **親タスクのクローズ条件外**: 親タスクでは AC-4 のロジック（drift 検出 → exit=1）充足を必達とし、
   配置順序の最適化は follow-up（Note-1）として切り出された。

### 1.3 放置した場合の影響

- parity drift をコミットした開発者が、`esbuild mismatch` や lint 失敗で pre-push が落ちた際に、
  「parity 違反」が同時に発生していることに気付かず、Phase 1 を修正した直後の push で改めて
  parity で弾かれる**二度手間**が発生し続ける。
- DX 悪化が蓄積すると、`--no-verify` 迂回の誘惑が強まる（プロジェクト規約で禁止されているが、慣習として
  risky）。

---

## 2. 何を達成するか（What）

### 2.1 目的

`.husky/pre-push` における parity gate の配置位置を、**DX と gate 確実性のバランス**を取れる位置に最適化する。

### 2.2 最終ゴール

- parity drift がある場合、pre-push のどの Phase が失敗していても、開発者が「parity 違反がある」ことを
  認識できる UX を実現する。
- parity gate 単体の実行コスト（約 0.3 秒）を活かし、push サイクル全体の feedback loop を悪化させない。

### 2.3 スコープ

**含む**:

- `.husky/pre-push` の Phase 順序の調整（案: parity を先頭に移す / 中間に入れる / 末尾維持＋サマリ出力強化）
- 各候補配置での pre-push 所要時間の実測と記録
- UX メッセージ（どの Phase で落ちたかの明示）強化
- `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` 配下への follow-up 記録追加

**含まない**:

- `verify-skills-parity.sh` 本体のロジック変更（drift 検出アルゴリズムは親タスクで完成済）
- `.agents/skills` / `.claude/skills` のファイル構造変更
- CI（GitHub Actions 側）の parity job 変更
- `sync-skills-mirror.sh` の修正

### 2.4 成果物

1. `.husky/pre-push` の更新（配置順序最適化 + コメント追記）
2. 計測ログ（markdown テーブル形式で 3 配置案 × 3 シナリオの所要時間を記録）
3. `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` 配下への follow-up 完了レポート

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の AC-4（parity gate の導入）が main にマージ済
- `.claude/scripts/verify-skills-parity.sh` が実行可能で 0.3 秒前後で完了すること
- `.husky/pre-push` が Phase 1（shared build）/ Phase 2（lint / typecheck）/ Phase 3（tests）/ parity の
  順序で構成されていること（親タスク完了時点の状態）

### 3.2 依存タスク

- `TASK-AGENTS-SKILLS-FULL-SYNC-001`（親、必達）

### 3.3 必要な知識

- husky pre-push の実行モデル（shebang / set -e / exit code 伝播）
- `.claude`（canonical）と `.agents`（mirror）の merge policy（親タスク参照）
- pnpm monorepo の shared build 失敗パターン（esbuild version mismatch の再現手順）
- `--no-verify` 禁止規約（`CLAUDE.md` 参照）

### 3.4 推奨アプローチ

parity gate の「実行コストが極めて軽い（0.3 秒）」性質を活かし、**fail-fast な配置を優先**する。
以下 3 案を実測し、最も UX が良いものを採用する：

#### 案 A: 先頭配置（parity → Phase 1 → 2 → 3）

- メリット: parity drift を最速で検出。Phase 1 の遅延ビルドを待たずに修正に取り掛かれる。
- デメリット: 「lint エラーがあるのに parity が先に報告される」UX 違和感。ただし parity は
  決定論的 diff なので順序依存性は低い。

#### 案 B: Phase 1 直後配置（Phase 1 → parity → Phase 2 → 3）

- メリット: shared build 通過後に parity を確認するため、「ビルドは通ったが構造が壊れている」という
  段階的な fail-fast を提供。
- デメリット: Phase 1 失敗時は parity 未到達のまま（現状と同じ問題が残る）。

#### 案 C: 末尾維持 + 全 Phase 実行（非 fail-fast）

- メリット: 全問題を一度に報告できる（`set +e` で各 Phase の exit を収集し末尾で最終 exit）。
- デメリット: pre-push 全体が必ず最後まで走るため、Phase 3（tests）を含めると push 一回あたり
  数十秒〜数分が追加される。規模的に現実的でない。

**推奨採用案**: **案 A**（先頭配置）。理由:

1. parity の実行コストが 0.3 秒で、先頭に置いても DX 劣化が無視できる
2. parity gate は「構造整合性」のチェックであり、lint / build より論理的に先行する層
3. Phase 1 で esbuild mismatch が起きても parity gate メッセージが先に出るため、
   「parity drift あり」が常にユーザーに届く

---

## 4. 実行手順（Phase 1-4）

### Phase 1: 現状計測（ベースライン）

1. `.husky/pre-push` の現行（末尾配置）をそのままに、意図的 drift ありの状態で `git push --dry-run` 相当を
   3 回実行し、所要時間と exit code を記録
2. シナリオを 3 種用意:
   - シナリオ α: parity drift のみ（Phase 1-3 は pass）
   - シナリオ β: parity drift + esbuild mismatch（現状の Note-1 再現）
   - シナリオ γ: parity drift + lint error
3. 各シナリオの「最初に出力された失敗メッセージ」を記録

### Phase 2: 案 A / B の試作と計測

1. `.husky/pre-push` に案 A（先頭配置）を適用し Phase 1 と同じ 3 シナリオで計測
2. `.husky/pre-push` に案 B（Phase 1 直後）を適用し Phase 1 と同じ 3 シナリオで計測
3. 計測結果を markdown テーブルにまとめ、採用案を決定
4. 決定した案のみを最終反映（他案は diff を破棄）

### Phase 3: UX メッセージ強化

1. parity gate 実行時に「`.claude` / `.agents` skill parity check」という明示的な見出しを先頭に出力
2. 失敗時は「fix: run `bash .claude/scripts/sync-skills-mirror.sh`」を案内
3. Phase 1 / 2 / 3 各段階にも Phase 名の見出しを追加し、どこで落ちたかを明確化

### Phase 4: 検証と follow-up クローズ

1. Phase 2 の採用案で 3 シナリオを再度実測し、すべてで parity 違反が検知できることを確認
2. 意図的 drift なしの状態で 3 回 push を試み、false positive が無いことを確認
3. `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` 配下に「Note-1 resolved」レポートを追加
4. 親タスク側の `discovered-issues.md` に本タスク ID と解決ステータスを追記

---

## 5. 完了条件チェックリスト

- [ ] `.husky/pre-push` で採用案（推奨: 案 A）が反映されている
- [ ] 案 A / B / 現状（末尾）の計測結果が markdown テーブルで残っている
- [ ] 3 シナリオ（α parity-only / β parity + build / γ parity + lint）すべてで parity 違反メッセージが
      ユーザーに届くことを実測で確認
- [ ] 意図的 drift なしでの pre-push が従来より遅延していない（parity 0.3 秒以内の追加のみ）
- [ ] `--no-verify` を使わずに検証が完結している
- [ ] `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` 配下に follow-up レポートが置かれている
- [ ] 親タスクの `discovered-issues.md` Note-1 が解決済ステータスに更新されている
- [ ] `pnpm lint` / `pnpm typecheck` が pass する
- [ ] pre-commit hook（lint-staged）と pre-push hook が pass する

---

## 6. 検証方法

### 6.1 所要時間計測

```
time git push --dry-run origin <branch>
```

または husky を直接:

```
time bash .husky/pre-push
```

を 3 回実行し平均を取る。

### 6.2 シナリオ作成手順

- **シナリオ α (parity drift only)**: `.agents/skills/<任意>/SKILL.md` を意図的に 1 行編集（canonical は
  変更しない）。Phase 1-3 は green。
- **シナリオ β (parity + build fail)**: α に加え、`packages/shared` の依存を一時的に破壊（例:
  `pnpm-lock.yaml` の esbuild version を微変更）。
- **シナリオ γ (parity + lint error)**: α に加え、任意の `.ts` に未使用 import を混入。

計測後は `git restore` で戻すこと。

### 6.3 期待結果

| シナリオ         | 末尾配置（現状）                   | 案 A（先頭）         | 案 B（Phase 1 直後）           |
| ---------------- | ---------------------------------- | -------------------- | ------------------------------ |
| α parity-only    | parity で exit=1                   | parity で exit=1     | parity で exit=1               |
| β parity + build | **build で exit=1（parity 不達）** | **parity で exit=1** | build で exit=1（parity 不達） |
| γ parity + lint  | lint で exit=1（parity 不達）      | **parity で exit=1** | lint で exit=1（parity 不達）  |

案 A は全シナリオで parity メッセージがユーザーに届くため UX 上優位と判断できる。

---

## 7. リスクと対策

| リスク                                                        | 対策                                                                                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 先頭配置で「lint が通っていないのに parity で弾かれる」違和感 | UX メッセージに「parity は構造整合性チェックであり lint とは独立」を明示                                              |
| parity gate 自身のバグで false positive                       | `verify-skills-parity.sh` は親タスクで完成済のため本タスクでは触らない。触りたくなった場合は scope out して別タスク化 |
| pre-push 全体のタイムアウト増加                               | parity 0.3 秒なので無視できるが、計測で実証                                                                           |
| husky の shebang / set -e 挙動で意図しない早期 exit           | 採用案反映後に「drift なし」条件で 3 回 green を確認                                                                  |
| `--no-verify` 迂回の誘惑                                      | CLAUDE.md 禁止ルールを再掲し、メッセージに `sync-skills-mirror.sh` ワンコマンドで fix できる旨を明示                  |

---

## 8. 参照情報

- 親タスク: `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`
- 親タスク discovered-issues: `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/` 配下の `discovered-issues.md`
- 実装対象: `.husky/pre-push`
- 実行スクリプト（read-only 参照）: `.claude/scripts/verify-skills-parity.sh`
- mirror 同期スクリプト（参考）: `.claude/scripts/sync-skills-mirror.sh`
- プロジェクト規約: `CLAUDE.md`（`--no-verify` 禁止、pnpm 必須）

---

## 9. 苦戦箇所セクション（必須・詳細）

親タスク `TASK-AGENTS-SKILLS-FULL-SYNC-001` の Phase 11 実装で実測した知見を記録する。本 follow-up タスクの
担当者は、以下の「既に見えている落とし穴」を踏み直さないこと。

### 9.1 parity gate 配置のトレードオフ（中核論点）

本タスク最大の悩みどころは、parity gate を pre-push の **どの位置に置くか** の設計判断である。

- **先頭配置の利点**: parity gate は 0.3 秒と軽量で、構造整合性（`.claude` / `.agents` の完全一致）は
  lint / build / test よりも論理的に先行する層である。drift があれば最速で検出できる。
- **先頭配置の欠点**: 「lint が通ったのに parity で弾かれる」という UX 体験。ただしこの違和感は
  「parity は別レイヤのチェック」というメッセージング次第で解消できる。
- **末尾配置の利点**: 「コードが全て pass した後の最終ゲート」という直感的な位置付け。
- **末尾配置の欠点**: 親タスク Phase 11 で実際に踏んだ **Phase 1 failure（esbuild mismatch）で parity に
  到達しない** ケースが発生する。parity drift があっても UX 上「parity で落ちた」メッセージが出ない。

### 9.2 「UX 最速失敗優先」 vs 「parity 完全ブロック」

**前提**: parity drift 自体は、末尾配置でも push を通さない（他 Phase が pass すれば末尾で落ちる）ため、
「parity を素通しする」ことは無い。本質的な論点は UX であって、セキュリティ/ガードレール強度では無い。

- 「UX 最速失敗優先」= 開発者が最短で「parity 違反あり」と気付ける
- 「parity 完全ブロック」= 他 Phase の pass 状態に関わらず parity を最終判定する

→ 本タスクでは「UX 最速失敗優先」を採用する（案 A）。「parity 完全ブロック」は末尾配置でも担保されるため、
両立可能と判断する。

### 9.3 既存 Phase 1/2/3 構成との順序干渉

親タスク完了時点で `.husky/pre-push` は以下の構成:

- Phase 1: shared build（`pnpm --filter @repo/shared build` など）
- Phase 2: lint / typecheck（`pnpm lint`, `pnpm typecheck`）
- Phase 3: tests（`pnpm vitest run` など）
- Phase 4 (新設): parity gate

parity gate を先頭（Phase 0 相当）に移す際、以下に注意:

1. **shebang / `set -e` の扱い**: 既存 pre-push が `set -e` を使っていれば、parity が exit=1 を返した
   瞬間に以降が実行されないので他 Phase への影響なし。
2. **environment 依存**: parity gate は node_modules 不要（pure shell + diff）なので Phase 1 以前でも動く。
3. **並列化しない**: 計測結果次第だが、0.3 秒を並列化しても利益が小さく、bash の並列制御でバグ混入リスクが
   上回る。直列維持。

### 9.4 `--no-verify` 禁止規約との整合

`CLAUDE.md` で `git commit --no-verify` / `git push --no-verify` が **絶対禁止** と明記されている。
parity gate が過度に厳しくなると `--no-verify` の誘惑が生まれるが、本タスクでは:

- parity gate は **0.3 秒** で、失敗時の fix は `bash .claude/scripts/sync-skills-mirror.sh` ワンコマンド
- false positive の可能性が低い（決定論的 diff）
- 失敗メッセージに fix コマンドを明示する（Phase 3 の UX 強化タスク）

ことで、`--no-verify` 迂回の心理的コストを低く保つ。なお本タスク自体の検証でも `--no-verify` は使わない
こと（計測は `bash .husky/pre-push` 直接実行または dry-run で行う）。

### 9.5 親タスク Phase 11 での isolated 実測の意義

親タスクでは「full pre-push 経由で parity が exit=1 するか」の検証で Phase 1 failure に阻まれたが、
`bash .claude/scripts/verify-skills-parity.sh` 単独実行で exit=1 を確認し、AC-4 のロジック要件を
充足とみなしてクローズした。本タスク担当者は、**isolated 実測は AC-4 の担保にはなるが UX の担保には
ならない** ことを理解した上で、配置順序の意思決定をすること。

### 9.6 計測時の環境汚染に注意

- `packages/shared` を破壊してシナリオ β を再現する際、`pnpm-lock.yaml` を編集する場合は必ず
  `git restore pnpm-lock.yaml` で戻すこと。
- `.claude/skills` / `.agents/skills` を編集してシナリオ α を作る際も同様。
- worktree を汚染すると後続の typecheck / test が連鎖失敗して計測が狂う。

### 9.7 成果物の粒度

本タスクは小規模（1-2 時間）であるため、成果物はシンプルに:

- `.husky/pre-push` の diff（配置順序変更 + コメント）
- 計測結果 markdown（1 ファイル、テーブル 1 つで十分）
- follow-up resolved レポート（短文で OK）

過剰なドキュメント化は避ける。親タスクの `discovered-issues.md` に 1 行で「Note-1 resolved by
`task-skills-parity-prepush-precedence-001`」と追記すれば十分。

---

## 10. 補足: 用語整理（中学生レベル説明）

- **parity（パリティ）**: 「まったく同じ」ことを確認する仕組み。このプロジェクトでは `.claude/skills` と
  `.agents/skills` の中身が完全一致しているかをチェックする。
- **canonical と mirror**: 元データ（canonical = `.claude`）と複製（mirror = `.agents`）。本物と写しが
  ずれていないかを監視する。
- **pre-push フック**: `git push` を押した直後、実際にリモートへ送る前に自動実行されるチェックリスト。
  ここで失敗すると push がキャンセルされる。
- **fail-fast**: 問題を早めに見つけて早めに止めること。時間を無駄にしないためのテスト戦略。
- **drift（ドリフト）**: 本物と写しが少しずつずれていくこと。放っておくと大きな問題になる。
