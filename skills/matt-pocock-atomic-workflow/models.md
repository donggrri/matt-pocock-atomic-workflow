# matt-pocock-atomic-workflow 모델

SKILL.md를 먼저 읽는다. 위임할 모델이 필요할 때만 연다.

## 설정 위치

모델은 에이전트 파일(frontmatter)이 아니라 **settings에서 고른다**.

| 대상 | 설정 경로 |
|---|---|
| explorer, planner, tasker, worker, reviewer | `~/.pi/agent/settings.json` → `subagents.agentOverrides.<에이전트명>` |
| scout, researcher, oracle, delegate (빌트인) | 동일 `agentOverrides` 아래 별도 키 |

각 PC마다 선호 모델이 다를 수 있다. `settings.json`(또는 `settings.example.json`이 있으면 그것을 복사해 `settings.json`으로 만든 뒤)의 `agentOverrides`에서 `model`과 `fallbackModels`를 맞게 채운다. 에이전트 `.md` frontmatter에는 model 키를 두지 않는다.

Pi 자식 세션은 `provider/id` 또는 `provider/id:thinking`으로 고른다. Cursor와 Antigravity는 확장 프로바이더라서 이 모델을 쓰는 자식은 `async: true`(백그라운드)여야 한다.

## 단계 기본값

스킬에는 모델이 없다. 단계마다 **에이전트**를 띄워야 모델이 갈린다. 그 에이전트가 스킬을 읽는다.

| 단계 | 에이전트 | 강제 스킬 | settings 키 |
|---|---|---|---|
| explore / recon | `explorer` / `scout` | `matt-pocock-atomic-workflow` | `agentOverrides.explorer`, `agentOverrides.scout` |
| plan | `planner` | `matt-pocock-atomic-workflow`, `codebase-design` | `agentOverrides.planner` |
| task | `tasker` | `matt-pocock-atomic-workflow`, `to-tickets` | `agentOverrides.tasker` |
| execute | `worker` | `matt-pocock-atomic-workflow`, `tdd` | `agentOverrides.worker` |
| review | `reviewer` | `matt-pocock-atomic-workflow`, `code-review` | `agentOverrides.reviewer` |
| commit/status/config | parent | (없음) | (현재 세션 모델) |

## 폴백 계약

pi-subagents `fallbackModels`는 **툴을 쓰기 전** 재시도 가능한 공급자 실패에만 다음 모델로 넘어간다.

포함: 구독 쿼터, 429, 모델 불가, 오버로드, 공급자 타임아웃.

포함하지 않음: 작업 실패, 런 타임아웃, 툴을 이미 쓴 뒤의 일반 오류.

xAI나 Antigravity 사용량이 끝나면 Cursor `grok-4.6` / `composer-2.5`로 넘어가게 되어 있다. 부모는 모델을 즉석에서 추측해 바꾸지 않는다. 체인이 모두 실패하면 그 오류를 보고하고 멈춘다.

## `/matt-pocock-atomic-execute` 별칭

특정 모델을 직접 지정하고 싶을 때 부모가 `agentOverrides`를 임시로 덮어쓰거나 다음 별칭 힌트를 참고한다:

- `agy` / `sonnet` → `antigravity/claude-sonnet-4-6`
- `pro` → `antigravity/gemini-3-1-pro:high`
- `flash` → `antigravity/gemini-3-8-flash:high`

`AskAntigravity`는 폴백이 없다. 사용자가 agy CLI 원샷을 분명히 원할 때만 쓴다.
