---
description: matt-pocock-atomic-workflow 단계별 모델 설정을 안내한다.
---
# matt-pocock-atomic-workflow 모델 설정

이 파일은 **읽기 전용**이다. 함부로 고치지 말고, 모델을 바꾸려면 아래 안내에 따라 `settings.json`을 편집한다.

## 단계별 에이전트와 settings 키

| 단계 | 에이전트 | 강제 스킬 | `agentOverrides` 키 |
|---|---|---|---|
| explore / recon | `g-explorer` / `scout` | `matt-pocock-atomic-workflow` | `g-explorer`, `scout` |
| plan | `g-planner` | `codebase-design` | `g-planner` |
| task | `g-tasker` | `to-tickets` | `g-tasker` |
| execute | `g-worker` | `tdd` | `g-worker` |
| review | `g-reviewer` | `code-review` | `g-reviewer` |
| commit/status/config | (현재 세션) | — | — |

스킬에 모델을 붙이지 않는다. 단계 모델을 바꾸려면 해당 에이전트 키의 `model` / `fallbackModels`만 고친다.

빌트인 에이전트(`oracle`, `reviewer`, `delegate`, `worker` 등)도 같은 `agentOverrides` 아래에서 설정한다.

## 바꾸는 법

`/g-config` (또는 `/g-settings`) 커맨드를 사용하면 현재 설정을 바로 조회하고 대화형으로 안전하게 변경할 수 있다.

직접 편집할 경우 `~/.pi/agent/settings.json`의 `subagents.agentOverrides` 안에서 원하는 에이전트 키의 `model`과 `fallbackModels`를 편집한다.

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
