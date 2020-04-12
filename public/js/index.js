/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettingss';
import { bookTour } from './stripe';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

//VALUES

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  $(document).on('submit', '.form', e => {
    const email = $('#email').val();
    const password = $('#password').val();
    e.preventDefault();
    login(email, password);
  });
}

if (logOutBtn) {
  $(document).on('click', '#logout', () => {
    logout();
  });
}

if (userDataForm) {
  $(document).on('click', '#saveSettings', e => {
    e.preventDefault();
    const form = new FormData();

    //creating multipart form data

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    // const name = $('#name').val();
    // const email = $('#email').val();
    updateSettings(form, 'data');
  });
}

if (userPasswordForm) {
  $(document).on('click', '#savePassword', async e => {
    e.preventDefault();
    $('#savePassword').text('UPDATING...');
    const oldPassword = $('#password-current').val();
    const newPassword = $('#password').val();
    const passwordConfirm = $('#password-confirm').val();
    await updateSettings(
      { oldPassword, newPassword, passwordConfirm },
      'password'
    );
    $('#password-current').val('');
    $('#password').val('');
    $('#password-confirm').val('');
    $('#savePassword').text('SAVE PASSWORD');
  });
}

if (bookBtn) {
  $(document).on('click', '#book-tour', e => {
    $('#book-tour').text('PROCESSING...');
    const tourId = $('#book-tour').data('tour-id');
    console.log(tourId);
    bookTour(tourId);
  });
}
