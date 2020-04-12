/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

//use public key to create object of Stripe
const stripe = Stripe('pk_test_4Mh3eXm5GTKRf85zJrzvYJHQ00B61mP8lV');

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios({
      // method: 'GET',
      // Default method is GET
      url: `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`
    });

    console.log(session);

    // 2) Use stripe object to create checkout form + charge credit cards
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
