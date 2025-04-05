const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      <div className="ml-4">
        <p className="text-lg font-semibold">Loading APD LABS...</p>
      </div>
    </div>
  )
}

export default Loading

