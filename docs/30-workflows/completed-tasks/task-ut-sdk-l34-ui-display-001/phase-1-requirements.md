# Phase 1: 要件定義

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 1                              |
| 機能名 | task-ut-sdk-l34-ui-display-001 |
| 作成日 | 2026-04-03                     |

## 目的

`SkillLifecyclePanel.tsx`のverify detail表示をLayer別グルーピングUIに拡張するための
要件・スコープ・受け入れ条件を明文化する。

## タスク分類（UI task / docs-only task）

**UI task**: Rendererコンポーネント（`SkillLifecyclePanel.tsx`）の変更を含むため、
Phase 11でスクリーンショット撮影が必須。

## 実行タスク

- 既存コード調査: `SkillLifecyclePanel.tsx`のchecks表示部分・型定義の把握
- 要件抽出: 機能要件・非機能要件の定義
- 受け入れ条件作成: 検証可能な完了基準の定義
- スコープ確定: 含む範囲・含まない範囲の境界確定
- 命名規則調査: 既存コードのcamelCase/PascalCase規則の記録

## 参照資料

| 資料名                          | パス                                                                                               | 説明                               |
| ------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 既存UI仕様                      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | checks表示ブロックの現行実装       |
| 型定義                          | `packages/shared/src/types/skillCreator.ts`                                                        | RuntimeSkillCreatorVerifyCheck型   |
| 検証エンジン                    | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                         | Layer3/4チェックの実装             |
| テストファイル（LLM生成テスト） | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 既存layer3 fixture定義             |
| interfaces仕様                  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                  | skill:verifyDetail IPC型定義       |
| システム仕様（UI/UX）           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                    | severity表示・アイコン設計パターン |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                              | 内容                               |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| UI/UXパターン    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | severity表示・アコーディオンUI設計 |
| インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | verifyDetail IPC型定義             |
| テストパターン   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | Reactコンポーネントテスト手法      |

## 実行手順

### Step 0: P50チェック（既実装状態調査）

```bash
# SkillLifecyclePanelの最近の変更履歴
git log --oneline -20 -- apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# verifyDetail.checks表示箇所の特定
grep -n "checks.map\|verifyDetail" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30

# Layer3/4が既に対応されているか確認
grep -n "layer3\|layer4\|layerGroup\|VerifyLayer" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### Step 1: 型定義の把握

`packages/shared/src/types/skillCreator.ts`で以下を確認する：

- `RuntimeSkillCreatorVerifyCheck`
  - `id: string`
  - `layer: "layer1" | "layer2" | "layer3" | "layer4"`
  - `severity: RuntimeSkillCreatorVerifyCheckSeverity`
  - `summary: string`
  - `passed: boolean`
- `RuntimeSkillCreatorVerifyCheckSeverity`（`"info" | "warning" | "error"`）
- `RuntimeSkillCreatorVerifyDetail`

### Step 2: 現行UI実装の把握

`SkillLifecyclePanel.tsx`で以下を確認する：

1. `data-testid="skill-lifecycle-verify-detail"`のdiv内
2. `verifyDetail.checks.map`による表示箇所
3. `verifyCheckSeverityStyles`定数
4. `layer3`フィクスチャが既存テストで使われているパターン

### Step 3: Layer3/4チェックパターンの収集

`SkillCreatorVerificationEngine.ts`から以下のcheck IDと対応するseverityを記録する：

| Layer | Check ID | severity | 説明                                            |
| ----- | -------- | -------- | ----------------------------------------------- |
| 3     | L3-001   | warning  | output-schema.jsonの`$schema`フィールド存在     |
| 3     | L3-002   | info     | `type`フィールドの有効性                        |
| 3     | L3-003   | warning  | agents/の`責務`セクション品質（20文字以上）     |
| 3     | L3-004   | info     | SKILL.mdの`Trigger`セクション品質（10文字以上） |
| 4     | L4-001   | error    | SKILL.mdの`Anchors`セクションリスト項目存在     |
| 4     | L4-002   | warning  | SKILL.md言及のreferences/パス実在確認           |
| 4     | L4-003   | info     | references/MarkdownファイルのH1見出し存在       |

### Step 4: 命名規則の記録

```bash
# 既存コンポーネントの命名パターン確認
ls apps/desktop/src/renderer/components/skill/*.tsx
grep -n "^const\|^function\|^export" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30
```

| 項目             | 規則               | 例                                         |
| ---------------- | ------------------ | ------------------------------------------ |
| コンポーネント名 | PascalCase         | `VerifyLayerGroup`, `SkillLifecyclePanel`  |
| Hooks            | camelCase + use    | `useMemo`, `useState`                      |
| 定数             | camelCase          | `verifyCheckSeverityStyles`, `layerLabels` |
| CSS classes      | Tailwind + CSS変数 | `bg-[var(--status-error)]/10`              |
| data-testid      | kebab-case         | `skill-lifecycle-verify-detail`            |

## 機能要件（FR）

| ID    | 要件                                                                                  | 優先度 |
| ----- | ------------------------------------------------------------------------------------- | ------ |
| FR-01 | `verifyDetail.checks`をLayer別（layer1/layer2/layer3/layer4）にグループ化して表示する | 必須   |
| FR-02 | 各Layerグループはアコーディオン形式（開閉可能）で表示する                             | 必須   |
| FR-03 | severityアイコン（✓:info / ⚠:warning / ✗:error）を各checkに表示する                   | 必須   |
| FR-04 | Layerヘッダーに集計バッジ（error/warning/infoの件数）を表示する                       | 必須   |
| FR-05 | checksが空のLayerグループは表示しない                                                 | 必須   |
| FR-06 | 既存のLayer1/2表示が壊れない（後方互換性）                                            | 必須   |
| FR-07 | reverify後も正しくグルーピング更新される                                              | 必須   |
| FR-08 | Layerの折りたたみ状態はreverify後も保持される                                         | 推奨   |

## 非機能要件（NFR）

| ID     | 要件                                                   | 優先度 |
| ------ | ------------------------------------------------------ | ------ |
| NFR-01 | TypeScriptコンパイルエラーなし                         | 必須   |
| NFR-02 | ESLintエラーなし                                       | 必須   |
| NFR-03 | light/darkテーマ両方でseverityバッジの色が正しく表示   | 必須   |
| NFR-04 | コンポーネントテスト（Vitest）が追加され全パスすること | 必須   |
| NFR-05 | SVGアイコンライブラリへの新規依存を追加しない          | 必須   |
| NFR-06 | `verifyDetail.checks`依存の正しいuseMemoを使用する     | 推奨   |

## スコープ

### 含むもの

- `SkillLifecyclePanel.tsx`のVerify Detailセクション改修（Layer別グルーピング）
- 新規コンポーネント `VerifyLayerGroup.tsx`（100行超の場合は分離）
- severityアイコンマッピング定数追加
- Layer別集計ロジック（useMemo）
- 対応するコンポーネントテストの追加・更新

### 含まないもの

- `SkillCreatorVerificationEngine.ts`の変更（バックエンドはUT-IMP-SDK-06で完了）
- IPC型定義の変更（`packages/shared/src/types/skillCreator.ts`は変更不要）
- verify→improveループのロジック変更
- Layer3/4以外の新規チェックルール追加
- check IDの日本語ラベルマッピング（将来タスク候補）
- severityフィルタ機能（将来タスク候補）

## 受け入れ条件（AC）

| AC-ID | 受け入れ条件                                                               | 検証方法             |
| ----- | -------------------------------------------------------------------------- | -------------------- |
| AC-1  | Layer1/2/3/4の各グループが独立したアコーディオンセクションとして表示される | コンポーネントテスト |
| AC-2  | `check.layer`が`"layer3"`のチェックはLayer 3グループ内に表示される         | コンポーネントテスト |
| AC-3  | severityが`"error"`のcheckには`✗`アイコンが表示される                      | コンポーネントテスト |
| AC-4  | Layerヘッダーに`2 warnings`のような集計バッジが表示される                  | コンポーネントテスト |
| AC-5  | 全checksが`layer1`のみの場合、Layer2/3/4グループは表示されない             | コンポーネントテスト |
| AC-6  | `pnpm --filter @repo/desktop typecheck`がエラー0件で完了する               | コマンド実行         |
| AC-7  | Layerヘッダーのクリックで開閉動作し、再クリックで再展開される              | コンポーネントテスト |
| AC-8  | `pnpm --filter @repo/desktop test`が全テストパスで完了する                 | コマンド実行         |

## 統合テスト連携【必須】

統合テストの確認事項：

| 判定項目                     | 基準 | 確認内容                                      |
| ---------------------------- | ---- | --------------------------------------------- |
| コンポーネントテストLine     | 80%+ | `SkillLifecyclePanel.tsx`のverify detail部分  |
| コンポーネントテストBranch   | 60%+ | Layer別グルーピング分岐、空グループ非表示分岐 |
| コンポーネントテストFunction | 80%+ | `checksByLayer`useMemo、トグルハンドラ        |

## 成果物

| 成果物     | パス                              | 説明                        |
| ---------- | --------------------------------- | --------------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本Phaseの実行結果として記録 |

## 完了条件

- [ ] 既存の`verifyDetail.checks`表示実装箇所（ファイル・検索条件）が特定できている
- [ ] `RuntimeSkillCreatorVerifyCheck`型の全フィールドが把握できている
- [ ] Layer3/4の全check IDと対応するseverityが一覧化されている
- [ ] 命名規則（PascalCase/camelCase/kebab-case）が記録されている
- [ ] 機能要件（FR-01〜FR-08）が定義されている
- [ ] 非機能要件（NFR-01〜NFR-06）が定義されている
- [ ] スコープ境界（含む/含まない）が明確に定義されている
- [ ] 受け入れ条件（AC-1〜AC-8）が検証可能な形で定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001 --phase 1
```

## 次のPhase

Phase 2: 設計
