export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Loading blog articles...
        </p>
      </div>
    </div>
  );
}
