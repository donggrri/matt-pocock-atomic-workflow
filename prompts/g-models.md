---
description: g-workflow 단계별 모델 설정을 안내한다.
---
# g-workflow 모델 설정

이 파일은 **읽기 전용**이다. 함부로 고치지 말고, 모델을 바꾸려면 아래 안내에 따라 `settings.json`을 편집한다.

## 단계별 에이전트와 settings 키

| 단계 | 에이전트 | `agentOverrides` 키 |
|---|---|---|
| recon | `scout` / `researcher` | `scout`, `researcher` |
| plan | `g-planner` | `g-planner` |
| task | `g-tasker` | `g-tasker` |
| execute | `g-worker` | `g-worker` |
| review | `g-reviewer` | `g-reviewer` |
| commit/status | (현재 세션) | — |

빌트인 에이전트(`oracle`, `reviewer`, `delegate`, `worker` 등)도 같은 `agentOverrides` 아래에서 설정한다.

## 바꾸는 법

`~/.pi/agent/settings.json`의 `subagents.agentOverrides` 안에서 원하는 에이전트 키의 `model`과 `fallbackModels`를 편집한다.

```json
{
  "subagents": {
    "agentOverrides": {
      "g-planner": {
        "model": "xai/grok-4.6",
        "fallbackModels": ["antigravity/claude-sonnet-4-6"]
      }
    }
  }
}
```

`settings.example.json`(이 저장소 루트)을 참고해 처음 설정하면 된다.

## 주의

- 에이전트 `.md` frontmatter에 `model` 키를 넣으면 안 된다. 그렇게 하면 settings override가 무시된다.
- xAI/Antigravity 쿼터가 소진되면 `fallbackModels` 체인이 자동으로 다음 모델로 넘어간다.
- `AskAntigravity`(agy CLI 원샷)는 폴백이 없다. 사용자가 분명히 원할 때만 쓴다.
