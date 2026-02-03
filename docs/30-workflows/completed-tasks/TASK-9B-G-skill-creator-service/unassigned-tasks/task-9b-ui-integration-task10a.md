# SkillCreator UI統合（TASK-10A連携） - タスク指示書

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | UI-INTEGRATION-9B               |
| タスク名     | SkillCreator UI統合（TASK-10A） |
| 分類         | 機能追加                        |
| 対象機能     | Skill Creator UI                |
| 優先度       | **高**                          |
| 見積もり規模 | 大規模                          |
| ステータス   | 未着手                          |
| 発見元       | TASK-9B-G Phase 12 未タスク検出 |
| 発見日       | 2026-02-03                      |
| 依存タスク   | TASK-9B-H, TASK-10A             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9B-GでSkillCreatorServiceのバックエンド実装が完了した。
TASK-9B-HでIPC通信チャンネルを設定後、UIからスキル作成機能を利用できるようにする統合が必要。

### 1.2 問題点・課題

- SkillCreatorServiceはMain Processでのみ動作
- ユーザーがスキル作成機能にアクセスするUIが存在しない
- スキル作成のワークフロー（collaborative/orchestrate/create）をUIで選択・実行できない

### 1.3 放置した場合の影響

- スキル作成機能がUIから利用できない
- エンドユーザーがスキル作成機能を使用できない
- TASK-9B-Gの成果がユーザーに届かない

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillCreatorServiceをUIから利用可能にし、ユーザーがスキルを作成・編集できるインターフェースを提供する。

### 2.2 最終ゴール

- スキル作成モード選択UI
- スキル作成ウィザード（collaborative mode）
- 進捗表示・エラーハンドリング
- 作成されたスキルの一覧表示

### 2.3 スコープ

#### 含むもの

- SkillCreatorコンポーネント群
- skillCreatorSlice（Zustand状態管理）
- useSkillCreator Hook
- スキル作成ウィザードUI
- 進捗表示UI

#### 含まないもの

- orchestrateモードUI（フェーズ2として検討）
- createモードUI（フェーズ2として検討）

### 2.4 成果物

| 成果物                     | パス                                                           |
| -------------------------- | -------------------------------------------------------------- |
| SkillCreatorコンポーネント | `apps/desktop/src/renderer/features/skill-creator/components/` |
| skillCreatorSlice          | `apps/desktop/src/renderer/features/skill-creator/store/`      |
| useSkillCreator Hook       | `apps/desktop/src/renderer/features/skill-creator/hooks/`      |
| テスト                     | `apps/desktop/src/renderer/features/skill-creator/__tests__/`  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9B-G（SkillCreatorService実装）完了
- TASK-9B-H（IPC通信チャンネル設定）完了
- TASK-10A（基盤UI）の仕様確認

### 3.2 依存タスク

| タスクID  | タスク名                | ステータス |
| --------- | ----------------------- | ---------- |
| TASK-9B-G | SkillCreatorService実装 | ✅ 完了    |
| TASK-9B-H | IPC通信チャンネル設定   | 未着手     |
| TASK-10A  | スキル管理UI基盤        | 未着手     |

### 3.3 必要な知識・スキル

- React
- Zustand状態管理
- Tailwind CSS
- アクセシビリティ（WCAG 2.1 AA）
- Electron IPC統合

### 3.4 推奨アプローチ

1. TASK-10Aと連携してUI基盤を確認
2. skillCreatorSliceを先に実装
3. コンポーネントを段階的に実装
4. E2Eテストを追加

---

## 4. 実行手順

### Phase 1-13: task-specification-creatorの標準フローに従って実行

### 参考: コンポーネント設計

```
SkillCreatorPage/
├── SkillCreatorWizard/       # メインウィザード
│   ├── ModeSelector/         # モード選択
│   ├── HearingPanel/         # ヒアリング（collaborative）
│   ├── ProgressIndicator/    # 進捗表示
│   └── ResultPanel/          # 結果表示
├── SkillPreview/             # プレビュー
└── SkillCreatorToolbar/      # ツールバー
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] モード選択UIが実装されている
- [ ] collaborativeモードのヒアリングUIが実装されている
- [ ] 進捗表示が実装されている
- [ ] 作成結果の表示・保存が実装されている

### 品質要件

- [ ] テストカバレッジ: Line 80%, Branch 60%, Function 80%
- [ ] アクセシビリティ: WCAG 2.1 AA準拠

### ドキュメント要件

- [ ] ui-ux-feature-components.mdにコンポーネント仕様を追記
- [ ] 使用ガイドを作成

---

## 6. 検証方法

### テストケース

| #   | テストケース   | 期待結果                       |
| --- | -------------- | ------------------------------ |
| 1   | モード選択     | 選択したモードが反映される     |
| 2   | ヒアリング入力 | 回答がサービスに送信される     |
| 3   | 進捗表示       | リアルタイムで進捗が更新される |
| 4   | 結果保存       | 作成されたスキルが保存される   |

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                           |
| ---------------------- | ------ | -------- | ------------------------------ |
| TASK-10Aとの仕様不整合 | 高     | 中       | 早期の仕様調整                 |
| 複雑なウィザードUX     | 中     | 中       | ユーザーテストでフィードバック |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント            | パス                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| SkillCreatorService仕様 | `aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| UI/UXコンポーネント仕様 | `aiworkflow-requirements/references/ui-ux-components.md`           |
| アクセシビリティ要件    | `aiworkflow-requirements/references/testing-accessibility.md`      |

### 関連タスク

| タスクID  | 関係 | 説明                    |
| --------- | ---- | ----------------------- |
| TASK-9B-G | 先行 | SkillCreatorService実装 |
| TASK-9B-H | 先行 | IPC通信チャンネル設定   |
| TASK-10A  | 連携 | スキル管理UI基盤        |

---

## 9. 先行タスクからの教訓（TASK-9B-G）

TASK-9B-G（SkillCreatorService実装）で得られた知見を本タスク実装時に活用すること。

### 9.1 Progressive Disclosure原則

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| 原則     | 必要になるまでリソースを読み込まない               |
| 実装     | ResourceLoaderの遅延読み込みパターン               |
| 本タスク | UIでもウィザードの各ステップで必要なデータのみ取得 |

### 9.2 Script First + UI連携

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| 原則     | 決定論的処理はスクリプト、ユーザー判断はUIで               |
| 本タスク | ヒアリング入力→サービス処理→結果表示の明確な責務分離を維持 |

### 9.3 未タスク登録漏れ防止

| 項目     | 内容                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 問題     | 未タスク指示書を作成しても、task-workflow.mdへの登録を忘れやすい                           |
| 解決策   | **3ステップ必須**: ①指示書作成 → ②task-workflow.md残課題テーブル登録 → ③関連仕様書への記載 |
| 本タスク | Phase 12完了前に必ず3ステップを確認すること                                                |

### 9.4 大規模タスクの分割

| 項目     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| 教訓     | TASK-9B-Gは13 Phaseで大規模だったが、明確なPhaseゲートにより管理可能 |
| 本タスク | UIコンポーネントを機能単位で分割し、各Phaseで個別に完了させる        |

---

## 10. 備考

### 発見元の原文

```
Phase 12 未タスク検出より:
- UI統合（TASK-10A連携）
- 優先度: 高
- TASK-10A依存
```

### 補足事項

- TASK-10Aの仕様確定後に詳細設計を行う
- collaborativeモードを優先実装し、他モードは段階的に追加
- アクセシビリティはPhase 1から考慮
