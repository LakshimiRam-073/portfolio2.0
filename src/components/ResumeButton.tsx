export default function ResumeButton() {
  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = '/resume.pdf'
    link.download = 'resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-1.5 text-sm rounded-md border border-gray-300 dark:border-stone-700 text-gray-800 dark:text-stone-200 hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors"
    >
      Resume
    </button>
  )
}
