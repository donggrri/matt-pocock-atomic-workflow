# matt-pocock-atomic-workflow

`/g-plan`이 PLAN을 확정하면 task → execute → review는 자동이다. 커밋만 `/g-commit`. 이어서 할 일이 흐려지면 `/g-status`.

이 저장소는 **Pi**를 기본 하네스로 한다. 단계마다 서브에이전트가 다른 모델로 돌고, 필요한 matt-pocock 스킬은 이 패키지에 번들되어 설치 즉시 발견된다.

계획 단계의 사용자 문답은 async `g-planner`가 아니라 부모 오케스트레이터가 번들된 `grilling`으로 수행한다. 부모가 남긴 `계획 정제` brief가 있어야 g-planner가 PLAN을 작성한다. `wayfinder` tracker 흐름은 사용자가 명시했을 때만 사용하고, 자동 큰 작업 경로는 `local-wayfinding`이다.

에이전트 지시: [SKILL.md](SKILL.md). 템플릿: [reference.md](reference.md). 워커: [workers.md](workers.md). 모델: [models.md](models.md). 테스트: [testing.md](testing.md).

진입점:

- Pi 프롬프트: 패키지 `prompts/g-*.md` (설치 시 자동 등록. 사용자 홈 복사본을 남기지 말 것)
- Pi 에이전트: 패키지 `agents/g-*.md` (설치 시 자동 등록. 사용자 홈 복사본을 남기지 말 것)

계획이 막히면 구현으로 넘어가지 않는다. 커밋은 `/g-commit`일 때만, 푸시는 따로 요청할 때만 한다.
