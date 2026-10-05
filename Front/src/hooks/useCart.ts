import { useEffect, useRef, useState } from 'react';
import { checkoutCart, getCart, removeCartItem, setCartItem } from '../api/shop';
import texts from '../content/texts.json';
import type { Cart, Product } from '../types/shop';

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [earned, setEarned] = useState(0);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    getCart(controller.signal)
      .then(result => { if (!controller.signal.aborted) setCart(result); })
      .catch(() => { if (!controller.signal.aborted) setError(texts.cart.error); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [attempt]);

  async function update(items: Cart['items'], request: () => Promise<Cart>) {
    if (pending.current || !cart) return;
    pending.current = true;
    setBusy(true);
    setActionError('');
    setEarned(0);
    setCheckoutStatus('idle');
    const previous = cart;
    setCart({ ...cart, items, totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.subtotal, 0) });
    try {
      const confirmed = await request();
      setCart(confirmed);
      setEarned(confirmed.pointsGranted ?? 0);
    } catch (error) {
      setCart(previous);
      setActionError(`${texts.cart.rollback} ${error instanceof Error ? error.message : texts.connection.error}`);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function changeQuantity(product: Product, quantity: number) {
    if (!cart || !Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(product.stock, 999)) return;
    const items = cart.items.filter(item => item.product.id !== product.id);
    items.push({ product, quantity, subtotal: product.price * quantity });
    items.sort((a, b) => a.product.id - b.product.id);
    return update(items, () => setCartItem(product.id, quantity));
  }

  function addProduct(product: Product) {
    const quantity = cart?.items.find(item => item.product.id === product.id)?.quantity ?? 0;
    return changeQuantity(product, quantity + 1);
  }

  function removeProduct(productId: number) {
    if (!cart) return;
    return update(cart.items.filter(item => item.product.id !== productId), () => removeCartItem(productId));
  }

  async function checkout(): Promise<boolean> {
    if (pending.current || !cart || cart.items.length === 0) return false;
    pending.current = true;
    setBusy(true);
    setActionError('');
    setEarned(0);
    setCheckoutStatus('pending');
    try {
      setCart(await checkoutCart());
      setCheckoutStatus('success');
      return true;
    } catch (error) {
      setCheckoutStatus('idle');
      setActionError(error instanceof Error ? error.message : texts.connection.error);
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  function reload() {
    setLoading(true);
    setError('');
    setAttempt(current => current + 1);
  }

  return { cart, loading, error, actionError, busy, earned, checkoutStatus, checkout,
    changeQuantity, addProduct, removeProduct, reload };
}
