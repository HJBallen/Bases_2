import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link 
              to="/" 
              className="font-display text-2xl font-bold tracking-tight"
            >
              <span className="text-primary">BOGO</span>
              <span>GO</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Tu destino para la moda de calidad premium. Descubre las últimas tendencias y estilos exclusivos.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2">
              {['Inicio', 'Productos', 'Categorías', 'Ofertas'].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide">
              Atención al Cliente
            </h4>
            <ul className="space-y-2">
              {['Centro de Ayuda', 'Envíos', 'Devoluciones', 'Contacto'].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide">
              Newsletter
            </h4>
            <p className="text-sm text-muted-foreground">
              Suscríbete para recibir las últimas ofertas y novedades.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 Bogogo. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
