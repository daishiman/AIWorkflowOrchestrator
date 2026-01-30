# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 3                      |
| 機能名 | TASK-7A-skill-selector |
| 作成日 | 2026-01-30             |

## 目的

実装開始前に、SkillSelector のコンポーネント設計・アクセシビリティ設計の妥当性を検証する。

## 判定基準

| 判定  | 条件             | 対応                         |
| ----- | ---------------- | ---------------------------- |
| PASS  | 全観点で問題なし | Phase 4へ進行                |
| MINOR | 軽微な指摘あり   | 指摘対応後Phase 4へ進行      |
| MAJOR | 重大な問題あり   | 影響範囲に応じて戻り先を決定 |

## レビュー観点

### 要件整合性

| チェック項目                                | 確認内容                                 |
| ------------------------------------------- | ---------------------------------------- |
| FR-01〜FR-08 が設計に反映されているか       | コンポーネント構造と要件の対応           |
| NFR-01〜NFR-07 が設計に反映されているか     | アクセシビリティ・性能要件の設計への反映 |
| specification.md 4.2 の仕様と一致しているか | SkillSelector UI仕様との整合性           |

### ModelSelectorパターン一貫性

| チェック項目                               | 確認内容                               |
| ------------------------------------------ | -------------------------------------- |
| ドロップダウン開閉パターンが一致しているか | useState + useRef + useEffect パターン |
| キーボードハンドラーが一致しているか       | Enter/Space/Escape/Arrow/Tab の挙動    |
| ARIA属性パターンが一致しているか           | combobox/listbox/option ロール         |
| スタイリングパターンが一致しているか       | Tailwind クラス命名・ダークモード対応  |

### アクセシビリティ検証

| チェック項目                              | 確認内容                                   |
| ----------------------------------------- | ------------------------------------------ |
| WAI-ARIA Listbox パターンに準拠しているか | ロール・属性・キーボード操作の仕様準拠     |
| スクリーンリーダーでの操作が可能か        | aria-label, aria-selected, aria-expanded   |
| フォーカス管理が適切か                    | focusedIndex, aria-activedescendant        |
| コントラスト比が WCAG 2.1 AA を満たすか   | 最小4.5:1（小テキスト）、3:1（大テキスト） |

### Electron アーキテクチャ適合性

| チェック項目                          | 確認内容                                |
| ------------------------------------- | --------------------------------------- |
| Renderer Process のみで完結しているか | Main Process / IPC への依存がないこと   |
| Zustand Store アクセスが適切か        | `useAppStore` 経由のみでのアクセス      |
| セキュリティ境界を越えていないか      | window.electronAPI の直接使用がないこと |

## 参照資料

| 資料名               | パス                                         | 説明          |
| -------------------- | -------------------------------------------- | ------------- |
| コンポーネント設計   | `outputs/phase-2/component-design.md`        | Phase 2成果物 |
| アクセシビリティ設計 | `outputs/phase-2/accessibility-design.md`    | Phase 2成果物 |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                                 |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------ |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`   | デザイントークン・コンポーネント規約 |
| LLMセレクター仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`    | 既存セレクターUI仕様                 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | skillSlice定義・Zustandパターン      |
| UIコンポーネント設計   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`    | コンポーネント階層                   |

## 統合テスト連携【必須】

統合テスト観点のレビューゲートを実施:

| レビュー観点     | 確認項目                                       |
| ---------------- | ---------------------------------------------- |
| Zustand連携      | useAppStore 経由の状態取得・アクション呼び出し |
| コンポーネント間 | SkillOption / SkillOptionUnimported の分離     |
| TASK-7D統合準備  | barrel export による公開インターフェース       |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                               | 仕様参照先                                   |
| ------------------ | -------------------------------------- | -------------------------------------------- |
| セキュリティ       | スキル名・説明文の表示時XSS防止        | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装のため適用           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | Renderer Process内完結の確認           | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | rescanSkills失敗時の表示・空リスト対応 | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 不要な再レンダリング防止               | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | WAI-ARIA Listboxパターン準拠           | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断               | 仕様参照先                            |
| -------------------------- | ---------------------- | ------------------------------------- |
| フロントエンド（Renderer） | UI/React実装のため適用 | `aiworkflow-requirements: ui-ux-*.md` |

## 成果物

| 成果物       | パス                                      | 説明     |
| ------------ | ----------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果 |

## 完了条件

- [ ] 要件整合性の確認完了
- [ ] ModelSelectorパターンとの一貫性確認完了
- [ ] アクセシビリティ設計の検証完了
- [ ] Electron アーキテクチャ適合性の確認完了
- [ ] 判定結果が記録されている
- [ ] 統合テスト観点のレビューが完了している
- [ ] **本Phase内のレビュー作業を100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Phase 1/2 成果物の確認
2. 要件整合性レビューの実施
3. ModelSelectorパターン一貫性レビューの実施
4. アクセシビリティ設計レビューの実施
5. Electron アーキテクチャ適合性レビューの実施
6. 判定結果の記録
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7A-skill-selector --phase 3
```

## 次のPhase

Phase 4: テスト作成（TDD: Red）
