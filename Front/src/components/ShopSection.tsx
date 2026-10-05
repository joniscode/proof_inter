import type { ReactNode } from 'react';
import texts from '../content/texts.json';
import { useCatalog } from '../hooks/useCatalog';
import { useCart } from '../hooks/useCart';
import { CartPanel } from './CartPanel';
import { PointsBalance } from './PointsBalance';
import { ProductCard } from './ProductCard';
import { Notice } from './ui/Notice';
import { Button } from './ui/Button';
import { SectionLabel } from './ui/SectionLabel';
import { formatCategory } from '../lib/format';

export function ShopSection() {
  const catalog = useCatalog();
  const cart = useCart();
  async function buy() {
    if (await cart.checkout()) catalog.reload();
  }
  const products = catalog.page?.data ?? [];
  const cartUnavailable = cart.loading || cart.busy || !cart.cart || Boolean(cart.error);
  let catalogContent: ReactNode;

  if (catalog.loading) {
    catalogContent = <Notice message={texts.catalog.loading} />;
  } else if (catalog.error) {
    catalogContent = <Notice message={catalog.error} error onRetry={catalog.reload} />;
  } else if (products.length === 0) {
    catalogContent = <Notice message={texts.catalog.empty} />;
  } else {
    catalogContent = (
      <div className="row g-3">
        {products.map(product => (
          <div className="col-sm-6 col-xl-4" key={product.id}>
            <ProductCard
              product={product}
              quantity={cart.cart?.items.find(item => item.product.id === product.id)?.quantity ?? 0}
              disabled={cartUnavailable}
              onAdd={() => { void cart.addProduct(product); }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="shop-section" id="catalogo" aria-labelledby="catalog-title">
      <div className="container-fluid page-container">
        <div className="shop-heading d-flex flex-wrap align-items-end justify-content-between gap-3">
          <div>
            <SectionLabel number={texts.catalog.number}>{texts.catalog.label}</SectionLabel>
            <h2 id="catalog-title">{texts.catalog.title}</h2>
          </div>
          {!catalog.loading && !catalog.error && catalog.page && <span className="shop-summary">{texts.catalog.summary}: {products.length} / {catalog.page.pagination.total}</span>}
        </div>
        <div className="row g-3 catalog-filters mb-4">
          <div className="col-md-8">
            <label className="form-label" htmlFor="product-search">{texts.catalog.search}</label>
            <input
              id="product-search"
              className="form-control"
              type="search"
              maxLength={100}
              value={catalog.filters.search}
              onChange={event => catalog.changeFilter('search', event.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="product-category">{texts.catalog.category}</label>
            <select
              id="product-category"
              className="form-select"
              value={catalog.filters.category}
              onChange={event => catalog.changeFilter('category', event.target.value)}
            >
              <option value="">{texts.catalog.all}</option>
              {catalog.categories.map(category => (
                <option key={category} value={category}>{formatCategory(category)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-lg-8" aria-busy={catalog.loading}>
            {catalogContent}
            {!catalog.loading && !catalog.error && catalog.page && catalog.page.pagination.totalPages > 0 && (
              <nav className="catalog-pagination d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4" aria-label={texts.catalog.pagination}>
                <Button disabled={catalog.filters.page <= 1} onClick={() => catalog.changePage(catalog.filters.page - 1)}>{texts.catalog.previous}</Button>
                <span aria-live="polite">{texts.catalog.page} {catalog.filters.page} {texts.catalog.of} {catalog.page.pagination.totalPages}</span>
                <Button disabled={catalog.filters.page >= catalog.page.pagination.totalPages} onClick={() => catalog.changePage(catalog.filters.page + 1)}>{texts.catalog.next}</Button>
              </nav>
            )}
          </div>
          <aside className="col-lg-4">
            <div className="shop-sidebar">
              {cart.earned > 0 && <div role="status" className="reward-notice">{texts.points.earned}: +{cart.earned}. {texts.points.confirmed}</div>}
              <PointsBalance points={cart.error || cart.loading ? undefined : cart.cart?.points} />
              <CartPanel
                cart={cart.cart}
                loading={cart.loading}
                error={cart.error}
                actionError={cart.actionError}
                busy={cart.busy}
                checkoutStatus={cart.checkoutStatus}
                checkoutDisabled={catalog.loading}
                onCheckout={() => { void buy(); }}
                onRemove={productId => { void cart.removeProduct(productId); }}
                onQuantity={(product, quantity) => { void cart.changeQuantity(product, quantity); }}
                onRetry={cart.reload}
              />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
