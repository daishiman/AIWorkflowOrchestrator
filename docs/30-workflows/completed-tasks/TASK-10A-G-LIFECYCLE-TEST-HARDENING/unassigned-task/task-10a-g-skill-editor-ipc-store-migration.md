# SkillEditor 残存直接IPC呼び出しのStore移行 - タスク指示書

## メタ情報

```yaml
issue_number: 1041
```

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-10A-G-SKILL-EDITOR-IPC-STORE-MIGRATION  |
| タスク名     | SkillEditor 残存直接IPC呼び出しのStore移行 |
| 分類         | リファクタリング                           |
| 対象機能     | SkillEditor（スキルファイル編集）          |
| 優先度       | 中                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 12（TASK-10A-F 完了時の残存IPC検出） |
| 発見日       | 2026-03-07                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F でスキルライフサイクルUI（`useSkillAnalysis.ts` / `SkillCreateWizard.tsx`）の直接IPC呼び出しを Store 個別セレクタ経由へ移行したが、`SkillEditor.tsx` には6箇所の直接IPC呼び出しが残存している。

### 1.2 問題点・課題

`SkillEditor.tsx` に以下の6箇所の `window.electronAPI.skill.*` 直接呼び出しが残っている。

| #   | 行番号 | API                   | 用途                   |
| --- | ------ | --------------------- | ---------------------- |
| 1   | L233   | `skill.readFile`      | スキルファイル読み取り |
| 2   | L271   | `skill.writeFile`     | スキルファイル書き込み |
| 3   | L298   | `skill.listBackups`   | バックアップ一覧取得   |
| 4   | L412   | `skill.createFile`    | 新規ファイル作成       |
| 5   | L440   | `skill.deleteFile`    | ファイル削除           |
| 6   | L482   | `skill.restoreBackup` | バックアップ復元       |

### 1.3 放置した場合の影響

- SkillEditor の状態が他画面（SkillCenterView 等）と同期されない
- Store 駆動アーキテクチャの一貫性が崩れ、新規開発者の学習コストが上がる
- open backlog の保存先がタスク状態に応じて同期されず、Phase 12 と archive 後の未タスク探索導線がぶれる

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillEditor.tsx` の6箇所の直接IPC呼び出しを全て Store 個別セレクタ経由へ移行し、Store 駆動アーキテクチャの一貫性を確保する。

### 2.2 最終ゴール

- `rg -n "window.electronAPI" apps/desktop/src/renderer/components/skill/SkillEditor.tsx` の結果が 0 件
- 対象テストが全て PASS
- カバレッジ基準（Line 80% / Branch 60% / Function 80% 以上）を満たす

### 2.3 スコープ

#### 含むもの

- `SkillEditor.tsx` の直接IPC呼び出し6箇所の Store 移行
- `agentSlice.ts` へのファイル操作 action 追加（`readFile` / `writeFile` / `createFile` / `deleteFile` / `listBackups` / `restoreBackup`）
- `store/index.ts` への個別セレクタ export 追加
- `SkillEditor.test.tsx` の Store mock パターン移行

#### 含まないもの

- SkillEditor 以外のコンポーネントの直接IPC排除
- IPC ハンドラ / preload 層の変更
- SkillEditorView（親コンポーネント）の新規責務追加

### 2.4 成果物

- 修正済み `SkillEditor.tsx`
- 拡張済み `agentSlice.ts`
- 更新済み `store/index.ts`
- 更新済み `SkillEditor.test.tsx`
- Phase 12 同期済みの `arch-state-management.md` / `task-workflow.md` / `lessons-learned.md`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-F が完了していること
- TASK-10A-G の完了移管後、この未タスクが `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/unassigned-task/` に同梱されていること

### 3.2 依存タスク

| タスクID   | 内容                                        | ステータス |
| ---------- | ------------------------------------------- | ---------- |
| TASK-10A-D | agentSlice スキルライフサイクル action 追加 | 完了       |
| TASK-10A-F | スキルライフサイクルUI Store 移行           | 完了       |
| TASK-10A-G | 3層統合テスト強化と再監査                   | 完了       |

### 3.3 必要な知識

- Zustand Store Slice 設計（P31 / P48 対策）
- `architecture-implementation-patterns.md` の直接IPC→Store 移行パターン
- `arch-state-management.md` の selector / action 責務境界

### 3.4 推奨アプローチ

1. 先に `agentSlice` へファイル操作 action を集約する。
2. `store/index.ts` では State / Action を混ぜず個別セレクタとして公開する。
3. `SkillEditor.tsx` は UI ローカル state と Store state の責務を切り分けたうえで direct IPC を除去する。
4. テストは Store mock と root evidence を同じターンで更新する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                  | 発見経緯                                                               | 解決策                                                                                                                               | 教訓                                 |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | --------------------------------------------- | --------------------------------------------------------- |
| handler-scope coverage を feature 全体値と誤読しやすい                | TASK-10A-G で `96.9 / 88.9 / 100` の読み違いが発生                     | 対象関数単位の coverage と feature 全体の回帰件数を分けて記録する                                                                    | 数値は必ず「対象範囲」を先に固定する |
| `spec-update-summary.md` など補助成果物だけ実績値が古いまま残りやすい | current workflow 再監査で `test-documentation.md` が 43 件のままだった | `rg -n "43件                                                                                                                         | 55 tests                             | 合計"` で outputs/phase-12 全体を横断確認する | summary 文書だけでなく supporting artifact も同値確認する |
| open backlog の配置がタスク状態とズレると探索導線がぶれる             | TASK-10A-G 再監査後に archive へ移した際、参照先の再同期が必要になった | Phase 12 中は root `unassigned-task/`、完了移管後は `completed-tasks/<task>/unassigned-task/` へ揃え、全参照を同一ターンで張り替える | open backlog は物理パスで状態を表す  |

---

## 4. 実行手順

### Phase構成

- Phase A: 直接IPC残存箇所の抽出
- Phase B: Store action / selector 追加
- Phase C: UI 置換とテスト更新
- Phase D: Phase 12 同期

### Phase A: 直接IPC残存箇所の抽出

#### 目的

対象範囲を6箇所へ固定し、余計な変更を防ぐ。

#### 手順

1. `rg -n "window\\.electronAPI\\.skill" apps/desktop/src/renderer/components/skill/SkillEditor.tsx` を実行する。
2. 該当箇所を read / write / backup / destructive action に分類する。
3. 既存の Store action と重複する責務がないか確認する。

#### 成果物

- 残存直接IPC一覧

#### 完了条件

- 6箇所の direct IPC が一覧化されている。

### Phase B: Store action / selector 追加

#### 目的

UI 側から direct IPC を消せるだけの Store 契約を揃える。

#### 手順

1. `agentSlice.ts` に6 action を追加する。
2. 例外系は try/catch と共通エラー state へ集約する。
3. `store/index.ts` に個別セレクタを export する。

#### 成果物

- 更新済み `agentSlice.ts`
- 更新済み `store/index.ts`

#### 完了条件

- SkillEditor が必要とするファイル操作 action / selector が Store から利用可能になっている。

### Phase C: UI 置換とテスト更新

#### 目的

SkillEditor の direct IPC を除去し、回帰を防ぐ。

#### 手順

1. `SkillEditor.tsx` の direct IPC を Store action 呼び出しへ置換する。
2. `SkillEditor.test.tsx` を Store mock パターンへ寄せる。
3. 対象テストと型チェックを実行する。

#### 成果物

- 更新済み `SkillEditor.tsx`
- 更新済み `SkillEditor.test.tsx`

#### 完了条件

- `SkillEditor.tsx` の direct IPC が 0 件
- 対象テスト PASS

### Phase D: Phase 12 同期

#### 目的

実装・苦戦箇所・未タスク参照を正本仕様へ反映する。

#### 手順

1. `arch-state-management.md` / `task-workflow.md` / `lessons-learned.md` を更新する。
2. `verify-unassigned-links.js` と `audit-unassigned-tasks --target-file` を実行する。
3. `task-workflow.md` と completed workflow の参照パスが canonical path を指していることを確認する。

#### 成果物

- 更新済み system spec
- 検証ログ

#### 完了条件

- open backlog の canonical path がこの completed workflow 配下に固定されている。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 6箇所の直接IPC呼び出しが全て Store action 経由に移行されている
- [ ] ファイル読み書き / バックアップ機能が正常動作する
- [ ] SkillEditor と他画面の状態同期方針が崩れていない

### 品質要件

- [ ] ESLint 0 エラー
- [ ] TypeScript `tsc --noEmit` PASS
- [ ] 対象テスト PASS
- [ ] カバレッジ基準を満たす
- [ ] `rg -n "window\\.electronAPI" apps/desktop/src/renderer/components/skill/SkillEditor.tsx` が 0 件

### ドキュメント要件

- [ ] `arch-state-management.md` に実装内容を追記
- [ ] `lessons-learned.md` に苦戦箇所と解決手順を追記
- [ ] `task-workflow.md` の残課題テーブル参照が completed workflow 側の canonical path になっている

---

## 6. 検証方法

### テストケース

- ファイル読み込み → Store state 反映 → UI 表示
- ファイル書き込み → Store action 呼び出し → 成功通知
- バックアップ一覧取得 → Store state 反映 → UI 表示
- エラー時の UI 表示とリカバリ

### 検証手順

```bash
rg -n "window\\.electronAPI" apps/desktop/src/renderer/components/skill/SkillEditor.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillEditor.test.tsx
cd apps/desktop && pnpm exec tsc --noEmit
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/unassigned-task/task-10a-g-skill-editor-ipc-store-migration.md
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                                         |
| ------------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------- |
| 非同期ファイル操作のエラー処理漏れ               | 高     | 中       | Store action 側で error state を統一し、UI でも try/catch を残す             |
| selector / action 責務が混ざり再レンダーが増える | 中     | 中       | State と Action を別セレクタで公開し、`useShallow` 条件を再確認する          |
| 未タスク参照の再移設漏れ                         | 中     | 低       | `verify-unassigned-links.js` と `audit --target-file` を同一ターンで実行する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-12/unassigned-task-detection.md`

---

## 9. 備考

### 補足事項

- canonical path は `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/unassigned-task/task-10a-g-skill-editor-ipc-store-migration.md`
- historical workflow 側のレポート参照は current 正本リンクへ張り替えて管理する
