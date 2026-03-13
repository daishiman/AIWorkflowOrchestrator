# organisms/SkillImportDialog skill.id/skill.name 不一致バグ修正 - タスク指示書

## メタ情報

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001                                                  |
| タスク名     | organisms/SkillImportDialog が skill.id（ハッシュ）を skillName として渡すバグの修正 |
| 分類         | バグ修正                                                                             |
| 対象機能     | スキルインポート機能（organisms/SkillImportDialog → agentSlice → skill:import IPC）  |
| 優先度       | 高（スキルインポート機能が100%失敗するため）                                         |
| 見積もり規模 | 小規模                                                                               |
| ステータス   | 完了                                                                                 |
| 発見元       | 実機ランタイムエラーログ分析・コードトレース調査（2026-02-22）                       |
| 発見日       | 2026-02-22                                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill:import` IPCチャンネルには、引数形式（UT-FIX-SKILL-IMPORT-INTERFACE-001で修正済み）と戻り値型（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001で対応済み）の不整合が存在したが、それらの修正後も**スキルインポート操作が100%失敗する**問題が残存している。

実機のランタイムログで以下のエラーが確認された:

```
[SkillImportManager] importSkills called with: [ 'a478b3e7c728cd18' ]
[SkillImportManager] Persisting: 1 items
[SkillImportManager] Persist successful
[SkillImportManager] importSkills result: 1 new imports
Error occurred in handler for 'skill:import': {
  code: 'IMPORT_ERROR',
  message: 'Failed to import skill: a478b3e7c728cd18'
}
```

注目点: `importSkills` 自体は成功（persist完了・1 new imports）しているが、ハンドラ後段の `getSkillByName('a478b3e7c728cd18')` が `null` を返し、`IMPORT_ERROR` がスローされている。

### 1.2 問題点・課題

**根本原因**: Renderer側の `organisms/SkillImportDialog/index.tsx` がスキル選択時に `skill.id`（SHA-256ハッシュの先頭16文字）を使用し、その値が `skillName` パラメータとしてIPCハンドラに到達する。ハンドラ内の `getSkillByName(skillName)` は `skill.name`（人間可読名、例: `"task-specification-creator"`）と比較するため、ハッシュ値とは一致せず `null` を返す。

**データフロー詳細**:

| ステップ | コンポーネント                 | ファイル:行                                 | 値                                                                    | 問題                                                     |
| -------- | ------------------------------ | ------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| 1        | SkillImportDialog（organisms） | `organisms/SkillImportDialog/index.tsx:174` | `handleToggleSkill(skill.id)` → `selectedIds.add("a478b3e7c728cd18")` | ❌ `skill.id`（ハッシュ）を使用                          |
| 2        | SkillImportDialog handleImport | `organisms/SkillImportDialog/index.tsx:97`  | `onImport(Array.from(selectedIds))` → `["a478b3e7c728cd18"]`          | ❌ ハッシュ配列を親に渡す                                |
| 3        | AgentView handleImport         | `AgentView/index.tsx:222`                   | `importSkillAction(skillName)` where `skillName = "a478b3e7c728cd18"` | ❌ 変数名は `skillName` だが実値はハッシュ               |
| 4        | agentSlice importSkill         | `agentSlice.ts:606`                         | `window.electronAPI.skill.import("a478b3e7c728cd18")`                 | ❌ ハッシュがIPCに送信される                             |
| 5        | IPC Handler                    | `skillHandlers.ts:139`                      | `skillService.importSkills(["a478b3e7c728cd18"])`                     | ✓ ImportManager はハッシュでも成功                       |
| 6        | IPC Handler                    | `skillHandlers.ts:143`                      | `skillService.getSkillByName("a478b3e7c728cd18")`                     | ❌ `skill.name === "a478b3e7c728cd18"` → 不一致 → `null` |
| 7        | IPC Handler                    | `skillHandlers.ts:150`                      | `throw { code: "IMPORT_ERROR" }`                                      | ❌ エラー                                                |

**`Skill` 型の `id` と `name` の違い**:

```typescript
// packages/shared/src/types/skill.ts
interface Skill {
  id: string; // SHA-256ハッシュの先頭16文字（例: "a478b3e7c728cd18"）
  name: string; // SKILL.md frontmatter.name || ディレクトリ名（例: "task-specification-creator"）
  slug: string; // ディレクトリ名（例: "task-specification-creator"）
  // ...
}
```

**SkillParser での ID 生成**（`SkillParser.ts:134-139`）:

```typescript
private generateId(filePath: string): string {
  return crypto.createHash("sha256").update(filePath).digest("hex").slice(0, 16);
}
```

**キャッシュ構造との関係**:

- `SkillService.cache`: `Map<string, Skill>` — キーは `skill.id`（ハッシュ）
- `getSkillByName(name)`: キャッシュの値（`Skill`）をイテレートし、`skill.name === name` で検索
- `getSkillById(id)`: `this.cache.get(id)` で直接ルックアップ

### 1.3 放置した場合の影響

- **スキルインポート機能が完全に使用不可能**: `organisms/SkillImportDialog` 経由のインポートは100%失敗する
- **SkillImportManager の状態汚染**: `importSkills` は成功するため、`importedIds` Set にハッシュ値が蓄積される。`getImportedSkills()` は `cache.get(hash)` で正常に動作するため、一見正常に見えるが、ハンドラがエラーを返すためRendererのStoreには反映されない
- **ユーザー体験の低下**: インポートボタンを押すたびにエラーが表示される
- **P45パターンの再発**: 変数名 `skillName` と実際の値（ハッシュ）のセマンティクス不一致が放置される

### 1.4 苦戦箇所と教訓

#### 苦戦1: 2つの SkillImportDialog の存在

コードベースに**2つの異なる `SkillImportDialog` コンポーネント**が存在し、調査を複雑にした:

| コンポーネント                           | パス                                                        | 使用箇所                   | Props                                                      |
| ---------------------------------------- | ----------------------------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| `components/skill/SkillImportDialog`     | `renderer/components/skill/SkillImportDialog.tsx`           | 単一スキル確認ダイアログ   | `{ skill: SkillMetadata, isOpen, onClose }`                |
| `components/organisms/SkillImportDialog` | `renderer/components/organisms/SkillImportDialog/index.tsx` | **AgentView で実際に使用** | `{ availableSkills: Skill[], importedSkillIds, onImport }` |

最初に `components/skill/SkillImportDialog` を調査したところ `importSkill(skill.name)` を使用しており問題がないように見えた。しかしAgentViewのimportは `components/organisms/SkillImportDialog` を使用しており、こちらが `skill.id` を渡していた。

**教訓**: 同名コンポーネントが複数存在する場合、**実際にレンダリングされるコンポーネントのimportパスを確認する**ことが重要。`AgentView/index.tsx:30` の `import { SkillImportDialog } from "../../components/organisms/SkillImportDialog"` がキーポイント。

#### 苦戦2: importSkills の「成功」がミスリーディング

`SkillImportManager.importSkills()` はハッシュ値でも名前でも関係なく `importedIds` Set に追加するため、**インポート処理自体は常に成功する**。ログに「Persist successful」「1 new imports」と表示されるため、一見正常に動作しているように見える。

問題は**後段の `getSkillByName()` での照合失敗**であり、ログの `Error occurred in handler` メッセージを注意深く読まないと原因を特定できない。

**教訓**: `importSkills` は引数の値の種類（ID/名前）を検証しない。キャッシュキー（`skill.id`）との整合性はこのレイヤーでは検証されず、後段の `getSkillByName` で初めて顕在化する。ログ分析時は「成功」メッセージに惑わされず、**エンドツーエンドの結果**を確認すべき。

#### 苦戦3: `importedSkillIds` の二重の意味

`AgentView` で `importedSkillIds` は `organisms/SkillImportDialog` の `importedSkillIds` prop として渡されている。このダイアログは `importedSkillIds.includes(skill.id)` で「インポート済み」判定を行う（`index.tsx:156`）。つまり `importedSkillIds` は `skill.id`（ハッシュ）のリストである前提。

しかし `agentSlice` の `importedSkillIds` selector がどこから値を取得しているかによって、この前提が正しいかどうかが変わる。RendererのStore設計とMain Processのキャッシュ設計の間で「ID」の定義が一致しているか確認が必要。

**教訓**: 同名の変数（`skillIds`、`skillName`）が異なるレイヤーで異なるセマンティクスを持つ場合（P45パターン）、型システムだけでは検出できない。ランタイムでのデータフロートレースが必要。

---

## 2. 何を達成するか（What）

### 2.1 目的

`organisms/SkillImportDialog` から `skill:import` IPCハンドラまでのデータフローで、スキルの識別に使用する値を統一し、スキルインポート機能を正常に動作させる。

### 2.2 最終ゴール

- スキルインポートが正常に完了し、Renderer の `importedSkills` 配列に `ImportedSkill` オブジェクトが正しく追加される
- `organisms/SkillImportDialog` で選択したスキルが100%インポートに成功する
- 変数名と実際の値のセマンティクスが全レイヤーで一致する

### 2.3 スコープ

#### 含むもの

- `organisms/SkillImportDialog/index.tsx` の修正（`skill.id` → `skill.name` への変更）
- `AgentView/index.tsx` の `handleImport` 引数名の修正（`skillIds` → `skillNames`）
- `organisms/SkillImportDialog` の `importedSkillIds` prop の整合性確認・修正
- 関連するユニットテストの更新
- `organisms/SkillImportDialog` のテスト（`__tests__/SkillImportDialog.test.tsx`）の更新

#### 含まないもの

- `components/skill/SkillImportDialog.tsx`（別コンポーネント、問題なし）
- `skill:import` IPCハンドラの変更（既に `getSkillByName` で正しく処理する設計）
- `SkillImportManager` の変更
- `SkillService` の変更
- 戻り値型の修正（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 で対応）

### 2.4 成果物

| 成果物                 | パス                                                                                                    | 説明                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 修正済みコンポーネント | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | `skill.id` → `skill.name` 変更      |
| 修正済みAgentView      | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   | `handleImport` 引数名・型の修正     |
| 更新済みテスト         | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | 新しいデータフローに合わせたテスト  |
| Phase 12成果物         | `docs/30-workflows/` 配下                                                                               | 実装ガイド・documentation-changelog |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-IMPORT-INTERFACE-001 が完了していること（引数形式 `string` 統一）
- UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 が完了していること（戻り値型 `ImportedSkill` 変換）
- `skill:import` IPCハンドラが `getSkillByName(skillName)` で `ImportedSkill` を返す実装になっていること

### 3.2 依存タスク

| タスクID                            | 概要                      | ステータス            |
| ----------------------------------- | ------------------------- | --------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001   | skill:import 引数形式統一 | ✅ 完了（2026-02-21） |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | skill:import 戻り値型変換 | ✅ 完了（ceee8a98）   |

### 3.3 必要な知識

- Electronの3プロセスモデル（Renderer → Preload → Main）
- Zustand Store（agentSlice）のアクション設計
- `Skill` 型の `id`（ハッシュ）と `name`（人間可読名）の違い
- P44/P45パターン（IPC引数の契約ドリフト）

### 3.4 推奨アプローチ

**方針A（推奨）: SkillImportDialog で `skill.name` を使用する**

`organisms/SkillImportDialog` の選択管理を `skill.id` から `skill.name` に変更する。

```typescript
// ❌ 現在: skill.id（ハッシュ）を使用
const handleToggleSkill = (skillId: string) => { ... };
onChange={() => handleToggleSkill(skill.id)}

// ✅ 修正後: skill.name を使用
const handleToggleSkill = (skillName: string) => { ... };
onChange={() => handleToggleSkill(skill.name)}
```

**注意点**: `importedSkillIds` prop も `skill.name` ベースに統一する必要がある。現在 `importedSkillIds.includes(skill.id)` で「インポート済み」判定をしているため、この部分も修正が必要。

**方針B（代替）: IPC ハンドラで ID と名前の両方を試行する**

ハンドラ内で `getSkillByName` が失敗した場合に `getSkillById` をフォールバックとして使用する。ただしこの方法はP45パターン（セマンティクス不一致）を放置するため非推奨。

### 3.5 実装課題と解決策（調査からの学び）

| 課題                                                                  | 解決策                                                                     | 関連Pitfall |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------- |
| 同名コンポーネントが2つ存在し、どちらが実際に使われているか特定が困難 | AgentViewのimportパスを確認:`../../components/organisms/SkillImportDialog` | -           |
| `importSkills`がID/名前を区別せず成功するため、エラーの局所化が困難   | エンドツーエンドのデータフロートレースで確認。ログの「成功」に惑わされない | P45         |
| `importedSkillIds` が `skill.id` ベースか `skill.name` ベースか曖昧   | agentSlice の `importedSkillIds` selector の実装を確認し、統一する         | P44, P45    |
| 変数名 `skillIds` / `skillName` のセマンティクスが混在                | 全レイヤーで統一した命名を使用する                                         | P45         |

### 3.6 システム仕様書参照テーブル

| 仕様書                                    | セクション                  | 確認事項                                  |
| ----------------------------------------- | --------------------------- | ----------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | skill:import リクエスト契約 | 引数形式が `skillName: string` であること |
| `api-ipc-agent.md`                        | スキル管理IPCチャンネル     | チャンネル定義と戻り値型                  |
| `architecture-implementation-patterns.md` | P44/P45対策パターン         | IPC契約ドリフト防止策                     |
| `security-electron-ipc.md`                | IPC セキュリティ原則        | バリデーション要件                        |
| `arch-state-management.md`                | Zustand設計原則             | agentSlice の状態設計                     |
| `.claude/rules/06-known-pitfalls.md`      | P44, P45                    | 引数命名の契約ドリフト防止                |

---

## 4. 実行手順

### Phase構成

| Phase | 名称                                 | 概要                               |
| ----- | ------------------------------------ | ---------------------------------- |
| 1-3   | 要件定義・設計・レビュー             | 修正対象の特定と設計               |
| 4     | テスト作成                           | 修正前のテストケース設計           |
| 5     | 実装                                 | organisms/SkillImportDialog の修正 |
| 6-7   | テスト拡充・カバレッジ               | テスト補完                         |
| 8-9   | リファクタリング・品質検証           | コード品質確認                     |
| 10-13 | レビュー・テスト・ドキュメント・完了 | 最終確認                           |

### Phase 1-3: 要件定義・設計・レビュー

#### 目的

修正対象の最終確認と修正方針の決定。

#### 手順

1. `organisms/SkillImportDialog/index.tsx` を読み、`skill.id` 使用箇所を特定する（line 156, 157, 174）
2. `AgentView/index.tsx` の `handleImport` と `importedSkillIds` の使用箇所を確認する
3. `agentSlice.ts` の `importedSkillIds` がどのように管理されているか確認する（`skill.id` ベースか `skill.name` ベースか）
4. 修正方針を決定する（方針A推奨）

#### 成果物

- 修正対象ファイル一覧と変更箇所の特定

#### 完了条件

- [ ] `skill.id` を使用している全箇所が特定されていること
- [ ] `importedSkillIds` のセマンティクスが確認されていること

### Phase 4: テスト作成

#### 目的

修正前に失敗するテストケースを作成する（TDD Red）。

#### 手順

1. `organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` に以下のテストを追加:
   - `onImport` に `skill.name`（人間可読名）が渡されることを検証するテスト
   - インポート済みスキルの判定が `skill.name` ベースで行われることを検証するテスト
2. `AgentView` のテストで `handleImport` が `skill.name` を受け取ることを検証

#### 成果物

- 修正前に失敗するテストケース

#### 完了条件

- [ ] テストが現在のコードで失敗すること（Red状態）

### Phase 5: 実装

#### 目的

`organisms/SkillImportDialog` を修正し、`skill.name` を使用するようにする。

#### 手順

1. `organisms/SkillImportDialog/index.tsx` の修正:

```typescript
// 修正前（line 79）
const handleToggleSkill = (skillId: string) => {
  if (importedSkillIds.includes(skillId)) return;
  // ...
};

// 修正後
const handleToggleSkill = (skillName: string) => {
  if (importedSkillNames.includes(skillName)) return;
  // ...
};
```

2. チェックボックスのonChange修正:

```typescript
// 修正前（line 174）
onChange={() => handleToggleSkill(skill.id)}

// 修正後
onChange={() => handleToggleSkill(skill.name)}
```

3. インポート済み判定の修正:

```typescript
// 修正前（line 156）
const isImported = importedSkillIds.includes(skill.id);

// 修正後
const isImported = importedSkillNames.includes(skill.name);
```

4. `selectedIds` state の名前変更:

```typescript
// 修正前
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// 修正後
const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
```

5. Props型の修正:

```typescript
// 修正前
importedSkillIds: string[];  // skill.id のリスト
onImport: (skillIds: string[]) => void;

// 修正後
importedSkillNames: string[];  // skill.name のリスト
onImport: (skillNames: string[]) => void;
```

6. `AgentView/index.tsx` の修正:
   - `handleImport` の引数名を `skillNames` に変更
   - `importedSkillIds` → `importedSkillNames` に変更（セレクタの修正が必要な場合）

#### 成果物

- 修正済み `organisms/SkillImportDialog/index.tsx`
- 修正済み `AgentView/index.tsx`

#### 完了条件

- [ ] `onImport` に `skill.name` が渡されること
- [ ] インポート済み判定が正しく動作すること
- [ ] Phase 4 のテストが全てパスすること（Green状態）

### Phase 6-9: テスト拡充・品質検証

#### 目的

カバレッジ確認とリファクタリング。

#### 手順

1. カバレッジ基準（Line 80%, Branch 60%, Function 80%）の充足確認
2. Lint・型チェック実行
3. 全テスト実行

#### 完了条件

- [ ] カバレッジ基準を充足すること
- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること

### Phase 10-13: レビュー・ドキュメント・完了

#### 目的

最終レビュー、手動テスト、ドキュメント更新。

#### 手順

1. Phase 10: 最終レビュー（PASS/MINOR/MAJOR判定）
2. Phase 11: 手動テスト（開発環境でスキルインポートを実行し成功することを確認）
3. Phase 12: ドキュメント更新（実装ガイド・システム仕様書・LOGS.md×2・SKILL.md×2・topic-map.md）
4. Phase 13: PR準備

#### 完了条件

- [ ] Phase 10 PASS 判定
- [ ] 手動テストでスキルインポート成功確認
- [ ] Phase 12 全チェックリスト完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `organisms/SkillImportDialog` でスキル選択時に `skill.name` が使用されること
- [ ] `onImport` コールバックに `skill.name` の配列が渡されること
- [ ] インポート済み判定が `skill.name` ベースで正しく動作すること
- [ ] IPCハンドラの `getSkillByName(skillName)` が `ImportedSkill` を正常に返すこと
- [ ] Renderer の `importedSkills` に正しい `ImportedSkill` が追加されること

### 品質要件

- [ ] ユニットテスト全PASS
- [ ] カバレッジ基準充足（Line 80%, Branch 60%, Function 80%）
- [ ] `pnpm lint` PASS
- [ ] `pnpm typecheck` PASS

### ドキュメント要件

- [ ] 実装ガイド（Part 1: 中学生レベル / Part 2: 開発者向け）
- [ ] documentation-changelog.md
- [ ] LOGS.md × 2ファイル更新
- [ ] SKILL.md × 2ファイル更新
- [ ] topic-map.md 再生成
- [ ] 未タスク検出レポート（0件でも必須）

---

## 6. 検証方法

### テストケース

| テストID | テスト内容                                                            | 期待結果                                                                 |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| TC-01    | スキル選択時に `skill.name` が `selectedNames` に追加される           | `selectedNames.has("task-specification-creator")` = true                 |
| TC-02    | インポートボタン押下時に `onImport` が `skill.name` 配列を受け取る    | `onImport(["task-specification-creator"])`                               |
| TC-03    | インポート済みスキルが `skill.name` で判定される                      | `isImported = importedSkillNames.includes("task-specification-creator")` |
| TC-04    | エンドツーエンド: Renderer → IPC → getSkillByName → ImportedSkill返却 | エラーなしでインポート完了                                               |

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/SkillImportDialog/` でユニットテスト実行
2. `cd apps/desktop && pnpm vitest run src/renderer/views/AgentView/` でAgentViewテスト実行
3. 開発環境（`pnpm --filter @repo/desktop dev`）で手動テスト: スキルインポートダイアログからスキルを選択・インポート → 成功確認
4. DevTools Console で `IMPORT_ERROR` が出力されないことを確認

---

## 7. リスクと対策

| リスク                                                                                 | 影響度 | 発生確率 | 対策                                                                                    |
| -------------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| `importedSkillIds` を使用する他のコンポーネントが壊れる                                | 中     | 中       | `grep -rn "importedSkillIds" apps/desktop/src/renderer/` で全使用箇所を事前調査         |
| AgentView以外のインポートパスが存在する                                                | 低     | 低       | `grep -rn "skill\.import\|importSkill" apps/desktop/src/renderer/` で全呼び出し元を確認 |
| `importedSkillIds` selector の戻り値が `skill.id` ベースの場合、selector側の修正も必要 | 高     | 高       | Phase 1 で `importedSkillIds` selector の実装を必ず確認する                             |
| P39（happy-dom userEvent非互換）によるテスト失敗                                       | 中     | 中       | `fireEvent` を使用し、`userEvent` は使用しない                                          |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                                        | 関連内容                        |
| -------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC引数の整合性確認手順         |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P44, P45（IPC引数契約ドリフト） |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | skill:import チャンネル契約     |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | agentSlice設計                  |
| 実装パターン               | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P44/P45対策パターン             |

### 関連タスク

| タスクID                            | 概要                        | ステータス | 関係                                      |
| ----------------------------------- | --------------------------- | ---------- | ----------------------------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001   | skill:import 引数形式統一   | ✅ 完了    | 前提（引数形式を `string` に統一）        |
| UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 | skill:import 戻り値型変換   | ✅ 完了    | 前提（ImportResult → ImportedSkill 変換） |
| UT-FIX-SKILL-REMOVE-INTERFACE-001   | skill:remove 引数形式統一   | ✅ 完了    | 参考（同パターンの修正事例）              |
| UT-FIX-SKILL-IPC-NAMING-P45-001     | skill系全ハンドラの命名統一 | 未実施     | 関連（命名の統一）                        |

### 参考Pitfall

| Pitfall ID | タイトル                                      | 関連性                                                  |
| ---------- | --------------------------------------------- | ------------------------------------------------------- |
| P44        | skill:import/remove IPCインターフェース不整合 | 直接関連（Renderer→Mainのデータフロー不一致）           |
| P45        | IPC引数命名の契約ドリフト                     | 直接関連（skillId vs skillName のセマンティクス不一致） |
| P39        | happy-dom環境でのuserEvent非互換              | テスト作成時の注意事項                                  |
| P40        | テスト実行ディレクトリ依存（モノレポ）        | テスト実行時の注意事項                                  |

---

## 9. 備考

### エラーログ原文

```
00:17:24.317 › [SkillImportManager] importSkills called with: [ 'a478b3e7c728cd18' ]
00:17:24.319 › [SkillImportManager] Persisting: 1 items
00:17:24.324 › [SkillImportManager] Persist successful
00:17:24.324 › [SkillImportManager] importSkills result: 1 new imports
Error occurred in handler for 'skill:import': {
  code: 'IMPORT_ERROR',
  message: 'Failed to import skill: a478b3e7c728cd18'
}
00:17:53.207 › [SkillImportManager] importSkills called with: [ '0b5ca1c868c68cb5' ]
00:17:53.209 › [SkillImportManager] Persisting: 2 items
00:17:53.215 › [SkillImportManager] Persist successful
00:17:53.215 › [SkillImportManager] importSkills result: 1 new imports
Error occurred in handler for 'skill:import': {
  code: 'IMPORT_ERROR',
  message: 'Failed to import skill: 0b5ca1c868c68cb5'
}
```

### 補足事項

- このバグは UT-FIX-SKILL-IMPORT-INTERFACE-001（引数形式修正）と UT-FIX-SKILL-IMPORT-RETURN-TYPE-001（戻り値型修正）の**両方が完了した後に**初めて顕在化する。それ以前は引数形式のバリデーションエラーで先に止まるため、この問題には到達しない。
- `components/skill/SkillImportDialog.tsx` は単一スキルの確認ダイアログとして別用途で使用されており、こちらは `skill.name` を正しく使用しているため修正不要。
- 修正時は `importedSkillIds` の prop名とselector名も `importedSkillNames` に変更することを推奨する（P45パターン防止）。ただし、selector側の変更が大規模になる場合は別タスクとして切り出すことも検討する。
