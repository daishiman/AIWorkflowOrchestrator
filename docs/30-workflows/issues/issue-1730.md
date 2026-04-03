# [#1730] [task-perf-verification-engine-cache-007] SkillCreatorVerificationEngine Layer 1/2 検証結果キャッシュ実装

## メタ情報

```yaml
issue_number: 1730
title: [task-perf-verification-engine-cache-007] SkillCreatorVerificationEngine Layer 1/2 検証結果キャッシュ実装
state: OPEN
priority: 低
scale: -
category: パフォーマンス
status: 未実施
created_date: 2026-03-29
updated_date: 2026-03-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1730
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景・目的

スキル数増加時にファイルI/Oがボトルネックとなる問題に先手を打つ。TTLキャッシュ機構を実装することで、連続verify呼び出しのパフォーマンスを改善する。

## スコープ

- `SkillCreatorVerificationEngine` へのTTLキャッシュ機構追加
- skillDir単位でのverify結果キャッシュ
- キャッシュ無効化条件の定義（ファイル更新検出 or TTL超過）
- キャッシュ関連のテスト追加

## 技術的コンテキスト

現在の verify() API:

```ts
class SkillCreatorVerificationEngine {
  verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>;
}
```

毎回 L1 (5チェック) + L2 (7チェック × agentファイル数) のファイルI/Oが発生。
スキル数が100を超えるとverify一括実行で顕著なレイテンシが予想される。

## 設計方針

- TTL: 設定可能（デフォルト 60秒程度）
- キャッシュキー: `skillDir` の絶対パス
- invalidation: skillDir内のファイル変更タイムスタンプ比較 or TTL超過

## 参照

- Phase 12 implementation guide: `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/outputs/phase-12/implementation-guide.md`
- VerificationEngine: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
