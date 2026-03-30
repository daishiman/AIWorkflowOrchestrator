# Phase 2 Verification Engine Design

## 責務分離

| コンポーネント                   | 責務                                     | 非責務           |
| -------------------------------- | ---------------------------------------- | ---------------- |
| `SkillCreatorVerificationEngine` | Layer 1/2 validator 実行、結果集約       | phase state 管理 |
| `SkillCreatorWorkflowEngine`     | verify phase の状態遷移、detail snapshot | 実ファイル検証   |
| `RuntimeSkillCreatorFacade`      | engine 呼び出しと bridge 境界維持        | validator 実装   |

## 想定 API

```ts
class SkillCreatorVerificationEngine {
  verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>;
}
```

## 設計メモ

- Layer 1 は file system existence check に限定する。
- Layer 2 は `SKILL.md` と agent spec の content rule check に限定する。
- Layer 3/4 は既存スコープのままとし、本 workflow では拡張しない。
