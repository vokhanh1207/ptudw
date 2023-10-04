"use strict";

async function addCart(id, quantity) {
  let res = await fetch("/products/cart", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ id, quantity }),
  });

  let json = await res.json();
  document.getElementById("cart-quantity").innerHTML = json.quantity;
}

async function updateCart(id, quantity) {
    if(quantity === 0) {
        removeCart(id);
        return;
    }
  let res = await fetch("/products/cart", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ id, quantity }),
  });

  if (res.status == 200) {
    let json = await res.json();
    let id = json.item.product.id;
    let itemTotal = json.item.total;
    console.log(json);
    document.getElementById("cart-quantity").innerHTML = json.quantity;
    document.getElementById("total-" + id).innerHTML = itemTotal;
    document.getElementById("subtotal").innerHTML = json.subtotal;
    document.getElementById("total").innerHTML = json.total;
  }
}

async function removeCart(id) {
  if (confirm("Do you want to remove this product?") == false) return;
  let res = await fetch("/products/cart", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (res.status == 200) {
    let json = await res.json();
    console.log(json);
    if (json.quantity == 0) {
      location.href = "/products/cart";
      return;
    }
    document.getElementById("cart-quantity").innerHTML = json.quantity;
    document.getElementById("subtotal").innerHTML = json.subtotal;
    document.getElementById("total").innerHTML = json.total;
    document.getElementById("product-" + id).remove();
  }
}

async function clearCart(id) {
    if (confirm("Do you want to clear the cart?") == false) return;
    let res = await fetch("/products/cart/all", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(),
    });
  
    if (res.status == 200) {
        location.href = "/products/cart";
    }
}

function placeorders(e) {
  e.preventDefault();

  const addressId = document.querySelector('input[name="addressId"]:checked');
  if (!addressId || addressId.value == 0) {
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
  }

  e.target.submit();
}