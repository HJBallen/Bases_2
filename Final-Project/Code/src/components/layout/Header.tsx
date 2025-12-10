import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, userRole, signOut, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/productos', label: 'Productos' },
    { href: '/categorias', label: 'Categorías' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (userRole === 'administrador') return '/admin';
    if (userRole === 'vendedor') return '/vendedor';
    return null;
  };

  console.log(isLoading);
  

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-2xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80 md:text-3xl"
        >
          <span className="text-primary">BOGO</span>
          <span>GO</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
          </Button>

          {/* User Menu - Desktop */}
          {isLoading ? (
            // 👇 Mientras el contexto está cargando, mostramos un spinner
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              disabled
              aria-label="Cargando sesión"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user.email}
                </div>
                <div className="px-2 py-1 text-xs text-muted-foreground capitalize">
                  {userRole || 'comprador'}
                </div>
                <DropdownMenuSeparator />
                {getDashboardLink() && (
                  <DropdownMenuItem
                    onClick={() => navigate(getDashboardLink()!)}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Mi Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => navigate('/auth')}
            >
              <User className="h-5 w-5" />
            </Button>
          )}

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'absolute left-0 right-0 top-full border-b border-border bg-background transition-all duration-300 md:hidden',
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible',
        )}
      >
        <nav className="container flex flex-col gap-2 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* User section - Mobile */}
          {isLoading ? (
            <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cargando cuenta...</span>
            </div>
          ) : user ? (
            <>
              {getDashboardLink() && (
                <Link
                  to={getDashboardLink()!}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mi Dashboard
                </Link>
              )}
              <button
                className="rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-secondary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Iniciar Sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
