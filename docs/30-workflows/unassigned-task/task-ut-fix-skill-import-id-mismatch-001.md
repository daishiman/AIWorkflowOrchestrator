# UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog ID/Name 不整合修正

## 1. メタ情報

```yaml
issue_number: 877
task_id: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001
task_name: SkillImportDialog ID/Name 不整合修正
category: bugfix
target_feature: SkillImportDialog
priority: 高
scale: 小規模
status: 未実施
source_phase: ランタイムエラー調査
created_date: 2026-02-22
dependencies: []
```

| 項目        | 内容                                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| タスクID    | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001                                                                                          |
| カテゴリ    | bug（バグ修正）                                                                                                              |
| 優先度      | 高                                                                                                                           |
| 規模        | 小規模                                                                                                                       |
| ステータス  | 未実施                                                                                                                       |
| 発見日      | 2026-02-22                                                                                                                   |
| 発見元      | ランタイムエラー調査                                                                                                         |
| 影響範囲    | Renderer `organisms/SkillImportDialog` / `AgentView` / `agentSlice` / Main `skill:import`                                    |
| 関連タスク  | TASK-UI-00-TOKENS, UT-FIX-SKILL-IMPORT-INTERFACE-001, UT-FIX-SKILL-IMPORT-RETURN-TYPE-001, UT-FIX-SKILL-REMOVE-INTERFACE-001 |
| 関連Pitfall | P44（IPC契約ドリフト）、P45（引数命名ドリフト）、P42（trim バリデーション漏れ）                                              |

---

## 2. Why（なぜ必要か）

### 2.1 背景

UT-FIX-SKILL-IMPORT-INTERFACE-001 で `skill:import` IPCハンドラの引数形式が `{ skillIds: string[] }` から `skillName: string` に修正された。しかし、Renderer側の `SkillImportDialog` は依然として `skill.id`（ハッシュ値）を送信しており、ハンドラの `getSkillByName()` が期待する `skill.name`（文字列名）と一致しない。

### 2.2 問題点

- `SkillImportDialog` が `skill.id`（ハッシュ値）を `window.electronAPI.skill.import()` に渡す
- Main Process の `getSkillByName(skillName)` は `skill.name`（文字列名）で検索する
- ハッシュ値と文字列名が一致しないため、`getSkillByName()` が `null` を返しインポートが失敗する
- `importSkills` 内部で「開始」ログが出力された後に失敗するため、ログ上は成功に見えて障害切り分けが困難になる

### 2.3 放置時の影響

- **機能停止**: ユーザーがスキルをインポートできない
- **障害切り分け困難**: 成功ログと失敗ログが混在し、問題の特定に時間がかかる
- **P45再発リスク**: 引数命名ドリフト（ID vs Name）のパターンが `agentSlice` 等に波及する
- **テスト信頼性低下**: テストが `skill.id` ベースで記述されていると、IPC契約との乖離を検出できない

---

## 3. What（何を達成するか）

### 3.1 目的

Renderer → IPC の入力契約を `skillName: string` に統一し、`skill:import` が正常に成功する状態を復元する。

### 3.2 ゴール

- `SkillImportDialog` が `skill.name`（文字列名）を `window.electronAPI.skill.import()` に渡す
- `AgentView` / `agentSlice` の引数名とセマンティクスが `skillName` に統一される
- `importedSkillIds` の判定軸が送信値（`skillName`）と整合する
- `skill:import` 実行で `IMPORT_ERROR` が再発しない

### 3.3 スコープ

#### 含む

- `SkillImportDialog` の選択状態を `skill.id` → `skill.name` 基準に修正
- `AgentView` / `agentSlice` の引数名とセマンティクスを `skillName` に統一
- `importedSkillIds` の判定軸を送信値と整合
- 関連テストの更新・追加

#### 含まない

- `skill:import` IPCハンドラ自体の修正（UT-FIX-SKILL-IMPORT-INTERFACE-001 で解決済み）
- `skill:remove` の修正（UT-FIX-SKILL-REMOVE-INTERFACE-001 で解決済み）
- 新規IPCチャンネルの追加

### 3.4 成果物

| 成果物                      | パス                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------- |
| SkillImportDialog修正       | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            |
| AgentView修正               | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   |
| agentSlice修正              | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                  |
| SkillImportDialogテスト更新 | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` |
| agentSliceテスト更新        | `apps/desktop/src/renderer/store/slices/agentSlice` 配下テストファイル                                  |

### 3.5 実装課題と解決策（TASK-UI-00-TOKENS / IPC修正タスク群からの教訓）

#### 課題1: P44パターン再発（IPCインターフェース不整合）

- **問題**: `skill:import` のIPCハンドラが修正済み（UT-FIX-SKILL-IMPORT-INTERFACE-001）で `skillName: string` を受け付けるようになったが、Renderer側の `SkillImportDialog` は `skill.id`（ハッシュ値）を送信しており、ハンドラの `getSkillByName()` が期待する `skill.name` と一致しない
- **根本原因**: Renderer側のデータモデル（`skill.id` vs `skill.name`）とIPC契約（`skillName: string`）のセマンティクス不一致。P44（IPC契約ドリフト）の派生パターン
- **解決策**: `SkillImportDialog` の選択状態を `skill.name` 基準に変更。変更時はP23/P32準拠で3箇所同時更新（Renderer・IPC契約・テスト）
- **参照**: `.claude/rules/06-known-pitfalls.md` P44, P45

#### 課題2: P42準拠バリデーションの欠落確認

- **問題**: `skill:import` ハンドラにはP42準拠の3段バリデーション（型チェック → 空文字列 → trim空文字列）が追加済みだが、Renderer側から渡される値が意図通りかの検証が不足
- **解決策**: テストで `window.electronAPI.skill.import` 呼び出し引数を固定検証し、`skill.name` が渡されることを保証
- **参照**: `.claude/rules/06-known-pitfalls.md` P42

#### 課題3: 成功ログによる障害切り分け困難

- **問題**: `importSkills` 内部で「開始」ログを出力した後に `getSkillByName()` が失敗するため、ログ上は成功に見えるが実際はインポート失敗
- **解決策**: テストでは最終レスポンス（IPC戻り値）で成功判定する。中間ログに依存しない検証戦略
- **参照**: TASK-UI-00-TOKENS での実装経験

#### 課題4: importedSkillIds のセマンティクス確認

- **問題**: `agentSlice` の `importedSkillIds` がIDベースかNameベースか不明確で、判定ロジックが送信値と一致しない可能性がある
- **解決策**: `importedSkillIds` の中身を調査し、送信値（`skillName`）と同じ軸で判定するように統一。変数名もセマンティクスに合致する名前に変更を検討
- **参照**: P45（引数命名の契約ドリフト）

---

## 4. How（どのように実行するか）

### 4.1 前提条件

- UT-FIX-SKILL-IMPORT-INTERFACE-001 が完了済み（`skill:import` ハンドラが `skillName: string` を受け付ける）
- UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 が完了済み（戻り値型が `ImportedSkill` に修正済み）
- UT-FIX-SKILL-REMOVE-INTERFACE-001 が完了済み（`skill:remove` ハンドラが `skillName: string` を受け付ける）

### 4.2 推奨アプローチ

P23/P32準拠の3箇所同時更新パターンを適用する:

1. **Renderer側**（`SkillImportDialog`）: 送信値を `skill.id` → `skill.name` に変更
2. **Store側**（`agentSlice`）: `importedSkillIds` のセマンティクスを確認し、判定軸を `skillName` に統一
3. **テスト**: 呼び出し引数を `skill.name` で固定検証するテストケースを追加

### 4.3 段階的実行計画

#### Step 1: 現状調査と影響範囲特定

1. `SkillImportDialog/index.tsx` を読み、`skill.id` がどのように送信されているか特定
2. `agentSlice.ts` の `importedSkillIds` の型と代入元を特定
3. `AgentView/index.tsx` でインポート処理がどのように呼ばれるか確認
4. 影響範囲リストを作成: 修正対象ファイルと各ファイルの変更箇所

#### Step 2: Rendererの値を統一

1. `SkillImportDialog` の選択状態を `skill.id` ではなく `skill.name` 基準に修正
2. `onImport` コールバックの引数を `skillNames: string[]` に変更
3. `AgentView` / `agentSlice` の引数名と型注釈を `skillName` セマンティクスへ統一

#### Step 3: インポート済み判定の整合

1. `importedSkillIds` の意味を確認（IDかNameか）
2. 判定ロジックを送信値と同じ軸に揃える
3. 既存UI（チェック状態、無効化）に退行がないことを確認

#### Step 4: テスト更新・追加

1. `organisms/SkillImportDialog` のテストを `name` 送信前提へ更新
2. `agentSlice` テストで `window.electronAPI.skill.import` 呼び出し引数を検証
3. 失敗ケース（不正名、空文字列、trim空文字列）のエラーハンドリングを確認

---

## 5. 実行手順

| Phase | 名称             | 実行内容                                                        | 完了条件                                |
| ----- | ---------------- | --------------------------------------------------------------- | --------------------------------------- |
| 1     | 要件定義         | 影響範囲の特定、`skill.id` → `skill.name` の変更箇所リスト作成  | 修正対象ファイル・行数が特定されている  |
| 2     | 設計             | 3箇所同時更新（Renderer・Store・テスト）の変更計画策定          | 変更計画書が作成されている              |
| 3     | 設計レビュー     | P44/P45パターンの再発防止が設計に含まれているか検証             | PASS判定                                |
| 4     | テスト作成       | `skill.name` 送信を前提としたテストケース設計・コード作成       | テストが Red 状態（未修正コードで失敗） |
| 5     | 実装             | `SkillImportDialog`、`AgentView`、`agentSlice` の修正           | テストが Green 状態                     |
| 6     | テスト拡充       | 境界値（空文字列、trim空文字列、不正名）テスト追加              | カバレッジ基準充足                      |
| 7     | カバレッジ確認   | Line 80%以上、Branch 60%以上、Function 80%以上                  | 基準充足（未達なら Phase 6 へ）         |
| 8     | リファクタリング | 変数名統一（`importedSkillIds` → セマンティクスに合致する名前） | コード品質改善完了                      |
| 9     | 品質検証         | `pnpm lint` + `pnpm typecheck` + 全テスト実行                   | 全 PASS                                 |
| 10    | 最終レビュー     | P44/P45/P42 準拠の多角的検証                                    | PASS判定                                |
| 11    | 手動テスト       | ダイアログでスキル選択 → インポート成功の E2E 確認              | インポート操作が成功する                |
| 12    | ドキュメント     | 実装ガイド・システム仕様書更新・未タスク検出                    | Phase 12 チェックリスト全項目完了       |
| 13    | 完了             | 成果物最終確認・PR準備                                          | PR作成可能な状態                        |

---

## 6. 完了条件チェックリスト

### 機能要件

- [ ] `SkillImportDialog` が `skill.name`（文字列名）を `window.electronAPI.skill.import()` に渡す
- [ ] `AgentView` / `agentSlice` の引数名が `skillName` に統一されている
- [ ] `importedSkillIds` の判定軸が送信値（`skillName`）と整合している
- [ ] `skill:import` 実行でスキルが正常にインポートされる（`IMPORT_ERROR` が発生しない）
- [ ] `getSkillByName()` が `null` を返さず `ImportedSkill` を返す

### 品質要件

- [ ] `pnpm lint` が PASS する
- [ ] `pnpm typecheck` が PASS する
- [ ] 関連テスト + 追加テストが全て PASS する
- [ ] Line Coverage 80%以上、Branch Coverage 60%以上、Function Coverage 80%以上
- [ ] テストで `window.electronAPI.skill.import` 呼び出し引数が `skill.name` であることを固定検証している
- [ ] P42準拠: Renderer側から渡される値が空文字列・trim空文字列でないことをテストで確認

### ドキュメント要件

- [ ] Phase 12 チェックリスト全項目完了（LOGS.md 2ファイル、SKILL.md 2ファイル、topic-map.md 再生成）
- [ ] `documentation-changelog.md` に変更内容を記録
- [ ] 未タスク検出レポート作成（0件でも必須）

---

## 7. 検証方法

### 7.1 テストケース

| #   | テストケース                                            | 期待結果                                                     |
| --- | ------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | `SkillImportDialog` でスキルを選択してインポート        | `window.electronAPI.skill.import` に `skill.name` が渡される |
| 2   | `getSkillByName()` が `skill.name` で検索               | `ImportedSkill` オブジェクトが返る（`null` ではない）        |
| 3   | `importedSkillIds` に `skill.name` ベースの値が含まれる | 既にインポート済みのスキルが正しく判定される                 |
| 4   | 不正なスキル名（空文字列）を渡す                        | バリデーションエラーが返る                                   |
| 5   | trim空文字列（`"   "`）を渡す                           | P42準拠バリデーションエラーが返る                            |
| 6   | 既存UIのチェック状態・無効化表示                        | インポート済みスキルが正しく無効化表示される                 |

### 7.2 検証手順

1. テストを Red 状態で作成（`skill.name` 送信を前提としたテスト）
2. 実装を修正して Green 状態にする
3. 手動テストでダイアログ操作 → インポート成功を確認
4. 全テスト実行でリグレッションがないことを確認

### 7.3 推奨実行コマンド

```bash
# SkillImportDialog テスト
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/SkillImportDialog

# agentSlice テスト
cd apps/desktop && pnpm vitest run src/renderer/store/slices/agentSlice

# AgentView テスト
cd apps/desktop && pnpm vitest run src/renderer/views/AgentView

# 全体品質検証
pnpm lint && pnpm typecheck

# カバレッジ確認
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/organisms/SkillImportDialog
```

---

## 8. リスクと対策

| リスク                                                                                                                 | 影響度 | 確率 | 対策                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------- | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID/Name の混在が別コンポーネントで再発する                                                                             | 高     | 中   | 変数名と型を `skillName` に統一し、テストで引数値を固定検証。`grep -rn "skill\.id" apps/desktop/src/renderer/` で残存箇所を検出                               |
| `importedSkillIds` の軸変更でUI表示が崩れる                                                                            | 中     | 中   | ダイアログの選択状態テストを追加。手動テストで既存表示の退行確認                                                                                              |
| 成功ログと失敗ログが混在し障害切り分けが困難になる                                                                     | 中     | 低   | テストでは最終レスポンス（IPC戻り値）で成功判定する。中間ログに依存しない検証戦略                                                                             |
| `skill/SkillImportDialog.tsx`（旧パス）と `organisms/SkillImportDialog/index.tsx` の両方が存在し、修正対象を取り違える | 高     | 中   | 修正前に `import` パスを確認し、実際に `AgentView` が使用しているコンポーネントを特定。同名コンポーネントが複数ある場合は使用側の `import` パスを先に確認する |
| P23パターン: 型定義の二箇所同時更新漏れ                                                                                | 中     | 中   | P32準拠で `agentSlice` の型と `SkillImportDialog` の型を同一コミットで更新。`pnpm typecheck` で整合性を検証                                                   |

---

## 9. 参照情報

### 仕様書参照テーブル

| 仕様書                                    | 関連セクション                                                 |
| ----------------------------------------- | -------------------------------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | SkillImportDialog・agentSlice 型定義                           |
| `architecture-implementation-patterns.md` | IPC型不整合解決パターン                                        |
| `security-electron-ipc.md`                | IPCバリデーション原則・P42準拠3段バリデーション                |
| `task-workflow.md`                        | 残課題テーブル（UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 エントリ） |

### 関連タスクテーブル

| タスクID                            | 関連内容                                                     | ステータス |
| ----------------------------------- | ------------------------------------------------------------ | ---------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001   | `skill:import` IPC引数形式統一（`skillName: string` に変更） | 解決済み   |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | `skill:import` 戻り値型修正（`ImportedSkill` に変更）        | 解決済み   |
| UT-FIX-SKILL-REMOVE-INTERFACE-001   | `skill:remove` IPC引数形式統一（`skillName: string` に変更） | 解決済み   |
| UT-FIX-SKILL-IPC-NAMING-P45-001     | IPC引数命名統一（P45横展開）                                 | 未実施     |
| TASK-UI-00-TOKENS                   | デザイントークン基盤（本タスクの親タスク群）                 | 進行中     |

### 関連Pitfall

| Pitfall ID | タイトル                                                         | 本タスクとの関連                                                     |
| ---------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| P44        | skill:import/remove IPCハンドラとPreloadのインターフェース不整合 | Renderer側でも同パターンの不整合が存在（`skill.id` vs `skill.name`） |
| P45        | IPC引数命名の契約ドリフト（skillId vs skillName）                | `importedSkillIds` のセマンティクスが送信値と乖離                    |
| P42        | 文字列引数の `.trim()` バリデーション漏れ                        | Renderer側から渡される値の妥当性検証                                 |
| P23        | API二重定義の型管理複雑性                                        | 型定義の複数箇所同時更新が必要                                       |
| P32        | 型定義の二箇所同時更新必須                                       | `agentSlice` と `SkillImportDialog` の型を同一コミットで更新         |

### 関連ソースファイル

| ファイルパス                                                                 | 役割                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` | 主要修正対象: `skill.id` → `skill.name` への変更 |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                        | インポート処理の呼び出し元                       |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                       | `importedSkillIds` の管理・判定ロジック          |
| `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`           | 旧パスのコンポーネント（修正対象の取り違え注意） |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts`                 | `getSkillByName()` の実装（参照のみ、修正不要）  |
| `apps/desktop/src/main/ipc/index.ts`                                         | `skill:import` ハンドラ（修正済み、参照のみ）    |

---

## 10. 備考

### レビュー指摘原文

TASK-UI-00-TOKENS のランタイムエラー調査中に発見。`skill:import` 実行時に以下のエラーが発生:

> `getSkillByName()` returns null for hash-based skill.id value. Expected skill.name (string name) but received skill.id (hash value).

### 補足事項

- 同名コンポーネント（`skill/SkillImportDialog.tsx` と `organisms/SkillImportDialog/index.tsx`）が2箇所に存在する。修正前に `AgentView` の `import` パスを確認し、実際に使用されているコンポーネントを特定すること
- IPCでは「変数名」と「実値」の意味一致を常にテストで固定すること（P45教訓）
- 「中間成功ログ」ではなく最終レスポンスで成功判定すること（TASK-UI-00-TOKENS教訓）
