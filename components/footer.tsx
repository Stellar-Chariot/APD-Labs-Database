import type React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} APD LABS. All rights reserved.</p>
        <p className="text-sm mt-2">Powered by React and Tailwind CSS</p>
      </div>
    </footer>
  )
}

export default Footer

