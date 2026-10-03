import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'vagabond-ui/dropdown-menu'
import { brands, isBrand } from 'vagabond-ui/brands'
import { useAppearance } from './appearance'

export function AppearanceMenu() {
  const { brand, theme, setBrand } = useAppearance()
  const selected = brands.find((item) => item.id === brand) || brands[0]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="appearance-trigger"
          aria-label={`Appearance: ${selected.name}`}
        >
          <span
            className="appearance-swatch"
            style={{ background: theme === 'dark' ? selected.darkSwatch : selected.lightSwatch }}
            aria-hidden="true"
          />
          <span className="appearance-label">{selected.name}</span>
          <ChevronDown size={14} className="appearance-chevron" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="appearance-menu">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={brand}
          onValueChange={(value) => isBrand(value) && setBrand(value)}
        >
          {brands.map((item) => (
            <DropdownMenuRadioItem key={item.id} value={item.id} aria-label={item.name}>
              <div className="appearance-option">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.subtitle}</span>
                </div>
                <span
                  className="appearance-swatch"
                  aria-hidden="true"
                  style={{ background: theme === 'dark' ? item.darkSwatch : item.lightSwatch }}
                />
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="#design-preview">
            Design comparison <ArrowUpRight size={15} className="ml-auto" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
