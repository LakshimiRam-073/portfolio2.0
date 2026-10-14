import Giscus from '@giscus/react'

export default function GiscusComments() {
  return (
    <div className="mt-16 pt-10 border-t border-[#2a2a2a]">
      <h2 className="text-2xl font-bold mb-6 font-sans text-[#e6e6e6]">
        Comments
      </h2>
      <Giscus
        repo="LakshimiRam-073/portfolio2.0"
        repoId="R_kgDORpPTlA"
        category="General"
        categoryId="DIC_kwDORpPTlM4C6UZb"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="dark_dimmed"
        lang="en"
        loading="lazy"
      />
      <p className="mt-4 text-xs text-neutral-400 text-center">
        Comments are powered by{' '}
        <a
          href="https://giscus.app"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#e6e6e6]"
        >
          Giscus
        </a>
        . Sign in with GitHub to leave a comment.
      </p>
    </div>
  )
}
