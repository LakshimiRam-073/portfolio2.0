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
      className="px-4 py-1.5 text-sm rounded-md bg-neutral-100 text-black hover:bg-white transition-colors"
    >
      Resume
    </button>
  )
}
