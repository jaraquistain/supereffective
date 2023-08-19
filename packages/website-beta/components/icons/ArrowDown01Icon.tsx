import { BaseIcon, IconProps } from './BaseIcon'

export default function ArrowDown01Icon(props: IconProps) {
  // https://lucide.dev/icons/arrow-down-0-1
  return (
    <BaseIcon {...props}>
      <path d="m3 16 4 4 4-4" />
      <path d="M7 20V4" />
      <rect x="15" y="4" width="4" height="6" ry="2" />
      <path d="M17 20v-6h-2" />
      <path d="M15 20h4" />
    </BaseIcon>
  )
}
