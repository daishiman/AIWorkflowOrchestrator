# Phase 2: APIアクセスパターン

getSkillCreatorApi(): SkillCreatorRuntimeApi → window.electronAPI.skillCreator

- planSkill: (prompt, authMode?, apiKey?) → Promise<{success, data?, error?}>
- executePlan: (planId, skillSpec: string, authMode?, apiKey?) → Promise<{success, data?, error?}>
  - C-1回避: skillSpecは必須string
