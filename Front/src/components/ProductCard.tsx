import type { Product } from '../types/shop';
import texts from '../content/texts.json';
import { formatCategory, formatPrice } from '../lib/format';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { ProductImage } from './ui/ProductImage';

export function ProductCard({ product, quantity, disabled, onAdd }: {
  product: Product;
  quantity: number;
  disabled: boolean;
  onAdd: () => void;
}) {
  const category = formatCategory(product.category);
  const available = product.stock > quantity;
  return (
    <article className="product-card h-100 d-flex flex-column">
      <ProductImage src={product.image} name={product.name} />
      <div className="product-details d-flex flex-column flex-grow-1">
        <span className="product-category">{category}</span>
        <h3>{product.name}</h3>
        <strong className="product-price">{formatPrice(product.price)}</strong>
        <p className="product-stock">{texts.catalog.stock}: {product.stock}</p>
        <Button className="punto-button--primary w-100 mt-auto" onClick={onAdd} disabled={disabled || !available} title={!available && product.stock > 0 ? texts.catalog.selectionComplete : undefined}>
          {product.stock === 0 ? texts.catalog.soldOut : texts.catalog.add}<Icon name="arrow" />
        </Button>
      </div>
    </article>
  );
}
