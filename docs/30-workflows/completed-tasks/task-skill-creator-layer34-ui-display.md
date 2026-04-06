# SkillCreator Layer3/4検証結果のUI表示拡張 - タスク指示書

## メタ情報

```yaml
issue_number: 1820
```

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-SDK-L34-UI-DISPLAY-001                                           |
| タスク名     | SkillCreator Layer3/4検証結果のUI表示拡張                           |
| 分類         | 改善                                                                |
| 対象機能     | SkillCreator UI (renderer side) - 検証結果表示                      |
| 優先度       | 中                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | **完了**                                                            |
| 発見元       | Phase 11（UT-IMP-SDK-06 Layer3/4 verify拡張テスト実装）             |
| 発見日       | 2026-04-01                                                          |
| 完了日       | 2026-04-03                                                          |
| 成果物       | `docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001/` |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreatorVerificationEngine`（`apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`）に
Layer3/4検証が追加された（UT-IMP-SDK-06 Phase 11）。

- **Layer3チェック**: output-schema.jsonのスキーマ品質（L3-001〜L3-004）
  - L3-001: `$schema`フィールドの存在
  - L3-002: `type`フィールドの有効性（有効なJSON Schemaタイプ）
  - L3-003: agents/配下の各エージェントファイルの`責務`セクション品質（20文字以上）
  - L3-004: SKILL.mdの`Trigger`セクション品質（10文字以上）
- **Layer4チェック**: references品質・Anchorsセクション整合性（L4-001〜L4-003）
  - L4-001: SKILL.mdの`Anchors`セクションにリスト項目が1件以上存在するか
  - L4-002: SKILL.md内で言及されているreferences/パスが実際に存在するか
  - L4-003: references/内のMarkdownファイルがH1見出しを持つか

`SkillLifecyclePanel.tsx`（`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`）は
`verifyDetail.checks` をフラットなリストとして表示しており、全レイヤーのチェックを
区別なく並べている。Layer3/4のチェック項目が増えた現状では、ユーザーが検証結果を
層ごとに把握しにくくなっている。

### 1.2 問題点・課題

- すべてのchecks（Layer1〜Layer4）が同一の2列グリッドにフラット表示されている
- Layer3/4のcheck ID（L3-001等）は表示されているが、どのレイヤーの問題かが視覚的に不明確
- severity（info/warning/error）はバッジ色で区別されているが、アイコンによる視覚補助がない
- Layer3/4の問題と Layer1/2の致命的な問題（errorレベル）が同じ優先度で並列表示され、
  ユーザーが何を先に修正すべきか判断しにくい
- Layer別のフィルタリングや折りたたみができないため、チェック数が増えるとUXが劣化する

### 1.3 放置した場合の影響

- Layer3/4のスキル品質問題がUIで埋没し、ユーザーが気づかないまま低品質スキルが生成され続ける
- output-schema.jsonの`$schema`欠損（L3-001 warning）やAnchorsセクション不備（L4-001 error）が
  視覚的に強調されないため、品質改善のサイクルが回らない
- UT-IMP-SDK-06のLayer3/4テスト実装（バックエンド）が完成しているにもかかわらず、
  フロントエンド側で対応できないため、機能追加の効果が半減する

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillLifecyclePanel`のVerify Detailセクションで、Layer3/4チェック結果を
ユーザーが直感的に把握できるよう表示を拡張する。

### 2.2 最終ゴール

- checksがLayer別（Layer1/Layer2/Layer3/Layer4）にグルーピングされて表示される
- 各Layerのグループは折りたたみ（アコーディオン）で開閉可能
- severity（info/warning/error）ごとにアイコン（✓/⚠/✗）が表示される
- Layer別の集計バッジ（例: `2 warnings` `1 error`）がヘッダーに表示される
- 既存のLayer1/2表示が壊れない（後方互換性）

### 2.3 スコープ

#### 含むもの

- `SkillLifecyclePanel.tsx`のVerify Detailセクション改修
  （`verifyDetail.checks`のLayer別グルーピング表示）
- 新規コンポーネント `VerifyLayerGroup`（SkillLifecyclePanel内のローカルコンポーネント、
  または`apps/desktop/src/renderer/components/skill/`配下への分離）
- severityアイコンのマッピング定数追加
- Layer別集計ロジックの追加
- 対応するコンポーネントテストの追加・更新

#### 含まないもの

- `SkillCreatorVerificationEngine.ts`の変更（バックエンドはUT-IMP-SDK-06で完了）
- IPC型定義の変更（`packages/shared/src/types/skillCreator.ts`は変更不要）
- verify→improveループのロジック変更
- Layer3/4以外の新規チェックルール追加
- バックエンドのLayer2検証変更

### 2.4 成果物

| 成果物                         | パス                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| SkillLifecyclePanel改修        | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               |
| VerifyLayerGroupコンポーネント | `apps/desktop/src/renderer/components/skill/VerifyLayerGroup.tsx`（新規、分離する場合）            |
| SkillLifecyclePanelテスト更新  | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                |
| SkillLifecyclePanelテスト更新  | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
| VerifyLayerGroupテスト（新規） | `apps/desktop/src/renderer/components/skill/__tests__/VerifyLayerGroup.test.tsx`（分離する場合）   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-IMP-SDK-06（Layer3/4 verify拡張テスト実装）が完了していること
- `apps/desktop`の開発環境が起動できること（`pnpm --filter @repo/desktop dev`）
- `verifyDetail.checks`の型は`RuntimeSkillCreatorVerifyCheck[]`として定義済みであること

### 3.2 依存タスク

| タスクID      | タスク名                      | ステータス |
| ------------- | ----------------------------- | ---------- |
| UT-IMP-SDK-06 | Layer3/4 verify拡張テスト実装 | 完了済み   |

### 3.3 必要な知識

- React（useState、useMemo）
- TypeScript discriminated union / Record型
- Tailwind CSS（レイアウト・カラーバリアント）
- `RuntimeSkillCreatorVerifyCheck`型の構造（`packages/shared/src/types/skillCreator.ts`参照）
- 既存の`verifyCheckSeverityStyles`定数（SkillLifecyclePanel.tsx L.288〜295）

### 3.4 システム仕様書参照

| 仕様書                          | 参照セクション                         |
| ------------------------------- | -------------------------------------- |
| `interfaces-agent-sdk-skill.md` | skill:verifyDetail IPC型定義           |
| `arch-ui-components.md`         | アコーディオン・グルーピングUIパターン |
| `ui-ux-feature-components.md`   | severity表示・アイコン設計パターン     |
| `testing-component-patterns.md` | Reactコンポーネントテスト手法          |

### 3.5 推奨アプローチ

1. まず`SkillLifecyclePanel.tsx`の現行のchecks表示部分（L.1621〜L.1650）を把握する
2. `verifyDetail.checks`を`layer`で分類する`useMemo`を追加する
   - キー: `"layer1" | "layer2" | "layer3" | "layer4"`
   - 値: 各layerに属するchecks配列
3. Layer別グルーピングをアコーディオン（開閉可能）で表示する
   - デフォルト: `layer3`/`layer4`は開いた状態（新規追加のため）
   - `layer1`/`layer2`はデフォルト開いた状態を維持
4. 各チェック項目にseverityアイコン（✓/⚠/✗）を追加する
5. Layerヘッダーに集計バッジ（error/warning/infoの件数）を表示する

---

## 4. 実行手順

### Phase 1: renderer側調査

#### 目的

現行実装のchecks表示コードとコンポーネント構造を正確に把握する。

#### 手順

1. `SkillLifecyclePanel.tsx`のchecks表示部分（`verifyDetail.checks.map`）を読む
   - 現在は L.1621〜L.1650 付近で2列グリッドにフラット表示されている
2. `verifyCheckSeverityStyles`（L.288〜295）の定義を確認する
   - `info`/`warning`/`error`の3種類のTailwindクラスが定義済み
3. `SkillLifecyclePanel.llm-generation.test.tsx`のchecks関連テストを確認する
   - L.286〜310 付近: `layer3`のfixture定義
   - L.1234〜1235 付近: 別のlayer3 fixture
4. `packages/shared/src/types/skillCreator.ts`の以下の型を確認する
   - `RuntimeSkillCreatorVerifyCheck`（L.623〜629）
   - `RuntimeSkillCreatorVerifyCheckSeverity`（L.618〜621）
   - `RuntimeSkillCreatorVerifyDetail`（L.638〜661）
5. `SkillCreatorVerificationEngine.ts`のLayer3/4出力を確認する
   - L3-001〜L3-004の実際の`id`、`layer`、`severity`、`summary`の値パターン
   - L4-001〜L4-003の実際の値パターン

#### 成果物

- 調査メモ（Layer別check IDの網羅一覧、現行UIの表示箇所の行番号）

#### 完了条件

- checks表示の実装箇所が特定できており、修正範囲が明確になっている
- Layer3/4の全check IDと対応するseverityのパターンが把握できている

---

### Phase 2: UI設計

#### 目的

Layer別グルーピング表示のUIデザインを決定し、実装方針を確定する。

#### 手順

1. グルーピング構造の設計
   - 表示順序: Layer1 → Layer2 → Layer3 → Layer4
   - グルーピングキー: `check.layer`（`"layer1" | "layer2" | "layer3" | "layer4"`）
   - 各グループはアコーディオン形式（開閉可能）
2. ヘッダーの設計
   - Layerラベル（例: `Layer 1 — 必須ファイル構造`）
   - 集計バッジ（error件数: 赤、warning件数: 黄色、info件数: 青）
   - 展開/折りたたみのトグルボタン
3. severityアイコンの設計
   - `info`: チェックマーク（✓ または SVGアイコン）
   - `warning`: 警告（⚠ または SVGアイコン）
   - `error`: バツ（✗ または SVGアイコン）
4. 状態管理の設計
   - 開閉状態: `useState<Record<string, boolean>>`
   - 初期状態: 全Layer展開（`{ layer1: true, layer2: true, layer3: true, layer4: true }`）
   - `useMemo`でchecksをLayer別にグループ化
5. コンポーネント分離判断
   - 100行以内であれば`SkillLifecyclePanel.tsx`内のローカルコンポーネントでもよい
   - それ以上の場合は`VerifyLayerGroup.tsx`として分離する

#### 成果物

- UI設計メモ（コンポーネント構成図、state設計）

#### 完了条件

- 実装するコンポーネント構成が確定している
- 既存の`verifyCheckSeverityStyles`の活用方針が決まっている

---

### Phase 3: コンポーネント実装

#### 目的

Phase 2の設計に基づき、Layer別グルーピング表示を実装する。

#### 手順

1. `SkillLifecyclePanel.tsx`に以下を追加する:

   ```typescript
   // Layer別表示名マッピング
   const layerLabels: Record<string, string> = {
     layer1: "Layer 1 — 必須ファイル構造",
     layer2: "Layer 2 — SKILL.md セクション",
     layer3: "Layer 3 — スキーマ・コンテンツ品質",
     layer4: "Layer 4 — References整合性",
   };

   // severityアイコンマッピング
   const verifyCheckSeverityIcon: Record<
     RuntimeSkillCreatorVerifyCheckSeverity,
     string
   > = {
     info: "✓",
     warning: "⚠",
     error: "✗",
   };
   ```

2. `verifyDetail.checks`のLayer別グループ化を`useMemo`で実装する:

   ```typescript
   const checksByLayer = useMemo(() => {
     const groups: Record<string, RuntimeSkillCreatorVerifyCheck[]> = {
       layer1: [],
       layer2: [],
       layer3: [],
       layer4: [],
     };
     for (const check of verifyDetail?.checks ?? []) {
       groups[check.layer]?.push(check);
     }
     return groups;
   }, [verifyDetail?.checks]);
   ```

3. Layer別開閉状態を`useState`で管理する:

   ```typescript
   const [expandedLayers, setExpandedLayers] = useState<
     Record<string, boolean>
   >({
     layer1: true,
     layer2: true,
     layer3: true,
     layer4: true,
   });
   ```

4. 既存の`verifyDetail.checks.map`による2列グリッド表示を、Layer別グルーピング表示に置き換える:
   - 各Layerのアコーディオンヘッダー（Layerラベル + 集計バッジ + トグルボタン）
   - 展開時は各checkを既存のcard UIで表示
   - severityアイコンを各cardに追加
5. checks配列が空のLayerは表示しない（空グループを除外）

#### 成果物

- 更新済み `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- （必要に応じて）新規 `apps/desktop/src/renderer/components/skill/VerifyLayerGroup.tsx`

#### 完了条件

- pnpm --filter @repo/desktop dev でアプリが起動する
- verify phaseでchecksがLayer別に表示される
- 各Layerのヘッダーに集計バッジが表示される
- Layerの折りたたみ/展開が正常に動作する
- severityアイコンが各checkに表示される
- TypeScriptのコンパイルエラーがない

---

### Phase 4: IPC連携確認

#### 目的

Layer3/4の検証結果がIPC経由で正しく届き、UIに表示されることを確認する。

#### 手順

1. `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`で
   `verifyDetail`レスポンスに`layer3`/`layer4`のchecksが含まれることを確認する
2. `packages/shared/src/types/skillCreator.ts`の`RuntimeSkillCreatorVerifyDetail.checks`型が
   `layer3`/`layer4`を受け入れること（`"layer1" | "layer2" | "layer3" | "layer4"`）を確認する
3. 開発環境でスキルを実際に作成し、verify phaseでLayer3/4のchecksが表示されることを確認する
   - 意図的にAnchorセクションを省略したSKILL.mdを生成させ、L4-001 errorが表示されることを確認
   - output-schema.jsonに`$schema`を含めないスキルを生成させ、L3-001 warningが表示されることを確認

#### 成果物

- 動作確認ログ（スクリーンショットまたは文字ログ）

#### 完了条件

- Layer3/4のchecks IDが実際にUIに表示されることが確認できている
- IPC型定義と実装の間に乖離がないことが確認できている

---

### Phase 5: テスト

#### 目的

実装変更に対するコンポーネントテストを追加・更新し、品質を担保する。

#### 手順

1. `SkillLifecyclePanel.test.tsx`を更新する:
   - Layer別グルーピング表示のテスト追加
   - layer1/layer2/layer3/layer4のchecksが正しいグループに表示されることの確認
   - checksが空のLayerは表示されないことの確認
   - Layerの折りたたみ/展開のインタラクションテスト
2. `SkillLifecyclePanel.llm-generation.test.tsx`を更新する:
   - L.292〜300 付近のlayer3 fixtureに`id: "L3-001"`, `layer: "layer3"` 形式を追加
   - Layer別グルーピング後のレンダリング確認
3. `VerifyLayerGroup.test.tsx`（コンポーネント分離した場合）を新規作成する:
   - 各severityのアイコン表示確認
   - 集計バッジの表示確認（0件のseverityは非表示等）
   - 折りたたみ状態の正常動作確認
4. テスト実行: `pnpm --filter @repo/desktop test`

#### 成果物

- 更新済み `SkillLifecyclePanel.test.tsx`
- 更新済み `SkillLifecyclePanel.llm-generation.test.tsx`
- （必要に応じて）新規 `VerifyLayerGroup.test.tsx`

#### 完了条件

- 全テストがパスする
- 追加したテストが Layer3/4 のグルーピング動作を網羅している
- `pnpm --filter @repo/desktop test`でエラーがない

---

### Phase 6: Phase 12ドキュメント

#### 目的

実装内容をドキュメントに記録し、次の開発者が同じ調査をせずに済むようにする。

#### 手順

1. `docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001/` に成果物が同期済みであることを確認する
2. `outputs/phase-12/implementation-guide.md`を作成し、以下を記述する:
   - 変更したファイル一覧と変更内容の概要
   - `checksByLayer`のuseMemo実装パターン
   - `expandedLayers`のstate管理パターン
   - severityアイコンのマッピング定数
3. `aiworkflow-requirements/references/lessons-learned-current.md`に発見内容を追記する:
   - Layer3/4 UI表示拡張の実装アプローチ
   - 苦戦した点（もしあれば）

#### 成果物

- `docs/30-workflows/completed-tasks/task-ut-sdk-l34-ui-display-001/outputs/phase-12/implementation-guide.md`

#### 完了条件

- 実装ガイドが作成されている
- 次の開発者がこのガイドだけでLayer3/4 UIの実装意図を理解できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `verifyDetail.checks`がLayer1/Layer2/Layer3/Layer4にグルーピングされて表示される
- [ ] 各Layerグループはアコーディオン（折りたたみ可能）で表示される
- [ ] severityアイコン（✓/⚠/✗）が各checkに表示される
- [ ] Layerヘッダーに集計バッジ（error/warning/infoの件数）が表示される
- [ ] checksが空のLayerグループは表示されない
- [ ] Layer3/4のcheck ID（L3-001〜L4-003）がUIで識別できる
- [ ] verify→improveループ中（reverify後）も正しく更新される
- [ ] 既存のLayer1/2表示が壊れない（後方互換性確保）

### 品質要件

- [ ] TypeScriptのコンパイルエラーがない（`pnpm --filter @repo/desktop typecheck`）
- [ ] コンポーネントテストが追加されている
- [ ] 既存テストが全てパスする（`pnpm --filter @repo/desktop test`）
- [ ] ESLintエラーがない（`pnpm --filter @repo/desktop lint`）
- [ ] light/darkテーマ両方でseverityバッジの色が正しく表示される

### ドキュメント要件

- [ ] Phase 12実装ガイドが作成されている
- [ ] lessons-learned-current.mdに追記されている

---

## 6. 検証方法

### テストケース

| #   | テストケース                                     | 期待結果                                                                 |
| --- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| 1   | Layer1/2のみのchecksを渡した場合                 | Layer1/Layer2グループのみ表示され、Layer3/4は非表示                      |
| 2   | Layer1〜4全てのchecksを渡した場合                | 4つのLayerグループが全て表示される                                       |
| 3   | L3-001 warningが含まれる場合                     | Layer3グループ内に`L3-001`、⚠アイコン、黄色バッジで表示                  |
| 4   | L4-001 errorが含まれる場合                       | Layer4グループヘッダーに赤い集計バッジ（1 error）が表示                  |
| 5   | L3-002 infoが含まれる場合                        | Layer3グループ内に`L3-002`、✓アイコン、青色バッジで表示                  |
| 6   | Layerヘッダーをクリック                          | グループが折りたたまれ、checks一覧が非表示になる                         |
| 7   | 折りたたみ後に再クリック                         | グループが展開され、checks一覧が再表示される                             |
| 8   | reverifyEligible=true で「再検証を要求する」実行 | verify detail が更新され、Layer別グルーピングも更新される                |
| 9   | checksが空の場合                                 | "verify detail を読み込み中..." または "チェック結果がありません" と表示 |
| 10  | darkテーマでの表示確認                           | severityアイコン・バッジの色がCSS変数に従い正しく表示される              |

### 検証手順

1. `pnpm --filter @repo/desktop dev` で開発サーバーを起動する
2. アプリのSkillCreator UIを開き、新規スキル作成を開始する
3. collaborative/orchestrateモードでスキルを生成する
4. verify phaseに到達した際に「Verify Detail」パネルを確認する
5. checks一覧がLayer別にグルーピングされていることを確認する
6. 各Layerのヘッダーをクリックし折りたたみ動作を確認する
7. severityアイコンが各checkに正しく表示されることを確認する
8. Layer3/4のcheck（L3-001等）が表示されることを確認する
9. 「再検証を要求する」ボタンをクリックし、更新後も正しくグルーピング表示されることを確認する

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                                            |
| ---------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------- |
| 既存のLayer1/2 checks表示が壊れる                    | 高     | 中       | Layer1/2の既存fixtureテストを実行して後方互換性を確認する                       |
| Layer3/4のchecksがIPCから届いていない                | 高     | 低       | `skillCreatorHandlers.ts`のverifyDetailレスポンスをログで確認する               |
| アコーディオンの開閉状態がreverify後にリセットされる | 中     | 中       | `verifyDetail`更新時に開閉状態を保持するよう`key`管理に注意する                 |
| Tailwind CSSクラスのlight/darkテーマ非対応           | 中     | 低       | 既存の`verifyCheckSeverityStyles`と同様にCSS変数（`var(--status-*)`）を使用する |
| checksが大量（20件以上）になりUXが劣化               | 低     | 低       | 折りたたみ機能で対応済み。必要に応じてseverityフィルタを後続タスクで追加検討    |
| `useMemo`の依存配列誤りによる再レンダリング問題      | 低     | 低       | `verifyDetail?.checks`を依存配列に含める。ESLintのexhaustive-depsで検出可能     |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                        | パス                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| SkillCreator検証エンジン実装        | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                         |
| SkillCreator型定義                  | `packages/shared/src/types/skillCreator.ts`                                                        |
| SkillLifecyclePanel                 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               |
| SkillLifecyclePanelテスト           | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                |
| SkillLifecyclePanel LLG生成テスト   | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
| IPC Handlerテスト（バリデーション） | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts`                      |
| interfaces-agent-sdk-skill仕様      | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                  |

### 苦戦箇所記録

本タスクの実装では以下の点で判断・調査コストが高くなる可能性がある。

#### 苦戦箇所1: renderer側のchecks表示所有者の特定

**問題**: `SkillLifecyclePanel.tsx`は2000行を超える大規模コンポーネントであり、
checksを表示するセクションがどこにあるかを把握するのに時間がかかる。

**対処法**: `data-testid="skill-lifecycle-verify-detail"` で検索する。
このdiv内（L.1540〜付近）に`verifyDetail.checks.map`がある。
現在は `<div className="mt-4 grid gap-3 lg:grid-cols-2">` という2列グリッドで
フラット表示されている（L.1621〜L.1650付近）。ここが今回の改修対象。

#### 苦戦箇所2: Layer3/4の check IDをUIでわかりやすく表示する設計

**問題**: L3-001のような技術的なIDをそのまま表示してもユーザーには意味が不明確。
日本語ラベルを付けるべきかどうか、またどのIDがどういう意味かを把握する必要がある。

**対処法**: check IDごとの日本語ラベルマッピングは今回のスコープに含めない。
`check.summary`フィールドに英語の説明が入っているため、ユーザーはsummaryで内容を
把握できる。check IDはデバッグ目的でラベルとして表示する（例: `L3-001` バッジ）。
必要であれば別タスクでi18nラベルを追加する。

#### 苦戦箇所3: 既存UIのLayer1/2表示を壊さずにLayer3/4を追加する

**問題**: 既存のテスト（`SkillLifecyclePanel.llm-generation.test.tsx` L.286〜310）が
`layer3`形式のfixtureを使用しているが、check IDが`"layer3-verify-status"`のような
テスト専用形式になっており、実際のEngine出力形式（`"L3-001"`）と異なる。
テスト修正時に混乱する可能性がある。

**対処法**: 既存テストのfixtureを無理に変更しない。
テスト用のIDは`"layer3-verify-status"`のままでよい（コンポーネントはIDの内容ではなく
`check.layer`フィールドでグルーピングするため）。
新規テストには`"L3-001"`形式のIDを使用し、実際の動作を確認する。

#### 苦戦箇所4: verify→improveループ中のリアルタイム更新との整合性

**問題**: reverify後に`verifyDetail`が更新されると、`checksByLayer`のuseMemoが
再計算される。この際、アコーディオンの開閉状態が意図せずリセットされる
可能性がある。

**対処法**: `expandedLayers`のstateは`verifyDetail`の更新で上書きしない設計にする。
useState初期値を全Layer展開（`{ layer1: true, layer2: true, layer3: true, layer4: true }`）
とし、ユーザーが一度折りたたんだ状態はreverify後も維持されるようにする。
reverify時に意図的にリセットが必要な場合は、`verifyDetail`が`null`にセットされる
タイミングで開閉状態をリセットする。

#### 苦戦箇所5: severity（info/warning/error）ごとの色分け表示

**問題**: 既存の`verifyCheckSeverityStyles`（L.288〜295）は
`info`/`warning`/`error`の3種類のTailwindクラスをバッジ背景色として定義しているが、
アイコン表示用のマッピングは定義されていない。
また、集計バッジ（Layerヘッダーに表示する件数バッジ）の色設計が必要。

**対処法**: アイコンはUnicodeのテキスト文字（✓/⚠/✗）を使用する。
SVGアイコンライブラリへの依存は増やさない。
集計バッジの色は既存の`verifyCheckSeverityStyles`と同一のCSSクラスを再利用する
（例: errorのバッジには`bg-[var(--status-error)]/10 text-[var(--status-error)]`を適用）。
errorが0件のLayer3/4では集計バッジを表示しないか、infoのみ表示する設計にする。

---

## 9. 備考

### 発見コンテキスト

本タスクはPhase 11（UT-IMP-SDK-06 Layer3/4 verify拡張テスト実装）の完了時に発見された。
Layer3/4の検証ロジックはバックエンド（`SkillCreatorVerificationEngine.ts`）に実装済みであり、
IPCを経由してrenderer側に`checks`配列として届く型定義も完備している。

しかし、renderer側の`SkillLifecyclePanel.tsx`は全checksをフラットな2列グリッドで表示する
実装のままであり、Layer別のグルーピングや視覚的強調がない。
UT-IMP-SDK-06でLayer3/4のテストを実装する過程で、バックエンドの検証結果がUIで
正しく認識されるかどうかを確認しようとした際に、UI側の改修が未着手であることが判明した。

### 実装優先度の考え方

本タスクは「中」優先度としているが、以下の場合は優先度を上げることを検討する:

- スキル生成後にLayer3/4の問題（L4-001 error等）がUIで埋没して見落とされる事例が発生した場合
- スキル品質改善のサイクルを効率化するためのUX改善要求が出た場合

### 関連タスク（今後の検討候補）

- [task-skill-creator-layer34-ui-display-japanese-labels.md](../unassigned-task/task-skill-creator-layer34-ui-display-japanese-labels.md): Layer3/4 の各 check ID に対する日本語ラベル表示
- [skill-creator-layer34-ui-display-severity-filter](../skill-creator-layer34-ui-display-severity-filter/index.md): severity フィルタ機能（warning 以上のみ表示等、**進行中**）
- [task-skill-creator-layer34-verify-layergroup-split.md](../unassigned-task/task-skill-creator-layer34-verify-layergroup-split.md): VerifyLayerGroup 分離リファクタ
- checks 全体の summary 統計（pass率等）のダッシュボード表示は、まだ正式な spec にしていない候補
