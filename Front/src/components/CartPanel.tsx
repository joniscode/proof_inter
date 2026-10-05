import type { Cart, Product } from '../types/shop';
import texts from '../content/texts.json';
import { formatPrice } from '../lib/format';
import { Button } from './ui/Button';
import { Notice } from './ui/Notice';

export function CartPanel({ cart, loading, error, actionError, busy, checkoutStatus, checkoutDisabled,
  onRemove, onQuantity, onCheckout, onRetry }: {
  cart: Cart | null;
  loading: boolean;
  error: string;
  actionError: string;
  busy: boolean;
  checkoutStatus: 'idle' | 'pending' | 'success';
  checkoutDisabled: boolean;
  onRemove: (productId: number) => void;
  onQuantity: (product: Product, quantity: number) => void;
  onRetry: () => void;
  onCheckout: () => void;
}) {
  return (
    <section className="cart-panel" aria-labelledby="cart-title" aria-busy={loading || busy}>
      <h3 id="cart-title">{texts.cart.title}</h3>
      {loading ? <Notice message={texts.cart.loading} /> : error ? <Notice message={error} error onRetry={onRetry} /> : cart && (
        <>
          {cart.items.length === 0 ? <Notice message={texts.cart.empty} /> : (
            <ul className="cart-items list-unstyled mb-0">
              {cart.items.map(item => (
                <li className="cart-item" key={item.product.id}>
                  <h4>{item.product.name}</h4>
                  <div className="quantity-control d-flex align-items-center gap-2 my-2">
                    <Button
                      className="punto-button--small"
                      disabled={busy || item.quantity <= 1}
                      onClick={() => onQuantity(item.product, item.quantity - 1)}
                      aria-label={`${texts.cart.decrease}: ${item.product.name}`}
                    >
                      {texts.cart.minus}
                    </Button>
                    <span>{texts.cart.quantity}: {item.quantity}</span>
                    <Button
                      className="punto-button--small"
                      disabled={busy || item.quantity >= Math.min(item.product.stock, 999)}
                      onClick={() => onQuantity(item.product, item.quantity + 1)}
                      aria-label={`${texts.cart.increase}: ${item.product.name}`}
                    >
                      {texts.cart.plus}
                    </Button>
                  </div>
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <strong>{formatPrice(item.subtotal)}</strong>
                    <Button className="punto-button--small" onClick={() => onRemove(item.product.id)} disabled={busy} aria-label={`${texts.cart.remove}: ${item.product.name}`}>{texts.cart.remove}</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="cart-totals">
            <span>{texts.cart.units}: {cart.totalItems}</span>
            <div className="d-flex justify-content-between gap-3">
              <strong>{texts.cart.total}</strong>
              <strong>{formatPrice(cart.total)}</strong>
            </div>
          </div>
          <Button
            className="punto-button--primary w-100 mt-3"
            disabled={busy || checkoutDisabled || cart.items.length === 0}
            onClick={onCheckout}
          >
            {checkoutStatus === 'pending' ? texts.cart.buying : texts.cart.buy}
          </Button>
          <p className="cart-checkout-note mb-0 mt-2">{texts.cart.checkoutNote}</p>
        </>
      )}
      {busy && <Notice message={checkoutStatus === 'pending' ? texts.cart.buying : texts.cart.saving} />}
      {checkoutStatus === 'success' && <Notice message={texts.cart.checkoutSuccess} />}
      {actionError && <Notice message={actionError} error />}
    </section>
  );
}
