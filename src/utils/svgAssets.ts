const svgModules = import.meta.glob('../assets/svgs/*.svg', {
  as: 'raw',
  eager: true
})

type SvgAsset = {
  key: string
  name: string
  content: string
}

export function parseSvgAsset(path: string, content: unknown): SvgAsset {
  const filename = path.split('/').pop() || 'unknown.svg'
  const name = filename.replace(/\.svg$/i, '')
  return {
    key: path,
    name,
    content: content as string
  }
}

const svgAssets: SvgAsset[] = Object.entries(svgModules).map(([path, content]) =>
  parseSvgAsset(path, content)
)

export function getSvgAssets() {
  return svgAssets
}
