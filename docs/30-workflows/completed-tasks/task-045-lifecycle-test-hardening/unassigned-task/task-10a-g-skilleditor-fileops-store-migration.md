# SkillEditor.tsx ファイル操作系 direct IPC の Store 移行 - タスク指示書

## メタ情報

```yaml
issue_number: 1100
```

| 項目         | 内容                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| タスクID     | TASK-10A-G-SKILLEDITOR-FILEOPS-STORE-MIGRATION                                         |
| タスク名     | SkillEditor.tsx ファイル操作系 direct IPC の Store 移行                                |
| 分類         | 改善                                                                                   |
| 対象機能     | スキルエディタ・ファイル操作                                                           |
| 優先度       | 中                                                                                     |
| 見積もり規模 | 中規模                                                                                 |
| ステータス   | 未実施                                                                                 |
| 発見元       | TASK-10A-F / TASK-10A-G Phase 12                                                       |
| 発見日       | 2026-03-09                                                                             |
| 配置先       | `docs/30-workflows/completed-tasks/task-045-lifecycle-test-hardening/unassigned-task/` |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F で SkillCreateWizard / SkillAnalysisView のライフサイクル系 API は Store 個別セレクタへ移行済みです。一方で `SkillEditor.tsx` にはファイル操作系の `window.electronAPI?.skill.*` 直接呼び出しが残っており、SkillEditor だけが旧パターンのまま取り残されています。

TASK-10A-G の再監査では tests-hardening 自体は完了しましたが、open backlog として継続利用している本タスク指示書が旧テンプレートのままだと、次回着手時に「何をどこまで直すか」が再び曖昧になります。未タスク自体も再利用可能な仕様に保つ必要があります。

### 1.2 現在の問題

- UI コンポーネントが IPC 契約詳細に直接依存している
- ハンドラごとに try/catch と `setError` が分散し、状態管理が統一されていない
- テストで `window.electronAPI` の直接モックが必要になり、Store 境界の検証がしにくい
- ライフサイクル系・インポート系は Store 移行済みなのに、ファイル操作系だけ設計方針が揃っていない

### 1.3 放置した場合の影響

- preload / IPC 契約変更が SkillEditor に直接波及する
- file operation ごとのエラー処理やローディング制御がコンポーネントへ増殖する
- 後続開発者が SkillEditor を参照し、direct IPC パターンを再導入しやすくなる
- TASK-10A-E-C / TASK-10A-F と整合しない状態が残り、system spec と実装の一貫性が崩れる

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillEditor.tsx` 内のファイル操作系 direct IPC を Store action + 個別セレクタへ移行し、Skill 系 UI の契約境界を統一します。

### 2.2 完了イメージ

- `SkillEditor.tsx` から file operation 系の `window.electronAPI?.skill.*` 直接呼び出しが 0 件
- `readFile` / `writeFile` / `listBackups` / `createFile` / `deleteFile` / `restoreBackup` が Store action 経由で実行される
- `store/index.ts` から安定参照の個別セレクタを取得できる
- 対象テスト、型チェック、必要な画面検証が PASS する

### 2.3 スコープ

#### 含む

- `SkillEditor.tsx` の 6 箇所の direct IPC 移行
- `agentSlice` または専用 slice への action 追加
- `store/index.ts` への個別セレクタ追加
- 対象テストの追加・更新
- Phase 12 の成果物と system spec 同期

#### 含まない

- SkillEditor の大規模 UI 再設計
- ライフサイクル系 API の再改修
- インポート系 API の再改修
- Store 全体の slice 再分割

### 2.4 成果物

| 成果物                  | 説明                                    |
| ----------------------- | --------------------------------------- |
| `SkillEditor.tsx` 更新  | direct IPC を Store 利用へ置換          |
| Store action / selector | file operation 系 action と個別セレクタ |
| テスト更新              | 対象操作の回帰と参照安定性確認          |
| Phase 成果物            | Phase 1-12 の標準成果物更新             |
| system spec 追記        | 実装内容と苦戦箇所の資産化              |

---

## 3. どのように実行するか（How）

### 3.1 技術方針

`architecture-implementation-patterns.md` の S26 を正本とし、UI から IPC 詳細を隠蔽します。実装の主軸は次の 4 点です。

1. Store 側に file operation action を定義する
2. 個別セレクタで安定参照を公開する
3. `SkillEditor.tsx` は action 呼び出しだけを持つ
4. 共有状態と UI 一時状態の境界を崩さない

### 3.2 移行対象 API

| API             | 用途                 | 現在の呼び出し元      |
| --------------- | -------------------- | --------------------- |
| `readFile`      | ファイル内容読込     | `loadFile`            |
| `writeFile`     | ファイル保存         | `saveCurrentFile`     |
| `listBackups`   | バックアップ一覧取得 | `refreshBackups`      |
| `createFile`    | 新規ファイル作成     | `handleCreateFile`    |
| `deleteFile`    | ファイル削除         | `handleDeleteFile`    |
| `restoreBackup` | バックアップ復元     | `handleRestoreBackup` |

### 3.3 状態配置

| 状態                                 | 配置先                               | 判断理由                         |
| ------------------------------------ | ------------------------------------ | -------------------------------- |
| file operation action                | Store                                | IPC 契約隠蔽とテスト容易性を優先 |
| backups / backup loading             | Store                                | 共有状態として再利用余地がある   |
| `selectedPath` / `buffers`           | local state                          | SkillEditor 固有の UI 一時状態   |
| `loadingPath` / `isSaving` / `error` | local state を基本、必要時のみ Store | 一時表示中心で共有要求が弱い     |

### 3.4 実装時の設計ルール

- 文字列引数は Store action 内で 3 段バリデーションを行う
- 配列や派生配列を返すセレクタは `useShallow` 要否を確認する
- `window.electronAPI` 直接参照は UI から排除し、Store のみが触る
- テストは `apps/desktop` 直下で対象ファイルを限定実行する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                               | 発見経緯                                              | 解決策                                                                                                       | 教訓                                                       |
| ------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ----------- | ---------- | ---------- | -------------------------------------- | ------------------------------------------ |
| 既実装確認をせず新規実装モードで進めやすい                         | TASK-10A-F / TASK-10A-G 再監査で P50 が再発しかけた   | Phase 1 開始前に `rg "readFile                                                                               | writeFile                                                  | listBackups | createFile | deleteFile | restoreBackup"` で現状を先に棚卸しする | まず差分を固定し、実装か検証補完かを決める |
| テストを repo root で実行すると環境差で失敗しやすい                | TASK-10A-F で P40 が再発                              | `cd apps/desktop && pnpm exec vitest run <対象ファイル>` を正本にする                                        | コマンドの置き場所まで仕様化する                           |
| screenshot 実体だけあって再実行経路が無いと再監査が属人化する      | TASK-10A-G で task 単位 screenshot command を追加した | UI 変更を伴う場合は `screenshot:<workflow>` を package script として公開し、Phase 11/12 に同じコマンドを残す | 画面証跡はファイルと実行経路の両方を残す                   |
| 継続利用する open backlog 自体が旧テンプレートだと次回着手が遅れる | TASK-10A-G 再確認で本指示書を全面整形した             | `audit-unassigned-tasks --json --diff-from HEAD --target-file <file>` で `currentViolations=0` を確認する    | backlog は「存在」だけでなく「再利用可能な形式」まで整える |

---

## 4. 実行手順

1. `SkillEditor.tsx` と Store 実装を `rg` で棚卸しし、6 API の残存箇所を確定する。
2. `agentSlice` または専用 slice に file operation action を追加し、引数バリデーションと戻り値契約を揃える。
3. `store/index.ts` に個別セレクタを追加し、参照安定性を確認する。
4. `SkillEditor.tsx` の direct IPC を Store action 呼び出しへ置換する。
5. 対象テストを追加・更新し、file operation 成功系と失敗系をカバーする。
6. 画面挙動に差分が出る場合は screenshot を再取得し、Phase 11 証跡を更新する。
7. Phase 12 の outputs、system spec、必要な skill docs を同期する。
8. `verify-all-specs`、`validate-phase-output`、未タスク監査、リンク検証を再実行する。

---

## 5. 完了条件チェックリスト

- [ ] `SkillEditor.tsx` から file operation 系 direct IPC が 0 件
- [ ] Store action と個別セレクタが追加されている
- [ ] S26 パターンに沿って UI と IPC の責務境界が整理されている
- [ ] 成功系 / 失敗系テストが PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] 必要な screenshot 証跡が取得・更新されている
- [ ] Phase 12 outputs が実績ベースで更新されている
- [ ] `docs/30-workflows/completed-tasks/task-045-lifecycle-test-hardening/unassigned-task/` と `task-workflow.md` の台帳が同期されている

---

## 6. 検証方法

| 検証対象            | コマンド                                                                                                                                                                                                                                                       | 合格条件                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------- | ---------- | ---------- | --------------------------------------------------------------------------- | ---- |
| direct IPC 残存確認 | `rg -n "window\\.electronAPI\\?\\.skill\\?\\.(readFile                                                                                                                                                                                                         | writeFile                   | listBackups | createFile | deleteFile | restoreBackup)" apps/desktop/src/renderer/components/skill/SkillEditor.tsx` | 0 件 |
| 対象テスト          | `cd apps/desktop && pnpm exec vitest run <対象ファイル>`                                                                                                                                                                                                       | PASS                        |
| 型チェック          | `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                        | PASS                        |
| workflow 仕様       | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir> --json`                                                                                                                                                  | error=0                     |
| Phase 出力          | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-dir>`                                                                                                                                                               | PASS                        |
| 未タスク単体監査    | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/task-045-lifecycle-test-hardening/unassigned-task/task-10a-g-skilleditor-fileops-store-migration.md` | `currentViolations.total=0` |
| 未タスクリンク      | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                | missing=0                   |

---

## 7. リスクと対策

| リスク            | 内容                                           | 対策                                                      |
| ----------------- | ---------------------------------------------- | --------------------------------------------------------- |
| 状態境界の崩れ    | UI 一時状態まで Store へ押し込みすぎる         | shared/local の判断表を維持する                           |
| P31 再発          | 合成 Hook や新規配列参照で再描画ループを起こす | 個別セレクタと `useShallow` 要否確認を徹底する            |
| テスト環境差      | repo root 実行で false fail が出る             | `apps/desktop` 直下実行を固定する                         |
| Phase 12 同期漏れ | 実装は終わっても台帳や教訓が残らない           | outputs / system spec / skill docs を同一ターンで更新する |

---

## 8. 参照情報

| 種別               | パス                                                                                        | 用途                               |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S26 の正本                         |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | P31/P40/P42/P48/P50 と再利用手順   |
| タスク台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | TASK-10A-F / TASK-10A-G の完了記録 |
| 未タスク規約       | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | 9 セクションと監査ルール           |
| 対象コンポーネント | `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`                                | 改修対象                           |
| 対象 Store         | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                      | action 追加候補                    |
| セレクタ公開       | `apps/desktop/src/renderer/store/index.ts`                                                  | 個別セレクタ追加先                 |
| 親タスク           | `docs/30-workflows/completed-tasks/TASK-10A-F-STORE-DRIVEN-LIFECYCLE-UI/`                   | 先行移行の成果物                   |
| 再監査タスク       | `docs/30-workflows/completed-tasks/task-045-lifecycle-test-hardening/`                      | task-045 の Phase 12 記録          |

---

## 9. 備考

- 本タスクは既存 open backlog の継続利用であり、重複起票しない。
- 実装時に UI 振る舞いが変わる場合は、tests-only 扱いにせず screenshot 証跡も更新する。
- 着手後は `.claude` と `.agents` の system spec / skill docs を同一ターンで同期する。
