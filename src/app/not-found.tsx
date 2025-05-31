export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="animate-bounce bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-9xl font-extrabold text-transparent drop-shadow-lg">
        404
      </div>
      <h1 className="mt-4 text-3xl font-bold text-gray-800">
        페이지를 찾을 수 없어요!
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        요청하신 페이지가 사라졌거나, <br />
        잘못된 주소를 입력하셨을 수 있어요.
      </p>
      <a
        href="/"
        className="mt-8 rounded-full bg-gradient-to-r from-blue-400 to-pink-400 px-6 py-3 font-semibold text-white shadow-lg transition-transform duration-200 hover:scale-105"
      >
        홈으로 돌아가기
      </a>
      <div className="mt-12 opacity-60">
        <svg width="120" height="120" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#f472b6" />
          <ellipse cx="9" cy="10" rx="1.5" ry="2" fill="#fff" />
          <ellipse cx="15" cy="10" rx="1.5" ry="2" fill="#fff" />
          <path
            d="M8 16c1.333-1 4.667-1 6 0"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
