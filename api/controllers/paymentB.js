const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "shy9329v2qps5fpr",
  publicKey: "q824rwgz24dzqq3n",
  privateKey: "36fcb0d1cf2ed83ba8eeeced1f06fe64",
});

exports.getToken = (req, res) => {
  gateway.clientToken.generate({}, function (err, response) {
    // pass clientToken to your front-end
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(response);
    }
  });
};

exports.processPayment = (req, res) => {
  let nonceFromTheClient = req.body.paymentMethodNonce;

  let amountFromTheClient = req.body.amount;
  gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: {
        submitForSettlement: true,
      },
    },
    (err, result) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json(result);
      }
    }
  );
};
