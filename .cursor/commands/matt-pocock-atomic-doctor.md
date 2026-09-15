# /matt-pocock-atomic-doctor

matt-pocock-atomic-workflow 환경 진단(스킬 충돌, YAML 문법, 설정 필터) 및 자동 교정을 수행한다.

인자 형식: `[check | fix]`

`matt-pocock-atomic-workflow` 환경 진단 도구를 실행하여 스킬 충돌, YAML frontmatter 문법 오류, 설정 상태를 점검하고 필요시 자동 교정한다.

인자: check(슬래시 뒤에 붙인 텍스트가 있으면 그것을 우선한다)

동작 규칙:
1. 인자가 `fix`이거나 사용자가 교정/치료/해결을 요청한 경우:
   - `node scripts/doctor.mjs --fix`를 실행하여 스킬 충돌 완화(settings.json 패키지 필터 적용) 및 YAML 문법 교정을 수행한다.
2. 그 외(기본 `check`):
   - `node scripts/doctor.mjs`를 실행하여 현재 환경의 충돌 여부 및 구문 상태를 진단한다.
3. 진단 결과 요약:
   - 전역 스킬 디렉터리(`~/.agents/skills/`)와의 충돌 여부 및 패키지 필터 적용 상태
   - 스킬 frontmatter(`SKILL.md`) YAML 문법 에러(unquoted colon 등) 유무
   - 적용된 자동 교정 내역
4. 한국어로 친절하고 명확하게 진단 및 교정 결과를 보고한다.

---

## Cursor 메모

- 위임은 Task 툴(`/에이전트명` 또는 "Use the ... subagent ...")로 수행한다. Pi의 `subagent` 호출과 동등하다.
- 단계별 모델은 `.cursor/agents/<에이전트>.md`의 `model` frontmatter로 지정한다(Pi의 `settings.json` `agentOverrides` 대신).
- 슬래시 뒤에 붙인 텍스트는 위 본문의 인자 자리에 들어간다.

