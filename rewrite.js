import camouflageRewrite from 'camouflage-rewrite'

const factory = (trifid) => {
  const { config } = trifid
  const { rewriteContent } = config

  let rewriteContentValue = true
  if (rewriteContent !== undefined) {
    rewriteContentValue = rewriteContent
  }

  return camouflageRewrite({
    ...config,
    rewriteContent: rewriteContentValue
  })
}

export default factory
