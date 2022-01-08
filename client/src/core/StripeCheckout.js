import React, { useState, useEffect } from "react";
import { isAuthenticated } from "../auth/helper";
import { cartEmpty, loadCart } from "./helper/CartHelper";
import { Link } from "react-router-dom";
import StripeCheckoutButton from "react-stripe-checkout";
import { API } from "../backend";
import { createOrder } from "./helper/OrderHelper";

const StripeCheckout = ({
  products,
  setReload = (f) => f,
  reload = undefined,
}) => {
  const [data, setData] = useState({
    loading: false,
    success: false,
    error: "",
    address: "",
  });

  const token = isAuthenticated() && isAuthenticated().token;
  const userId = isAuthenticated() && isAuthenticated().user._id;

  const getFinalAmount = () => {
    let amount = 0;
    products.map((p) => {
      amount = amount + p.price;
    });
    return amount;
  };

  const makePayment = (token) => {
    const body = {
      token,
      products,
    };
    const headers = {
      "Content-Type": "application/json",
    };
    return fetch(`${API}/stripepayment`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
      .then((response) => {
        console.log(response);
        //call further methods here
        const { status } = response;
        console.log("STATUS", status);
      })
      .catch((error) => console.log(error));
  };

  const showStripeButton = () => {
    return isAuthenticated() ? (
      <StripeCheckoutButton
        stripeKey="pk_test_51JkYLLSIySW9WGfsksB3rpkvnQNNekeNvdM0NQqTr6aCB1JyGa7DupfhGjxP52aQk8omTu7jY9iPpCgNC5UHdIrE00hISnAsSj"
        token={makePayment}
        amount={getFinalAmount() * 100}
        name="Buy Product"
        shippingAddress
        billingAddress
      >
        <button className="btn btn-success rounded">Pay with Stripe</button>
      </StripeCheckoutButton>
    ) : (
      <Link to="/signin">
        <button className="btn btn-warning rounded">Signin</button>
      </Link>
    );
  };

  return (
    <div>
      <h3 className="text-white">Pay with Stripe: {getFinalAmount()}</h3>
      {showStripeButton()}
    </div>
  );
};

export default StripeCheckout;
