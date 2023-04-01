const sgMail = require('@sendgrid/mail');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = (to,name, oneTimeCode) => {
  const msg = {
    to,
    from: 'thinkfunmail@gmail.com',
    subject: 'Reset Your Think Fun Password - Your One-Time Code Inside',
    html: `<!DOCTYPE html>
    <html>
    <head>
      <title>Think Fun - Forgot Your Password?</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="background-color: #7fc8f8; font-family: sans-serif; ">
      <div style=" background-color: #ffe45e; padding: 20px; text-align: center; border-radius: 12px; border: #ff6392 3px solid;">
        <h1 style="color: #4f92c5; margin: 0;">Think Fun</h1>
        <p style="color: #4f92c5; margin: 0;">Thinking Games for Everyone</p>
      </div>
      <div style="text-align:center; margin: 24px 0;">
          <div style=" padding: 20px; display:inline-block; background-color: #ffe45e;border-radius: 12px;
        border: #ff6392 3px solid; ">
        <h2 style="color: #4f92c5;">Uh-oh, did you forget your password?</h2>
        <p>Hey ${name}!</p>
        <p>No worries, we've got you covered. Here's your one-time code to reset your password: </p>
        <h3 style="color: #4f92c5;">${oneTimeCode}</h3>
        <p>Just head to our website, click on the "Forgot Password" link, and enter this code when prompted.</p>
        <p>And don't worry, we won't tell anyone that you forgot your password. It's our little secret.</p>
        <p>Thanks for playing on Think Fun!</p>
        <p>Best regards,</p>
        <p>The Think Fun Team</p>
      </div>
      </div>
      <div style="background-color: #ffe45e; padding: 20px; text-align: center; border-radius: 12px;
        border: #ff6392 3px solid;">
        <p style="color: #4f92c5; margin: 0;">If you didn't request this password reset, please contact us immediately.</p>
      </div>
    </body>
    </html>
    `,
  };

  sgMail.send(msg);
};
