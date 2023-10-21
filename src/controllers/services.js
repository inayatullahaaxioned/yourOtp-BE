const { default: axios, all } = require("axios");
const joi = require("joi");
const mongoose = require("mongoose");

exports.getServers = async (req, res) => {
  try {
    const servers = await mongoose.model("server").find();
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

exports.getNumbers = async (req, res) => {
  try {
    const { serverId } = req.query;

    const existingServer = await mongoose.model("server").findOne({
      id: serverId,
    });
    if (!existingServer) {
      return res.status(400).send({
        error: 'Server not found.',
      });
    }

    const options = {
      method: 'get',
      url: `https://fastsms.su/stubs/handler_api.php?api_key=${process.env.API_KEY1}&action=getPrices&country=22`,
    };

    const priceResponse = await axios(options);

    const options2 = {
      method: 'get',
      url: `https://fastsms.su/stubs/handler_api.php?api_key=${process.env.API_KEY1}&action=getServices`,
    };

    const serviceNameRes = await axios(options2);

    const serviceList = [];

    const allServiceNames = serviceNameRes.data;
    const prices = priceResponse.data['22'];

    for (const key in allServiceNames) {
      const service = allServiceNames[key];

      const profitPercentage = process.env.PROFIT;
      const price = prices.hasOwnProperty(key) ? Number(Object.keys(prices[key])[0] * profitPercentage).toPrecision(2) : 0;
      serviceList.push({
        service: key,
        name: service,
        price,
      })
    }

    const allList = serviceList.filter(e => e.price > 0);
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
      service: joi.string().max(5).required().error(new Error("Please enter valid service.")),
      serverId: joi.number().required(),
    });
    
    const result = await schema.validate(req.body);

    if (result.error) {
      return res.status(400).send({
        error: result.error.message,
      });
    }

    const validServer = await mongoose.model("server").findOne({ id: serverId });
    if (!validServer) {
      return res.status(400).send({
        error: 'Please enter valid serviceId.',
      });
    }

    const amount = await mongoose.model("price")
      .findOne({
        service
      })
      .select({ amount: 1 });

      await mongoose.model("users").updateOne(
        { _id: req.user._id },
        { $inc : { balance: 50 } },
    )
    
    const balanceOfUser = await mongoose.model("users")
      .findById(req.user._id)
      .select({ balance: 1 });
    
    if (balanceOfUser < amount) {
      return res.status(400).send({
        error: "Insufficient balance.",
      });
    }

    const options = {
      method: 'get',
      url: `https://fastsms.su/stubs/handler_api.php?api_key=${process.env.API_KEY1}&action=getNumber&service=${service}&country=22`
    };

    const response = await axios(options);
    let number, activationId;
    if (response.data) {
      number = res.data.split(":")[2];
      activationId = res.data.split(":")[1];

      await mongoose.model("users").updateOne(
        { _id: req.user._id },
        { $inc : { balance: -amount } },
      )
    }
    return res.status(200).send({
      number,
      activationId,
    })
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: 'Internal Server Error',
    });
  }
};
