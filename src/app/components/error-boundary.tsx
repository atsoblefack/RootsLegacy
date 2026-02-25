import { Link } from 'react-router';

export function ErrorBoundary() {
  return (
    <div className="h-screen w-full max-w-[375px] mx-auto bg-[#FFF8E7] flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🌳</div>
        <h1 className="text-2xl font-bold text-[#5D4037] mb-2">Oops!</h1>
        <p className="text-[#8D6E63] mb-6">
          Something went wrong. Let's get you back home.
        </p>
        <Link to="/home">
          <button className="h-14 px-8 bg-gradient-to-br from-[#D2691E] to-[#E8A05D] text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-transform">
            Go to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
