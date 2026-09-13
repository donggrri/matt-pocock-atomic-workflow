# 테스트와 mutation

SKILL.md를 먼저 읽는다. 테스트 파일을 쓰거나 `/matt-pocock-atomic-execute`·`/matt-pocock-atomic-review`에서 검사를 돌릴 때 연다.

## 저장소 테스트 찾기

1. `tests/README.md`가 있으면 그 표를 따른다. 워크플로가 덮어쓰지 않는다.
2. 없으면 `package.json`의 `test` / `lint` / `test:mutate`, `pyproject.toml`의 `[tool.pytest...]`, `go.mod` 존재 여부를 확인하고 그 관례를 따른다.
3. 위 어느 것도 없으면 PLAN·REVIEW에 **「테스트 없음」** 을 적는다. 임의의 러너·구조를 강제하지 않는다.

## 파일 쓰는 법

로직·계약·인증이면 **자동 테스트부터** 한다 (red → 구현 → green). 화면 클릭만 있는 일이면 체크리스트만 추가한다.

- 위치: 저장소의 기존 테스트 폴더 관례를 따른다. 관례가 없으면 `tests/` 아래에 추가하고 PLAN에 위치를 명시한다.
- 시선: public 함수·HTTP 계약. private 구현을 꿰지 않는다.
- 이름: 한국어로 동작을 적는다. 예: `add_task는 create_task 계약을 사용한다`.
- 데이터: 가짜 DB/스텁. 실 자격 증명·실토큰·실네트워크 금지.
- 기대값: 스펙에 있는 리터럴. `assert.equal(fn(x), fn(x))` 같은 동어반복 금지.
- `tests/README.md`가 있으면 새 케이스를 그 표에도 반영한다.

TASKS 예:

```
- [ ] 무토큰 HTTP는 401
  - files: `tests/<경로>/<이름>.test.<확장자>`
  - depends: (없음)
  - worker: self
  - done: `<테스트 명령>` 해당 케이스가 한 번은 실패했다가 구현 후 통과
```

구현 항목의 `done`에는 실행할 명령을 적는다. 「테스트 있음」만 적지 않는다.

## 실행 순서

**Execute (항목마다)**  
워커가 돌아와도 오케스트레이터가 `done` 명령을 직접 돌린다. 실패면 `[x]` 하지 않고 `막힘:`을 남긴다.

**Review**  
1. 저장소의 단위 테스트 명령 실행 (위 「저장소 테스트 찾기」 순서로). 없으면 REVIEW에 「테스트 없음」. 실패면 REVIEW를 실패로 쓴다.  
2. 체크리스트가 필요한 화면 변경이면 릴리즈 체크리스트에 빠진 칸이 있는지 본다. 사람이 못 누른 항목을 통과로 쓰지 않는다.  
3. mutation (아래).  
4. 통합·릴리즈 테스트는 환경이 갖춰진 경우에만. 스킵은 실패가 아니다.

워커 브리프에도 같은 `done` 명령을 넣는다. 워커의 「테스트 통과」문장만 믿지 않는다.

## Mutation

단위 테스트가 통과해도, 조건문을 뒤집어도 테스트가 그대로면 그 테스트는 약하다. Stryker가 코드를 살짝 바꾸고 테스트가 실패하는지 본다.

**한다**

- `/matt-pocock-atomic-review`이고
- 이번 diff에 단위 테스트 대상 로직이 있고
- `stryker.config.json` 또는 `npm run test:mutate` 등 mutation 설정이 저장소에 있을 때

**하지 않는다**

- HTML/CSS/체크리스트만 바꾼 경우
- 문서·커맨드·스킬만 고친 경우
- mutation 설정이 없는 프로젝트 → REVIEW에 `mutation: 없음` (설치를 몰래 하지 않는다)

명령 (이번 파일만, 전체를 매번 돌리지 않는다):

```powershell
npx stryker run --mutate <변경된-로직-파일>
```

여러 파일이면 `--mutate`에 쉼표로 잇는다. 전체는 해당 저장소의 mutation 전체 명령을 사용한다 (느리다. 릴리즈나 사용자가 원할 때만).

결과:

- **killed** — 테스트가 돌연변이를 잡음. 좋음.
- **survived** — 테스트가 못 잡음. REVIEW `결함`에 파일·돌연변이를 적고, 의미 있는 생존이면 테스트를 보강한 뒤 다시 돌린다.
- 점수가 `thresholds.break` 미만이면 `/matt-pocock-atomic-review` 실패. 커밋하지 않는다.

생존 전부가 결함은 아니다. 동등한 리팩터(로그 문구, 죽은 코드)는 건너뛰고 이유를 한 줄 적는다. 인증·권한·RPC 계약 생존은 건너뛰지 않는다.
