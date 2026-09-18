# /matt-pocock-atomic-status

matt-pocock-atomic-workflow 진행 상태를 보고한다.

`matt-pocock-atomic-workflow` 스킬을 읽고 상태만 보고한다.

파일을 고치거나 커밋하지 마라. 서브에이전트를 띄우지 마라.

1. **기본 출력은 전역 목록이다.** `node scripts/work-status.mjs list`(또는 `npm run status`)를 실행하고, `~/.matt-pocock-workflow/docs/{shortRepo}/{slug}/STATUS.json` 전체를 표로 보고한다. Cursor PowerShell: `node scripts/work-status.mjs list`, `%USERPROFILE%/.matt-pocock-workflow/docs/{shortRepo}/{slug}/STATUS.json`. 현재 작업공간 슬러그 하나만 보여 주지 마라. 인자에 슬러그가 있으면 그때만 `show <slug>`로 한 건을 자세히 본다.
2. 레거시 호환으로 `.docs/<slug>/`(`.docs/*/`), `git worktree list` 형제 경로의 `.docs/*/`, 하네스 `docs/<slug>/`(Pi bash: `~/.pi/agent/matt-pocock-atomic-workflow/docs/<slug>/`, Cursor PowerShell: `%USERPROFILE%/.cursor/matt-pocock-atomic-workflow/docs/<slug>/`)에서도 `EXPLORE-*.md`, `PLAN-*.md`, `TASKS-*.md`, `REVIEW-*.md`를 찾는다. 목록에 없는 레거시만 짧게 덧붙인다. 루트·홈에 남은 레거시 평탄 파일이 있으면 언급하되 자동 이동하지 않는다.
3. 런 로그(`~/.matt-pocock-workflow/runs/{shortRepo}/{slug}/`, Cursor PowerShell: `%USERPROFILE%/.matt-pocock-workflow/runs/{shortRepo}/{slug}/` 또는 기존 하네스 `~/.pi/agent/matt-pocock-atomic-workflow/runs/`)도 본다.
4. 목록이 비면 「활성 워크플로 없음. `/matt-pocock-atomic-explore` 또는 `/matt-pocock-atomic-plan`으로 시작한다」.
5. 목록이 있으면 슬러그·shortRepo·phase·체크 비율·막힘·Cursor `sessionId`를 한국어로 표기한다. 현재 cwd와 `repo`/`cwd`가 맞는 행이 있으면 표시만 한다. 막힘 발생 시 실패한 항목만 재시도하도록 다음 커맨드로 `/matt-pocock-atomic-execute`를 안내한다.

---

## Cursor 메모

- 위임은 Task 툴(`/에이전트명` 또는 "Use the ... subagent ...")로 수행한다. Pi의 `subagent` 호출과 동등하다.
- 단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model` frontmatter로 지정한다(Pi의 `settings.json` `agentOverrides` 대신).
- 슬래시 뒤에 붙인 텍스트는 위 본문의 인자 자리에 들어간다.

