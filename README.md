# 출석체크 시스템

출석, 퇴근, 재택근무, 연차 관리를 위한 웹 애플리케이션입니다.

## 기능

- 구글 OAuth를 통한 로그인
- 출근/퇴근 기록
- 재택근무 신청 및 승인
- 연차 신청 및 구글 캘린더 연동
- 실시간 출근/재택/연차 현황 확인

## 기술 스택

- Vue 3
- TypeScript
- Vite
- Supabase
- Tailwind CSS
- Google Calendar API

## 설치 및 실행

1. 저장소 클론
```bash
git clone [repository-url]
cd attendance
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env` 파일을 생성하고 다음 변수들을 설정합니다:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_CALENDAR_ID=your_company_calendar_id
```

4. 개발 서버 실행
```bash
npm run dev
```

## Supabase 설정

1. Supabase 프로젝트 생성
2. 다음 테이블들을 생성합니다:

### users
- id (uuid, primary key)
- email (text)
- name (text)
- avatar_url (text, nullable)
- created_at (timestamp with time zone)

### attendance
- id (uuid, primary key)
- user_id (uuid, foreign key to users.id)
- check_in (timestamp with time zone)
- check_out (timestamp with time zone, nullable)
- created_at (timestamp with time zone)

### remote_work
- id (uuid, primary key)
- user_id (uuid, foreign key to users.id)
- approver_id (uuid, foreign key to users.id)
- date (date)
- status (text: 'PENDING', 'APPROVED', 'REJECTED')
- created_at (timestamp with time zone)

### leave
- id (uuid, primary key)
- user_id (uuid, foreign key to users.id)
- start_date (date)
- end_date (date)
- type (text: 'ANNUAL', 'SICK', 'OTHER')
- status (text: 'PENDING', 'APPROVED', 'REJECTED')
- created_at (timestamp with time zone)

## Google Calendar API 설정

1. Google Cloud Console에서 프로젝트 생성
2. Calendar API 활성화
3. OAuth 2.0 클라이언트 ID 생성
4. 서비스 계정 생성 및 캘린더 공유 설정

## 라이센스

MIT
