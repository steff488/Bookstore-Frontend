import { Routes } from '@angular/router';
import { BookList } from './pages/book-list/book-list';
import { BookDetails } from './pages/book-details/book-details';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Favorites } from './pages/favorites/favorites';
import { MyAccount } from './pages/my-account/my-account';
import { MyOrders } from './pages/my-orders/my-orders';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', component: BookList },
  { path: 'books/:id', component: BookDetails },
  { path: 'cart', component: Cart },
  { path: 'checkout', component: Checkout },
  { path: 'favorites', component: Favorites },
  { path: 'my-account', component: MyAccount },
  { path: 'my-orders', component: MyOrders },
  { path: 'settings', component: Settings },
];
