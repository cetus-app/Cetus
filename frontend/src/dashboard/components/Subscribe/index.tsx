import { loadStripe } from "@stripe/stripe-js";
import React, {
  Fragment, FunctionComponent, useEffect, useState
} from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";

import "../../assets/scss/Subscribe.scss";
import { createSession, getGroup } from "../../api";
import { FullGroup, IntegrationInfo, IntegrationType } from "../../api/types";
import Integrations from "./Integrations";

if (!process.env.STRIPE_PK) throw new Error("Missing Stripe public key");

const stripePromise = loadStripe(process.env.STRIPE_PK);

const Subscribe: FunctionComponent = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { push } = useHistory();
  const { search } = useLocation();

  const [loading, setLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [error, setError] = useState("");
  const [group, setGroup] = useState<FullGroup>();
  const [discountCode, setDiscountCode] = useState<string>("");
  const [cart, setCart] = useState<Map<IntegrationType, IntegrationInfo>>(new Map());

  const query = new URLSearchParams(search);

  useEffect(() => {
    if (query.get("success") === "false") setError("Payment process was cancelled");

    const get = async () => {
      setLoading(true);

      const res = await getGroup(groupId);
      // TODO: update this
      if (res.stripeSubscriptionId) push(`/groups/${groupId}`);
      else setGroup(res);

      setLoading(false);
    };

    get();
  }, []);
  const toggleItem = (type: IntegrationType, info: IntegrationInfo) => {
    if (!cart.has(type)) {
      setCart(prev => {
        const newCart = new Map(prev);
        newCart.set(type, info);
        return newCart;
      });
    } else {
      setCart(prev => {
        const newCart = new Map(prev);
        newCart.delete(type);
        return newCart;
      });
    }
  };

  const handleCheckout = async () => {
    setStripeLoading(true);

    try {
      const { sessionId } = await createSession({
        groupId,
        integrations: Array.from(cart.keys()),
        discountCode: discountCode || undefined
      });

      const stripe = await stripePromise;
      const { error: stripeError } = await stripe?.redirectToCheckout({ sessionId }) || {};
      throw stripeError;
    } catch (e) {
      // In case it fails due to not JSON
      setError("Error occurred. Contact support if the issue persists");
      const json = await e.response.json();
      setError(json.message || "Error occurred. Contact support if the issue persists");
    }

    setStripeLoading(false);
  };

  if (loading || !group) return <p className="has-text-centered">Loading..</p>;

  const total = 3 + Array.from(cart.values()).reduce<number>((accumulator, b) => accumulator + b.cost, 0);

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Subscribing for {group.robloxInfo.name}</h1>
        <h4 className="subtitle">Select the integrations you would like to use in your group. You can enable and disable these any time in your group dashboard after subscribing.</h4>

        <div className="columns">
          <div className="column is-7 is-6-desktop is-5-widescreen">
            <Integrations isEnabled={type => cart.has(type)} onIntegrationToggle={toggleItem} />
          </div>

          <div className="column is-5 is-4-desktop is-offset-2-desktop is-offset-3-widescreen">
            <div className="box content">
              <h5>Your cart</h5>

              <p>
                Group with API access<span className="is-pulled-right">£3/month</span>

                {Array.from(cart.entries()).map(([type, info]) => (
                  <Fragment key={type}>
                    <br />
                    {info.name} <span className="is-pulled-right">£{info.cost}/month</span>
                  </Fragment>
                ))}
              </p>

              <hr />

              <strong>
                Total<span className="is-pulled-right">£{total}/month</span>
              </strong>
            </div>

            <p>Access to one group (which includes API access and our Lua SDK) is always part of your subscription</p>
          </div>
        </div>
        <div className="columns is-centered">
          <div className="column is-3">
            <div className="has-text-centered">
              <div className="field username-field">
                <label className="label"><i className="fas fa-tags" /> Discount code (optional)</label>

                <div className="control">
                  <input type="text" className="input" value={discountCode} onChange={e => setDiscountCode(e.target.value)} />
                </div>
              </div>
              <button type="submit" className={`button is-primary checkout-button${stripeLoading ? " is-loading" : ""}`} disabled={stripeLoading} onClick={handleCheckout}>Continue to checkout</button>
            </div>
          </div>
        </div>
        {error && <p className="has-text-centered has-text-danger">{error}</p>}
      </div>
    </section>
  );
};

export default Subscribe;
