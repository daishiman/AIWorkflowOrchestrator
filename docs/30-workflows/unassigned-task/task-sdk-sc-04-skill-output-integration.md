# TASK-SDK-SC-04: Skill Output Integration - タスク指示書

## メタ情報

```yaml
issue_number: 1854
task_id: UT-SDK-SC-04-001
task_name: Skill Output Integration
category: 要件
target_feature: skill-creator / skill-output-integration
priority: 高
scale: 大規模
status: 未実施
source_phase: TASK-SDK-SC-01 Phase 12 後続分解
created_date: 2026-04-03
dependencies: [TASK-SDK-SC-01, TASK-SDK-SC-02, TASK-SDK-SC-03]
spec_path: docs/30-workflows/unassigned-task/task-sdk-sc-04-skill-output-integration.md
```

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | UT-SDK-SC-04-001                         |
| タスク名     | Skill Output Integration                 |
| 分類         | 要件                                     |
| 対象機能     | skill-creator / skill-output-integration |
| 優先度       | 高                                       |
| 見積もり規模 | 大規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | TASK-SDK-SC-01 Phase 12 後続分解         |
| 発見日       | 2026-04-03                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Conversation UI と外部 API サポートが整っても、生成されたスキルを保存・登録・プレビューできなければ、最終的にユーザーが使える状態にならない。  
Skill Output Integration は、生成結果を `.claude/skills/{skill-name}/SKILL.md` に保存し、レジストリに反映して初めて「作ったスキルをすぐ使える」状態を作る。

### 1.2 問題点・課題

- 生成完了後の出力を捕捉して保存するハンドラーがない
- `SkillRegistry` に新規スキルを登録するための導線がない
- 出力プレビューと上書き確認の UI がない
- 生成物のパース戦略が曖昧だと、保存先やメタデータの drift が起きる

### 1.3 放置した場合の影響

- 生成されたスキルがディスクにも UI にも現れない
- 手作業でコピーしないとスキルが使えず、機能の価値が下がる
- 保存先の命名や上書き確認を誤ると、既存スキルを壊すリスクがある

---

## 2. 何を達成するか（What）

### 2.1 目的

SDK セッション完了時に生成結果を安全に保存し、必要ならプレビューと登録まで一気通貫で行えるようにする。

### 2.2 最終ゴール

- 生成結果を捕捉して `SKILL.md` として保存できる
- `SkillRegistry` に新規スキルを登録できる
- 既存スキルとの衝突時に上書き確認ができる
- Renderer 側で生成完了とプレビューを表示できる

### 2.3 スコープ

#### 含むもの

- `SkillCreatorOutputHandler.ts`
- `SkillCreatorResultPanel.tsx`
- `SkillRegistry.ts` の拡張
- `SKILL_CREATOR_OUTPUT_READY` チャネル追加
- パース戦略と保存戦略のテスト

#### 含まないもの

- Conversation UI の再設計
- 外部 API 収集ロジックの再実装
- PR 作成や配布自動化

### 2.4 成果物

- `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`
- `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx`
- `apps/desktop/src/main/services/runtime/SkillRegistry.ts` 更新
- `packages/shared/src/ipc/channels.ts` 追記
- 関連テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SDK-SC-01` が完了していること
- `TASK-SDK-SC-02` と `TASK-SDK-SC-03` の成果物が統合可能な状態であること

### 3.2 依存タスク

- `TASK-SDK-SC-01`
- `TASK-SDK-SC-02`
- `TASK-SDK-SC-03`

### 3.3 必要な知識

- SDK 出力のパースと保存
- Electron Main/Renderer 間の完了通知設計
- ファイル保存・上書き確認・レジストリ登録の責務境界

### 3.4 推奨アプローチ

1. 出力パースを単独関数へ分離する
2. 保存先パスの正規化を先に固定する
3. 上書き確認の有無を UI と Main で一致させる
4. 保存成功後に `SkillRegistry` を更新する
5. 結果プレビューを Renderer で表示する

### 3.5 苦戦箇所

| ID    | 内容                                             | 対策                                                             |
| ----- | ------------------------------------------------ | ---------------------------------------------------------------- |
| U04-1 | 出力フォーマットがブレると保存処理が壊れやすい   | パース戦略を 1 箇所に集約し、失敗時は明示的にエラー化する        |
| U04-2 | スキル名の正規化と保存先ディレクトリがずれやすい | `skill-name` → path 変換を共通関数にし、大小文字と記号を統一する |
| U04-3 | 上書き確認と新規保存の分岐が UI で混ざりやすい   | overwrite 確認を ResultPanel に明示的に分離する                  |
| U04-4 | レジストリ登録の重複や抜けが起きやすい           | 保存成功後の登録を冪等化し、既存スキルとの衝突をテストで固定する |

---

## 4. 実行手順

### Phase構成

- Phase 1: 要件固定
- Phase 2: 保存/登録設計
- Phase 3: 実装・テスト
- Phase 4: ドキュメント・Issue 反映

### Phase 1: 要件固定

#### 目的

生成完了時に何を保存し、何を UI に出すかを固定する。

#### 手順

1. 出力フォーマットを確認する
2. 保存対象と保存先を決める
3. overwrite 条件を決める

#### 成果物

- 保存要件
- プレビュー要件

#### 完了条件

- 保存・登録・表示の境界が説明できる

### Phase 2: 保存/登録設計

#### 目的

保存ハンドラーとレジストリ更新の流れを固める。

#### 手順

1. `SkillCreatorOutputHandler` の責務を切る
2. `SkillRegistry.registerFromPath()` の契約を定義する
3. Renderer のプレビューデータ形状を決める

#### 成果物

- 保存フロー設計
- レジストリ更新設計

#### 完了条件

- どの層が何を所有するかが明確

### Phase 3: 実装・テスト

#### 目的

保存、登録、プレビューの一連の流れを実装する。

#### 手順

1. Main 側の出力ハンドラーを作る
2. Renderer の結果パネルを作る
3. 保存失敗、パース失敗、上書き確認のテストを追加する

#### 成果物

- TypeScript / TSX 実装
- 単体テスト

#### 完了条件

- typecheck / lint / test が通る

### Phase 4: ドキュメント・Issue 反映

#### 目的

後続の保守と監査ができるようにする。

#### 手順

1. 仕様変更をまとめる
2. GitHub Issue を作成する
3. issue_number を書き戻す

#### 成果物

- issue_number 付き指示書
- Issue

#### 完了条件

- 保存/登録/プレビューの関係が文書化されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 生成完了時に出力を捕捉できる
- [ ] `SKILL.md` を保存できる
- [ ] レジストリに登録できる
- [ ] プレビュー UI で結果を見られる

### 品質要件

- [ ] パース失敗時に原因が分かる
- [ ] TypeScript コンパイルエラーが 0 件
- [ ] Vitest が全件 PASS

### ドキュメント要件

- [ ] 参照先が Step-01 完了版に向いている
- [ ] Issue 反映後に issue_number が埋まる

---

## 6. 検証方法

### テストケース

- 完了イベントから出力を保存できる
- `SkillRegistry` 登録が重複しない
- overwrite 確認が必要なケースで UI 分岐できる
- パース失敗時に適切なエラーが出る

### 検証手順

1. サンプル出力を流して保存を確認する
2. 既存スキル名との衝突を確認する
3. 生成プレビューを確認する
4. テストを実行する

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                 |
| -------------------------- | ------ | -------- | ------------------------------------ |
| 出力パースが壊れる         | 高     | 中       | パース関数を単独化し、失敗を明示する |
| 保存先が誤る               | 高     | 低       | skill-name 正規化を共通化する        |
| レジストリが重複登録される | 中     | 中       | registerFromPath を冪等にする        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-01-seq-task-01-sdk-session-bridge/outputs/phase-12/implementation-guide.md`
- `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/index.md`
- `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts`
- `packages/shared/src/ipc/channels.ts`

### 参考資料

- `task-specification-creator` の未完了タスクテンプレート
- `github-issue-manager` の Issue 生成スクリプト

---

## 9. 備考

### 補足事項

- このタスクは「生成結果を使えるスキルに変換する」最終統合である
- 保存だけで終わらせず、UI 表示とレジストリ登録まで同時に閉じる
