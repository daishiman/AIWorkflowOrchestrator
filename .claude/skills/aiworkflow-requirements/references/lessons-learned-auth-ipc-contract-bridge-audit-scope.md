# Lessons Learned（教訓集） / auth / ipc lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: auth / ipc lessons

## UT-FIX-SKILL-EXECUTE-INTERFACE-001: skill:execute IPC契約ブリッジ

### 苦戦箇所: 正式契約（skillName）と後方互換（skillId）の同時維持

| 項目 | 内容                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------- |
| 課題 | shared/preload は `skillName`、Main は `skillId` で処理しており、片側だけ直すと既存呼び出しを壊す |
| 原因 | 契約変更を「単一正解への即時置換」で進め、移行期間の両立設計を先に定義していなかった              |
| 対処 | Mainハンドラで union受理し、`skillName` は正式経路・`skillId` は後方互換経路として分岐実装        |
| 教訓 | IPC契約修正は「正式契約 + 互換契約 + 廃止条件」を同時に仕様化しないと再発する                     |

### 苦戦箇所: `skillName -> skillId` 変換の責務配置

| 項目 | 内容                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 課題 | `SkillService.executeSkill()` が `skillId` 前提のため、Preload契約をそのまま渡すと検索失敗リスクがある |
| 原因 | 境界変換（Adapter）をどの層で行うか未確定のまま修正を開始した                                          |
| 対処 | Mainハンドラ境界で `scanAvailableSkills()` により `name -> id` を解決し、Service APIは据え置き         |
| 教訓 | 既存Serviceを維持する段階移行では「境界での変換」が最小リスクになる                                    |

### 苦戦箇所: 新旧契約テストの取りこぼし

| 項目 | 内容                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| 課題 | 新契約テストを追加すると、旧契約回帰が欠落しやすい                            |
| 原因 | 正常系の1経路のみで検証し、互換経路の異常系を同時設計していなかった           |
| 対処 | `execute` / `validation` / `delegate` の3テストで新旧両契約を同時検証         |
| 教訓 | 互換維持タスクは「新旧2経路 x 正常/異常」の最小マトリクスを完了条件に固定する |

### 苦戦箇所: 仕様書同期を単独進行すると更新漏れが発生

| 項目 | 内容                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| 課題 | `interfaces` 更新後に `security`/`task-workflow`/`lessons` の追記順序がずれ、証跡同期が遅延した            |
| 原因 | 仕様書ごとの責務分担を先に固定せず、単一担当で順次更新した                                                 |
| 対処 | 仕様書別 SubAgent（A: interfaces / B: security / C: task-workflow / D: lessons）を固定し、同一ターンで同期 |
| 教訓 | IPC契約修正は「コード更新」ではなく「仕様同期オーケストレーション」として扱うと漏れが減る                  |

### 同種課題の簡潔解決手順（4ステップ）

1. shared/preload/Main の引数契約を一覧化し、正式契約と互換契約を明示する。
2. 境界層に `name -> id` などの変換Adapterを置き、ドメイン層APIは段階的に移行する。
3. 新旧契約の正常系/異常系テストを同じターンで追加する。
4. `interfaces-agent-sdk-skill.md` / `security-skill-ipc.md` / `task-workflow.md` を同時更新する。

## TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001: IPC契約同期オーケストレーション

### 苦戦箇所: child companion の同時更新が抜けると current canonical set が崩れる

| 項目 | 内容 |
| ---- | ---- |
| 課題 | `interfaces` / `security` / `architecture` / `task-workflow` / `lessons` を別タイミングで更新すると、参照先の正本が分裂する |
| 原因 | 仕様書をファイル単位で見てしまい、child companion 群を1セットとして扱っていなかった |
| 対処 | current canonical set を先に固定し、object payload 標準（`{ skillId }`, `{ skillName, updates }`）を同時反映する |
| 教訓 | IPC契約修正はコード変更ではなく「仕様同期オーケストレーション」として扱うと漏れが減る |

### 同種課題の簡潔解決手順（4ステップ）

1. current canonical set を `interfaces-agent-sdk-skill-core.md` / `interfaces-agent-sdk-skill-details.md` / `security-skill-ipc-core.md` / `security-electron-ipc-core.md` / `architecture-overview-core.md` / `task-workflow-completed-ipc-contract-preload-alignment.md` で固定する。
2. `skill:get-detail` は `{ skillId }` + `safeInvokeUnwrap`、`skill:update` は `{ skillName, updates }` + `safeInvokeUnwrap` で統一する。
3. `interfaces` / `security` / `task-workflow` / `lessons` を同一ターンで更新し、SubAgent の責務境界を崩さない。
4. Phase 12 相当の再監査では、成果物実体・台帳同期・index再生成をセットで確認する。

---

## UT-IPC-AUTH-HANDLE-DUPLICATE-001: AUTH IPC登録一元化

### 苦戦箇所: 通常経路とfallback経路の片側のみを整理すると監査ノイズが残る

| 項目 | 内容                                                                         |
| ---- | ---------------------------------------------------------------------------- |
| 課題 | `authHandlers.ts` のみ一元化すると `ipc/index.ts` fallback側に同型重複が残る |
| 原因 | 監査観点を通常経路に限定し、非Supabase経路を同時対象化していなかった         |
| 対処 | 通常経路・fallback経路の両方を宣言的登録へ統一し、同時に回帰テストを追加     |
| 教訓 | AUTH系は「通常 + fallback」を1セットで扱わないと再発監査でノイズが残る       |

### 同種課題の簡潔解決手順（3ステップ）

1. `AUTH_*` の登録点を通常経路とfallback経路で同時列挙する
2. 両経路を配列/マップ化し、`ipcMain.handle` 直接重複を排除する
3. `rg -n \"ipcMain\\.handle\\(\\s*IPC_CHANNELS\\.AUTH_\"` が0件であることを回帰テストと合わせて確認する

### 苦戦箇所: 全体監査FAILと今回差分FAILの混同

| 項目 | 内容                                                                                      |
| ---- | ----------------------------------------------------------------------------------------- |
| 課題 | `audit-unassigned-tasks.js` の既存baseline違反を、今回変更差分の失敗と誤認しやすい        |
| 原因 | 全体監査（資産健全性）と対象監査（今回差分）を同じ判定軸で扱っていた                      |
| 対処 | `detect-unassigned-tasks --scan <変更ディレクトリ>` を併用し、current/baseline を分離判定 |
| 教訓 | Phase 12 では「全体監査結果」と「今回差分起因」の両方を同時記録する                       |

### 同種課題の簡潔解決手順（4ステップ・再監査版）

1. `audit-unassigned-tasks.js` で baseline 健全性を確認する
2. `detect-unassigned-tasks --scan <変更範囲>` で current 差分を抽出する
3. `unassigned-task-detection.md` に baseline/current を分けて記録する
4. 完了移管した未タスク参照は `completed-tasks/` 側へ同期更新する

### 同種課題の即時実行テンプレート（20分版）

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| 目的     | AUTH系IPCの重複登録と監査誤判定を1回の修正サイクルで解消する |
| 前提     | 通常経路とfallback経路を同時に編集対象へ含める               |
| 成功条件 | 実装重複0件、回帰テストPASS、仕様/台帳/リンク整合PASS        |

| Step | 実施内容                                 | 成果物/証跡                                       |
| ---- | ---------------------------------------- | ------------------------------------------------- |
| 1    | 通常/fallbackのAUTH 5チャネルを同時列挙  | 変更対象リスト                                    |
| 2    | 共通登録ヘルパー + 配列/ループ登録へ統一 | 差分（`authHandlers.ts`, `index.ts`）             |
| 3    | baseline/current監査を分離して記録       | `unassigned-task-detection.md`                    |
| 4    | 仕様書/台帳/リンクを同一ターンで同期     | `task-workflow.md`, `verify-unassigned-links.log` |

| 失敗しやすい点                                          | 回避策                                               |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `audit-unassigned-tasks` のFAILだけで差分FAILと判断する | `detect-unassigned-tasks --scan` を必ず併記して判定  |
| 参照更新を後回しにしてリンク切れを残す                  | 完了移管と同時に `verify-unassigned-links.js` を実行 |
| 通常経路のみ修正してfallback経路を見落とす              | Step 1で対象チャネルを2経路で明示チェック            |

## UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001: 未タスク監査の scope 分離

### 苦戦箇所: 全体監査結果を今回差分の失敗と誤読しやすい

| 項目 | 内容                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------ |
| 課題 | `audit-unassigned-tasks.js --json` は既存違反を含むため、今回変更が無違反でも fail になる        |
| 原因 | current（今回差分）と baseline（既存資産）を同一判定軸で扱っていた                               |
| 対処 | `--target-file` / `--diff-from` で current を抽出し、scope未指定実行は baseline 監視として別記録 |
| 教訓 | Phase 12 は「対象監査 → 全体監査」の順序を固定すると誤判定が減る                                 |

### 苦戦箇所: 完了済み未タスク指示書の移管漏れ

| 項目 | 内容                                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| 課題 | 完了後も `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に残置すると台帳と実体がずれる         |
| 原因 | 完了記録（task-workflow更新）と物理移管（completed-tasks移動）が別ターンになりやすい |
| 対処 | 完了反映時に「行更新・物理移動・リンク検証」を同一ターンで実施                       |
| 教訓 | Step 1-B/1-E は台帳更新だけでなくファイル配置整合まで含めて完了判定する              |

### 同種課題の簡潔解決手順（5ステップ）

1. `audit-unassigned-tasks.js --json --target-file <path>` で current 合否を先に確定する
2. `audit-unassigned-tasks.js --json --diff-from <ref>` で差分対象を再確認する
3. `audit-unassigned-tasks.js --json` を実行し baseline 健全性を別記録する
4. 完了した未タスク指示書を `completed-tasks/unassigned-task/` に移管し、`task-workflow.md` を同期更新する
5. `verify-unassigned-links.js` で参照整合を機械検証する

### 苦戦箇所: Phase 12 証跡はPASSでも台帳未同期が残りやすい

| 項目 | 内容                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------- |
| 課題 | rerunログが増えると、`artifacts.json` と `outputs/artifacts.json` の更新漏れが再発しやすい         |
| 原因 | 検証PASSで完了した気になり、台帳同期と index 再生成を後回しにしやすい                              |
| 対処 | `complete-phase` 実行後に `generate-index --regenerate` と `artifacts.json` 同期を同一ターンで固定 |
| 教訓 | Phase 12 の完了判定は「検証PASS + 台帳同期 + index同期」の3点セットで扱う                          |

### 苦戦箇所: quick_validate 実行経路の混同

| 項目 | 内容                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| 課題 | リポジトリ側スクリプトと system skill 側スクリプトを混同し、検証手順がぶれやすい  |
| 原因 | 呼び出し経路（ローカル相対パス / 外部スキル絶対パス）を統一していなかった         |
| 対処 | Phase 12 の構造検証は `skill-creator` の `quick_validate.js` を正本手順として固定 |
| 教訓 | 「どのスキルのどのスクリプトを使うか」を仕様書に絶対パスで明記する                |

### 苦戦箇所: verify-all-specs の `--workflow` 引数漏れ

| 項目 | 内容                                                                  |
| ---- | --------------------------------------------------------------------- |
| 課題 | `verify-all-specs.js --strict` だけを実行すると必須引数不足で失敗する |
| 原因 | workflow対象を暗黙解決できる前提でコマンドを短縮していた              |
| 対処 | `--workflow docs/30-workflows/<task-id>` を必須で付与する形に統一     |
| 教訓 | strict検証は「対象指定 + strict」の2要素を1セットで記述する           |

### 苦戦箇所: `audit-unassigned-tasks --target-file` の出力解釈ミス

| 項目 | 内容                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------- |
| 課題 | `--target-file` を指定しても baseline 一覧が同時に出るため、「対象ファイルにも違反がある」と誤読しやすい |
| 原因 | この監査は「対象だけ表示」ではなく「対象=current、その他=baseline」に分類する仕様だった                  |
| 対処 | `scope.currentFiles` と `currentViolations.total` を判定の正本に固定し、baseline は別管理として記録      |
| 教訓 | scoped監査は「表示件数」ではなく「current件数」で合否判定する                                            |

### 苦戦箇所: `validate-phase-output` の引数誤用

| 項目 | 内容                                                                            |
| ---- | ------------------------------------------------------------------------------- |
| 課題 | `--phase` オプション形式を想定し、コマンド実行に失敗しやすい                    |
| 原因 | `verify-all-specs` と同じ引数形式だと誤認していた                               |
| 対処 | `validate-phase-output.js <workflow-dir>` の位置引数形式に統一                  |
| 教訓 | Phase検証コマンドは「ファイルごとの引数仕様差分」をテンプレート化して再利用する |

### 同種課題の簡潔解決手順（7ステップ・再確認版）

1. `audit-unassigned-tasks.js --json --target-file <path>` で current 合否を先に確定する
2. `audit-unassigned-tasks.js --json` を実行し baseline 健全性を分離記録する
3. `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js <skill-dir>` を実行する
4. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-path> --strict` を実行する
5. `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-path>` を位置引数で実行する
6. `--target-file` 結果は `currentViolations.total` を正本に判定し、baseline と混同しない
7. `complete-phase` 後に `generate-index --regenerate` と `artifacts.json` 同期を同一ターンで完了する

## UT-UI-THEME-DYNAMIC-SWITCH-001: settingsSlice テーマ動的切替対応

### 苦戦箇所: `themeMode` と `resolvedTheme` の責務分離

| 項目 | 内容                                                                                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------------- |
| 課題 | `system` モード時に保存値（`themeMode`）と適用値（`resolvedTheme`）を同じ状態として扱うと、OS追従と手動切替が競合しやすい |
| 原因 | 「ユーザー選択値」と「実解決テーマ」の責務分離が設計上明文化されていなかった                                              |
| 対処 | stateを2軸化し、SSOTを `themeMode` に固定。`resolvedTheme` は `system` 時の解決値としてのみ更新                           |
| 教訓 | テーマ設計は「選択モード」と「適用テーマ」を分離しないと競合バグが再発する                                                |

### 苦戦箇所: Store Hook依存による再実行ループ

| 項目 | 内容                                                                                         |
| ---- | -------------------------------------------------------------------------------------------- |
| 課題 | テーマ反映の `useEffect` が依存参照の不安定性で再実行され続けるリスクがあった                |
| 原因 | 合成Store Hookの返す参照が毎回変わる構造で依存配列に乗っていた                               |
| 対処 | `useThemeMode` / `useResolvedTheme` / `useSetThemeMode` の個別セレクタへ分離して参照を安定化 |
| 教訓 | Zustand連携のUI副作用は合成Hookを避け、個別セレクタを前提に設計する                          |

### 苦戦箇所: Phase 12成果物と仕様書本体の同期漏れ

| 項目 | 内容                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| 課題 | `outputs/phase-12` が揃っていても `phase-12-documentation.md` のチェック欄が未更新で残り、監査で不整合になりやすい |
| 原因 | 実体成果物の存在確認で完了扱いにし、仕様書本体の実行記録更新が後回しになっていた                                   |
| 対処 | Task 1〜5の証跡を `phase12-task-spec-compliance-check.md` で突合し、同一ターンでチェック欄同期                     |
| 教訓 | Phase 12完了判定は「成果物実体 + 実行記録更新」をセットで扱う                                                      |

### 同種課題の簡潔解決手順（4ステップ）

1. `themeMode`（選択値）と `resolvedTheme`（解決値）を状態設計で明示分離する
2. UI副作用を持つ箇所は個別セレクタHookで依存を安定化する
3. Phase 12では `outputs/phase-12/*` と `phase-12-documentation.md` を1対1で突合する
4. `verify-all-specs --workflow --strict` と `verify-unassigned-links.js` の結果を同一レポートに固定する

### 同種課題向け転記テンプレート（5分版）

| 項目       | 書き方                                                                                 |
| ---------- | -------------------------------------------------------------------------------------- |
| 実装内容   | 「何を」「どこを」「なぜ」を2行以内で記載                                              |
| 苦戦箇所   | 「課題」「原因」「対処」「再発条件」を1行ずつ記載                                      |
| 再利用手順 | 4ステップ以内で、そのまま次タスクで実行できる粒度にする                                |
| 仕様反映先 | `task-workflow.md` / `ui-ux-design-system.md` / `lessons-learned.md` を同時更新する    |
| 検証       | `verify-all-specs --workflow --strict` / `verify-unassigned-links.js` の結果を記録する |

---

## TASK-9A-skill-editor: Phase 12再確認（2026-02-26）

### 苦戦箇所1: 実装ガイドのPart 1/Part 2要件不足

| 項目 | 内容                                                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 課題 | `implementation-guide.md` が短すぎて、Part 1（理由先行・日常例え）と Part 2（型/API/エラー/境界条件）の必須要件を満たしきれなかった |
| 原因 | 実装事実の要約を優先し、読者別要件チェックを後回しにした                                                                            |
| 対処 | Part 1/Part 2 の固定テンプレートを適用し、必須要件を項目ごとに再点検した                                                            |
| 教訓 | Phase 12 Task 1 は「文章量」ではなく「要件カバレッジ」で判定する                                                                    |

### 苦戦箇所2: `audit-unassigned-tasks --target-file` の出力誤読

| 項目 | 内容                                                                                               |
| ---- | -------------------------------------------------------------------------------------------------- |
| 課題 | `--target-file` でも baseline が同時出力されるため、対象違反があるように見えて判断がぶれた         |
| 原因 | 表示結果をフィルタ出力と誤認し、分類出力（current/baseline）として読めていなかった                 |
| 対処 | 合否を `currentViolations.total` 固定に変更し、`baselineViolations.total` は監視値として別記録した |
| 教訓 | 未タスク監査は「current判定」と「baseline監視」を常に分離する                                      |

### 苦戦箇所3: 未タスク指示書のメタ情報重複

| 項目 | 内容                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| 課題 | `task-9a-c-syntax-highlighting.md` と `task-9a-c-code-editor-migration.md` で `## メタ情報` が二重になった |
| 原因 | YAMLブロックと表ブロックを別セクションで追記した                                                           |
| 対処 | `## メタ情報` を1回に統一し、同一セクション内で管理する形に修正した                                        |
| 教訓 | 未タスク指示書はメタ情報の重複定義を禁止し、1セクション原則で運用する                                      |

### 同種課題の簡潔解決手順（4ステップ）

1. 実装ガイドを Part 1/Part 2 の必須要件チェックでレビューしてから完了扱いにする。
2. `audit-unassigned-tasks` は `current` と `baseline` を分離して記録する。
3. 未タスク指示書のメタ情報は1セクション運用に固定する。
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` を同ターンで再実行する。

---

## TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 教訓（2026-03-19）

- P42準拠3段バリデーション（型→空文字→trim）は既存ハンドラと同一パターンのため実装コストが低い
- object payload統一（P44対策）: `{ skillName, updates }` でMain/Preload間の引数ドリフトを防止
- P45命名統一: 設計段階でgetDetail=skillId、update=skillNameを確定しておくと実装時の迷いがない
- Preload層早期拒否パターン: invoke前にバリデーションすることでMain Processの不要な処理を防止

### P64: 大規模ファイルのカバレッジ計測における新規コード評価

| 項目 | 内容 |
| ---- | ---- |
| 課題 | skillHandlers.ts（1500行超）のような大規模ファイルでは、新規追加コードのみのテストではファイル全体のLine/Function Coverageが極端に低く見える（14.91%/38.04%） |
| 原因 | カバレッジ計測がファイル全体を対象とするため、既存の未テストコードが分母に含まれてしまう |
| 対処 | `grep -n` で追加行を特定し、カバレッジレポートのUncovered Line #sと照合して新規コード部分のみを評価した（Branch Coverage 87.5%/94.11%を確認） |
| 教訓 | Phase 7 カバレッジ確認では「ファイル全体」ではなく「新規追加コード部分」のBranch Coverageを評価基準とする |

### P65: IPC 4層整合性チェック（デッドチャンネル防止）

| 項目 | 内容 |
| ---- | ---- |
| 課題 | SKILL_UPDATE チャンネルが channels.ts に定義されていたが ipcMain.handle 未登録のため、Renderer から呼び出しても応答が返らない「デッドチャンネル」状態だった |
| 原因 | チャンネル定数・ホワイトリスト・Main ハンドラ・Preload API の4層のうち、1層でも欠けると通信が成立しない構造を見落としていた |
| 対処 | MECE分析で4層を全て列挙し、SKILL_UPDATE は Main ハンドラ追加 + unregister 追加、SKILL_GET_DETAIL は Preload API 追加で整合を取った |
| 教訓 | 新規IPCチャンネル追加・既存チャンネル監査では「チャンネル定数 → ホワイトリスト → Main ハンドラ → Preload API」の4層チェックリストを必ず実施する |

### 同種課題の簡潔解決手順（4ステップ）

1. `grep -rn "IPC_CHANNELS\." apps/desktop/src/` で全チャンネル参照を洗い出し、4層それぞれの有無をMECE表で確認する。
2. 欠損層を特定したら、チャンネル定数・ホワイトリスト・Main ハンドラ・Preload API を同一コミットで揃える。
3. 大規模ファイルへの追加実装のカバレッジ確認は、追加行の範囲を `grep -n` で特定しBranch Coverageのみを評価する。
4. テスト追加後は `pnpm --filter @repo/desktop test` で回帰テストをPASS確認する。

---
