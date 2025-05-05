
import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import { AiFillWarning } from "react-icons/ai";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [loading, setLoading] = useState(false);
  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
  const navigate = useNavigate();

  // Calculate total price
  const totalPrice = () => {
    try {
      let total = 0;
      cart?.forEach((item) => {
        total = total + item.price;
      });
      return total.toFixed(2); // Return the total price as a string with 2 decimal places
    } catch (error) {
      console.log(error);
      return "0.00";
    }
  };

  // Remove item from cart
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem("cart", JSON.stringify(myCart));
    } catch (error) {
      console.log(error);
    }
  };

  // Load PayPal SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=AfekG1i2okRM3Xjb6q73dhx-y3sDueDRL7Jyv0NkFr09BDLGexBltKwJJO0MgLcI0zTxW50EzJtJ4PSF&currency=USD";
    script.async = true;
    script.onload = () => setIsPayPalLoaded(true);
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle PayPal payment
  const handlePayment = () => {
    if (isPayPalLoaded) {
      window.paypal
        .Buttons({
          createOrder: function (data, actions) {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: totalPrice(), // Use the total price from the cart
                    currency_code: "USD", // Set the currency to USD
                  },
                },
              ],
            });
          },
          onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
              // Handle successful payment
              toast.success("Payment Completed Successfully");
              localStorage.removeItem("cart");
              setCart([]);
              navigate("/dashboard/user/orders");
            });
          },
          onError: function (err) {
            // Handle payment error
            toast.error("Payment Failed. Please try again.");
            console.error(err);
          },
        })
        .render("#paypal-button-container"); // Render the PayPal button
    } else {
      toast.error("PayPal SDK is still loading. Please try again.");
    }
  };
  // Handle without paypal payment 
  const handleWithoutPaypalPayment = async (e) => {
    try {
      localStorage.removeItem("cart");
      setCart([]);
      e.preventDefault();
      try {
        const orderData = new FormData();
        orderData.append("product", cart[0]._id);
        orderData.append("payment", cart[0].price);
        orderData.append("user", auth?.user?._id);
        const { data } = axios.post(
          "/api/v1/product/card-payment",
          orderData
        );
        if (data?.success) {
          toast.error(data?.message);
        } else {
          toast.success("order placed Successfully");
        }
      } catch (error) {
        console.log(error);
        toast.error("something went wrong");
      }
    }
    catch (err) {
      toast.error("Payment Failed. Please try again.");
      console.error(err);
    }
    navigate("/dashboard/user/orders");
  };

  return (
    <Layout>
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!auth?.user
                ? "Hello Guest"
                : `Hello  ${auth?.token && auth?.user?.name}`}
              <p className="text-center">
                {cart?.length
                  ? `You Have ${cart.length} items in your cart ${
                      auth?.token ? "" : "please login to checkout !"
                    }`
                  : " Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-7 p-0 m-0">
              {cart?.map((p) => (
                <div className="row card flex-row" key={p._id}>
                  <div className="col-md-4">
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                      width="100%"
                      height={"130px"}
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p.name}</p>
                    <p>{p.description.substring(0, 30)}</p>
                    <p>Price : {p.price}</p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-5 cart-summary">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />
              <h4>Total : Rs-{totalPrice()}</h4>
              {auth?.user?.address ? (
                <>
                  <div className="mb-3">
                    <h4>Current Address</h4>
                    <h5>{auth?.user?.address}</h5>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        navigate("/login", {
                          state: "/cart",
                        })
                      }
                    >
                      Please Login to checkout
                    </button>
                  )}
                </div>
              )}
              <div className="mt-2">
                {!auth?.token || !cart?.length ? (
                  ""
                ) : (
                  <>
                    <div id="paypal-button-container"></div>
                    <button
                      className="btn btn-primary"
                      onClick={handlePayment}
                      disabled={loading || !auth?.user?.address}
                    >
                      {loading ? "Processing ...." : "Make Payment"}
                    </button>
                    <button
                      className="block my-4 btn btn-primary "
                      onClick={handleWithoutPaypalPayment}
                      disabled={loading || !auth?.user?.address}
                    >
                      {loading ? "Processing ...." : "Pay via wallet"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;