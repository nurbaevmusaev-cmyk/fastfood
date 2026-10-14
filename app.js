const cart = new Map();
const cartDialog = document.querySelector(".cart-dialog");
const cartCount = document.querySelector(".cart-count");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartTotal = document.querySelector(".cart-total strong");
const checkoutButton = document.querySelector(".checkout-button");
const toast = document.querySelector(".cart-toast");
let toastTimeout;

function formatPrice(price) {
  return `${new Intl.NumberFormat("ru-RU").format(price)} ₽`;
}

function renderCart() {
  const entries = Array.from(cart.values());
  const itemCount = entries.reduce((sum, item) => sum + item.quantity, 0);
  const total = entries.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = String(itemCount);
  cartItems.replaceChildren();
  cartEmpty.hidden = entries.length > 0;
  checkoutButton.disabled = entries.length === 0;
  cartTotal.textContent = formatPrice(total);

  for (const item of entries) {
    const row = document.createElement("div");
    row.className = "cart-item";

    const name = document.createElement("strong");
    name.textContent = item.name;

    const price = document.createElement("span");
    price.className = "cart-item__price";
    price.textContent = formatPrice(item.price * item.quantity);

    const controls = document.createElement("div");
    controls.className = "cart-item__controls";

    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", `Уменьшить количество: ${item.name}`);
    decrease.addEventListener("click", () => changeQuantity(item.name, -1));

    const quantity = document.createElement("span");
    quantity.textContent = String(item.quantity);

    const increase = document.createElement("button");
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Увеличить количество: ${item.name}`);
    increase.addEventListener("click", () => changeQuantity(item.name, 1));

    controls.append(decrease, quantity, increase);
    row.append(name, price, controls);
    cartItems.append(row);
  }
}

function changeQuantity(name, change) {
  const item = cart.get(name);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) cart.delete(name);
  renderCart();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const { name, price } = button.dataset;
    if (!name || !price) return;

    const item = cart.get(name);
    if (item) item.quantity += 1;
    else cart.set(name, { name, price: Number(price), quantity: 1 });

    renderCart();
    showToast(`${name} добавлен в корзину`);
  });
});

document.querySelector(".cart-button").addEventListener("click", () => cartDialog.showModal());
document.querySelector(".cart-close").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) cartDialog.close();
});

document.querySelectorAll(".category").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    if (!category) return;

    document.querySelectorAll(".category").forEach((categoryButton) => {
      const isActive = categoryButton === button;
      categoryButton.classList.toggle("is-active", isActive);
      categoryButton.setAttribute("aria-pressed", String(isActive));
    });

    document.querySelectorAll(".product-card").forEach((product) => {
      product.hidden = category !== "all" && product.dataset.category !== category;
    });
  });
});

checkoutButton.addEventListener("click", () => {
  showToast("Для приёма заказов укажите контакты вашего кафе");
  cartDialog.close();
});

renderCart();
