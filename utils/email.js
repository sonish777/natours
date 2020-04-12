const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Sonish Maharjan <${process.env.EMAIL_FROM}>`;
    this.url = url;
    this.firstName = user.name.split(' ');
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      console.log(process.env.EMAIL_FROM);
      console.log('IN PRODUCTION');
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
      //ACTIVE "less secure app" option in gmail
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    // 2) Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family !');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (vaild for only 10 minutes)'
    );
  }
};

// const sendEmail = async options => {
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,

//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//     //ACTIVE "less secure app" option in gmail
//   });

//   // 2) Define the email options
//   const mailOptions = {
//     from: 'Sonish Maharjan <demo@demo.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message
//     // html: true
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

// // module.exports = sendEmail;
