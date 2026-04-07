# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 1                                                        |
| Phase名    | 要件定義                                                 |
| タスクID   | UT-SKILL-WIZARD-W1-par-02d                               |
| 機能名     | SkillLifecyclePanel テキストエリア削除・ウィザード遷移化 |
| 前提Phase  | -                                                        |
| 次Phase    | Phase 2: 設計                                            |
| ステータス | pending                                                  |
| 作成日     | 2026-04-07                                               |

## 目的

SkillLifecyclePanel.tsx の現行実装を確認し、テキストエリア・生成ボタン群を削除してウィザード遷移ボタン1つに置き換えるための要件を確定する。

## タスク分類

- 本タスクは UI task である
- Phase 11 では screenshot / visual review を必須化する
- Phase 12 では canonical 6 成果物を同一 wave で揃える
- `artifacts.json` と `outputs/artifacts.json` の初期化方針を Phase 1 で固定する

### Task 0: 成果物レジストリの初期化

- Phase 1 の時点で、後続 Phase の canonical filename を `artifacts.json` に登録する前提を固める
- Phase 11 / Phase 12 の出力ファイル名が揺れないよう、タスク root の命名をここで確定する
- 以降の Phase ではこのレジストリを前提に、差分だけを更新する

## 実行タスク

### Task 1: 現行実装の確認

```bash
# 現行ファイルの確認
cat apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# テストファイルの確認
rg --files apps/desktop/src | rg "SkillLifecyclePanel.*(test|spec|tsx)$"

# 呼び出し箇所の確認
rg -n "SkillLifecyclePanel" apps/desktop/src/ --glob "*.tsx" --glob "*.ts"
```

### Task 2: 削除対象の特定

現行実装から削除する要素を確定する:

| 削除対象                        | data-testid / 識別子             | 理由                         |
| ------------------------------- | -------------------------------- | ---------------------------- |
| `request` state と setRequest   | -                                | テキストエリア廃止に伴い不要 |
| `handleCreate()` 関数           | -                                | 直接生成フローを廃止         |
| `handlePrepare()` 関数          | -                                | 「方針を決める」フローを廃止 |
| テキストエリア                  | `skill-lifecycle-request-input`  | ウィザードに移行するため不要 |
| 「スキルを生成する」ボタン      | `skill-lifecycle-create-button`  | ウィザードに移行するため不要 |
| 「方針を決める」ボタン          | `skill-lifecycle-prepare-button` | ウィザードに移行するため不要 |
| 「1. 依頼をまとめる」セクション | -                                | セクション全体を置き換え     |

### Task 3: 追加対象の確定

追加する要素を確定する:

| 追加対象                               | data-testid                          | 説明                          |
| -------------------------------------- | ------------------------------------ | ----------------------------- |
| 「1. スキルを作成する」セクション      | -                                    | 旧「1. 依頼をまとめる」の代替 |
| 「スキル作成ウィザードを開く →」ボタン | `skill-lifecycle-open-wizard-button` | onOpenSkillWizardを呼び出す   |

### Task 4: Props変更要件の確定

**機能要件**:

| ID    | 要件                                                        | 優先度 |
| ----- | ----------------------------------------------------------- | ------ |
| FR-01 | `onOpenSkillWizard: () => void` を Props に追加する         | 必須   |
| FR-02 | ウィザードボタンクリックで onOpenSkillWizard を呼び出す     | 必須   |
| FR-03 | 旧テキストエリアが DOM に存在しなくなる                     | 必須   |
| FR-04 | 旧「スキルを生成する」ボタンが DOM に存在しなくなる         | 必須   |
| FR-05 | 旧「方針を決める」ボタンが DOM に存在しなくなる             | 必須   |
| FR-06 | data-testid="skill-lifecycle-open-wizard-button" を付与する | 必須   |

**非機能要件**:

| ID     | 要件                                                            | 優先度 |
| ------ | --------------------------------------------------------------- | ------ |
| NFR-01 | 既存の他セクション（「2. スキルを確認する」等）に影響を与えない | 必須   |
| NFR-02 | TypeScript strict modeに対応する                                | 必須   |
| NFR-03 | Tailwind CSS デザイントークンを使用する                         | 必須   |

### Task 5: スコープ境界の確定

- **含む**: SkillLifecyclePanel.tsx の最小変更（削除・置換）、関連テストの更新
- **含まない**: SkillCreateWizard.tsx の実装（W2-seq-03aのスコープ）、onOpenSkillWizard の実装先（呼び出し元のスコープ）

## skill準拠基準

| skill                        | 確認ポイント                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `task-specification-creator` | Phase 11 の UI task 証跡、Phase 12 の canonical 6 outputs、Phase 13 の blocked boundary         |
| `aiworkflow-requirements`    | canonical root、current / baseline 分離、`artifacts.json` と `outputs/artifacts.json` の parity |

## カノニカル成果物

| 種別                     | パス                                                                               | 用途                                    |
| ------------------------ | ---------------------------------------------------------------------------------- | --------------------------------------- |
| workflow registry        | `artifacts.json`                                                                   | Phase 状態・成果物一覧の正本            |
| workflow registry mirror | `outputs/artifacts.json`                                                           | root 台帳の mirror                      |
| 要件定義                 | `outputs/phase-1/requirements.md`                                                  | 機能要件・非機能要件の確定一覧          |
| 変更根拠                 | `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02d-lifecycle-panel/index.md` | task classification / canonical outputs |

## 参照資料

| 資料名                  | パス                                                                 | 説明             |
| ----------------------- | -------------------------------------------------------------------- | ---------------- |
| 現行SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 改修対象ファイル |
| レーンindex             | `docs/30-workflows/skill-wizard-redesign-lane/index.md`              | 設計根拠         |

## 成果物

| 成果物     | パス                              | 説明                           |
| ---------- | --------------------------------- | ------------------------------ |
| 要件定義書 | `outputs/phase-1/requirements.md` | 機能要件・非機能要件の確定一覧 |

## 完了条件

- [ ] 現行実装の削除対象が全て特定されている
- [ ] 追加対象が確定している
- [ ] Props変更要件が確定している
- [ ] 機能要件FR-01〜FR-06が全て記載されている
- [ ] スコープ境界（含む/含まない）が明確である
- [ ] タスク分類（UI task）と成果物レジストリ初期化方針が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
