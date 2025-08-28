// components/Loader.tsx
export default function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-50">
      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>

      {/* Text with pulse animation */}
      <p className="mt-6 text-xl font-semibold text-indigo-700 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
