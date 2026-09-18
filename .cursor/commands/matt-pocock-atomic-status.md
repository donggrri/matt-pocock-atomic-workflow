# /matt-pocock-atomic-status

matt-pocock-atomic-workflow 진행 상태를 보고한다.

`matt-pocock-atomic-workflow` 스킬을 읽고 상태만 보고한다.

파일을 고치거나 커밋하지 마라. 서브에이전트를 띄우지 마라.

1. `.docs/<slug>/`(`.docs/*/`), `git worktree list` 형제 경로의 `.docs/*/`, 하네스 `docs/<slug>/`(Pi bash: `~/.pi/agent/matt-pocock-atomic-workflow/docs/<slug>/`, Cursor PowerShell: `%USERPROFILE%/.pi/agent/matt-pocock-atomic-workflow/docs/<slug>/` 또는 `%USERPROFILE%/.cursor/matt-pocock-atomic-workflow/docs/<slug>/`)에서 `EXPLORE-*.md`, `PLAN-*.md`, `TASKS-*.md`, `REVIEW-*.md`를 찾는다. 루트·홈에 남은 레거시 평탄 파일이 있으면 언급하되 자동 이동하지 않는다.
2. 하네스 런 로그(Pi bash: `~/.pi/agent/matt-pocock-atomic-workflow/runs/<slug>/` 또는 `~/.pi/agent/matt-pocock-atomic-workflow/runs/`, Cursor PowerShell: `%USERPROFILE%/.pi/agent/matt-pocock-atomic-workflow/runs/<slug>/` 또는 `%USERPROFILE%/.cursor/matt-pocock-atomic-workflow/runs/`)도 본다.
3. 없으면 「활성 워크플로 없음. `/matt-pocock-atomic-explore` 또는 `/matt-pocock-atomic-plan`으로 시작한다」.
4. 있으면 슬러그, 단계 상태(EXPLORE/PLAN/TASKS/REVIEW), 체크 비율, worker, 막힘, 다음에 칠 커맨드 하나만 한국어로 안내한다. 막힘 발생 시 실패한 항목만 재시도하도록 다음 커맨드로 `/matt-pocock-atomic-execute`를 안내한다.

---

## Cursor 메모

- 위임은 Task 툴(`/에이전트명` 또는 "Use the ... subagent ...")로 수행한다. Pi의 `subagent` 호출과 동등하다.
- 단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model` frontmatter로 지정한다(Pi의 `settings.json` `agentOverrides` 대신).
- 슬래시 뒤에 붙인 텍스트는 위 본문의 인자 자리에 들어간다.

