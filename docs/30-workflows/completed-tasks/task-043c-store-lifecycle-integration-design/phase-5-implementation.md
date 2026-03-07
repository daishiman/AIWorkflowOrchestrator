# Phase 5: 実装

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 5                                  |
| 機能名 | store-lifecycle-integration-design |
| 作成日 | 2026-03-06                         |

## 目的

agentSlice に import 操作のための selector/action を追加し、SkillManagementPanel が直接 IPC を呼ばずに store action 経由でインポート操作を完結できるようにする。

## 実行タスク

- agentSlice に imported/available/filtered selector を追加する
- importSkill action の状態遷移（isImporting -> success/error）を実装する
- P31 対策として個別セレクタを命名規約に従い定義する
- TASK-10A-F の create/analyze 経路と独立した責務境界を維持する

## 参照資料

| 参照資料      | パス                                                                                        | 使用目的                        |
| ------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| 前Phase成果物 | `phase-4-test-creation.md`                                                                  | テストケース設計を実装に反映    |
| 状態管理仕様  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | selector/action 分離と P31 対策 |
| Skill API仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | store action の戻り値契約       |
| 実装パターン  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | React + store の責務分離        |
| エラー仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | UI表示に渡すエラー分類          |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 状態遷移回帰を防ぐ品質ゲート    |

## 実行手順

### Step 1: Selector 実装

agentSlice に以下の派生 selector を追加する。各 selector は `store/index.ts` に個別セレクタ Hook として公開する。

#### 1-1. imported selector

| セレクタ名               | 戻り値型          | 算出ロジック                          |
| ------------------------ | ----------------- | ------------------------------------- |
| `useImportedSkillsAgent` | `ImportedSkill[]` | `state.importedSkills` をそのまま返す |

- 既存の `useImportedSkills`（AgentView 向け）が存在する場合はドメインサフィックスで区別する
- 空配列フォールバック: `state.importedSkills ?? []`（nullish 防御）

#### 1-2. available selector

| セレクタ名                    | 戻り値型          | 算出ロジック                                                             |
| ----------------------------- | ----------------- | ------------------------------------------------------------------------ |
| `useAvailableSkillsForImport` | `SkillMetadata[]` | `state.availableSkills` から `importedSkills` に含まれないものをフィルタ |

- 算出式: `availableSkills.filter(a => !importedSkills.some(i => i.name === a.name))`
- 注意: 毎回新しい配列を返すため、コンポーネント側で `useMemo` 相当のメモ化が必要な場合は Zustand の `useShallow` を使用する

#### 1-3. filtered selector

| セレクタ名                   | 戻り値型          | 算出ロジック                                           |
| ---------------------------- | ----------------- | ------------------------------------------------------ |
| `useFilteredAvailableSkills` | `SkillMetadata[]` | available + `skillFilter` + `skillCategory` で絞り込み |

- フィルタ条件:
  1. `skillFilter` が空でない場合: `name` または `description` に部分一致（大文字小文字無視）
  2. `skillCategory` が null でない場合: `category === skillCategory`
  3. 両方指定時: AND 条件

### Step 2: Action 実装（importSkill 状態遷移）

既存の `importSkill` action の状態遷移を以下の仕様に従って実装する。

#### 状態遷移表

| フェーズ   | isImporting | importingSkillName | skillError       | importedSkills | 説明                   |
| ---------- | ----------- | ------------------ | ---------------- | -------------- | ---------------------- |
| 初期状態   | `false`     | `null`             | `null`           | 変化なし       | 待機中                 |
| import開始 | `true`      | `skillName`        | `null`（クリア） | 変化なし       | IPC 呼び出し前         |
| import成功 | `false`     | `null`             | `null`           | 追加           | IPC 応答後、一覧再取得 |
| import失敗 | `false`     | `null`             | エラーメッセージ | 変化なし       | エラー保持             |

#### 冪等ガード（既存実装を維持）

- 事前判定: `importedSkills.some((s) => s.name === skillName)` が真なら IPC を呼ばずに早期 return
- 追加時の重複防止: import 成功後も `importedSkills` へ push 前に同名存在チェックを実施

#### non-throw failure 契約

- `importSkill(skillName)` は failure 時でも reject せず resolve しうる
- UI は `catch` の有無ではなく、`await` 後の Store 状態で成否を判定する
- 成功条件: `importedSkills.some((s) => s.name === skillName)` が真、かつ `skillError` が未残置

#### 成功後の一覧再同期

- import 成功後は `fetchSkills()` を呼び出して `availableSkills` と `importedSkills` の両方を再取得する
- 再取得中は `isLoadingSkills` を `true` にする（`isImporting` はこの時点で既に `false`）

### Step 3: 個別セレクタ定義（P31 対策）

`store/index.ts` に以下の個別セレクタ Hook を追加する。

| カテゴリ   | セレクタ名                    | 戻り値型                               | 命名規約準拠                 |
| ---------- | ----------------------------- | -------------------------------------- | ---------------------------- |
| 状態       | `useIsImportingSkill`         | `boolean`                              | ドメインサフィックス `Skill` |
| 状態       | `useImportingSkillName`       | `string \| null`                       | 対象スキル名                 |
| アクション | `useImportSkill`              | `(skillName: string) => Promise<void>` | 動詞 + 対象                  |
| アクション | `useRemoveSkill`              | `(skillName: string) => Promise<void>` | 動詞 + 対象                  |
| 派生       | `useAvailableSkillsForImport` | `SkillMetadata[]`                      | 用途明示                     |
| 派生       | `useFilteredAvailableSkills`  | `SkillMetadata[]`                      | フィルタ適用済み             |

#### 命名規約（TASK-10A-D 教訓準拠）

- ドメインサフィックス必須: `useIsImportingSkill`（`useIsImporting` は不可）
- 汎用名の回避: 複数 Slice で同名になりうる場合はドメインを明示する
- パターン: `use{State}{Domain}` / `use{Verb}{Domain}`

### Step 4: TASK-10A-F 境界の独立性確保

| 責務       | TASK-10A-E-C（本タスク）             | TASK-10A-F                      |
| ---------- | ------------------------------------ | ------------------------------- |
| 対象操作   | import / remove / filter             | create / analyze / improve      |
| 状態フラグ | `isImporting` / `importingSkillName` | `isAnalyzing` / `isImproving`   |
| エラー保持 | `skillError`（共有）                 | `skillError`（共有）            |
| 一覧再同期 | import 成功後に `fetchSkills()`      | create 成功後に `fetchSkills()` |

- `skillError` は共有フィールドだが、各操作でクリア → セット → 保持のライフサイクルが独立しているため衝突しない
- import 中に create/analyze を呼び出すケースは UI 上で排他制御しない（独立した操作フロー）
- 両方が同時に `fetchSkills()` を呼ぶ場合、後勝ちで問題ない（最新状態が反映される）

### Step 5: コンポーネント側の接続

SkillManagementPanel（および SkillImportDialog）で直接 IPC 呼び出しを行っている箇所を store action 経由に置き換える。

#### 置換パターン

| 変更前（直接 IPC）                      | 変更後（store action）                                    |
| --------------------------------------- | --------------------------------------------------------- |
| `window.electronAPI.skill.import(name)` | `const importSkill = useImportSkill(); importSkill(name)` |
| `window.electronAPI.skill.remove(name)` | `const removeSkill = useRemoveSkill(); removeSkill(name)` |
| `window.electronAPI.skill.list()`       | `const fetchSkills = useFetchSkills(); fetchSkills()`     |

- `useEffect` 依存配列には個別セレクタ Hook の戻り値のみを含める
- 合成 Hook（`useSkillStore()`）は使用禁止

## 統合テスト連携

- Phase 4 で設計したテストケースが全て PASS することを確認する
- import 成功後の一覧再同期が正しく動作することを統合テストで検証する
- P31 回帰テスト（無限ループ検出）を実行し、個別セレクタの参照安定性を確認する

## 多角的チェック観点

| 観点           | チェック内容                                              |
| -------------- | --------------------------------------------------------- |
| セキュリティ   | Renderer から直接 IPC を呼んでいないこと                  |
| パフォーマンス | selector の再計算が不要なレンダリングを引き起こさないこと |
| P31 回帰       | 個別セレクタ使用、合成 Hook 不使用を確認                  |
| 境界           | TASK-10A-F の create/analyze 状態と独立していること       |
| 冪等性         | 同一スキルの重複インポートが防止されること                |
| エラー         | 失敗時に `skillError` が保持され、UI に表示可能なこと     |

## 成果物

| 成果物             | パス                                                                  | 説明                    |
| ------------------ | --------------------------------------------------------------------- | ----------------------- |
| agentSlice 拡張    | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                | selector/action 追加    |
| 個別セレクタ Hook  | `apps/desktop/src/renderer/store/index.ts`                            | P31 対策セレクタ        |
| コンポーネント修正 | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx` | store action 経由に統一 |

## 完了条件

- [ ] imported/available/filtered selector が実装されている
- [ ] importSkill action の状態遷移（開始 -> 成功/失敗）が実装されている
- [ ] 冪等ガードが維持されている
- [ ] non-throw failure 契約が維持されている
- [ ] 成功後に fetchSkills() で一覧再同期される
- [ ] 個別セレクタ Hook がドメインサフィックス命名規約に従っている
- [ ] 合成 Hook を使用していない
- [ ] TASK-10A-F の create/analyze 経路と独立性が確保されている
- [ ] SkillManagementPanel の直接 IPC 呼び出しが store action 経由に置換されている
- [ ] Phase 4 のテストケースが全て PASS する

## 次のPhase

Phase 6: テスト拡充 (`phase-6-test-expansion.md`)
