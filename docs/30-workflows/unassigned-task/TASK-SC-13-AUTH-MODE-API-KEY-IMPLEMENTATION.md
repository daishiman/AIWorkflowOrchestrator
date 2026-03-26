# TASK-SC-13: authMode/apiKey パラメータ実装

## メタ情報

- 検出元: TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION Phase 12 レビュー
- 優先度: Medium
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - `apps/desktop/src/renderer/store/slices/agentSlice.ts`
  - `apps/desktop/src/main/skill-creator/` (LLM プロバイダー設定)

## 目的

planSkill / executePlan の `authMode` と `apiKey` パラメータを実装し、LLM プロバイダーの認証フローを完成させる。

## 背景

TASK-SC-07 で SkillCreateWizard に LLM 生成フローを接続した際、`planSkill(description)` と `executePlan(planId, description)` の呼び出しでは認証パラメータを省略している。現在は Main Process 側で環境変数やデフォルト設定からキーを取得する暫定実装だが、以下のユースケースに対応できない:

- ユーザーが独自の API キーを使用する場合
- 複数の LLM プロバイダーを切り替える場合
- Anthropic / OpenAI / ローカルモデル等の認証方式の違い

## 実行タスク

- [ ] LLM プロバイダー設定 UI コンポーネントを設計する（Settings 画面 or Wizard 内）
- [ ] `authMode` の型定義を決定する（`"env" | "user_key" | "oauth"` 等）
- [ ] SkillCreateWizard の handleLlmGenerate で authMode/apiKey を渡す実装を追加する
- [ ] Main Process 側で authMode に応じた認証ロジックを実装する
- [ ] API キーの安全な保存（Electron safeStorage / keytar）を実装する
- [ ] テストケースを追加する（各 authMode パターン）

## 完了条件

- [ ] ユーザーが Settings 画面で API キーを設定できること
- [ ] planSkill / executePlan が設定された authMode と apiKey を使用すること
- [ ] API キーが暗号化されて保存されること（平文保存禁止）
- [ ] authMode 未設定時にフォールバック動作すること
- [ ] TypeScript 型チェック PASS
- [ ] 全テスト PASS

## 苦戦箇所（TASK-SC-07 実装知見）

| 苦戦箇所                                   | 問題                                                                                | 解決策                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| SkillCreatorRuntimeApi のローカル型（C-1） | ローカル型定義と Preload API のシグネチャ不整合がコンパイルは通るがランタイムエラー | Preload API の実シグネチャを必ず確認し、型を合わせる               |
| Hybrid State Pattern の管理（P3）          | authMode/apiKey 追加時に clearGenerationState の対象フィールド拡張が必要            | 対称クリアパターンを維持し、新フィールドも一括リセット対象に含める |

## 参照

- TASK-SC-07 Phase 12 未タスクレポート (認証モード実装)
- Electron safeStorage API ドキュメント
- TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド
