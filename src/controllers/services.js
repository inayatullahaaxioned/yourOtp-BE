const { default: axios } = require('axios');
const joi = require('joi');
const mongoose = require('mongoose');

exports.getServers = async (req, res) => {
  try {
    const servers = await mongoose.model('server').find();
    return res.status(200).send({
      servers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal Server Error',
    });
  }
};

exports.getServiceList = async (req, res) => {
  try {
    const { serverId } = req.params;

    const existingServer = await mongoose.model('server').findOne({
      id: serverId,
    });
    if (!existingServer) {
      return res.status(400).send({
        error: 'Server not found.',
      });
    }

    const options = {
      method: 'get',
      url: `https://fastsms.su/stubs/handler_api.php?api_key=${process.env.FASTSMS_API_KEY}&action=getPrices&country=22`,
    };

    const priceResponse = await axios(options);

    const options2 = {
      method: 'get',
      url: `https://fastsms.su/stubs/handler_api.php?api_key=${process.env.FASTSMS_API_KEY}&action=getServices`,
    };

    const serviceNameRes = await axios(options2);

    const serviceList = [];

    const allServiceNames = serviceNameRes.data;
    const prices = priceResponse.data['22'];

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in allServiceNames) {
      const service = allServiceNames[key];

      const profitPercentage = process.env.PROFIT;
      // eslint-disable-next-line no-prototype-builtins
      const price = prices.hasOwnProperty(key)
        ? Number(Object.keys(prices[key])[0] * profitPercentage).toPrecision(2) : 0;
      serviceList.push({
        service: key,
        name: service,
        price,
      });
    }

    const allList = serviceList.filter((e) => e.price > 0);
    return res.status(200).send({
      services: allList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal Server Error',
    });
  }
};

exports.buyNumbers = async (req, res) => {
  try {
    const { service, serverId } = req.body;

    const schema = joi.object({
      service: joi.string().max(5).required().error(new Error('Please enter valid service.')),
      serverId: joi.number().required(),
    });

    const result = await schema.validate(req.body);

    if (result.error) {
      return res.status(400).send({
        error: result.error.message,
      });
    }

    const validServer = await mongoose.model('server').findOne({ id: serverId });
    if (!validServer) {
      return res.status(400).send({
        error: 'Please enter valid serviceId.',
      });
    }

    const amount = await mongoose.model('price')
      .findOne({
        service,
      })
      .select({ _id: 0, price: 1 });

    const balanceOfUser = await mongoose.model('user')
      .findById(req.user._id)
      .select({ _id: 0, balance: 1 });

    const { balance } = balanceOfUser;
    const price = amount.price * process.env.PROFIT;
    console.log(balanceOfUser, amount);
    if (balance < price) {
      return res.status(400).send({
        error: 'Insufficient balance.',
      });
    }

    const options = {
      method: 'get',
      url: `https://fastsms.su/stubs/handler_api.php?api_key=${process.env.FASTSMS_API_KEY}&action=getNumber&service=${service}&country=22`,
    };

    const response = await axios(options);
    let number; let
      activationId;
    const { data } = response;
    if (data) {
      [, number, activationId] = data.split(':');

      await mongoose.model('user').updateOne(
        { _id: req.user._id },
        { $inc: { balance: -amount.price } },
      );
    }
    return res.status(200).send({
      number,
      activationId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal Server Error',
    });
  }
};

exports.cancelNumber = async (req, res) => {
  try {
    const { service, activationId } = req.params;
    if (activationId) {
      return res.status(400).send({
        error: 'Please provide activation id.',
      });
    }

    const options = {
      method: 'get',
      url: `https://fastsms.su/stubs/handler_api.php?api_key={api_key}&action=setStatus&id=${activationId}&status=8`,
    };
    const response = await axios(options);
    if (response.status === 200) {
      const amount = await mongoose.model('price')
        .findOne({ service })
        .select({ _id: 0, price: 1 });

      const price = amount.price * process.env.PROFIT;

      await mongoose.model('user').updateOne(
        { _id: req.user._id },
        { $inc: { balance: price } },
      );
    }
    return res.status(200).send({
      message: 'Number Cancelled Successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal Server Error',
    });
  }
};

exports.anotherSms = async (req, res) => {
  try {
    const { activationId } = req.params;
    if (activationId) {
      return res.status(400).send({
        error: 'Please provide activation id.',
      });
    }

    const options = {
      method: 'get',
      url: `https://fastsms.su/stubs/handler_api.php?api_key={api_key}&action=setStatus&id=${activationId}&status=3`,
    };
    await axios(options);
    return res.status(200).send({
      message: 'Request sent successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal Server Error',
    });
  }
};

exports.fetchOtp = async (req, res) => {
  try {
    const { activationId } = req.params;
    if (activationId) {
      return res.status(400).send({
        error: 'Please provide activation id.',
      });
    }

    const options = {
      method: 'get',
      url: `https://fastsms.su/stubs/handler_api.php?api_key=${process.env.FASTSMS_API_KEY}&action=getStatus&id=${activationId}`,
    };
    const response = await axios(options);

    if (response.statusText === 'STATUS_WAIT_CODE') {
      res.status(200).send({
        message: 'Waiting for Otp',
      });
    }

    if (response.statusText === 'STATUS_CANCEL ') {
      res.status(400).send({
        message: 'Number Cancelled',
      });
    }

    let otp = 0;
    if (response.statusText === 'STATUS_OK:CODE') {
      otp = response.data.otp;
    }

    return res.status(200).send({
      Success: true,
      otp,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal Server Error',
    });
  }
};
