# Phase 8: リファクタリング（TDD: Refactor） - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 8                                   |
| Phase名    | リファクタリング（TDD: Refactor）   |
| タスクID   | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 前提Phase  | Phase 7（カバレッジ確認）           |
| 後続Phase  | Phase 9（品質保証）                 |
| ステータス | 未実施                              |
| 作成日     | 2026-02-22                          |
| 機能名     | skill-import-id-mismatch-fix        |

---

## 目的

Phase 5〜7 で実装・テスト完了した修正コードに対し、テストが全て Green の状態を維持しながら、命名の一貫性とコード品質を改善する。機能変更は一切行わない。

## 背景

SkillImportDialog のバグ修正（`skill.id` → `skill.name`）により、`id`/`name` の混在が解消されたが、AgentView 側の変数名・型キャストに改善余地がある。TDD の Refactor フェーズとして、テスト結果を変えずにコードの可読性・保守性を向上させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

- タスク1: リファクタリング候補を抽出して影響範囲を特定する
- タスク2: AgentView の引数命名をセマンティクスに合わせて統一する
- タスク3: SkillImportDialog Props 命名の整合性を確認する
- タスク4: 型キャスト解消の可否を判断して記録する
- タスク5: 回帰テストを実行して非機能変更であることを確認する

### タスク1: リファクタリング対象の抽出

**目的**: 修正対象3ファイルのコード品質を分析し、リファクタリング候補を特定する

**実行手順**:

1. 以下の3ファイルを読み込む
   - `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`
   - `apps/desktop/src/renderer/views/AgentView/index.tsx`
   - `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx`
2. 以下の観点でリファクタリング候補を特定する

**分析観点**:

| 観点                               | 確認内容                                                                                                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 変数名 `skillIds` の命名           | AgentView の `handleImport` 関数の引数名 `skillIds` は、Phase 5 修正後に実際に渡される値が `skill.name`（人間可読名）に変わったため、`skillNames` に変更すべきか判断する                          |
| `for...of` ループ内の変数名        | `handleImport` 内の `for (const skillName of skillIds)` で、ループ変数は `skillName` だがイテレータは `skillIds` であり、命名が不整合かどうか判断する                                             |
| 型キャスト `as unknown as Skill[]` | AgentView 247行目 `const skills = importedSkills as unknown as Skill[];` および 250行目 `const availableSkills = availableSkillsMetadata as unknown as Skill[];` の型キャストが解消可能か判断する |
| SkillImportDialog の Props 命名    | `onImport: (skillIds: string[]) => void` の引数名 `skillIds` が、実際に `skill.name` の配列を渡すことと整合しているか確認する                                                                     |
| `importedSkillIds` Props 命名      | `importedSkillIds: string[]` が実際に `skill.id`（ハッシュ）なのか `skill.name` なのかを確認し、命名が実態と一致しているか判断する                                                                |

**期待される成果物**:

- `outputs/phase-8/refactoring-candidates.md`

---

### タスク2: AgentView `handleImport` の変数名統一

**目的**: `handleImport` 関数内の変数名を実際のセマンティクスに合わせて統一する

**実行手順**:

1. `apps/desktop/src/renderer/views/AgentView/index.tsx` を開く
2. `handleImport` 関数の引数名 `skillIds` を `skillNames` に変更する
3. 関数内で `skillIds` を参照している箇所を全て `skillNames` に変更する
4. 変更後、以下のコマンドでテストを実行し、全件 PASS を確認する

**変更前のコード**:

```typescript
const handleImport = useCallback(
  async (skillIds: string[]) => {
    try {
      for (const skillName of skillIds) {
        await importSkillAction(skillName);
      }
      showToast("success", `${skillIds.length}件のスキルをインポートしました`);
      closeImportDialog();
    } catch (err) {
      // ...
    }
  },
  [closeImportDialog, importSkillAction, showToast],
);
```

**変更後のコード**:

```typescript
const handleImport = useCallback(
  async (skillNames: string[]) => {
    try {
      for (const skillName of skillNames) {
        await importSkillAction(skillName);
      }
      showToast(
        "success",
        `${skillNames.length}件のスキルをインポートしました`,
      );
      closeImportDialog();
    } catch (err) {
      // ...
    }
  },
  [closeImportDialog, importSkillAction, showToast],
);
```

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/SkillImportDialog/__tests__/ --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/variable-rename-result.md`

---

### タスク3: SkillImportDialog Props 命名の整合性確認

**目的**: SkillImportDialog の Props 型で `skillIds` と命名されている箇所の実態を確認し、リネーム判断を行う

**実行手順**:

1. `SkillImportDialogProps` の `onImport: (skillIds: string[]) => void` を確認する
2. 実際に `onImport` に渡される値が `skill.id`（ハッシュ）か `skill.name`（人間可読名）かを特定する
3. SkillImportDialog 内部の `selectedIds` 変数と `handleToggleSkill(skillId)` の引数名を確認する
4. `importedSkillIds` が実際に `skill.id` を格納しているか確認する（AgentView での渡し方を追跡）
5. 以下の判断基準に基づいてリネーム実施/見送りを決定する

**判断基準**:

| 判断           | 条件                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| リネームする   | 変数名のセマンティクスが実際の値と不一致である場合                                   |
| リネームしない | 変数名が実態と一致している場合、または変更の影響範囲が本タスクのスコープを超える場合 |

**注意**: SkillImportDialog 内部で `skill.id` を使用して選択状態を管理している部分（`selectedIds`, `handleToggleSkill`）は、コンポーネント内部のローカル状態管理であり、IPC に渡す値とは異なる。内部状態管理には `skill.id` を使い続けるのが適切である可能性がある。この区別を明確に判断すること。

**リネーム見送りの場合**: 見送り理由を成果物に記録する。波及範囲が大きい場合は未タスク仕様書として Phase 10 で記録する。

**確認コマンド**（リネーム実施の場合）:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/SkillImportDialog/__tests__/ --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/props-naming-review.md`

---

### タスク4: 型キャスト解消の検討

**目的**: AgentView の `as unknown as Skill[]` 型キャストの解消可否を判断する

**実行手順**:

1. AgentView 247行目 `const skills = importedSkills as unknown as Skill[];` の `importedSkills` の実際の型を確認する
2. AgentView 250行目 `const availableSkills = availableSkillsMetadata as unknown as Skill[];` の `availableSkillsMetadata` の実際の型を確認する
3. `importedSkills` と `availableSkillsMetadata` が Zustand Store（agentSlice）から取得される値の型を追跡する
4. 型キャストが必要な理由（`ImportedSkill` vs `Skill` の型差異）を特定する
5. 以下の判断基準に基づいて解消実施/見送りを決定する

**判断基準**:

| 判断     | 条件                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 解消する | 型定義の変更で `as unknown as` を除去でき、変更影響が本タスクのスコープ内に収まる場合 |
| 見送る   | 型定義の変更が `@repo/shared` や agentSlice の型定義変更を伴い、スコープを超える場合  |

**注意**: 型キャストの解消が `packages/shared/src/agent/types.ts` や `apps/desktop/src/preload/types.ts` の変更を伴う場合、P32（型定義の二箇所同時更新必須）に該当するため、本タスクでは見送り、未タスク仕様書に記録する。

**期待される成果物**:

- `outputs/phase-8/type-cast-review.md`

---

### タスク5: 回帰テスト実行と確認

**目的**: リファクタリング後のテストが全件 PASS であることを確認する

**実行手順**:

1. SkillImportDialog のテストを実行する
2. AgentView のテストを実行する（テストが存在する場合）
3. desktop パッケージ全体のテストを実行する

**コマンド**:

```bash
# SkillImportDialog テスト
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/SkillImportDialog/__tests__/ --reporter=verbose

# desktop 全体テスト
cd apps/desktop && pnpm vitest run --reporter=verbose
```

**確認項目**:

| 確認項目                 | 基準                                                  |
| ------------------------ | ----------------------------------------------------- |
| SkillImportDialog テスト | 全件 PASS                                             |
| AgentView テスト         | 全件 PASS（テストが存在する場合）                     |
| desktop 全体テスト       | 既存テストに regression がないこと                    |
| テスト結果の差分         | リファクタリング前と PASS/FAIL の件数が同一であること |

**注意（P39/P40）**:

- テストは `cd apps/desktop` してから実行すること（P40: テスト実行ディレクトリ依存）
- happy-dom 環境では `userEvent` ではなく `fireEvent` を使用すること（P39: happy-dom 環境での userEvent 非互換）

**期待される成果物**:

- `outputs/phase-8/regression-test-result.md`

---

## 参照資料

| 参照資料               | パス                                                                                                    | 内容                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------- |
| SkillImportDialog 実装 | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | 修正対象コンポーネント |
| AgentView 実装         | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   | 修正対象ビュー         |
| テストファイル         | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | テストコード           |
| Phase 1 要件定義       | `phase-1-requirements.md`                                                                               | 要件定義（FR-1〜FR-6） |
| Phase 2 設計           | `phase-2-design.md`                                                                                     | コード変更設計         |
| Phase 5 実装           | `phase-5-implementation.md`                                                                             | 依存 Phase             |
| Phase 6 テスト拡充     | `phase-6-test-expansion.md`                                                                             | 依存 Phase             |
| Phase 7 カバレッジ確認 | `phase-7-coverage-check.md`                                                                             | 依存 Phase             |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                        |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skill:import チャンネル契約 |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | agentSlice 設計             |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | IPC引数の整合性確認手順     |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                              | P39, P40, P44, P45          |
| 開発ガイドライン           | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | コーディング規約            |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準                    |

---

## 成果物

| 成果物                   | パス                                        | 内容                             |
| ------------------------ | ------------------------------------------- | -------------------------------- |
| リファクタリング候補分析 | `outputs/phase-8/refactoring-candidates.md` | 改善ポイントの特定結果           |
| 変数名統一結果           | `outputs/phase-8/variable-rename-result.md` | handleImport 変数名変更結果      |
| Props 命名レビュー       | `outputs/phase-8/props-naming-review.md`    | Props 命名の整合性確認結果       |
| 型キャストレビュー       | `outputs/phase-8/type-cast-review.md`       | as unknown as 解消可否の判断結果 |
| 回帰テスト結果           | `outputs/phase-8/regression-test-result.md` | テスト全件 PASS の確認記録       |

---

## 統合テスト連携【必須】

| 確認項目         | 基準                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 5 接続     | 実装結果の挙動が変わっていないこと                                                                                                        |
| Phase 6 接続     | 拡充テストが全件 PASS のままであること                                                                                                    |
| Phase 7 接続     | カバレッジがリファクタリング前と同等以上であること                                                                                        |
| データフロー確認 | SkillImportDialog(skill.name) → AgentView(skillName) → agentSlice → IPC(skillName) → getSkillByName(skillName) の流れが維持されていること |

---

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React 実装の場合         | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer 連携の場合    | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

---

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施（タスク1〜5）
3. 統合テスト連携の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json 更新方針が明記されている
- [ ] Phase 末端で完了を明記している

---

## 完了条件

- [ ] リファクタリング候補が列挙され、各候補に対して実施/見送りの判断と理由が記録されている
- [ ] AgentView `handleImport` の変数名が実態に合わせて統一されている
- [ ] SkillImportDialog Props 命名の整合性が確認され、判断結果が記録されている
- [ ] 型キャスト `as unknown as Skill[]` の解消可否が判断され、理由が記録されている
- [ ] 全テストがリファクタリング前と同一の PASS/FAIL 結果であること
- [ ] **機能変更が一切ないこと**（テスト結果が変わっていないことで確認）
- [ ] **本 Phase 内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] テストが継続して Green 状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-id-mismatch-fix/phase-9-quality-assurance.md`
