# g-workflow

`/g-plan` → `/g-task` → `/g-execute` → `/g-review` → `/g-commit` 순으로 쓴다. 이어서 할 일이 흐려지면 `/g-status`.

이 저장소는 **Pi**를 기본 하네스로 한다. Pi에서는 구현을 서브에이전트에 넘긴다: `/g-delegate g-worker` 또는 `/g-execute`. Cursor에서 CLI로 넘기려면 `/g-delegate agy` 또는 `/g-execute codex`.

에이전트 지시: [SKILL.md](SKILL.md). 템플릿: [reference.md](reference.md). 워커: [workers.md](workers.md). 모델: [models.md](models.md). 테스트: [testing.md](testing.md).

진입점:

- Pi 프롬프트: `~/.pi/agent/prompts/g-*.md` (이 패키지가 설치되면 자동 등록)
- Pi 에이전트: `~/.pi/agent/agents/g-*.md` (이 패키지가 설치되면 자동 등록)

한 채팅에 여러 커맨드를 붙여도 된다. 계획이 막히면 구현으로 넘어가지 않는다. 커밋은 `/g-commit`일 때만, 푸시는 따로 요청할 때만 한다.
