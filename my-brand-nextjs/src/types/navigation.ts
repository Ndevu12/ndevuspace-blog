export interface NavigationItem {
  name: string
  href: string
  isExternal?: boolean
}

export interface SocialLink {
  name: string
  href: string
  icon: React.ReactNode
  ariaLabel: string
}

export interface HeaderProps {
  className?: string
}

export interface FooterProps {
  className?: string
}
