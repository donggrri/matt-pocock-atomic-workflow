---
description: matt-pocock-atomic-workflow 설정(모델, 폴백, 스킬 등)을 조회하고 대화형으로 변경/초기화한다 (/g-config 별칭).
argument-hint: "[show | init | <agent> <model>]"
---
`prompts/g-config.md`와 동일하게 matt-pocock-atomic-workflow 설정을 확인하고 관리한다.

인자: ${@:-show}

동작 규칙:
1. `~/.pi/agent/settings.json`(및 현재 프로젝트 `.pi/settings.json`이 있으면 함께)을 읽는다.
2. 현재 `subagents.agentOverrides`의 matt-pocock-atomic-workflow 단계별 에이전트(`g-explorer`, `g-planner`, `g-tasker`, `g-worker`, `g-reviewer` 등) 및 `skills`, `packages` 상태를 확인한다.
3. 인자가 `init`이면 `settings.example.json`을 기반으로 `settings.json`에 안전하게 병합하고, `<agent> <model>`이면 해당 에이전트의 모델 설정을 갱신한다.
4. 기본(`show`): 설정이 등록되어 있으면 표로 출력하고, 비어 있으면 사용 가능한 Provider/모델 목록과 추천 프리셋을 제시하여 대화형 선택을 안내한다.
5. 에이전트 `.md` frontmatter를 직접 고치지 않고 `settings.json`만 수정함을 상기시킨다.

한국어로 결과를 보고한다.
